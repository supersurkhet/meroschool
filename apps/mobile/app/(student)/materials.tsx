import { useState, useCallback } from "react"
import { View, Text, Pressable, FlatList, Linking } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTranslation } from "react-i18next"
import { useTheme } from "@/lib/theme"
import { ScreenHeader } from "@/components/shared/ScreenHeader"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

interface Subject {
	id: string
	name: string
	icon: keyof typeof Ionicons.glyphMap
	moduleCount: number
	color: string
}

interface Module {
	id: string
	name: string
	topicCount: number
	topics: Topic[]
}

interface Topic {
	id: string
	name: string
	materials: Material[]
}

interface Material {
	id: string
	title: string
	type: "video" | "pdf" | "link"
	detail: string
	url: string
}

const subjects: Subject[] = [
	{ id: "1", name: "Mathematics", icon: "calculator-outline", moduleCount: 4, color: "#1A73E8" },
	{ id: "2", name: "Science", icon: "flask-outline", moduleCount: 3, color: "#7C3AED" },
	{ id: "3", name: "English", icon: "language-outline", moduleCount: 3, color: "#059669" },
	{ id: "4", name: "Nepali", icon: "text-outline", moduleCount: 2, color: "#DC2626" },
	{ id: "5", name: "Social Studies", icon: "globe-outline", moduleCount: 3, color: "#EAB308" },
	{ id: "6", name: "Computer", icon: "laptop-outline", moduleCount: 2, color: "#06B6D4" },
]

const subjectModules: Record<string, Module[]> = {
	"1": [
		{
			id: "m1",
			name: "Algebra",
			topicCount: 3,
			topics: [
				{
					id: "t1",
					name: "Linear Equations",
					materials: [
						{ id: "mat1", title: "Introduction to Linear Equations", type: "video", detail: "15 min", url: "https://youtube.com/watch?v=example1" },
						{ id: "mat2", title: "Solving Linear Equations", type: "pdf", detail: "12 pages", url: "https://example.com/linear-eq.pdf" },
						{ id: "mat3", title: "Practice Problems", type: "link", detail: "Khan Academy", url: "https://khanacademy.org/math/algebra" },
					],
				},
				{
					id: "t2",
					name: "Quadratic Equations",
					materials: [
						{ id: "mat4", title: "Quadratic Formula Explained", type: "video", detail: "22 min", url: "https://youtube.com/watch?v=example2" },
						{ id: "mat5", title: "Quadratic Equations Notes", type: "pdf", detail: "18 pages", url: "https://example.com/quadratic.pdf" },
					],
				},
				{
					id: "t3",
					name: "Polynomials",
					materials: [
						{ id: "mat6", title: "Polynomial Operations", type: "video", detail: "18 min", url: "https://youtube.com/watch?v=example3" },
						{ id: "mat7", title: "Polynomial Worksheet", type: "link", detail: "MathIsFun", url: "https://mathisfun.com/polynomials" },
					],
				},
			],
		},
		{
			id: "m2",
			name: "Geometry",
			topicCount: 2,
			topics: [
				{
					id: "t4",
					name: "Triangles",
					materials: [
						{ id: "mat8", title: "Types of Triangles", type: "video", detail: "12 min", url: "https://youtube.com/watch?v=example4" },
						{ id: "mat9", title: "Triangle Properties PDF", type: "pdf", detail: "8 pages", url: "https://example.com/triangles.pdf" },
					],
				},
				{
					id: "t5",
					name: "Circles",
					materials: [
						{ id: "mat10", title: "Circle Theorems", type: "video", detail: "20 min", url: "https://youtube.com/watch?v=example5" },
					],
				},
			],
		},
		{
			id: "m3",
			name: "Trigonometry",
			topicCount: 2,
			topics: [
				{
					id: "t6",
					name: "Basic Ratios",
					materials: [
						{ id: "mat11", title: "Sin, Cos, Tan Explained", type: "video", detail: "25 min", url: "https://youtube.com/watch?v=example6" },
						{ id: "mat12", title: "Trigonometry Reference Sheet", type: "pdf", detail: "4 pages", url: "https://example.com/trig.pdf" },
					],
				},
				{
					id: "t7",
					name: "Applications",
					materials: [
						{ id: "mat13", title: "Heights and Distances", type: "link", detail: "BYJU's", url: "https://byjus.com/trigonometry" },
					],
				},
			],
		},
		{
			id: "m4",
			name: "Statistics",
			topicCount: 2,
			topics: [
				{
					id: "t8",
					name: "Mean, Median, Mode",
					materials: [
						{ id: "mat14", title: "Central Tendency Explained", type: "video", detail: "16 min", url: "https://youtube.com/watch?v=example7" },
					],
				},
				{
					id: "t9",
					name: "Data Representation",
					materials: [
						{ id: "mat15", title: "Bar Graphs and Histograms", type: "pdf", detail: "10 pages", url: "https://example.com/graphs.pdf" },
					],
				},
			],
		},
	],
}

// Use same modules for other subjects (simplified)
for (const id of ["2", "3", "4", "5", "6"]) {
	subjectModules[id] = [
		{
			id: `${id}-m1`,
			name: "Module 1",
			topicCount: 2,
			topics: [
				{
					id: `${id}-t1`,
					name: "Introduction",
					materials: [
						{ id: `${id}-mat1`, title: "Chapter Overview", type: "video", detail: "10 min", url: "https://youtube.com/watch?v=example" },
						{ id: `${id}-mat2`, title: "Chapter Notes", type: "pdf", detail: "6 pages", url: "https://example.com/notes.pdf" },
					],
				},
				{
					id: `${id}-t2`,
					name: "Core Concepts",
					materials: [
						{ id: `${id}-mat3`, title: "Practice Resources", type: "link", detail: "Online", url: "https://example.com/practice" },
					],
				},
			],
		},
	]
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

export default function MaterialsScreen() {
	const { t } = useTranslation()
	const { colors } = useTheme()
	const [level, setLevel] = useState<ViewLevel>("subjects")
	const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
	const [selectedModule, setSelectedModule] = useState<Module | null>(null)
	const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)

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
				<FlatList
					data={subjects}
					numColumns={2}
					contentContainerStyle={{ padding: 20, gap: 12 }}
					columnWrapperStyle={{ gap: 12 }}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
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
										backgroundColor: item.color + "18",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Ionicons name={item.icon} size={26} color={item.color} />
								</View>
								<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
									{item.name}
								</Text>
								<Text style={{ fontSize: 12, color: colors.textSecondary }}>
									{item.moduleCount} {t("student.modules")}
								</Text>
							</View>
						</Card>
					)}
				/>
			)}

			{/* Modules List */}
			{level === "modules" && selectedSubject && (
				<FlatList
					data={subjectModules[selectedSubject.id] ?? []}
					keyExtractor={(item) => item.id}
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
										{item.topicCount} {t("student.topics")} · {item.topics.reduce((a, t2) => a + t2.materials.length, 0)} materials
									</Text>
								</View>
								<Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
							</View>
						</Card>
					)}
				/>
			)}

			{/* Topics List */}
			{level === "topics" && selectedModule && (
				<FlatList
					data={selectedModule.topics}
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ padding: 20, gap: 10 }}
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
										<Text key={m.id} style={{ fontSize: 14 }}>
											{typeEmojis[m.type]}
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
					keyExtractor={(item) => item.id}
					contentContainerStyle={{ padding: 20, gap: 10 }}
					renderItem={({ item }) => (
						<Card onPress={() => openMaterial(item)}>
							<View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
								<View
									style={{
										width: 44,
										height: 44,
										borderRadius: 12,
										backgroundColor: typeColors[item.type] + "18",
										alignItems: "center",
										justifyContent: "center",
									}}
								>
									<Ionicons name={typeIcons[item.type]} size={22} color={typeColors[item.type]} />
								</View>
								<View style={{ flex: 1 }}>
									<Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
										{item.title}
									</Text>
									<Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
										{typeEmojis[item.type]} {item.detail}
									</Text>
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
