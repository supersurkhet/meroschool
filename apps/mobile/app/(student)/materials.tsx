import { useState, useCallback } from "react"
import { View, Text, Pressable, FlatList, Linking, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useQuery } from "convex/react"
import { api } from "@/lib/convex/api"
import { useAuth } from "@/lib/auth"
import { useTheme } from "@/lib/theme"
import { ScreenHeader } from "@/components/shared/ScreenHeader"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

// Types matching what the Convex backend returns
interface Subject {
	_id: string
	name: string
	icon?: keyof typeof Ionicons.glyphMap
	color?: string
}

interface Module {
	_id: string
	name: string
	topics: Topic[]
}

interface Topic {
	_id: string
	name: string
	materials: Material[]
}

interface Material {
	_id: string
	title: string
	type: "video" | "pdf" | "link"
	detail?: string
	url: string
}

type ViewLevel = "subjects" | "modules" | "topics" | "materials"

const typeIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
	video: "videocam-outline",
	pdf: "document-outline",
	link: "link-outline",
}
const typeColors: Record<string, string> = {
	video: "#DC2626",
	pdf: "#1A73E8",
	link: "#059669",
}
const typeEmojis: Record<string, string> = {
	video: "🎬",
	pdf: "📄",
	link: "🔗",
}

// Fallback icon/color for subjects that don't specify one
const subjectIconFallback: keyof typeof Ionicons.glyphMap = "book-outline"
const subjectColorFallback = "#1A73E8"

export default function MaterialsScreen() {
	const { t } = useTranslation()
	const { colors } = useTheme()
	const { user } = useAuth()

	const [level, setLevel] = useState<ViewLevel>("subjects")
	const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
	const [selectedModule, setSelectedModule] = useState<Module | null>(null)
	const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)

	// Fetch subjects for the student's class
	const subjectsData = useQuery(
		api.academics.listSubjectsByClass,
		user?.sectionId ? { classId: user.sectionId as any } : "skip"
	)

	// Fetch hierarchy (modules → topics → materials) when a subject is selected
	const hierarchyData = useQuery(
		api.academics.getSubjectHierarchy,
		selectedSubject ? { subjectId: selectedSubject._id as any } : "skip"
	)

	const subjects: Subject[] = subjectsData ?? []
	const modules: Module[] = hierarchyData?.modules ?? []

	// When hierarchy loads, update the selectedModule's topics if we are at topics/materials level
	const currentModuleData = modules.find((m) => m._id === selectedModule?._id) ?? selectedModule

	const goBack = useCallback(() => {
		if (level === "materials") setLevel("topics")
		else if (level === "topics") setLevel("modules")
		else if (level === "modules") {
			setLevel("subjects")
			setSelectedSubject(null)
		}
	}, [level])

	const breadcrumb = () => {
		if (level === "subjects") return t("student.browseBySubject")
		if (level === "modules") return selectedSubject?.name ?? ""
		if (level === "topics") return `${selectedSubject?.name} > ${selectedModule?.name}`
		return `${selectedModule?.name} > ${selectedTopic?.name}`
	}

	const openMaterial = useCallback((mat: Material) => {
		Linking.openURL(mat.url).catch(() => {})
	}, [])

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader
				title={t("student.materials")}
				subtitle={breadcrumb()}
				right={
					level !== "subjects" ? (
						<Pressable onPress={goBack}>
							<Ionicons name="arrow-back" size={24} color={colors.primary} />
						</Pressable>
					) : undefined
				}
			/>

			{/* Subjects Grid */}
			{level === "subjects" && (
				<>
					{subjectsData === undefined && (
						<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
							<ActivityIndicator size="large" color={colors.primary} />
						</View>
					)}

					{subjectsData !== undefined && subjects.length === 0 && (
						<View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
							<Ionicons name="book-outline" size={48} color={colors.textMuted} />
							<Text style={{ fontSize: 16, color: colors.textSecondary, marginTop: 12, textAlign: "center" }}>
								No subjects found
							</Text>
						</View>
					)}

					{subjectsData !== undefined && subjects.length > 0 && (
						<FlatList
							data={subjects}
							numColumns={2}
							contentContainerStyle={{ padding: 20, gap: 12 }}
							columnWrapperStyle={{ gap: 12 }}
							keyExtractor={(item) => item._id}
							renderItem={({ item }) => {
								const iconName = item.icon ?? subjectIconFallback
								const iconColor = item.color ?? subjectColorFallback
								return (
									<Card
										onPress={() => {
											setSelectedSubject(item)
											setLevel("modules")
										}}
										style={{ flex: 1 }}
									>
										<View style={{ alignItems: "center", paddingVertical: 12, gap: 10 }}>
											<View
												style={{
													width: 52,
													height: 52,
													borderRadius: 16,
													backgroundColor: iconColor + "18",
													alignItems: "center",
													justifyContent: "center",
												}}
											>
												<Ionicons name={iconName} size={26} color={iconColor} />
											</View>
											<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
												{item.name}
											</Text>
										</View>
									</Card>
								)
							}}
						/>
					)}
				</>
			)}

			{/* Modules List */}
			{level === "modules" && selectedSubject && (
				<>
					{hierarchyData === undefined && (
						<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
							<ActivityIndicator size="large" color={colors.primary} />
						</View>
					)}

					{hierarchyData !== undefined && modules.length === 0 && (
						<View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 40 }}>
							<Ionicons name="folder-open-outline" size={48} color={colors.textMuted} />
							<Text style={{ fontSize: 16, color: colors.textSecondary, marginTop: 12, textAlign: "center" }}>
								No modules found
							</Text>
						</View>
					)}

					{hierarchyData !== undefined && modules.length > 0 && (
						<FlatList
							data={modules}
							keyExtractor={(item) => item._id}
							contentContainerStyle={{ padding: 20, gap: 10 }}
							renderItem={({ item }) => (
								<Card
									onPress={() => {
										setSelectedModule(item)
										setLevel("topics")
									}}
								>
									<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
										<View style={{ flex: 1 }}>
											<Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
												{item.name}
											</Text>
											<Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
												{item.topics.length} {t("student.topics")} · {item.topics.reduce((a, t2) => a + t2.materials.length, 0)} materials
											</Text>
										</View>
										<Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
									</View>
								</Card>
							)}
						/>
					)}
				</>
			)}

			{/* Topics List */}
			{level === "topics" && currentModuleData && (
				<FlatList
					data={currentModuleData.topics}
					keyExtractor={(item) => item._id}
					contentContainerStyle={{ padding: 20, gap: 10 }}
					ListEmptyComponent={
						<View style={{ alignItems: "center", justifyContent: "center", padding: 40 }}>
							<Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: "center" }}>
								No topics found
							</Text>
						</View>
					}
					renderItem={({ item }) => (
						<Card
							onPress={() => {
								setSelectedTopic(item)
								setLevel("materials")
							}}
						>
							<View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
										{item.name}
									</Text>
									<Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
										{item.materials.length} materials
									</Text>
								</View>
								<View style={{ flexDirection: "row", gap: 4 }}>
									{item.materials.map((m) => (
										<Text key={m._id} style={{ fontSize: 14 }}>
											{typeEmojis[m.type] ?? "📎"}
										</Text>
									))}
								</View>
								<Ionicons name="chevron-forward" size={20} color={colors.textMuted} style={{ marginLeft: 8 }} />
							</View>
						</Card>
					)}
				/>
			)}

			{/* Materials List */}
			{level === "materials" && selectedTopic && (
				<FlatList
					data={selectedTopic.materials}
					keyExtractor={(item) => item._id}
					contentContainerStyle={{ padding: 20, gap: 10 }}
					ListEmptyComponent={
						<View style={{ alignItems: "center", justifyContent: "center", padding: 40 }}>
							<Text style={{ fontSize: 16, color: colors.textSecondary, textAlign: "center" }}>
								No materials found
							</Text>
						</View>
					}
					renderItem={({ item }) => (
						<Card onPress={() => openMaterial(item)}>
							<View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
								<View
									style={{
										width: 44,
										height: 44,
										borderRadius: 12,
										backgroundColor: (typeColors[item.type] ?? "#666") + "18",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Ionicons name={typeIcons[item.type] ?? "document-outline"} size={22} color={typeColors[item.type] ?? "#666"} />
								</View>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
										{item.title}
									</Text>
									{item.detail ? (
										<Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
											{typeEmojis[item.type] ?? "📎"} {item.detail}
										</Text>
									) : null}
								</View>
								<Badge
									text={item.type.toUpperCase()}
									variant={item.type === "video" ? "danger" : item.type === "pdf" ? "primary" : "success"}
								/>
							</View>
						</Card>
					)}
				/>
			)}
		</View>
	)
}
