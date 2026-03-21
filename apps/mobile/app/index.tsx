import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '@/lib/auth'
import { useTheme } from '@/lib/theme'

export default function IndexScreen() {
	const { user, isLoading } = useAuth()
	const { colors } = useTheme()
	const router = useRouter()

	useEffect(() => {
		if (isLoading) return
		if (!user) {
			router.replace('/(auth)/login')
		} else {
			router.replace(`/(${user.role})` as any)
		}
	}, [user, isLoading])

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: colors.bg,
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<ActivityIndicator size="large" color={colors.primary} />
		</View>
	)
}
