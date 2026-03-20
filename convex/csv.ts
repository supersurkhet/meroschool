import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth, requireRole } from "./helpers";

// Bulk enroll students from CSV data
export const bulkEnrollStudents = mutation({
	args: {
		students: v.array(
			v.object({
				name: v.string(),
				email: v.string(),
				rollNumber: v.string(),
				sectionId: v.id("sections"),
				dateOfBirth: v.optional(v.string()),
				admissionDate: v.optional(v.string()),
			})
		),
		schoolId: v.id("schools"),
	},
	handler: async (ctx, args) => {
		await requireRole(ctx, "admin");
		const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
		for (const s of args.students) {
			if (!emailFormat.test(s.email)) {
				throw new Error(`Invalid email format: ${s.email}`);
			}
			if (s.dateOfBirth && !dateFormat.test(s.dateOfBirth)) {
				throw new Error(`Invalid date format for dateOfBirth: ${s.dateOfBirth}. Expected YYYY-MM-DD`);
			}
			if (s.admissionDate && !dateFormat.test(s.admissionDate)) {
				throw new Error(`Invalid date format for admissionDate: ${s.admissionDate}. Expected YYYY-MM-DD`);
			}
		}
		const ids = [];
		for (const s of args.students) {
			// Create user record
			const userId = await ctx.db.insert("users", {
				workosUserId: `csv_${s.email}_${Date.now()}`,
				name: s.name,
				email: s.email,
				role: "student",
				isActive: true,
				schoolId: args.schoolId,
			});

			// Create student record
			const studentId = await ctx.db.insert("students", {
				userId,
				sectionId: s.sectionId,
				rollNumber: s.rollNumber,
				dateOfBirth: s.dateOfBirth,
				admissionDate: s.admissionDate,
			});

			ids.push(studentId);
		}
		return ids;
	},
});

// Bulk create teachers from CSV data
export const bulkCreateTeachers = mutation({
	args: {
		teachers: v.array(
			v.object({
				name: v.string(),
				email: v.string(),
				department: v.optional(v.string()),
				employeeId: v.optional(v.string()),
			})
		),
		schoolId: v.id("schools"),
	},
	handler: async (ctx, args) => {
		await requireRole(ctx, "admin");
		const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		for (const t of args.teachers) {
			if (!emailFormat.test(t.email)) {
				throw new Error(`Invalid email format: ${t.email}`);
			}
		}
		const ids = [];
		for (const t of args.teachers) {
			// Create user record
			const userId = await ctx.db.insert("users", {
				workosUserId: `csv_${t.email}_${Date.now()}`,
				name: t.name,
				email: t.email,
				role: "teacher",
				isActive: true,
				schoolId: args.schoolId,
			});

			// Create teacher record
			const teacherId = await ctx.db.insert("teachers", {
				userId,
				schoolId: args.schoolId,
				employeeId: t.employeeId ?? `EMP-${Date.now()}`,
				department: t.department,
			});

			ids.push(teacherId);
		}
		return ids;
	},
});

// Export all students for a school with section/class/email info
export const exportStudents = query({
	args: { schoolId: v.id("schools") },
	handler: async (ctx, args) => {
		await requireAuth(ctx);
		// Get all classes for the school
		const classes = await ctx.db
			.query("classes")
			.withIndex("by_school", (q) => q.eq("schoolId", args.schoolId))
			.collect();

		const results = [];

		for (const cls of classes) {
			const sections = await ctx.db
				.query("sections")
				.withIndex("by_class", (q) => q.eq("classId", cls._id))
				.collect();

			for (const section of sections) {
				const students = await ctx.db
					.query("students")
					.withIndex("by_section", (q) => q.eq("sectionId", section._id))
					.collect();

				for (const student of students) {
					const user = await ctx.db.get(student.userId);
					results.push({
						name: user?.name ?? "Unknown",
						email: user?.email ?? "Unknown",
						rollNumber: student.rollNumber,
						className: cls.name,
						sectionName: section.name,
						dateOfBirth: student.dateOfBirth ?? "",
						admissionDate: student.admissionDate ?? "",
					});
				}
			}
		}

		return results;
	},
});

// Export attendance records for a section and date range with student names
export const exportAttendance = query({
	args: {
		sectionId: v.id("sections"),
		startDate: v.string(),
		endDate: v.string(),
	},
	handler: async (ctx, args) => {
		await requireAuth(ctx);
		const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
		if (!dateFormat.test(args.startDate) || !dateFormat.test(args.endDate)) {
			throw new Error("Invalid date format. Expected YYYY-MM-DD");
		}

		const records = await ctx.db
			.query("attendance")
			.withIndex("by_section", (q) => q.eq("sectionId", args.sectionId))
			.filter((q) =>
				q.and(
					q.gte(q.field("date"), args.startDate),
					q.lte(q.field("date"), args.endDate)
				)
			)
			.take(1000);

		return Promise.all(
			records.map(async (r) => {
				const student = await ctx.db.get(r.studentId);
				const user = student ? await ctx.db.get(student.userId) : null;
				return {
					date: r.date,
					studentName: user?.name ?? "Unknown",
					rollNumber: student?.rollNumber ?? "Unknown",
					status: r.status,
				};
			})
		);
	},
});
