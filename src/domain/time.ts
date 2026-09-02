import type { MealCategory, Recipe } from './types';

// Rough, category-based cook-time estimate. Not chef-authored — a useful
// signal until real prep/cook times are recorded per recipe.
const BASE_MINUTES: Record<MealCategory, number> = {
  breakfast: 20,
  snack: 10,
  soup: 35,
  main: 40,
  lunch: 40,
  side: 25,
  salad: 15,
  meze: 20,
  'hot-starter': 30,
};

export function estimateTimeMinutes(recipe: Recipe): number {
  const base = BASE_MINUTES[recipe.category] ?? 30;
  // A few extra ingredients/steps nudge the estimate up; keep it a light touch.
  const extra = Math.max(0, recipe.steps.length - 3) * 3;
  return base + extra;
}

// Step text may carry an explicit timer hint, e.g. "cook for 8 minutes" or
// "simmer 5 mins". Extracted in whole minutes so the cook screen can offer a
// countdown for the active step. Falls back to null when there's no hint.
const MINUTE_RE = /(\d+)\s*(?:min(?:utes?|s)?|dakika|phút)\b/i;

export function extractTimerMinutes(step: string | undefined): number | null {
  if (!step) return null;
  const m = step.match(MINUTE_RE);
  if (!m) return null;
  const value = parseInt(m[1], 10);
  if (!Number.isFinite(value) || value < 1) return null;
  return value;
}
