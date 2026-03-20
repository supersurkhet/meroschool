import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Assignment CRUD ──────────────────────────────────────────────

export const create = mutation({
  args: {
    subjectId: v.id("subjects"),
    sectionId: v.id("sections"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.string(),
    totalMarks: v.number(),
    createdBy: v.id("users"),
    fileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("assignments", args);
  },
});

export const listBySection = query({
  args: { sectionId: v.id("sections") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assignments")
      .withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
      .collect();
  },
});

export const listBySubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("assignments")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("assignments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ─── Submission Lifecycle: submit → grade ─────────────────────────

export const submit = mutation({
  args: {
    assignmentId: v.id("assignments"),
    studentId: v.id("students"),
    fileId: v.optional(v.id("_storage")),
    textContent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check if already submitted
    const existing = await ctx.db
      .query("submissions")
      .withIndex("by_assignment_student", (q) =>
        q
          .eq("assignmentId", args.assignmentId)
          .eq("studentId", args.studentId)
      )
      .first();

    if (existing) {
      // Update existing submission
      await ctx.db.patch(existing._id, {
        fileId: args.fileId,
        textContent: args.textContent,
        submittedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("submissions", {
      assignmentId: args.assignmentId,
      studentId: args.studentId,
      fileId: args.fileId,
      textContent: args.textContent,
      submittedAt: Date.now(),
    });
  },
});

export const grade = mutation({
  args: {
    submissionId: v.id("submissions"),
    grade: v.number(),
    feedback: v.optional(v.string()),
    gradedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.submissionId, {
      grade: args.grade,
      feedback: args.feedback,
      gradedBy: args.gradedBy,
    });

    // Notify student
    const submission = await ctx.db.get(args.submissionId);
    if (submission) {
      const student = await ctx.db.get(submission.studentId);
      const assignment = await ctx.db.get(submission.assignmentId);
      if (student && assignment) {
        await ctx.db.insert("notifications", {
          userId: student.userId,
          title: "Assignment Graded",
          message: `You scored ${args.grade}/${assignment.totalMarks} on "${assignment.title}"`,
          type: "assignment",
          isRead: false,
          relatedId: args.submissionId as string,
        });
      }
    }
  },
});

// Get submissions for an assignment (teacher view)
export const listSubmissions = query({
  args: { assignmentId: v.id("assignments") },
  handler: async (ctx, args) => {
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_assignment", (q) =>
        q.eq("assignmentId", args.assignmentId)
      )
      .collect();

    return Promise.all(
      submissions.map(async (s) => {
        const student = await ctx.db.get(s.studentId);
        const user = student ? await ctx.db.get(student.userId) : null;
        return { ...s, studentName: user?.name ?? "Unknown" };
      })
    );
  },
});

// Get student's submission for an assignment
export const getStudentSubmission = query({
  args: {
    assignmentId: v.id("assignments"),
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("submissions")
      .withIndex("by_assignment_student", (q) =>
        q
          .eq("assignmentId", args.assignmentId)
          .eq("studentId", args.studentId)
      )
      .first();
  },
});

// Get all submissions by student
export const listStudentSubmissions = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    return Promise.all(
      submissions.map(async (s) => {
        const assignment = await ctx.db.get(s.assignmentId);
        return { ...s, assignmentTitle: assignment?.title ?? "Unknown" };
      })
    );
  },
});
