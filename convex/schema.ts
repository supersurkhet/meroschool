import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── School Structure ───────────────────────────────────────────
  schools: defineTable({
    name: v.string(),
    address: v.string(),
    phone: v.string(),
    email: v.string(),
    logo: v.optional(v.string()),
    settings: v.optional(v.any()),
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
    schoolId: v.id("schools"),
    sectionId: v.id("sections"),
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    enrollmentDate: v.string(),
    rollNumber: v.string(),
    guardianName: v.string(),
    guardianPhone: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive")),
  })
    .index("by_school", ["schoolId"])
    .index("by_section", ["sectionId"])
    .index("by_userId", ["userId"]),

  teachers: defineTable({
    schoolId: v.id("schools"),
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    qualification: v.string(),
    joinDate: v.string(),
    status: v.union(v.literal("active"), v.literal("inactive")),
  })
    .index("by_school", ["schoolId"])
    .index("by_userId", ["userId"]),

  parents: defineTable({
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    studentIds: v.array(v.id("students")),
  }).index("by_userId", ["userId"]),

  // ─── Academics: Subjects → Modules → Topics ────────────────────
  subjects: defineTable({
    schoolId: v.id("schools"),
    classId: v.id("classes"),
    name: v.string(),
    code: v.string(),
    teacherId: v.id("teachers"),
  })
    .index("by_school", ["schoolId"])
    .index("by_class", ["classId"])
    .index("by_teacher", ["teacherId"]),

  modules: defineTable({
    subjectId: v.id("subjects"),
    name: v.string(),
    description: v.string(),
    order: v.number(),
  }).index("by_subject", ["subjectId"]),

  topics: defineTable({
    moduleId: v.id("modules"),
    name: v.string(),
    description: v.string(),
    order: v.number(),
  }).index("by_module", ["moduleId"]),

  // ─── Materials ──────────────────────────────────────────────────
  materials: defineTable({
    topicId: v.id("topics"),
    title: v.string(),
    type: v.union(
      v.literal("video"),
      v.literal("pdf"),
      v.literal("link")
    ),
    url: v.string(),
    description: v.optional(v.string()),
    uploadedBy: v.string(),
  }).index("by_topic", ["topicId"]),

  // ─── Tests & MCQ Engine ─────────────────────────────────────────
  tests: defineTable({
    subjectId: v.id("subjects"),
    moduleId: v.optional(v.id("modules")),
    title: v.string(),
    description: v.string(),
    duration: v.number(), // minutes
    totalMarks: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("closed")
    ),
  })
    .index("by_subject", ["subjectId"])
    .index("by_module", ["moduleId"]),

  testQuestions: defineTable({
    testId: v.id("tests"),
    question: v.string(),
    options: v.array(v.string()),
    correctOption: v.number(),
    marks: v.number(),
  }).index("by_test", ["testId"]),

  testAttempts: defineTable({
    testId: v.id("tests"),
    studentId: v.id("students"),
    answers: v.array(v.number()),
    score: v.optional(v.number()),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_test", ["testId"])
    .index("by_student", ["studentId"])
    .index("by_test_student", ["testId", "studentId"]),

  // ─── Attendance ─────────────────────────────────────────────────
  attendance: defineTable({
    sectionId: v.id("sections"),
    date: v.string(), // YYYY-MM-DD
    records: v.array(
      v.object({
        studentId: v.id("students"),
        status: v.union(
          v.literal("present"),
          v.literal("absent"),
          v.literal("late")
        ),
      })
    ),
    markedBy: v.string(),
  })
    .index("by_section", ["sectionId"])
    .index("by_section_date", ["sectionId", "date"]),

  // ─── Assignments ────────────────────────────────────────────────
  assignments: defineTable({
    subjectId: v.id("subjects"),
    sectionId: v.id("sections"),
    title: v.string(),
    description: v.string(),
    dueDate: v.string(),
    createdBy: v.string(),
  })
    .index("by_subject", ["subjectId"])
    .index("by_section", ["sectionId"]),

  submissions: defineTable({
    assignmentId: v.id("assignments"),
    studentId: v.id("students"),
    content: v.optional(v.string()),
    fileUrl: v.optional(v.string()),
    grade: v.optional(v.string()),
    feedback: v.optional(v.string()),
    submittedAt: v.number(),
  })
    .index("by_assignment", ["assignmentId"])
    .index("by_student", ["studentId"])
    .index("by_assignment_student", ["assignmentId", "studentId"]),

  // ─── Salary Records ────────────────────────────────────────────
  salaryRecords: defineTable({
    teacherId: v.id("teachers"),
    month: v.number(),
    year: v.number(),
    amount: v.number(),
    status: v.union(v.literal("pending"), v.literal("paid")),
    paidAt: v.optional(v.number()),
  })
    .index("by_teacher", ["teacherId"])
    .index("by_month_year", ["year", "month"]),

  // ─── Notifications ─────────────────────────────────────────────
  notifications: defineTable({
    recipientId: v.string(),
    type: v.string(),
    title: v.string(),
    message: v.string(),
    read: v.boolean(),
    sentAt: v.number(),
  })
    .index("by_recipient", ["recipientId"])
    .index("by_recipient_read", ["recipientId", "read"]),
});
