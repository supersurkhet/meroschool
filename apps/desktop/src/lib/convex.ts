import { ConvexHttpClient } from 'convex/browser'
import { api } from '../../../../convex/_generated/api'

let client: ConvexHttpClient | null = null

function getClient(): ConvexHttpClient {
	if (client) return client
	const url =
		(import.meta as any).env?.VITE_CONVEX_URL ?? (import.meta as any).env?.PUBLIC_CONVEX_URL ?? ''
	if (!url) throw new Error('VITE_CONVEX_URL is not set')
	client = new ConvexHttpClient(url)
	return client
}

/** Run a Convex query. Returns fallback if Convex is not configured. */
export async function convexQuery(
	queryFn: any,
	args: Record<string, any>,
	fallback?: any,
): Promise<any> {
	try {
		const c = getClient()
		const result = await c.query(queryFn, args)
		return result ?? fallback
	} catch {
		return fallback
	}
}

/** Run a Convex mutation. Throws on failure. */
export async function convexMutation<T = any>(
	mutationFn: any,
	args: Record<string, any>,
): Promise<T> {
	const c = getClient()
	return c.mutation(mutationFn, args)
}

/** Check if Convex is configured (env var present). */
export function isConvexConfigured(): boolean {
	try {
		getClient()
		return true
	} catch {
		return false
	}
}

export { api }
