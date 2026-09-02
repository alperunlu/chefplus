import type { Recipe } from '../../domain/types';
import { AMERICAN } from './american';
import { ARABIC } from './arabic';
import { CHINESE } from './chinese';
import { FRENCH } from './french';
import { GERMAN } from './german';
import { GREEK } from './greek';
import { INDONESIAN } from './indonesian';
import { ITALIAN } from './italian';
import { JAPANESE } from './japanese';
import { MEXICAN } from './mexican';
import { PERUVIAN } from './peruvian';
import { POLISH } from './polish';
import { PORTUGUESE } from './portuguese';
import { SCANDINAVIAN } from './scandinavian';
import { SERBIAN } from './serbian';
import { SPANISH } from './spanish';
import { TURKISH } from './turkish';
import { VIETNAMESE } from './vietnamese';

// Per-cuisine recipe files are merged here. Meze / hot-starter categories are
// no longer part of the product (the "Guests" feature was removed), so those
// recipes are excluded from the shipped pool.
export const RECIPES: Recipe[] = [
  ...TURKISH,
  ...ITALIAN,
  ...GREEK,
  ...FRENCH,
  ...VIETNAMESE,
  ...SPANISH,
  ...JAPANESE,
  ...MEXICAN,
  ...PERUVIAN,
  ...PORTUGUESE,
  ...CHINESE,
  ...INDONESIAN,
  ...SERBIAN,
  ...POLISH,
  ...AMERICAN,
  ...ARABIC,
  ...GERMAN,
  ...SCANDINAVIAN,
].filter((r) => r.category !== 'meze' && r.category !== 'hot-starter');

export const RECIPE_BY_ID: Record<string, Recipe> = Object.fromEntries(
  RECIPES.map((r) => [r.id, r]),
);

export function getRecipe(id: string): Recipe | undefined {
  return RECIPE_BY_ID[id];
}
