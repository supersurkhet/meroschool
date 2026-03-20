import { useState, useCallback, useMemo } from "react"
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useQuery } from "convex/react"
import { api } from "@/lib/convex/api"
import { useAuth } from "@/lib/auth"
import { useTheme } from "@/lib/theme"
import { ScreenHeader } from "@/components/shared/ScreenHeader"
import { Card, StatCard } from "@/components/ui/Card"
import { EmptyState } from "@/components/ui/EmptyState"

type AttendanceStatus = "present" | "absent" | "late" | "weekend" | "none"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December",
]

function getMonthKey(year: number, month: number): string {
	return `${year}-${String(month + 1).padStart(2, "0")}`
}

function getDaysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
	return new Date(year, month, 1).getDay()
}

function getDateString(year: number, month: number, day: number): string {
	return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export default function ParentAttendanceScreen() {
	const { t } = useTranslation()
	const { user } = useAuth()
	const { colors } = useTheme()

	const now = new Date()
	const [currentYear, setCurrentYear] = useState(now.getFullYear())
	const [currentMonth, setCurrentMonth] = useState(now.getMonth())

	// Resolve studentId: parent sees first child (or auth-provided studentId for student role)
	const studentId =
		user?.children?.[0]?.id ?? user?.studentId

	const navigateMonth = useCallback((delta: number) => {
		setCurrentMonth((prev) => {
			let newMonth = prev + delta
			let newYear = currentYear
			if (newMonth < 0) {
				newMonth = 11
				newYear -= 1
			} else if (newMonth > 11) {
				newMonth = 0
				newYear += 1
			}
			setCurrentYear(newYear)
			return newMonth
		})
	}, [currentYear])

	const monthKey = getMonthKey(currentYear, currentMonth)

	// Date range for the full month
	const daysInMonth = getDaysInMonth(currentYear, currentMonth)
	const startDate = getDateString(currentYear, currentMonth, 1)
	const endDate = getDateString(currentYear, currentMonth, daysInMonth)

	// Monthly summary (present/absent/late counts + percentage)
	const monthlySummary = useQuery(
		api.attendance.monthlyStudentSummary,
		studentId ? { studentId: studentId as any, month: monthKey } : "skip",
	)

	// Per-day attendance for calendar rendering
	const attendanceRange = useQuery(
		api.attendance.getStudentAttendanceRange,
		studentId ? { studentId: studentId as any, startDate, endDate } : "skip",
	)

	// Build a day -> status map from the Convex range data
	const monthData: Record<number, AttendanceStatus> = useMemo(() => {
		if (!attendanceRange) return {}
		const map: Record<number, AttendanceStatus> = {}
		for (const record of attendanceRange) {
			// record.date is "YYYY-MM-DD", record.status is "present"|"absent"|"late"
			const day = parseInt(record.date.split("-")[2], 10)
			map[day] = record.status as AttendanceStatus
		}
		return map
	}, [attendanceRange])

	const firstDay = getFirstDayOfWeek(currentYear, currentMonth)

	const statusColors: Record<AttendanceStatus, { bg: string; text: string }> = {
		present: { bg: colors.success, text: "#FFF" },
		absent: { bg: colors.danger, text: "#FFF" },
		late: { bg: colors.warning, text: "#000" },
		weekend: { bg: colors.surfaceAlt, text: colors.textMuted },
		none: { bg: "transparent", text: colors.textMuted },
	}

	// Summary derived from Convex or computed locally from monthData
	const summary = useMemo(() => {
		if (monthlySummary) {
			const present = monthlySummary.present ?? 0
			const absent = monthlySummary.absent ?? 0
			const late = monthlySummary.late ?? 0
			const schoolDays = present + absent + late
			const percentage = monthlySummary.percentage ?? (schoolDays > 0 ? Math.round((present / schoolDays) * 100) : 0)
			return { present, absent, late, schoolDays, percentage }
		}
		// Fallback: compute from monthData
		const values = Object.values(monthData)
		const present = values.filter((v) => v === "present").length
		const absent = values.filter((v) => v === "absent").length
		const late = values.filter((v) => v === "late").length
		const schoolDays = present + absent + late
		const percentage = schoolDays > 0 ? Math.round((present / schoolDays) * 100) : 0
		return { present, absent, late, schoolDays, percentage }
	}, [monthlySummary, monthData])

	// Build calendar grid
	const calendarCells: { day: number | null; status: AttendanceStatus }[] = useMemo(() => {
		const cells: { day: number | null; status: AttendanceStatus }[] = []
		for (let i = 0; i < firstDay; i++) {
			cells.push({ day: null, status: "none" })
		}
		for (let d = 1; d <= daysInMonth; d++) {
			const dayOfWeek = (firstDay + d - 1) % 7
			const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
			const status = monthData[d] ?? (isWeekend ? "weekend" : "none")
			cells.push({ day: d, status })
		}
		return cells
	}, [firstDay, daysInMonth, monthData])

	const isLoading = studentId !== undefined && (attendanceRange === undefined || monthlySummary === undefined)

	// Resolve display name
	const childName = user?.children?.[0]?.name ?? user?.name ?? ""

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader
				title={t("parent.attendanceRecord")}
				subtitle={childName ? `${childName}` : undefined}
			/>

			<ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
				{/* Month Navigation */}
				<View
					style={{
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
						paddingVertical: 4,
					}}
				>
					<Pressable
						onPress={() => navigateMonth(-1)}
						style={{
							width: 40,
							height: 40,
							borderRadius: 12,
							backgroundColor: colors.surfaceAlt,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Ionicons name="chevron-back" size={20} color={colors.text} />
					</Pressable>
					<Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
						{MONTHS[currentMonth]} {currentYear}
					</Text>
					<Pressable
						onPress={() => navigateMonth(1)}
						style={{
							width: 40,
							height: 40,
							borderRadius: 12,
							backgroundColor: colors.surfaceAlt,
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<Ionicons name="chevron-forward" size={20} color={colors.text} />
					</Pressable>
				</View>

				{isLoading ? (
					<ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
				) : !studentId ? (
					<EmptyState
						icon="person-outline"
						title="No Student Selected"
						subtitle="No student record linked to your account."
					/>
				) : (
					<>
						{/* Calendar Grid */}
						<Card style={{ padding: 12 }}>
							{/* Day headers */}
							<View style={{ flexDirection: "row", marginBottom: 8 }}>
								{WEEKDAYS.map((day) => (
									<View key={day} style={{ flex: 1, alignItems: "center", paddingVertical: 4 }}>
										<Text style={{ fontSize: 12, fontWeight: "600", color: colors.textMuted }}>
											{day}
										</Text>
									</View>
								))}
							</View>

							{/* Calendar cells */}
							<View style={{ flexDirection: "row", flexWrap: "wrap" }}>
								{calendarCells.map((cell, index) => {
									if (cell.day === null) {
										return <View key={`empty-${index}`} style={{ width: "14.28%", aspectRatio: 1 }} />
									}
									const sc = statusColors[cell.status]
									const hasStatus = cell.status !== "none" && cell.status !== "weekend"
									return (
										<View
											key={cell.day}
											style={{
												width: "14.28%",
												aspectRatio: 1,
												padding: 2,
											}}
										>
											<View
												style={{
													flex: 1,
													borderRadius: 10,
													backgroundColor: hasStatus ? sc.bg : cell.status === "weekend" ? sc.bg : "transparent",
													alignItems: "center",
													justifyContent: "center",
													opacity: cell.status === "weekend" ? 0.6 : 1,
												}}
											>
												<Text
													style={{
														fontSize: 13,
														fontWeight: hasStatus ? "700" : "400",
														color: hasStatus ? sc.text : cell.status === "weekend" ? sc.text : colors.text,
													}}
												>
													{cell.day}
												</Text>
											</View>
										</View>
									)
								})}
							</View>
						</Card>

						{/* Legend */}
						<View style={{ flexDirection: "row", justifyContent: "center", gap: 16 }}>
							{[
								{ label: "Present", color: colors.success },
								{ label: "Absent", color: colors.danger },
								{ label: "Late", color: colors.warning },
								{ label: "Weekend", color: colors.surfaceAlt },
							].map((item) => (
								<View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
									<View
										style={{
											width: 12,
											height: 12,
											borderRadius: 3,
											backgroundColor: item.color,
										}}
									/>
									<Text style={{ fontSize: 11, color: colors.textSecondary }}>{item.label}</Text>
								</View>
							))}
						</View>

						{/* Monthly Summary */}
						<Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
							Monthly Summary
						</Text>
						<View style={{ flexDirection: "row", gap: 12 }}>
							<StatCard
								label="Attendance"
								value={`${summary.percentage}%`}
								icon={<Ionicons name="checkmark-circle" size={20} color={colors.success} />}
								bgColor={colors.successLight}
							/>
							<StatCard
								label="School Days"
								value={summary.schoolDays}
								icon={<Ionicons name="calendar" size={20} color={colors.primary} />}
								bgColor={colors.primaryLight}
							/>
						</View>

						<Card>
							<View style={{ gap: 10 }}>
								<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
									<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
										<View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success }} />
										<Text style={{ fontSize: 14, color: colors.text }}>Present</Text>
									</View>
									<Text style={{ fontSize: 14, fontWeight: "700", color: colors.success }}>
										{summary.present} days
									</Text>
								</View>
								<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
									<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
										<View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.danger }} />
										<Text style={{ fontSize: 14, color: colors.text }}>Absent</Text>
									</View>
									<Text style={{ fontSize: 14, fontWeight: "700", color: colors.danger }}>
										{summary.absent} days
									</Text>
								</View>
								<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
									<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
										<View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: colors.warning }} />
										<Text style={{ fontSize: 14, color: colors.text }}>Late</Text>
									</View>
									<Text style={{ fontSize: 14, fontWeight: "700", color: colors.warning }}>
										{summary.late} days
									</Text>
								</View>
								{/* Progress bar */}
								<View style={{ height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt, flexDirection: "row", overflow: "hidden", marginTop: 4 }}>
									{summary.schoolDays > 0 && (
										<>
											<View style={{ width: `${(summary.present / summary.schoolDays) * 100}%`, backgroundColor: colors.success }} />
											<View style={{ width: `${(summary.late / summary.schoolDays) * 100}%`, backgroundColor: colors.warning }} />
											<View style={{ width: `${(summary.absent / summary.schoolDays) * 100}%`, backgroundColor: colors.danger }} />
										</>
									)}
								</View>
							</View>
						</Card>
					</>
				)}
			</ScrollView>
		</View>
	)
}
