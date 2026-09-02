import { writeFileSync } from 'fs';
import { generateWeek } from '../generator';
import type { HouseholdProfile } from '../types';

// Not a real test — dumps a ready-to-inject persisted state for manual
// browser verification of the menu / recipe / shopping screens.
const OUT = process.env.SEED_OUT;

describe('seed state (manual verification helper)', () => {
  it('writes localStorage payloads when SEED_OUT is set', () => {
    if (!OUT) {
      expect(true).toBe(true);
      return;
    }
    const profile: HouseholdProfile = {
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
    };
    const week = generateWeek(profile, { seed: 42 });
    const out = {
      profile: JSON.stringify({ state: { profile, onboarded: true }, version: 0 }),
      plan: JSON.stringify({ state: { week }, version: 0 }),
    };
    writeFileSync(OUT, JSON.stringify(out));
    expect(week.days).toHaveLength(7);
  });
});
