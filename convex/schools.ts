import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Schools ──────────────────────────────────────────────────────

export const create = mutation({
  args: {
    name: v.string(),
    address: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    logo: v.optional(v.id("_storage")),
    establishedYear: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneFormat = /^(98|97)\d{8}$/;
    if (args.email && !emailFormat.test(args.email)) {
      throw new Error("Invalid email format");
    }
    if (args.phone && !phoneFormat.test(args.phone)) {
      throw new Error("Invalid phone format. Expected Nepal mobile format (98|97)XXXXXXXX");
    }
    return await ctx.db.insert("schools", args);
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("schools").take(50);
  },
});

export const get = query({
  args: { id: v.id("schools") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const update = mutation({
  args: {
    id: v.id("schools"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    logo: v.optional(v.id("_storage")),
    establishedYear: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(id, patch);
  },
});

// ─── Classes ──────────────────────────────────────────────────────

export const createClass = mutation({
  args: {
    schoolId: v.id("schools"),
    name: v.string(),
    grade: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("classes", args);
  },
});

export const listClasses = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("classes")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .collect();
  },
});

// ─── Sections ─────────────────────────────────────────────────────

export const createSection = mutation({
  args: {
    classId: v.id("classes"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("sections", args);
  },
});

export const listSections = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sections")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .collect();
  },
});

// ─── Hierarchy: School → Classes → Sections → Students ───────────

export const getSchoolHierarchy = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    const school = await ctx.db.get(args.schoolId);
    if (!school) return null;

    const classes = await ctx.db
      .query("classes")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .collect();

    const classesWithSections = await Promise.all(
      classes.map(async (cls) => {
        const sections = await ctx.db
          .query("sections")
          .withIndex("by_class", (q) => q.eq("classId", cls._id))
          .collect();

        const sectionsWithStudents = await Promise.all(
          sections.map(async (sec) => {
            const students = await ctx.db
              .query("students")
              .withIndex("by_section", (q) => q.eq("sectionId", sec._id))
              .collect();
            return { ...sec, students };
          })
        );

        return { ...cls, sections: sectionsWithSections };
      })
    );

    return { ...school, classes: classesWithSections };
  },
});
