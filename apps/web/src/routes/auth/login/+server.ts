import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { workos, getClientId } from '$lib/server/auth'

export const GET: RequestHandler = async ({ url }) => {
	const redirectUri = `${url.origin}/auth/callback`

	const authorizationUrl = workos.userManagement.getAuthorizationUrl({
		provider: 'authkit',
		redirectUri,
		clientId: getClientId(),
	})

	throw redirect(302, authorizationUrl)
}
