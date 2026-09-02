import { AISLES } from '../data/aisles';
import { CUISINES } from '../data/constants';
import { CATALOG } from '../data/ingredients';
import type { CatalogEntry, Diet, MealCategory, Recipe } from './types';

const CATEGORIES: MealCategory[] = [
  'breakfast',
  'snack',
  'soup',
  'main',
  'side',
  'salad',
  'meze',
  'hot-starter',
];

const DIETS: Diet[] = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'lactose-free',
  'no-red-meat',
  'no-seafood',
  'keto',
  'low-carb',
];

// Categories the generator needs a reasonable pool of to compose a week.
// Dinner-first: only 'main' is planned (breakfast/lunch are optional extras).
const REQUIRED_CATEGORIES: MealCategory[] = ['main'];

export interface ValidationResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
  countsByCuisine: Record<string, number>;
  countsByCategory: Record<string, number>;
  total: number;
}

// Guards dataset integrity: unique names (no overlap) & ids, resolvable
// ingredient keys, valid enums, present nutrition, adequate category coverage.
export function validateRecipes(
  recipes: Recipe[],
  catalog: Record<string, CatalogEntry> = CATALOG,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  const names = new Set<string>();
  const cuisineSet = new Set(CUISINES.map((c) => c.key));
  const aisleSet = new Set(AISLES.map((a) => a.key));
  const catSet = new Set(CATEGORIES);
  const dietSet = new Set(DIETS);

  const countsByCuisine: Record<string, number> = {};
  const countsByCategory: Record<string, number> = {};

  for (const r of recipes) {
    if (!r.id) errors.push(`Recipe "${r.name}" missing id`);
    else if (ids.has(r.id)) errors.push(`Duplicate id: ${r.id}`);
    ids.add(r.id);

    const nameKey = (r.name ?? '').trim().toLowerCase();
    if (!nameKey) errors.push(`${r.id}: empty name`);
    else if (names.has(nameKey)) errors.push(`Duplicate name (overlap not allowed): "${r.name}"`);
    names.add(nameKey);

    if (!cuisineSet.has(r.cuisine)) errors.push(`${r.id}: invalid cuisine "${r.cuisine}"`);
    if (!catSet.has(r.category)) errors.push(`${r.id}: invalid category "${r.category}"`);
    for (const d of r.diets ?? []) if (!dietSet.has(d)) errors.push(`${r.id}: invalid diet "${d}"`);

    if (!(r.kcalPerServing > 0)) errors.push(`${r.id}: kcalPerServing must be > 0`);
    if (!(r.baseServings > 0)) errors.push(`${r.id}: baseServings must be > 0`);

    if (!r.ingredients?.length) errors.push(`${r.id}: no ingredients`);
    for (const ing of r.ingredients ?? []) {
      const entry = catalog[ing.key];
      if (!entry) errors.push(`${r.id}: unknown ingredient key "${ing.key}"`);
      else if (!aisleSet.has(entry.aisle)) errors.push(`${ing.key}: invalid aisle "${entry.aisle}"`);
      if (!(ing.qty > 0)) errors.push(`${r.id}: ingredient "${ing.key}" has non-positive qty`);
    }

    if (!r.steps?.length) errors.push(`${r.id}: no steps`);

    countsByCuisine[r.cuisine] = (countsByCuisine[r.cuisine] ?? 0) + 1;
    countsByCategory[r.category] = (countsByCategory[r.category] ?? 0) + 1;
  }

  // Per-cuisine target counts (warnings until the dataset is complete).
  for (const c of CUISINES) {
    const have = countsByCuisine[c.key] ?? 0;
    if (have !== c.target) warnings.push(`${c.key}: ${have}/${c.target} recipes`);
  }

  // Category coverage — only meaningful once recipes exist.
  if (recipes.length > 0) {
    for (const cat of REQUIRED_CATEGORIES) {
      if (!countsByCategory[cat]) warnings.push(`no recipes in category "${cat}"`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    countsByCuisine,
    countsByCategory,
    total: recipes.length,
  };
}
