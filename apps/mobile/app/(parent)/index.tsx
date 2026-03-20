import { useState } from "react"
import { View, Text, ScrollView, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth"
import { useTheme } from "@/lib/theme"
import { ScreenHeader } from "@/components/shared/ScreenHeader"
import { Card, StatCard } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

const ACCENT = "#059669"
const ACCENT_LIGHT = "#D1FAE5"

export default function ParentDashboard() {
	const { t } = useTranslation()
	const { user } = useAuth()
	const { colors } = useTheme()
	const router = useRouter()

	// Mock children data
	const children = user?.children ?? [
		{ id: "student_1", name: "Aarav Thapa", classId: "class_10a" },
		{ id: "student_2", name: "Priya Thapa", classId: "class_7b" },
	]

	const [selectedChildIdx, setSelectedChildIdx] = useState(0)
	const selectedChild = children[selectedChildIdx]

	const attendancePercentage = selectedChildIdx === 0 ? 92 : 88
	const avgScore = selectedChildIdx === 0 ? 85 : 79
	const unreadNotifications = 3

	const recentTestResults = selectedChildIdx === 0
		? [
				{ id: "1", name: "Mathematics Mid-Term", score: 91, total: 100, date: "Mar 18" },
				{ id: "2", name: "Nepali Unit Test", score: 85, total: 100, date: "Mar 15" },
				{ id: "3", name: "Science Practical", score: 78, total: 100, date: "Mar 12" },
			]
		: [
				{ id: "1", name: "English Grammar", score: 82, total: 100, date: "Mar 17" },
				{ id: "2", name: "Mathematics Quiz", score: 75, total: 100, date: "Mar 14" },
			]

	const quickLinks = [
		{
			icon: "calendar-outline" as const,
			label: t("parent.attendance"),
			color: colors.primary,
			bg: colors.primaryLight,
			route: "/(parent)/attendance",
		},
		{
			icon: "trophy-outline" as const,
			label: t("parent.results"),
			color: ACCENT,
			bg: ACCENT_LIGHT,
			route: "/(parent)/results",
		},
		{
			icon: "notifications-outline" as const,
			label: t("parent.notifications"),
			color: colors.warning,
			bg: colors.warningLight,
			route: "/(parent)/notifications",
			badge: unreadNotifications,
		},
	]

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader
				title={t("parent.dashboard")}
				subtitle={user?.schoolName}
				right={
					<View style={{ position: "relative" }}>
						<Pressable
							onPress={() => router.push("/(parent)/notifications" as any)}
							style={{
								width: 44,
								height: 44,
								borderRadius: 12,
								backgroundColor: colors.warningLight,
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Ionicons name="notifications-outline" size={22} color={colors.warning} />
						</Pressable>
						{unreadNotifications > 0 && (
							<View
								style={{
									position: "absolute",
									top: -4,
									right: -4,
									width: 20,
									height: 20,
									borderRadius: 10,
									backgroundColor: colors.danger,
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Text style={{ fontSize: 11, fontWeight: "700", color: "#FFFFFF" }}>
									{unreadNotifications}
								</Text>
							</View>
						)}
					</View>
				}
			/>
			<ScrollView
				contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Child Selector */}
				{children.length > 1 && (
					<View style={{ flexDirection: "row", gap: 10 }}>
						{children.map((child, idx) => (
							<Pressable
								key={child.id}
								onPress={() => setSelectedChildIdx(idx)}
								style={{
									flex: 1,
									flexDirection: "row",
									alignItems: "center",
									gap: 10,
									backgroundColor: idx === selectedChildIdx ? ACCENT_LIGHT : colors.surface,
									borderWidth: 2,
									borderColor: idx === selectedChildIdx ? ACCENT : colors.border,
									borderRadius: 14,
									padding: 12,
								}}
							>
								<View
									style={{
										width: 36,
										height: 36,
										borderRadius: 18,
										backgroundColor: idx === selectedChildIdx ? ACCENT : colors.textMuted,
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Text style={{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" }}>
										{child.name.charAt(0)}
									</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text
										style={{
											fontSize: 14,
											fontWeight: "600",
											color: idx === selectedChildIdx ? ACCENT : colors.text,
										}}
										numberOfLines={1}
									>
										{child.name}
									</Text>
								</View>
							</Pressable>
						))}
					</View>
				)}

				{/* Child Info Card */}
				<Card style={{ borderLeftWidth: 4, borderLeftColor: ACCENT }}>
					<View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
						<View
							style={{
								width: 56,
								height: 56,
								borderRadius: 28,
								backgroundColor: ACCENT_LIGHT,
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Text style={{ fontSize: 22, fontWeight: "700", color: ACCENT }}>
								{selectedChild?.name?.charAt(0) ?? "A"}
							</Text>
						</View>
						<View>
							<Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
								{selectedChild?.name ?? "Aarav Thapa"}
							</Text>
							<Text style={{ fontSize: 13, color: colors.textSecondary }}>
								{selectedChildIdx === 0 ? "Class 10-A · Roll No: 15" : "Class 7-B · Roll No: 8"}
							</Text>
						</View>
					</View>
				</Card>

				{/* Attendance & Score Stats */}
				<View style={{ flexDirection: "row", gap: 12 }}>
					<StatCard
						label={t("parent.attendance")}
						value={`${attendancePercentage}%`}
						icon={<Ionicons name="checkmark-circle" size={22} color={colors.success} />}
						bgColor={colors.successLight}
					/>
					<StatCard
						label="Avg Score"
						value={`${avgScore}%`}
						icon={<Ionicons name="trending-up" size={22} color={ACCENT} />}
						bgColor={ACCENT_LIGHT}
					/>
				</View>

				{/* Quick Links Row */}
				<View style={{ flexDirection: "row", gap: 12 }}>
					{quickLinks.map((link) => (
						<Pressable
							key={link.label}
							onPress={() => router.push(link.route as any)}
							style={{
								flex: 1,
								alignItems: "center",
								backgroundColor: colors.card,
								borderRadius: 14,
								padding: 14,
								borderWidth: 1,
								borderColor: colors.border,
								position: "relative",
							}}
						>
							<View
								style={{
									width: 44,
									height: 44,
									borderRadius: 12,
									backgroundColor: link.bg,
									alignItems: "center",
									justifyContent: "center",
									marginBottom: 8,
								}}
							>
								<Ionicons name={link.icon} size={22} color={link.color} />
							</View>
							<Text
								style={{ fontSize: 12, fontWeight: "600", color: colors.text, textAlign: "center" }}
								numberOfLines={1}
							>
								{link.label}
							</Text>
							{link.badge ? (
								<View
									style={{
										position: "absolute",
										top: 6,
										right: 6,
										width: 18,
										height: 18,
										borderRadius: 9,
										backgroundColor: colors.danger,
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Text style={{ fontSize: 10, fontWeight: "700", color: "#FFFFFF" }}>
										{link.badge}
									</Text>
								</View>
							) : null}
						</Pressable>
					))}
				</View>

				{/* Recent Test Results */}
				<View>
					<Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 12 }}>
						{t("parent.testScores")}
					</Text>
					{recentTestResults.map((result) => {
						const scorePercent = Math.round((result.score / result.total) * 100)
						const scoreColor = scorePercent >= 80 ? colors.success : scorePercent >= 60 ? colors.warning : colors.danger
						return (
							<Card key={result.id} style={{ marginBottom: 10 }}>
								<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
									<View style={{ flex: 1 }}>
										<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
											{result.name}
										</Text>
										<Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
											{result.date}
										</Text>
									</View>
									<View style={{ alignItems: "flex-end" }}>
										<Text style={{ fontSize: 20, fontWeight: "700", color: scoreColor }}>
											{result.score}/{result.total}
										</Text>
										<Badge
											text={`${scorePercent}%`}
											variant={scorePercent >= 80 ? "success" : scorePercent >= 60 ? "warning" : "danger"}
										/>
									</View>
								</View>
							</Card>
						)
					})}
				</View>

				{/* Recent Activity */}
				<View>
					<Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 12 }}>
						Recent Activity
					</Text>
					{[
						{ icon: "checkmark-circle-outline" as const, text: "Attendance marked: Present", time: "Today 8:00 AM", color: colors.success },
						{ icon: "document-text-outline" as const, text: `Scored 85/100 in Nepali Test`, time: "Yesterday", color: colors.primary },
						{ icon: "clipboard-outline" as const, text: "Submitted Math Assignment", time: "2 days ago", color: "#7C3AED" },
						{ icon: "alert-circle-outline" as const, text: "Absent from school", time: "Mar 15", color: colors.danger },
					].map((activity, i) => (
						<Card key={i} style={{ marginBottom: 8 }}>
							<View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
								<View
									style={{
										width: 40,
										height: 40,
										borderRadius: 10,
										backgroundColor: activity.color + "18",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Ionicons name={activity.icon} size={20} color={activity.color} />
								</View>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>
										{activity.text}
									</Text>
									<Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 2 }}>
										{activity.time}
									</Text>
								</View>
							</View>
						</Card>
					))}
				</View>
			</ScrollView>
		</View>
	)
}
