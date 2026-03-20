import { QueryCtx, MutationCtx } from "./_generated/server";

export type Role = "admin" | "teacher" | "student" | "parent";

export interface AuthUser {
  _id: any;
  workosUserId: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  schoolId?: any;
}

// Get the authenticated user or throw. Use in all mutations/queries that require auth.
export async function requireAuth(ctx: QueryCtx | MutationCtx): Promise<AuthUser> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_workos_id", (q: any) => q.eq("workosUserId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found. Please complete registration.");
  }

  if (!user.isActive) {
    throw new Error("Account is deactivated");
  }

  return user as AuthUser;
}

// Require one of the specified roles
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  ...roles: Role[]
): Promise<AuthUser> {
  const user = await requireAuth(ctx);
  if (!roles.includes(user.role as Role)) {
    throw new Error(
      `Access denied. Required role: ${roles.join(" or ")}. Your role: ${user.role}`
    );
  }
  return user;
}

// Optional auth — returns user or null (for public queries)
export async function optionalAuth(ctx: QueryCtx | MutationCtx): Promise<AuthUser | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const user = await ctx.db
    .query("users")
    .withIndex("by_workos_id", (q: any) => q.eq("workosUserId", identity.subject))
    .unique();

  if (!user || !user.isActive) return null;
  return user as AuthUser;
}
