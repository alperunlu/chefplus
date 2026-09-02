import { useMemo } from 'react';
import { en, type AppStrings } from './en';
import { tr } from './tr';
import { vi } from './vi';
import { useI18nStore } from '../store/useI18nStore';
import type { Locale } from './locale';

export const STRINGS: Record<Locale, AppStrings> = {
  en,
  tr,
  vi,
};

export function useI18n(): { locale: Locale; strings: AppStrings } {
  const locale = useI18nStore((s) => s.locale);
  return useMemo(
    () => ({
      locale,
      strings: STRINGS[locale] ?? en,
    }),
    [locale],
  );
}
