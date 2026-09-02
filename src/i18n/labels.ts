import type { Cuisine, Diet, MealCategory, Weekday } from '../domain/types';
import type { Locale } from './locale';

/**
 * UI-facing labels for the fixed taxonomies (cuisines, diets, categories,
 * weekdays, aisles). Keys are the stable data keys; the data files keep their
 * English labels for offline default, these maps override at display time.
 */

type Map = Record<string, string>;

const enCuisine: Map = {
  turkish: 'Turkish',
  italian: 'Italian',
  greek: 'Greek',
  french: 'French',
  vietnamese: 'Vietnamese',
  peruvian: 'Peruvian',
  portuguese: 'Portuguese',
  spanish: 'Spanish',
  japanese: 'Japanese',
  chinese: 'Chinese',
  indonesian: 'Indonesian',
  mexican: 'Mexican',
  serbian: 'Serbian',
  polish: 'Polish',
  american: 'American',
  arabic: 'Arabic',
  german: 'German',
  scandinavian: 'Scandinavian',
};

const trCuisine: Map = {
  turkish: 'Türk',
  italian: 'İtalyan',
  greek: 'Yunan',
  french: 'Fransız',
  vietnamese: 'Vietnam',
  peruvian: 'Peru',
  portuguese: 'Portekiz',
  spanish: 'İspanyol',
  japanese: 'Japon',
  chinese: 'Çin',
  indonesian: 'Endonezya',
  mexican: 'Meksika',
  serbian: 'Sırp',
  polish: 'Polonya',
  american: 'Amerikan',
  arabic: 'Arap',
  german: 'Alman',
  scandinavian: 'İskandinav',
};

const viCuisine: Map = {
  turkish: 'Thổ Nhĩ Kỳ',
  italian: 'Ý',
  greek: 'Hy Lạp',
  french: 'Pháp',
  vietnamese: 'Việt Nam',
  peruvian: 'Peru',
  portuguese: 'Bồ Đào Nha',
  spanish: 'Tây Ban Nha',
  japanese: 'Nhật Bản',
  chinese: 'Trung Hoa',
  indonesian: 'Indonesia',
  mexican: 'Mexico',
  serbian: 'Serbia',
  polish: 'Ba Lan',
  american: 'Mỹ',
  arabic: 'Ả Rập',
  german: 'Đức',
  scandinavian: 'Bắc Âu',
};

const enDiet: Map = {
  vegetarian: 'Vegetarian',
  vegan: 'Vegan',
  'gluten-free': 'Gluten-free',
  'lactose-free': 'Lactose-free',
  'no-red-meat': 'No red meat',
  'no-seafood': 'No seafood',
  keto: 'Keto',
  'low-carb': 'Low-carb',
};

const trDiet: Map = {
  vegetarian: 'Vejetaryen',
  vegan: 'Vegan',
  'gluten-free': 'Glutensiz',
  'lactose-free': 'Laktozsuz',
  'no-red-meat': 'Kırmızı et yok',
  'no-seafood': 'Deniz ürünü yok',
  keto: 'Keto',
  'low-carb': 'Düşük karbonhidrat',
};

const viDiet: Map = {
  vegetarian: 'Ăn chay',
  vegan: 'Thuần chay',
  'gluten-free': 'Không gluten',
  'lactose-free': 'Không lactose',
  'no-red-meat': 'Không thịt đỏ',
  'no-seafood': 'Không hải sản',
  keto: 'Keto',
  'low-carb': 'Ít carb',
};

const enCategory: Map = {
  breakfast: 'Breakfast',
  snack: 'Snack',
  soup: 'Soup',
  main: 'Main',
  lunch: 'Lunch',
  side: 'Side',
  salad: 'Salad',
  meze: 'Meze',
  'hot-starter': 'Hot starter',
};

const trCategory: Map = {
  breakfast: 'Kahvaltı',
  snack: 'Atıştırmalık',
  soup: 'Çorba',
  main: 'Ana yemek',
  lunch: 'Öğle yemeği',
  side: 'Garnitür',
  salad: 'Salata',
  meze: 'Meze',
  'hot-starter': 'Sıcak başlangıç',
};

const viCategory: Map = {
  breakfast: 'Bữa sáng',
  snack: 'Đồ ăn vặt',
  soup: 'Súp',
  main: 'Món chính',
  lunch: 'Bữa trưa',
  side: 'Món phụ',
  salad: 'Salad',
  meze: 'Khai vị',
  'hot-starter': 'Món khai vị nóng',
};

const enWeekday: Map = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
};

const enWeekdayShort: Map = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun',
};

const trWeekday: Map = {
  mon: 'Pazartesi',
  tue: 'Salı',
  wed: 'Çarşamba',
  thu: 'Perşembe',
  fri: 'Cuma',
  sat: 'Cumartesi',
  sun: 'Pazar',
};

const trWeekdayShort: Map = {
  mon: 'Pzt',
  tue: 'Sal',
  wed: 'Çar',
  thu: 'Per',
  fri: 'Cum',
  sat: 'Cmt',
  sun: 'Paz',
};

const viWeekday: Map = {
  mon: 'Thứ Hai',
  tue: 'Thứ Ba',
  wed: 'Thứ Tư',
  thu: 'Thứ Năm',
  fri: 'Thứ Sáu',
  sat: 'Thứ Bảy',
  sun: 'Chủ Nhật',
};

const viWeekdayShort: Map = {
  mon: 'T2',
  tue: 'T3',
  wed: 'T4',
  thu: 'T5',
  fri: 'T6',
  sat: 'T7',
  sun: 'CN',
};

const enAisle: Map = {
  produce: 'Produce',
  butcher: 'Butcher',
  fishmonger: 'Fishmonger',
  'dairy-deli': 'Dairy & Deli',
  bakery: 'Bakery',
  pantry: 'Pantry',
  spices: 'Spices & Herbs',
  frozen: 'Frozen',
  international: 'International',
};

const trAisle: Map = {
  produce: 'Manav',
  butcher: 'Kasap',
  fishmonger: 'Balıkçı',
  'dairy-deli': 'Süt & Şarküteri',
  bakery: 'Fırın',
  pantry: 'Kiler',
  spices: 'Baharatlar',
  frozen: 'Dondurulmuş',
  international: 'Uluslararası',
};

const viAisle: Map = {
  produce: 'Rau củ',
  butcher: 'Thịt',
  fishmonger: 'Hải sản',
  'dairy-deli': 'Sữa & Thịt nguội',
  bakery: 'Bánh mì',
  pantry: 'Kho khô',
  spices: 'Gia vị',
  frozen: 'Đông lạnh',
  international: 'Quốc tế',
};

const enUnit: Map = {
  bunch: 'bunch',
  clove: 'clove',
  head: 'head',
  loaf: 'loaf',
  pack: 'pack',
  pcs: 'pcs',
  pinch: 'pinch',
  sheet: 'sheet',
  slice: 'slice',
  sprig: 'sprig',
  stalk: 'stalk',
  stick: 'stick',
  'to taste': 'to taste',
  tbsp: 'tbsp',
  tsp: 'tsp',
};

const trUnit: Map = {
  bunch: 'demet',
  clove: 'diş',
  head: 'baş',
  loaf: 'somun',
  pack: 'paket',
  pcs: 'adet',
  pinch: 'çimdik',
  sheet: 'yaprak',
  slice: 'dilim',
  sprig: 'dal',
  stalk: 'dal',
  stick: 'çubuk',
  'to taste': 'damak tadına göre',
  tbsp: 'yk',
  tsp: 'çk',
};

const viUnit: Map = {
  bunch: 'bó',
  clove: 'tép',
  head: 'cây',
  loaf: 'ổ',
  pack: 'gói',
  pcs: 'cái',
  pinch: 'nhúm',
  sheet: 'miếng',
  slice: 'lát',
  sprig: 'nhánh',
  stalk: 'cây',
  stick: 'thanh',
  'to taste': 'tùy khẩu vị',
  tbsp: 'thìa canh',
  tsp: 'thìa cà phê',
};

const BY_LOCALE = {
  cuisine: { en: enCuisine, tr: trCuisine, vi: viCuisine },
  diet: { en: enDiet, tr: trDiet, vi: viDiet },
  category: { en: enCategory, tr: trCategory, vi: viCategory },
  weekday: { en: enWeekday, tr: trWeekday, vi: viWeekday },
  weekdayShort: { en: enWeekdayShort, tr: trWeekdayShort, vi: viWeekdayShort },
  aisle: { en: enAisle, tr: trAisle, vi: viAisle },
  unit: { en: enUnit, tr: trUnit, vi: viUnit },
} as const;

type Taxonomy = keyof typeof BY_LOCALE;

export function labelFor(
  locale: Locale,
  taxonomy: Taxonomy,
  key: string,
  fallback?: string,
): string {
  return BY_LOCALE[taxonomy][locale][key] ?? fallback ?? key;
}

export function cuisineLabel(locale: Locale, key: Cuisine, fallback?: string): string {
  return labelFor(locale, 'cuisine', key, fallback);
}

export function dietLabel(locale: Locale, key: Diet, fallback?: string): string {
  return labelFor(locale, 'diet', key, fallback);
}

export function categoryLabel(locale: Locale, key: MealCategory, fallback?: string): string {
  return labelFor(locale, 'category', key, fallback);
}

export function weekdayLabel(locale: Locale, key: Weekday, fallback?: string): string {
  return labelFor(locale, 'weekday', key, fallback);
}

export function weekdayShortLabel(locale: Locale, key: Weekday, fallback?: string): string {
  return labelFor(locale, 'weekdayShort', key, fallback);
}

export function aisleLabel(locale: Locale, key: string, fallback?: string): string {
  return labelFor(locale, 'aisle', key, fallback);
}

export function unitLabel(locale: Locale, unit: string): string {
  return labelFor(locale, 'unit', unit, unit);
}
