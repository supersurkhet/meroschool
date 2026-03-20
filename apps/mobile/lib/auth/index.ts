import { createContext, useContext } from "react"
import { useQuery } from "convex/react"

export type UserRole = "student" | "teacher" | "parent" | "admin"

export interface ConvexUser {
	_id: string
	workosUserId: string
	name: string
	email: string
	role: UserRole
	avatarUrl?: string
	isActive: boolean
	schoolId?: string
}

export interface User {
	id: string
	convexId?: string
	email: string
	name: string
	role: UserRole
	schoolId?: string
	schoolName?: string
	avatarUrl?: string
	studentId?: string
	teacherId?: string
	parentId?: string
	sectionId?: string
	children?: { id: string; name: string; classId: string }[]
}

export interface AuthContextValue {
	user: User | null
	isLoading: boolean
	login: (email: string, password: string) => Promise<void>
	logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
	user: null,
	isLoading: true,
	login: async () => {},
	logout: async () => {},
})

export const useAuth = () => useContext(AuthContext)

// Role detection from email (for mock auth)
export function detectRole(email: string): UserRole {
	if (email.includes("teacher")) return "teacher"
	if (email.includes("parent")) return "parent"
	if (email.includes("admin")) return "admin"
	return "student"
}

// Mock user creation — will be replaced by WorkOS + Convex auth.currentUser
export function createMockUser(email: string): User {
	const role = detectRole(email)
	const names: Record<UserRole, string> = {
		student: "Ram Sharma",
		teacher: "Sita Devi Poudel",
		parent: "Krishna Bahadur Thapa",
		admin: "Admin User",
	}
	return {
		id: `user_${Math.random().toString(36).slice(2)}`,
		convexId: `mock_convex_${Math.random().toString(36).slice(2)}`,
		email,
		name: names[role],
		role,
		schoolId: "school_1",
		schoolName: "Saraswati Secondary School",
		// Mock IDs for Convex queries — in production these come from people.getStudentByUser etc.
		studentId: role === "student" ? "mock_student_id" : undefined,
		teacherId: role === "teacher" ? "mock_teacher_id" : undefined,
		parentId: role === "parent" ? "mock_parent_id" : undefined,
		sectionId: role === "student" ? "mock_section_id" : undefined,
		...(role === "parent" && {
			children: [
				{ id: "student_1", name: "Aarav Thapa", classId: "class_10a" },
			],
		}),
	}
}

/**
 * Hook to use Convex API with graceful fallback.
 * Returns the query result or undefined if not connected.
 */
export function useConvexQuery<T>(queryFn: any, args: any): T | undefined {
	try {
		return useQuery(queryFn, args) as T | undefined
	} catch {
		return undefined
	}
}
