import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireRole } from "./helpers";

// ─── Students ─────────────────────────────────────────────────────

export const createStudent = mutation({
  args: {
    userId: v.id("users"),
    sectionId: v.id("sections"),
    rollNumber: v.string(),
    dateOfBirth: v.optional(v.string()),
    admissionDate: v.optional(v.string()),
    parentIds: v.optional(v.array(v.id("parents"))),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
    if (args.dateOfBirth && !dateFormat.test(args.dateOfBirth)) {
      throw new Error("Invalid date format for dateOfBirth. Expected YYYY-MM-DD");
    }
    if (args.admissionDate && !dateFormat.test(args.admissionDate)) {
      throw new Error("Invalid date format for admissionDate. Expected YYYY-MM-DD");
    }
    return await ctx.db.insert("students", args);
  },
});

export const getStudentByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("students")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const listStudentsBySection = query({
  args: { sectionId: v.id("sections") },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin", "teacher");
    const students = await ctx.db
      .query("students")
      .withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
      .collect();

    return Promise.all(
      students.map(async (s) => {
        const user = await ctx.db.get(s.userId);
        return { ...s, user };
      })
    );
  },
});

export const updateStudent = mutation({
  args: {
    id: v.id("students"),
    sectionId: v.optional(v.id("sections")),
    rollNumber: v.optional(v.string()),
    dateOfBirth: v.optional(v.string()),
    parentIds: v.optional(v.array(v.id("parents"))),
  },
  handler: async (ctx, { id, ...fields }) => {
    await requireRole(ctx, "admin");
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(id, patch);
  },
});

// ─── Teachers ─────────────────────────────────────────────────────

export const createTeacher = mutation({
  args: {
    userId: v.id("users"),
    schoolId: v.id("schools"),
    employeeId: v.string(),
    department: v.optional(v.string()),
    joinDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");
    return await ctx.db.insert("teachers", args);
  },
});

export const getTeacherByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("teachers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const listTeachersBySchool = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin", "teacher");
    const teachers = await ctx.db
      .query("teachers")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .collect();

    return Promise.all(
      teachers.map(async (t) => {
        const user = await ctx.db.get(t.userId);
        return { ...t, user };
      })
    );
  },
});

// ─── Parents ──────────────────────────────────────────────────────

export const createParent = mutation({
  args: {
    userId: v.id("users"),
    occupation: v.optional(v.string()),
    address: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");
    return await ctx.db.insert("parents", args);
  },
});

export const getParentByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("parents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();
  },
});

export const getParentChildren = query({
  args: { parentId: v.id("parents") },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin", "teacher", "parent");
    const allStudents = await ctx.db.query("students").take(500);
    const children = allStudents.filter((s) =>
      s.parentIds?.includes(args.parentId)
    );

    return Promise.all(
      children.map(async (s) => {
        const user = await ctx.db.get(s.userId);
        return { ...s, user };
      })
    );
  },
});
