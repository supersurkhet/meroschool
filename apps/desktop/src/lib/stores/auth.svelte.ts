// Simulated auth for the desktop admin app.
// In production this would delegate to WorkOS (or another IdP) via Tauri commands.

import { convexMutation, api, isConvexConfigured } from '$lib/convex'

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
}

/** @deprecated Use AuthUser instead */
export type User = AuthUser

// ─── Persistence key ─────────────────────────────────────────────────────────

const STORAGE_KEY = 'meroschool_auth'

// ─── Reactive state (Svelte 5 runes) ─────────────────────────────────────────

let user = $state<AuthUser | null>(null)
let isAuthenticated = $state<boolean>(false)

// Restore from localStorage on module load
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      user = parsed
      isAuthenticated = true
    }
  } catch {}
}

function persist(): void {
  if (typeof window !== 'undefined') {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Simulate a login.  In production, swap the body for a Tauri `invoke` call
 * that exchanges credentials with WorkOS and returns an AuthUser payload.
 * Auth state is persisted to localStorage so it survives page refresh.
 */
export async function login(email: string, password: string): Promise<void> {
  // Basic guard: reject empty credentials.
  if (!email || !password) {
    throw new Error('Email and password are required.')
  }

  // --- Simulated network delay ---
  await new Promise((resolve) => setTimeout(resolve, 600))

  let userId = crypto.randomUUID()

  // Try Convex upsert to get a real user ID
  if (isConvexConfigured()) {
    try {
      userId = await convexMutation(api.auth.upsertUser, {
        name: 'School Admin',
        email,
        workosUserId: 'desktop-admin-' + email,
        role: 'admin',
      })
    } catch {}
  }

  user = { id: userId, name: 'School Admin', email, role: 'admin' }
  isAuthenticated = true
  persist()
}

/** Clear the session and reset state. */
export function logout(): void {
  user = null
  isAuthenticated = false
  persist()
}

/** Return the currently authenticated user, or null if not logged in. */
export function getUser(): AuthUser | null {
  return user
}

/**
 * Return true if a user is logged in AND has the 'admin' role.
 * All desktop users are admins, but this guard keeps the intent explicit.
 */
export function isAdmin(): boolean {
  return isAuthenticated && user?.role === 'admin'
}

/** Return true if any user is currently authenticated. */
export function getIsAuthenticated(): boolean {
  return isAuthenticated
}
