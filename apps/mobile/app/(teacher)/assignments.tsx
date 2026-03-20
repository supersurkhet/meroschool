import { useState, useCallback } from "react"
import { View, Text, ScrollView, Pressable, RefreshControl } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useTheme } from "@/lib/theme"
import { ScreenHeader } from "@/components/shared/ScreenHeader"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { EmptyState } from "@/components/ui/EmptyState"

const assignmentsList = [
	{ id: "1", title: "Solve exercises 5.1-5.3", class: "Class 10-A", dueDate: "Mar 26", submissions: 18, total: 32, status: "active" },
	{ id: "2", title: "Lab report - Photosynthesis", class: "Class 10-A", dueDate: "Mar 20", submissions: 30, total: 32, status: "grading" },
	{ id: "3", title: "Nepal History Timeline", class: "Class 9-B", dueDate: "Mar 15", submissions: 28, total: 28, status: "graded" },
]

const submissions = [
	{ id: "1", student: "Aarav Sharma", submittedDate: "Mar 19", grade: null as string | null },
	{ id: "2", student: "Bina Gurung", submittedDate: "Mar 18", grade: "A" },
	{ id: "3", student: "Chandan Thapa", submittedDate: "Mar 20", grade: null as string | null },
]

export default function TeacherAssignmentsScreen() {
	const { t } = useTranslation()
	const { colors } = useTheme()
	const [showCreate, setShowCreate] = useState(false)
	const [viewSubmissions, setViewSubmissions] = useState(false)
	const [refreshing, setRefreshing] = useState(false)

	const onRefresh = useCallback(() => {
		setRefreshing(true)
		setTimeout(() => setRefreshing(false), 1000)
	}, [])

	if (viewSubmissions) {
		return (
			<View style={{ flex: 1, backgroundColor: colors.bg }}>
				<ScreenHeader
					title="Submissions"
					subtitle="Lab report - Photosynthesis"
					right={
						<Pressable onPress={() => setViewSubmissions(false)}>
							<Ionicons name="arrow-back" size={24} color={colors.primary} />
						</Pressable>
					}
				/>
				<ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
					{submissions.length === 0 ? (
						<EmptyState icon="document-outline" title="No Submissions Yet" subtitle="Students haven't submitted this assignment yet" />
					) : (
						submissions.map((sub) => (
							<Card key={sub.id}>
								<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
									<View>
										<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{sub.student}</Text>
										<Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>Submitted: {sub.submittedDate}</Text>
									</View>
									{sub.grade ? (
										<Badge text={sub.grade} variant="success" />
									) : (
										<Button title={t("teacher.grade")} size="sm" variant="outline" onPress={() => {}} />
									)}
								</View>
							</Card>
						))
					)}
				</ScrollView>
			</View>
		)
	}

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader
				title={t("teacher.assignments")}
				right={
					<Pressable
						onPress={() => setShowCreate(!showCreate)}
						style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#EDE9FE", alignItems: "center", justifyContent: "center" }}
					>
						<Ionicons name={showCreate ? "close" : "add"} size={24} color="#7C3AED" />
					</Pressable>
				}
			/>
			<ScrollView
				contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 40 }}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
			>
				{showCreate && (
					<Card style={{ borderColor: "#7C3AED", borderWidth: 1.5 }}>
						<Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 14 }}>{t("teacher.createAssignment")}</Text>
						<View style={{ gap: 10 }}>
							<Input placeholder="Assignment title" />
							<Input placeholder="Description" multiline numberOfLines={3} style={{ height: 80, textAlignVertical: "top" }} />
							<Input placeholder="Select class" />
							<Input placeholder="Due date" />
							<Button title={t("teacher.createAssignment")} onPress={() => setShowCreate(false)} />
						</View>
					</Card>
				)}

				{!showCreate && assignmentsList.length === 0 && (
					<EmptyState icon="clipboard-outline" title="No Assignments" subtitle="Create your first assignment using the + button" />
				)}

				{assignmentsList.map((a) => (
					<Card key={a.id} onPress={() => a.status !== "active" && setViewSubmissions(true)}>
						<View style={{ gap: 8 }}>
							<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
								<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text, flex: 1 }}>{a.title}</Text>
								<Badge
									text={a.status}
									variant={a.status === "active" ? "primary" : a.status === "grading" ? "warning" : "success"}
								/>
							</View>
							<Text style={{ fontSize: 13, color: colors.textSecondary }}>
								{a.class} · Due: {a.dueDate}
							</Text>
							{/* Progress bar */}
							<View style={{ gap: 4 }}>
								<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
									<Text style={{ fontSize: 12, color: colors.textMuted }}>Submissions</Text>
									<Text style={{ fontSize: 12, fontWeight: "600", color: colors.text }}>
										{a.submissions}/{a.total}
									</Text>
								</View>
								<View style={{ height: 6, backgroundColor: colors.surfaceAlt, borderRadius: 3 }}>
									<View
										style={{
											height: 6,
											borderRadius: 3,
											backgroundColor: a.submissions === a.total ? colors.success : "#7C3AED",
											width: `${(a.submissions / a.total) * 100}%`,
										}}
									/>
								</View>
							</View>
						</View>
					</Card>
				))}
			</ScrollView>
		</View>
	)
}
