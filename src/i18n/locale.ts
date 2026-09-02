export type Locale = 'en' | 'tr' | 'vi';

export const DEFAULT_LOCALE: Locale = 'en';

/** Selectable locales, shown with their native endonym. */
export const LOCALES: { key: Locale; label: string }[] = [
  { key: 'en', label: 'English' },
  { key: 'tr', label: 'Türkçe' },
  { key: 'vi', label: 'Tiếng Việt' },
];

export function isSupportedLocale(code: string | undefined | null): code is Locale {
  return code === 'en' || code === 'tr' || code === 'vi';
}
