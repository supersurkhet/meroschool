import { createContext, useContext } from "react"

export type UserRole = "student" | "teacher" | "parent" | "admin"

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
