import { useState, useCallback, useEffect } from "react"
import { View, Text, FlatList, Pressable, Alert, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex/api"
import { useAuth } from "@/lib/auth"
import { useTheme } from "@/lib/theme"
import { ScreenHeader } from "@/components/shared/ScreenHeader"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/EmptyState"
import { SkeletonList } from "@/components/ui/Skeleton"

type AttendanceStatus = "present" | "absent" | "late"

function toYMD(date: Date): string {
	const y = date.getFullYear()
	const m = String(date.getMonth() + 1).padStart(2, "0")
	const d = String(date.getDate()).padStart(2, "0")
	return `${y}-${m}-${d}`
}

function formatDate(date: Date): string {
	return date.toLocaleDateString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
	})
}

export default function AttendanceScreen() {
	const { t } = useTranslation()
	const { user } = useAuth()
	const { colors } = useTheme()
	const [currentDate, setCurrentDate] = useState(new Date())
	const [attendance, setAttendance] = useState<Record<string, AttendanceStatus | null>>({})
	const [submitting, setSubmitting] = useState(false)

	const sectionId = user?.sectionId as any

	const students = useQuery(
		api.people.listStudentsBySection,
		sectionId ? { sectionId } : "skip"
	)

	const existingRecords = useQuery(
		api.attendance.getBySectionDate,
		sectionId ? { sectionId, date: toYMD(currentDate) } : "skip"
	)

	const markBulk = useMutation(api.attendance.markBulk)

	// Seed local attendance state from existing records whenever date or records change
	useEffect(() => {
		if (!students) return
		const base: Record<string, AttendanceStatus | null> = Object.fromEntries(
			students.map((s: any) => [s._id, null])
		)
		if (existingRecords) {
			for (const rec of existingRecords as any[]) {
				base[rec.studentId] = rec.status as AttendanceStatus
			}
		}
		setAttendance(base)
	}, [students, existingRecords, currentDate])

	const markStudent = useCallback((id: string, status: AttendanceStatus) => {
		setAttendance((prev) => ({
			...prev,
			[id]: prev[id] === status ? null : status,
		}))
	}, [])

	const markAllPresent = useCallback(() => {
		if (!students) return
		setAttendance(Object.fromEntries(students.map((s: any) => [s._id, "present" as const])))
	}, [students])

	const changeDate = useCallback((delta: number) => {
		setCurrentDate((prev) => {
			const next = new Date(prev)
			next.setDate(next.getDate() + delta)
			return next
		})
	}, [])

	const resetToToday = useCallback(() => {
		setCurrentDate(new Date())
	}, [])

	const studentList: any[] = students ?? []

	const counts = {
		present: Object.values(attendance).filter((v) => v === "present").length,
		absent: Object.values(attendance).filter((v) => v === "absent").length,
		late: Object.values(attendance).filter((v) => v === "late").length,
		total: studentList.length,
		marked: Object.values(attendance).filter((v) => v !== null).length,
	}

	const handleSubmit = useCallback(async () => {
		if (counts.marked === 0) {
			Alert.alert("No Data", "Please mark attendance for at least one student.")
			return
		}
		Alert.alert(
			"Submit Attendance",
			`Submit attendance?\n\nPresent: ${counts.present}\nAbsent: ${counts.absent}\nLate: ${counts.late}\nUnmarked: ${counts.total - counts.marked}`,
			[
				{ text: t("common.cancel"), style: "cancel" },
				{
					text: t("common.submit"),
					onPress: async () => {
						setSubmitting(true)
						try {
							const records = Object.entries(attendance)
								.filter(([, status]) => status !== null)
								.map(([studentId, status]) => ({ studentId, status: status! }))
							await markBulk({
								sectionId,
								date: toYMD(currentDate),
								records,
							} as any)
							Alert.alert("Success", `Attendance submitted for ${formatDate(currentDate)}.`, [{ text: "OK" }])
						} catch (err: any) {
							Alert.alert("Error", err?.message ?? "Failed to submit attendance.")
						} finally {
							setSubmitting(false)
						}
					},
				},
			]
		)
	}, [counts, attendance, currentDate, sectionId, markBulk, t])

	const statusButtons: { status: AttendanceStatus; label: string; activeColor: string; activeBg: string }[] = [
		{ status: "present", label: "P", activeColor: colors.success, activeBg: colors.successLight },
		{ status: "absent", label: "A", activeColor: colors.danger, activeBg: colors.dangerLight },
		{ status: "late", label: "L", activeColor: colors.warning, activeBg: colors.warningLight },
	]

	const renderStudent = useCallback(
		({ item }: { item: any }) => (
			<View
				style={{
					backgroundColor: colors.card,
					borderRadius: 14,
					padding: 12,
					marginHorizontal: 20,
					marginBottom: 6,
					borderWidth: 1,
					borderColor: colors.border,
					flexDirection: "row",
					alignItems: "center",
					gap: 10,
				}}
			>
				<View
					style={{
						width: 32,
						height: 32,
						borderRadius: 16,
						backgroundColor: colors.surfaceAlt,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSecondary }}>
						{item.rollNumber ?? item.roll ?? "—"}
					</Text>
				</View>
				<Text style={{ flex: 1, fontSize: 15, fontWeight: "500", color: colors.text }}>
					{item.name ?? item.user?.name ?? "Unknown"}
				</Text>
				<View style={{ flexDirection: "row", gap: 6 }}>
					{statusButtons.map((btn) => {
						const isActive = attendance[item._id] === btn.status
						return (
							<Pressable
								key={btn.status}
								onPress={() => markStudent(item._id, btn.status)}
								style={{
									width: 36,
									height: 36,
									borderRadius: 10,
									backgroundColor: isActive ? btn.activeBg : colors.surface,
									alignItems: "center",
									justifyContent: "center",
									borderWidth: 1.5,
									borderColor: isActive ? btn.activeColor : colors.border,
								}}
							>
								<Text
									style={{
										fontSize: 13,
										fontWeight: "700",
										color: isActive ? btn.activeColor : colors.textMuted,
									}}
								>
									{btn.label}
								</Text>
							</Pressable>
						)
					})}
				</View>
			</View>
		),
		[attendance, colors, markStudent, statusButtons]
	)

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader title={t("teacher.markAttendance")} />

			{/* Date Navigator */}
			<View
				style={{
					flexDirection: "row",
					alignItems: "center",
					justifyContent: "center",
					paddingHorizontal: 20,
					paddingVertical: 8,
					gap: 12,
				}}
			>
				<Pressable
					onPress={() => changeDate(-1)}
					style={{
						width: 36,
						height: 36,
						borderRadius: 10,
						backgroundColor: colors.surfaceAlt,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Ionicons name="chevron-back" size={18} color={colors.text} />
				</Pressable>
				<Pressable onPress={resetToToday}>
					<Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
						{formatDate(currentDate)}
					</Text>
				</Pressable>
				<Pressable
					onPress={() => changeDate(1)}
					style={{
						width: 36,
						height: 36,
						borderRadius: 10,
						backgroundColor: colors.surfaceAlt,
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Ionicons name="chevron-forward" size={18} color={colors.text} />
				</Pressable>
			</View>

			{/* Summary Bar + Mark All */}
			<View
				style={{
					flexDirection: "row",
					paddingHorizontal: 20,
					paddingVertical: 8,
					gap: 8,
					alignItems: "center",
				}}
			>
				<View
					style={{
						flex: 1,
						flexDirection: "row",
						backgroundColor: colors.surfaceAlt,
						borderRadius: 10,
						padding: 10,
						gap: 14,
						alignItems: "center",
					}}
				>
					<Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
						{counts.present}/{counts.total} Present
					</Text>
					<Text style={{ fontSize: 12, color: colors.danger, fontWeight: "600" }}>
						A:{counts.absent}
					</Text>
					<Text style={{ fontSize: 12, color: colors.warning, fontWeight: "600" }}>
						L:{counts.late}
					</Text>
				</View>
				<Button title={t("teacher.markAll")} variant="outline" size="sm" onPress={markAllPresent} />
			</View>

			{/* Student List */}
			{students === undefined ? (
				<View style={{ padding: 20 }}>
					<SkeletonList count={5} />
				</View>
			) : studentList.length === 0 ? (
				<View style={{ flex: 1, justifyContent: "center" }}>
					<EmptyState
						icon="people-outline"
						title="No Students"
						subtitle="No students enrolled in this section"
					/>
				</View>
			) : (
				<FlatList
					data={studentList}
					keyExtractor={(item) => item._id}
					renderItem={renderStudent}
					contentContainerStyle={{ paddingBottom: 100 }}
					showsVerticalScrollIndicator={false}
				/>
			)}

			{/* Submit Button */}
			<View
				style={{
					position: "absolute",
					bottom: 0,
					left: 0,
					right: 0,
					padding: 20,
					paddingBottom: 36,
					backgroundColor: colors.bg,
					borderTopWidth: 1,
					borderTopColor: colors.border,
				}}
			>
				<Button
					title={submitting ? "Submitting..." : `Submit Attendance (${counts.marked}/${counts.total})`}
					onPress={handleSubmit}
					loading={submitting}
					disabled={counts.marked === 0 || submitting}
					icon={!submitting ? <Ionicons name="checkmark-circle" size={18} color="#FFF" /> : undefined}
				/>
			</View>
		</View>
	)
}
