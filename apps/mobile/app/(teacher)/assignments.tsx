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

export default function TeacherAssignmentsScreen() {
	const { t } = useTranslation()
	const { user } = useAuth()
	const { colors } = useTheme()
	const [showCreate, setShowCreate] = useState(false)
	const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null)
	const [viewSubmissions, setViewSubmissions] = useState(false)
	const [refreshing, setRefreshing] = useState(false)

	// Create form state
	const [assignTitle, setAssignTitle] = useState("")
	const [assignDescription, setAssignDescription] = useState("")
	const [assignDueDate, setAssignDueDate] = useState("")
	const [creating, setCreating] = useState(false)

	const sectionId = user?.sectionId as any

	// Queries
	const assignments = useQuery(
		api.assignments.listBySection,
		sectionId ? { sectionId } : "skip"
	)

	const submissions = useQuery(
		api.assignments.listSubmissions,
		selectedAssignmentId ? { assignmentId: selectedAssignmentId as any } : "skip"
	)

	// Mutations
	const createAssignment = useMutation(api.assignments.create)
	const gradeAssignment = useMutation(api.assignments.grade)

	const onRefresh = useCallback(() => {
		setRefreshing(true)
		setTimeout(() => setRefreshing(false), 1000)
	}, [])

	const handleCreate = useCallback(async () => {
		if (!assignTitle.trim()) {
			Alert.alert("Missing Title", "Please enter an assignment title.")
			return
		}
		setCreating(true)
		try {
			await createAssignment({
				title: assignTitle,
				description: assignDescription || undefined,
				sectionId,
				teacherId: user?.teacherId as any,
				dueDate: assignDueDate || undefined,
			} as any)
			setShowCreate(false)
			setAssignTitle("")
			setAssignDescription("")
			setAssignDueDate("")
		} catch (err: any) {
			Alert.alert("Error", err?.message ?? "Failed to create assignment.")
		} finally {
			setCreating(false)
		}
	}, [assignTitle, assignDescription, assignDueDate, sectionId, user?.teacherId, createAssignment])

	const handleGrade = useCallback(async (submissionId: string, grade: string) => {
		try {
			await gradeAssignment({ submissionId: submissionId as any, grade } as any)
		} catch (err: any) {
			Alert.alert("Error", err?.message ?? "Failed to save grade.")
		}
	}, [gradeAssignment])

	const openGradeDialog = useCallback((submissionId: string, studentName: string) => {
		Alert.prompt(
			"Grade Submission",
			`Enter grade for ${studentName}:`,
			[
				{ text: t("common.cancel"), style: "cancel" },
				{
					text: "Save",
					onPress: (grade: string | undefined) => {
						if (grade?.trim()) handleGrade(submissionId, grade.trim())
					},
				},
			],
			"plain-text"
		)
	}, [handleGrade, t])

	const assignmentList: any[] = assignments ?? []
	const submissionList: any[] = submissions ?? []

	const selectedAssignment = assignmentList.find((a) => a._id === selectedAssignmentId)

	if (viewSubmissions && selectedAssignmentId) {
		return (
			<View style={{ flex: 1, backgroundColor: colors.bg }}>
				<ScreenHeader
					title="Submissions"
					subtitle={selectedAssignment?.title ?? ""}
					right={
						<Pressable onPress={() => setViewSubmissions(false)}>
							<Ionicons name="arrow-back" size={24} color={colors.primary} />
						</Pressable>
					}
				/>
				<ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
					{submissions === undefined ? (
						<SkeletonList count={4} />
					) : submissionList.length === 0 ? (
						<EmptyState
							icon="document-outline"
							title="No Submissions Yet"
							subtitle="Students haven't submitted this assignment yet"
						/>
					) : (
						submissionList.map((sub: any) => (
							<Card key={sub._id}>
								<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
									<View>
										<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
											{sub.studentName ?? sub.student ?? "Unknown"}
										</Text>
										<Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
											Submitted: {sub.submittedAt ?? sub.submittedDate ?? "—"}
										</Text>
									</View>
									{sub.grade ? (
										<Badge text={sub.grade} variant="success" />
									) : (
										<Button
											title={t("teacher.grade")}
											size="sm"
											variant="outline"
											onPress={() => openGradeDialog(sub._id, sub.studentName ?? sub.student ?? "student")}
										/>
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
						<Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 14 }}>
							{t("teacher.createAssignment")}
						</Text>
						<View style={{ gap: 10 }}>
							<Input
								placeholder="Assignment title"
								value={assignTitle}
								onChangeText={setAssignTitle}
							/>
							<Input
								placeholder="Description"
								multiline
								numberOfLines={3}
								style={{ height: 80, textAlignVertical: "top" }}
								value={assignDescription}
								onChangeText={setAssignDescription}
							/>
							<Input
								placeholder="Due date"
								value={assignDueDate}
								onChangeText={setAssignDueDate}
							/>
							<Button
								title={creating ? "Creating…" : t("teacher.createAssignment")}
								onPress={handleCreate}
								loading={creating}
							/>
						</View>
					</Card>
				)}

				{/* Loading state */}
				{!showCreate && assignments === undefined && sectionId && (
					<SkeletonList count={3} />
				)}

				{/* Empty state */}
				{!showCreate && assignments !== undefined && assignmentList.length === 0 && (
					<EmptyState
						icon="clipboard-outline"
						title="No Assignments"
						subtitle="Create your first assignment using the + button"
					/>
				)}

				{assignmentList.map((a: any) => {
					const submissionsCount = a.submissionsCount ?? a.submissions ?? 0
					const total = a.totalStudents ?? a.total ?? 0
					const ratio = total > 0 ? submissionsCount / total : 0

					return (
						<Card
							key={a._id}
							onPress={() => {
								setSelectedAssignmentId(a._id)
								if (a.status !== "active") setViewSubmissions(true)
							}}
						>
							<View style={{ gap: 8 }}>
								<View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
									<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text, flex: 1 }}>{a.title}</Text>
									<Badge
										text={a.status ?? "active"}
										variant={
											a.status === "active" || !a.status
												? "primary"
												: a.status === "grading"
												? "warning"
												: "success"
										}
									/>
								</View>
								<Text style={{ fontSize: 13, color: colors.textSecondary }}>
									{a.sectionName ?? a.class ?? "—"} · Due: {a.dueDate ?? "—"}
								</Text>
								{/* Progress bar */}
								{total > 0 && (
									<View style={{ gap: 4 }}>
										<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
											<Text style={{ fontSize: 12, color: colors.textMuted }}>Submissions</Text>
											<Text style={{ fontSize: 12, fontWeight: "600", color: colors.text }}>
												{submissionsCount}/{total}
											</Text>
										</View>
										<View style={{ height: 6, backgroundColor: colors.surfaceAlt, borderRadius: 3 }}>
											<View
												style={{
													height: 6,
													borderRadius: 3,
													backgroundColor: ratio >= 1 ? colors.success : "#7C3AED",
													width: `${ratio * 100}%`,
												}}
											/>
										</View>
									</View>
								)}
							</View>
						</Card>
					)
				})}
			</ScrollView>
		</View>
	)
}
