import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { workos, getClientId } from '$lib/server/auth'

export const GET: RequestHandler = async ({ url }) => {
	const returnTo = url.searchParams.get('return_to') ?? ''
	const callbackUrl = new URL('/auth/callback', url.origin)
	if (returnTo) {
		callbackUrl.searchParams.set('return_to', returnTo)
	}

	const authorizationUrl = workos.userManagement.getAuthorizationUrl({
		provider: 'authkit',
		redirectUri: callbackUrl.toString(),
		clientId: getClientId(),
	})

	throw redirect(302, authorizationUrl)
}
