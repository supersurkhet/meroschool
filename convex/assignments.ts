import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireRole } from "./helpers";

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
    await requireRole(ctx, "admin", "teacher");
    const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateFormat.test(args.dueDate)) {
      throw new Error("Invalid date format for dueDate. Expected YYYY-MM-DD");
    }
    return await ctx.db.insert("assignments", args);
  },
});

export const listBySection = query({
  args: { sectionId: v.id("sections") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("assignments")
      .withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
      .take(100);
  },
});

export const listBySubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    return await ctx.db
      .query("assignments")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .take(100);
  },
});

export const get = query({
  args: { id: v.id("assignments") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
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
    await requireRole(ctx, "student");
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
    await requireRole(ctx, "admin", "teacher");
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
          type: "assignment_graded",
          isRead: false,
          relatedId: args.submissionId as string,
        });
      }
    }
  },
});

// Bulk grade multiple submissions
export const bulkGrade = mutation({
  args: {
    grades: v.array(
      v.object({
        submissionId: v.id("submissions"),
        grade: v.number(),
        feedback: v.optional(v.string()),
      })
    ),
    gradedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin", "teacher");
    for (const item of args.grades) {
      await ctx.db.patch(item.submissionId, {
        grade: item.grade,
        feedback: item.feedback,
        gradedBy: args.gradedBy,
      });

      // Notify student
      const submission = await ctx.db.get(item.submissionId);
      if (submission) {
        const student = await ctx.db.get(submission.studentId);
        const assignment = await ctx.db.get(submission.assignmentId);
        if (student && assignment) {
          await ctx.db.insert("notifications", {
            userId: student.userId,
            title: "Assignment Graded",
            message: `You scored ${item.grade}/${assignment.totalMarks} on "${assignment.title}"`,
            type: "assignment_graded",
            isRead: false,
            relatedId: item.submissionId as string,
          });
        }
      }
    }
  },
});

// Get submissions for an assignment (teacher view)
export const listSubmissions = query({
  args: { assignmentId: v.id("assignments") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_assignment", (q) =>
        q.eq("assignmentId", args.assignmentId)
      )
      .take(100);

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
    await requireAuth(ctx);
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
    await requireAuth(ctx);
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .take(100);

    return Promise.all(
      submissions.map(async (s) => {
        const assignment = await ctx.db.get(s.assignmentId);
        return { ...s, assignmentTitle: assignment?.title ?? "Unknown" };
      })
    );
  },
});

// Get assignment with all its submissions and student info
export const getAssignmentWithSubmissions = query({
  args: { assignmentId: v.id("assignments") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) return null;

    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_assignment", (q) =>
        q.eq("assignmentId", args.assignmentId)
      )
      .collect();

    const submissionsWithStudents = await Promise.all(
      submissions.map(async (s) => {
        const student = await ctx.db.get(s.studentId);
        const user = student ? await ctx.db.get(student.userId) : null;
        return {
          ...s,
          studentName: user?.name ?? "Unknown",
          rollNumber: student?.rollNumber ?? "Unknown",
        };
      })
    );

    return { ...assignment, submissions: submissionsWithStudents };
  },
});

// Get all assignments for a student's section with submission status
export const getStudentAssignments = query({
  args: {
    studentId: v.id("students"),
    sectionId: v.id("sections"),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
      .collect();

    return Promise.all(
      assignments.map(async (a) => {
        const submission = await ctx.db
          .query("submissions")
          .withIndex("by_assignment_student", (q) =>
            q
              .eq("assignmentId", a._id)
              .eq("studentId", args.studentId)
          )
          .first();

        let status: "not submitted" | "submitted" | "graded" = "not submitted";
        if (submission) {
          status = submission.grade !== undefined ? "graded" : "submitted";
        }

        return {
          ...a,
          submissionStatus: status,
          grade: submission?.grade,
          feedback: submission?.feedback,
          submittedAt: submission?.submittedAt,
        };
      })
    );
  },
});
