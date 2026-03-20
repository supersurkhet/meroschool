import { useState } from "react"
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useQuery } from "convex/react"
import { api } from "@/lib/convex/api"
import { useAuth } from "@/lib/auth"
import { useTheme } from "@/lib/theme"
import { ScreenHeader } from "@/components/shared/ScreenHeader"
import { Card, StatCard } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { EmptyState } from "@/components/ui/EmptyState"
import { SkeletonList } from "@/components/ui/Skeleton"

const ACCENT = "#059669"
const ACCENT_LIGHT = "#D1FAE5"

export default function ParentDashboard() {
	const { t } = useTranslation()
	const { user } = useAuth()
	const { colors } = useTheme()
	const router = useRouter()

	const [selectedChildIdx, setSelectedChildIdx] = useState(0)

	// Fetch parent record
	const parentRecord = useQuery(
		api.people.getParentByUser,
		user?.convexId ? { userId: user.convexId as any } : "skip",
	)

	// Fetch children list
	const parentId = parentRecord?._id ?? user?.parentId
	const childrenData = useQuery(
		api.people.getParentChildren,
		parentId ? { parentId: parentId as any } : "skip",
	)

	// Resolve children: prefer Convex data, fall back to user.children from auth
	const children: { id: string; name: string; classId?: string }[] =
		childrenData ?? user?.children ?? []

	const selectedChild = children[selectedChildIdx]
	const selectedChildId = selectedChild?.id

	// Per-child queries
	const progress = useQuery(
		api.progress.getStudentProgress,
		selectedChildId ? { studentId: selectedChildId as any } : "skip",
	)

	const unreadData = useQuery(
		api.notifications.unreadCount,
		user?.convexId ? { userId: user.convexId as any } : "skip",
	)

	const testAttempts = useQuery(
		api.tests.listAttemptsByStudent,
		selectedChildId ? { studentId: selectedChildId as any } : "skip",
	)

	const attendancePercentage = progress?.attendancePercentage ?? 0
	const avgScore = progress?.averageScore ?? 0
	const unreadNotifications = unreadData ?? 0

	// Recent test results: most recent 5
	const recentTestResults = testAttempts?.slice(0, 5) ?? []

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
			badge: unreadNotifications > 0 ? unreadNotifications : undefined,
		},
	]

	// Show loading spinner while fetching children list for the first time
	const childrenLoading = parentId !== undefined && childrenData === undefined
	const progressLoading = selectedChildId !== undefined && progress === undefined

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
				{childrenLoading ? (
					<ActivityIndicator color={colors.primary} />
				) : children.length > 1 ? (
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
				) : null}

				{/* Child Info Card */}
				{selectedChild ? (
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
									{selectedChild.name.charAt(0)}
								</Text>
							</View>
							<View>
								<Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
									{selectedChild.name}
								</Text>
								{(selectedChild as any).className ? (
									<Text style={{ fontSize: 13, color: colors.textSecondary }}>
										{(selectedChild as any).className}
									</Text>
								) : null}
							</View>
						</View>
					</Card>
				) : !childrenLoading && children.length === 0 ? (
					<EmptyState
						icon="people-outline"
						title="No Children Found"
						subtitle="No student records linked to your account."
					/>
				) : null}

				{/* Attendance & Score Stats */}
				{progressLoading ? (
					<ActivityIndicator color={colors.primary} />
				) : (
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
				)}

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
					{testAttempts === undefined ? (
						<SkeletonList count={3} />
					) : recentTestResults.length === 0 ? (
						<EmptyState
							icon="document-text-outline"
							title="No Test Results"
							subtitle="No tests have been taken yet."
						/>
					) : (
						recentTestResults.map((result: any) => {
							const score = result.score ?? 0
							const total = result.totalMarks ?? result.total ?? 100
							const scorePercent = total > 0 ? Math.round((score / total) * 100) : 0
							const scoreColor =
								scorePercent >= 80
									? colors.success
									: scorePercent >= 60
									? colors.warning
									: colors.danger
							const displayDate = result.completedAt
								? new Date(result.completedAt).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
									})
								: result.date ?? ""
							return (
								<Card key={result._id ?? result.id} style={{ marginBottom: 10 }}>
									<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
										<View style={{ flex: 1 }}>
											<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
												{result.testTitle ?? result.name ?? "Test"}
											</Text>
											<Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
												{displayDate}
											</Text>
										</View>
										<View style={{ alignItems: "flex-end" }}>
											<Text style={{ fontSize: 20, fontWeight: "700", color: scoreColor }}>
												{score}/{total}
											</Text>
											<Badge
												text={`${scorePercent}%`}
												variant={
													scorePercent >= 80
														? "success"
														: scorePercent >= 60
														? "warning"
														: "danger"
												}
											/>
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
