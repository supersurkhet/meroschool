import { Ionicons } from '@expo/vector-icons'
import { useQuery } from 'convex/react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshControl, ScrollView, Text, View } from 'react-native'
import { ScreenHeader } from '@/components/shared/ScreenHeader'
import { Card, StatCard } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/convex/api'
import { useTheme } from '@/lib/theme'

export default function StudentsScreen() {
	const { t } = useTranslation()
	const { user } = useAuth()
	const { colors } = useTheme()
	const [search, setSearch] = useState('')
	const [refreshing, setRefreshing] = useState(false)

	const sectionId = user?.sectionId as any

	const students = useQuery(api.people.listStudentsBySection, sectionId ? { sectionId } : 'skip')

	const sectionProgress = useQuery(
		api.progress.getSectionProgress,
		sectionId ? { sectionId } : 'skip',
	)

	const onRefresh = useCallback(() => {
		setRefreshing(true)
		setTimeout(() => setRefreshing(false), 1000)
	}, [])

	const studentList: any[] = students ?? []

	const filtered = studentList.filter((s: any) => {
		const name: string = s.name ?? s.user?.name ?? ''
		return name.toLowerCase().includes(search.toLowerCase())
	})

	const avgAttendance =
		sectionProgress?.avgAttendance ??
		(filtered.length > 0
			? Math.round(
					filtered.reduce((acc: number, s: any) => acc + (s.attendance ?? 0), 0) / filtered.length,
				)
			: 0)

	const sectionName = sectionProgress?.sectionName ?? ''

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader title={t('teacher.classRoster')} subtitle={sectionName} />

			<View style={{ paddingHorizontal: 20, paddingTop: 8 }}>
				<Input
					placeholder={t('common.search')}
					value={search}
					onChangeText={setSearch}
					icon={<Ionicons name="search-outline" size={18} color={colors.textMuted} />}
				/>
			</View>

			{/* Stats */}
			<View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, gap: 10 }}>
				<StatCard
					label={t('teacher.totalStudents')}
					value={students === undefined ? '—' : filtered.length}
					icon={<Ionicons name="people" size={20} color="#7C3AED" />}
					bgColor="#EDE9FE"
				/>
				<StatCard
					label="Avg Attendance"
					value={students === undefined ? '—' : filtered.length > 0 ? `${avgAttendance}%` : '0%'}
					icon={<Ionicons name="checkmark-circle" size={20} color={colors.success} />}
					bgColor={colors.successLight}
				/>
			</View>

			<ScrollView
				contentContainerStyle={{ padding: 20, gap: 8, paddingBottom: 40 }}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor={colors.primary}
					/>
				}
			>
				{students === undefined ? (
					<SkeletonList count={5} />
				) : filtered.length === 0 ? (
					<EmptyState
						icon="people-outline"
						title={search ? 'No Students Found' : 'No Students'}
						subtitle={
							search ? `No students matching "${search}"` : 'No students enrolled in this class yet'
						}
					/>
				) : (
					filtered.map((student: any) => {
						const name: string = student.name ?? student.user?.name ?? 'Unknown'
						const roll = student.rollNumber ?? student.roll ?? '—'
						const parentName: string =
							student.parentName ?? student.parent ?? student.user?.parentName ?? '—'
						const attendance: number = student.attendance ?? student.attendancePercent ?? 0
						const avgScore: number = student.avgScore ?? student.averageScore ?? 0

						return (
							<Card key={student._id}>
								<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
									<View
										style={{
											width: 44,
											height: 44,
											borderRadius: 22,
											backgroundColor: '#EDE9FE',
											alignItems: 'center',
											justifyContent: 'center',
										}}
									>
										<Text style={{ fontSize: 16, fontWeight: '700', color: '#7C3AED' }}>
											{name.charAt(0)}
										</Text>
									</View>
									<View style={{ flex: 1 }}>
										<Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
											{roll}. {name}
										</Text>
										<Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
											Parent: {parentName}
										</Text>
									</View>
									<View style={{ alignItems: 'flex-end' }}>
										<Text
											style={{
												fontSize: 13,
												fontWeight: '600',
												color: attendance >= 90 ? colors.success : colors.warning,
											}}
										>
											{attendance}%
										</Text>
										<Text style={{ fontSize: 11, color: colors.textMuted }}>Avg: {avgScore}</Text>
									</View>
								</View>
							</Card>
						)
					})
				)}
			</ScrollView>
		</View>
	)
}
