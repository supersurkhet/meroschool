import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../../convex/_generated/api'

let client: ConvexHttpClient | null = null

export function getConvexClient(): ConvexHttpClient | null {
	if (client) return client
	const url =
		typeof process !== 'undefined'
			? process.env?.PUBLIC_CONVEX_URL
			: undefined
	if (!url) return null
	client = new ConvexHttpClient(url)
	return client
}

// Generic query wrapper that falls back gracefully
export async function convexQuery<T>(
	queryFn: any,
	args: any,
	fallback: T,
): Promise<T> {
	const c = getConvexClient()
	if (!c || !queryFn) return fallback
	try {
		const result = await c.query(queryFn, args)
		return result ?? fallback
	} catch {
		return fallback
	}
}

// Generic mutation wrapper
export async function convexMutation(
	mutationFn: any,
	args: any,
): Promise<any> {
	const c = getConvexClient()
	if (!c) throw new Error('Convex not configured')
	return c.mutation(mutationFn, args)
}

export { api }
