// Stores the active school context after the initial setup wizard is completed.
// Components read this to know which school/year is currently selected.

export interface SchoolContext {
  id: string;
  name: string;
  /** e.g. "2081-82" (Bikram Sambat) or "2024-25" (AD) */
  academicYear: string;
  /** Optional — populated after setup step 1 */
  address?: string;
  /** ISO timestamp of when setup was completed */
  setupCompletedAt?: string;
}

// ─── Reactive state (Svelte 5 runes) ─────────────────────────────────────────

let school = $state<SchoolContext | null>(null);

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Persist the school context after the setup wizard finishes.
 * Overwrites any previously stored context.
 */
export function setSchool(context: SchoolContext): void {
  school = { ...context };
}

/**
 * Return the current school context, or null if setup has not been completed.
 */
export function getSchool(): SchoolContext | null {
  return school;
}

/**
 * Return true when a school context has been saved (i.e., setup is done).
 * Use this to decide whether to redirect new sessions to the setup wizard.
 */
export function isSetupComplete(): boolean {
  return school !== null;
}

/**
 * Clear the school context (e.g., when switching schools or resetting the app).
 */
export function clearSchool(): void {
  school = null;
}

/**
 * Partially update the stored school context without replacing it entirely.
 * Useful for updating the academic year mid-session without re-running setup.
 */
export function updateSchool(patch: Partial<SchoolContext>): void {
  if (school === null) {
    throw new Error('Cannot update school context before setup is complete.');
  }
  school = { ...school, ...patch };
}
