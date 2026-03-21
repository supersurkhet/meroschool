import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useTheme } from '@/lib/theme'

export default function StudentLayout() {
	const { t } = useTranslation()
	const { colors } = useTheme()

	return (
		<ErrorBoundary>
			<Tabs
				screenOptions={{
					headerShown: false,
					tabBarStyle: {
						backgroundColor: colors.tabBar,
						borderTopColor: colors.tabBarBorder,
						height: 88,
						paddingBottom: 28,
						paddingTop: 8,
					},
					tabBarActiveTintColor: colors.tabActive,
					tabBarInactiveTintColor: colors.tabInactive,
					tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
				}}
			>
				<Tabs.Screen
					name="index"
					options={{
						title: t('student.dashboard'),
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="grid-outline" size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="materials"
					options={{
						title: t('student.materials'),
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="book-outline" size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="tests"
					options={{
						title: t('student.tests'),
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="document-text-outline" size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="assignments"
					options={{
						title: t('student.assignments'),
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="clipboard-outline" size={size} color={color} />
						),
					}}
				/>
				<Tabs.Screen
					name="profile"
					options={{
						title: t('common.profile'),
						tabBarIcon: ({ color, size }) => (
							<Ionicons name="person-outline" size={size} color={color} />
						),
					}}
				/>
			</Tabs>
		</ErrorBoundary>
	)
}
