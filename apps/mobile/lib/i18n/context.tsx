import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import i18n from "./index"

const LANGUAGE_KEY = "@meroschool/language"

type Locale = "en" | "ne"

interface I18nContextValue {
	locale: Locale
	setLocale: (locale: Locale) => void
	t: (key: string) => string
}

const I18nContext = createContext<I18nContextValue>({
	locale: "en",
	setLocale: () => {},
	t: (key: string) => key,
})

/**
 * I18nProvider wraps children with locale context.
 * Reads from AsyncStorage on mount, defaults to 'en'.
 * setLocale persists the preference to AsyncStorage.
 *
 * Note: The app already uses react-i18next (useTranslation) as primary i18n.
 * This context is an additional convenience layer that keeps locale state
 * in sync with i18next and provides a simpler t(key) API.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
	const [locale, setLocaleState] = useState<Locale>((i18n.language as Locale) ?? "en")

	useEffect(() => {
		AsyncStorage.getItem(LANGUAGE_KEY).then((stored) => {
			if (stored === "en" || stored === "ne") {
				setLocaleState(stored)
				i18n.changeLanguage(stored)
			}
		})
	}, [])

	const setLocale = useCallback((next: Locale) => {
		setLocaleState(next)
		i18n.changeLanguage(next)
		AsyncStorage.setItem(LANGUAGE_KEY, next)
	}, [])

	const t = useCallback(
		(key: string) => i18n.t(key),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[locale],
	)

	return (
		<I18nContext.Provider value={{ locale, setLocale, t }}>
			{children}
		</I18nContext.Provider>
	)
}

export const useI18n = () => useContext(I18nContext)
