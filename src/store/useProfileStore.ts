import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { HouseholdProfile } from '../domain/types';

export const DEFAULT_PROFILE: HouseholdProfile = {
  size: 4,
  cuisines: [],
  diets: [],
  disliked: [],
  meals: { breakfast: false, lunch: false, dinner: true },
  blockedRecipes: [],
  favoriteRecipes: [],
  cooked: [],
  loved: [],
  meh: [],
};

interface ProfileState {
  profile: HouseholdProfile;
  onboarded: boolean;
  /** True once the user has swiped through the taste-probe deck. */
  tasteDone: boolean;
  hydrated: boolean;
  updateProfile: (patch: Partial<HouseholdProfile>) => void;
  completeOnboarding: () => void;
  markTasteDone: () => void;
  reset: () => void;
  blockRecipe: (id: string) => void;
  unblockRecipe: (id: string) => void;
  clearBlocked: () => void;
  toggleFavorite: (id: string) => void;
  /**
   * Log a cooking verdict for a recipe. `null` records the cook without a
   * rating; 'loved' also adds the recipe to favourites, 'meh' records it so
   * the generator deprioritises it.
   */
  recordFeedback: (id: string, rating: 'loved' | 'meh' | null) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: DEFAULT_PROFILE,
      onboarded: false,
      tasteDone: false,
      hydrated: false,
      updateProfile: (patch) => set((s) => ({ profile: { ...s.profile, ...patch } })),
      completeOnboarding: () => set({ onboarded: true }),
      markTasteDone: () => set({ tasteDone: true }),
      reset: () => set({ profile: DEFAULT_PROFILE, onboarded: false, tasteDone: false }),
      blockRecipe: (id) =>
        set((s) =>
          s.profile.blockedRecipes.includes(id)
            ? s
            : { profile: { ...s.profile, blockedRecipes: [...s.profile.blockedRecipes, id] } },
        ),
      unblockRecipe: (id) =>
        set((s) => ({ profile: { ...s.profile, blockedRecipes: s.profile.blockedRecipes.filter((r) => r !== id) } })),
      clearBlocked: () => set((s) => ({ profile: { ...s.profile, blockedRecipes: [] } })),
      toggleFavorite: (id) =>
        set((s) => ({
          profile: {
            ...s.profile,
            favoriteRecipes: s.profile.favoriteRecipes.includes(id)
              ? s.profile.favoriteRecipes.filter((r) => r !== id)
              : [...s.profile.favoriteRecipes, id],
          },
        })),
      recordFeedback: (id, rating) =>
        set((s) => {
          const profile = s.profile;
          const now = new Date().toISOString();
          const cooked = [
            { id, at: now },
            ...profile.cooked.filter((c) => c.id !== id),
          ].slice(0, 60);
          const loved =
            rating === 'loved'
              ? [...profile.loved.filter((r) => r !== id), id]
              : profile.loved.filter((r) => r !== id);
          const meh =
            rating === 'meh'
              ? [...profile.meh.filter((r) => r !== id), id]
              : profile.meh.filter((r) => r !== id);
          const favoriteRecipes =
            rating === 'loved'
              ? profile.favoriteRecipes.includes(id)
                ? profile.favoriteRecipes
                : [...profile.favoriteRecipes, id]
              : rating === null
                ? profile.favoriteRecipes
                : profile.favoriteRecipes.filter((r) => r !== id);
          return { profile: { ...profile, cooked, loved, meh, favoriteRecipes } };
        }),
    }),
    {
      name: 'chefplus.profile',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ profile: s.profile, onboarded: s.onboarded, tasteDone: s.tasteDone }),
      merge: (persisted, current) => {
        const saved = (persisted as any)?.profile ?? {};
        // Migrate the legacy two-list diet model (restrictions + specialDiets)
        // into the single `diets` field kept by the current app.
        const legacyDiets = [...(saved.restrictions ?? []), ...(saved.specialDiets ?? [])];
        const diets = Array.isArray(saved.diets) ? saved.diets : legacyDiets;
        return {
          ...current,
          ...(persisted as Partial<ProfileState>),
          profile: { ...current.profile, ...saved, diets },
        };
      },
      onRehydrateStorage: () => (state) => {
        useProfileStore.setState({ hydrated: true });
      },
    },
  ),
);