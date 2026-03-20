import { View, Text } from "react-native";
import { useTheme } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon = "document-text-outline", title, subtitle }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
      <Ionicons name={icon} size={56} color={colors.textMuted} />
      <Text
        style={{
          fontSize: 17,
          fontWeight: "600",
          color: colors.text,
          marginTop: 16,
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          style={{
            fontSize: 14,
            color: colors.textSecondary,
            marginTop: 6,
            textAlign: "center",
          }}
        >
          {subtitle}
        </Text>
      )}
    </View>
  );
}
