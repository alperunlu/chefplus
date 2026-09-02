// Core domain model for chef+ — all identifiers in English.

export type Cuisine =
  | 'turkish'
  | 'italian'
  | 'greek'
  | 'french'
  | 'vietnamese'
  | 'peruvian'
  | 'portuguese'
  | 'spanish'
  | 'japanese'
  | 'chinese'
  | 'indonesian'
  | 'mexican'
  | 'serbian'
  | 'polish'
  | 'american'
  | 'arabic'
  | 'german'
  | 'scandinavian';

export type MealCategory =
  | 'breakfast'
  | 'snack'
  | 'soup'
  | 'main'
  | 'lunch' // display-only slot tag for a planned lunch (recipes are still authored as 'main')
  | 'side'
  | 'salad'
  | 'meze'
  | 'hot-starter';

export type Diet =
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'lactose-free'
  | 'no-red-meat'
  | 'no-seafood'
  | 'keto'
  | 'low-carb';

export type Aisle =
  | 'produce'
  | 'butcher'
  | 'fishmonger'
  | 'dairy-deli'
  | 'bakery'
  | 'pantry'
  | 'spices'
  | 'frozen'
  | 'international';

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

/** A quantity of an ingredient, referencing a catalog entry by key. */
export interface IngredientRef {
  key: string;
  qty: number;
  unit: string;
}

/** Canonical ingredient definition — drives shopping list + aisle grouping. */
export interface CatalogEntry {
  key: string;
  label: string;
  aisle: Aisle;
  defaultUnit: string;
  /** Common household staple — surfaced as pantry suggestions & "at home". */
  staple?: boolean;
}

export interface Recipe {
  id: string;
  /** Authentic dish name (globally unique across the dataset). */
  name: string;
  /** One-line English description. */
  description?: string;
  cuisine: Cuisine;
  category: MealCategory;
  /** Diets this recipe SATISFIES (e.g. a salad may be vegan + gluten-free). */
  diets: Diet[];
  kcalPerServing: number;
  baseServings: number;
  ingredients: IngredientRef[];
  steps: string[];
  tags?: string[];
}

export interface HouseholdProfile {
  size: number;
  cuisines: Cuisine[];
  /** Diets the whole household follows (vegan, keto, gluten-free…) — hard filters. */
  diets: Diet[];
  /** Ingredient keys (or free text) never used in menus. */
  disliked: string[];
  /** Meals to plan per day. Dinner is always included; breakfast/lunch optional. */
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean };
  /** Recipe ids the user never wants to see again (blocked from generation). */
  blockedRecipes: string[];
  /** Recipe ids the user loves — the generator tries to include one per week. */
  favoriteRecipes: string[];
  /**
   * Recipes the household has cooked, newest first. The generator avoids
   * recipes cooked within the last 7 days so a menu rarely repeats itself.
   */
  cooked: { id: string; at: string }[];
  /** Recipe ids rated "loved" after cooking — treated like favourites. */
  loved: string[];
  /** Recipe ids rated "meh" after cooking — deprioritised but not blocked. */
  meh: string[];
}

export interface PlannedMeal {
  slot: MealCategory;
  recipeId: string;
  kcal: number;
}

export interface DayPlan {
  day: Weekday;
  label: string; // e.g. "Monday"
  dateLabel?: string; // e.g. "6 Jul"
  meals: PlannedMeal[];
  totalKcal: number;
}

export interface WeekPlan {
  rangeLabel: string; // e.g. "6–12 Jul"
  startISO: string;
  days: DayPlan[];
}

export interface ShoppingItem {
  key: string;
  label: string;
  aisle: Aisle;
  qty: number;
  unit: string;
  staple: boolean; // in pantry / "at home"
  sources: string[]; // recipe names using it
  checked?: boolean;
}
