import { redirect } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { workos, getClientId } from '$lib/server/auth'

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code')

	if (!code) {
		throw redirect(302, '/auth/login')
	}

	const { accessToken, user } = await workos.userManagement.authenticateWithCode({
		code,
		clientId: getClientId(),
	})

	cookies.set('session', accessToken, {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 60 * 24 * 7, // 7 days
	})

	// Determine redirect based on user role from metadata
	const role = (user as unknown as Record<string, unknown>).role as string | undefined
		?? 'teacher'

	const roleRedirects: Record<string, string> = {
		admin: '/dashboard/admin',
		teacher: '/dashboard/teacher',
		student: '/dashboard/student',
		parent: '/dashboard/parent',
	}

	const destination = roleRedirects[role] ?? '/dashboard/teacher'
	throw redirect(302, destination)
}
