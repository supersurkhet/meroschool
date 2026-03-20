// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user?: {
				id: string
				name: string
				email: string
				role: string
			}
			/** Raw WorkOS JWT for passing to Convex auth */
			sessionToken?: string
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {}
