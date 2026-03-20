import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── Users (WorkOS-backed) ────────────────────────────────────────
  users: defineTable({
    workosUserId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("teacher"),
      v.literal("student"),
      v.literal("parent")
    ),
    avatarUrl: v.optional(v.string()),
    isActive: v.boolean(),
    schoolId: v.optional(v.id("schools")),
  })
    .index("by_workos_id", ["workosUserId"])
    .index("by_role", ["role"]),

  // ─── School Structure ───────────────────────────────────────────
  schools: defineTable({
    name: v.string(),
    address: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    logo: v.optional(v.id("_storage")),
    settings: v.optional(v.any()),
    establishedYear: v.optional(v.number()),
  }),

  classes: defineTable({
    schoolId: v.id("schools"),
    name: v.string(), // e.g. "Class 10"
    grade: v.number(),
  }).index("by_school", ["schoolId"]),

  sections: defineTable({
    classId: v.id("classes"),
    name: v.string(), // e.g. "A", "B"
  }).index("by_class", ["classId"]),

  // ─── People ─────────────────────────────────────────────────────
  students: defineTable({
    userId: v.id("users"),
    sectionId: v.id("sections"),
    rollNumber: v.string(),
    dateOfBirth: v.optional(v.string()),
    admissionDate: v.optional(v.string()),
    parentIds: v.optional(v.array(v.id("parents"))),
  })
    .index("by_section", ["sectionId"])
    .index("by_user", ["userId"]),

  teachers: defineTable({
    userId: v.id("users"),
    schoolId: v.id("schools"),
    employeeId: v.string(),
    department: v.optional(v.string()),
    joinDate: v.optional(v.string()),
  })
    .index("by_school", ["schoolId"])
    .index("by_user", ["userId"]),

  parents: defineTable({
    userId: v.id("users"),
    occupation: v.optional(v.string()),
    address: v.optional(v.string()),
  }).index("by_user", ["userId"]),

  // ─── Academics: Subjects → Modules → Topics ────────────────────
  subjects: defineTable({
    classId: v.id("classes"),
    name: v.string(),
    code: v.optional(v.string()),
    teacherId: v.optional(v.id("teachers")),
  })
    .index("by_class", ["classId"])
    .index("by_teacher", ["teacherId"]),

  modules: defineTable({
    subjectId: v.id("subjects"),
    name: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
  }).index("by_subject", ["subjectId"]),

  topics: defineTable({
    moduleId: v.id("modules"),
    name: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
  }).index("by_module", ["moduleId"]),

  // ─── Materials ──────────────────────────────────────────────────
  materials: defineTable({
    topicId: v.id("topics"),
    title: v.string(),
    type: v.union(
      v.literal("video"),
      v.literal("pdf"),
      v.literal("link"),
      v.literal("document")
    ),
    fileId: v.optional(v.id("_storage")),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
    uploadedBy: v.id("users"),
  }).index("by_topic", ["topicId"]),

  // ─── Tests & MCQ Engine ─────────────────────────────────────────
  tests: defineTable({
    subjectId: v.id("subjects"),
    moduleId: v.optional(v.id("modules")),
    title: v.string(),
    description: v.optional(v.string()),
    durationMinutes: v.number(),
    totalMarks: v.number(),
    isPublished: v.boolean(),
    createdBy: v.id("users"),
  })
    .index("by_subject", ["subjectId"])
    .index("by_module", ["moduleId"]),

  testQuestions: defineTable({
    testId: v.id("tests"),
    question: v.string(),
    options: v.array(v.string()),
    correctOptionIndex: v.number(),
    marks: v.number(),
    order: v.number(),
  }).index("by_test", ["testId"]),

  testAttempts: defineTable({
    testId: v.id("tests"),
    studentId: v.id("students"),
    answers: v.array(v.number()),
    score: v.number(),
    totalMarks: v.number(),
    startedAt: v.number(),
    submittedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_test", ["testId"])
    .index("by_student", ["studentId"])
    .index("by_test_student", ["testId", "studentId"]),

  // ─── Attendance (flat individual records) ─────────────────────
  attendance: defineTable({
    studentId: v.id("students"),
    sectionId: v.id("sections"),
    date: v.string(), // YYYY-MM-DD
    status: v.union(
      v.literal("present"),
      v.literal("absent"),
      v.literal("late"),
      v.literal("excused")
    ),
    markedBy: v.id("users"),
  })
    .index("by_section", ["sectionId"])
    .index("by_student", ["studentId"])
    .index("by_section_date", ["sectionId", "date"]),

  // ─── Assignments ────────────────────────────────────────────────
  assignments: defineTable({
    subjectId: v.id("subjects"),
    sectionId: v.id("sections"),
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.string(),
    totalMarks: v.number(),
    createdBy: v.id("users"),
    fileId: v.optional(v.id("_storage")),
  })
    .index("by_subject", ["subjectId"])
    .index("by_section", ["sectionId"]),

  submissions: defineTable({
    assignmentId: v.id("assignments"),
    studentId: v.id("students"),
    fileId: v.optional(v.id("_storage")),
    textContent: v.optional(v.string()),
    grade: v.optional(v.number()),
    feedback: v.optional(v.string()),
    gradedBy: v.optional(v.id("users")),
    submittedAt: v.number(),
  })
    .index("by_assignment", ["assignmentId"])
    .index("by_student", ["studentId"])
    .index("by_assignment_student", ["assignmentId", "studentId"]),

  // ─── Salary Records ────────────────────────────────────────────
  salaryRecords: defineTable({
    teacherId: v.id("teachers"),
    month: v.string(), // YYYY-MM
    baseSalary: v.number(),
    deductions: v.number(),
    bonuses: v.number(),
    netSalary: v.number(),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("cancelled")
    ),
    paidAt: v.optional(v.number()),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_teacher_month", ["teacherId", "month"])
    .index("by_month", ["month"]),

  // ─── Notifications ─────────────────────────────────────────────
  notifications: defineTable({
    userId: v.id("users"),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    relatedId: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_unread", ["userId", "isRead"]),
});
