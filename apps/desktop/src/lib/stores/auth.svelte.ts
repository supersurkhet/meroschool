// Simulated auth for the desktop admin app.
// In production this would delegate to WorkOS (or another IdP) via Tauri commands.

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin';
  avatarUrl?: string;
}

// ─── Reactive state (Svelte 5 runes) ─────────────────────────────────────────

let user = $state<User | null>(null);
let isAuthenticated = $state<boolean>(false);

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Simulate a login.  In production, swap the body for a Tauri `invoke` call
 * that exchanges credentials with WorkOS and returns a User payload.
 */
export async function login(email: string, password: string): Promise<void> {
  // --- Simulated network delay ---
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Basic guard: reject empty credentials.
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  // Stub user — replace with real IdP response in production.
  const stubUser: User = {
    id: crypto.randomUUID(),
    name: 'School Admin',
    email,
    role: 'admin',
    avatarUrl: undefined,
  };

  user = stubUser;
  isAuthenticated = true;
}

/** Clear the session and reset state. */
export function logout(): void {
  user = null;
  isAuthenticated = false;
}

/** Return the currently authenticated user, or null if not logged in. */
export function getUser(): User | null {
  return user;
}

/**
 * Return true if a user is logged in AND has the 'admin' role.
 * All desktop users are admins, but this guard keeps the intent explicit.
 */
export function isAdmin(): boolean {
  return isAuthenticated && user?.role === 'admin';
}

/** Return true if any user is currently authenticated. */
export function getIsAuthenticated(): boolean {
  return isAuthenticated;
}
