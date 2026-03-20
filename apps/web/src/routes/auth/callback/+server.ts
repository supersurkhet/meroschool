import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { workos, getClientId } from '$lib/server/auth'
import { mutate } from '$lib/server/convex'

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code')

	if (!code) {
		throw redirect(302, '/auth/login')
	}

	const { accessToken, user } = await workos.userManagement.authenticateWithCode({
		code,
		clientId: getClientId(),
	})

	// Upsert user in Convex with admin role for school registration
	// WorkOS user metadata may contain role; default to admin for onboard flow
	const returnTo = url.searchParams.get('return_to')
	const isOnboarding = returnTo === '/onboard'
	const role = isOnboarding ? 'admin' : 'teacher'

	try {
		await mutate('auth:upsertUser', {
			workosUserId: user.id,
			name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email,
			email: user.email,
			role,
			avatarUrl: user.profilePictureUrl ?? undefined,
		})
	} catch {
		// Convex not configured — continue with session-only auth
	}

	cookies.set('session', accessToken, {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 60 * 24 * 7,
	})

	// Store basic user info in a readable cookie for client-side
	const userInfo = JSON.stringify({
		id: user.id,
		name: `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim(),
		email: user.email,
		role,
	})
	cookies.set('user_info', userInfo, {
		httpOnly: false,
		secure: true,
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 60 * 24 * 7,
	})

	// Redirect to return_to if set, otherwise role-based dashboard
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
