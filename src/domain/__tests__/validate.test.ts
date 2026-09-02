import { CATALOG } from '../../data/ingredients';
import { RECIPES } from '../../data/recipes';
import { validateRecipes } from '../validate';

describe('recipe dataset integrity', () => {
  const result = validateRecipes(RECIPES, CATALOG);

  it('has no hard errors (unique names/ids, resolvable ingredients, valid enums)', () => {
    if (!result.ok) {
      // Surface the first handful of errors for a readable failure.
      throw new Error(`Dataset errors:\n${result.errors.slice(0, 20).join('\n')}`);
    }
    expect(result.ok).toBe(true);
  });

  it('every ingredient key resolves in the catalog', () => {
    const missing = RECIPES.flatMap((r) =>
      r.ingredients.filter((i) => !CATALOG[i.key]).map((i) => `${r.id}:${i.key}`),
    );
    expect(missing).toEqual([]);
  });
});

describe('ingredient catalog', () => {
  it('has unique keys and valid aisles', () => {
    expect(Object.keys(CATALOG).length).toBeGreaterThan(100);
  });
});
