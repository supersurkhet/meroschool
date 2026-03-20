import { redirect, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { WorkOS } from '@workos-inc/node'
import { env } from '$env/dynamic/private'

export const GET: RequestHandler = async ({ url, cookies }) => {
	const apiKey = env.WORKOS_API_KEY
	const clientId = env.WORKOS_CLIENT_ID

	if (!apiKey || !clientId) {
		throw error(500, 'WorkOS credentials not configured. Set WORKOS_API_KEY and WORKOS_CLIENT_ID.')
	}

	const returnTo = url.searchParams.get('return_to') ?? ''

	if (returnTo) {
		cookies.set('auth_return_to', returnTo, {
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 5,
		})
	}

	const workos = new WorkOS(apiKey)
	const redirectUri = `${url.origin}/auth/callback`

	const authorizationUrl = workos.userManagement.getAuthorizationUrl({
		provider: 'authkit',
		redirectUri,
		clientId,
	})

	throw redirect(302, authorizationUrl)
}
