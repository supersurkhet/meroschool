import { View, Text, ActivityIndicator } from "react-native"
import { useTheme } from "@/lib/theme"
import { useTranslation } from "react-i18next"

interface LoadingScreenProps {
	message?: string
}

/**
 * Centered ActivityIndicator with loading text.
 * Uses theme colors for proper dark mode support.
 */
export function LoadingScreen({ message }: LoadingScreenProps) {
	const { colors } = useTheme()
	const { t } = useTranslation()

	return (
		<View
			style={{
				flex: 1,
				backgroundColor: colors.bg,
				alignItems: "center",
				justifyContent: "center",
				padding: 32,
			}}
		>
			<ActivityIndicator size="large" color={colors.primary} />
			<Text
				style={{
					fontSize: 16,
					color: colors.textSecondary,
					marginTop: 16,
				}}
			>
				{message ?? t("common.loading")}
			</Text>
		</View>
	)
}
