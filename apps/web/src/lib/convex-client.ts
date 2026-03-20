import { ConvexHttpClient } from 'convex/browser'

let _client: ConvexHttpClient | null = null

export function getConvexClient(): ConvexHttpClient | null {
	if (typeof window === 'undefined') return null
	if (_client) return _client
	// @ts-ignore
	const url = (import.meta.env?.PUBLIC_CONVEX_URL ?? import.meta.env?.VITE_CONVEX_URL) as string
	if (!url) return null
	_client = new ConvexHttpClient(url)
	return _client
}
