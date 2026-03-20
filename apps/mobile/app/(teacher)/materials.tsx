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

type UploadType = "video" | "pdf" | "link"

export default function TeacherMaterialsScreen() {
	const { t } = useTranslation()
	const { user } = useAuth()
	const { colors } = useTheme()
	const [showUpload, setShowUpload] = useState(false)
	const [uploadType, setUploadType] = useState<UploadType>("pdf")
	const [refreshing, setRefreshing] = useState(false)
	const [uploadTitle, setUploadTitle] = useState("")
	const [uploadClass, setUploadClass] = useState("")
	const [uploadSubject, setUploadSubject] = useState("")
	const [uploadUrl, setUploadUrl] = useState("")
	const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
	const [uploading, setUploading] = useState(false)

	const subjects = useQuery(
		api.academics.listSubjectsByTeacher,
		user?.teacherId ? { teacherId: user.teacherId as any } : "skip"
	)

	const materials = useQuery(
		api.materials.listByModule,
		selectedSubjectId ? { moduleId: selectedSubjectId as any } : "skip"
	)

	const uploadMaterial = useMutation(api.materials.upload)

	const onRefresh = useCallback(() => {
		setRefreshing(true)
		setTimeout(() => setRefreshing(false), 1000)
	}, [])

	const typeConfig: Record<UploadType, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
		video: { icon: "videocam", color: "#DC2626", bg: "#FEE2E2" },
		pdf: { icon: "document", color: "#1A73E8", bg: "#E8F0FE" },
		link: { icon: "link", color: "#059669", bg: "#D1FAE5" },
	}

	const handleUpload = useCallback(async () => {
		if (!uploadTitle.trim()) {
			Alert.alert("Missing Title", "Please enter a title for the material.")
			return
		}
		setUploading(true)
		try {
			await uploadMaterial({
				title: uploadTitle,
				type: uploadType,
				url: uploadUrl || undefined,
				subjectId: selectedSubjectId as any,
				teacherId: user?.teacherId as any,
			} as any)
			setShowUpload(false)
			setUploadTitle("")
			setUploadClass("")
			setUploadSubject("")
			setUploadUrl("")
		} catch (err: any) {
			Alert.alert("Upload Failed", err?.message ?? "Could not upload material.")
		} finally {
			setUploading(false)
		}
	}, [uploadTitle, uploadType, uploadUrl, selectedSubjectId, user?.teacherId, uploadMaterial])

	const materialList: any[] = materials ?? []

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader
				title={t("teacher.materials")}
				right={
					<Pressable
						onPress={() => setShowUpload(!showUpload)}
						style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "#EDE9FE", alignItems: "center", justifyContent: "center" }}
					>
						<Ionicons name={showUpload ? "close" : "add"} size={24} color="#7C3AED" />
					</Pressable>
				}
			/>

			<ScrollView
				contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 40 }}
				refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
			>
				{showUpload && (
					<Card style={{ borderColor: "#7C3AED", borderWidth: 1.5 }}>
						<Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 14 }}>
							{t("teacher.uploadMaterial")}
						</Text>

						{/* Type selector */}
						<View style={{ flexDirection: "row", gap: 8, marginBottom: 14 }}>
							{(["video", "pdf", "link"] as UploadType[]).map((type) => {
								const cfg = typeConfig[type]
								return (
									<Pressable
										key={type}
										onPress={() => setUploadType(type)}
										style={{
											flex: 1,
											paddingVertical: 10,
											borderRadius: 10,
											backgroundColor: uploadType === type ? cfg.bg : colors.surfaceAlt,
											alignItems: "center",
											borderWidth: uploadType === type ? 1.5 : 0,
											borderColor: cfg.color,
										}}
									>
										<Ionicons name={cfg.icon} size={20} color={uploadType === type ? cfg.color : colors.textMuted} />
										<Text style={{ fontSize: 12, fontWeight: "600", color: uploadType === type ? cfg.color : colors.textMuted, marginTop: 4 }}>
											{t(`teacher.${type}`)}
										</Text>
									</Pressable>
								)
							})}
						</View>

						<View style={{ gap: 10 }}>
							<Input
								placeholder="Title"
								value={uploadTitle}
								onChangeText={setUploadTitle}
							/>
							<Input
								placeholder="Class"
								value={uploadClass}
								onChangeText={setUploadClass}
							/>
							{/* Subject picker — shows loaded subjects */}
							{subjects === undefined ? (
								<View style={{ height: 44, backgroundColor: colors.surfaceAlt, borderRadius: 10, justifyContent: "center", paddingHorizontal: 14 }}>
									<Text style={{ color: colors.textMuted, fontSize: 14 }}>Loading subjects…</Text>
								</View>
							) : (
								<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44 }}
									contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
									{(subjects as any[]).map((subj) => (
										<Pressable
											key={subj._id}
											onPress={() => {
												setSelectedSubjectId(subj._id)
												setUploadSubject(subj.subjectName ?? subj.name ?? "")
											}}
											style={{
												paddingHorizontal: 14,
												paddingVertical: 8,
												borderRadius: 10,
												backgroundColor: selectedSubjectId === subj._id ? "#EDE9FE" : colors.surfaceAlt,
												borderWidth: selectedSubjectId === subj._id ? 1.5 : 0,
												borderColor: "#7C3AED",
											}}
										>
											<Text style={{ fontSize: 13, fontWeight: "600", color: selectedSubjectId === subj._id ? "#7C3AED" : colors.textSecondary }}>
												{subj.subjectName ?? subj.name ?? "—"}
											</Text>
										</Pressable>
									))}
								</ScrollView>
							)}
							{uploadType === "link" && (
								<Input
									placeholder="URL"
									keyboardType="url"
									value={uploadUrl}
									onChangeText={setUploadUrl}
								/>
							)}
							<Button
								title={uploading ? "Uploading…" : uploadType === "link" ? t("common.save") : "Choose File & Upload"}
								onPress={handleUpload}
								loading={uploading}
								icon={!uploading ? <Ionicons name="cloud-upload" size={18} color="#FFF" /> : undefined}
							/>
						</View>
					</Card>
				)}

				{/* Loading state */}
				{!showUpload && materials === undefined && selectedSubjectId && (
					<SkeletonList count={3} />
				)}

				{/* Empty state */}
				{!showUpload && !selectedSubjectId && (
					<EmptyState
						icon="cloud-upload-outline"
						title="Select a Subject"
						subtitle="Pick a subject above to view its materials"
					/>
				)}

				{!showUpload && selectedSubjectId && materials !== undefined && materialList.length === 0 && (
					<EmptyState
						icon="cloud-upload-outline"
						title="No Materials Yet"
						subtitle="Upload videos, PDFs, or links for your students"
					/>
				)}

				{/* Subject filter chips (shown outside upload form too) */}
				{!showUpload && subjects !== undefined && (subjects as any[]).length > 0 && (
					<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44, marginBottom: -4 }}
						contentContainerStyle={{ gap: 8, paddingVertical: 4 }}>
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

				{/* Existing materials */}
				{materialList.map((mat: any) => {
					const matType: UploadType = (mat.type as UploadType) ?? "pdf"
					const cfg = typeConfig[matType] ?? typeConfig.pdf
					return (
						<Card key={mat._id}>
							<View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
								<View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: cfg.bg, alignItems: "center", justifyContent: "center" }}>
									<Ionicons name={cfg.icon} size={22} color={cfg.color} />
								</View>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{mat.title}</Text>
									<Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
										{mat.subjectName ?? mat.subject ?? "—"} · {mat.sectionName ?? mat.class ?? "—"} · {mat.uploadedAt ?? mat.date ?? ""}
									</Text>
								</View>
								<View style={{ alignItems: "flex-end" }}>
									<Badge
										text={matType.toUpperCase()}
										variant={matType === "video" ? "danger" : matType === "pdf" ? "primary" : "success"}
									/>
									{mat.views != null && (
										<Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
											{mat.views} views
										</Text>
									)}
								</View>
							</View>
						</Card>
					)
				})}
			</ScrollView>
		</View>
	)
}
