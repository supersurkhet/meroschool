import { Text, View } from 'react-native'
import { useTheme } from '@/lib/theme'

interface BadgeProps {
	text: string
	variant?: 'default' | 'success' | 'warning' | 'danger' | 'primary'
}

export function Badge({ text, variant = 'default' }: BadgeProps) {
	const { colors } = useTheme()
	const variantStyles = {
		default: { bg: colors.surfaceAlt, text: colors.textSecondary },
		success: { bg: colors.successLight, text: colors.success },
		warning: { bg: colors.warningLight, text: colors.warning },
		danger: { bg: colors.dangerLight, text: colors.danger },
		primary: { bg: colors.primaryLight, text: colors.primary },
	}
	const s = variantStyles[variant]
	return (
		<View
			style={{
				backgroundColor: s.bg,
				paddingHorizontal: 10,
				paddingVertical: 4,
				borderRadius: 8,
				alignSelf: 'flex-start',
			}}
		>
			<Text style={{ fontSize: 12, fontWeight: '600', color: s.text }}>{text}</Text>
		</View>
	)
}
