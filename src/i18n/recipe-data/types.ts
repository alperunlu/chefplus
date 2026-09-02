// Localized content overlay for recipes. Keys are the stable recipe ids from
// src/data/recipes. `name` is never translated (authentic dish names stay
// original); only `description` and `steps` are overlaid per locale.

export interface RecipeTranslation {
  description?: string;
  steps?: string[];
}

export type RecipeOverlay = Record<string, RecipeTranslation>;
