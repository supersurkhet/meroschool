import { useState, useCallback } from "react"
import { View, Text, FlatList, Pressable, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useTheme } from "@/lib/theme"
import { ScreenHeader } from "@/components/shared/ScreenHeader"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

type AttendanceStatus = "present" | "absent" | "late"

const sections = ["Class 10-A", "Class 10-B", "Class 9-A", "Class 9-B", "Class 8-A"]

const studentList = [
	{ id: "1", name: "Aarav Sharma", roll: 1 },
	{ id: "2", name: "Bina Gurung", roll: 2 },
	{ id: "3", name: "Chandan Thapa", roll: 3 },
	{ id: "4", name: "Deepa Adhikari", roll: 4 },
	{ id: "5", name: "Ganesh Poudel", roll: 5 },
	{ id: "6", name: "Hari Shrestha", roll: 6 },
	{ id: "7", name: "Isha Rai", roll: 7 },
	{ id: "8", name: "Jeevan KC", roll: 8 },
	{ id: "9", name: "Kabita Tamang", roll: 9 },
	{ id: "10", name: "Laxmi Basnet", roll: 10 },
	{ id: "11", name: "Manoj Bhandari", roll: 11 },
	{ id: "12", name: "Nirmala Pant", roll: 12 },
	{ id: "13", name: "Om Prakash Yadav", roll: 13 },
	{ id: "14", name: "Priya Magar", roll: 14 },
	{ id: "15", name: "Rajesh Dahal", roll: 15 },
	{ id: "16", name: "Sarita Bhatt", roll: 16 },
	{ id: "17", name: "Tej Bahadur Chand", roll: 17 },
	{ id: "18", name: "Uma Devi Oli", roll: 18 },
	{ id: "19", name: "Vishnu Prasad", roll: 19 },
	{ id: "20", name: "Yamuna Karki", roll: 20 },
]

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
	const { colors } = useTheme()
	const [selectedSection, setSelectedSection] = useState(sections[0])
	const [currentDate, setCurrentDate] = useState(new Date())
	const [attendance, setAttendance] = useState<Record<string, AttendanceStatus | null>>(
		Object.fromEntries(studentList.map((s) => [s.id, null]))
	)
	const [submitting, setSubmitting] = useState(false)

	const markStudent = useCallback((id: string, status: AttendanceStatus) => {
		setAttendance((prev) => ({
			...prev,
			[id]: prev[id] === status ? null : status,
		}))
	}, [])

	const markAllPresent = useCallback(() => {
		setAttendance(Object.fromEntries(studentList.map((s) => [s.id, "present" as const])))
	}, [])

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

	const counts = {
		present: Object.values(attendance).filter((v) => v === "present").length,
		absent: Object.values(attendance).filter((v) => v === "absent").length,
		late: Object.values(attendance).filter((v) => v === "late").length,
		total: studentList.length,
		marked: Object.values(attendance).filter((v) => v !== null).length,
	}

	const handleSubmit = useCallback(() => {
		if (counts.marked === 0) {
			Alert.alert("No Data", "Please mark attendance for at least one student.")
			return
		}
		Alert.alert(
			"Submit Attendance",
			`Submit attendance for ${selectedSection}?\n\nPresent: ${counts.present}\nAbsent: ${counts.absent}\nLate: ${counts.late}\nUnmarked: ${counts.total - counts.marked}`,
			[
				{ text: t("common.cancel"), style: "cancel" },
				{
					text: t("common.submit"),
					onPress: () => {
						setSubmitting(true)
						setTimeout(() => {
							setSubmitting(false)
							Alert.alert(
								"Success",
								`Attendance submitted for ${selectedSection} on ${formatDate(currentDate)}.`,
								[{ text: "OK" }]
							)
						}, 1000)
					},
				},
			]
		)
	}, [counts, selectedSection, currentDate, t])

	const statusButtons: { status: AttendanceStatus; label: string; activeColor: string; activeBg: string }[] = [
		{ status: "present", label: "P", activeColor: colors.success, activeBg: colors.successLight },
		{ status: "absent", label: "A", activeColor: colors.danger, activeBg: colors.dangerLight },
		{ status: "late", label: "L", activeColor: colors.warning, activeBg: colors.warningLight },
	]

	const renderStudent = useCallback(
		({ item }: { item: (typeof studentList)[0] }) => (
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
						{item.roll}
					</Text>
				</View>
				<Text style={{ flex: 1, fontSize: 15, fontWeight: "500", color: colors.text }}>
					{item.name}
				</Text>
				<View style={{ flexDirection: "row", gap: 6 }}>
					{statusButtons.map((btn) => {
						const isActive = attendance[item.id] === btn.status
						return (
							<Pressable
								key={btn.status}
								onPress={() => markStudent(item.id, btn.status)}
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

			{/* Section Selector */}
			<FlatList
				horizontal
				showsHorizontalScrollIndicator={false}
				data={sections}
				keyExtractor={(item) => item}
				style={{ maxHeight: 50, flexGrow: 0 }}
				contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 8 }}
				renderItem={({ item }) => (
					<Pressable
						onPress={() => setSelectedSection(item)}
						style={{
							paddingHorizontal: 16,
							paddingVertical: 8,
							borderRadius: 10,
							backgroundColor: selectedSection === item ? "#7C3AED" : colors.surfaceAlt,
						}}
					>
						<Text
							style={{
								fontSize: 13,
								fontWeight: "600",
								color: selectedSection === item ? "#FFF" : colors.textSecondary,
							}}
						>
							{item}
						</Text>
					</Pressable>
				)}
			/>

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
			<FlatList
				data={studentList}
				keyExtractor={(item) => item.id}
				renderItem={renderStudent}
				contentContainerStyle={{ paddingBottom: 100 }}
				showsVerticalScrollIndicator={false}
			/>

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
					disabled={counts.marked === 0}
					icon={!submitting ? <Ionicons name="checkmark-circle" size={18} color="#FFF" /> : undefined}
				/>
			</View>
		</View>
	)
}
