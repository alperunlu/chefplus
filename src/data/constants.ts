import type { Cuisine, Diet, MealCategory, Weekday } from '../domain/types';

// Cuisine roster with target recipe counts (sums to 750).
export const CUISINES: { key: Cuisine; label: string; target: number }[] = [
  { key: 'turkish', label: 'Turkish', target: 57 },
  { key: 'italian', label: 'Italian', target: 54 },
  { key: 'greek', label: 'Greek', target: 46 },
  { key: 'french', label: 'French', target: 42 },
  { key: 'vietnamese', label: 'Vietnamese', target: 45 },
  { key: 'peruvian', label: 'Peruvian', target: 36 },
  { key: 'portuguese', label: 'Portuguese', target: 35 },
  { key: 'spanish', label: 'Spanish', target: 44 },
  { key: 'japanese', label: 'Japanese', target: 44 },
  { key: 'chinese', label: 'Chinese', target: 43 },
  { key: 'indonesian', label: 'Indonesian', target: 44 },
  { key: 'mexican', label: 'Mexican', target: 44 },
  { key: 'serbian', label: 'Serbian', target: 35 },
  { key: 'polish', label: 'Polish', target: 36 },
  { key: 'american', label: 'American', target: 40 },
  { key: 'arabic', label: 'Arabic', target: 35 },
  { key: 'german', label: 'German', target: 35 },
  { key: 'scandinavian', label: 'Scandinavian', target: 35 },
];

export const TOTAL_TARGET = CUISINES.reduce((n, c) => n + c.target, 0); // 750

export const CUISINE_LABEL: Record<Cuisine, string> = CUISINES.reduce(
  (acc, c) => ({ ...acc, [c.key]: c.label }),
  {} as Record<Cuisine, string>,
);

// Dietary options shown in onboarding and the tune sheet — applied to the
// whole household as hard filters on every planned recipe.
export const DIET_OPTIONS: { key: Diet; label: string }[] = [
  { key: 'vegetarian', label: 'Vegetarian' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'gluten-free', label: 'Gluten-free' },
  { key: 'lactose-free', label: 'Lactose-free' },
  { key: 'no-red-meat', label: 'No red meat' },
  { key: 'no-seafood', label: 'No seafood' },
  { key: 'keto', label: 'Keto' },
  { key: 'low-carb', label: 'Low-carb' },
];

export const DIET_LABEL: Record<Diet, string> = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  'gluten-free': 'Gluten-free',
  'lactose-free': 'Lactose-free',
  'no-red-meat': 'No red meat',
  'no-seafood': 'No seafood',
  keto: 'Keto',
  'low-carb': 'Low-carb',
};

export const WEEKDAYS: { key: Weekday; label: string; short: string }[] = [
  { key: 'mon', label: 'Monday', short: 'Mon' },
  { key: 'tue', label: 'Tuesday', short: 'Tue' },
  { key: 'wed', label: 'Wednesday', short: 'Wed' },
  { key: 'thu', label: 'Thursday', short: 'Thu' },
  { key: 'fri', label: 'Friday', short: 'Fri' },
  { key: 'sat', label: 'Saturday', short: 'Sat' },
  { key: 'sun', label: 'Sunday', short: 'Sun' },
];

// Category labels for UI (meal slots).
export const CATEGORY_LABEL: Record<MealCategory, string> = {
  breakfast: 'Breakfast',
  snack: 'Snack',
  soup: 'Soup',
  main: 'Main',
  lunch: 'Lunch',
  side: 'Side',
  salad: 'Salad',
  meze: 'Meze',
  'hot-starter': 'Hot starter',
};

// Per-person daily calorie anchor used when no explicit target is set.
export const DEFAULT_DAILY_KCAL = 1600;
