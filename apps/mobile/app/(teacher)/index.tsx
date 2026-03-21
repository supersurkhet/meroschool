import { Ionicons } from '@expo/vector-icons'
import { useQuery } from 'convex/react'
import { useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native'
import { ScreenHeader } from '@/components/shared/ScreenHeader'
import { Card, StatCard } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/ui/Skeleton'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/convex/api'
import { useTheme } from '@/lib/theme'

export default function TeacherDashboard() {
	const { t } = useTranslation()
	const { user } = useAuth()
	const { colors } = useTheme()
	const router = useRouter()
	const [refreshing, setRefreshing] = useState(false)

	const subjects = useQuery(
		api.academics.listSubjectsByTeacher,
		user?.teacherId ? { teacherId: user.teacherId as any } : 'skip',
	)

	const sectionProgress = useQuery(
		api.progress.getSectionProgress,
		user?.sectionId ? { sectionId: user.sectionId as any } : 'skip',
	)

	const onRefresh = useCallback(() => {
		setRefreshing(true)
		setTimeout(() => setRefreshing(false), 1000)
	}, [])

	const statusColors: Record<string, { bg: string; text: string; label: string }> = {
		completed: { bg: colors.successLight, text: colors.success, label: 'Done' },
		current: { bg: colors.primaryLight, text: colors.primary, label: 'Now' },
		upcoming: { bg: colors.surfaceAlt, text: colors.textSecondary, label: 'Upcoming' },
	}

	const todaysClasses = subjects ?? []
	const totalStudents = sectionProgress?.totalStudents ?? 0

	return (
		<View style={{ flex: 1, backgroundColor: colors.bg }}>
			<ScreenHeader
				title={`${t('common.welcome')}, ${user?.name?.split(' ')[0]}!`}
				subtitle={user?.schoolName}
				right={
					<Pressable
						onPress={() => router.push('/qr-scan' as any)}
						style={{
							width: 44,
							height: 44,
							borderRadius: 12,
							backgroundColor: '#EDE9FE',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						<Ionicons name="qr-code-outline" size={22} color="#7C3AED" />
					</Pressable>
				}
			/>
			<ScrollView
				contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 40 }}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={onRefresh}
						tintColor={colors.primary}
					/>
				}
			>
				{/* Quick Stats */}
				<View style={{ flexDirection: 'row', gap: 12 }}>
					<StatCard
						label={t('teacher.todaysClasses')}
						value={subjects === undefined ? '—' : todaysClasses.length}
						icon={<Ionicons name="calendar" size={22} color="#7C3AED" />}
						bgColor="#EDE9FE"
					/>
					<StatCard
						label={t('teacher.totalStudents')}
						value={sectionProgress === undefined ? '—' : totalStudents}
						icon={<Ionicons name="people" size={22} color={colors.primary} />}
						bgColor={colors.primaryLight}
					/>
				</View>

				{/* Quick Actions */}
				<View>
					<Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
						{t('teacher.quickActions')}
					</Text>
					<View style={{ flexDirection: 'row', gap: 10 }}>
						{[
							{
								icon: 'checkbox-outline' as const,
								label: t('teacher.markAttendance'),
								color: '#059669',
								bg: '#D1FAE5',
							},
							{
								icon: 'cloud-upload-outline' as const,
								label: t('teacher.uploadMaterial'),
								color: '#1A73E8',
								bg: '#E8F0FE',
							},
							{
								icon: 'create-outline' as const,
								label: t('teacher.createTest'),
								color: '#DC2626',
								bg: '#FEE2E2',
							},
						].map((action, i) => (
							<Pressable
								key={i}
								style={{
									flex: 1,
									backgroundColor: action.bg,
									borderRadius: 14,
									padding: 14,
									alignItems: 'center',
									gap: 8,
								}}
							>
								<Ionicons name={action.icon} size={24} color={action.color} />
								<Text
									style={{
										fontSize: 11,
										fontWeight: '600',
										color: action.color,
										textAlign: 'center',
									}}
								>
									{action.label}
								</Text>
							</Pressable>
						))}
					</View>
				</View>

				{/* Today's Schedule */}
				<View>
					<Text style={{ fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
						{t('teacher.todaysClasses')}
					</Text>

					{subjects === undefined ? (
						<SkeletonList count={3} />
					) : todaysClasses.length === 0 ? (
						<EmptyState
							icon="calendar-outline"
							title="No Classes Today"
							subtitle="Enjoy your day off!"
						/>
					) : (
						todaysClasses.map((cls: any) => {
							const status = cls.status ?? 'upcoming'
							const s = statusColors[status] ?? statusColors.upcoming
							return (
								<Card key={cls._id} style={{ marginBottom: 10 }}>
									<View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
										<View
											style={{ width: 4, height: 48, borderRadius: 2, backgroundColor: s.text }}
										/>
										<View style={{ flex: 1 }}>
											<Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
												{cls.sectionName ?? cls.class ?? '—'}
											</Text>
											<Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
												{cls.subjectName ?? cls.subject ?? '—'} · {cls.room ?? ''}
											</Text>
										</View>
										<View style={{ alignItems: 'flex-end' }}>
											<Text style={{ fontSize: 13, fontWeight: '600', color: colors.text }}>
												{cls.time ?? ''}
											</Text>
											<View
												style={{
													backgroundColor: s.bg,
													paddingHorizontal: 8,
													paddingVertical: 2,
													borderRadius: 6,
													marginTop: 4,
												}}
											>
												<Text style={{ fontSize: 11, fontWeight: '600', color: s.text }}>
													{s.label}
												</Text>
											</View>
										</View>
									</View>
								</Card>
							)
						})
					)}
				</View>
			</ScrollView>
		</View>
	)
}
