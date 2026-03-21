import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Localization from 'expo-localization'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en'
import ne from './ne'

const LANGUAGE_KEY = '@meroschool/language'

export async function getStoredLanguage(): Promise<string | null> {
	return AsyncStorage.getItem(LANGUAGE_KEY)
}

export async function setStoredLanguage(lang: string): Promise<void> {
	await AsyncStorage.setItem(LANGUAGE_KEY, lang)
}

const deviceLocale = Localization.getLocales()[0]?.languageCode ?? 'en'

i18n.use(initReactI18next).init({
	resources: { en: { translation: en }, ne: { translation: ne } },
	lng: deviceLocale === 'ne' ? 'ne' : 'en',
	fallbackLng: 'en',
	interpolation: { escapeValue: false },
})

// Restore stored language preference
getStoredLanguage().then((lang) => {
	if (lang) i18n.changeLanguage(lang)
})

export default i18n
