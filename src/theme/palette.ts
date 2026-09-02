import type { Cuisine } from '../domain/types';

// Per-cuisine color fields — chef+'s stand-in for photography. Each cuisine owns
// a deep tone (hero bands, on-brand pills) and a soft tint (recessed fills).
// Kept in theme so every surface draws from the same source of truth. Every deep
// tone is dark enough that pure onInk (#F3F4EF) keeps AA 4.5:1 for small caption
// text sitting on the band (meta rows, kcal, glass pills) — not just large text.
export const cuisineTone: Record<Cuisine, { deep: string; soft: string }> = {
  turkish: { deep: '#A9552E', soft: '#F5E1D4' }, // clay
  italian: { deep: '#2E7D4F', soft: '#E3F0E7' }, // basil
  greek: { deep: '#2A6FB0', soft: '#DFEDF8' }, // aegean
  french: { deep: '#6E3A7A', soft: '#EFE3F2' }, // aubergine
  vietnamese: { deep: '#2B7A45', soft: '#E2F1E9' }, // leaf
  peruvian: { deep: '#8F5E06', soft: '#F7ECCE' }, // aji gold
  portuguese: { deep: '#7E2E3F', soft: '#F3E1E5' }, // port
  spanish: { deep: '#A6371E', soft: '#F8DFD8' }, // tomato
  japanese: { deep: '#37456E', soft: '#E4E8F2' }, // indigo
  chinese: { deep: '#A6322E', soft: '#F6E2E1' }, // lacquer
  indonesian: { deep: '#8A5A2B', soft: '#F0E6D5' }, // spice
  mexican: { deep: '#B83E1B', soft: '#F8E2D8' }, // chili
  serbian: { deep: '#9A4B3A', soft: '#F2E1DC' }, // paprika plum
  polish: { deep: '#8A661B', soft: '#F5ECD6' }, // amber
  american: { deep: '#8E3B5C', soft: '#F3E2EA' }, // berry
  arabic: { deep: '#286E6E', soft: '#E0F0F0' }, // desert teal
  german: { deep: '#3D6B35', soft: '#E4EFE0' }, // forest
  scandinavian: { deep: '#4A5568', soft: '#E6E9F0' }, // fjord
};
