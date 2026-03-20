import { useState, useCallback } from "react"
import { View, Text, ScrollView, Pressable, Alert, TextInput } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useTheme } from "@/lib/theme"
import { ScreenHeader } from "@/components/shared/ScreenHeader"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { EmptyState } from "@/components/ui/EmptyState"

type Tab = "pending" | "completed"
type DetailView = "list" | "detail"

interface PendingAssignment {
	id: string
	title: string
	subject: string
	description: string
	dueDate: string
	dueDateObj: Date
	teacher: string
}

interface CompletedAssignment {
	id: string
	title: string
	subject: string
	grade: string
	score: number
	total: number
	feedback: string
	submittedDate: string
}

const today = new Date()

const pendingAssignments: PendingAssignment[] = [
	{
		id: "1",
		title: "Solve exercises 5.1-5.3",
		subject: "Mathematics",
		description: "Complete all exercises from sections 5.1, 5.2, and 5.3 in your textbook. Show all working steps clearly. Submit in your notebook.",
		dueDate: "Mar 26",
		dueDateObj: new Date(2026, 2, 26),
		teacher: "Sita Devi",
	},
	{
		id: "2",
		title: "Write essay on climate change",
		subject: "English",
		description: "Write a 500-word essay on 'Climate Change and Its Impact on Nepal'. Include introduction, body paragraphs, and conclusion. Use at least 3 references.",
		dueDate: "Mar 21",
		dueDateObj: new Date(2026, 2, 21),
		teacher: "Hari Sir",
	},
	{
		id: "3",
		title: "Lab report - Photosynthesis",
		subject: "Science",
		description: "Write a lab report on the photosynthesis experiment conducted in class. Include hypothesis, methodology, observations, and conclusion.",
		dueDate: "Mar 20",
		dueDateObj: new Date(2026, 2, 20),
		teacher: "Ram Sir",
	},
	{
		id: "4",
		title: "Draw map of Nepal with provinces",
		subject: "Social Studies",
		description: "Draw a detailed map of Nepal showing all 7 provinces with their capitals. Color code each province differently.",
		dueDate: "Mar 30",
		dueDateObj: new Date(2026, 2, 30),
		teacher: "Gita Madam",
	},
]

const completedAssignments: CompletedAssignment[] = [
	{
		id: "5",
		title: "Nepal History Timeline",
		subject: "Social Studies",
		grade: "A",
		score: 45,
		total: 50,
		feedback: "Excellent work! Very detailed timeline with accurate dates.",
		submittedDate: "Mar 15",
	},
	{
		id: "6",
		title: "Poem Analysis",
		subject: "Nepali",
		grade: "B+",
		score: 38,
		total: 50,
		feedback: "Good analysis overall, work on vocabulary and figure of speech identification.",
		submittedDate: "Mar 12",
	},
	{
		id: "7",
		title: "Trigonometry Problem Set",
		subject: "Mathematics",
		grade: "A+",
		score: 49,
		total: 50,
		feedback: "Near perfect! Excellent understanding of trigonometric identities.",
		submittedDate: "Mar 8",
	},
]

function getDueStatus(dueDate: Date): { label: string; variant: "success" | "warning" | "danger"; color: string } {
	const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
	if (diffDays < 0) return { label: "Overdue", variant: "danger", color: "#DC2626" }
	if (diffDays === 0) return { label: "Due Today", variant: "danger", color: "#DC2626" }
	if (diffDays <= 3) return { label: `${diffDays}d left`, variant: "warning", color: "#EAB308" }
	return { label: `${diffDays}d left`, variant: "success", color: "#16A34A" }
}

export default function AssignmentsScreen() {
	const { t } = useTranslation()
	const { colors } = useTheme()
	const [tab, setTab] = useState<Tab>("pending")
	const [view, setView] = useState<DetailView>("list")
	const [selectedAssignment, setSelectedAssignment] = useState<PendingAssignment | null>(null)
	const [submissionText, setSubmissionText] = useState("")
	const [submitting, setSubmitting] = useState(false)

	const handleSubmitAssignment = useCallback(() => {
		if (!submissionText.trim()) {
			Alert.alert("Empty Submission", "Please write something or attach a file before submitting.")
			return
		}
		Alert.alert("Submit Assignment", "Are you sure you want to submit this assignment?", [
			{ text: t("common.cancel"), style: "cancel" },
			{
				text: t("common.submit"),
				onPress: () => {
					setSubmitting(true)
					setTimeout(() => {
						setSubmitting(false)
						Alert.alert("Success", "Assignment submitted successfully!", [
							{
								text: "OK",
								onPress: () => {
									setView("list")
									setSubmissionText("")
									setSelectedAssignment(null)
								},
							},
						])
					}, 1000)
				},
			},
		])
	}, [submissionText, t])

	const tabs: { key: Tab; label: string; count: number }[] = [
		{ key: "pending", label: t("student.pending"), count: pendingAssignments.length },
		{ key: "completed", label: t("student.graded"), count: completedAssignments.length },
	]

	// Detail view for submitting assignment
	if (view === "detail" && selectedAssignment) {
		const status = getDueStatus(selectedAssignment.dueDateObj)
		return (
			<View style={{ flex: 1, backgroundColor: colors.bg }}>
				<ScreenHeader
					title={selectedAssignment.title}
					subtitle={selectedAssignment.subject}
					right={
						<Pressable onPress={() => { setView("list"); setSubmissionText("") }}>
							<Ionicons name="close" size={24} color={colors.textSecondary} />
						</Pressable>
					}
				/>
				<ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}>
					{/* Assignment info */}
					<Card>
						<View style={{ gap: 10 }}>
							<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
								<Badge text={selectedAssignment.subject} variant="primary" />
								<Badge text={status.label} variant={status.variant} />
							</View>
							<Text style={{ fontSize: 13, color: colors.textSecondary }}>
								By {selectedAssignment.teacher} · Due: {selectedAssignment.dueDate}
							</Text>
							<View style={{ height: 1, backgroundColor: colors.border }} />
							<Text style={{ fontSize: 15, color: colors.text, lineHeight: 22 }}>
								{selectedAssignment.description}
							</Text>
						</View>
					</Card>

					{/* Submission area */}
					<View style={{ gap: 10 }}>
						<Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
							Your Submission
						</Text>
						<View
							style={{
								backgroundColor: colors.surface,
								borderRadius: 12,
								borderWidth: 1,
								borderColor: colors.border,
								padding: 14,
								minHeight: 150,
							}}
						>
							<TextInput
								multiline
								placeholder="Write your answer or notes here..."
								placeholderTextColor={colors.textMuted}
								value={submissionText}
								onChangeText={setSubmissionText}
								style={{
									fontSize: 15,
									color: colors.text,
									textAlignVertical: "top",
									minHeight: 120,
								}}
							/>
						</View>

						{/* File picker placeholder */}
						<Pressable
							onPress={() => Alert.alert("File Picker", "File picker would open here in production.")}
							style={{
								flexDirection: "row",
								alignItems: "center",
								gap: 10,
								backgroundColor: colors.surfaceAlt,
								padding: 14,
								borderRadius: 12,
								borderWidth: 1,
								borderColor: colors.border,
								borderStyle: "dashed",
							}}
						>
							<Ionicons name="attach" size={20} color={colors.primary} />
							<Text style={{ fontSize: 14, color: colors.primary, fontWeight: "500" }}>
								Attach File (Photo, PDF, Document)
							</Text>
						</Pressable>
					</View>

					<Button
						title={submitting ? "Submitting..." : t("student.submitAssignment")}
						onPress={handleSubmitAssignment}
						loading={submitting}
						size="lg"
						icon={!submitting ? <Ionicons name="send" size={16} color="#FFF" /> : undefined}
					/>
				</ScrollView>
			</View>
		)
	}

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader title={t("student.assignments")} />

			{/* Tabs */}
			<View style={{ flexDirection: "row", paddingHorizontal: 20, paddingTop: 12, gap: 6 }}>
				{tabs.map((t2) => (
					<Pressable
						key={t2.key}
						onPress={() => setTab(t2.key)}
						style={{
							flex: 1,
							paddingVertical: 8,
							borderRadius: 10,
							backgroundColor: tab === t2.key ? colors.primary : colors.surfaceAlt,
							alignItems: "center",
							flexDirection: "row",
							justifyContent: "center",
							gap: 4,
						}}
					>
						<Text
							style={{
								fontSize: 13,
								fontWeight: "600",
								color: tab === t2.key ? "#FFF" : colors.textSecondary,
							}}
						>
							{t2.label}
						</Text>
						<View
							style={{
								backgroundColor: tab === t2.key ? "rgba(255,255,255,0.3)" : colors.border,
								borderRadius: 8,
								paddingHorizontal: 6,
								paddingVertical: 1,
							}}
						>
							<Text
								style={{
									fontSize: 11,
									fontWeight: "700",
									color: tab === t2.key ? "#FFF" : colors.textMuted,
								}}
							>
								{t2.count}
							</Text>
						</View>
					</Pressable>
				))}
			</View>

			<ScrollView contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 40 }}>
				{tab === "pending" && pendingAssignments.length === 0 && (
					<EmptyState
						icon="checkmark-done-outline"
						title="All Caught Up!"
						subtitle="No pending assignments right now."
					/>
				)}

				{tab === "pending" &&
					pendingAssignments.map((a) => {
						const status = getDueStatus(a.dueDateObj)
						return (
							<Card
								key={a.id}
								onPress={() => {
									setSelectedAssignment(a)
									setView("detail")
								}}
							>
								<View style={{ gap: 8 }}>
									<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
										<Badge text={a.subject} variant="primary" />
										<Badge text={status.label} variant={status.variant} />
									</View>
									<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
										{a.title}
									</Text>
									<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
										<Text style={{ fontSize: 12, color: colors.textSecondary }}>
											By {a.teacher}
										</Text>
										<View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
											<Ionicons name="calendar-outline" size={12} color={status.color} />
											<Text style={{ fontSize: 12, fontWeight: "600", color: status.color }}>
												Due: {a.dueDate}
											</Text>
										</View>
									</View>
								</View>
							</Card>
						)
					})}

				{tab === "completed" && completedAssignments.length === 0 && (
					<EmptyState
						icon="document-outline"
						title="No Completed Assignments"
						subtitle="Submitted assignments will appear here once graded."
					/>
				)}

				{tab === "completed" &&
					completedAssignments.map((a) => (
						<Card key={a.id}>
							<View style={{ gap: 8 }}>
								<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
									<View style={{ flex: 1 }}>
										<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
											{a.title}
										</Text>
										<Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
											{a.subject} · {a.score}/{a.total} · {a.submittedDate}
										</Text>
									</View>
									<View
										style={{
											width: 40,
											height: 40,
											borderRadius: 20,
											backgroundColor: colors.successLight,
											alignItems: "center",
											justifyContent: "center",
										}}
									>
										<Text style={{ fontSize: 14, fontWeight: "700", color: colors.success }}>
											{a.grade}
										</Text>
									</View>
								</View>
								{a.feedback && (
									<View
										style={{
											backgroundColor: colors.surfaceAlt,
											borderRadius: 8,
											padding: 10,
										}}
									>
										<Text
											style={{
												fontSize: 13,
												color: colors.textSecondary,
												fontStyle: "italic",
												lineHeight: 18,
											}}
										>
											{"\u201C"}{a.feedback}{"\u201D"}
										</Text>
									</View>
								)}
							</View>
						</Card>
					))}
			</ScrollView>
		</View>
	)
}
