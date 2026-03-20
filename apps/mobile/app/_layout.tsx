import { useEffect, useState, useCallback } from "react";
import { useColorScheme } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "@/lib/auth";
import { AuthProvider } from "@/lib/auth/provider";
import { ConvexProviderWrapper } from "@/lib/convex/provider";
import { ThemeContext, colors } from "@/lib/theme";
import "@/lib/i18n";

const THEME_KEY = "@meroschool/theme";

function RootNavigator() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === "(auth)";
    if (!user && !inAuth) {
      router.replace("/(auth)/login");
    } else if (user && inAuth) {
      // Role-based routing: redirect to the correct tab group
      const route = `/(${user.role})` as const;
      router.replace(route as any);
    }
  }, [user, segments, isLoading]);

  return null;
}

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === "dark");

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((v) => {
      if (v !== null) setIsDark(v === "dark");
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(THEME_KEY, next ? "dark" : "light");
      return next;
    });
  }, []);

  const theme = isDark ? colors.dark : colors.light;

  return (
    <ConvexProviderWrapper>
      <SafeAreaProvider>
        <ThemeContext.Provider value={{ isDark, toggle: toggleTheme, colors: theme }}>
          <AuthProvider>
            <RootNavigator />
            <StatusBar style={isDark ? "light" : "dark"} />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.bg },
                animation: "fade",
              }}
            />
          </AuthProvider>
        </ThemeContext.Provider>
      </SafeAreaProvider>
    </ConvexProviderWrapper>
  );
}
