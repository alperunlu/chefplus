import type { Recipe } from '../domain/types';
import type { Locale } from './locale';
import { TR } from './recipe-data/tr';
import { VI } from './recipe-data/vi';

const OVERLAY: Record<Locale, Record<string, { description?: string; steps?: string[] }>> = {
  en: {},
  tr: TR,
  vi: VI,
};

/**
 * Returns the recipe with description/steps overlaid for the active locale.
 * Dish names are never translated (they stay authentic); falls back to the
 * English content when a translation isn't ready yet.
 */
export function getLocalizedRecipe(locale: Locale, recipe: Recipe): Recipe {
  if (locale === 'en') return recipe;
  const t = OVERLAY[locale][recipe.id];
  if (!t) return recipe;
  return {
    ...recipe,
    description: t.description ?? recipe.description,
    steps: t.steps ?? recipe.steps,
  };
}
