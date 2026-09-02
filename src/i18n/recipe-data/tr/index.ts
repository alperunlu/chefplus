import { tr as turkish } from './turkish';
import { vietnamese } from './vietnamese';
import { american } from './american';
import { arabic } from './arabic';
import { chinese } from './chinese';
import { french } from './french';
import { german } from './german';
import { greek } from './greek';
import { indonesian } from './indonesian';
import { italian } from './italian';
import { japanese } from './japanese';
import { mexican } from './mexican';
import { peruvian } from './peruvian';
import { polish } from './polish';
import { portuguese } from './portuguese';
import { scandinavian } from './scandinavian';
import { serbian } from './serbian';
import { spanish } from './spanish';
import type { RecipeOverlay } from '../types';

/**
 * Turkish overlay for every recipe. Cuisine files are merged here; a cuisine
 * file may be empty while its recipes are still pending translation.
 */
export const TR: RecipeOverlay = {
  ...turkish,
  ...vietnamese,
  ...american,
  ...arabic,
  ...chinese,
  ...french,
  ...german,
  ...greek,
  ...indonesian,
  ...italian,
  ...japanese,
  ...mexican,
  ...peruvian,
  ...polish,
  ...portuguese,
  ...scandinavian,
  ...serbian,
  ...spanish,
};
