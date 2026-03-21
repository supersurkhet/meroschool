/**
 * WorkOS AuthKit OAuth flow for Tauri desktop.
 *
 * Flow:
 * 1. Build WorkOS authorization URL with redirect to a local callback page
 * 2. Open the URL in a Tauri webview window (or system browser)
 * 3. Callback page at /auth/callback receives the code
 * 4. Exchange the code for user info via WorkOS API
 * 5. Upsert user in Convex, persist session to localStorage
 */

import { api, convexMutation, isConvexConfigured } from '$lib/convex'

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent'

export interface AuthUser {
	id: string
	name: string
	email: string
	role: UserRole
	avatarUrl?: string
	workosUserId?: string
	accessToken?: string
}

/** @deprecated Use AuthUser instead */
export type User = AuthUser

const STORAGE_KEY = 'meroschool_auth'

// ─── Reactive state ─────────────────────────────────────────────────────────

let user = $state<AuthUser | null>(null)
let isAuthenticated = $state<boolean>(false)

// Restore session from localStorage on module load
if (typeof window !== 'undefined') {
	try {
		const saved = localStorage.getItem(STORAGE_KEY)
		if (saved) {
			const parsed = JSON.parse(saved) as AuthUser
			user = parsed
			isAuthenticated = true
		}
	} catch {
		localStorage.removeItem(STORAGE_KEY)
	}
}

function persist(): void {
	if (typeof window === 'undefined') return
	if (user) {
		// Strip accessToken from persisted data (keep it in-memory only)
		const { accessToken: _, ...safe } = user
		localStorage.setItem(STORAGE_KEY, JSON.stringify(safe))
	} else {
		localStorage.removeItem(STORAGE_KEY)
	}
}

// ─── WorkOS configuration ───────────────────────────────────────────────────

function getWorkOSConfig() {
	const clientId = (import.meta as any).env?.VITE_WORKOS_CLIENT_ID ?? ''
	const apiKey = (import.meta as any).env?.VITE_WORKOS_API_KEY ?? ''
	return { clientId, apiKey }
}

function isWorkOSConfigured(): boolean {
	const { clientId } = getWorkOSConfig()
	return !!clientId
}

/**
 * Build the WorkOS AuthKit authorization URL.
 * Uses the current origin + /auth/callback as the redirect URI.
 */
export function getAuthorizationUrl(): string {
	const { clientId } = getWorkOSConfig()
	if (!clientId) throw new Error('VITE_WORKOS_CLIENT_ID not configured')

	const redirectUri = `${window.location.origin}/auth/callback`
	const params = new URLSearchParams({
		response_type: 'code',
		client_id: clientId,
		redirect_uri: redirectUri,
		provider: 'authkit',
	})

	return `https://api.workos.com/user_management/authorize?${params.toString()}`
}

/**
 * Exchange an authorization code for user info via WorkOS API.
 * Called from the /auth/callback page after the OAuth redirect.
 */
export async function exchangeCodeForUser(code: string): Promise<AuthUser> {
	const { clientId, apiKey } = getWorkOSConfig()
	if (!clientId || !apiKey) {
		throw new Error('WorkOS credentials not configured')
	}

	// Exchange code for access token + user profile
	const response = await fetch('https://api.workos.com/user_management/authenticate', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			grant_type: 'authorization_code',
			client_id: clientId,
			client_secret: apiKey,
			code,
		}),
	})

	if (!response.ok) {
		const err = await response.text()
		throw new Error(`WorkOS auth failed: ${err}`)
	}

	const data = await response.json()
	const workosUser = data.user
	const accessToken = data.access_token

	if (!workosUser?.id) {
		throw new Error('Invalid WorkOS response: no user data')
	}

	const name =
		[workosUser.first_name, workosUser.last_name].filter(Boolean).join(' ').trim() ||
		workosUser.email

	const authUser: AuthUser = {
		id: workosUser.id,
		name,
		email: workosUser.email,
		role: 'admin',
		avatarUrl: workosUser.profile_picture_url ?? undefined,
		workosUserId: workosUser.id,
		accessToken,
	}

	// Upsert into Convex with real WorkOS user ID
	if (isConvexConfigured()) {
		try {
			const convexId = await convexMutation(api.auth.upsertUser, {
				name: authUser.name,
				email: authUser.email,
				workosUserId: authUser.workosUserId!,
				role: 'admin' as const,
				avatarUrl: authUser.avatarUrl,
			})
			authUser.id = convexId
		} catch {
			// Convex upsert failed — continue with WorkOS ID
		}
	}

	user = authUser
	isAuthenticated = true
	persist()

	return authUser
}

/**
 * Start the WorkOS OAuth login flow.
 * Opens the authorization URL — the /auth/callback route handles the rest.
 */
export function startOAuthLogin(): void {
	const url = getAuthorizationUrl()
	window.location.href = url
}

/** Clear the session and reset state. */
export function logout(): void {
	user = null
	isAuthenticated = false
	persist()
}

/** Return the currently authenticated user, or null. */
export function getUser(): AuthUser | null {
	return user
}

/** Return true if logged in with admin role. */
export function isAdmin(): boolean {
	return isAuthenticated && user?.role === 'admin'
}

/** Return true if any user is authenticated. */
export function getIsAuthenticated(): boolean {
	return isAuthenticated
}

/** Check if WorkOS OAuth is available (credentials configured). */
export function isOAuthAvailable(): boolean {
	return isWorkOSConfigured()
}
