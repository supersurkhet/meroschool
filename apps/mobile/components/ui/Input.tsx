import { View, TextInput, Text, type TextInputProps } from "react-native";
import { useTheme } from "@/lib/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({ label, error, icon, style, ...props }: InputProps) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {label && (
        <Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>
          {label}
        </Text>
      )}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surface,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: error ? colors.danger : colors.border,
          paddingHorizontal: 14,
          height: 48,
          gap: 10,
        }}
      >
        {icon}
        <TextInput
          style={[
            {
              flex: 1,
              fontSize: 16,
              color: colors.text,
            },
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          {...props}
        />
      </View>
      {error && (
        <Text style={{ fontSize: 12, color: colors.danger }}>{error}</Text>
      )}
    </View>
  );
}
