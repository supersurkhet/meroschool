import { ConvexHttpClient } from "convex/browser"

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL ?? ""

let _client: ConvexHttpClient | null = null

export function getConvexClient(): ConvexHttpClient | null {
	if (_client) return _client
	if (!CONVEX_URL) return null
	_client = new ConvexHttpClient(CONVEX_URL)
	return _client
}

export async function convexQuery<T>(
	fn: string,
	args: Record<string, any> = {},
	fallback: T,
): Promise<T> {
	const c = getConvexClient()
	if (!c) return fallback
	try {
		return ((await c.query(fn as any, args)) as T) ?? fallback
	} catch {
		return fallback
	}
}

export async function convexMutate(
	fn: string,
	args: Record<string, any> = {},
): Promise<any> {
	const c = getConvexClient()
	if (!c) throw new Error("Convex not configured")
	return c.mutation(fn as any, args)
}
