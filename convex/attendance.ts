import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
    const records = await ctx.db
      .query("attendance")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

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

// Monthly aggregation: attendance % per student
export const monthlyStudentSummary = query({
  args: {
    studentId: v.id("students"),
    month: v.string(), // YYYY-MM
  },
  handler: async (ctx, args) => {
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
