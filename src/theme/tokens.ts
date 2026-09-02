import type { ViewStyle } from 'react-native';

// Design tokens for chef+ — "soft kitchen" identity:
// pale-stone canvas, white cards lifted by shadow (not borders), dark slate
// ink, one signature lime accent. Light + dark palettes share one token shape
// so every screen draws from the same language in both modes.

export type Palette = {
  bg: string; // page canvas
  surface: string; // cards, lifted by shadow (not by borders)
  surfaceSoft: string; // recessed fills (inputs, inactive segments)
  ink: string; // primary text / icons (adapts per mode)
  inkSoft: string; // secondary text
  muted: string; // tertiary text (≥4.5:1 on bg & surface)
  faint: string; // placeholder / decorative (≥3:1)
  feature: string; // dark featured surface (Today card, cook, primary, poster)
  featureSoft: string; // recessed panel on the feature surface
  onInk: string; // text/marks on the feature surface
  onInkSoft: string; // sub-text on the feature surface
  onInkFaint: string; // tertiary on the feature surface
  onInkBorder: string; // hairlines on the feature surface
  onAccent: string; // text on the lime accent (stays dark in both modes)
  accent: string; // signature lime
  accentDeep: string; // pressed / deeper accent
  accentCanvas: string; // accent legible on the light canvas (brand "+", tab dot, small icons)
  border: string; // soft outline for inputs/secondary controls
  divider: string; // subtle separators inside cards
  danger: string;
  dangerTint: string;
};

// Light palette is the canonical home. The canvas is set a touch deeper than
// the pure-white cards so the surface-to-card transition always reads (cards
// are separated by tone first, shadow second).
export const lightColors: Palette = {
  bg: '#ECEEE4',
  surface: '#FFFFFF',
  surfaceSoft: '#F6F7F1',
  ink: '#1B2320',
  inkSoft: '#3C443F',
  muted: '#616962',
  faint: '#848C83',
  feature: '#1B2320',
  featureSoft: '#3C443F',
  onInk: '#F3F4EF',
  onInkSoft: 'rgba(243,244,239,0.65)',
  onInkFaint: 'rgba(243,244,239,0.32)',
  onInkBorder: 'rgba(243,244,239,0.5)',
  onAccent: '#1B2320',
  accent: '#D6FF3F',
  accentDeep: '#BEEA30',
  accentCanvas: '#556300',
  border: '#DDE0D4',
  divider: '#E8EAE0',
  danger: '#B23A2E',
  dangerTint: '#F9ECEA',
};

// Dark palette — warm charcoal stone. The lime accent and the dark "feature"
// surfaces carry over unchanged so the brand survives the switch.
export const darkColors: Palette = {
  bg: '#121411',
  surface: '#1D201B',
  surfaceSoft: '#262A24',
  ink: '#EDEFEA',
  inkSoft: '#C6CCC4',
  muted: '#9BA39A',
  faint: '#6E766E',
  feature: '#0E100E',
  featureSoft: '#262A24',
  onInk: '#F3F4EF',
  onInkSoft: 'rgba(243,244,239,0.65)',
  onInkFaint: 'rgba(243,244,239,0.32)',
  onInkBorder: 'rgba(243,244,239,0.5)',
  onAccent: '#1B2320',
  accent: '#D6FF3F',
  accentDeep: '#BEEA30',
  accentCanvas: '#BEEA30',
  border: '#343A32',
  divider: '#282C26',
  danger: '#E07A6E',
  dangerTint: '#2A1713',
};

// Legacy static reference (light) — used by the top-level error boundary which
// must always be legible regardless of theme hydration.
export const colors = lightColors;

export type ColorToken = keyof Palette;

// Motion — one press/enter language across every control.
export const motion = {
  pressScale: 0.97, // subtle press-in scale (best-in-class apps snap ~0.97)
  pressSpring: { speed: 60, bounciness: 0 }, // fast settle, no overshoot
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

// Web containment — cap content so heroes/cards never stretch edge-to-edge.
export const layout = {
  contentMaxWidth: 640,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  pill: 999,
} as const;

// Soft elevation used by all cards. RN maps shadow* to box-shadow on web;
// elevation covers Android.
export const shadow: { card: ViewStyle; raised: ViewStyle } = {
  card: {
    shadowColor: '#1B2320',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 3,
  },
  raised: {
    shadowColor: '#1B2320',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 26,
    elevation: 6,
  },
};
