import type { Locale } from './locale';
import { unitLabel } from './labels';

/** Human display for a quantity + unit, with the unit localized. */
export function formatQtyLocal(locale: Locale, qty: number, unit: string): string {
  if (unit === 'to taste' || unit === 'pinch') return unitLabel(locale, unit);
  const q = Number.isInteger(qty) ? String(qty) : String(qty);
  return `${q} ${unitLabel(locale, unit)}`;
}
