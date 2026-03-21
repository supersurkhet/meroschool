import { useTranslation } from 'react-i18next'
import { Pressable, Text, View } from 'react-native'
import i18n, { setStoredLanguage } from '@/lib/i18n'
import { useTheme } from '@/lib/theme'

/**
 * Simple language toggle button: "EN | ने"
 * Switches between English and Nepali.
 */
export function LanguageSwitcher() {
	const { colors } = useTheme()
	const { t } = useTranslation()
	const isEnglish = i18n.language === 'en'

	const toggle = () => {
		const next = isEnglish ? 'ne' : 'en'
		i18n.changeLanguage(next)
		setStoredLanguage(next)
	}

	return (
		<Pressable
			onPress={toggle}
			style={{
				flexDirection: 'row',
				alignItems: 'center',
				backgroundColor: colors.surfaceAlt,
				borderRadius: 8,
				paddingHorizontal: 12,
				paddingVertical: 6,
				gap: 4,
			}}
		>
			<Text
				style={{
					fontSize: 14,
					fontWeight: isEnglish ? '700' : '400',
					color: isEnglish ? colors.primary : colors.textMuted,
				}}
			>
				EN
			</Text>
			<Text style={{ fontSize: 14, color: colors.textMuted }}>|</Text>
			<Text
				style={{
					fontSize: 14,
					fontWeight: !isEnglish ? '700' : '400',
					color: !isEnglish ? colors.primary : colors.textMuted,
				}}
			>
				ने
			</Text>
		</Pressable>
	)
}
