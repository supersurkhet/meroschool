import { useState, useCallback } from "react"
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth"
import { useTheme } from "@/lib/theme"
import { ScreenHeader } from "@/components/shared/ScreenHeader"
import { Card, StatCard } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"

const todaysClasses = [
	{ id: "1", class: "Class 10-A", subject: "Mathematics", time: "8:00-8:45", room: "Room 201", status: "completed" },
	{ id: "2", class: "Class 9-B", subject: "Mathematics", time: "9:00-9:45", room: "Room 105", status: "current" },
	{ id: "3", class: "Class 10-B", subject: "Mathematics", time: "11:00-11:45", room: "Room 203", status: "upcoming" },
	{ id: "4", class: "Class 8-A", subject: "Mathematics", time: "1:00-1:45", room: "Room 102", status: "upcoming" },
]

export default function TeacherDashboard() {
	const { t } = useTranslation()
	const { user } = useAuth()
	const { colors } = useTheme()
	const router = useRouter()
	const [refreshing, setRefreshing] = useState(false)

	const onRefresh = useCallback(() => {
		setRefreshing(true)
		setTimeout(() => setRefreshing(false), 1000)
	}, [])

	const statusColors: Record<string, { bg: string; text: string; label: string }> = {
		completed: { bg: colors.successLight, text: colors.success, label: "Done" },
		current: { bg: colors.primaryLight, text: colors.primary, label: "Now" },
		upcoming: { bg: colors.surfaceAlt, text: colors.textSecondary, label: "Upcoming" },
	}

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader
				title={`${t("common.welcome")}, ${user?.name?.split(" ")[0]}!`}
				subtitle={user?.schoolName}
				right={
					<Pressable
						onPress={() => router.push("/qr-scan" as any)}
						style={{
							width: 44,
							height: 44,
							borderRadius: 12,
							backgroundColor: "#EDE9FE",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Ionicons name="qr-code-outline" size={22} color="#7C3AED" />
					</Pressable>
				}
			/>
			<ScrollView
				contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
			>
				{/* Quick Stats */}
				<View style={{ flexDirection: "row", gap: 12 }}>
					<StatCard
						label={t("teacher.todaysClasses")}
						value={todaysClasses.length}
						icon={<Ionicons name="calendar" size={22} color="#7C3AED" />}
						bgColor="#EDE9FE"
					/>
					<StatCard
						label={t("teacher.totalStudents")}
						value={156}
						icon={<Ionicons name="people" size={22} color={colors.primary} />}
						bgColor={colors.primaryLight}
					/>
				</View>

				{/* Quick Actions */}
				<View>
					<Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 12 }}>
						{t("teacher.quickActions")}
					</Text>
					<View style={{ flexDirection: "row", gap: 10 }}>
						{[
							{ icon: "checkbox-outline" as const, label: t("teacher.markAttendance"), color: "#059669", bg: "#D1FAE5" },
							{ icon: "cloud-upload-outline" as const, label: t("teacher.uploadMaterial"), color: "#1A73E8", bg: "#E8F0FE" },
							{ icon: "create-outline" as const, label: t("teacher.createTest"), color: "#DC2626", bg: "#FEE2E2" },
						].map((action, i) => (
							<Pressable
								key={i}
								style={{
									flex: 1,
									backgroundColor: action.bg,
									borderRadius: 14,
									padding: 14,
									alignItems: "center",
									gap: 8,
								}}
							>
								<Ionicons name={action.icon} size={24} color={action.color} />
								<Text style={{ fontSize: 11, fontWeight: "600", color: action.color, textAlign: "center" }}>
									{action.label}
								</Text>
							</Pressable>
						))}
					</View>
				</View>

				{/* Today's Schedule */}
				<View>
					<Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 12 }}>
						{t("teacher.todaysClasses")}
					</Text>
					{todaysClasses.length === 0 ? (
						<EmptyState
							icon="calendar-outline"
							title="No Classes Today"
							subtitle="Enjoy your day off!"
						/>
					) : (
						todaysClasses.map((cls) => {
							const s = statusColors[cls.status]
							return (
								<Card key={cls.id} style={{ marginBottom: 10 }}>
									<View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
										<View style={{ width: 4, height: 48, borderRadius: 2, backgroundColor: s.text }} />
										<View style={{ flex: 1 }}>
											<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{cls.class}</Text>
											<Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
												{cls.subject} · {cls.room}
											</Text>
										</View>
										<View style={{ alignItems: "flex-end" }}>
											<Text style={{ fontSize: 13, fontWeight: "600", color: colors.text }}>{cls.time}</Text>
											<View style={{ backgroundColor: s.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 }}>
												<Text style={{ fontSize: 11, fontWeight: "600", color: s.text }}>{s.label}</Text>
											</View>
										</View>
									</View>
								</Card>
							)
						})
					)}
				</View>
			</ScrollView>
		</View>
	)
}
