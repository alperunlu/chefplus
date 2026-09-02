import type { IngredientRef, Recipe } from './types';

// Units that are qualitative — never scaled or summed numerically.
export const NON_SCALABLE_UNITS = new Set(['to taste', 'pinch']);

export function isScalable(unit: string): boolean {
  return !NON_SCALABLE_UNITS.has(unit);
}

/** Round to a friendly cooking quantity. */
export function roundNice(n: number): number {
  if (n <= 0) return 0;
  if (n < 1) return Math.round(n * 100) / 100; // 0.25, 0.5…
  if (n < 10) return Math.round(n * 2) / 2; // nearest 0.5
  if (n < 100) return Math.round(n); // nearest 1
  return Math.round(n / 5) * 5; // nearest 5 for large gram/ml amounts
}

/** Scale a base quantity from baseServings to the household size. */
export function scaleQty(qty: number, baseServings: number, size: number, unit = 'g'): number {
  if (!isScalable(unit)) return qty;
  return roundNice((qty * size) / baseServings);
}

export function scaledIngredients(recipe: Recipe, size: number): IngredientRef[] {
  return recipe.ingredients.map((i) => ({
    ...i,
    qty: scaleQty(i.qty, recipe.baseServings, size, i.unit),
  }));
}

/** Human display for a quantity + unit. */
export function formatQty(qty: number, unit: string): string {
  if (!isScalable(unit)) return unit;
  const q = Number.isInteger(qty) ? String(qty) : String(qty);
  return `${q} ${unit}`;
}
