import { useState, useCallback } from "react"
import { View, Text, ScrollView, Pressable, RefreshControl, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/lib/convex/api"
import { useAuth } from "@/lib/auth"
import { useTheme } from "@/lib/theme"
import { ScreenHeader } from "@/components/shared/ScreenHeader"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { EmptyState } from "@/components/ui/EmptyState"
import { SkeletonList } from "@/components/ui/Skeleton"

type Tab = "tests" | "bank" | "results"

export default function TeacherTestsScreen() {
	const { t } = useTranslation()
	const { user } = useAuth()
	const { colors } = useTheme()
	const [tab, setTab] = useState<Tab>("tests")
	const [showCreate, setShowCreate] = useState(false)
	const [refreshing, setRefreshing] = useState(false)

	// Selected IDs for drill-down queries
	const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
	const [selectedTestId, setSelectedTestId] = useState<string | null>(null)

	// Create form state
	const [testTitle, setTestTitle] = useState("")
	const [testClass, setTestClass] = useState("")
	const [testQuestions, setTestQuestions] = useState("")
	const [testDuration, setTestDuration] = useState("")
	const [testDueDate, setTestDueDate] = useState("")
	const [creating, setCreating] = useState(false)

	// Add question form state
	const [showAddQuestion, setShowAddQuestion] = useState(false)
	const [questionText, setQuestionText] = useState("")
	const [addingQuestion, setAddingQuestion] = useState(false)

	// Queries
	const subjects = useQuery(
		api.academics.listSubjectsByTeacher,
		user?.teacherId ? { teacherId: user.teacherId as any } : "skip"
	)

	const tests = useQuery(
		api.tests.listTestsBySubject,
		selectedSubjectId ? { subjectId: selectedSubjectId as any } : "skip"
	)

	const questions = useQuery(
		api.tests.listQuestions,
		selectedTestId ? { testId: selectedTestId as any } : "skip"
	)

	const attempts = useQuery(
		api.tests.listAttemptsByTest,
		selectedTestId ? { testId: selectedTestId as any } : "skip"
	)

	// Mutations
	const createTest = useMutation(api.tests.createTest)
	const addQuestion = useMutation(api.tests.addQuestion)

	const onRefresh = useCallback(() => {
		setRefreshing(true)
		setTimeout(() => setRefreshing(false), 1000)
	}, [])

	const difficultyColors: Record<string, string> = {
		Easy: colors.success,
		Medium: colors.warning,
		Hard: colors.danger,
	}

	const handleCreateTest = useCallback(async () => {
		if (!testTitle.trim()) {
			Alert.alert("Missing Title", "Please enter a test title.")
			return
		}
		setCreating(true)
		try {
			await createTest({
				title: testTitle,
				subjectId: selectedSubjectId as any,
				teacherId: user?.teacherId as any,
				totalQuestions: testQuestions ? parseInt(testQuestions, 10) : undefined,
				durationMinutes: testDuration ? parseInt(testDuration, 10) : undefined,
				dueDate: testDueDate || undefined,
			} as any)
			setShowCreate(false)
			setTestTitle("")
			setTestClass("")
			setTestQuestions("")
			setTestDuration("")
			setTestDueDate("")
		} catch (err: any) {
			Alert.alert("Error", err?.message ?? "Failed to create test.")
		} finally {
			setCreating(false)
		}
	}, [testTitle, testClass, testQuestions, testDuration, testDueDate, selectedSubjectId, user?.teacherId, createTest])

	const handleAddQuestion = useCallback(async () => {
		if (!questionText.trim()) {
			Alert.alert("Missing Question", "Please enter a question.")
			return
		}
		if (!selectedTestId) {
			Alert.alert("No Test Selected", "Please select a test first.")
			return
		}
		setAddingQuestion(true)
		try {
			await addQuestion({
				testId: selectedTestId as any,
				text: questionText,
			} as any)
			setShowAddQuestion(false)
			setQuestionText("")
		} catch (err: any) {
			Alert.alert("Error", err?.message ?? "Failed to add question.")
		} finally {
			setAddingQuestion(false)
		}
	}, [questionText, selectedTestId, addQuestion])

	const testList: any[] = tests ?? []
	const questionList: any[] = questions ?? []
	const attemptList: any[] = attempts ?? []

	const avgScore = attemptList.length > 0
		? Math.round(attemptList.reduce((acc: number, r: any) => acc + (r.percentage ?? 0), 0) / attemptList.length)
		: null

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

			{/* Subject selector chips */}
			{subjects !== undefined && (subjects as any[]).length > 0 && (
				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={{ maxHeight: 50, flexGrow: 0 }}
					contentContainerStyle={{ paddingHorizontal: 20, gap: 8, paddingVertical: 8 }}
				>
					{(subjects as any[]).map((subj) => (
						<Pressable
							key={subj._id}
							onPress={() => setSelectedSubjectId(subj._id)}
							style={{
								paddingHorizontal: 14,
								paddingVertical: 8,
								borderRadius: 10,
								backgroundColor: selectedSubjectId === subj._id ? "#7C3AED" : colors.surfaceAlt,
							}}
						>
							<Text style={{ fontSize: 13, fontWeight: "600", color: selectedSubjectId === subj._id ? "#FFF" : colors.textSecondary }}>
								{subj.subjectName ?? subj.name ?? "—"}
							</Text>
						</Pressable>
					))}
				</ScrollView>
			)}

			<ScrollView
				contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 40 }}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
			>
				{/* Tests tab */}
				{tab === "tests" && showCreate && (
					<Card style={{ borderColor: "#7C3AED", borderWidth: 1.5 }}>
						<Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 14 }}>{t("teacher.createTest")}</Text>
						<View style={{ gap: 10 }}>
							<Input placeholder="Test title" value={testTitle} onChangeText={setTestTitle} />
							<Input placeholder="Select class" value={testClass} onChangeText={setTestClass} />
							<View style={{ flexDirection: "row", gap: 10 }}>
								<View style={{ flex: 1 }}>
									<Input placeholder="# Questions" keyboardType="numeric" value={testQuestions} onChangeText={setTestQuestions} />
								</View>
								<View style={{ flex: 1 }}>
									<Input placeholder="Duration (min)" keyboardType="numeric" value={testDuration} onChangeText={setTestDuration} />
								</View>
							</View>
							<Input placeholder="Due date" value={testDueDate} onChangeText={setTestDueDate} />
							<Button
								title={creating ? "Creating…" : "Generate from Question Bank"}
								onPress={handleCreateTest}
								loading={creating}
								icon={!creating ? <Ionicons name="shuffle" size={18} color="#FFF" /> : undefined}
							/>
						</View>
					</Card>
				)}

				{tab === "tests" && !showCreate && tests === undefined && selectedSubjectId && (
					<SkeletonList count={3} />
				)}

				{tab === "tests" && !showCreate && !selectedSubjectId && (
					<EmptyState icon="book-outline" title="Select a Subject" subtitle="Pick a subject above to view its tests" />
				)}

				{tab === "tests" && !showCreate && selectedSubjectId && tests !== undefined && testList.length === 0 && (
					<EmptyState icon="document-text-outline" title="No Tests Created" subtitle="Create your first test using the + button above" />
				)}

				{tab === "tests" && testList.map((test: any) => (
					<Pressable key={test._id} onPress={() => setSelectedTestId(test._id)}>
						<Card style={selectedTestId === test._id ? { borderColor: "#7C3AED", borderWidth: 1.5 } : undefined}>
							<View style={{ gap: 6 }}>
								<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
									<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{test.title}</Text>
									<Badge
										text={test.status ?? "draft"}
										variant={(test.status === "active" || test.isActive) ? "success" : "default"}
									/>
								</View>
								<Text style={{ fontSize: 13, color: colors.textSecondary }}>
									{test.sectionName ?? test.class ?? "—"} · {test.totalQuestions ?? test.questions ?? 0}Q · {test.durationMinutes ? `${test.durationMinutes} min` : test.duration ?? "—"} · {test.dueDate ?? test.date ?? ""}
								</Text>
							</View>
						</Card>
					</Pressable>
				))}

				{/* Question bank tab */}
				{tab === "bank" && (
					<>
						<Button
							title={t("teacher.addQuestion")}
							variant="outline"
							onPress={() => setShowAddQuestion(!showAddQuestion)}
							icon={<Ionicons name="add" size={18} color={colors.primary} />}
						/>

						{showAddQuestion && (
							<Card style={{ borderColor: "#7C3AED", borderWidth: 1.5 }}>
								<Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 12 }}>Add Question</Text>
								<View style={{ gap: 10 }}>
									<Input
										placeholder="Question text"
										multiline
										numberOfLines={3}
										style={{ height: 80, textAlignVertical: "top" }}
										value={questionText}
										onChangeText={setQuestionText}
									/>
									<Button
										title={addingQuestion ? "Adding…" : t("teacher.addQuestion")}
										onPress={handleAddQuestion}
										loading={addingQuestion}
									/>
								</View>
							</Card>
						)}

						{questions === undefined && selectedTestId && <SkeletonList count={3} />}

						{!selectedTestId && (
							<EmptyState icon="book-outline" title="Select a Test" subtitle="Pick a test in the Tests tab to view its question bank" />
						)}

						{selectedTestId && questions !== undefined && questionList.length === 0 && (
							<EmptyState icon="help-circle-outline" title="Empty Question Bank" subtitle="Add questions to build your MCQ library" />
						)}

						{questionList.map((q: any) => (
							<Card key={q._id}>
								<View style={{ gap: 6 }}>
									<Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>{q.text ?? q.question ?? "—"}</Text>
									<View style={{ flexDirection: "row", gap: 8 }}>
										{q.subject && <Badge text={q.subject} variant="primary" />}
										{q.difficulty && (
											<View style={{ backgroundColor: (difficultyColors[q.difficulty] ?? colors.textSecondary) + "20", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
												<Text style={{ fontSize: 11, fontWeight: "600", color: difficultyColors[q.difficulty] ?? colors.textSecondary }}>
													{q.difficulty}
												</Text>
											</View>
										)}
									</View>
								</View>
							</Card>
						))}
					</>
				)}

				{/* Results tab */}
				{tab === "results" && (
					<>
						{!selectedTestId && (
							<EmptyState icon="stats-chart-outline" title="Select a Test" subtitle="Pick a test in the Tests tab to view results" />
						)}

						{selectedTestId && attempts === undefined && <SkeletonList count={3} />}

						{selectedTestId && attempts !== undefined && attemptList.length === 0 && (
							<EmptyState icon="stats-chart-outline" title="No Results Yet" subtitle="Results will appear after students take tests" />
						)}

						{selectedTestId && attempts !== undefined && attemptList.length > 0 && (
							<>
								<Card>
									<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
										<Text style={{ fontSize: 14, color: colors.textSecondary }}>
											{testList.find((t: any) => t._id === selectedTestId)?.title ?? "Test"} · {attemptList.length} students
										</Text>
										{avgScore !== null && (
											<Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>Avg: {avgScore}%</Text>
										)}
									</View>
								</Card>
								{attemptList.map((r: any) => (
									<Card key={r._id}>
										<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
											<View>
												<Text style={{ fontSize: 15, fontWeight: "500", color: colors.text }}>
													{r.studentName ?? r.student ?? "Unknown"}
												</Text>
												<Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
													{r.score ?? 0}/{r.total ?? r.totalQuestions ?? "—"}
												</Text>
											</View>
											<View
												style={{
													width: 44,
													height: 44,
													borderRadius: 22,
													backgroundColor:
														(r.percentage ?? 0) >= 80
															? colors.successLight
															: (r.percentage ?? 0) >= 60
															? colors.warningLight
															: colors.dangerLight,
													alignItems: "center",
													justifyContent: "center",
												}}
											>
												<Text
													style={{
														fontSize: 13,
														fontWeight: "700",
														color:
															(r.percentage ?? 0) >= 80
																? colors.success
																: (r.percentage ?? 0) >= 60
																? colors.warning
																: colors.danger,
													}}
												>
													{r.percentage ?? 0}%
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
