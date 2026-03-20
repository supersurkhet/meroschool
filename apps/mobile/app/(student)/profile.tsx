import { View, Text, ScrollView, Pressable, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/lib/auth";
import { useTheme, roleColors } from "@/lib/theme";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { setStoredLanguage } from "@/lib/i18n";
import i18n from "@/lib/i18n";

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { colors, isDark, toggle } = useTheme();

  const toggleLanguage = () => {
    const next = i18n.language === "en" ? "ne" : "en";
    i18n.changeLanguage(next);
    setStoredLanguage(next);
  };

  if (!user) return null;

  const rc = roleColors[user.role];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader title={t("common.profile")} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        {/* Avatar & Info */}
        <Card>
          <View style={{ alignItems: "center", gap: 12, paddingVertical: 8 }}>
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: rc.accentLight,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 28, fontWeight: "700", color: rc.accent }}>
                {user.name.charAt(0)}
              </Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>{user.name}</Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>{user.email}</Text>
            <View style={{ backgroundColor: rc.accentLight, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: rc.accent }}>
                {t(`roles.${user.role}`)}
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: colors.textMuted }}>{user.schoolName}</Text>
          </View>
        </Card>

        {/* Settings */}
        <Card>
          <View style={{ gap: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>{t("common.settings")}</Text>

            {/* Dark Mode */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={colors.textSecondary} />
                <Text style={{ fontSize: 15, color: colors.text }}>{t("common.darkMode")}</Text>
              </View>
              <Switch value={isDark} onValueChange={toggle} trackColor={{ true: colors.primary }} />
            </View>

            {/* Language */}
            <Pressable
              onPress={toggleLanguage}
              style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Ionicons name="language" size={20} color={colors.textSecondary} />
                <Text style={{ fontSize: 15, color: colors.text }}>{t("common.language")}</Text>
              </View>
              <Text style={{ fontSize: 14, color: colors.primary, fontWeight: "600" }}>
                {i18n.language === "en" ? "English" : "नेपाली"}
              </Text>
            </Pressable>
          </View>
        </Card>

        {/* Logout */}
        <Button
          title={t("common.logout")}
          variant="danger"
          onPress={logout}
          icon={<Ionicons name="log-out-outline" size={18} color="#FFF" />}
        />
      </ScrollView>
    </View>
  );
}
