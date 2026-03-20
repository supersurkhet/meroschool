import { ConvexHttpClient } from 'convex/browser'

let _client: ConvexHttpClient | null = null

function getUrl(): string {
	return (typeof process !== 'undefined' ? process.env?.PUBLIC_CONVEX_URL : '') ?? ''
}

export function getClient(): ConvexHttpClient | null {
	if (_client) return _client
	const url = getUrl()
	if (!url) return null
	_client = new ConvexHttpClient(url)
	return _client
}

/** Get an authenticated Convex client using a JWT token */
export function getAuthClient(token: string): ConvexHttpClient | null {
	const url = getUrl()
	if (!url) return null
	const client = new ConvexHttpClient(url)
	client.setAuth(token)
	return client
}

/** Run a Convex query with graceful fallback */
export async function query<T>(
	functionName: string,
	args: Record<string, any> = {},
	fallback: T,
	token?: string,
): Promise<T> {
	const c = token ? getAuthClient(token) : getClient()
	if (!c) return fallback
	try {
		return (await c.query(functionName as any, args)) ?? fallback
	} catch {
		return fallback
	}
}

/** Run a Convex mutation */
export async function mutate(
	functionName: string,
	args: Record<string, any> = {},
	token?: string,
): Promise<any> {
	const c = token ? getAuthClient(token) : getClient()
	if (!c) throw new Error('Convex not configured — set PUBLIC_CONVEX_URL')
	return c.mutation(functionName as any, args)
}
