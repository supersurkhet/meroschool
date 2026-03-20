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

type Tab = "tests" | "bank" | "results"

const existingTests = [
	{ id: "1", title: "Algebra Quiz", class: "Class 10-A", questions: 20, duration: "30 min", date: "Mar 25", status: "active" },
	{ id: "2", title: "Geometry Test", class: "Class 10-B", questions: 15, duration: "25 min", date: "Mar 20", status: "completed" },
]

const questionBank = [
	{ id: "1", text: "What is the value of x in 2x + 4 = 10?", subject: "Mathematics", difficulty: "Easy" },
	{ id: "2", text: "Simplify: 3(x + 2) - 5", subject: "Mathematics", difficulty: "Easy" },
	{ id: "3", text: "Find roots of x\u00B2 - 5x + 6 = 0", subject: "Mathematics", difficulty: "Medium" },
	{ id: "4", text: "Prove that \u221A2 is irrational", subject: "Mathematics", difficulty: "Hard" },
]

const testResults = [
	{ id: "1", student: "Aarav Sharma", score: 18, total: 20, percentage: 90 },
	{ id: "2", student: "Bina Gurung", score: 16, total: 20, percentage: 80 },
	{ id: "3", student: "Chandan Thapa", score: 14, total: 20, percentage: 70 },
	{ id: "4", student: "Deepa Adhikari", score: 19, total: 20, percentage: 95 },
]

export default function TeacherTestsScreen() {
	const { t } = useTranslation()
	const { colors } = useTheme()
	const [tab, setTab] = useState<Tab>("tests")
	const [showCreate, setShowCreate] = useState(false)
	const [refreshing, setRefreshing] = useState(false)

	const onRefresh = useCallback(() => {
		setRefreshing(true)
		setTimeout(() => setRefreshing(false), 1000)
	}, [])

	const difficultyColors: Record<string, string> = { Easy: colors.success, Medium: colors.warning, Hard: colors.danger }

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader
				title={t("teacher.tests")}
				right={
					tab === "tests" ? (
						<Pressable
							onPress={() => setShowCreate(!showCreate)}
							style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#EDE9FE", alignItems: "center", justifyContent: "center" }}
						>
							<Ionicons name={showCreate ? "close" : "add"} size={24} color="#7C3AED" />
						</Pressable>
					) : undefined
				}
			/>

			{/* Tabs */}
			<View style={{ flexDirection: "row", paddingHorizontal: 20, paddingTop: 12, gap: 6 }}>
				{(["tests", "bank", "results"] as Tab[]).map((t2) => (
					<Pressable
						key={t2}
						onPress={() => setTab(t2)}
						style={{
							flex: 1,
							paddingVertical: 8,
							borderRadius: 10,
							backgroundColor: tab === t2 ? "#7C3AED" : colors.surfaceAlt,
							alignItems: "center",
						}}
					>
						<Text style={{ fontSize: 12, fontWeight: "600", color: tab === t2 ? "#FFF" : colors.textSecondary }}>
							{t2 === "tests" ? t("teacher.tests") : t2 === "bank" ? t("teacher.questionBank") : t("student.viewResults")}
						</Text>
					</Pressable>
				))}
			</View>

			<ScrollView
				contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 40 }}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
			>
				{tab === "tests" && showCreate && (
					<Card style={{ borderColor: "#7C3AED", borderWidth: 1.5 }}>
						<Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 14 }}>{t("teacher.createTest")}</Text>
						<View style={{ gap: 10 }}>
							<Input placeholder="Test title" />
							<Input placeholder="Select class" />
							<View style={{ flexDirection: "row", gap: 10 }}>
								<View style={{ flex: 1 }}><Input placeholder="# Questions" keyboardType="numeric" /></View>
								<View style={{ flex: 1 }}><Input placeholder="Duration (min)" keyboardType="numeric" /></View>
							</View>
							<Input placeholder="Due date" />
							<Button title="Generate from Question Bank" onPress={() => {}} icon={<Ionicons name="shuffle" size={18} color="#FFF" />} />
						</View>
					</Card>
				)}

				{tab === "tests" && !showCreate && existingTests.length === 0 && (
					<EmptyState icon="document-text-outline" title="No Tests Created" subtitle="Create your first test using the + button above" />
				)}

				{tab === "tests" &&
					existingTests.map((test) => (
						<Card key={test.id}>
							<View style={{ gap: 6 }}>
								<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
									<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{test.title}</Text>
									<Badge text={test.status} variant={test.status === "active" ? "success" : "default"} />
								</View>
								<Text style={{ fontSize: 13, color: colors.textSecondary }}>
									{test.class} · {test.questions}Q · {test.duration} · {test.date}
								</Text>
							</View>
						</Card>
					))}

				{tab === "bank" && (
					<>
						<Button title={t("teacher.addQuestion")} variant="outline" onPress={() => {}} icon={<Ionicons name="add" size={18} color={colors.primary} />} />
						{questionBank.length === 0 ? (
							<EmptyState icon="help-circle-outline" title="Empty Question Bank" subtitle="Add questions to build your MCQ library" />
						) : (
							questionBank.map((q) => (
								<Card key={q.id}>
									<View style={{ gap: 6 }}>
										<Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>{q.text}</Text>
										<View style={{ flexDirection: "row", gap: 8 }}>
											<Badge text={q.subject} variant="primary" />
											<View style={{ backgroundColor: difficultyColors[q.difficulty] + "20", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
												<Text style={{ fontSize: 11, fontWeight: "600", color: difficultyColors[q.difficulty] }}>{q.difficulty}</Text>
											</View>
										</View>
									</View>
								</Card>
							))
						)}
					</>
				)}

				{tab === "results" && (
					<>
						{testResults.length === 0 ? (
							<EmptyState icon="stats-chart-outline" title="No Results Yet" subtitle="Results will appear after students take tests" />
						) : (
							<>
								<Card>
									<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
										<Text style={{ fontSize: 14, color: colors.textSecondary }}>Algebra Quiz · Class 10-A</Text>
										<Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>Avg: 84%</Text>
									</View>
								</Card>
								{testResults.map((r) => (
									<Card key={r.id}>
										<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
											<View>
												<Text style={{ fontSize: 15, fontWeight: "500", color: colors.text }}>{r.student}</Text>
												<Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{r.score}/{r.total}</Text>
											</View>
											<View
												style={{
													width: 44,
													height: 44,
													borderRadius: 22,
													backgroundColor: r.percentage >= 80 ? colors.successLight : r.percentage >= 60 ? colors.warningLight : colors.dangerLight,
													alignItems: "center",
													justifyContent: "center",
												}}
											>
												<Text style={{
													fontSize: 13,
													fontWeight: "700",
													color: r.percentage >= 80 ? colors.success : r.percentage >= 60 ? colors.warning : colors.danger,
												}}>
													{r.percentage}%
												</Text>
											</View>
										</View>
									</Card>
								))}
							</>
						)}
					</>
				)}
			</ScrollView>
		</View>
	)
}
