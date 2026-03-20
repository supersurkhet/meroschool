import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireRole } from "./helpers";

// ─── Subjects ─────────────────────────────────────────────────────

export const createSubject = mutation({
  args: {
    classId: v.id("classes"),
    name: v.string(),
    code: v.optional(v.string()),
    teacherId: v.optional(v.id("teachers")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin", "teacher");
    if (!args.name.trim()) throw new Error("Subject name cannot be empty");
    return await ctx.db.insert("subjects", args);
  },
});

export const listSubjectsByClass = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("subjects")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .collect();
  },
});

export const listSubjectsByTeacher = query({
  args: { teacherId: v.id("teachers") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("subjects")
      .withIndex("by_teacher", (q) => q.eq("teacherId", args.teacherId))
      .collect();
  },
});

export const updateSubject = mutation({
  args: {
    id: v.id("subjects"),
    name: v.optional(v.string()),
    code: v.optional(v.string()),
    teacherId: v.optional(v.id("teachers")),
  },
  handler: async (ctx, { id, ...fields }) => {
    await requireRole(ctx, "admin", "teacher");
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(id, patch);
  },
});

// ─── Modules ──────────────────────────────────────────────────────

export const createModule = mutation({
  args: {
    subjectId: v.id("subjects"),
    name: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin", "teacher");
    if (!args.name.trim()) throw new Error("Module name cannot be empty");
    if (args.order < 0) throw new Error("Order must be >= 0");
    return await ctx.db.insert("modules", args);
  },
});

export const listModulesBySubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("modules")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .collect();
  },
});

export const updateModule = mutation({
  args: {
    id: v.id("modules"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await requireRole(ctx, "admin", "teacher");
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(id, patch);
  },
});

// ─── Topics ───────────────────────────────────────────────────────

export const createTopic = mutation({
  args: {
    moduleId: v.id("modules"),
    name: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin", "teacher");
    if (!args.name.trim()) throw new Error("Topic name cannot be empty");
    if (args.order < 0) throw new Error("Order must be >= 0");
    return await ctx.db.insert("topics", args);
  },
});

export const listTopicsByModule = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("topics")
      .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
      .collect();
  },
});

export const updateTopic = mutation({
  args: {
    id: v.id("topics"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await requireRole(ctx, "admin", "teacher");
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(id, patch);
  },
});

// ─── Hierarchy: Class → Subject → Module → Topic → Materials ─────

export const getSubjectHierarchy = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const subject = await ctx.db.get(args.subjectId);
    if (!subject) return null;

    const modules = await ctx.db
      .query("modules")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .collect();

    const modulesWithTopics = await Promise.all(
      modules.map(async (mod) => {
        const topics = await ctx.db
          .query("topics")
          .withIndex("by_module", (q) => q.eq("moduleId", mod._id))
          .collect();

        const topicsWithMaterials = await Promise.all(
          topics.map(async (topic) => {
            const materials = await ctx.db
              .query("materials")
              .withIndex("by_topic", (q) => q.eq("topicId", topic._id))
              .collect();
            return { ...topic, materials };
          })
        );

        return { ...mod, topics: topicsWithMaterials };
      })
    );

    return { ...subject, modules: modulesWithTopics };
  },
});
