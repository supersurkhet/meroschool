import en from './en';
import ne from './ne';

export type Locale = 'en' | 'ne';

const translations = { en, ne } as const;

// Module-level $state — works in Svelte 5 rune context (.svelte.ts files
// or inside <script> blocks). For plain .ts modules consumed by components,
// the reactive value is read via the exported getter functions.
let currentLocale = $state<Locale>('en');

/**
 * Resolve a dot-notation key against the current locale's translation map.
 * Falls back to the English value, then the raw key if nothing is found.
 *
 * Example: t('common.save') → 'Save' | 'सेभ गर्नुहोस्'
 */
export function t(key: string): string {
  const parts = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations[currentLocale];

  for (const part of parts) {
    if (value == null || typeof value !== 'object') {
      value = undefined;
      break;
    }
    value = value[part];
  }

  // Fall back to English if the key is missing in the current locale.
  if (value == null || typeof value !== 'string') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fallback: any = translations['en'];
    for (const part of parts) {
      if (fallback == null || typeof fallback !== 'object') {
        fallback = undefined;
        break;
      }
      fallback = fallback[part];
    }
    if (typeof fallback === 'string') return fallback;
    // Last resort: return the raw key so missing translations are visible.
    return key;
  }

  return value;
}

/** Switch the active locale. Triggers reactivity wherever t() is called. */
export function setLocale(locale: Locale): void {
  currentLocale = locale;
}

/** Return the currently active locale. */
export function getLocale(): Locale {
  return currentLocale;
}
