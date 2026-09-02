import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  hydrated: boolean;
  setMode: (mode: ThemeMode) => void;
}

// One-time default at first launch: match the device's current appearance.
// After that the choice is explicit and persisted — the app never silently
// re-follows the OS setting again (Appearance's live updates were unreliable
// on some devices, so we stopped depending on them).
const initialMode: ThemeMode = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: initialMode,
      hydrated: false,
      setMode: (mode) => set({ mode }),
    }),
    {
      name: 'chefplus.theme',
      storage: createJSONStorage(() => AsyncStorage),
      // Older installs may have persisted the removed 'system' mode — fall
      // back to the device's current appearance for those too.
      merge: (persisted, current) => {
        const saved = persisted as Partial<ThemeState> | undefined;
        const mode: ThemeMode = saved?.mode === 'light' || saved?.mode === 'dark' ? saved.mode : initialMode;
        return { ...current, ...saved, mode };
      },
      onRehydrateStorage: () => (state) => {
        useThemeStore.setState({ hydrated: true });
      },
    },
  ),
);
