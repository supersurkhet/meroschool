import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '@/lib/theme'

interface ScreenHeaderProps {
	title: string
	subtitle?: string
	right?: React.ReactNode
}

export function ScreenHeader({ title, subtitle, right }: ScreenHeaderProps) {
	const { colors } = useTheme()
	const insets = useSafeAreaInsets()
	return (
		<View
			style={{
				paddingTop: insets.top + 8,
				paddingHorizontal: 20,
				paddingBottom: 16,
				backgroundColor: colors.bg,
				borderBottomWidth: 1,
				borderBottomColor: colors.border,
			}}
		>
			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
				<View style={{ flex: 1 }}>
					<Text style={{ fontSize: 28, fontWeight: '800', color: colors.text }}>{title}</Text>
					{subtitle && (
						<Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 2 }}>
							{subtitle}
						</Text>
					)}
				</View>
				{right}
			</View>
		</View>
	)
}
