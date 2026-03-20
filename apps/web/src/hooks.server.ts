import type { Handle } from '@sveltejs/kit'
import { redirect } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
	const session = event.cookies.get('session')

	if (session) {
		try {
			// Decode the JWT payload (base64url) to extract user info
			const parts = session.split('.')
			if (parts.length === 3) {
				const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
				event.locals.user = {
					id: payload.sub ?? '',
					name: payload.name ?? payload.email ?? '',
					email: payload.email ?? '',
					role: payload.role ?? 'teacher',
				}
			}
		} catch {
			// Invalid token — clear it
			event.cookies.delete('session', { path: '/' })
		}
	}

	// Protect /dashboard/* routes
	if (event.url.pathname.startsWith('/dashboard') && !event.locals.user) {
		throw redirect(302, '/auth/login')
	}

	return resolve(event)
}
