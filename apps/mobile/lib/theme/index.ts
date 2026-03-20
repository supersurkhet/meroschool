import { createContext, useContext } from "react";

export type UserRole = "student" | "teacher" | "parent" | "admin";

export const colors = {
  light: {
    bg: "#FFFFFF",
    surface: "#F8FAFC",
    surfaceAlt: "#F1F5F9",
    text: "#0F172A",
    textSecondary: "#64748B",
    textMuted: "#94A3B8",
    border: "#E2E8F0",
    primary: "#1A73E8",
    primaryLight: "#E8F0FE",
    success: "#16A34A",
    successLight: "#DCFCE7",
    warning: "#EAB308",
    warningLight: "#FEF9C3",
    danger: "#DC2626",
    dangerLight: "#FEE2E2",
    card: "#FFFFFF",
    tabBar: "#FFFFFF",
    tabBarBorder: "#E2E8F0",
    tabActive: "#1A73E8",
    tabInactive: "#94A3B8",
  },
  dark: {
    bg: "#0F172A",
    surface: "#1E293B",
    surfaceAlt: "#334155",
    text: "#F8FAFC",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    border: "#334155",
    primary: "#60A5FA",
    primaryLight: "#1E3A5F",
    success: "#4ADE80",
    successLight: "#14532D",
    warning: "#FACC15",
    warningLight: "#422006",
    danger: "#F87171",
    dangerLight: "#450A0A",
    card: "#1E293B",
    tabBar: "#1E293B",
    tabBarBorder: "#334155",
    tabActive: "#60A5FA",
    tabInactive: "#64748B",
  },
} as const;

export type ThemeColors = {
  [K in keyof typeof colors.light]: string;
};

export const roleColors: Record<UserRole, { accent: string; accentLight: string }> = {
  student: { accent: "#1A73E8", accentLight: "#E8F0FE" },
  teacher: { accent: "#7C3AED", accentLight: "#EDE9FE" },
  parent: { accent: "#059669", accentLight: "#D1FAE5" },
  admin: { accent: "#DC2626", accentLight: "#FEE2E2" },
};

export interface ThemeContextValue {
  isDark: boolean;
  toggle: () => void;
  colors: ThemeColors;
}

export const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggle: () => {},
  colors: colors.light,
});

export const useTheme = () => useContext(ThemeContext);
