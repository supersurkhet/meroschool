import { View, Text, Pressable, type ViewStyle } from "react-native";
import { useTheme } from "@/lib/theme";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
}

export function Card({ children, onPress, style }: CardProps) {
  const { colors } = useTheme();
  const content = (
    <View
      style={[
        {
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          borderWidth: 1,
          borderColor: colors.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
  if (onPress) {
    return <Pressable onPress={onPress}>{content}</Pressable>;
  }
  return content;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  bgColor?: string;
  onPress?: () => void;
}

export function StatCard({ label, value, icon, color, bgColor, onPress }: StatCardProps) {
  const { colors } = useTheme();
  return (
    <Card onPress={onPress} style={{ flex: 1, minWidth: 140 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        {icon && (
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: bgColor ?? colors.primaryLight,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: color ?? colors.text,
            }}
          >
            {value}
          </Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
            {label}
          </Text>
        </View>
      </View>
    </Card>
  );
}
