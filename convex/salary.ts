import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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
        relatedId: args.id,
      });
    }
  },
});

export const cancel = mutation({
  args: { id: v.id("salaryRecords") },
  handler: async (ctx, args) => {
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
    return await ctx.db
      .query("salaryRecords")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .collect();
  },
});

export const listByMonth = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
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
    return await ctx.db.get(args.id);
  },
});
