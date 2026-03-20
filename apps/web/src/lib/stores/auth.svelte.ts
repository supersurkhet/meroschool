import { writable } from 'svelte/store'

export interface AuthUser {
	id: string
	name: string
	email: string
	role: string
}

export const user = writable<AuthUser | null>(null)
export const isAuthenticated = { subscribe: user.subscribe }
