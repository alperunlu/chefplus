import { extractTimerMinutes, estimateTimeMinutes } from '../time';
import type { Recipe } from '../types';

const main: Recipe = {
  id: 'test',
  name: 'Test',
  cuisine: 'turkish',
  category: 'main',
  diets: [],
  kcalPerServing: 300,
  baseServings: 4,
  ingredients: [],
  steps: [],
};

describe('extractTimerMinutes', () => {
  it('reads an explicit minute hint from a step', () => {
    expect(extractTimerMinutes('Cook for 8 minutes until golden.')).toBe(8);
    expect(extractTimerMinutes('Simmer 5 mins covered.')).toBe(5);
    expect(extractTimerMinutes('Leave to rest 12 min.')).toBe(12);
    expect(extractTimerMinutes('Ninh trong 90 phút đến khi mềm.')).toBe(90);
    expect(extractTimerMinutes('Yaklaşık 3 dakika kavurun.')).toBe(3);
  });

  it('returns null when the step has no minute hint', () => {
    expect(extractTimerMinutes('Chop the onion finely.')).toBeNull();
    expect(extractTimerMinutes('Season to taste.')).toBeNull();
    expect(extractTimerMinutes(undefined)).toBeNull();
  });

  it('ignores sub-minute values and junk', () => {
    expect(extractTimerMinutes('Rest for 0 minutes.')).toBeNull();
  });
});

describe('estimateTimeMinutes', () => {
  it('adds time for extra steps', () => {
    expect(estimateTimeMinutes({ ...main, steps: ['a', 'b', 'c'] })).toBe(40);
    expect(estimateTimeMinutes({ ...main, steps: ['a', 'b', 'c', 'd', 'e'] })).toBe(46);
  });
});
