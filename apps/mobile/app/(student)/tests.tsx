import { Ionicons } from '@expo/vector-icons'
import { useMutation, useQuery } from 'convex/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native'
import { ScreenHeader } from '@/components/shared/ScreenHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/convex/api'
import { useTheme } from '@/lib/theme'

type Tab = 'available' | 'results'
type TestView = 'list' | 'info' | 'taking' | 'result'

interface Question {
	_id: string
	text: string
	options: string[]
	correct: number
}

interface AvailableTest {
	_id: string
	subject?: string
	subjectName?: string
	title: string
	duration: number
	totalMarks: number
	questionCount?: number
	isPublished?: boolean
}

interface PastResult {
	_id: string
	subject?: string
	subjectName?: string
	title?: string
	testTitle?: string
	score: number
	totalMarks?: number
	total?: number
	submittedAt?: string
	date?: string
	percentage?: number
	answers?: { question: string; selected: string; correct: string; isCorrect: boolean }[]
}

function formatTime(seconds: number): string {
	const m = Math.floor(seconds / 60)
	const s = seconds % 60
	return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function TestsScreen() {
	const { t } = useTranslation()
	const { colors } = useTheme()
	const { user } = useAuth()

	const [tab, setTab] = useState<Tab>('available')
	const [view, setView] = useState<TestView>('list')
	const [selectedTest, setSelectedTest] = useState<AvailableTest | null>(null)
	const [selectedResult, setSelectedResult] = useState<PastResult | null>(null)
	const [currentQ, setCurrentQ] = useState(0)
	const [answers, setAnswers] = useState<(number | null)[]>([])
	const [timeLeft, setTimeLeft] = useState(0)
	const [submittingResult, setSubmittingResult] = useState<any | null>(null)
	const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

	// Queries
	const availableTests = useQuery(
		api.tests.listTestsBySubject,
		user?.sectionId ? { subjectId: user.sectionId as any } : 'skip',
	)

	const testQuestions = useQuery(
		api.tests.listQuestionsForStudent,
		selectedTest && view === 'taking' ? { testId: selectedTest._id as any } : 'skip',
	)

	const pastResults = useQuery(
		api.tests.listAttemptsByStudent,
		user?.studentId ? { studentId: user.studentId as any } : 'skip',
	)

	const submitAttempt = useMutation(api.tests.submitAttempt)

	// Normalize available tests: filter published ones
	const publishedTests: AvailableTest[] = (availableTests ?? []).filter(
		(t: any) => t.isPublished !== false,
	)

	const questions: Question[] = testQuestions ?? []
	const totalQuestions = questions.length

	const handleSubmitTest = useCallback(async () => {
		if (timerRef.current) clearInterval(timerRef.current)
		if (!selectedTest || !user?.studentId) {
			setView('result')
			return
		}

		try {
			const formattedAnswers = answers.map((ans, i) => ({
				questionId: questions[i]?._id ?? `q${i}`,
				selectedOption: ans ?? -1,
			}))
			const result = await submitAttempt({
				testId: selectedTest._id as any,
				studentId: user.studentId as any,
				answers: formattedAnswers as any,
			})
			setSubmittingResult(result)
		} catch (err) {
			// Still show local result on error
		}
		setView('result')
	}, [selectedTest, user, answers, questions, submitAttempt])

	// Timer countdown
	useEffect(() => {
		if (view === 'taking' && timeLeft > 0) {
			timerRef.current = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						if (timerRef.current) clearInterval(timerRef.current)
						return 0
					}
					return prev - 1
				})
			}, 1000)
			return () => {
				if (timerRef.current) clearInterval(timerRef.current)
			}
		}
	}, [view])

	// Auto-submit when timer reaches zero
	useEffect(() => {
		if (view === 'taking' && timeLeft === 0) {
			handleSubmitTest()
		}
	}, [timeLeft, view, handleSubmitTest])

	const handleStartTest = useCallback((test: AvailableTest) => {
		setSelectedTest(test)
		setAnswers([])
		setCurrentQ(0)
		setTimeLeft(test.duration * 60)
		setView('taking')
	}, [])

	// Once questions load, init answers array if needed
	useEffect(() => {
		if (view === 'taking' && questions.length > 0 && answers.length !== questions.length) {
			setAnswers(new Array(questions.length).fill(null))
		}
	}, [view, questions.length])

	const handleAnswer = useCallback(
		(optionIndex: number) => {
			setAnswers((prev) => {
				const next = [...prev]
				next[currentQ] = optionIndex
				return next
			})
		},
		[currentQ],
	)

	const confirmSubmit = useCallback(() => {
		const unanswered = answers.filter((a) => a === null).length
		const message =
			unanswered > 0
				? `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`
				: 'Are you sure you want to submit the test?'
		Alert.alert('Submit Test', message, [
			{ text: t('common.cancel'), style: 'cancel' },
			{ text: t('common.submit'), onPress: handleSubmitTest },
		])
	}, [answers, t, handleSubmitTest])

	const resetTest = useCallback(() => {
		setView('list')
		setSelectedTest(null)
		setAnswers([])
		setCurrentQ(0)
		setTimeLeft(0)
		setSelectedResult(null)
		setSubmittingResult(null)
	}, [])

	const score =
		questions.length > 0
			? answers.reduce<number>((acc, ans, i) => acc + (ans === questions[i]?.correct ? 1 : 0), 0)
			: (submittingResult?.score ?? 0)
	const percentage =
		totalQuestions > 0
			? Math.round((score / totalQuestions) * 100)
			: (submittingResult?.percentage ?? 0)

	const scoreColor = (pct: number) => {
		if (pct >= 70) return colors.success
		if (pct >= 40) return colors.warning
		return colors.danger
	}

	const scoreBg = (pct: number) => {
		if (pct >= 70) return colors.successLight
		if (pct >= 40) return colors.warningLight
		return colors.dangerLight
	}

	// Test Taking View
	if (view === 'taking' && selectedTest) {
		// Show loading while questions load
		if (testQuestions === undefined) {
			return (
				<View
					style={{
						flex: 1,
						backgroundColor: colors.bg,
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<ActivityIndicator size="large" color={colors.primary} />
					<Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 12 }}>
						Loading questions...
					</Text>
				</View>
			)
		}

		const q = questions[currentQ]
		if (!q) {
			return (
				<View
					style={{
						flex: 1,
						backgroundColor: colors.bg,
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Text style={{ fontSize: 16, color: colors.textSecondary }}>No questions found</Text>
					<Button title="Back" onPress={resetTest} style={{ marginTop: 16 }} />
				</View>
			)
		}

		const answeredCount = answers.filter((a) => a !== null).length
		const isTimeLow = timeLeft < 60

		return (
			<View style={{ flex: 1, backgroundColor: colors.bg }}>
				<ScreenHeader
					title={selectedTest.title}
					right={
						<Pressable
							onPress={() => {
								Alert.alert('Quit Test', 'Are you sure? Your progress will be lost.', [
									{ text: t('common.cancel'), style: 'cancel' },
									{ text: 'Quit', style: 'destructive', onPress: resetTest },
								])
							}}
						>
							<Ionicons name="close" size={24} color={colors.danger} />
						</Pressable>
					}
				/>

				{/* Timer */}
				<View
					style={{
						flexDirection: 'row',
						justifyContent: 'space-between',
						alignItems: 'center',
						paddingHorizontal: 20,
						paddingVertical: 10,
					}}
				>
					<View
						style={{
							flexDirection: 'row',
							alignItems: 'center',
							gap: 6,
							backgroundColor: isTimeLow ? colors.dangerLight : colors.surfaceAlt,
							paddingHorizontal: 12,
							paddingVertical: 6,
							borderRadius: 10,
						}}
					>
						<Ionicons
							name="time-outline"
							size={16}
							color={isTimeLow ? colors.danger : colors.textSecondary}
						/>
						<Text
							style={{
								fontSize: 16,
								fontWeight: '700',
								fontVariant: ['tabular-nums'],
								color: isTimeLow ? colors.danger : colors.text,
							}}
						>
							{formatTime(timeLeft)}
						</Text>
					</View>
					<Text style={{ fontSize: 13, color: colors.textSecondary }}>
						Q{currentQ + 1} of {totalQuestions}
					</Text>
				</View>

				{/* Progress bar */}
				<View style={{ paddingHorizontal: 20, marginBottom: 8 }}>
					<View style={{ height: 6, backgroundColor: colors.surfaceAlt, borderRadius: 3 }}>
						<View
							style={{
								height: 6,
								backgroundColor: colors.primary,
								borderRadius: 3,
								width: `${((currentQ + 1) / totalQuestions) * 100}%`,
							}}
						/>
					</View>
				</View>

				<ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
					{/* Question */}
					<Text
						style={{
							fontSize: 18,
							fontWeight: '600',
							color: colors.text,
							marginBottom: 24,
							lineHeight: 26,
						}}
					>
						{q.text}
					</Text>

					{/* Options */}
					<View style={{ gap: 10 }}>
						{q.options.map((opt, i) => {
							const isSelected = answers[currentQ] === i
							const optionLabel = String.fromCharCode(65 + i) // A, B, C, D
							return (
								<Pressable
									key={i}
									onPress={() => handleAnswer(i)}
									style={{
										padding: 16,
										borderRadius: 12,
										borderWidth: 2,
										borderColor: isSelected ? colors.primary : colors.border,
										backgroundColor: isSelected ? colors.primaryLight : colors.surface,
									}}
								>
									<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
										<View
											style={{
												width: 30,
												height: 30,
												borderRadius: 15,
												borderWidth: 2,
												borderColor: isSelected ? colors.primary : colors.border,
												backgroundColor: isSelected ? colors.primary : 'transparent',
												alignItems: 'center',
												justifyContent: 'center',
											}}
										>
											{isSelected ? (
												<Ionicons name="checkmark" size={16} color="#FFF" />
											) : (
												<Text style={{ fontSize: 13, fontWeight: '600', color: colors.textMuted }}>
													{optionLabel}
												</Text>
											)}
										</View>
										<Text style={{ fontSize: 15, color: colors.text, flex: 1 }}>{opt}</Text>
									</View>
								</Pressable>
							)
						})}
					</View>
				</ScrollView>

				{/* Question navigation dots */}
				<View style={{ paddingHorizontal: 20, paddingVertical: 8 }}>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={{ gap: 6 }}
					>
						{questions.map((_, i) => (
							<Pressable
								key={i}
								onPress={() => setCurrentQ(i)}
								style={{
									width: 28,
									height: 28,
									borderRadius: 14,
									backgroundColor:
										i === currentQ
											? colors.primary
											: answers[i] !== null
												? colors.successLight
												: colors.surfaceAlt,
									alignItems: 'center',
									justifyContent: 'center',
									borderWidth: i === currentQ ? 0 : 1,
									borderColor: answers[i] !== null ? colors.success : colors.border,
								}}
							>
								<Text
									style={{
										fontSize: 11,
										fontWeight: '700',
										color:
											i === currentQ
												? '#FFF'
												: answers[i] !== null
													? colors.success
													: colors.textMuted,
									}}
								>
									{i + 1}
								</Text>
							</Pressable>
						))}
					</ScrollView>
				</View>

				{/* Navigation buttons */}
				<View
					style={{
						padding: 20,
						paddingBottom: 36,
						flexDirection: 'row',
						gap: 12,
						borderTopWidth: 1,
						borderTopColor: colors.border,
					}}
				>
					{currentQ > 0 && (
						<Button
							title="Previous"
							variant="outline"
							onPress={() => setCurrentQ(currentQ - 1)}
							style={{ flex: 1 }}
							icon={<Ionicons name="chevron-back" size={16} color={colors.primary} />}
						/>
					)}
					{currentQ < totalQuestions - 1 ? (
						<Button
							title="Next"
							onPress={() => setCurrentQ(currentQ + 1)}
							style={{ flex: 1 }}
							icon={<Ionicons name="chevron-forward" size={16} color="#FFF" />}
						/>
					) : (
						<Button
							title={`Submit (${answeredCount}/${totalQuestions})`}
							onPress={confirmSubmit}
							style={{ flex: 1 }}
							icon={<Ionicons name="checkmark-circle" size={16} color="#FFF" />}
						/>
					)}
				</View>
			</View>
		)
	}

	// Result View (after test)
	if (view === 'result' && selectedTest) {
		return (
			<View style={{ flex: 1, backgroundColor: colors.bg }}>
				<ScreenHeader title={t('student.viewResults')} />
				<ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
					{/* Score circle */}
					<View style={{ alignItems: 'center', marginBottom: 24 }}>
						<View
							style={{
								width: 120,
								height: 120,
								borderRadius: 60,
								backgroundColor: scoreBg(percentage),
								alignItems: 'center',
								justifyContent: 'center',
								marginBottom: 16,
							}}
						>
							<Text style={{ fontSize: 36, fontWeight: '800', color: scoreColor(percentage) }}>
								{score}/{totalQuestions}
							</Text>
						</View>
						<Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>
							{percentage >= 70
								? 'Great Job!'
								: percentage >= 40
									? 'Good Effort!'
									: 'Keep Practicing!'}
						</Text>
						<Text style={{ fontSize: 15, color: colors.textSecondary, marginTop: 6 }}>
							{percentage}% on {selectedTest.title}
						</Text>
					</View>

					{/* Per-question review */}
					{questions.length > 0 && (
						<>
							<Text
								style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}
							>
								Question Review
							</Text>
							{questions.map((q, i) => {
								const userAns = answers[i]
								const isCorrect = userAns === q.correct
								return (
									<Card key={q._id} style={{ marginBottom: 8 }}>
										<View style={{ gap: 6 }}>
											<View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
												<Ionicons
													name={isCorrect ? 'checkmark-circle' : 'close-circle'}
													size={20}
													color={isCorrect ? colors.success : colors.danger}
												/>
												<Text
													style={{ fontSize: 14, fontWeight: '600', color: colors.text, flex: 1 }}
												>
													Q{i + 1}: {q.text}
												</Text>
											</View>
											{userAns !== null && (
												<Text
													style={{
														fontSize: 13,
														color: isCorrect ? colors.success : colors.danger,
														marginLeft: 28,
													}}
												>
													Your answer: {q.options[userAns]}
												</Text>
											)}
											{!isCorrect && (
												<Text style={{ fontSize: 13, color: colors.success, marginLeft: 28 }}>
													Correct: {q.options[q.correct]}
												</Text>
											)}
										</View>
									</Card>
								)
							})}
						</>
					)}

					<Button title="Done" onPress={resetTest} style={{ marginTop: 16 }} />
				</ScrollView>
			</View>
		)
	}

	// Test Info Modal View
	if (view === 'info' && selectedTest) {
		const qCount = selectedTest.questionCount ?? 0
		return (
			<View style={{ flex: 1, backgroundColor: colors.bg }}>
				<ScreenHeader
					title="Test Details"
					right={
						<Pressable onPress={() => setView('list')}>
							<Ionicons name="close" size={24} color={colors.textSecondary} />
						</Pressable>
					}
				/>
				<View style={{ flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' }}>
					<View
						style={{
							width: 80,
							height: 80,
							borderRadius: 20,
							backgroundColor: colors.primaryLight,
							alignItems: 'center',
							justifyContent: 'center',
							marginBottom: 20,
						}}
					>
						<Ionicons name="document-text" size={36} color={colors.primary} />
					</View>
					<Text style={{ fontSize: 22, fontWeight: '700', color: colors.text }}>
						{selectedTest.title}
					</Text>
					<Badge text={selectedTest.subjectName ?? selectedTest.subject ?? ''} variant="primary" />
					<View style={{ marginTop: 24, gap: 16, width: '100%' }}>
						{[
							{
								icon: 'time-outline' as const,
								label: 'Duration',
								value: `${selectedTest.duration} minutes`,
							},
							{ icon: 'help-circle-outline' as const, label: 'Questions', value: `${qCount}` },
							{
								icon: 'star-outline' as const,
								label: 'Total Marks',
								value: `${selectedTest.totalMarks}`,
							},
						].map((item) => (
							<View
								key={item.label}
								style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}
							>
								<View
									style={{
										width: 40,
										height: 40,
										borderRadius: 10,
										backgroundColor: colors.surfaceAlt,
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									<Ionicons name={item.icon} size={20} color={colors.textSecondary} />
								</View>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 13, color: colors.textSecondary }}>{item.label}</Text>
									<Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
										{item.value}
									</Text>
								</View>
							</View>
						))}
					</View>
					<Button
						title={t('student.takeTest')}
						onPress={() => handleStartTest(selectedTest)}
						style={{ marginTop: 32, width: '100%' }}
						size="lg"
						icon={<Ionicons name="play" size={18} color="#FFF" />}
					/>
				</View>
			</View>
		)
	}

	// Past result detail view
	if (view === 'info' && selectedResult) {
		const pct =
			selectedResult.percentage ??
			Math.round(
				((selectedResult.score ?? 0) / (selectedResult.totalMarks ?? selectedResult.total ?? 100)) *
					100,
			)
		return (
			<View style={{ flex: 1, backgroundColor: colors.bg }}>
				<ScreenHeader
					title={selectedResult.testTitle ?? selectedResult.title ?? 'Result'}
					subtitle={`${selectedResult.subjectName ?? selectedResult.subject ?? ''} — ${selectedResult.submittedAt ?? selectedResult.date ?? ''}`}
					right={
						<Pressable
							onPress={() => {
								setView('list')
								setSelectedResult(null)
							}}
						>
							<Ionicons name="close" size={24} color={colors.textSecondary} />
						</Pressable>
					}
				/>
				<ScrollView contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 40 }}>
					<View style={{ alignItems: 'center', marginBottom: 12 }}>
						<View
							style={{
								width: 80,
								height: 80,
								borderRadius: 40,
								backgroundColor: scoreBg(pct),
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<Text style={{ fontSize: 24, fontWeight: '800', color: scoreColor(pct) }}>
								{pct}%
							</Text>
						</View>
						<Text style={{ fontSize: 15, color: colors.textSecondary, marginTop: 8 }}>
							{selectedResult.score}/{selectedResult.totalMarks ?? selectedResult.total}
						</Text>
					</View>
					{(selectedResult.answers ?? []).map((a, i) => (
						<Card key={i}>
							<View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
								<Ionicons
									name={a.isCorrect ? 'checkmark-circle' : 'close-circle'}
									size={20}
									color={a.isCorrect ? colors.success : colors.danger}
								/>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 14, fontWeight: '500', color: colors.text }}>
										{a.question}
									</Text>
									<Text
										style={{
											fontSize: 12,
											color: a.isCorrect ? colors.success : colors.danger,
											marginTop: 2,
										}}
									>
										{a.isCorrect
											? `Correct: ${a.correct}`
											: `Your: ${a.selected} | Correct: ${a.correct}`}
									</Text>
								</View>
							</View>
						</Card>
					))}
				</ScrollView>
			</View>
		)
	}

	// Main list view
	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader title={t('student.tests')} />

			{/* Tab switcher */}
			<View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, gap: 8 }}>
				{(['available', 'results'] as Tab[]).map((t2) => (
					<Pressable
						key={t2}
						onPress={() => setTab(t2)}
						style={{
							flex: 1,
							paddingVertical: 10,
							borderRadius: 10,
							backgroundColor: tab === t2 ? colors.primary : colors.surfaceAlt,
							alignItems: 'center',
						}}
					>
						<Text
							style={{
								fontSize: 14,
								fontWeight: '600',
								color: tab === t2 ? '#FFF' : colors.textSecondary,
							}}
						>
							{t2 === 'available' ? t('student.takeTest') : t('student.viewResults')}
						</Text>
					</Pressable>
				))}
			</View>

			<ScrollView contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 40 }}>
				{/* Available Tests Tab */}
				{tab === 'available' && availableTests === undefined && (
					<View style={{ alignItems: 'center', paddingVertical: 40 }}>
						<ActivityIndicator size="large" color={colors.primary} />
					</View>
				)}

				{tab === 'available' && availableTests !== undefined && publishedTests.length === 0 && (
					<View style={{ alignItems: 'center', paddingVertical: 40 }}>
						<Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
						<Text style={{ fontSize: 16, color: colors.textSecondary, marginTop: 12 }}>
							No tests available right now
						</Text>
					</View>
				)}

				{tab === 'available' &&
					publishedTests.map((test) => (
						<Card key={test._id}>
							<View style={{ gap: 8 }}>
								<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
									<Badge text={test.subjectName ?? test.subject ?? '—'} variant="primary" />
									<Badge text={`${test.duration} min`} variant="warning" />
								</View>
								<Text style={{ fontSize: 16, fontWeight: '600', color: colors.text }}>
									{test.title}
								</Text>
								<Text style={{ fontSize: 13, color: colors.textSecondary }}>
									{test.questionCount ? `${test.questionCount} questions · ` : ''}
									{test.totalMarks} marks
								</Text>
								<Button
									title={t('student.takeTest')}
									onPress={() => {
										setSelectedTest(test)
										setView('info')
									}}
									size="sm"
								/>
							</View>
						</Card>
					))}

				{/* Results Tab */}
				{tab === 'results' && pastResults === undefined && (
					<View style={{ alignItems: 'center', paddingVertical: 40 }}>
						<ActivityIndicator size="large" color={colors.primary} />
					</View>
				)}

				{tab === 'results' && pastResults !== undefined && (pastResults as any[]).length === 0 && (
					<View style={{ alignItems: 'center', paddingVertical: 40 }}>
						<Ionicons name="trophy-outline" size={48} color={colors.textMuted} />
						<Text style={{ fontSize: 16, color: colors.textSecondary, marginTop: 12 }}>
							No test results yet
						</Text>
					</View>
				)}

				{tab === 'results' &&
					(pastResults ?? []).map((r: any) => {
						const pct =
							r.percentage ?? Math.round(((r.score ?? 0) / (r.totalMarks ?? r.total ?? 100)) * 100)
						return (
							<Card
								key={r._id}
								onPress={() => {
									setSelectedResult(r)
									setSelectedTest(null)
									setView('info')
								}}
							>
								<View
									style={{
										flexDirection: 'row',
										justifyContent: 'space-between',
										alignItems: 'center',
									}}
								>
									<View style={{ flex: 1 }}>
										<Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
											{r.testTitle ?? r.title ?? 'Test'}
										</Text>
										<Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
											{r.subjectName ?? r.subject ?? '—'} · {r.submittedAt ?? r.date ?? ''} ·{' '}
											{r.score}/{r.totalMarks ?? r.total}
										</Text>
									</View>
									<View
										style={{
											width: 44,
											height: 44,
											borderRadius: 22,
											backgroundColor: scoreBg(pct),
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<Text style={{ fontSize: 13, fontWeight: '700', color: scoreColor(pct) }}>
											{pct}%
										</Text>
									</View>
								</View>
							</Card>
						)
					})}
			</ScrollView>
		</View>
	)
}
