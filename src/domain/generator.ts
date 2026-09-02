import { WEEKDAYS } from '../data/constants';
import { RECIPES } from '../data/recipes';
import { containsRedMeat, containsSeafood, filterPool, mainProtein } from './filters';
import type {
  DayPlan,
  HouseholdProfile,
  MealCategory,
  PlannedMeal,
  Recipe,
  Weekday,
  WeekPlan,
} from './types';

// ── Seeded RNG so "regenerate" reshuffles but tests stay deterministic ──
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Date helpers ──
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const JS_TO_WD: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}
function weekdayOf(d: Date): Weekday {
  return JS_TO_WD[d.getDay()];
}
function dateLabel(d: Date): string {
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}
function rangeLabel(start: Date): string {
  const end = addDays(start, 6);
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${MONTHS[end.getMonth()]}`;
  }
  return `${dateLabel(start)} – ${dateLabel(end)}`;
}

export interface GenOptions {
  seed?: number;
  recipes?: Recipe[];
  startDate?: Date;
}

interface Ctx {
  recipes: Recipe[];
  profile: HouseholdProfile;
  rng: () => number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Recipe ids cooked within the last `windowDays` days (default 7). The menu is
 * a rolling weekly plan, so "cooked this week" naturally maps to "don't cook
 * it again this coming week" — keeping a plan fresh without needing a full
 * history feature.
 */
export function recentlyCookedIds(profile: HouseholdProfile, now: Date = new Date(), windowDays = 7): Set<string> {
  const cutoff = now.getTime() - windowDays * DAY_MS;
  return new Set(profile.cooked?.filter((c) => new Date(c.at).getTime() >= cutoff).map((c) => c.id) ?? []);
}

/** Recipes the household cooked within the window, excluded from planning. */
export function excludeRecentlyCooked(recipes: Recipe[], profile: HouseholdProfile, now?: Date): Recipe[] {
  const recent = recentlyCookedIds(profile, now);
  if (!recent.size) return recipes;
  const filtered = recipes.filter((r) => !recent.has(r.id));
  // Never let the recent window empty the pool — fall back to the full list.
  return filtered.length ? filtered : recipes;
}

function byCategory(pool: Recipe[], cat: MealCategory): Recipe[] {
  return pool.filter((r) => r.category === cat);
}

// Prefer liked cuisines, but fall back to the whole pool if none match
// (small cuisines like German have too few recipes to fill a week alone).
function preferCuisine(list: Recipe[], cuisines: Cuisine[]): Recipe[] {
  if (!cuisines?.length) return list;
  const pref = list.filter((r) => cuisines.includes(r.cuisine));
  return pref.length ? pref : list;
}
type Cuisine = Recipe['cuisine'];

// Soft-deprioritise recipes the household rated "meh" after cooking — never a
// hard block (they can still fill a slot if nothing else is left), but they
// shouldn't keep resurfacing while better-liked options exist.
function excludeSoft(list: Recipe[], ids: string[] | undefined): Recipe[] {
  if (!ids?.length) return list;
  const set = new Set(ids);
  const filtered = list.filter((r) => !set.has(r.id));
  return filtered.length ? filtered : list;
}

/** Sort candidates by closeness to a target kcal, nearest first. Pure + testable. */
export function closestByKcal(candidates: Recipe[], targetKcal: number, take = 3): Recipe[] {
  return [...candidates]
    .sort((a, b) => Math.abs(a.kcalPerServing - targetKcal) - Math.abs(b.kcalPerServing - targetKcal))
    .slice(0, Math.max(1, take));
}

/**
 * A rough per-meal calorie anchor for a slot: the category's own median kcal.
 * Keeps dinner picks varied in heft without over-thinking portion targets.
 */
function targetKcalForSlot(candidates: Recipe[]): number | undefined {
  if (!candidates.length) return undefined;
  const kcals = candidates.map((r) => r.kcalPerServing).sort((a, b) => a - b);
  return kcals[Math.floor(kcals.length / 2)];
}

function pickMeal(
  candidates: Recipe[],
  used: Set<string>,
  rng: () => number,
  avoidProtein?: string,
  targetKcal?: number,
): Recipe | null {
  const fresh = candidates.filter((r) => !used.has(r.id));
  let list = fresh.length ? fresh : candidates;
  if (avoidProtein) {
    const diff = list.filter((r) => mainProtein(r) !== avoidProtein);
    if (diff.length) list = diff;
  }
  if (!list.length) return null;
  const pool = targetKcal !== undefined ? closestByKcal(list, targetKcal, 3) : list;
  const r = pool[Math.floor(rng() * pool.length)];
  used.add(r.id);
  return r;
}

function meal(slot: MealCategory, r: Recipe): PlannedMeal {
  return { slot, recipeId: r.id, kcal: r.kcalPerServing };
}

function finalize(
  day: Weekday,
  label: string,
  meals: PlannedMeal[],
  extra: Partial<DayPlan> = {},
): DayPlan {
  return {
    day,
    label,
    meals,
    totalKcal: Math.round(meals.reduce((n, m) => n + m.kcal, 0)),
    ...extra,
  };
}

function buildDay(
  ctx: Ctx,
  dayKey: Weekday,
  label: string,
  used: Set<string>,
  prevProtein?: string,
): { day: DayPlan; dinnerProtein?: string } {
  const { profile } = ctx;
  const pool = filterPool(ctx.recipes, profile);
  const prefer = profile.cuisines;
  // Recipes are authored with category 'main' only; the 'lunch' slot pulls
  // from the same 'main' pool but is labelled distinctly in the UI.
  const cat = (c: MealCategory) =>
    excludeSoft(preferCuisine(byCategory(pool, c === 'lunch' ? 'main' : c), prefer), profile.meh);
  const targetFor = (c: MealCategory) => targetKcalForSlot(cat(c));

  const meals: PlannedMeal[] = [];

  if (profile.meals.breakfast) {
    const b = pickMeal(cat('breakfast'), used, ctx.rng, undefined, targetFor('breakfast'));
    if (b) meals.push(meal('breakfast', b));
  }
  if (profile.meals.lunch) {
    const l = pickMeal(cat('lunch'), used, ctx.rng, undefined, targetFor('lunch'));
    if (l) meals.push(meal('lunch', l));
  }
  // Dinner is the plan's centrepiece — one main dish per day.
  const dinnerMain = pickMeal(cat('main'), used, ctx.rng, prevProtein, targetFor('main'));
  if (dinnerMain) meals.push(meal('main', dinnerMain));

  return {
    day: finalize(dayKey, label, meals),
    dinnerProtein: dinnerMain ? mainProtein(dinnerMain) : prevProtein,
  };
}

/**
 * If the household has favourites that pass their current filters (diet,
 * dislikes, not blocked) and none made it into the week, swap one into the
 * first day whose slot matches the favourite's recipe category. This
 * fulfils "add your favourite dish" without deeply coupling favourites into
 * the per-slot random pick.
 */
function ensureFavorites(days: DayPlan[], profile: HouseholdProfile, recipes: Recipe[]): DayPlan[] {
  if (!profile.favoriteRecipes?.length) return days;
  const byId = new Map(recipes.map((r) => [r.id, r]));
  const usedIds = new Set(days.flatMap((d) => d.meals.map((m) => m.recipeId)));
  const alreadyIncluded = profile.favoriteRecipes.some((id) => usedIds.has(id));
  if (alreadyIncluded) return days;

  const pool = filterPool(recipes, profile);
  const poolIds = new Set(pool.map((r) => r.id));
  const eligible = profile.favoriteRecipes.map((id) => byId.get(id)).filter((r): r is Recipe => !!r && poolIds.has(r.id));
  if (!eligible.length) return days;
  const favorite = eligible[0];

  for (const day of days) {
    const slotIndex = day.meals.findIndex((m) => {
      const recipeCategory = m.slot === 'lunch' ? 'main' : m.slot;
      return recipeCategory === favorite.category;
    });
    if (slotIndex === -1) continue;
    const slot = day.meals[slotIndex].slot;
    const newMeals = day.meals.map((m, i) => (i === slotIndex ? meal(slot, favorite) : m));
    return days.map((d) =>
      d.day === day.day
        ? { ...d, meals: newMeals, totalKcal: Math.round(newMeals.reduce((n, m) => n + m.kcal, 0)) }
        : d,
    );
  }
  return days;
}

function dinnerOf(days: DayPlan[], i: number, byId: Map<string, Recipe>): Recipe | undefined {
  const day = days[i];
  const main = day?.meals.find((m) => m.slot === 'main');
  return main ? byId.get(main.recipeId) : undefined;
}

function replaceDinner(day: DayPlan, next: PlannedMeal): DayPlan {
  const meals = day.meals.map((m) => (m.slot === 'main' ? next : m));
  return { ...day, meals, totalKcal: Math.round(meals.reduce((n, m) => n + m.kcal, 0)) };
}

/**
 * A light "balanced week" pass over the dinner mains, applied before favourites
 * so a favourite dish still gets its guaranteed slot. Whenever the household's
 * own filters allow it, this nudges the plan toward:
 *   - at most one red-meat night,
 *   - at least two vegetarian nights,
 *   - at least one seafood night.
 * Each swap also tries to avoid repeating the previous night's cuisine. The
 * pass is best-effort: if the pool can't satisfy a target it simply moves on.
 */
function balanceDinners(days: DayPlan[], ctx: Ctx): DayPlan[] {
  const byId = new Map(ctx.recipes.map((r) => [r.id, r]));
  const used = new Set(days.flatMap((d) => d.meals.map((m) => m.recipeId)));
  const isVeg = (r: Recipe) => r.diets.includes('vegetarian');
  const isRed = (r: Recipe) => containsRedMeat(r);
  const isFish = (r: Recipe) => containsSeafood(r);

  const pickMain = (predicate: (r: Recipe) => boolean, prefer: (r: Recipe) => boolean): Recipe | null => {
    let pool = filterPool(ctx.recipes, ctx.profile).filter(
      (r) => r.category === 'main' && !used.has(r.id) && predicate(r),
    );
    // Keep the balancing pass inside the household's chosen cuisines whenever
    // possible — without this, "one veg / one fish night" can silently pull in
    // a cuisine the household never picked.
    pool = excludeSoft(preferCuisine(pool, ctx.profile.cuisines), ctx.profile.meh);
    const liked = pool.filter(prefer);
    if (liked.length) pool = liked;
    if (!pool.length) return null;
    return pool[Math.floor(ctx.rng() * pool.length)];
  };

  const counts = () => {
    let veg = 0;
    let red = 0;
    let fish = 0;
    for (let i = 0; i < days.length; i++) {
      const r = dinnerOf(days, i, byId);
      if (!r) continue;
      if (isVeg(r)) veg++;
      if (isRed(r)) red++;
      if (isFish(r)) fish++;
    }
    return { veg, red, fish };
  };

  for (let i = 0; i < days.length; i++) {
    const c = counts();
    if (c.red <= 1 && c.veg >= 2 && c.fish >= 1) break;
    const current = dinnerOf(days, i, byId);
    if (!current) continue;

    let predicate: ((r: Recipe) => boolean) | null = null;
    if (c.red > 1 && isRed(current)) predicate = (r) => !isRed(r);
    else if (c.veg < 2 && !isVeg(current)) predicate = (r) => isVeg(r);
    else if (c.fish < 1 && !isFish(current)) predicate = (r) => isFish(r);
    if (!predicate) continue;

    const replacement = pickMain(predicate, (r) => r.cuisine !== current.cuisine);
    if (!replacement) continue;
    used.delete(current.id);
    used.add(replacement.id);
    days[i] = replaceDinner(days[i], meal('main', replacement));
  }

  return days;
}

export function generateWeek(profile: HouseholdProfile, opts: GenOptions = {}): WeekPlan {
  const recipes = excludeRecentlyCooked(opts.recipes ?? RECIPES, profile);
  const rng = mulberry32((opts.seed ?? Date.now() >>> 0) | 0);
  // Rolling window: the plan starts today and covers the next 7 days, so the
  // menu only ever shows upcoming dates.
  const start = startOfDay(opts.startDate ?? new Date());
  const used = new Set<string>();
  const ctx: Ctx = { recipes, profile, rng };

  let prevProtein: string | undefined;
  const days: DayPlan[] = [];
  for (let idx = 0; idx < 7; idx++) {
    const date = addDays(start, idx);
    const key = weekdayOf(date);
    const wd = WEEKDAYS.find((w) => w.key === key)!;
    const { day, dinnerProtein } = buildDay(ctx, key, wd.label, used, prevProtein);
    if (dinnerProtein) prevProtein = dinnerProtein;
    days.push({ ...day, dateLabel: dateLabel(date) });
  }

  const withFavorites = ensureFavorites(balanceDinners(days, ctx), profile, recipes);

  return { rangeLabel: rangeLabel(start), startISO: start.toISOString(), days: withFavorites };
}

/**
 * Re-anchor an existing week to a new start date (default today), keeping each
 * day's planned meals anchored to its weekday. This lets the menu roll forward
 * so only upcoming days are shown — without reshuffling the plan.
 */
export function reanchorWeek(week: WeekPlan, startDate: Date = new Date()): WeekPlan {
  const start = startOfDay(startDate);
  const days: DayPlan[] = [];
  for (let idx = 0; idx < 7; idx++) {
    const date = addDays(start, idx);
    const key = weekdayOf(date);
    const wd = WEEKDAYS.find((w) => w.key === key)!;
    const existing = week.days.find((d) => d.day === key);
    days.push({
      day: key,
      label: wd.label,
      dateLabel: dateLabel(date),
      meals: existing?.meals ?? [],
      totalKcal: existing?.totalKcal ?? 0,
    });
  }
  return { rangeLabel: rangeLabel(start), startISO: start.toISOString(), days };
}

function proteinBefore(week: WeekPlan, dayKey: Weekday, recipes: Recipe[]): string | undefined {
  const idx = week.days.findIndex((d) => d.day === dayKey);
  if (idx <= 0) return undefined;
  const prev = week.days[idx - 1];
  const dinnerMain = [...prev.meals].reverse().find((m) => m.slot === 'main');
  const r = dinnerMain && recipes.find((x) => x.id === dinnerMain.recipeId);
  return r ? mainProtein(r) : undefined;
}

export function regenerateDay(
  profile: HouseholdProfile,
  week: WeekPlan,
  dayKey: Weekday,
  opts: GenOptions = {},
): DayPlan {
  const recipes = excludeRecentlyCooked(opts.recipes ?? RECIPES, profile);
  const rng = mulberry32((opts.seed ?? Date.now() >>> 0) | 0);
  const used = new Set(
    week.days.filter((d) => d.day !== dayKey).flatMap((d) => d.meals.map((m) => m.recipeId)),
  );
  const wd = WEEKDAYS.find((w) => w.key === dayKey)!;
  const existing = week.days.find((d) => d.day === dayKey);
  const { day } = buildDay({ recipes, profile, rng }, dayKey, wd.label, used, proteinBefore(week, dayKey, recipes));
  return { ...day, dateLabel: existing?.dateLabel };
}

export function swapMeal(
  profile: HouseholdProfile,
  week: WeekPlan,
  dayKey: Weekday,
  mealIndex: number,
  opts: GenOptions = {},
): PlannedMeal | null {
  const recipes = excludeRecentlyCooked(opts.recipes ?? RECIPES, profile);
  const rng = mulberry32((opts.seed ?? Date.now() >>> 0) | 0);
  const day = week.days.find((d) => d.day === dayKey);
  const current = day?.meals[mealIndex];
  if (!day || !current) return null;
  const used = new Set(week.days.flatMap((d) => d.meals.map((m) => m.recipeId)));
  const pool = filterPool(recipes, profile);
  const recipeCategory = current.slot === 'lunch' ? 'main' : current.slot;
  const candidates = excludeSoft(preferCuisine(byCategory(pool, recipeCategory), profile.cuisines), profile.meh);
  const r = pickMeal(candidates, used, rng, undefined, targetKcalForSlot(candidates));
  return r ? meal(current.slot, r) : null;
}
