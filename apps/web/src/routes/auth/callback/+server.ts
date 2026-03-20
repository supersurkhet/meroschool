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

	// Read return_to from cookie (set by login route)
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
		// Convex not configured — continue with session-only auth
	}

	// Set session cookie with JWT
	cookies.set('session', accessToken, {
		httpOnly: true,
		secure: false, // allow http://localhost
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 60 * 24 * 7,
	})

	// Set user info cookie for client-side access
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

	// Redirect to return_to or role-based dashboard
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
