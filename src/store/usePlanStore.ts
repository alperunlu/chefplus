import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { generateWeek, reanchorWeek, regenerateDay, swapMeal } from '../domain/generator';
import type { HouseholdProfile, WeekPlan, Weekday } from '../domain/types';

function recomputeTotals(week: WeekPlan): WeekPlan {
  return {
    ...week,
    days: week.days.map((d) => ({
      ...d,
      totalKcal: Math.round(d.meals.reduce((n, m) => n + m.kcal, 0)),
    })),
  };
}

interface PlanState {
  week: WeekPlan | null;
  generate: (profile: HouseholdProfile) => void;
  regenerateWeek: (profile: HouseholdProfile) => void;
  regenerateDay: (profile: HouseholdProfile, day: Weekday) => void;
  swap: (profile: HouseholdProfile, day: Weekday, mealIndex: number) => void;
  /** Roll the stored week forward to today so only upcoming days show. */
  reanchor: () => void;
  reset: () => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      week: null,
      generate: (profile) => set({ week: generateWeek(profile) }),
      regenerateWeek: (profile) => set({ week: generateWeek(profile) }),
      regenerateDay: (profile, day) => {
        const week = get().week;
        if (!week) return;
        const newDay = regenerateDay(profile, week, day);
        set({
          week: {
            ...week,
            days: week.days.map((d) => (d.day === day ? newDay : d)),
          },
        });
      },
      swap: (profile, day, mealIndex) => {
        const week = get().week;
        if (!week) return;
        const replacement = swapMeal(profile, week, day, mealIndex);
        if (!replacement) return;
        const updated: WeekPlan = {
          ...week,
          days: week.days.map((d) =>
            d.day === day
              ? { ...d, meals: d.meals.map((m, i) => (i === mealIndex ? replacement : m)) }
              : d,
          ),
        };
        set({ week: recomputeTotals(updated) });
      },
      reanchor: () => {
        const week = get().week;
        if (!week) return;
        set({ week: reanchorWeek(week) });
      },
      reset: () => set({ week: null }),
    }),
    {
      name: 'chefplus.plan',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
