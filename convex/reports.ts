import { v } from "convex/values";
import { query } from "./_generated/server";
import { requireRole } from "./helpers";

// ─── Class Average Scores ─────────────────────────────────────────
// Average test scores across all students in a class (all sections)
export const getClassTestAverages = query({
  args: { classId: v.id("classes") },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin", "teacher");
    const sections = await ctx.db
      .query("sections")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .collect();

    const subjects = await ctx.db
      .query("subjects")
      .withIndex("by_class", (q) => q.eq("classId", args.classId))
      .collect();

    // Get all students across sections
    const allStudents = (
      await Promise.all(
        sections.map((s) =>
          ctx.db
            .query("students")
            .withIndex("by_section", (q) => q.eq("sectionId", s._id))
            .collect()
        )
      )
    ).flat();

    const studentIds = new Set(allStudents.map((s) => s._id));

    // Per-subject averages
    const subjectAverages = await Promise.all(
      subjects.map(async (subject) => {
        const tests = await ctx.db
          .query("tests")
          .withIndex("by_subject", (q) => q.eq("subjectId", subject._id))
          .collect();

        let totalScore = 0;
        let totalMarks = 0;
        let attemptCount = 0;

        for (const test of tests) {
          const attempts = await ctx.db
            .query("testAttempts")
            .withIndex("by_test", (q) => q.eq("testId", test._id))
            .collect();

          for (const a of attempts) {
            if (studentIds.has(a.studentId)) {
              totalScore += a.score;
              totalMarks += a.totalMarks;
              attemptCount++;
            }
          }
        }

        return {
          subjectId: subject._id,
          subjectName: subject.name,
          averagePercent:
            totalMarks > 0
              ? Math.round((totalScore / totalMarks) * 100)
              : 0,
          totalAttempts: attemptCount,
        };
      })
    );

    return {
      classId: args.classId,
      totalStudents: allStudents.length,
      subjectAverages,
    };
  },
});

// ─── Section Attendance Rate ──────────────────────────────────────
// Attendance rate for a section over a month
export const getSectionAttendanceRate = query({
  args: {
    sectionId: v.id("sections"),
    month: v.string(), // YYYY-MM
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin", "teacher");
    const startDate = `${args.month}-01`;
    const endDate = `${args.month}-31`;

    const students = await ctx.db
      .query("students")
      .withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
      .collect();

    const records = await ctx.db
      .query("attendance")
      .withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startDate),
          q.lte(q.field("date"), endDate)
        )
      )
      .collect();

    const totalRecords = records.length;
    const presentRecords = records.filter(
      (r) => r.status === "present" || r.status === "late"
    ).length;

    // Per-student breakdown
    const perStudent = students.map((student) => {
      const studentRecords = records.filter(
        (r) => r.studentId === student._id
      );
      const present = studentRecords.filter(
        (r) => r.status === "present" || r.status === "late"
      ).length;
      return {
        studentId: student._id,
        rollNumber: student.rollNumber,
        totalDays: studentRecords.length,
        presentDays: present,
        percent:
          studentRecords.length > 0
            ? Math.round((present / studentRecords.length) * 100)
            : 0,
      };
    });

    return {
      sectionId: args.sectionId,
      month: args.month,
      totalStudents: students.length,
      overallRate:
        totalRecords > 0
          ? Math.round((presentRecords / totalRecords) * 100)
          : 0,
      perStudent,
    };
  },
});

// ─── School Dashboard Stats ───────────────────────────────────────
// High-level counts for admin dashboard
export const getSchoolDashboardStats = query({
  args: { schoolId: v.id("schools") },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin", "teacher");
    const classes = await ctx.db
      .query("classes")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .collect();

    const classIds = classes.map((c) => c._id);

    // Count sections
    let totalSections = 0;
    let totalStudents = 0;
    for (const classId of classIds) {
      const sections = await ctx.db
        .query("sections")
        .withIndex("by_class", (q) => q.eq("classId", classId))
        .collect();
      totalSections += sections.length;

      for (const section of sections) {
        const students = await ctx.db
          .query("students")
          .withIndex("by_section", (q) => q.eq("sectionId", section._id))
          .collect();
        totalStudents += students.length;
      }
    }

    const teachers = await ctx.db
      .query("teachers")
      .withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
      .collect();

    // Today's attendance
    const today = new Date().toISOString().split("T")[0];
    let todayPresent = 0;
    let todayTotal = 0;
    for (const classId of classIds) {
      const sections = await ctx.db
        .query("sections")
        .withIndex("by_class", (q) => q.eq("classId", classId))
        .collect();

      for (const section of sections) {
        const records = await ctx.db
          .query("attendance")
          .withIndex("by_section_date", (q) =>
            q.eq("sectionId", section._id).eq("date", today)
          )
          .collect();
        todayTotal += records.length;
        todayPresent += records.filter(
          (r) => r.status === "present" || r.status === "late"
        ).length;
      }
    }

    // Pending salaries this month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const salaryRecords = await ctx.db
      .query("salaryRecords")
      .withIndex("by_month", (q) => q.eq("month", currentMonth))
      .collect();
    const pendingSalaries = salaryRecords.filter(
      (r) => r.status === "pending"
    ).length;

    return {
      totalClasses: classes.length,
      totalSections,
      totalStudents,
      totalTeachers: teachers.length,
      todayAttendance: {
        present: todayPresent,
        total: todayTotal,
        percent:
          todayTotal > 0
            ? Math.round((todayPresent / todayTotal) * 100)
            : 0,
      },
      pendingSalaries,
    };
  },
});

// ─── Assignment Completion Report ─────────────────────────────────
// Per-assignment completion rate for a section
export const getAssignmentCompletionReport = query({
  args: { sectionId: v.id("sections") },
  handler: async (ctx, args) => {
    await requireRole(ctx, "admin", "teacher");
    const assignments = await ctx.db
      .query("assignments")
      .withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
      .collect();

    const students = await ctx.db
      .query("students")
      .withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
      .collect();

    const totalStudents = students.length;

    const report = await Promise.all(
      assignments.map(async (a) => {
        const submissions = await ctx.db
          .query("submissions")
          .withIndex("by_assignment", (q) => q.eq("assignmentId", a._id))
          .collect();

        const graded = submissions.filter((s) => s.grade !== undefined);
        const avgGrade =
          graded.length > 0
            ? Math.round(
                graded.reduce((sum, s) => sum + (s.grade ?? 0), 0) /
                  graded.length
              )
            : 0;

        return {
          assignmentId: a._id,
          title: a.title,
          dueDate: a.dueDate,
          totalStudents,
          submitted: submissions.length,
          graded: graded.length,
          completionPercent:
            totalStudents > 0
              ? Math.round((submissions.length / totalStudents) * 100)
              : 0,
          averageGrade: avgGrade,
          totalMarks: a.totalMarks,
        };
      })
    );

    return report;
  },
});
