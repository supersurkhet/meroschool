import { useState, useCallback } from "react"
import { View, Text, ScrollView, Pressable, Alert, TextInput, ActivityIndicator } from "react-native"
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
import { EmptyState } from "@/components/ui/EmptyState"

type Tab = "pending" | "completed"
type DetailView = "list" | "detail"

// Matches what Convex returns from assignments.getStudentAssignments
interface Assignment {
	_id: string
	title: string
	subjectName?: string
	subject?: string
	description?: string
	dueDate?: string        // formatted string like "Mar 26"
	dueDateMs?: number      // epoch ms for computing urgency
	teacherName?: string
	teacher?: string
	submissionStatus: "pending" | "in-progress" | "submitted" | "graded"
	grade?: string
	score?: number
	totalMarks?: number
	total?: number
	feedback?: string
	submittedAt?: string
	submittedDate?: string
}

const today = new Date()

function getDueStatus(dueDateMs: number | undefined, dueDateStr: string | undefined): { label: string; variant: "success" | "warning" | "danger"; color: string } {
	if (!dueDateMs) {
		return { label: dueDateStr ?? "—", variant: "warning", color: "#EAB308" }
	}
	const diffDays = Math.ceil((dueDateMs - today.getTime()) / (1000 * 60 * 60 * 24))
	if (diffDays < 0) return { label: "Overdue", variant: "danger", color: "#DC2626" }
	if (diffDays === 0) return { label: "Due Today", variant: "danger", color: "#DC2626" }
	if (diffDays <= 3) return { label: `${diffDays}d left`, variant: "warning", color: "#EAB308" }
	return { label: `${diffDays}d left`, variant: "success", color: "#16A34A" }
}

export default function AssignmentsScreen() {
	const { t } = useTranslation()
	const { colors } = useTheme()
	const { user } = useAuth()

	const [tab, setTab] = useState<Tab>("pending")
	const [view, setView] = useState<DetailView>("list")
	const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
	const [submissionText, setSubmissionText] = useState("")
	const [submitting, setSubmitting] = useState(false)

	// Fetch all assignments for this student
	const assignmentsData = useQuery(
		api.assignments.getStudentAssignments,
		user?.studentId && user?.sectionId
			? { studentId: user.studentId as any, sectionId: user.sectionId as any }
			: "skip"
	)

	const submitAssignmentMutation = useMutation(api.assignments.submit)

	const allAssignments: Assignment[] = assignmentsData ?? []

	const pendingAssignments = allAssignments.filter(
		(a) => a.submissionStatus === "pending" || a.submissionStatus === "in-progress"
	)
	const completedAssignments = allAssignments.filter(
		(a) => a.submissionStatus === "submitted" || a.submissionStatus === "graded"
	)

	const isLoading = assignmentsData === undefined

	const handleSubmitAssignment = useCallback(() => {
		if (!submissionText.trim()) {
			Alert.alert("Empty Submission", "Please write something or attach a file before submitting.")
			return
		}
		if (!selectedAssignment || !user?.studentId) return

		Alert.alert("Submit Assignment", "Are you sure you want to submit this assignment?", [
			{ text: t("common.cancel"), style: "cancel" },
			{
				text: t("common.submit"),
				onPress: async () => {
					setSubmitting(true)
					try {
						await submitAssignmentMutation({
							assignmentId: selectedAssignment._id as any,
							studentId: user.studentId as any,
							submissionText,
						} as any)
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
					} catch (err) {
						Alert.alert("Error", "Failed to submit assignment. Please try again.")
					} finally {
						setSubmitting(false)
					}
				},
			},
		])
	}, [submissionText, selectedAssignment, user, submitAssignmentMutation, t])

	const tabs: { key: Tab; label: string; count: number }[] = [
		{ key: "pending", label: t("student.pending"), count: isLoading ? 0 : pendingAssignments.length },
		{ key: "completed", label: t("student.graded"), count: isLoading ? 0 : completedAssignments.length },
	]

	// Detail view for submitting assignment
	if (view === "detail" && selectedAssignment) {
		const status = getDueStatus(selectedAssignment.dueDateMs, selectedAssignment.dueDate)
		return (
			<View style={{ flex: 1, backgroundColor: colors.bg }}>
				<ScreenHeader
					title={selectedAssignment.title}
					subtitle={selectedAssignment.subjectName ?? selectedAssignment.subject}
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
								<Badge text={selectedAssignment.subjectName ?? selectedAssignment.subject ?? "—"} variant="primary" />
								<Badge text={status.label} variant={status.variant} />
							</View>
							<Text style={{ fontSize: 13, color: colors.textSecondary }}>
								By {selectedAssignment.teacherName ?? selectedAssignment.teacher ?? "—"} · Due: {selectedAssignment.dueDate ?? "—"}
							</Text>
							<View style={{ height: 1, backgroundColor: colors.border }} />
							<Text style={{ fontSize: 15, color: colors.text, lineHeight: 22 }}>
								{selectedAssignment.description ?? "No description provided."}
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

						{/* Attach file */}
						<Pressable
							onPress={() => Alert.alert("Attach File", "Select a photo, PDF, or document to attach.")}
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
				{/* Loading state */}
				{isLoading && (
					<View style={{ alignItems: "center", paddingVertical: 40 }}>
						<ActivityIndicator size="large" color={colors.primary} />
					</View>
				)}

				{/* Pending tab */}
				{!isLoading && tab === "pending" && pendingAssignments.length === 0 && (
					<EmptyState
						icon="checkmark-done-outline"
						title="All Caught Up!"
						subtitle="No pending assignments right now."
					/>
				)}

				{!isLoading && tab === "pending" &&
					pendingAssignments.map((a) => {
						const status = getDueStatus(a.dueDateMs, a.dueDate)
						return (
							<Card
								key={a._id}
								onPress={() => {
									setSelectedAssignment(a)
									setView("detail")
								}}
							>
								<View style={{ gap: 8 }}>
									<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
										<Badge text={a.subjectName ?? a.subject ?? "—"} variant="primary" />
										<Badge text={status.label} variant={status.variant} />
									</View>
									<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
										{a.title}
									</Text>
									<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
										<Text style={{ fontSize: 12, color: colors.textSecondary }}>
											By {a.teacherName ?? a.teacher ?? "—"}
										</Text>
										<View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
											<Ionicons name="calendar-outline" size={12} color={status.color} />
											<Text style={{ fontSize: 12, fontWeight: "600", color: status.color }}>
												Due: {a.dueDate ?? "—"}
											</Text>
										</View>
									</View>
								</View>
							</Card>
						)
					})}

				{/* Completed tab */}
				{!isLoading && tab === "completed" && completedAssignments.length === 0 && (
					<EmptyState
						icon="document-outline"
						title="No Completed Assignments"
						subtitle="Submitted assignments will appear here once graded."
					/>
				)}

				{!isLoading && tab === "completed" &&
					completedAssignments.map((a) => (
						<Card key={a._id}>
							<View style={{ gap: 8 }}>
								<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
									<View style={{ flex: 1 }}>
										<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
											{a.title}
										</Text>
										<Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
											{a.subjectName ?? a.subject ?? "—"} · {a.score !== undefined ? `${a.score}/${a.totalMarks ?? a.total}` : ""}{a.submittedAt ?? a.submittedDate ? ` · ${a.submittedAt ?? a.submittedDate}` : ""}
										</Text>
									</View>
									{a.grade && (
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
									)}
								</View>
								{a.feedback ? (
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
								) : null}
							</View>
						</Card>
					))}
			</ScrollView>
		</View>
	)
}
