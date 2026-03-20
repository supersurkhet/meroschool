import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireAuth } from "./helpers";

// Comprehensive student progress: attendance %, test scores, assignment completion
export const getStudentProgress = query({
  args: {
    studentId: v.id("students"),
    month: v.optional(v.string()), // YYYY-MM, defaults to all-time
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const student = await ctx.db.get(args.studentId);
    if (!student) return null;

    const user = await ctx.db.get(student.userId);

    // ── Attendance ──
    let attendanceRecords = await ctx.db
      .query("attendance")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    if (args.month) {
      const startDate = `${args.month}-01`;
      const endDate = `${args.month}-31`;
      attendanceRecords = attendanceRecords.filter(
        (r) => r.date >= startDate && r.date <= endDate
      );
    }

    const totalAttendanceDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(
      (r) => r.status === "present" || r.status === "late"
    ).length;
    const attendancePercent =
      totalAttendanceDays > 0
        ? Math.round((presentDays / totalAttendanceDays) * 100)
        : 0;

    // ── Test Scores ──
    const testAttempts = await ctx.db
      .query("testAttempts")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    const totalTestScore = testAttempts.reduce((sum, a) => sum + a.score, 0);
    const totalTestMarks = testAttempts.reduce(
      (sum, a) => sum + a.totalMarks,
      0
    );
    const averageTestPercent =
      totalTestMarks > 0
        ? Math.round((totalTestScore / totalTestMarks) * 100)
        : 0;

    const testDetails = await Promise.all(
      testAttempts.map(async (a) => {
        const test = await ctx.db.get(a.testId);
        return {
          testTitle: test?.title ?? "Unknown",
          score: a.score,
          totalMarks: a.totalMarks,
          percent: Math.round((a.score / a.totalMarks) * 100),
          submittedAt: a.submittedAt,
        };
      })
    );

    // ── Assignments ──
    const submissions = await ctx.db
      .query("submissions")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    // Get all assignments for this student's section
    const section = await ctx.db.get(student.sectionId);
    const sectionAssignments = section
      ? await ctx.db
          .query("assignments")
          .withIndex("by_section", (q) => q.eq("sectionId", section._id))
          .collect()
      : [];

    const totalAssignments = sectionAssignments.length;
    const submittedAssignments = submissions.length;
    const gradedSubmissions = submissions.filter(
      (s) => s.grade !== undefined
    );
    const totalAssignmentScore = gradedSubmissions.reduce(
      (sum, s) => sum + (s.grade ?? 0),
      0
    );
    const totalAssignmentMarks = await Promise.all(
      gradedSubmissions.map(async (s) => {
        const assignment = await ctx.db.get(s.assignmentId);
        return assignment?.totalMarks ?? 0;
      })
    ).then((marks) => marks.reduce((sum, m) => sum + m, 0));

    const assignmentCompletionPercent =
      totalAssignments > 0
        ? Math.round((submittedAssignments / totalAssignments) * 100)
        : 0;

    const averageAssignmentPercent =
      totalAssignmentMarks > 0
        ? Math.round((totalAssignmentScore / totalAssignmentMarks) * 100)
        : 0;

    return {
      student: {
        id: args.studentId,
        name: user?.name ?? "Unknown",
        rollNumber: student.rollNumber,
        sectionId: student.sectionId,
      },
      attendance: {
        totalDays: totalAttendanceDays,
        presentDays,
        percent: attendancePercent,
      },
      tests: {
        attempted: testAttempts.length,
        averagePercent: averageTestPercent,
        totalScore: totalTestScore,
        totalMarks: totalTestMarks,
        details: testDetails,
      },
      assignments: {
        total: totalAssignments,
        submitted: submittedAssignments,
        completionPercent: assignmentCompletionPercent,
        averageGradePercent: averageAssignmentPercent,
      },
    };
  },
});

// Section-level progress overview (for teacher dashboard)
export const getSectionProgress = query({
  args: { sectionId: v.id("sections") },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    const students = await ctx.db
      .query("students")
      .withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
      .collect();

    const summaries = await Promise.all(
      students.map(async (student) => {
        const user = await ctx.db.get(student.userId);

        // Attendance
        const attendance = await ctx.db
          .query("attendance")
          .withIndex("by_student", (q) => q.eq("studentId", student._id))
          .collect();
        const totalDays = attendance.length;
        const presentDays = attendance.filter(
          (r) => r.status === "present" || r.status === "late"
        ).length;

        // Test scores
        const attempts = await ctx.db
          .query("testAttempts")
          .withIndex("by_student", (q) => q.eq("studentId", student._id))
          .collect();
        const totalScore = attempts.reduce((s, a) => s + a.score, 0);
        const totalMarks = attempts.reduce((s, a) => s + a.totalMarks, 0);

        // Submissions
        const submissions = await ctx.db
          .query("submissions")
          .withIndex("by_student", (q) => q.eq("studentId", student._id))
          .collect();

        return {
          studentId: student._id,
          name: user?.name ?? "Unknown",
          rollNumber: student.rollNumber,
          attendancePercent:
            totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
          testAveragePercent:
            totalMarks > 0
              ? Math.round((totalScore / totalMarks) * 100)
              : 0,
          assignmentsSubmitted: submissions.length,
        };
      })
    );

    return summaries;
  },
});
