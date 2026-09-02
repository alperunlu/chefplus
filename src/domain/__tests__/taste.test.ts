import { RECIPES } from '../../data/recipes';
import { containsRedMeat, mainProtein } from '../filters';
import { buildQuickDeck, predictProfile, QUICK_DECK_SIZE } from '../taste';

describe('buildQuickDeck', () => {
  it('returns the requested number of distinct mains', () => {
    const deck = buildQuickDeck(RECIPES, QUICK_DECK_SIZE);
    expect(deck).toHaveLength(QUICK_DECK_SIZE);
    const ids = new Set(deck.map((r) => r.id));
    expect(ids.size).toBe(QUICK_DECK_SIZE);
    for (const r of deck) expect(r.category).toBe('main');
  });

  it('spreads across distinct cuisines for a compact signal', () => {
    const deck = buildQuickDeck(RECIPES, QUICK_DECK_SIZE);
    const cuisines = new Set(deck.map((r) => r.cuisine));
    expect(cuisines.size).toBe(QUICK_DECK_SIZE);
  });

  it('prefers distinct proteins so the deck reads varied', () => {
    const deck = buildQuickDeck(RECIPES, QUICK_DECK_SIZE);
    const proteins = new Set(deck.map((r) => mainProtein(r)));
    expect(proteins.size).toBeGreaterThanOrEqual(4);
  });

  it('is deterministic under a fixed rng', () => {
    const rng = () => 0.5;
    const a = buildQuickDeck(RECIPES, QUICK_DECK_SIZE, rng);
    const b = buildQuickDeck(RECIPES, QUICK_DECK_SIZE, rng);
    expect(a.map((r) => r.id)).toEqual(b.map((r) => r.id));
  });
});

describe('predictProfile', () => {
  it('favours the most-liked cuisines, capped at three', () => {
    const likes = [
      ...RECIPES.filter((r) => r.cuisine === 'turkish' && r.category === 'main').slice(0, 3),
      ...RECIPES.filter((r) => r.cuisine === 'italian' && r.category === 'main').slice(0, 2),
      ...RECIPES.filter((r) => r.cuisine === 'japanese' && r.category === 'main').slice(0, 1),
      ...RECIPES.filter((r) => r.cuisine === 'mexican' && r.category === 'main').slice(0, 1),
    ];
    const { cuisines } = predictProfile(likes);
    expect(cuisines[0]).toBe('turkish');
    expect(cuisines[1]).toBe('italian');
    expect(cuisines).toHaveLength(3);
  });

  it('returns the single most-liked cuisine with weak signal', () => {
    const like = RECIPES.find((r) => r.cuisine === 'greek' && r.category === 'main')!;
    const { cuisines } = predictProfile([like]);
    expect(cuisines).toEqual(['greek']);
  });

  it('suggests vegan when most likes are vegan', () => {
    const vegan = RECIPES.filter((r) => r.category === 'main' && r.diets.includes('vegan')).slice(0, 5);
    expect(vegan.length).toBeGreaterThanOrEqual(3);
    const { diets } = predictProfile(vegan);
    expect(diets).toContain('vegan');
  });

  it('suggests vegetarian when most likes are vegetarian (not vegan)', () => {
    const veg = RECIPES.filter(
      (r) => r.category === 'main' && r.diets.includes('vegetarian') && !r.diets.includes('vegan'),
    ).slice(0, 5);
    expect(veg.length).toBeGreaterThanOrEqual(3);
    const { diets } = predictProfile(veg);
    expect(diets).toContain('vegetarian');
  });

  it('does not suggest a diet for mostly meat-heavy likes', () => {
    const likes = RECIPES.filter(
      (r) => r.category === 'main' && !r.diets.includes('vegetarian') && !r.diets.includes('vegan'),
    ).slice(0, 6);
    const { diets } = predictProfile(likes);
    expect(diets).toEqual([]);
  });

  it('suggests no-red-meat when red-meat dishes were skipped but never liked', () => {
    const like = RECIPES.find((r) => r.category === 'main' && r.cuisine === 'japanese')!;
    const passes = RECIPES.filter((r) => r.category === 'main' && containsRedMeat(r)).slice(0, 2);
    const { diets } = predictProfile([like, like, like], passes);
    expect(diets).toContain('no-red-meat');
  });

  it('infers disliked ingredients from repeated skips', () => {
    const liked = RECIPES.filter((r) => r.category === 'main' && r.cuisine === 'japanese').slice(0, 3);
    const passes = RECIPES.filter(
      (r) =>
        r.category === 'main' &&
        r.cuisine === 'turkish' &&
        r.ingredients.some((i) => i.key === 'eggplant'),
    ).slice(0, 2);
    const { disliked } = predictProfile(liked, passes);
    expect(disliked).toContain('eggplant');
  });

  it('never flags universal staples as dislikes', () => {
    const liked = RECIPES.filter((r) => r.category === 'main' && r.cuisine === 'italian').slice(0, 2);
    const passes = RECIPES.filter((r) => r.category === 'main' && r.cuisine === 'turkish').slice(0, 3);
    const { disliked } = predictProfile(liked, passes);
    for (const d of disliked) expect(['salt', 'onion', 'garlic', 'olive-oil']).not.toContain(d);
  });

  it('returns empty cuisines and dislikes for no answers', () => {
    const prediction = predictProfile([], []);
    expect(prediction.cuisines).toEqual([]);
    expect(prediction.disliked).toEqual([]);
  });
});
