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

function CircularProgress({ percentage, size = 80 }: { percentage: number; size?: number }) {
	const { colors } = useTheme()
	const strokeWidth = 6
	const radius = (size - strokeWidth) / 2
	return (
		<View
			style={{
				width: size,
				height: size,
				borderRadius: size / 2,
				borderWidth: strokeWidth,
				borderColor: colors.successLight,
				alignItems: "center",
				justifyContent: "center",
				position: "relative",
			}}
		>
			{/* Filled arc approximation using a colored border overlay */}
			<View
				style={{
					position: "absolute",
					width: size,
					height: size,
					borderRadius: size / 2,
					borderWidth: strokeWidth,
					borderColor: colors.success,
					borderTopColor: percentage >= 25 ? colors.success : "transparent",
					borderRightColor: percentage >= 50 ? colors.success : "transparent",
					borderBottomColor: percentage >= 75 ? colors.success : "transparent",
					borderLeftColor: percentage >= 100 ? colors.success : "transparent",
				}}
			/>
			<Text style={{ fontSize: 18, fontWeight: "800", color: colors.success }}>
				{percentage}%
			</Text>
		</View>
	)
}

export default function StudentDashboard() {
	const { t } = useTranslation()
	const { user } = useAuth()
	const { colors } = useTheme()
	const router = useRouter()

	const progress = useQuery(
		api.progress.getStudentProgress,
		user?.studentId ? { studentId: user.studentId as any } : "skip"
	)

	const testHistory = useQuery(
		api.tests.getStudentTestHistory,
		user?.studentId ? { studentId: user.studentId as any } : "skip"
	)

	const assignmentsData = useQuery(
		api.assignments.getStudentAssignments,
		user?.studentId && user?.sectionId
			? { studentId: user.studentId as any, sectionId: user.sectionId as any }
			: "skip"
	)

	const attendancePercentage = progress?.attendancePercentage ?? 0

	// Filter to only pending/in-progress assignments
	const pendingAssignments = (assignmentsData ?? []).filter(
		(a: any) => a.submissionStatus === "pending" || a.submissionStatus === "in-progress"
	)

	// Recent results from test history
	const recentResults = (testHistory ?? []).slice(0, 5)

	const statusColors: Record<string, { bg: string; text: string; label: string }> = {
		"pending": { bg: colors.warningLight, text: colors.warning, label: "Pending" },
		"in-progress": { bg: colors.primaryLight, text: colors.primary, label: "In Progress" },
	}

	const isLoading = progress === undefined || testHistory === undefined || assignmentsData === undefined

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader
				title={`Namaste, ${user?.name?.split(" ")[0] ?? "Student"}!`}
				subtitle={user?.schoolName}
				right={
					<Pressable
						onPress={() => router.push("/qr-scan" as any)}
						style={{
							width: 44,
							height: 44,
							borderRadius: 12,
							backgroundColor: colors.primaryLight,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Ionicons name="qr-code-outline" size={22} color={colors.primary} />
					</Pressable>
				}
			/>
			<ScrollView
				contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
			>
				{/* Greeting + Attendance Card */}
				<Card>
					<View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
						{/* Avatar placeholder */}
						<View
							style={{
								width: 56,
								height: 56,
								borderRadius: 28,
								backgroundColor: colors.primaryLight,
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Text style={{ fontSize: 22, fontWeight: "700", color: colors.primary }}>
								{user?.name?.charAt(0) ?? "S"}
							</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
								{user?.name ?? "Student"}
							</Text>
							<Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
								{progress?.sectionName ?? "—"}
							</Text>
						</View>
						{isLoading ? (
							<ActivityIndicator size="small" color={colors.primary} />
						) : (
							<CircularProgress percentage={attendancePercentage} size={72} />
						)}
					</View>
				</Card>

				{/* Stats Row */}
				<View style={{ flexDirection: "row", gap: 12 }}>
					<StatCard
						label={t("student.attendanceRate")}
						value={isLoading ? "—" : `${attendancePercentage}%`}
						icon={<Ionicons name="checkmark-circle" size={22} color={colors.success} />}
						bgColor={colors.successLight}
					/>
					<StatCard
						label={t("student.upcomingTests")}
						value={isLoading ? "—" : (progress?.upcomingTestCount ?? 0)}
						icon={<Ionicons name="document-text" size={22} color={colors.primary} />}
						bgColor={colors.primaryLight}
					/>
				</View>

				{/* Pending Assignments */}
				<View>
					<Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 12 }}>
						{t("student.assignments")} — {t("student.pending")}
					</Text>

					{assignmentsData === undefined && (
						<ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />
					)}

					{assignmentsData !== undefined && pendingAssignments.length === 0 && (
						<Card>
							<Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: "center", paddingVertical: 8 }}>
								No pending assignments
							</Text>
						</Card>
					)}

					{pendingAssignments.map((assignment: any) => {
						const sc = statusColors[assignment.submissionStatus] ?? statusColors["pending"]
						return (
							<Card key={assignment._id} style={{ marginBottom: 10 }}>
								<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
									<View style={{ flex: 1 }}>
										<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
											{assignment.title}
										</Text>
										<Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
											{assignment.subjectName ?? assignment.subject}
										</Text>
									</View>
									<View style={{ alignItems: "flex-end", gap: 4 }}>
										<Badge text={assignment.dueDate ?? assignment.dueDateLabel ?? "—"} variant="warning" />
										<View
											style={{
												backgroundColor: sc.bg,
												paddingHorizontal: 8,
												paddingVertical: 2,
												borderRadius: 6,
											}}
										>
											<Text style={{ fontSize: 11, fontWeight: "600", color: sc.text }}>
												{sc.label}
											</Text>
										</View>
									</View>
								</View>
							</Card>
						)
					})}
				</View>

				{/* Recent Test Scores */}
				<View>
					<Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 12 }}>
						{t("student.recentResults")}
					</Text>

					{testHistory === undefined && (
						<ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 16 }} />
					)}

					{testHistory !== undefined && recentResults.length === 0 && (
						<Card>
							<Text style={{ fontSize: 14, color: colors.textSecondary, textAlign: "center", paddingVertical: 8 }}>
								No test results yet
							</Text>
						</Card>
					)}

					{recentResults.map((result: any) => (
						<Card key={result._id ?? result.id} style={{ marginBottom: 10 }}>
							<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
								<View>
									<Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
										{result.subjectName ?? result.subject}
									</Text>
									<Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
										{result.score}/{result.totalMarks ?? result.total} — {result.submittedAt ?? result.date}
									</Text>
								</View>
								<View
									style={{
										width: 44,
										height: 44,
										borderRadius: 22,
										backgroundColor: colors.successLight,
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Text style={{ fontSize: 16, fontWeight: "700", color: colors.success }}>
										{result.grade ?? `${Math.round(((result.score ?? 0) / (result.totalMarks ?? result.total ?? 100)) * 100)}%`}
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
