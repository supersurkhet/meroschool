import * as AuthSession from "expo-auth-session"
import * as WebBrowser from "expo-web-browser"
import * as SecureStore from "expo-secure-store"

WebBrowser.maybeCompleteAuthSession()

const WORKOS_CLIENT_ID = process.env.EXPO_PUBLIC_WORKOS_CLIENT_ID ?? "client_01KKYG4JJK79BPD8C3QHRPKVS9"
const WORKOS_BASE_URL = "https://api.workos.com"
const REDIRECT_URI = AuthSession.makeRedirectUri({ scheme: "meroschool" })

const TOKEN_KEY = "meroschool_auth_token"
const REFRESH_TOKEN_KEY = "meroschool_refresh_token"

export interface WorkOSUser {
	id: string
	email: string
	firstName: string | null
	lastName: string | null
	profilePictureUrl: string | null
	organizationId?: string
}

export interface AuthTokens {
	accessToken: string
	refreshToken: string
}

/**
 * Build the WorkOS AuthKit authorization URL.
 * Uses PKCE flow for mobile security.
 */
export function getAuthorizationUrl(codeChallenge: string): string {
	const params = new URLSearchParams({
		client_id: WORKOS_CLIENT_ID,
		redirect_uri: REDIRECT_URI,
		response_type: "code",
		code_challenge: codeChallenge,
		code_challenge_method: "S256",
		provider: "authkit",
	})
	return `${WORKOS_BASE_URL}/user-management/authorize?${params.toString()}`
}

/**
 * Exchange authorization code for tokens.
 */
export async function exchangeCodeForTokens(code: string, codeVerifier: string): Promise<AuthTokens & { user: WorkOSUser }> {
	const response = await fetch(`${WORKOS_BASE_URL}/user-management/authenticate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			client_id: WORKOS_CLIENT_ID,
			code,
			code_verifier: codeVerifier,
			grant_type: "authorization_code",
		}),
	})

	if (!response.ok) {
		const err = await response.text()
		throw new Error(`WorkOS auth failed: ${err}`)
	}

	const data = await response.json()
	return {
		accessToken: data.access_token,
		refreshToken: data.refresh_token,
		user: data.user,
	}
}

/**
 * Refresh access token using refresh token.
 */
export async function refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
	const response = await fetch(`${WORKOS_BASE_URL}/user-management/authenticate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			client_id: WORKOS_CLIENT_ID,
			refresh_token: refreshToken,
			grant_type: "refresh_token",
		}),
	})

	if (!response.ok) {
		throw new Error("Token refresh failed")
	}

	const data = await response.json()
	return {
		accessToken: data.access_token,
		refreshToken: data.refresh_token,
	}
}

/**
 * Store tokens securely.
 */
export async function storeTokens(tokens: AuthTokens): Promise<void> {
	await SecureStore.setItemAsync(TOKEN_KEY, tokens.accessToken)
	await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken)
}

/**
 * Get stored access token.
 */
export async function getStoredToken(): Promise<string | null> {
	return SecureStore.getItemAsync(TOKEN_KEY)
}

/**
 * Get stored refresh token.
 */
export async function getStoredRefreshToken(): Promise<string | null> {
	return SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
}

/**
 * Clear all stored tokens.
 */
export async function clearTokens(): Promise<void> {
	await SecureStore.deleteItemAsync(TOKEN_KEY)
	await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
}

/**
 * Detect role from WorkOS user metadata or organization roles.
 * Falls back to email-based detection for dev.
 */
export function detectRoleFromWorkOS(user: WorkOSUser, orgRole?: string): "student" | "teacher" | "parent" | "admin" {
	// Check organization role first
	if (orgRole) {
		const role = orgRole.toLowerCase()
		if (role.includes("admin")) return "admin"
		if (role.includes("teacher")) return "teacher"
		if (role.includes("parent")) return "parent"
		if (role.includes("student")) return "student"
	}

	// Fallback: detect from email domain patterns
	const email = user.email.toLowerCase()
	if (email.includes("admin")) return "admin"
	if (email.includes("teacher") || email.includes("staff")) return "teacher"
	if (email.includes("parent") || email.includes("guardian")) return "parent"
	return "student"
}

export { REDIRECT_URI, WORKOS_CLIENT_ID }
