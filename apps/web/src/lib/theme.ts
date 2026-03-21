import { browser } from '$app/environment'
import { writable } from 'svelte/store'

export type Theme = 'light' | 'dark' | 'system'

function getInitialTheme(): Theme {
	if (!browser) return 'system'
	return (localStorage.getItem('theme') as Theme) ?? 'system'
}

export const theme = writable<Theme>(getInitialTheme())

export function setTheme(t: Theme) {
	theme.set(t)
	if (browser) {
		localStorage.setItem('theme', t)
		applyTheme(t)
	}
}

export function applyTheme(t: Theme) {
	if (!browser) return
	const root = document.documentElement
	if (
		t === 'dark' ||
		(t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
	) {
		root.classList.add('dark')
	} else {
		root.classList.remove('dark')
	}
}
