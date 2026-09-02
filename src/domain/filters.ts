import { CATALOG } from '../data/ingredients';
import type { Diet, HouseholdProfile, Recipe } from './types';

// Ingredient keys that make a dish contain seafood (drives `no-seafood`).
export const SEAFOOD_KEYS = new Set([
  'sea-bass', 'sea-bream', 'salmon', 'tuna', 'cod', 'anchovy', 'sardine', 'mackerel',
  'shrimp', 'calamari', 'mussels', 'octopus', 'herring', 'fish-sauce', 'dashi', 'nori',
]);

// Ingredient keys that count as red meat (drives `no-red-meat`).
export const RED_MEAT_KEYS = new Set([
  'ground-beef', 'beef-cubes', 'beef-tenderloin', 'steak', 'lamb', 'ground-lamb',
  'lamb-chops', 'veal', 'pork', 'pork-belly', 'bacon', 'pancetta', 'prosciutto',
  'sujuk', 'chorizo', 'sausage',
]);

const PROTEIN_KEYS: Record<string, string[]> = {
  chicken: ['chicken-breast', 'chicken-thigh', 'whole-chicken', 'chicken-wings', 'turkey'],
  beef: ['ground-beef', 'beef-cubes', 'beef-tenderloin', 'steak', 'veal'],
  lamb: ['lamb', 'ground-lamb', 'lamb-chops'],
  pork: ['pork', 'pork-belly', 'bacon', 'pancetta', 'prosciutto', 'chorizo', 'sujuk', 'sausage'],
  fish: ['sea-bass', 'sea-bream', 'salmon', 'tuna', 'cod', 'anchovy', 'sardine', 'mackerel', 'herring'],
  seafood: ['shrimp', 'calamari', 'mussels', 'octopus'],
};

export function containsSeafood(recipe: Recipe): boolean {
  return recipe.ingredients.some(
    (i) => SEAFOOD_KEYS.has(i.key) || CATALOG[i.key]?.aisle === 'fishmonger',
  );
}

export function containsRedMeat(recipe: Recipe): boolean {
  return recipe.ingredients.some((i) => RED_MEAT_KEYS.has(i.key));
}

/** Coarse protein tag used to avoid repeating the same protein two days running. */
export function mainProtein(recipe: Recipe): string {
  const keys = recipe.ingredients.map((i) => i.key);
  for (const [protein, list] of Object.entries(PROTEIN_KEYS)) {
    if (keys.some((k) => list.includes(k))) return protein;
  }
  return 'veg';
}

export function satisfiesDiets(recipe: Recipe, required: Diet[]): boolean {
  for (const d of required) {
    if (d === 'no-seafood') {
      if (containsSeafood(recipe)) return false;
    } else if (d === 'no-red-meat') {
      if (containsRedMeat(recipe)) return false;
    } else if (!recipe.diets.includes(d)) {
      return false;
    }
  }
  return true;
}

/** True if the recipe uses an ingredient the household dislikes. */
export function hasDisliked(recipe: Recipe, disliked: string[]): boolean {
  if (!disliked.length) return false;
  const keys = new Set(recipe.ingredients.map((i) => i.key));
  const labels = recipe.ingredients.map((i) => (CATALOG[i.key]?.label ?? i.key).toLowerCase());
  const name = recipe.name.toLowerCase();
  return disliked.some((raw) => {
    const d = raw.trim().toLowerCase();
    if (!d) return false;
    if (keys.has(d)) return true;
    return labels.some((l) => l.includes(d)) || name.includes(d);
  });
}

/** Hard-filter the recipe pool by household diets, dislikes, and blocked recipes. */
export function filterPool(recipes: Recipe[], profile: HouseholdProfile): Recipe[] {
  const required = profile.diets ?? [];
  const blocked = new Set(profile.blockedRecipes ?? []);
  return recipes.filter(
    (r) => !blocked.has(r.id) && satisfiesDiets(r, required) && !hasDisliked(r, profile.disliked),
  );
}
