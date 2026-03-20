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

				// Validate expiry
				if (payload.exp && payload.exp * 1000 < Date.now()) {
					event.cookies.delete('session', { path: '/' })
					event.cookies.delete('user_info', { path: '/' })
				} else {
					event.locals.user = {
						id: payload.sub ?? '',
						name: payload.name ?? payload.email?.split('@')[0] ?? '',
						email: payload.email ?? '',
						role: payload.role ?? payload.metadata?.role ?? 'teacher',
					}
					// Pass raw JWT so Convex can authenticate server-side queries
					event.locals.sessionToken = session
				}
			}
		} catch {
			// Invalid token — clear it
			event.cookies.delete('session', { path: '/' })
			event.cookies.delete('user_info', { path: '/' })
		}
	}

	// Protect /dashboard/* routes — redirect to login
	if (event.url.pathname.startsWith('/dashboard') && !event.locals.user) {
		const returnTo = encodeURIComponent(event.url.pathname)
		throw redirect(302, `/auth/login?return_to=${returnTo}`)
	}

	return resolve(event)
}
