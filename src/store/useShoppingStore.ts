import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Tracks which shopping items the user has ticked off. Keyed by ingredient key.
interface ShoppingState {
  checked: Record<string, boolean>;
  toggle: (key: string) => void;
  clear: () => void;
}

export const useShoppingStore = create<ShoppingState>()(
  persist(
    (set) => ({
      checked: {},
      toggle: (key) =>
        set((s) => ({ checked: { ...s.checked, [key]: !s.checked[key] } })),
      clear: () => set({ checked: {} }),
    }),
    {
      name: 'chefplus.shopping',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
