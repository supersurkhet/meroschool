import { mutation } from "./_generated/server";

// Seed function to populate demo data for meroschool.
// Run once via Convex dashboard or `npx convex run seed:seed`
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingSchools = await ctx.db.query("schools").first();
    if (existingSchools) {
      throw new Error("Database already seeded. Clear data first.");
    }

    // ─── School ───────────────────────────────────────────────────
    const schoolId = await ctx.db.insert("schools", {
      name: "Surkhet Valley Academy",
      address: "Birendranagar-4, Surkhet, Nepal",
      phone: "9847012345",
      email: "info@surkhetvalley.edu.np",
      establishedYear: 2015,
    });

    // ─── Admin User ───────────────────────────────────────────────
    const adminUserId = await ctx.db.insert("users", {
      workosUserId: "demo_admin_001",
      name: "Ram Bahadur Shrestha",
      email: "admin@surkhetvalley.edu.np",
      role: "admin",
      isActive: true,
      schoolId,
    });

    // ─── Teachers ─────────────────────────────────────────────────
    const teacherData = [
      { name: "Sita Sharma", email: "sita@surkhetvalley.edu.np", dept: "Mathematics", empId: "T-001" },
      { name: "Krishna Adhikari", email: "krishna@surkhetvalley.edu.np", dept: "Science", empId: "T-002" },
      { name: "Gita Poudel", email: "gita@surkhetvalley.edu.np", dept: "English", empId: "T-003" },
      { name: "Hari Prasad Oli", email: "hari@surkhetvalley.edu.np", dept: "Nepali", empId: "T-004" },
    ];

    const teacherIds = [];
    const teacherUserIds = [];
    for (const t of teacherData) {
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

    // ─── Classes & Sections ───────────────────────────────────────
    const classConfigs = [
      { name: "Class 8", grade: 8, sections: ["A", "B"] },
      { name: "Class 9", grade: 9, sections: ["A", "B"] },
      { name: "Class 10", grade: 10, sections: ["A"] },
    ];

    const sectionMap: Record<string, any> = {};
    const classIds = [];

    for (const cc of classConfigs) {
      const classId = await ctx.db.insert("classes", {
        schoolId,
        name: cc.name,
        grade: cc.grade,
      });
      classIds.push(classId);

      for (const secName of cc.sections) {
        const sectionId = await ctx.db.insert("sections", {
          classId,
          name: secName,
        });
        sectionMap[`${cc.grade}-${secName}`] = { classId, sectionId };
      }
    }

    // ─── Parents ──────────────────────────────────────────────────
    const parentData = [
      { name: "Bishnu Thapa", email: "bishnu.parent@gmail.com", occupation: "Farmer" },
      { name: "Laxmi Bhandari", email: "laxmi.parent@gmail.com", occupation: "Teacher" },
      { name: "Mohan KC", email: "mohan.parent@gmail.com", occupation: "Business" },
      { name: "Durga Budha", email: "durga.parent@gmail.com", occupation: "Government" },
    ];

    const parentIds = [];
    for (let i = 0; i < parentData.length; i++) {
      const p = parentData[i];
      const userId = await ctx.db.insert("users", {
        workosUserId: `demo_parent_${i + 1}`,
        name: p.name,
        email: p.email,
        role: "parent",
        isActive: true,
      });
      const parentId = await ctx.db.insert("parents", {
        userId,
        occupation: p.occupation,
        address: "Birendranagar, Surkhet",
      });
      parentIds.push(parentId);
    }

    // ─── Students ─────────────────────────────────────────────────
    const studentData = [
      { name: "Anish Thapa", email: "anish@student.edu.np", section: "10-A", roll: "1001", dob: "2010-03-15", parentIdx: 0 },
      { name: "Priya Bhandari", email: "priya@student.edu.np", section: "10-A", roll: "1002", dob: "2010-07-22", parentIdx: 1 },
      { name: "Rajan KC", email: "rajan@student.edu.np", section: "10-A", roll: "1003", dob: "2010-01-08", parentIdx: 2 },
      { name: "Sunita Budha", email: "sunita@student.edu.np", section: "9-A", roll: "0901", dob: "2011-05-12", parentIdx: 3 },
      { name: "Bikash Thapa", email: "bikash@student.edu.np", section: "9-A", roll: "0902", dob: "2011-09-03", parentIdx: 0 },
      { name: "Manisha Bhandari", email: "manisha@student.edu.np", section: "9-B", roll: "0911", dob: "2011-11-20", parentIdx: 1 },
      { name: "Dipak KC", email: "dipak@student.edu.np", section: "8-A", roll: "0801", dob: "2012-02-14", parentIdx: 2 },
      { name: "Sarita Budha", email: "sarita@student.edu.np", section: "8-B", roll: "0812", dob: "2012-06-30", parentIdx: 3 },
    ];

    const studentIds = [];
    for (const s of studentData) {
      const sec = sectionMap[s.section];
      const userId = await ctx.db.insert("users", {
        workosUserId: `demo_student_${s.roll}`,
        name: s.name,
        email: s.email,
        role: "student",
        isActive: true,
        schoolId,
      });
      const studentId = await ctx.db.insert("students", {
        userId,
        sectionId: sec.sectionId,
        rollNumber: s.roll,
        dateOfBirth: s.dob,
        admissionDate: "2024-04-15",
        parentIds: [parentIds[s.parentIdx]],
      });
      studentIds.push(studentId);
    }

    // ─── Subjects (Class 10) ──────────────────────────────────────
    const class10Id = classIds[2];
    const subjectConfigs = [
      { name: "Mathematics", code: "MATH-10", teacherIdx: 0 },
      { name: "Science", code: "SCI-10", teacherIdx: 1 },
      { name: "English", code: "ENG-10", teacherIdx: 2 },
      { name: "Nepali", code: "NEP-10", teacherIdx: 3 },
    ];

    const subjectIds = [];
    for (const sub of subjectConfigs) {
      const subjectId = await ctx.db.insert("subjects", {
        classId: class10Id,
        name: sub.name,
        code: sub.code,
        teacherId: teacherIds[sub.teacherIdx],
      });
      subjectIds.push(subjectId);
    }

    // ─── Modules & Topics (Mathematics) ───────────────────────────
    const mathSubjectId = subjectIds[0];

    const mod1Id = await ctx.db.insert("modules", {
      subjectId: mathSubjectId,
      name: "Algebra",
      description: "Linear equations, polynomials, and factoring",
      order: 1,
    });
    const mod2Id = await ctx.db.insert("modules", {
      subjectId: mathSubjectId,
      name: "Geometry",
      description: "Triangles, circles, and coordinate geometry",
      order: 2,
    });

    const topic1Id = await ctx.db.insert("topics", {
      moduleId: mod1Id,
      name: "Linear Equations",
      description: "Solving one and two variable linear equations",
      order: 1,
    });
    await ctx.db.insert("topics", {
      moduleId: mod1Id,
      name: "Polynomials",
      description: "Operations on polynomials and factoring",
      order: 2,
    });
    await ctx.db.insert("topics", {
      moduleId: mod2Id,
      name: "Triangle Properties",
      description: "Congruence, similarity, and Pythagoras theorem",
      order: 1,
    });

    // ─── Materials ────────────────────────────────────────────────
    await ctx.db.insert("materials", {
      topicId: topic1Id,
      title: "Linear Equations - Video Lecture",
      type: "link",
      url: "https://www.youtube.com/watch?v=example",
      description: "Introduction to solving linear equations",
      uploadedBy: teacherUserIds[0],
      order: 1,
    });
    await ctx.db.insert("materials", {
      topicId: topic1Id,
      title: "Linear Equations Practice Problems",
      type: "link",
      url: "https://example.com/practice-linear-equations.pdf",
      description: "20 practice problems with solutions",
      uploadedBy: teacherUserIds[0],
      order: 2,
    });

    // ─── Test with MCQ Questions ──────────────────────────────────
    const testId = await ctx.db.insert("tests", {
      subjectId: mathSubjectId,
      moduleId: mod1Id,
      title: "Algebra Unit Test 1",
      description: "Test covering linear equations and polynomials",
      durationMinutes: 45,
      totalMarks: 20,
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
      {
        question: "What is the degree of 4x³ + 2x - 1?",
        options: ["1", "2", "3", "4"],
        correctOptionIndex: 2,
        marks: 2,
      },
      {
        question: "If y = 2x + 1, what is y when x = 3?",
        options: ["5", "6", "7", "8"],
        correctOptionIndex: 2,
        marks: 2,
      },
      {
        question: "Simplify: (x + 2)(x - 2)",
        options: ["x² - 4", "x² + 4", "x² - 2", "2x"],
        correctOptionIndex: 0,
        marks: 2,
      },
      {
        question: "Which equation has no solution?",
        options: ["x + 1 = 2", "0x = 5", "2x = 4", "x - x = 0"],
        correctOptionIndex: 1,
        marks: 2,
      },
      {
        question: "What is the sum of roots of x² - 5x + 6 = 0?",
        options: ["5", "6", "-5", "-6"],
        correctOptionIndex: 0,
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

    // ─── Assignment ───────────────────────────────────────────────
    const sec10A = sectionMap["10-A"];
    await ctx.db.insert("assignments", {
      subjectId: mathSubjectId,
      sectionId: sec10A.sectionId,
      title: "Algebra Homework - Linear Equations",
      description: "Solve problems 1-15 from Chapter 3",
      dueDate: "2026-04-01",
      totalMarks: 30,
      createdBy: teacherUserIds[0],
    });

    // ─── Attendance (last 5 days for Class 10-A) ──────────────────
    const statuses: Array<"present" | "absent" | "late"> = ["present", "absent", "late"];
    const class10Students = studentIds.slice(0, 3); // first 3 are Class 10-A
    const dates = ["2026-03-15", "2026-03-16", "2026-03-17", "2026-03-18", "2026-03-19"];

    for (const date of dates) {
      for (let i = 0; i < class10Students.length; i++) {
        // Mostly present, occasional absent/late
        const status = i === 1 && date === "2026-03-17" ? "absent" : (i === 2 && date === "2026-03-18" ? "late" : "present");
        await ctx.db.insert("attendance", {
          studentId: class10Students[i],
          sectionId: sec10A.sectionId,
          date,
          status,
          markedBy: teacherUserIds[0],
        });
      }
    }

    // ─── Salary Records ───────────────────────────────────────────
    for (let i = 0; i < teacherIds.length; i++) {
      await ctx.db.insert("salaryRecords", {
        teacherId: teacherIds[i],
        month: "2026-03",
        baseSalary: 35000,
        deductions: 2000,
        bonuses: i === 0 ? 3000 : 0, // bonus for math teacher
        netSalary: 35000 - 2000 + (i === 0 ? 3000 : 0),
        status: i < 2 ? "paid" : "pending",
        paidAt: i < 2 ? Date.now() : undefined,
      });
    }

    // ─── Welcome Notification ─────────────────────────────────────
    await ctx.db.insert("notifications", {
      userId: adminUserId,
      type: "general",
      title: "Welcome to MeroSchool",
      message: "Your school management system is ready. Start by reviewing the demo data.",
      isRead: false,
    });

    return {
      schoolId,
      totalUsers: 1 + teacherData.length + parentData.length + studentData.length,
      totalClasses: classConfigs.length,
      totalStudents: studentData.length,
      totalTeachers: teacherData.length,
      totalParents: parentData.length,
      totalSubjects: subjectConfigs.length,
      totalQuestions: questions.length,
    };
  },
});
