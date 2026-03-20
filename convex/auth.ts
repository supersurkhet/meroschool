import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";

// Get the current user from their WorkOS ID
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", identity.subject))
      .unique();

    return user;
  },
});

// Upsert user on login — creates or updates based on WorkOS identity
export const upsertUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    workosUserId: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("teacher"),
      v.literal("student"),
      v.literal("parent")
    ),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailFormat.test(args.email)) {
      throw new Error("Invalid email format");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_workos_id", (q) => q.eq("workosUserId", args.workosUserId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
        avatarUrl: args.avatarUrl,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      ...args,
      isActive: true,
    });
  },
});

// Get user by role for role-based routing
export const getUsersByRole = query({
  args: {
    role: v.union(
      v.literal("admin"),
      v.literal("teacher"),
      v.literal("student"),
      v.literal("parent")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .take(100);
  },
});

// Deactivate user
export const deactivateUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { isActive: false });
  },
});
