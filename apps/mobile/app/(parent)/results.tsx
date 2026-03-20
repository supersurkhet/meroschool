import { useState, useCallback, useMemo } from "react"
import { View, Text, ScrollView, Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useTheme } from "@/lib/theme"
import { ScreenHeader } from "@/components/shared/ScreenHeader"
import { Card, StatCard } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

type DetailView = "list" | "detail"

interface TestResult {
	id: string
	subject: string
	test: string
	score: number
	total: number
	date: string
	percentage: number
	questions: { text: string; correct: boolean; userAnswer: string; correctAnswer: string }[]
}

const testScores: TestResult[] = [
	{
		id: "1",
		subject: "Mathematics",
		test: "Algebra Quiz",
		score: 85,
		total: 100,
		date: "Mar 20",
		percentage: 85,
		questions: [
			{ text: "Solve 2x + 4 = 10", correct: true, userAnswer: "x = 3", correctAnswer: "x = 3" },
			{ text: "Factor x\u00B2 - 9", correct: true, userAnswer: "(x-3)(x+3)", correctAnswer: "(x-3)(x+3)" },
			{ text: "Simplify 3(x+2) - 5", correct: false, userAnswer: "3x + 6", correctAnswer: "3x + 1" },
			{ text: "What is slope of y = 3x + 7?", correct: true, userAnswer: "3", correctAnswer: "3" },
			{ text: "Solve x\u00B2 = 16", correct: true, userAnswer: "\u00B14", correctAnswer: "\u00B14" },
		],
	},
	{
		id: "2",
		subject: "Nepali",
		test: "Grammar Test",
		score: 78,
		total: 100,
		date: "Mar 18",
		percentage: 78,
		questions: [
			{ text: "Identify the sarvanam", correct: true, userAnswer: "He", correctAnswer: "He" },
			{ text: "Identify the visheshan", correct: true, userAnswer: "Beautiful", correctAnswer: "Beautiful" },
			{ text: "Identify the kriya", correct: false, userAnswer: "Run", correctAnswer: "Eat" },
		],
	},
	{
		id: "3",
		subject: "Science",
		test: "Physics Mid-term",
		score: 92,
		total: 100,
		date: "Mar 15",
		percentage: 92,
		questions: [
			{ text: "Newton's first law is about?", correct: true, userAnswer: "Inertia", correctAnswer: "Inertia" },
			{ text: "F = ma is which law?", correct: true, userAnswer: "Second", correctAnswer: "Second" },
			{ text: "Unit of force?", correct: true, userAnswer: "Newton", correctAnswer: "Newton" },
		],
	},
	{
		id: "4",
		subject: "English",
		test: "Essay Writing",
		score: 70,
		total: 100,
		date: "Mar 12",
		percentage: 70,
		questions: [
			{ text: "Thesis statement quality", correct: true, userAnswer: "Good", correctAnswer: "Good" },
			{ text: "Grammar accuracy", correct: false, userAnswer: "Poor", correctAnswer: "Excellent" },
		],
	},
	{
		id: "5",
		subject: "Social Studies",
		test: "History Quiz",
		score: 88,
		total: 100,
		date: "Mar 10",
		percentage: 88,
		questions: [
			{ text: "Nepal became republic in?", correct: true, userAnswer: "2008", correctAnswer: "2008" },
			{ text: "First king of unified Nepal?", correct: true, userAnswer: "Prithvi Narayan Shah", correctAnswer: "Prithvi Narayan Shah" },
		],
	},
	{
		id: "6",
		subject: "Mathematics",
		test: "Geometry Test",
		score: 35,
		total: 100,
		date: "Feb 28",
		percentage: 35,
		questions: [
			{ text: "Sum of angles in triangle?", correct: false, userAnswer: "360", correctAnswer: "180" },
			{ text: "Area of circle formula?", correct: false, userAnswer: "2\u03C0r", correctAnswer: "\u03C0r\u00B2" },
		],
	},
]

export default function ParentResultsScreen() {
	const { t } = useTranslation()
	const { colors } = useTheme()
	const [view, setView] = useState<DetailView>("list")
	const [selectedResult, setSelectedResult] = useState<TestResult | null>(null)

	const overallAvg = useMemo(
		() => Math.round(testScores.reduce((a, s) => a + s.percentage, 0) / testScores.length),
		[]
	)

	const bestSubject = useMemo(() => {
		const subjectAvgs: Record<string, { total: number; count: number }> = {}
		for (const s of testScores) {
			if (!subjectAvgs[s.subject]) subjectAvgs[s.subject] = { total: 0, count: 0 }
			subjectAvgs[s.subject].total += s.percentage
			subjectAvgs[s.subject].count += 1
		}
		let best = ""
		let bestAvg = 0
		for (const [subject, data] of Object.entries(subjectAvgs)) {
			const avg = data.total / data.count
			if (avg > bestAvg) {
				bestAvg = avg
				best = subject
			}
		}
		return best
	}, [])

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
	if (view === "detail" && selectedResult) {
		const pct = selectedResult.percentage
		return (
			<View style={{ flex: 1, backgroundColor: colors.bg }}>
				<ScreenHeader
					title={selectedResult.test}
					subtitle={`${selectedResult.subject} · ${selectedResult.date}`}
					right={
						<Pressable onPress={() => { setView("list"); setSelectedResult(null) }}>
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
							{selectedResult.score}/{selectedResult.total}
						</Text>
						<Badge text={selectedResult.subject} variant="primary" />
					</View>

					{/* Per-question review */}
					<Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
						Question Review
					</Text>
					{selectedResult.questions.map((q, i) => (
						<Card key={i}>
							<View style={{ flexDirection: "row", gap: 10 }}>
								<View
									style={{
										width: 28,
										height: 28,
										borderRadius: 14,
										backgroundColor: q.correct ? colors.successLight : colors.dangerLight,
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Ionicons
										name={q.correct ? "checkmark" : "close"}
										size={16}
										color={q.correct ? colors.success : colors.danger}
									/>
								</View>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 14, fontWeight: "500", color: colors.text }}>
										{q.text}
									</Text>
									{q.correct ? (
										<Text style={{ fontSize: 12, color: colors.success, marginTop: 4 }}>
											Answer: {q.userAnswer}
										</Text>
									) : (
										<View style={{ marginTop: 4 }}>
											<Text style={{ fontSize: 12, color: colors.danger }}>
												Your answer: {q.userAnswer}
											</Text>
											<Text style={{ fontSize: 12, color: colors.success }}>
												Correct: {q.correctAnswer}
											</Text>
										</View>
									)}
								</View>
							</View>
						</Card>
					))}
				</ScrollView>
			</View>
		)
	}

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader title={t("parent.results")} subtitle="Aarav Thapa · Class 10-A" />
			<ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
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
						value={testScores.length}
						icon={<Ionicons name="document-text" size={22} color={colors.primary} />}
						bgColor={colors.primaryLight}
					/>
				</View>

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

				{/* Test results list */}
				<Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
					{t("parent.testScores")}
				</Text>
				{testScores.map((test) => (
					<Card
						key={test.id}
						onPress={() => {
							setSelectedResult(test)
							setView("detail")
						}}
					>
						<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
							<View style={{ flex: 1 }}>
								<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
									{test.test}
								</Text>
								<Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
									{test.subject} · {test.date} · {test.score}/{test.total}
								</Text>
							</View>
							<View
								style={{
									width: 44,
									height: 44,
									borderRadius: 22,
									backgroundColor: scoreBg(test.percentage),
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<Text style={{ fontSize: 13, fontWeight: "700", color: scoreColor(test.percentage) }}>
									{test.percentage}%
								</Text>
							</View>
						</View>
					</Card>
				))}
			</ScrollView>
		</View>
	)
}
