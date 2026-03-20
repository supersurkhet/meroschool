import { useState, useCallback } from "react"
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useTheme } from "@/lib/theme"
import { ScreenHeader } from "@/components/shared/ScreenHeader"
import { Card, StatCard } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { EmptyState } from "@/components/ui/EmptyState"

const classes = ["Class 10-A", "Class 10-B", "Class 9-A", "Class 9-B"]

const students = [
	{ id: "1", name: "Aarav Sharma", roll: 1, attendance: 95, avgScore: 88, parent: "Krishna Sharma" },
	{ id: "2", name: "Bina Gurung", roll: 2, attendance: 92, avgScore: 82, parent: "Mina Gurung" },
	{ id: "3", name: "Chandan Thapa", roll: 3, attendance: 88, avgScore: 75, parent: "Ram Thapa" },
	{ id: "4", name: "Deepa Adhikari", roll: 4, attendance: 97, avgScore: 94, parent: "Sita Adhikari" },
	{ id: "5", name: "Ganesh Poudel", roll: 5, attendance: 85, avgScore: 71, parent: "Hari Poudel" },
	{ id: "6", name: "Hari Shrestha", roll: 6, attendance: 90, avgScore: 79, parent: "Gita Shrestha" },
	{ id: "7", name: "Isha Rai", roll: 7, attendance: 93, avgScore: 86, parent: "Dhan Rai" },
	{ id: "8", name: "Jeevan KC", roll: 8, attendance: 78, avgScore: 68, parent: "Prem KC" },
]

export default function StudentsScreen() {
	const { t } = useTranslation()
	const { colors } = useTheme()
	const [selectedClass, setSelectedClass] = useState(classes[0])
	const [search, setSearch] = useState("")
	const [refreshing, setRefreshing] = useState(false)

	const onRefresh = useCallback(() => {
		setRefreshing(true)
		setTimeout(() => setRefreshing(false), 1000)
	}, [])

	const filtered = students.filter((s) =>
		s.name.toLowerCase().includes(search.toLowerCase())
	)

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader title={t("teacher.classRoster")} subtitle={selectedClass} />

			{/* Class selector */}
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				style={{ maxHeight: 50, flexGrow: 0 }}
				contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 8 }}
			>
				{classes.map((cls) => (
					<Pressable
						key={cls}
						onPress={() => setSelectedClass(cls)}
						style={{
							paddingHorizontal: 16,
							paddingVertical: 8,
							borderRadius: 10,
							backgroundColor: selectedClass === cls ? "#7C3AED" : colors.surfaceAlt,
						}}
					>
						<Text style={{ fontSize: 13, fontWeight: "600", color: selectedClass === cls ? "#FFF" : colors.textSecondary }}>
							{cls}
						</Text>
					</Pressable>
				))}
			</ScrollView>

			<View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
				<Input
					placeholder={t("common.search")}
					value={search}
					onChangeText={setSearch}
					icon={<Ionicons name="search-outline" size={18} color={colors.textMuted} />}
				/>
			</View>

			{/* Stats */}
			<View style={{ flexDirection: "row", paddingHorizontal: 20, paddingTop: 12, gap: 10 }}>
				<StatCard
					label={t("teacher.totalStudents")}
					value={filtered.length}
					icon={<Ionicons name="people" size={20} color="#7C3AED" />}
					bgColor="#EDE9FE"
				/>
				<StatCard
					label="Avg Attendance"
					value={filtered.length > 0 ? `${Math.round(filtered.reduce((a, s) => a + s.attendance, 0) / filtered.length)}%` : "0%"}
					icon={<Ionicons name="checkmark-circle" size={20} color={colors.success} />}
					bgColor={colors.successLight}
				/>
			</View>

			<ScrollView
				contentContainerStyle={{ padding: 20, gap: 8, paddingBottom: 40 }}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
			>
				{filtered.length === 0 ? (
					<EmptyState
						icon="people-outline"
						title={search ? "No Students Found" : "No Students"}
						subtitle={search ? `No students matching "${search}"` : "No students enrolled in this class yet"}
					/>
				) : (
					filtered.map((student) => (
						<Card key={student.id}>
							<View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
								<View
									style={{
										width: 44,
										height: 44,
										borderRadius: 22,
										backgroundColor: "#EDE9FE",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Text style={{ fontSize: 16, fontWeight: "700", color: "#7C3AED" }}>
										{student.name.charAt(0)}
									</Text>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
										{student.roll}. {student.name}
									</Text>
									<Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
										Parent: {student.parent}
									</Text>
								</View>
								<View style={{ alignItems: "flex-end" }}>
									<Text style={{ fontSize: 13, fontWeight: "600", color: student.attendance >= 90 ? colors.success : colors.warning }}>
										{student.attendance}%
									</Text>
									<Text style={{ fontSize: 11, color: colors.textMuted }}>Avg: {student.avgScore}</Text>
								</View>
							</View>
						</Card>
					))
				)}
			</ScrollView>
		</View>
	)
}
