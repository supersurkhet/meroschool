import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const send = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("attendance"),
      v.literal("test_result"),
      v.literal("assignment"),
      v.literal("general"),
      v.literal("salary")
    ),
    relatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      ...args,
      isRead: false,
    });
  },
});

// Send to multiple users at once
export const sendBulk = mutation({
  args: {
    userIds: v.array(v.id("users")),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("attendance"),
      v.literal("test_result"),
      v.literal("assignment"),
      v.literal("general"),
      v.literal("salary")
    ),
    relatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const userId of args.userIds) {
      const id = await ctx.db.insert("notifications", {
        userId,
        title: args.title,
        message: args.message,
        type: args.type,
        isRead: false,
        relatedId: args.relatedId,
      });
      ids.push(id);
    }
    return ids;
  },
});

// Real-time subscription: unread notifications for a user
export const listUnread = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();
  },
});

// All notifications for a user (paginated by taking latest N)
export const listAll = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const markAllRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();

    for (const n of unread) {
      await ctx.db.patch(n._id, { isRead: true });
    }

    return unread.length;
  },
});

export const unreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();
    return unread.length;
  },
});
