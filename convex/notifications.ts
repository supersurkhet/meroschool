import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internalMutation } from "./_generated/server";
import { requireAuth, requireRole } from "./helpers";

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
    await requireRole(ctx, "admin", "teacher");
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
    await requireRole(ctx, "admin", "teacher");
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
    await requireAuth(ctx);
    return await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .take(50);
  },
});

// All notifications for a user (paginated by taking latest N)
export const listAll = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
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
    await requireAuth(ctx);
    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const markAllRead = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
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
    await requireAuth(ctx);
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .collect();
    return unread.length;
  },
});

// Real-time subscription returning unread notifications, sorted by sentAt desc, limit 20
export const subscribeUnread = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) =>
        q.eq("userId", args.userId).eq("isRead", false)
      )
      .order("desc")
      .take(20);
  },
});

// Internal mutation: send attendance alert to student's parents
export const sendAttendanceAlert = internalMutation({
  args: {
    studentId: v.id("students"),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) return;
    const user = await ctx.db.get(student.userId);
    const studentName = user?.name ?? "Your child";

    const parentIds = student.parentIds ?? [];
    for (const parentId of parentIds) {
      const parent = await ctx.db.get(parentId);
      if (parent) {
        await ctx.db.insert("notifications", {
          userId: parent.userId,
          type: "attendance_alert",
          title: "Attendance Alert",
          message: `Your child ${studentName} was marked absent on ${args.date}`,
          isRead: false,
        });
      }
    }
  },
});

// Internal mutation: send test result notification to student's parents
export const sendTestResultNotification = internalMutation({
  args: {
    studentId: v.id("students"),
    testId: v.id("tests"),
    score: v.number(),
    totalMarks: v.number(),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) return;
    const user = await ctx.db.get(student.userId);
    const studentName = user?.name ?? "Your child";

    const test = await ctx.db.get(args.testId);
    const testTitle = test?.title ?? "Unknown Test";

    const parentIds = student.parentIds ?? [];
    for (const parentId of parentIds) {
      const parent = await ctx.db.get(parentId);
      if (parent) {
        await ctx.db.insert("notifications", {
          userId: parent.userId,
          type: "test_result",
          title: "Test Result",
          message: `${studentName} scored ${args.score}/${args.totalMarks} on ${testTitle}`,
          isRead: false,
        });
      }
    }
  },
});

// Internal mutation: send assignment due reminders for assignments due tomorrow
export const sendAssignmentDueReminder = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Calculate tomorrow's date in YYYY-MM-DD format
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    // Find all assignments due tomorrow using index
    const dueAssignments = await ctx.db
      .query("assignments")
      .withIndex("by_due_date", (q) => q.eq("dueDate", tomorrowStr))
      .collect();

    for (const assignment of dueAssignments) {
      // Get all students in the assignment's section
      const students = await ctx.db
        .query("students")
        .withIndex("by_section", (q) => q.eq("sectionId", assignment.sectionId))
        .collect();

      for (const student of students) {
        // Check if already submitted
        const submission = await ctx.db
          .query("submissions")
          .withIndex("by_assignment_student", (q) =>
            q
              .eq("assignmentId", assignment._id)
              .eq("studentId", student._id)
          )
          .first();

        if (!submission) {
          await ctx.db.insert("notifications", {
            userId: student.userId,
            type: "assignment_due",
            title: "Assignment Due Tomorrow",
            message: `"${assignment.title}" is due tomorrow (${tomorrowStr})`,
            isRead: false,
            relatedId: assignment._id as string,
          });
        }
      }
    }
  },
});

// Internal mutation: send notification when assignment is graded
export const sendAssignmentGradedNotification = internalMutation({
  args: {
    submissionId: v.id("submissions"),
  },
  handler: async (ctx, args) => {
    const submission = await ctx.db.get(args.submissionId);
    if (!submission) return;

    const student = await ctx.db.get(submission.studentId);
    if (!student) return;

    const assignment = await ctx.db.get(submission.assignmentId);
    if (!assignment) return;

    await ctx.db.insert("notifications", {
      userId: student.userId,
      type: "assignment_graded",
      title: "Assignment Graded",
      message: `Your assignment '${assignment.title}' has been graded: ${submission.grade}/${assignment.totalMarks}`,
      isRead: false,
      relatedId: args.submissionId as string,
    });
  },
});

// Internal mutation: delete read notifications older than 30 days
export const deleteOldNotifications = internalMutation({
  args: {},
  handler: async (ctx) => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    const allNotifications = await ctx.db.query("notifications").collect();
    let deletedCount = 0;

    for (const n of allNotifications) {
      if (n.isRead && n._creationTime < thirtyDaysAgo) {
        await ctx.db.delete(n._id);
        deletedCount++;
      }
    }

    return deletedCount;
  },
});
