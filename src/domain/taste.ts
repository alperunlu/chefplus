import { containsRedMeat, mainProtein } from './filters';
import type { Cuisine, Diet, Recipe } from './types';

/** How many dishes the quick-swipe taste deck shows before predicting a profile. */
export const QUICK_DECK_SIZE = 6;

/**
 * Build the compact quick-swipe deck: a small set of mains spread across
 * different cuisines (and different proteins where possible) so six swipes
 * cover more than one style of food. The deck is the optional "help me pick"
 * alternative to the cuisine tiles — not a mandatory 20-dish ritual.
 */
export function buildQuickDeck(
  recipes: Recipe[],
  count = QUICK_DECK_SIZE,
  rng: () => number = Math.random,
): Recipe[] {
  const mains = recipes.filter((r) => r.category === 'main');
  const byCuisine = new Map<Cuisine, Recipe[]>();
  for (const r of mains) {
    const arr = byCuisine.get(r.cuisine);
    if (arr) arr.push(r);
    else byCuisine.set(r.cuisine, [r]);
  }

  const deck: Recipe[] = [];
  const usedProteins = new Set<string>();
  for (const c of [...byCuisine.keys()].sort(() => rng() - 0.5)) {
    if (deck.length >= count) break;
    const pool = byCuisine.get(c)!;
    const pick =
      pool.find((r) => !usedProteins.has(mainProtein(r))) ?? pool[Math.floor(rng() * pool.length)];
    usedProteins.add(mainProtein(pick));
    deck.push(pick);
  }

  return deck.slice(0, count);
}

export interface TastePrediction {
  cuisines: Cuisine[];
  diets: Diet[];
  disliked: string[];
}

// Ingredients that appear in too many dishes to mean anything when skipped.
const UBIQUITOUS = new Set([
  'salt',
  'black-pepper',
  'olive-oil',
  'sunflower-oil',
  'onion',
  'garlic',
  'flour',
  'sugar',
  'butter',
  'water',
  'lemon',
]);

/**
 * Turn the dishes a user liked/passed into a light profile guess:
 *  - the top three most-liked cuisines (the probe shows roughly one dish per
 *    cuisine, so a single like is already a meaningful signal);
 *  - if most likes are vegan or vegetarian we suggest that diet; if red-meat
 *    dishes were skipped but never liked, we suggest "no red meat";
 *  - ingredients that kept appearing in skipped dishes but never in liked ones
 *    are suggested as dislikes.
 * Everything here is a starting guess the user can change in onboarding/Tune.
 */
export function predictProfile(likes: Recipe[], passes: Recipe[] = []): TastePrediction {
  const counts = new Map<Cuisine, number>();
  for (const r of likes) {
    counts.set(r.cuisine, (counts.get(r.cuisine) ?? 0) + 1);
  }

  const cuisines = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .filter(([, n]) => n >= 1)
    .map(([c]) => c)
    .slice(0, 3);

  const diets: Diet[] = [];
  if (likes.length >= 3) {
    const vegan = likes.filter((r) => r.diets.includes('vegan')).length;
    const vegetarian = likes.filter((r) => r.diets.includes('vegetarian')).length;
    if (vegan / likes.length >= 0.4) diets.push('vegan');
    else if (vegetarian / likes.length >= 0.4) diets.push('vegetarian');
  }
  const redLiked = likes.filter(containsRedMeat).length;
  const redPassed = passes.filter(containsRedMeat).length;
  if (redLiked === 0 && redPassed >= 2 && likes.length >= 3) diets.push('no-red-meat');

  const likedKeys = new Set(likes.flatMap((r) => r.ingredients.map((i) => i.key)));
  const passCounts = new Map<string, number>();
  for (const r of passes) {
    const keys = new Set(r.ingredients.map((i) => i.key));
    for (const k of keys) {
      if (UBIQUITOUS.has(k) || likedKeys.has(k)) continue;
      passCounts.set(k, (passCounts.get(k) ?? 0) + 1);
    }
  }
  const disliked = [...passCounts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k)
    .slice(0, 3);

  return { cuisines, diets, disliked };
}
