import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireRole } from "./helpers";

// Helper: send attendance_alert notification to student's parents
async function notifyParentsAbsent(
  ctx: any,
  studentId: any,
  date: string,
  attendanceId: string
) {
  const student = await ctx.db.get(studentId);
  if (!student?.parentIds) return;
  const user = await ctx.db.get(student.userId);
  const studentName = user?.name ?? "Your child";
  for (const parentId of student.parentIds) {
    const parent = await ctx.db.get(parentId);
    if (parent) {
      await ctx.db.insert("notifications", {
        userId: parent.userId,
        type: "attendance_alert",
        title: "Absence Alert",
        message: `${studentName} was marked absent on ${date}`,
        isRead: false,
        relatedId: attendanceId,
      });
    }
  }
}

// Mark single student attendance (QR check-in flow)
export const markSingle = mutation({
  args: {
    studentId: v.id("students"),
    sectionId: v.id("sections"),
    date: v.string(),
    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("late"),
      v.literal("excused")
    ),
    markedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin", "teacher");
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateFormat.test(args.date)) {
      throw new Error("Invalid date format. Expected YYYY-MM-DD");
    }

    // Check if already marked for that date
    const existing = await ctx.db
      .query("attendance")
      .withIndex("by_section_date", (q) =>
        q.eq("sectionId", args.sectionId).eq("date", args.date)
      )
      .filter((q) => q.eq(q.field("studentId"), args.studentId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        markedBy: args.markedBy,
      });
      if (args.status === "absent") {
        await notifyParentsAbsent(ctx, args.studentId, args.date, existing._id as string);
      }
      return existing._id;
    }

    const id = await ctx.db.insert("attendance", {
      studentId: args.studentId,
      sectionId: args.sectionId,
      date: args.date,
      status: args.status,
      markedBy: args.markedBy,
    });

    if (args.status === "absent") {
      await notifyParentsAbsent(ctx, args.studentId, args.date, id as string);
    }

    return id;
  },
});

// Bulk mark attendance for entire section
export const markBulk = mutation({
  args: {
    sectionId: v.id("sections"),
    date: v.string(),
    records: v.array(
      v.object({
        studentId: v.id("students"),
        status: v.union(
          v.literal("present"),
          v.literal("absent"),
          v.literal("late"),
          v.literal("excused")
        ),
      })
    ),
    markedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin", "teacher");
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateFormat.test(args.date)) {
      throw new Error("Invalid date format. Expected YYYY-MM-DD");
    }

    const ids = [];
    for (const record of args.records) {
      // Check for existing record and update if found
      const existing = await ctx.db
        .query("attendance")
        .withIndex("by_section_date", (q) =>
          q.eq("sectionId", args.sectionId).eq("date", args.date)
        )
        .filter((q) => q.eq(q.field("studentId"), record.studentId))
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, {
          status: record.status,
          markedBy: args.markedBy,
        });
        ids.push(existing._id);
      } else {
        const id = await ctx.db.insert("attendance", {
          studentId: record.studentId,
          sectionId: args.sectionId,
          date: args.date,
          status: record.status,
          markedBy: args.markedBy,
        });
        ids.push(id);
      }

      // Auto-notify parents if absent
      if (record.status === "absent") {
        const recId = ids[ids.length - 1];
        await notifyParentsAbsent(ctx, record.studentId, args.date, recId as string);
      }
    }
    return ids;
  },
});

// Get attendance for a section on a specific date
export const getBySectionDate = query({
  args: {
    sectionId: v.id("sections"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const records = await ctx.db
      .query("attendance")
      .withIndex("by_section_date", (q) =>
        q.eq("sectionId", args.sectionId).eq("date", args.date)
      )
      .collect();

    return Promise.all(
      records.map(async (r) => {
        const student = await ctx.db.get(r.studentId);
        const user = student ? await ctx.db.get(student.userId) : null;
        return { ...r, studentName: user?.name ?? "Unknown" };
      })
    );
  },
});

// Get student attendance for a date range
export const getStudentAttendance = query({
  args: {
    studentId: v.id("students"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateFormat.test(args.startDate) || !dateFormat.test(args.endDate)) {
      throw new Error("Invalid date format. Expected YYYY-MM-DD");
    }

    const records = await ctx.db
      .query("attendance")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .take(100);

    return records;
  },
});

// Daily aggregation: attendance summary for a section
export const dailySummary = query({
  args: {
    sectionId: v.id("sections"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const records = await ctx.db
      .query("attendance")
      .withIndex("by_section_date", (q) =>
        q.eq("sectionId", args.sectionId).eq("date", args.date)
      )
      .collect();

    const total = records.length;
    const present = records.filter((r) => r.status === "present").length;
    const absent = records.filter((r) => r.status === "absent").length;
    const late = records.filter((r) => r.status === "late").length;
    const excused = records.filter((r) => r.status === "excused").length;

    return {
      date: args.date,
      total,
      present,
      absent,
      late,
      excused,
      presentPercent: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  },
});

// Get all records for a student between two dates
export const getStudentAttendanceRange = query({
  args: {
    studentId: v.id("students"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("attendance")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();
  },
});

// Section attendance history for a given month — daily counts
export const getSectionAttendanceHistory = query({
  args: {
    sectionId: v.id("sections"),
    month: v.string(), // YYYY-MM
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const startDate = `${args.month}-01`;
    const endDate = `${args.month}-31`;

    const records = await ctx.db
      .query("attendance")
      .withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate)
        )
      )
      .collect();

    // Group by date
    const byDate: Record<string, { present: number; absent: number; late: number; excused: number }> = {};
    for (const r of records) {
      if (!byDate[r.date]) {
        byDate[r.date] = { present: 0, absent: 0, late: 0, excused: 0 };
      }
      if (r.status === "present") byDate[r.date].present++;
      else if (r.status === "absent") byDate[r.date].absent++;
      else if (r.status === "late") byDate[r.date].late++;
      else if (r.status === "excused") byDate[r.date].excused++;
    }

    return Object.entries(byDate)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },
});

// Monthly aggregation: attendance % per student
export const monthlyStudentSummary = query({
  args: {
    studentId: v.id("students"),
    month: v.string(), // YYYY-MM
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const startDate = `${args.month}-01`;
    const endDate = `${args.month}-31`;

    const records = await ctx.db
      .query("attendance")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate)
        )
      )
      .collect();

    const total = records.length;
    const present = records.filter(
      (r) => r.status === "present" || r.status === "late"
    ).length;

    return {
      month: args.month,
      totalDays: total,
      presentDays: present,
      absentDays: total - present,
      attendancePercent: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  },
});
