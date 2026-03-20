import { ConvexHttpClient } from 'convex/browser'

let _client: ConvexHttpClient | null = null

export function getClient(): ConvexHttpClient | null {
	if (_client) return _client
	const url =
		typeof process !== 'undefined'
			? process.env?.PUBLIC_CONVEX_URL
			: undefined
	if (!url) return null
	_client = new ConvexHttpClient(url)
	return _client
}

export async function query<T>(
	functionName: string,
	args: Record<string, any> = {},
	fallback: T,
): Promise<T> {
	const c = getClient()
	if (!c) return fallback
	try {
		return (await c.query(functionName as any, args)) ?? fallback
	} catch {
		return fallback
	}
}

export async function mutate(
	functionName: string,
	args: Record<string, any> = {},
): Promise<any> {
	const c = getClient()
	if (!c) throw new Error('Convex not configured — set PUBLIC_CONVEX_URL')
	return c.mutation(functionName as any, args)
}
