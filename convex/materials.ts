import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const upload = mutation({
  args: {
    topicId: v.id("topics"),
    title: v.string(),
    type: v.union(
      v.literal("pdf"),
      v.literal("video"),
      v.literal("link"),
      v.literal("document")
    ),
    fileId: v.optional(v.id("_storage")),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
    uploadedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("materials", args);
  },
});

export const listByTopic = query({
  args: { topicId: v.id("topics") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("materials")
      .withIndex("by_topic", (q) => q.eq("topicId", args.topicId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("materials") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const remove = mutation({
  args: { id: v.id("materials") },
  handler: async (ctx, args) => {
    const material = await ctx.db.get(args.id);
    if (material?.fileId) {
      await ctx.storage.delete(material.fileId);
    }
    await ctx.db.delete(args.id);
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = query({
  args: { fileId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.fileId);
  },
});

// Alias for getFileUrl — given a storageId, return download URL
export const getDownloadUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

// Reorder materials — accept array of {id, order} objects
export const reorderMaterials = mutation({
  args: {
    items: v.array(
      v.object({
        id: v.id("materials"),
        order: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      await ctx.db.patch(item.id, { order: item.order });
    }
  },
});

// Delete material and its storage file if present
export const deleteMaterial = mutation({
  args: { id: v.id("materials") },
  handler: async (ctx, args) => {
    const material = await ctx.db.get(args.id);
    if (material?.fileId) {
      await ctx.storage.delete(material.fileId);
    }
    await ctx.db.delete(args.id);
  },
});

// Get all materials for a module (across all topics)
export const listByModule = query({
  args: { moduleId: v.id("modules") },
  handler: async (ctx, args) => {
    const topics = await ctx.db
      .query("topics")
      .withIndex("by_module", (q) => q.eq("moduleId", args.moduleId))
      .collect();

    const allMaterials = await Promise.all(
      topics.map(async (topic) => {
        const materials = await ctx.db
          .query("materials")
          .withIndex("by_topic", (q) => q.eq("topicId", topic._id))
          .collect();
        return materials.map((m) => ({ ...m, topicName: topic.name }));
      })
    );

    return allMaterials.flat();
  },
});
