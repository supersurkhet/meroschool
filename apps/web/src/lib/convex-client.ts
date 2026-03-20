import { ConvexHttpClient } from 'convex/browser'

let _client: ConvexHttpClient | null = null
let _authClient: ConvexHttpClient | null = null

function getUrl(): string {
	if (typeof window === 'undefined') return ''
	// @ts-ignore
	return (import.meta.env?.PUBLIC_CONVEX_URL ?? import.meta.env?.VITE_CONVEX_URL ?? '') as string
}

/** Unauthenticated client for public queries */
export function getConvexClient(): ConvexHttpClient | null {
	if (typeof window === 'undefined') return null
	if (_client) return _client
	const url = getUrl()
	if (!url) return null
	_client = new ConvexHttpClient(url)
	return _client
}

/** Authenticated client — call setConvexAuth first */
export function getAuthConvexClient(): ConvexHttpClient | null {
	return _authClient
}

/** Set the auth token for client-side authenticated Convex queries */
export function setConvexAuth(token: string) {
	const url = getUrl()
	if (!url) return
	if (!_authClient) {
		_authClient = new ConvexHttpClient(url)
	}
	_authClient.setAuth(token)
}

/** Clear auth on logout */
export function clearConvexAuth() {
	_authClient = null
}
