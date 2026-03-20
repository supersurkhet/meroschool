import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { workos, getClientId } from '$lib/server/auth'

export const GET: RequestHandler = async ({ url, cookies }) => {
	const returnTo = url.searchParams.get('return_to') ?? ''

	// Store return_to in a cookie — NOT in the redirect URI
	// WorkOS requires exact redirect URI match, so query params break it
	if (returnTo) {
		cookies.set('auth_return_to', returnTo, {
			httpOnly: true,
			secure: false, // allow http://localhost
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 5, // 5 minutes
		})
	}

	// Redirect URI must exactly match what's registered in WorkOS dashboard
	const redirectUri = `${url.origin}/auth/callback`

	const authorizationUrl = workos.userManagement.getAuthorizationUrl({
		provider: 'authkit',
		redirectUri,
		clientId: getClientId(),
	})

	throw redirect(302, authorizationUrl)
}
