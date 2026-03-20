import { redirect, error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { WorkOS } from '@workos-inc/node'
import { env } from '$env/dynamic/private'
import { mutate } from '$lib/server/convex'

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code')
	if (!code) {
		throw redirect(302, '/auth/login')
	}

	const apiKey = env.WORKOS_API_KEY
	const clientId = env.WORKOS_CLIENT_ID
	if (!apiKey || !clientId) {
		throw error(500, 'WorkOS credentials not configured')
	}

	const workos = new WorkOS(apiKey)

	const { accessToken, user } = await workos.userManagement.authenticateWithCode({
		code,
		clientId,
	})

	// Read return_to from cookie
	const returnTo = cookies.get('auth_return_to') ?? ''
	cookies.delete('auth_return_to', { path: '/' })

	const isOnboarding = returnTo === '/onboard'
	const role = isOnboarding ? 'admin' : 'teacher'

	// Upsert user in Convex
	try {
		await mutate('auth:upsertUser', {
			workosUserId: user.id,
			name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email,
			email: user.email,
			role,
			avatarUrl: user.profilePictureUrl ?? undefined,
		})
	} catch {
		// Convex not configured — session-only auth
	}

	cookies.set('session', accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 60 * 24 * 7,
	})

	cookies.set('user_info', JSON.stringify({
		id: user.id,
		name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
		email: user.email,
		role,
	}), {
		httpOnly: false,
		secure: false,
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 60 * 24 * 7,
	})

	if (returnTo) {
		throw redirect(302, returnTo)
	}

	const roleRedirects: Record<string, string> = {
		admin: '/dashboard/admin',
		teacher: '/dashboard/teacher',
		student: '/dashboard/student',
		parent: '/dashboard/parent',
	}

	throw redirect(302, roleRedirects[role] ?? '/dashboard/teacher')
}
