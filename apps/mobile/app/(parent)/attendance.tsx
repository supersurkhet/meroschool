import { useState, useCallback, useMemo } from "react"
import { View, Text, ScrollView, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useTheme } from "@/lib/theme"
import { ScreenHeader } from "@/components/shared/ScreenHeader"
import { Card, StatCard } from "@/components/ui/Card"

type AttendanceStatus = "present" | "absent" | "late" | "weekend" | "none"

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December",
]

// Sample attendance data: day -> status
const attendanceData: Record<string, Record<number, AttendanceStatus>> = {
	"2026-03": {
		1: "present", 2: "present", 3: "present", 4: "present", 5: "present",
		6: "weekend", 7: "weekend",
		8: "present", 9: "present", 10: "late", 11: "present", 12: "present",
		13: "weekend", 14: "weekend",
		15: "absent", 16: "present", 17: "late", 18: "present", 19: "present",
		20: "present",
	},
	"2026-02": {
		1: "present", 2: "present", 3: "present", 4: "present", 5: "present",
		6: "weekend", 7: "weekend",
		8: "present", 9: "late", 10: "present", 11: "present", 12: "present",
		13: "weekend", 14: "weekend",
		15: "present", 16: "present", 17: "present", 18: "absent", 19: "present",
		20: "weekend", 21: "weekend",
		22: "present", 23: "present", 24: "present", 25: "late", 26: "present",
		27: "weekend", 28: "weekend",
	},
	"2026-01": {
		5: "present", 6: "present", 7: "present", 8: "present", 9: "present",
		10: "weekend", 11: "weekend",
		12: "present", 13: "present", 14: "absent", 15: "present", 16: "present",
		17: "weekend", 18: "weekend",
		19: "present", 20: "present", 21: "present", 22: "absent", 23: "present",
		24: "weekend", 25: "weekend",
		26: "present", 27: "present", 28: "present", 29: "absent", 30: "present",
		31: "weekend",
	},
}

function getMonthKey(year: number, month: number): string {
	return `${year}-${String(month + 1).padStart(2, "0")}`
}

function getDaysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number): number {
	return new Date(year, month, 1).getDay()
}

export default function ParentAttendanceScreen() {
	const { t } = useTranslation()
	const { colors } = useTheme()
	const [currentYear, setCurrentYear] = useState(2026)
	const [currentMonth, setCurrentMonth] = useState(2) // March (0-indexed)

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
	const monthData = attendanceData[monthKey] ?? {}
	const daysInMonth = getDaysInMonth(currentYear, currentMonth)
	const firstDay = getFirstDayOfWeek(currentYear, currentMonth)

	const statusColors: Record<AttendanceStatus, { bg: string; text: string }> = {
		present: { bg: colors.success, text: "#FFF" },
		absent: { bg: colors.danger, text: "#FFF" },
		late: { bg: colors.warning, text: "#000" },
		weekend: { bg: colors.surfaceAlt, text: colors.textMuted },
		none: { bg: "transparent", text: colors.textMuted },
	}

	const summary = useMemo(() => {
		const values = Object.values(monthData)
		const present = values.filter((v) => v === "present").length
		const absent = values.filter((v) => v === "absent").length
		const late = values.filter((v) => v === "late").length
		const schoolDays = present + absent + late
		const percentage = schoolDays > 0 ? Math.round((present / schoolDays) * 100) : 0
		return { present, absent, late, schoolDays, percentage }
	}, [monthData])

	// Build calendar grid
	const calendarCells: { day: number | null; status: AttendanceStatus }[] = useMemo(() => {
		const cells: { day: number | null; status: AttendanceStatus }[] = []
		// Empty cells before first day
		for (let i = 0; i < firstDay; i++) {
			cells.push({ day: null, status: "none" })
		}
		// Day cells
		for (let d = 1; d <= daysInMonth; d++) {
			const dayOfWeek = (firstDay + d - 1) % 7
			const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
			const status = monthData[d] ?? (isWeekend ? "weekend" : "none")
			cells.push({ day: d, status })
		}
		return cells
	}, [firstDay, daysInMonth, monthData])

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader title={t("parent.attendanceRecord")} subtitle="Aarav Thapa · Class 10-A" />

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
			</ScrollView>
		</View>
	)
}
