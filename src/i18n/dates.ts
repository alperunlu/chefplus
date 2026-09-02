import type { Locale } from './locale';

const MONTHS: Record<Locale, string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  tr: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  vi: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

function dayAt(startISO: string, index: number): Date {
  return addDays(startOfDay(new Date(startISO)), index);
}

/** Localized "6 Jul"-style label for the day at `index` (0-based) of a week. */
export function localDateLabel(locale: Locale, startISO: string, index: number): string {
  const d = dayAt(startISO, index);
  if (locale === 'vi') return `${d.getDate()}/${MONTHS.vi[d.getMonth()]}`;
  return `${d.getDate()} ${MONTHS[locale][d.getMonth()]}`;
}

/** Localized "6–12 Jul"-style label for a whole week. */
export function localRangeLabel(locale: Locale, startISO: string): string {
  const start = startOfDay(new Date(startISO));
  const end = addDays(start, 6);
  if (locale === 'vi') return `${start.getDate()}/${MONTHS.vi[start.getMonth()]} – ${end.getDate()}/${MONTHS.vi[end.getMonth()]}`;
  if (start.getMonth() === end.getMonth()) {
    return `${start.getDate()}–${end.getDate()} ${MONTHS[locale][end.getMonth()]}`;
  }
  return `${start.getDate()} ${MONTHS[locale][start.getMonth()]} – ${end.getDate()} ${MONTHS[locale][end.getMonth()]}`;
}
