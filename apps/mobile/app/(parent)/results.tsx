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
import { Badge } from "@/components/ui/Badge"
import { EmptyState } from "@/components/ui/EmptyState"
import { SkeletonList } from "@/components/ui/Skeleton"

type DetailView = "list" | "detail"

export default function ParentResultsScreen() {
	const { t } = useTranslation()
	const { user } = useAuth()
	const { colors } = useTheme()
	const [view, setView] = useState<DetailView>("list")
	const [selectedTestId, setSelectedTestId] = useState<string | null>(null)
	const [selectedAttemptData, setSelectedAttemptData] = useState<any | null>(null)

	// Resolve studentId
	const studentId = user?.children?.[0]?.id ?? user?.studentId

	// All test attempts for this student
	const testAttempts = useQuery(
		api.tests.listAttemptsByStudent,
		studentId ? { studentId: studentId as any } : "skip",
	)

	// Overall progress (averageScore, etc.)
	const progressData = useQuery(
		api.progress.getStudentProgress,
		studentId ? { studentId: studentId as any } : "skip",
	)

	// Questions for the currently selected test (detail view)
	const testQuestions = useQuery(
		api.tests.listQuestions,
		selectedTestId ? { testId: selectedTestId as any } : "skip",
	)

	const isLoading = studentId !== undefined && testAttempts === undefined

	// Overall average: prefer Convex progress data, fall back to computed
	const overallAvg = useMemo(() => {
		if (progressData?.averageScore !== undefined) return Math.round(progressData.averageScore)
		if (!testAttempts || testAttempts.length === 0) return 0
		const sum = testAttempts.reduce((acc: number, a: any) => {
			const total = a.totalMarks ?? a.total ?? 100
			const pct = total > 0 ? (a.score / total) * 100 : 0
			return acc + pct
		}, 0)
		return Math.round(sum / testAttempts.length)
	}, [progressData, testAttempts])

	// Best subject by average score across attempts
	const bestSubject = useMemo(() => {
		if (!testAttempts || testAttempts.length === 0) return ""
		const subjectAvgs: Record<string, { total: number; count: number }> = {}
		for (const a of testAttempts) {
			const subject: string = a.subject ?? a.testSubject ?? ""
			if (!subject) continue
			if (!subjectAvgs[subject]) subjectAvgs[subject] = { total: 0, count: 0 }
			const total = a.totalMarks ?? a.total ?? 100
			const pct = total > 0 ? (a.score / total) * 100 : 0
			subjectAvgs[subject].total += pct
			subjectAvgs[subject].count += 1
		}
		let best = ""
		let bestAvgVal = 0
		for (const [subject, data] of Object.entries(subjectAvgs)) {
			const avg = data.total / data.count
			if (avg > bestAvgVal) {
				bestAvgVal = avg
				best = subject
			}
		}
		return best
	}, [testAttempts])

	const scoreColor = useCallback((pct: number) => {
		if (pct >= 70) return colors.success
		if (pct >= 40) return colors.warning
		return colors.danger
	}, [colors])

	const scoreBg = useCallback((pct: number) => {
		if (pct >= 70) return colors.successLight
		if (pct >= 40) return colors.warningLight
		return colors.dangerLight
	}, [colors])

	// Detail view
	if (view === "detail" && selectedAttemptData) {
		const attempt = selectedAttemptData
		const total = attempt.totalMarks ?? attempt.total ?? 100
		const pct = total > 0 ? Math.round((attempt.score / total) * 100) : 0
		const subject: string = attempt.subject ?? attempt.testSubject ?? ""
		const displayDate = attempt.completedAt
			? new Date(attempt.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })
			: attempt.date ?? ""

		return (
			<View style={{ flex: 1, backgroundColor: colors.bg }}>
				<ScreenHeader
					title={attempt.testTitle ?? attempt.test ?? "Result"}
					subtitle={[subject, displayDate].filter(Boolean).join(" · ")}
					right={
						<Pressable onPress={() => { setView("list"); setSelectedAttemptData(null); setSelectedTestId(null) }}>
							<Ionicons name="close" size={24} color={colors.textSecondary} />
						</Pressable>
					}
				/>
				<ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
					{/* Score summary */}
					<View style={{ alignItems: "center", paddingVertical: 16 }}>
						<View
							style={{
								width: 100,
								height: 100,
								borderRadius: 50,
								backgroundColor: scoreBg(pct),
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<Text style={{ fontSize: 28, fontWeight: "800", color: scoreColor(pct) }}>
								{pct}%
							</Text>
						</View>
						<Text style={{ fontSize: 16, fontWeight: "600", color: colors.text, marginTop: 12 }}>
							{attempt.score}/{total}
						</Text>
						{subject ? <Badge text={subject} variant="primary" /> : null}
					</View>

					{/* Per-question review */}
					<Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
						Question Review
					</Text>
					{testQuestions === undefined ? (
						<ActivityIndicator color={colors.primary} />
					) : testQuestions === null || testQuestions.length === 0 ? (
						<EmptyState
							icon="document-text-outline"
							title="No Questions Found"
							subtitle="Question details are not available for this test."
						/>
					) : (
						testQuestions.map((q: any, i: number) => {
							// Determine correctness from attempt answers if available
							const attemptAnswers: any[] = attempt.answers ?? []
							const answerRecord = attemptAnswers.find((a: any) => a.questionId === (q._id ?? q.id))
							const isCorrect = answerRecord?.isCorrect ?? answerRecord?.correct ?? false
							const userAnswer = answerRecord?.answer ?? answerRecord?.userAnswer ?? "—"
							const correctAnswer = q.correctAnswer ?? q.answer ?? "—"
							return (
								<Card key={q._id ?? q.id ?? i}>
									<View style={{ flexDirection: "row", gap: 10 }}>
										<View
											style={{
												width: 28,
												height: 28,
												borderRadius: 14,
												backgroundColor: isCorrect ? colors.successLight : colors.dangerLight,
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<Ionicons
												name={isCorrect ? "checkmark" : "close"}
												size={16}
												color={isCorrect ? colors.success : colors.danger}
											/>
										</View>
										<View style={{ flex: 1 }}>
											<Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>
												{q.text ?? q.question ?? `Question ${i + 1}`}
											</Text>
											{isCorrect ? (
												<Text style={{ fontSize: 12, color: colors.success, marginTop: 4 }}>
													Answer: {userAnswer}
												</Text>
											) : (
												<View style={{ marginTop: 4 }}>
													<Text style={{ fontSize: 12, color: colors.danger }}>
														Your answer: {userAnswer}
													</Text>
													<Text style={{ fontSize: 12, color: colors.success }}>
														Correct: {correctAnswer}
													</Text>
												</View>
											)}
										</View>
									</View>
								</Card>
							)
						})
					)}
				</ScrollView>
			</View>
		)
	}

	// Resolve child display name
	const childName = user?.children?.[0]?.name ?? user?.name ?? ""

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader
				title={t("parent.results")}
				subtitle={childName || undefined}
			/>
			<ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
				{isLoading ? (
					<SkeletonList count={4} />
				) : !studentId ? (
					<EmptyState
						icon="person-outline"
						title="No Student Selected"
						subtitle="No student record linked to your account."
					/>
				) : (
					<>
						{/* Summary cards */}
						<View style={{ flexDirection: "row", gap: 12 }}>
							<StatCard
								label="Average Score"
								value={`${overallAvg}%`}
								icon={<Ionicons name="trophy" size={22} color="#059669" />}
								bgColor="#D1FAE5"
							/>
							<StatCard
								label="Tests Taken"
								value={testAttempts?.length ?? 0}
								icon={<Ionicons name="document-text" size={22} color={colors.primary} />}
								bgColor={colors.primaryLight}
							/>
						</View>

						{bestSubject ? (
							<Card>
								<View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
									<Ionicons name="star" size={20} color="#EAB308" />
									<View>
										<Text style={{ fontSize: 13, color: colors.textSecondary }}>Best Subject</Text>
										<Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
											{bestSubject}
										</Text>
									</View>
								</View>
							</Card>
						) : null}

						{/* Test results list */}
						<Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
							{t("parent.testScores")}
						</Text>
						{testAttempts === null || testAttempts?.length === 0 ? (
							<EmptyState
								icon="document-text-outline"
								title="No Test Results"
								subtitle="No tests have been taken yet."
							/>
						) : (
							testAttempts?.map((attempt: any) => {
								const total = attempt.totalMarks ?? attempt.total ?? 100
								const pct = total > 0 ? Math.round((attempt.score / total) * 100) : 0
								const subject: string = attempt.subject ?? attempt.testSubject ?? ""
								const displayDate = attempt.completedAt
									? new Date(attempt.completedAt).toLocaleDateString("en-US", {
											month: "short",
											day: "numeric",
										})
									: attempt.date ?? ""
								return (
									<Card
										key={attempt._id ?? attempt.id}
										onPress={() => {
											setSelectedAttemptData(attempt)
											setSelectedTestId(attempt.testId ?? attempt._id ?? null)
											setView("detail")
										}}
									>
										<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
											<View style={{ flex: 1 }}>
												<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
													{attempt.testTitle ?? attempt.test ?? "Test"}
												</Text>
												<Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
													{[subject, displayDate, `${attempt.score}/${total}`].filter(Boolean).join(" · ")}
												</Text>
											</View>
											<View
												style={{
													width: 44,
													height: 44,
													borderRadius: 22,
													backgroundColor: scoreBg(pct),
													alignItems: "center",
													justifyContent: "center",
												}}
											>
												<Text style={{ fontSize: 13, fontWeight: "700", color: scoreColor(pct) }}>
													{pct}%
												</Text>
											</View>
										</View>
									</Card>
								)
							})
						)}
					</>
				)}
			</ScrollView>
		</View>
	)
}
