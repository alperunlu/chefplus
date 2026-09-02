import { AISLE_ORDER } from '../data/aisles';
import { CATALOG } from '../data/ingredients';
import { RECIPES } from '../data/recipes';
import { roundNice, isScalable, scaleQty } from './scaling';
import type { HouseholdProfile, Recipe, ShoppingItem, WeekPlan } from './types';

// A handful of ingredients are authored both "by weight" and "by piece"
// across different recipes (e.g. potato 800g for a gratin vs 4 pcs for a
// stew). Converting 'pcs' to grams for these lets them merge into one
// shopping-list line instead of two. Left out: keys where 'pcs' and 'g'
// genuinely mean different products (corn cobs vs corn kernels, a loaf vs
// bread rolls) — merging those would produce a misleading line.
const PCS_TO_GRAMS: Record<string, number> = {
  potato: 150,
  'green-pepper': 150,
};

/**
 * Aggregate every ingredient across the week (excluding free days), scaled to
 * household size, summed by key+unit, grouped by aisle. Pantry staples are
 * flagged as "at home".
 */
export function buildShoppingList(
  week: WeekPlan,
  profile: HouseholdProfile,
  recipes: Recipe[] = RECIPES,
): ShoppingItem[] {
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const map = new Map<string, ShoppingItem>();

  for (const day of week.days) {
    for (const pm of day.meals) {
      const recipe = byId.get(pm.recipeId);
      if (!recipe) continue;
      for (const ing of recipe.ingredients) {
        const entry = CATALOG[ing.key];
        if (!entry) continue;
        let qty = scaleQty(ing.qty, recipe.baseServings, profile.size, ing.unit);
        let unit = ing.unit;
        const gramsPerPiece = PCS_TO_GRAMS[ing.key];
        if (gramsPerPiece && unit === 'pcs') {
          qty = qty * gramsPerPiece;
          unit = 'g';
        }
        const mapKey = `${ing.key}|${unit}`;
        const existing = map.get(mapKey);
        if (existing) {
          if (isScalable(unit)) existing.qty += qty;
          if (!existing.sources.includes(recipe.name)) existing.sources.push(recipe.name);
        } else {
          map.set(mapKey, {
            key: ing.key,
            label: entry.label,
            aisle: entry.aisle,
            qty,
            unit,
            staple: !!entry.staple,
            sources: [recipe.name],
            checked: false,
          });
        }
      }
    }
  }

  const items = [...map.values()].map((i) => ({ ...i, qty: roundNice(i.qty) }));
  items.sort(
    (a, b) => AISLE_ORDER[a.aisle] - AISLE_ORDER[b.aisle] || a.label.localeCompare(b.label),
  );
  return items;
}

export function groupByAisle(items: ShoppingItem[]): { aisle: string; items: ShoppingItem[] }[] {
  const groups = new Map<string, ShoppingItem[]>();
  for (const item of items) {
    const arr = groups.get(item.aisle) ?? [];
    arr.push(item);
    groups.set(item.aisle, arr);
  }
  return [...groups.entries()].map(([aisle, items]) => ({ aisle, items }));
}
