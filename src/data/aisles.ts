import type { Aisle } from '../domain/types';

// Display order matches a typical shopping route.
export const AISLES: { key: Aisle; label: string }[] = [
  { key: 'produce', label: 'Produce' },
  { key: 'butcher', label: 'Butcher' },
  { key: 'fishmonger', label: 'Fishmonger' },
  { key: 'dairy-deli', label: 'Dairy & Deli' },
  { key: 'bakery', label: 'Bakery' },
  { key: 'pantry', label: 'Pantry' },
  { key: 'spices', label: 'Spices & Herbs' },
  { key: 'frozen', label: 'Frozen' },
  { key: 'international', label: 'International' },
];

export const AISLE_ORDER: Record<Aisle, number> = AISLES.reduce(
  (acc, a, i) => ({ ...acc, [a.key]: i }),
  {} as Record<Aisle, number>,
);

export const AISLE_LABEL: Record<Aisle, string> = AISLES.reduce(
  (acc, a) => ({ ...acc, [a.key]: a.label }),
  {} as Record<Aisle, string>,
);
