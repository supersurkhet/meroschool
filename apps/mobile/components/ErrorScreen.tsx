import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import { useTheme } from '@/lib/theme'

interface ErrorScreenProps {
	message?: string
	onRetry?: () => void
}

/**
 * Full-screen error UI with warning icon, message, and retry button.
 */
export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
	const { colors } = useTheme()
	const { t } = useTranslation()

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: colors.bg,
				alignItems: 'center',
				justifyContent: 'center',
				padding: 32,
			}}
		>
			<View
				style={{
					width: 80,
					height: 80,
					borderRadius: 40,
					backgroundColor: colors.dangerLight,
					alignItems: 'center',
					justifyContent: 'center',
					marginBottom: 24,
				}}
			>
				<Ionicons name="warning-outline" size={40} color={colors.danger} />
			</View>

			<Text
				style={{
					fontSize: 20,
					fontWeight: '700',
					color: colors.text,
					marginBottom: 8,
					textAlign: 'center',
				}}
			>
				{t('common.error')}
			</Text>

			<Text
				style={{
					fontSize: 14,
					color: colors.textSecondary,
					textAlign: 'center',
					marginBottom: 24,
					lineHeight: 20,
				}}
			>
				{message ?? t('common.error')}
			</Text>

			{onRetry && (
				<Pressable
					onPress={onRetry}
					style={{
						backgroundColor: colors.primary,
						paddingHorizontal: 24,
						paddingVertical: 12,
						borderRadius: 12,
						flexDirection: 'row',
						alignItems: 'center',
						gap: 8,
					}}
				>
					<Ionicons name="refresh" size={18} color="#FFFFFF" />
					<Text style={{ fontSize: 16, fontWeight: '600', color: '#FFFFFF' }}>
						{t('common.retry')}
					</Text>
				</Pressable>
			)}
		</View>
	)
}
