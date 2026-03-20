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

const uploadedMaterials = [
	{ id: "1", title: "Algebra Introduction", type: "video", subject: "Mathematics", class: "Class 10-A", date: "Mar 15", views: 28 },
	{ id: "2", title: "Periodic Table Notes", type: "pdf", subject: "Science", class: "Class 10-A", date: "Mar 14", views: 35 },
	{ id: "3", title: "Grammar Exercises", type: "link", subject: "English", class: "Class 9-B", date: "Mar 13", views: 22 },
]

type UploadType = "video" | "pdf" | "link"

export default function TeacherMaterialsScreen() {
	const { t } = useTranslation()
	const { colors } = useTheme()
	const [showUpload, setShowUpload] = useState(false)
	const [uploadType, setUploadType] = useState<UploadType>("pdf")
	const [refreshing, setRefreshing] = useState(false)

	const onRefresh = useCallback(() => {
		setRefreshing(true)
		setTimeout(() => setRefreshing(false), 1000)
	}, [])

	const typeConfig: Record<UploadType, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }> = {
		video: { icon: "videocam", color: "#DC2626", bg: "#FEE2E2" },
		pdf: { icon: "document", color: "#1A73E8", bg: "#E8F0FE" },
		link: { icon: "link", color: "#059669", bg: "#D1FAE5" },
	}

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
							<Input placeholder="Title" />
							<Input placeholder="Select class" />
							<Input placeholder="Select subject / module" />
							{uploadType === "link" && <Input placeholder="URL" keyboardType="url" />}
							<Button
								title={uploadType === "link" ? t("common.save") : "Choose File & Upload"}
								onPress={() => setShowUpload(false)}
								icon={<Ionicons name="cloud-upload" size={18} color="#FFF" />}
							/>
						</View>
					</Card>
				)}

				{/* Empty state */}
				{uploadedMaterials.length === 0 && !showUpload && (
					<EmptyState
						icon="cloud-upload-outline"
						title="No Materials Yet"
						subtitle="Upload videos, PDFs, or links for your students"
					/>
				)}

				{/* Existing materials */}
				{uploadedMaterials.map((mat) => {
					const cfg = typeConfig[mat.type as UploadType]
					return (
						<Card key={mat.id}>
							<View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
								<View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: cfg.bg, alignItems: "center", justifyContent: "center" }}>
									<Ionicons name={cfg.icon} size={22} color={cfg.color} />
								</View>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>{mat.title}</Text>
									<Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
										{mat.subject} · {mat.class} · {mat.date}
									</Text>
								</View>
								<View style={{ alignItems: "flex-end" }}>
									<Badge text={mat.type.toUpperCase()} variant={mat.type === "video" ? "danger" : mat.type === "pdf" ? "primary" : "success"} />
									<Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
										{mat.views} views
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
