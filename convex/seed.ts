import { internalMutation } from "./_generated/server";

// Nepali first/last name pools for realistic demo data
const firstNames = [
  "Aarav", "Anish", "Bikash", "Deepak", "Gaurav",
  "Hari", "Ishwor", "Kiran", "Manish", "Nabin",
  "Priya", "Ranjana", "Sita", "Sunita", "Uma",
  "Anjali", "Binita", "Durga", "Gita", "Kabita",
  "Laxmi", "Mina", "Nirmala", "Parbati", "Rashmi",
  "Sarita", "Tara", "Urmila", "Yamuna", "Bimala",
];
const lastNames = [
  "Thapa", "Sharma", "Adhikari", "Poudel", "KC",
  "Budha", "Bhandari", "Oli", "Gurung", "Shrestha",
];

function pickName(index: number): { first: string; last: string } {
  return {
    first: firstNames[index % firstNames.length],
    last: lastNames[index % lastNames.length],
  };
}

// Seed function: creates demo school with full data.
// Run via: npx convex run seed:seed
export const seed = internalMutation({
  args: {},
  handler: async (ctx) => {
    // ── Guard: don't double-seed ──
    const existing = await ctx.db.query("schools").first();
    if (existing) {
      throw new Error("Database already seeded. Clear all tables first.");
    }

    // ─── 1. School ────────────────────────────────────────────────
    const schoolId = await ctx.db.insert("schools", {
      name: "Surkhet Valley Academy",
      address: "Birendranagar-4, Surkhet, Nepal",
      phone: "9847012345",
      email: "info@surkhetvalley.edu.np",
      establishedYear: 2015,
    });

    // ─── 2. Admin ─────────────────────────────────────────────────
    const adminUserId = await ctx.db.insert("users", {
      workosUserId: "demo_admin_001",
      name: "Ram Bahadur Shrestha",
      email: "admin@surkhetvalley.edu.np",
      role: "admin",
      isActive: true,
      schoolId,
    });

    // ─── 3. Teachers (3) ──────────────────────────────────────────
    const teacherDefs = [
      { name: "Sita Sharma", email: "sita@surkhetvalley.edu.np", dept: "Mathematics", empId: "T-001" },
      { name: "Krishna Adhikari", email: "krishna@surkhetvalley.edu.np", dept: "Science", empId: "T-002" },
      { name: "Gita Poudel", email: "gita@surkhetvalley.edu.np", dept: "English", empId: "T-003" },
    ];

    const teacherUserIds: any[] = [];
    const teacherIds: any[] = [];
    for (const t of teacherDefs) {
      const userId = await ctx.db.insert("users", {
        workosUserId: `demo_teacher_${t.empId}`,
        name: t.name,
        email: t.email,
        role: "teacher",
        isActive: true,
        schoolId,
      });
      teacherUserIds.push(userId);
      const teacherId = await ctx.db.insert("teachers", {
        userId,
        schoolId,
        employeeId: t.empId,
        department: t.dept,
        joinDate: "2023-04-01",
      });
      teacherIds.push(teacherId);
    }

    // ─── 4. Classes (6, 7, 8) with 2 sections each ───────────────
    const grades = [6, 7, 8];
    const sectionNames = ["A", "B"];

    const classIds: any[] = [];
    const sectionIds: any[] = []; // flat list of all 6 sections
    const sectionMeta: Array<{ classId: any; sectionId: any; grade: number; sec: string }> = [];

    for (const grade of grades) {
      const classId = await ctx.db.insert("classes", {
        schoolId,
        name: `Class ${grade}`,
        grade,
      });
      classIds.push(classId);

      for (const sec of sectionNames) {
        const sectionId = await ctx.db.insert("sections", {
          classId,
          name: sec,
        });
        sectionIds.push(sectionId);
        sectionMeta.push({ classId, sectionId, grade, sec });
      }
    }

    // ─── 5. Parents (10 — roughly 1 per 3 students, shared) ──────
    const parentIds: any[] = [];
    for (let i = 0; i < 10; i++) {
      const { first, last } = pickName(20 + i); // offset into names
      const userId = await ctx.db.insert("users", {
        workosUserId: `demo_parent_${i + 1}`,
        name: `${first} ${last}`,
        email: `${first.toLowerCase()}.parent${i + 1}@gmail.com`,
        role: "parent",
        isActive: true,
      });
      const parentId = await ctx.db.insert("parents", {
        userId,
        occupation: ["Farmer", "Teacher", "Business", "Government", "Doctor"][i % 5],
        address: "Birendranagar, Surkhet",
      });
      parentIds.push(parentId);
    }

    // ─── 6. Students (5 per section = 30 total) ──────────────────
    let studentCounter = 0;
    const allStudentIds: any[] = [];
    const studentsBySectionIdx: any[][] = []; // parallel to sectionMeta

    for (let si = 0; si < sectionMeta.length; si++) {
      const sec = sectionMeta[si];
      const sectionStudentIds: any[] = [];

      for (let j = 0; j < 5; j++) {
        const idx = studentCounter++;
        const { first, last } = pickName(idx);
        const rollNumber = `${sec.grade}${sec.sec}${String(j + 1).padStart(2, "0")}`;
        const dobYear = 2014 - sec.grade; // age-appropriate
        const dob = `${dobYear}-${String((idx % 12) + 1).padStart(2, "0")}-${String((idx % 28) + 1).padStart(2, "0")}`;

        const userId = await ctx.db.insert("users", {
          workosUserId: `demo_student_${rollNumber}`,
          name: `${first} ${last}`,
          email: `${first.toLowerCase()}.${last.toLowerCase()}${idx}@student.edu.np`,
          role: "student",
          isActive: true,
          schoolId,
        });

        const studentId = await ctx.db.insert("students", {
          userId,
          sectionId: sec.sectionId,
          rollNumber,
          dateOfBirth: dob,
          admissionDate: "2025-04-15",
          parentIds: [parentIds[idx % parentIds.length]],
        });

        sectionStudentIds.push(studentId);
        allStudentIds.push(studentId);
      }

      studentsBySectionIdx.push(sectionStudentIds);
    }

    // ─── 7. Subjects (5, spread across classes) ──────────────────
    const subjectDefs = [
      { name: "Mathematics", code: "MATH", teacherIdx: 0 },
      { name: "Science", code: "SCI", teacherIdx: 1 },
      { name: "English", code: "ENG", teacherIdx: 2 },
      { name: "Nepali", code: "NEP", teacherIdx: 0 },
      { name: "Social Studies", code: "SOC", teacherIdx: 1 },
    ];

    const subjectIdsByClass: any[][] = [];
    for (let ci = 0; ci < classIds.length; ci++) {
      const classSubjectIds: any[] = [];
      for (const sub of subjectDefs) {
        const subjectId = await ctx.db.insert("subjects", {
          classId: classIds[ci],
          name: sub.name,
          code: `${sub.code}-${grades[ci]}`,
          teacherId: teacherIds[sub.teacherIdx],
        });
        classSubjectIds.push(subjectId);
      }
      subjectIdsByClass.push(classSubjectIds);
    }

    // ─── 8. Modules & Topics (for Math Class 8) ──────────────────
    const mathClass8 = subjectIdsByClass[2][0]; // Class 8 Mathematics

    const mod1 = await ctx.db.insert("modules", {
      subjectId: mathClass8,
      name: "Algebra",
      description: "Linear equations, polynomials, and factoring",
      order: 1,
    });
    const mod2 = await ctx.db.insert("modules", {
      subjectId: mathClass8,
      name: "Geometry",
      description: "Triangles, circles, and coordinate geometry",
      order: 2,
    });

    const topic1 = await ctx.db.insert("topics", {
      moduleId: mod1,
      name: "Linear Equations",
      description: "Solving one and two variable linear equations",
      order: 1,
    });
    await ctx.db.insert("topics", {
      moduleId: mod1,
      name: "Polynomials",
      description: "Operations on polynomials and factoring",
      order: 2,
    });
    await ctx.db.insert("topics", {
      moduleId: mod2,
      name: "Triangle Properties",
      description: "Congruence, similarity, and Pythagoras theorem",
      order: 1,
    });

    // ─── 9. Materials ─────────────────────────────────────────────
    await ctx.db.insert("materials", {
      topicId: topic1,
      title: "Linear Equations - Video Lecture",
      type: "link",
      url: "https://www.youtube.com/watch?v=example",
      description: "Introduction to solving linear equations",
      uploadedBy: teacherUserIds[0],
      order: 1,
    });

    // ─── 10. Test with 5 MCQ Questions (Class 8 Math) ─────────────
    const testId = await ctx.db.insert("tests", {
      subjectId: mathClass8,
      moduleId: mod1,
      title: "Algebra Unit Test 1",
      description: "Test covering linear equations and polynomials",
      durationMinutes: 30,
      totalMarks: 10,
      isPublished: true,
      createdBy: teacherUserIds[0],
    });

    const questions = [
      {
        question: "What is the solution of 2x + 3 = 7?",
        options: ["x = 1", "x = 2", "x = 3", "x = 4"],
        correctOptionIndex: 1,
        marks: 2,
      },
      {
        question: "If 3x - 5 = 10, what is x?",
        options: ["3", "4", "5", "6"],
        correctOptionIndex: 2,
        marks: 2,
      },
      {
        question: "Which is a polynomial of degree 2?",
        options: ["3x + 1", "x² + 2x + 1", "x³", "5"],
        correctOptionIndex: 1,
        marks: 2,
      },
      {
        question: "Factor: x² - 9",
        options: ["(x-3)(x+3)", "(x-9)(x+1)", "(x-3)²", "(x+3)²"],
        correctOptionIndex: 0,
        marks: 2,
      },
      {
        question: "Solve: x/2 + 3 = 7",
        options: ["x = 6", "x = 8", "x = 10", "x = 4"],
        correctOptionIndex: 1,
        marks: 2,
      },
    ];

    for (let i = 0; i < questions.length; i++) {
      await ctx.db.insert("testQuestions", {
        testId,
        ...questions[i],
        order: i + 1,
      });
    }

    // ─── 11. Attendance (last 5 school days, all sections) ────────
    const attendanceDates = [
      "2026-03-15", "2026-03-16", "2026-03-17", "2026-03-18", "2026-03-19",
    ];
    const statusPool: Array<"present" | "absent" | "late" | "excused"> = [
      "present", "present", "present", "present", "present",
      "present", "present", "present", "absent", "late",
    ];

    for (let si = 0; si < sectionMeta.length; si++) {
      const sec = sectionMeta[si];
      const students = studentsBySectionIdx[si];
      const teacherUserId = teacherUserIds[si % teacherUserIds.length];

      for (const date of attendanceDates) {
        for (let j = 0; j < students.length; j++) {
          // Deterministic but varied: mostly present, ~10% absent, ~10% late
          const hash = si * 1000 + j * 100 + parseInt(date.slice(-2));
          const status = statusPool[hash % statusPool.length];

          await ctx.db.insert("attendance", {
            studentId: students[j],
            sectionId: sec.sectionId,
            date,
            status,
            markedBy: teacherUserId,
          });
        }
      }
    }

    // ─── 12. Assignment ───────────────────────────────────────────
    await ctx.db.insert("assignments", {
      subjectId: mathClass8,
      sectionId: sectionMeta[4].sectionId, // Class 8-A
      title: "Algebra Homework - Linear Equations",
      description: "Solve problems 1-15 from Chapter 3",
      dueDate: "2026-04-01",
      totalMarks: 30,
      createdBy: teacherUserIds[0],
    });

    // ─── 13. Salary Records ───────────────────────────────────────
    for (let i = 0; i < teacherIds.length; i++) {
      await ctx.db.insert("salaryRecords", {
        teacherId: teacherIds[i],
        month: "2026-03",
        baseSalary: 35000,
        deductions: 2000,
        bonuses: i === 0 ? 3000 : 0,
        netSalary: 35000 - 2000 + (i === 0 ? 3000 : 0),
        status: i < 2 ? "paid" : "pending",
        paidAt: i < 2 ? Date.now() : undefined,
      });
    }

    // ─── 14. Welcome Notification ─────────────────────────────────
    await ctx.db.insert("notifications", {
      userId: adminUserId,
      type: "general",
      title: "Welcome to MeroSchool",
      message: "Your school management system is ready with demo data.",
      isRead: false,
    });

    return {
      school: "Surkhet Valley Academy",
      classes: grades.length,
      sections: sectionMeta.length,
      students: allStudentIds.length,
      teachers: teacherDefs.length,
      parents: parentIds.length,
      subjects: subjectDefs.length * grades.length,
      questions: questions.length,
      attendanceRecords: sectionMeta.length * attendanceDates.length * 5,
    };
  },
});
