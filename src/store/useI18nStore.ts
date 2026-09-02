import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getLocales } from 'expo-localization';
import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from '../i18n/locale';

/** Best-effort device-language detection; falls back to English. */
function detectDeviceLocale(): Locale {
  try {
    const code = getLocales()?.[0]?.languageCode?.toLowerCase();
    return isSupportedLocale(code) ? code : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

interface I18nState {
  locale: Locale;
  hydrated: boolean;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: detectDeviceLocale(),
      hydrated: false,
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'chefplus.locale',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        useI18nStore.setState({ hydrated: true });
      },
    },
  ),
);
