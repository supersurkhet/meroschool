import { View, Text, ScrollView, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useAuth } from "@/lib/auth"
import { useTheme } from "@/lib/theme"
import { ScreenHeader } from "@/components/shared/ScreenHeader"
import { Card, StatCard } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
// Convex data hooks — uncomment when backend is wired up:
// import { useQuery, useMutation } from '@/lib/convex/hooks'
// import { api } from '../../../convex/_generated/api'

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

	// Convex query patterns — replace mock data when backend is available:
	// const attendance = useQuery(api.attendance.getStudentAttendance, { studentId: user?.id })
	// const tests = useQuery(api.tests.getStudentTestHistory, { studentId: user?.id })
	// const assignments = useQuery(api.assignments.getStudentAssignments, { studentId: user?.id })

	const attendancePercentage = 94

	const upcomingTests = [
		{ id: "1", subject: "Mathematics", date: "Mar 25", time: "10:00 AM", chapter: "Algebra" },
		{ id: "2", subject: "Science", date: "Mar 27", time: "11:00 AM", chapter: "Physics - Motion" },
		{ id: "3", subject: "English", date: "Mar 28", time: "9:00 AM", chapter: "Grammar" },
	]

	const pendingAssignments = [
		{ id: "1", title: "Quadratic Equations Practice", subject: "Mathematics", dueDate: "Mar 24", status: "pending" as const },
		{ id: "2", title: "Essay: My Village", subject: "English", dueDate: "Mar 26", status: "pending" as const },
		{ id: "3", title: "Lab Report: Acids & Bases", subject: "Science", dueDate: "Mar 29", status: "in-progress" as const },
	]

	const recentResults = [
		{ id: "1", subject: "Nepali", score: 85, total: 100, grade: "A", date: "Mar 18" },
		{ id: "2", subject: "Social Studies", score: 72, total: 100, grade: "B+", date: "Mar 15" },
		{ id: "3", subject: "Mathematics", score: 91, total: 100, grade: "A+", date: "Mar 12" },
	]

	const statusColors: Record<string, { bg: string; text: string; label: string }> = {
		"pending": { bg: colors.warningLight, text: colors.warning, label: "Pending" },
		"in-progress": { bg: colors.primaryLight, text: colors.primary, label: "In Progress" },
	}

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
								Class 10-A
							</Text>
						</View>
						<CircularProgress percentage={attendancePercentage} size={72} />
					</View>
				</Card>

				{/* Stats Row */}
				<View style={{ flexDirection: "row", gap: 12 }}>
					<StatCard
						label={t("student.attendanceRate")}
						value={`${attendancePercentage}%`}
						icon={<Ionicons name="checkmark-circle" size={22} color={colors.success} />}
						bgColor={colors.successLight}
					/>
					<StatCard
						label={t("student.upcomingTests")}
						value={upcomingTests.length}
						icon={<Ionicons name="document-text" size={22} color={colors.primary} />}
						bgColor={colors.primaryLight}
					/>
				</View>

				{/* Upcoming Tests */}
				<View>
					<Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 12 }}>
						{t("student.upcomingTests")}
					</Text>
					{upcomingTests.map((test) => (
						<Card key={test.id} style={{ marginBottom: 10 }}>
							<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
										{test.subject}
									</Text>
									<Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
										{test.chapter}
									</Text>
								</View>
								<View style={{ alignItems: "flex-end" }}>
									<Badge text={test.date} variant="primary" />
									<Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
										{test.time}
									</Text>
								</View>
							</View>
						</Card>
					))}
				</View>

				{/* Pending Assignments */}
				<View>
					<Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 12 }}>
						{t("student.assignments")} — {t("student.pending")}
					</Text>
					{pendingAssignments.map((assignment) => {
						const sc = statusColors[assignment.status]
						return (
							<Card key={assignment.id} style={{ marginBottom: 10 }}>
								<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
									<View style={{ flex: 1 }}>
										<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
											{assignment.title}
										</Text>
										<Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
											{assignment.subject}
										</Text>
									</View>
									<View style={{ alignItems: "flex-end", gap: 4 }}>
										<Badge text={assignment.dueDate} variant="warning" />
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
					{recentResults.map((result) => (
						<Card key={result.id} style={{ marginBottom: 10 }}>
							<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
								<View>
									<Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
										{result.subject}
									</Text>
									<Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
										{result.score}/{result.total} — {result.date}
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
										{result.grade}
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
