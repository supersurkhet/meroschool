import { createContext, useContext } from "react";
import type { UserRole } from "@/lib/theme";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  schoolId?: string;
  schoolName?: string;
  avatarUrl?: string;
  children?: { id: string; name: string; classId: string }[]; // for parents
}

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// Mock auth for development — replace with WorkOS integration
export function detectRole(email: string): UserRole {
  if (email.includes("teacher")) return "teacher";
  if (email.includes("parent")) return "parent";
  if (email.includes("admin")) return "admin";
  return "student";
}

export function createMockUser(email: string): User {
  const role = detectRole(email);
  const names: Record<UserRole, string> = {
    student: "Ram Sharma",
    teacher: "Sita Devi Poudel",
    parent: "Krishna Bahadur Thapa",
    admin: "Admin User",
  };
  return {
    id: `user_${Math.random().toString(36).slice(2)}`,
    email,
    name: names[role],
    role,
    schoolId: "school_1",
    schoolName: "Saraswati Secondary School",
    ...(role === "parent" && {
      children: [
        { id: "student_1", name: "Aarav Thapa", classId: "class_10a" },
      ],
    }),
  };
}
