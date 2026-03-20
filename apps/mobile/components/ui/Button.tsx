import { Pressable, Text, ActivityIndicator, type ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading,
  disabled,
  icon,
  style,
}: ButtonProps) {
  const { colors } = useTheme();

  const heights = { sm: 36, md: 44, lg: 52 };
  const fontSizes = { sm: 13, md: 15, lg: 17 };

  const bgColors = {
    primary: colors.primary,
    secondary: colors.surfaceAlt,
    outline: "transparent",
    ghost: "transparent",
    danger: colors.danger,
  };
  const textColors = {
    primary: "#FFFFFF",
    secondary: colors.text,
    outline: colors.primary,
    ghost: colors.primary,
    danger: "#FFFFFF",
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          height: heights[size],
          backgroundColor: bgColors[variant],
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
          gap: 8,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          ...(variant === "outline" && {
            borderWidth: 1.5,
            borderColor: colors.primary,
          }),
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={{
              fontSize: fontSizes[size],
              fontWeight: "600",
              color: textColors[variant],
            }}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}
