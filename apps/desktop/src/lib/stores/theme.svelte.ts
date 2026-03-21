export type Theme = 'light' | 'dark' | 'system'

// Module-level reactive state (Svelte 5 runes).
let theme = $state<Theme>('system')

// ─── Internal helpers ────────────────────────────────────────────────────────

/** Return true if the OS is currently in dark mode. */
function systemPrefersDark(): boolean {
	if (typeof window === 'undefined') return false
	return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** Resolve the effective (rendered) theme, collapsing 'system' to a concrete value. */
function resolvedTheme(): 'light' | 'dark' {
	if (theme === 'system') return systemPrefersDark() ? 'dark' : 'light'
	return theme
}

/** Apply the correct class to <html> so Tailwind / CSS variables pick it up. */
function applyTheme(): void {
	if (typeof document === 'undefined') return
	const root = document.documentElement
	if (resolvedTheme() === 'dark') {
		root.classList.add('dark')
	} else {
		root.classList.remove('dark')
	}
}

// ─── System-preference listener ──────────────────────────────────────────────

if (typeof window !== 'undefined') {
	window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
		// Only re-apply when we are honouring the system setting.
		if (theme === 'system') applyTheme()
	})
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Set the active theme and immediately apply it to the document.
 * Pass 'system' to follow the OS preference automatically.
 */
export function setTheme(next: Theme): void {
	theme = next
	applyTheme()
}

/** Return the current theme setting ('light' | 'dark' | 'system'). */
export function getTheme(): Theme {
	return theme
}

/**
 * Toggle between light and dark.
 * If the current setting is 'system', resolves to the opposite of the OS
 * preference and pins it explicitly.
 */
export function toggleTheme(): void {
	setTheme(resolvedTheme() === 'dark' ? 'light' : 'dark')
}

/** Return the effective rendered theme, collapsing 'system' to a concrete value. */
export function getResolvedTheme(): 'light' | 'dark' {
	return resolvedTheme()
}

// Apply on module load so the correct class is present before first paint.
applyTheme()
