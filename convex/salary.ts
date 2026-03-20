import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireRole } from "./helpers";

export const create = mutation({
  args: {
    teacherId: v.id("teachers"),
    month: v.string(), // YYYY-MM
    baseSalary: v.number(),
    deductions: v.number(),
    bonuses: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");
    if (args.baseSalary < 0) {
      throw new Error("baseSalary must be >= 0");
    }

    const netSalary = args.baseSalary - args.deductions + args.bonuses;

    // Check for existing record this month
    const existing = await ctx.db
      .query("salaryRecords")
      .withIndex("by_teacher_month", (q) =>
        q.eq("teacherId", args.teacherId).eq("month", args.month)
      )
      .first();

    if (existing) {
      throw new Error(`Salary record already exists for ${args.month}`);
    }

    return await ctx.db.insert("salaryRecords", {
      ...args,
      netSalary,
      status: "pending",
    });
  },
});

export const markPaid = mutation({
  args: { id: v.id("salaryRecords") },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");
    const record = await ctx.db.get(args.id);
    if (!record) throw new Error("Salary record not found");

    await ctx.db.patch(args.id, {
      status: "paid",
      paidAt: Date.now(),
    });

    // Notify teacher
    const teacher = await ctx.db.get(record.teacherId);
    if (teacher) {
      await ctx.db.insert("notifications", {
        userId: teacher.userId,
        title: "Salary Paid",
        message: `Your salary for ${record.month} (NPR ${record.netSalary}) has been paid.`,
        type: "salary",
        isRead: false,
        relatedId: args.id as string,
      });
    }
  },
});

export const cancel = mutation({
  args: { id: v.id("salaryRecords") },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");
    await ctx.db.patch(args.id, { status: "cancelled" });
  },
});

export const update = mutation({
  args: {
    id: v.id("salaryRecords"),
    baseSalary: v.optional(v.number()),
    deductions: v.optional(v.number()),
    bonuses: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await requireRole(ctx, "admin");
    const record = await ctx.db.get(id);
    if (!record) throw new Error("Salary record not found");
    if (record.status === "paid") throw new Error("Cannot edit paid salary");

    const base = fields.baseSalary ?? record.baseSalary;
    const ded = fields.deductions ?? record.deductions;
    const bon = fields.bonuses ?? record.bonuses;

    const patch: Record<string, unknown> = { netSalary: base - ded + bon };
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(id, patch);
  },
});

export const listByTeacher = query({
  args: { teacherId: v.id("teachers") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("salaryRecords")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .take(50);
  },
});

export const listByMonth = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const records = await ctx.db
      .query("salaryRecords")
      .withIndex("by_month", (q) => q.eq("month", args.month))
      .collect();

    return Promise.all(
      records.map(async (r) => {
        const teacher = await ctx.db.get(r.teacherId);
        const user = teacher ? await ctx.db.get(teacher.userId) : null;
        return { ...r, teacherName: user?.name ?? "Unknown" };
      })
    );
  },
});

export const get = query({
  args: { id: v.id("salaryRecords") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db.get(args.id);
  },
});

// Salary report for a given month with teacher names and totals
export const getSalaryReport = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const records = await ctx.db
      .query("salaryRecords")
      .withIndex("by_month", (q) => q.eq("month", args.month))
      .collect();

    let totalBase = 0;
    let totalDeductions = 0;
    let totalBonuses = 0;
    let totalNet = 0;

    const recordsWithNames = await Promise.all(
      records.map(async (r) => {
        totalBase += r.baseSalary;
        totalDeductions += r.deductions;
        totalBonuses += r.bonuses;
        totalNet += r.netSalary;

        const teacher = await ctx.db.get(r.teacherId);
        const user = teacher ? await ctx.db.get(teacher.userId) : null;
        return { ...r, teacherName: user?.name ?? "Unknown" };
      })
    );

    return {
      month: args.month,
      records: recordsWithNames,
      totals: { totalBase, totalDeductions, totalBonuses, totalNet },
    };
  },
});

// Teacher salary history sorted by month descending
export const getTeacherSalaryHistory = query({
  args: { teacherId: v.id("teachers") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const records = await ctx.db
      .query("salaryRecords")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .collect();

    return records.sort((a, b) => b.month.localeCompare(a.month));
  },
});

// Bulk create salary records for all active teachers for a given month
export const bulkCreateSalary = mutation({
  args: {
    month: v.string(),
    baseSalary: v.number(),
    schoolId: v.id("schools"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");
    if (args.baseSalary < 0) {
      throw new Error("baseSalary must be >= 0");
    }

    const teachers = await ctx.db
      .query("teachers")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .collect();

    const ids = [];
    for (const teacher of teachers) {
      // Check teacher's user is active
      const user = await ctx.db.get(teacher.userId);
      if (!user?.isActive) continue;

      // Check no existing record for this month
      const existing = await ctx.db
        .query("salaryRecords")
        .withIndex("by_teacher_month", (q) =>
          q.eq("teacherId", teacher._id).eq("month", args.month)
        )
        .first();

      if (existing) continue;

      const id = await ctx.db.insert("salaryRecords", {
        teacherId: teacher._id,
        month: args.month,
        baseSalary: args.baseSalary,
        deductions: 0,
        bonuses: 0,
        netSalary: args.baseSalary,
        status: "pending",
      });
      ids.push(id);
    }
    return ids;
  },
});
