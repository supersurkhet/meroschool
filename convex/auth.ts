import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireRole } from "./helpers";

// Get the current authenticated user
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

// Upsert user on login — creates or updates based on WorkOS identity.
// This is the only mutation that doesn't require an existing user record.
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
    // Verify caller is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Only allow upsert for the caller's own identity
    if (identity.subject !== args.workosUserId) {
      throw new Error("Cannot upsert another user's record");
    }

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

// Get users by role — admin only
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
    await requireRole(ctx, "admin");
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .take(100);
  },
});

// Deactivate user — admin only
export const deactivateUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin");
    await ctx.db.patch(args.userId, { isActive: false });
  },
});
