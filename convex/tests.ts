import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ─── Test CRUD ────────────────────────────────────────────────────

export const createTest = mutation({
  args: {
    subjectId: v.id("subjects"),
    title: v.string(),
    description: v.optional(v.string()),
    durationMinutes: v.number(),
    totalMarks: v.number(),
    createdBy: v.id("users"),
    moduleId: v.optional(v.id("modules")),
  },
  handler: async (ctx, args) => {
    if (args.durationMinutes <= 0 || args.durationMinutes > 180) {
      throw new Error("Test duration must be greater than 0 and at most 180 minutes");
    }
    return await ctx.db.insert("tests", { ...args, isPublished: false });
  },
});

export const getTest = query({
  args: { id: v.id("tests") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const listTestsBySubject = query({
  args: { subjectId: v.id("subjects") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tests")
      .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId))
      .take(100);
  },
});

export const publishTest = mutation({
  args: { testId: v.id("tests") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.testId, { isPublished: true });
  },
});

export const closeTest = mutation({
  args: { testId: v.id("tests") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.testId, { isPublished: false });
  },
});

// Test statistics: total attempts, avg/highest/lowest score, pass rate
export const getTestStats = query({
  args: { testId: v.id("tests") },
  handler: async (ctx, args) => {
    const test = await ctx.db.get(args.testId);
    if (!test) return null;

    const attempts = await ctx.db
      .query("testAttempts")
      .withIndex("by_test", (q) => q.eq("testId", args.testId))
      .collect();

    const totalAttempts = attempts.length;
    if (totalAttempts === 0) {
      return {
        testId: args.testId,
        totalAttempts: 0,
        avgScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
      };
    }

    const scores = attempts.map((a) => a.score);
    const avgScore = Math.round(scores.reduce((s, v) => s + v, 0) / totalAttempts);
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);
    const passingThreshold = test.totalMarks * 0.4;
    const passCount = scores.filter((s) => s >= passingThreshold).length;
    const passRate = Math.round((passCount / totalAttempts) * 100);

    return {
      testId: args.testId,
      totalAttempts,
      avgScore,
      highestScore,
      lowestScore,
      passRate,
    };
  },
});

// All attempts by a student across all tests, with test details
export const getStudentTestHistory = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("testAttempts")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .take(100);

    return Promise.all(
      attempts.map(async (a) => {
        const test = await ctx.db.get(a.testId);
        let subjectName = "Unknown";
        if (test) {
          const subject = await ctx.db.get(test.subjectId);
          subjectName = subject?.name ?? "Unknown";
        }
        return {
          ...a,
          testTitle: test?.title ?? "Unknown",
          subject: subjectName,
        };
      })
    );
  },
});

// ─── Question Bank CRUD ───────────────────────────────────────────

export const addQuestion = mutation({
  args: {
    testId: v.id("tests"),
    question: v.string(),
    options: v.array(v.string()),
    correctOptionIndex: v.number(),
    marks: v.number(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    if (args.options.length !== 4) {
      throw new Error("Question must have exactly 4 options");
    }
    if (args.correctOptionIndex < 0 || args.correctOptionIndex > 3) {
      throw new Error("correctOptionIndex must be between 0 and 3");
    }
    return await ctx.db.insert("testQuestions", args);
  },
});

export const addQuestionsBulk = mutation({
  args: {
    testId: v.id("tests"),
    questions: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        correctOptionIndex: v.number(),
        marks: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const q of args.questions) {
      if (q.options.length !== 4) {
        throw new Error("Each question must have exactly 4 options");
      }
      if (q.correctOptionIndex < 0 || q.correctOptionIndex > 3) {
        throw new Error("correctOptionIndex must be between 0 and 3");
      }
    }
    const ids = [];
    for (let i = 0; i < args.questions.length; i++) {
      const id = await ctx.db.insert("testQuestions", {
        testId: args.testId,
        ...args.questions[i],
        order: i + 1,
      });
      ids.push(id);
    }
    return ids;
  },
});

export const listQuestions = query({
  args: { testId: v.id("tests") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("testQuestions")
      .withIndex("by_test", (q) => q.eq("testId", args.testId))
      .collect();
  },
});

// Get questions for student (without correct answers)
export const listQuestionsForStudent = query({
  args: { testId: v.id("tests") },
  handler: async (ctx, args) => {
    const questions = await ctx.db
      .query("testQuestions")
      .withIndex("by_test", (q) => q.eq("testId", args.testId))
      .collect();

    return questions.map(({ correctOptionIndex: _, ...q }) => q);
  },
});

export const updateQuestion = mutation({
  args: {
    id: v.id("testQuestions"),
    question: v.optional(v.string()),
    options: v.optional(v.array(v.string())),
    correctOptionIndex: v.optional(v.number()),
    marks: v.optional(v.number()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...fields }) => {
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(fields)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(id, patch);
  },
});

export const deleteQuestion = mutation({
  args: { id: v.id("testQuestions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ─── Test Generation: Random from Bank ────────────────────────────

export const generateRandomTest = mutation({
  args: {
    subjectId: v.id("subjects"),
    title: v.string(),
    durationMinutes: v.number(),
    questionCount: v.number(),
    marksPerQuestion: v.number(),
    sourceTestId: v.id("tests"), // pool to pick from
    createdBy: v.id("users"),
    moduleId: v.optional(v.id("modules")),
  },
  handler: async (ctx, args) => {
    // Get all questions from the source test (question bank)
    const allQuestions = await ctx.db
      .query("testQuestions")
      .withIndex("by_test", (q) => q.eq("testId", args.sourceTestId))
      .collect();

    if (allQuestions.length < args.questionCount) {
      throw new Error(
        `Not enough questions in bank. Have ${allQuestions.length}, need ${args.questionCount}`
      );
    }

    // Fisher-Yates shuffle and take first N
    const shuffled = [...allQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const selected = shuffled.slice(0, args.questionCount);

    // Create the new test
    const testId = await ctx.db.insert("tests", {
      subjectId: args.subjectId,
      title: args.title,
      durationMinutes: args.durationMinutes,
      totalMarks: args.questionCount * args.marksPerQuestion,
      createdBy: args.createdBy,
      isPublished: false,
      moduleId: args.moduleId,
    });

    // Copy selected questions into the new test
    for (let i = 0; i < selected.length; i++) {
      await ctx.db.insert("testQuestions", {
        testId,
        question: selected[i].question,
        options: selected[i].options,
        correctOptionIndex: selected[i].correctOptionIndex,
        marks: args.marksPerQuestion,
        order: i + 1,
      });
    }

    return testId;
  },
});

// ─── Auto-Evaluation & Attempt Recording ──────────────────────────

export const submitAttempt = mutation({
  args: {
    testId: v.id("tests"),
    studentId: v.id("students"),
    answers: v.array(v.number()), // selected option indices
    startedAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if already attempted
    const existing = await ctx.db
      .query("testAttempts")
      .withIndex("by_test_student", (q) =>
        q.eq("testId", args.testId).eq("studentId", args.studentId)
      )
      .first();

    if (existing) {
      throw new Error("Test already attempted");
    }

    // Get questions and auto-evaluate
    const questions = await ctx.db
      .query("testQuestions")
      .withIndex("by_test", (q) => q.eq("testId", args.testId))
      .collect();

    // Sort by order
    questions.sort((a, b) => a.order - b.order);

    let score = 0;
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    for (let i = 0; i < questions.length; i++) {
      if (i < args.answers.length && args.answers[i] === questions[i].correctOptionIndex) {
        score += questions[i].marks;
      }
    }

    const attemptId = await ctx.db.insert("testAttempts", {
      testId: args.testId,
      studentId: args.studentId,
      answers: args.answers,
      score,
      totalMarks,
      startedAt: args.startedAt,
      submittedAt: Date.now(),
    });

    // Notify parent(s)
    const student = await ctx.db.get(args.studentId);
    const test = await ctx.db.get(args.testId);
    if (student && test && student.parentIds) {
      for (const parentId of student.parentIds) {
        const parent = await ctx.db.get(parentId);
        if (parent) {
          await ctx.db.insert("notifications", {
            userId: parent.userId,
            title: "Test Result",
            message: `Your child scored ${score}/${totalMarks} on "${test.title}"`,
            type: "test_result",
            isRead: false,
            relatedId: attemptId as string,
          });
        }
      }
    }

    return { attemptId, score, totalMarks };
  },
});

// Get attempt result
export const getAttempt = query({
  args: { testId: v.id("tests"), studentId: v.id("students") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("testAttempts")
      .withIndex("by_test_student", (q) =>
        q.eq("testId", args.testId).eq("studentId", args.studentId)
      )
      .unique();
  },
});

// Get all attempts for a test (teacher view)
export const listAttemptsByTest = query({
  args: { testId: v.id("tests") },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("testAttempts")
      .withIndex("by_test", (q) => q.eq("testId", args.testId))
      .collect();

    return Promise.all(
      attempts.map(async (a) => {
        const student = await ctx.db.get(a.studentId);
        const user = student ? await ctx.db.get(student.userId) : null;
        return { ...a, studentName: user?.name ?? "Unknown" };
      })
    );
  },
});

// Get all attempts by student
export const listAttemptsByStudent = query({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    const attempts = await ctx.db
      .query("testAttempts")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .collect();

    return Promise.all(
      attempts.map(async (a) => {
        const test = await ctx.db.get(a.testId);
        return { ...a, testTitle: test?.title ?? "Unknown" };
      })
    );
  },
});
