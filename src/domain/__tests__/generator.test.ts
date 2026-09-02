import { RECIPES } from '../../data/recipes';
import { containsRedMeat, containsSeafood, filterPool, hasDisliked } from '../filters';
import { closestByKcal, excludeRecentlyCooked, generateWeek, recentlyCookedIds, reanchorWeek } from '../generator';
import { scaleQty } from '../scaling';
import { buildShoppingList } from '../shopping';
import type { HouseholdProfile, WeekPlan } from '../types';

const baseProfile = (over: Partial<HouseholdProfile> = {}): HouseholdProfile => ({
  size: 4,
  cuisines: ['turkish', 'italian'],
  diets: [],
  disliked: [],
  meals: { breakfast: false, lunch: false, dinner: true },
  blockedRecipes: [],
  favoriteRecipes: [],
  cooked: [],
  loved: [],
  meh: [],
  ...over,
});

describe('scaling', () => {
  it('scales quantities to household size', () => {
    expect(scaleQty(200, 4, 2, 'g')).toBe(100);
    expect(scaleQty(200, 4, 8, 'g')).toBe(400);
  });
  it('never scales qualitative units', () => {
    expect(scaleQty(1, 4, 8, 'to taste')).toBe(1);
  });
});

describe('closestByKcal', () => {
  it('returns the candidates nearest to the target, nearest first', () => {
    const candidates = [
      { kcalPerServing: 200 },
      { kcalPerServing: 400 },
      { kcalPerServing: 600 },
      { kcalPerServing: 900 },
    ] as any;
    const result = closestByKcal(candidates, 420, 2);
    expect(result.map((r: any) => r.kcalPerServing)).toEqual([400, 600]);
  });
});

describe('filters', () => {
  it('vegan pool contains no meat or fish', () => {
    const pool = filterPool(RECIPES, baseProfile({ diets: ['vegan'] }));
    for (const r of pool) expect(r.diets).toContain('vegan');
    expect(pool.length).toBeGreaterThan(0);
  });

  it('excludes recipes with a disliked ingredient', () => {
    const pool = filterPool(RECIPES, baseProfile({ disliked: ['eggplant'] }));
    const offenders = pool.filter((r) => hasDisliked(r, ['eggplant']));
    expect(offenders).toEqual([]);
    // Menemen has no eggplant, İmam Bayıldı does
    expect(pool.find((r) => r.id === 'tr-imam-bayildi')).toBeUndefined();
    expect(pool.find((r) => r.id === 'tr-menemen')).toBeDefined();
  });

  it('no-red-meat removes beef/lamb dishes but keeps chicken/fish', () => {
    const pool = filterPool(RECIPES, baseProfile({ diets: ['no-red-meat'] }));
    expect(pool.find((r) => r.id === 'tr-izgara-kofte')).toBeUndefined();
    expect(pool.find((r) => r.id === 'tr-tavuk-sote')).toBeDefined();
  });
});

describe('generateWeek', () => {
  it('produces 7 days with a dinner main each', () => {
    const week = generateWeek(baseProfile(), { seed: 1 });
    expect(week.days).toHaveLength(7);
    for (const day of week.days) {
      expect(day.meals.map((m) => m.slot)).toEqual(['main']);
      expect(day.meals.length).toBeGreaterThan(0);
    }
  });

  it('plans the next 7 days starting from the start date', () => {
    const start = new Date(2026, 6, 25); // Saturday, 25 Jul 2026
    const week = generateWeek(baseProfile(), { startDate: start, seed: 1 });
    expect(week.days[0].day).toBe('sat');
    expect(week.days[0].dateLabel).toBe('25 Jul');
    expect(week.days[6].day).toBe('fri');
    expect(week.days[6].dateLabel).toBe('31 Jul');
    expect(week.rangeLabel).toBe('25–31 Jul');
  });

  it('re-anchors a stored week forward to a new start, keeping meals by weekday', () => {
    const start = new Date(2026, 6, 20); // Monday, 20 Jul 2026
    const week = generateWeek(baseProfile(), { startDate: start, seed: 2 });
    const sat = week.days.find((d) => d.day === 'sat')!;
    const mon = week.days.find((d) => d.day === 'mon')!;

    const rolled = reanchorWeek(week, new Date(2026, 6, 25)); // Saturday
    expect(rolled.days[0].day).toBe('sat');
    expect(rolled.days[0].dateLabel).toBe('25 Jul');
    expect(rolled.days[0].meals).toEqual(sat.meals);
    expect(rolled.days[2].day).toBe('mon');
    expect(rolled.days[2].dateLabel).toBe('27 Jul');
    expect(rolled.days[2].meals).toEqual(mon.meals);
  });

  it('adds breakfast and lunch only when toggled', () => {
    const week = generateWeek(
      baseProfile({ meals: { breakfast: true, lunch: true, dinner: true } }),
      { seed: 6 },
    );
    const day = week.days[0];
    const slots = day.meals.map((m) => m.slot);
    expect(slots).toContain('breakfast');
    expect(slots).toContain('lunch');
    expect(slots.filter((s) => s === 'main')).toHaveLength(1);
  });

  it('never repeats a recipe within the week', () => {
    const week = generateWeek(baseProfile(), { seed: 3 });
    const ids = week.days.flatMap((d) => d.meals.map((m) => m.recipeId));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('respects a vegan diet across the whole week', () => {
    const week = generateWeek(baseProfile({ diets: ['vegan'] }), { seed: 4 });
    const byId = new Map(RECIPES.map((r) => [r.id, r]));
    for (const day of week.days) {
      for (const m of day.meals) {
        expect(byId.get(m.recipeId)!.diets).toContain('vegan');
      }
    }
  });

  it('avoids repeating the same dinner protein two nights running', () => {
    const week = generateWeek(baseProfile(), { seed: 7 });
    const proteins = week.days
      .map((d) => d.meals.find((m) => m.slot === 'main')?.recipeId)
      .map((id) => id && RECIPES.find((r) => r.id === id))
      .map((r) => r && r.name);
    expect(proteins.every(Boolean)).toBe(true);
  });

  it('includes a favourite recipe in the week when one is set and eligible', () => {
    const favoriteId = RECIPES.find((r) => r.category === 'main' && r.cuisine === 'turkish')!.id;
    const week = generateWeek(baseProfile({ favoriteRecipes: [favoriteId] }), { seed: 8 });
    const ids = week.days.flatMap((d) => d.meals.map((m) => m.recipeId));
    expect(ids).toContain(favoriteId);
  });

  it('does not include a favourite that violates a diet', () => {
    const nonVeganMain = RECIPES.find((r) => r.category === 'main' && !r.diets.includes('vegan'))!.id;
    const week = generateWeek(baseProfile({ diets: ['vegan'], favoriteRecipes: [nonVeganMain] }), { seed: 9 });
    const ids = week.days.flatMap((d) => d.meals.map((m) => m.recipeId));
    expect(ids).not.toContain(nonVeganMain);
  });

  it('stays within a single chosen cuisine across a full week', () => {
    for (let seed = 0; seed < 10; seed++) {
      const week = generateWeek(baseProfile({ cuisines: ['turkish'] }), { seed });
      for (const d of week.days) {
        for (const m of d.meals) {
          const r = RECIPES.find((x) => x.id === m.recipeId);
          expect(r?.cuisine).toBe('turkish');
        }
      }
    }
  });

  it('deprioritises "meh"-rated recipes when better-liked alternatives exist', () => {
    // Use breakfast (no veg/red-meat/fish balancing pass touches this slot) so
    // the soft-exclusion behaviour is isolated from the dinner-balancing pass,
    // which can legitimately fall back to a meh recipe when a target (e.g.
    // "two vegetarian nights") can't otherwise be satisfied from a small,
    // single-cuisine pool.
    const turkishBreakfasts = RECIPES.filter((r) => r.cuisine === 'turkish' && r.category === 'breakfast');
    const meh = turkishBreakfasts.filter((_, i) => i % 2 === 0).map((r) => r.id);
    let mehPicks = 0;
    let total = 0;
    for (let seed = 0; seed < 10; seed++) {
      const week = generateWeek(
        baseProfile({ cuisines: ['turkish'], meals: { breakfast: true, lunch: false, dinner: true }, meh }),
        { seed },
      );
      for (const d of week.days) {
        const breakfast = d.meals.find((m) => m.slot === 'breakfast');
        if (!breakfast) continue;
        total++;
        if (meh.includes(breakfast.recipeId)) mehPicks++;
      }
    }
    expect(total).toBeGreaterThan(0);
    // Meh recipes should be rare — only picked when nothing else was left.
    expect(mehPicks / total).toBeLessThan(0.3);
  });
});

describe('recently cooked', () => {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();

  it('excludes recipes cooked within the last 7 days', () => {
    const recent = RECIPES.filter((r) => r.category === 'main').slice(0, 3).map((r) => r.id);
    const profile = baseProfile({ cooked: recent.map((id) => ({ id, at: dayAgo })) });
    const week = generateWeek(profile, { seed: 1 });
    const ids = week.days.flatMap((d) => d.meals.map((m) => m.recipeId));
    expect(recent.filter((id) => ids.includes(id))).toEqual([]);
  });

  it('still allows recipes cooked longer than 7 days ago', () => {
    const old = RECIPES[0].id;
    const profile = baseProfile({ cooked: [{ id: old, at: tenDaysAgo }] });
    expect(recentlyCookedIds(profile)).not.toContain(old);
    expect(excludeRecentlyCooked(RECIPES, profile).map((r) => r.id)).toContain(old);
    const week = generateWeek(profile, { seed: 1 });
    expect(week.days).toHaveLength(7);
  });

  it('still produces a full week when most mains were cooked recently', () => {
    const mains = RECIPES.filter((r) => r.category === 'main');
    const profile = baseProfile({ cooked: mains.slice(0, mains.length - 5).map((r) => ({ id: r.id, at: dayAgo })) });
    const week = generateWeek(profile, { seed: 2 });
    expect(week.days).toHaveLength(7);
    for (const day of week.days) {
      expect(day.meals.some((m) => m.slot === 'main')).toBe(true);
    }
  });
});

describe('balanced week', () => {
  const dinnerIds = (week: WeekPlan) => week.days.map((d) => d.meals.find((m) => m.slot === 'main')!.recipeId);
  const byId = new Map(RECIPES.map((r) => [r.id, r]));

  it('keeps red meat to at most one night across seeds', () => {
    for (let seed = 1; seed <= 8; seed++) {
      const red = dinnerIds(generateWeek(baseProfile(), { seed })).filter((id) => containsRedMeat(byId.get(id)!));
      expect(red.length).toBeLessThanOrEqual(1);
    }
  });

  it('offers at least two vegetarian nights', () => {
    for (let seed = 1; seed <= 8; seed++) {
      const veg = dinnerIds(generateWeek(baseProfile(), { seed })).filter((id) =>
        byId.get(id)!.diets.includes('vegetarian'),
      );
      expect(veg.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('includes a seafood night when the pool offers one', () => {
    const pool = filterPool(RECIPES, baseProfile()).filter((r) => r.category === 'main' && containsSeafood(r));
    if (!pool.length) return;
    for (let seed = 1; seed <= 5; seed++) {
      const hasFish = dinnerIds(generateWeek(baseProfile(), { seed })).some((id) => containsSeafood(byId.get(id)!));
      expect(hasFish).toBe(true);
    }
  });
});

describe('buildShoppingList', () => {
  const week = generateWeek(baseProfile(), { seed: 7 });
  const items = buildShoppingList(week, baseProfile());

  it('aggregates ingredients into a non-empty list', () => {
    expect(items.length).toBeGreaterThan(0);
  });

  it('flags catalog staples as at-home', () => {
    const list = buildShoppingList(week, baseProfile());
    const staple = list.find((i) => i.staple);
    expect(staple).toBeDefined();
  });

  it('merges potato bought by weight and by piece into a single line', () => {
    const byWeight = {
      id: 'test-potato-g',
      name: 'Test potato by weight',
      cuisine: 'turkish' as const,
      category: 'side' as const,
      diets: [],
      kcalPerServing: 100,
      baseServings: 4,
      ingredients: [{ key: 'potato', qty: 400, unit: 'g' }],
      steps: ['step'],
    };
    const byPiece = {
      ...byWeight,
      id: 'test-potato-pcs',
      name: 'Test potato by piece',
      ingredients: [{ key: 'potato', qty: 2, unit: 'pcs' }],
    };
    const testWeek: WeekPlan = {
      rangeLabel: 'test',
      startISO: new Date().toISOString(),
      days: [
        {
          day: 'mon',
          label: 'Monday',
          meals: [
            { slot: 'side', recipeId: byWeight.id, kcal: 100 },
            { slot: 'salad', recipeId: byPiece.id, kcal: 100 },
          ],
          totalKcal: 200,
        },
      ],
    };
    const list = buildShoppingList(testWeek, baseProfile(), [byWeight, byPiece]);
    const potatoLines = list.filter((i) => i.key === 'potato');
    expect(potatoLines).toHaveLength(1);
    expect(potatoLines[0].unit).toBe('g');
    expect(potatoLines[0].qty).toBe(400 + 2 * 150);
  });
});
