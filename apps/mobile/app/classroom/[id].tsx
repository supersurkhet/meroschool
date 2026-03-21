import { Ionicons } from '@expo/vector-icons'
import { useQuery } from 'convex/react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { ScreenHeader } from '@/components/shared/ScreenHeader'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/ui/Skeleton'
import { api } from '@/lib/convex/api'
import { useTheme } from '@/lib/theme'

type Tab = 'materials' | 'tests'

export default function ClassroomScreen() {
	const { id } = useLocalSearchParams<{ id: string }>()
	const { t } = useTranslation()
	const { colors } = useTheme()
	const router = useRouter()
	const [tab, setTab] = useState<Tab>('materials')

	// Fetch subjects for this class/section to get materials and tests
	const subjects = useQuery(api.academics.listSubjectsByClass, id ? { classId: id as any } : 'skip')

	// Get first subject's hierarchy for materials
	const firstSubjectId = (subjects as any[])?.[0]?._id
	const hierarchy = useQuery(
		api.academics.getSubjectHierarchy,
		firstSubjectId ? { subjectId: firstSubjectId as any } : 'skip',
	)

	// Get tests for first subject
	const tests = useQuery(
		api.tests.listTestsBySubject,
		firstSubjectId ? { subjectId: firstSubjectId as any } : 'skip',
	)

	const typeIcons: Record<
		string,
		{ icon: keyof typeof Ionicons.glyphMap; color: string; bg: string }
	> = {
		video: { icon: 'videocam', color: '#DC2626', bg: '#FEE2E2' },
		pdf: { icon: 'document', color: '#1A73E8', bg: '#E8F0FE' },
		link: { icon: 'link', color: '#059669', bg: '#D1FAE5' },
		document: { icon: 'document-text', color: '#7C3AED', bg: '#EDE9FE' },
	}

	// Flatten materials from hierarchy
	const allMaterials: any[] = []
	if (hierarchy) {
		for (const mod of (hierarchy as any).modules ?? []) {
			for (const topic of mod.topics ?? []) {
				for (const mat of topic.materials ?? []) {
					allMaterials.push({ ...mat, topicName: topic.name, moduleName: mod.name })
				}
			}
		}
	}

	const testList: any[] = tests ?? []
	const publishedTests = testList.filter((t: any) => t.isPublished !== false)

	const isLoading = subjects === undefined

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader
				title={t('qr.classSpace')}
				subtitle={id ?? ''}
				right={
					<Pressable onPress={() => router.back()}>
						<Ionicons name="close" size={24} color={colors.textSecondary} />
					</Pressable>
				}
			/>

			{/* Class info banner */}
			<View
				style={{
					marginHorizontal: 20,
					marginTop: 12,
					padding: 16,
					backgroundColor: colors.primaryLight,
					borderRadius: 14,
					flexDirection: 'row',
					alignItems: 'center',
					gap: 12,
				}}
			>
				<View
					style={{
						width: 48,
						height: 48,
						borderRadius: 14,
						backgroundColor: colors.primary,
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Ionicons name="school" size={24} color="#FFF" />
				</View>
				<View>
					<Text style={{ fontSize: 16, fontWeight: '700', color: colors.text }}>
						{(hierarchy as any)?.name ?? id ?? 'Class'}
					</Text>
					<Text style={{ fontSize: 13, color: colors.textSecondary }}>
						{allMaterials.length} materials · {publishedTests.length} tests
					</Text>
				</View>
			</View>

			{/* Tabs */}
			<View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, gap: 8 }}>
				{(['materials', 'tests'] as Tab[]).map((t2) => (
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
							{t2 === 'materials' ? t('qr.classMaterials') : t('qr.classTests')}
						</Text>
					</Pressable>
				))}
			</View>

			<ScrollView contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 40 }}>
				{isLoading && <SkeletonList count={3} />}

				{tab === 'materials' && !isLoading && allMaterials.length === 0 && (
					<EmptyState
						icon="book-outline"
						title="No Materials"
						subtitle="No materials uploaded for this class yet"
					/>
				)}

				{tab === 'materials' &&
					allMaterials.map((mat: any) => {
						const cfg = typeIcons[mat.type] ?? typeIcons.document
						return (
							<Card key={mat._id}>
								<View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
									<View
										style={{
											width: 44,
											height: 44,
											borderRadius: 12,
											backgroundColor: cfg.bg,
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<Ionicons name={cfg.icon} size={22} color={cfg.color} />
									</View>
									<View style={{ flex: 1 }}>
										<Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
											{mat.title}
										</Text>
										<Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
											{mat.moduleName} · {mat.topicName}
										</Text>
									</View>
									<Badge
										text={(mat.type ?? 'pdf').toUpperCase()}
										variant={
											mat.type === 'video' ? 'danger' : mat.type === 'pdf' ? 'primary' : 'success'
										}
									/>
								</View>
							</Card>
						)
					})}

				{tab === 'tests' && !isLoading && publishedTests.length === 0 && (
					<EmptyState
						icon="document-text-outline"
						title="No Tests"
						subtitle="No tests available for this class"
					/>
				)}

				{tab === 'tests' &&
					publishedTests.map((test: any) => (
						<Card key={test._id}>
							<View style={{ gap: 8 }}>
								<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
									<Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
										{test.title}
									</Text>
									<Badge
										text={test.isPublished ? 'Available' : 'Draft'}
										variant={test.isPublished ? 'success' : 'default'}
									/>
								</View>
								<Text style={{ fontSize: 13, color: colors.textSecondary }}>
									{test.totalMarks ?? 0} marks · {test.durationMinutes ?? 0} min
								</Text>
							</View>
						</Card>
					))}
			</ScrollView>
		</View>
	)
}
