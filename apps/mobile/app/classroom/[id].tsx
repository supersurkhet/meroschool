import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/lib/theme";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type Tab = "materials" | "tests";

const classMaterials = [
  { id: "1", title: "Algebra Introduction", type: "video" as const, teacher: "Sita Devi", date: "Today" },
  { id: "2", title: "Practice Set - Linear Equations", type: "pdf" as const, teacher: "Sita Devi", date: "Yesterday" },
  { id: "3", title: "Khan Academy - Quadratics", type: "link" as const, teacher: "Sita Devi", date: "Mar 18" },
];

const classTests = [
  { id: "1", title: "Algebra Quick Quiz", questions: 10, duration: "15 min", status: "available" },
  { id: "2", title: "Chapter 5 Review", questions: 20, duration: "30 min", status: "upcoming" },
];

export default function ClassroomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("materials");

  const className = id?.replace("class_", "Class ").replace(/(\d+)(\w)/, "$1-$2").toUpperCase() ?? "Class";

  const typeIcons = {
    video: { icon: "videocam" as const, color: "#DC2626", bg: "#FEE2E2" },
    pdf: { icon: "document" as const, color: "#1A73E8", bg: "#E8F0FE" },
    link: { icon: "link" as const, color: "#059669", bg: "#D1FAE5" },
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScreenHeader
        title={t("qr.classSpace")}
        subtitle={`${className} · Mathematics`}
        right={
          <Pressable onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </Pressable>
        }
      />

      {/* Class info banner */}
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 12,
          padding: 16,
          backgroundColor: colors.primaryLight,
          borderRadius: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" }}>
          <Ionicons name="school" size={24} color="#FFF" />
        </View>
        <View>
          <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>{className}</Text>
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>Mathematics · Teacher: Sita Devi</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={{ flexDirection: "row", paddingHorizontal: 20, paddingTop: 16, gap: 8 }}>
        {(["materials", "tests"] as Tab[]).map((t2) => (
          <Pressable
            key={t2}
            onPress={() => setTab(t2)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 10,
              backgroundColor: tab === t2 ? colors.primary : colors.surfaceAlt,
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: tab === t2 ? "#FFF" : colors.textSecondary }}>
              {t2 === "materials" ? t("qr.classMaterials") : t("qr.classTests")}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 40 }}>
        {tab === "materials" &&
          classMaterials.map((mat) => {
            const cfg = typeIcons[mat.type];
            return (
              <Card key={mat.id} onPress={() => {}}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: cfg.bg, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name={cfg.icon} size={22} color={cfg.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{mat.title}</Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                      {mat.teacher} · {mat.date}
                    </Text>
                  </View>
                  <Badge text={mat.type.toUpperCase()} variant={mat.type === "video" ? "danger" : mat.type === "pdf" ? "primary" : "success"} />
                </View>
              </Card>
            );
          })}

        {tab === "tests" &&
          classTests.map((test) => (
            <Card key={test.id}>
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{test.title}</Text>
                  <Badge text={test.status} variant={test.status === "available" ? "success" : "default"} />
                </View>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                  {test.questions} questions · {test.duration}
                </Text>
              </View>
            </Card>
          ))}
      </ScrollView>
    </View>
  );
}
