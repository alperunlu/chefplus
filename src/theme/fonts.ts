// Font family keys — these MUST match the keys passed to useFonts() in app/_layout.tsx.
// Fraunces = warm modern serif (optical sizes) — display headings, accents, brand.
//   Replaces Oswald (condensed grotesque) + Playfair (cold high-contrast italic)
//   with a single warm serif that gives chef+ its own voice, not Little Lemon's.
// Inter = neutral humanist sans — body, labels, UI.

export const Fonts = {
  displayBold: 'Fraunces_700Bold',
  displaySemi: 'Fraunces_600SemiBold',
  displayMedium: 'Fraunces_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  accentItalic: 'Fraunces_500Medium_Italic',
  accentItalicRegular: 'Fraunces_400Regular_Italic',
} as const;

// One canonical type scale — every screen draws its sizes from here so the app
// reads as a single system: a Fraunces display ramp + an Inter body ramp.
// The family is chosen separately (Fonts.*); these roles only set size/rhythm.
export const Type = {
  // Display ramp (Fraunces)
  brand: { fontSize: 56, lineHeight: 60, letterSpacing: -0.6 }, // chef+ wordmark
  hero: { fontSize: 40, lineHeight: 46, letterSpacing: -0.5 }, // onboarding headline
  screen: { fontSize: 34, lineHeight: 42, letterSpacing: -0.5 }, // tab + detail titles
  dish: { fontSize: 28, lineHeight: 36, letterSpacing: -0.5 }, // taste-card dish name
  day: { fontSize: 24, lineHeight: 32, letterSpacing: -0.3 }, // day-card title
  section: { fontSize: 18, lineHeight: 24, letterSpacing: -0.2 }, // card section headings
  step: { fontSize: 30, lineHeight: 40, letterSpacing: -0.4 }, // cook-mode step text
  eyebrow: { fontSize: 18, lineHeight: 24 }, // italic accent line
  // Body ramp (Inter)
  body: { fontSize: 15, lineHeight: 22 },
  label: { fontSize: 14, lineHeight: 20 },
  labelSm: { fontSize: 13, lineHeight: 18 },
  caption: { fontSize: 12, lineHeight: 16 },
  micro: { fontSize: 11, lineHeight: 14 },
} as const;

export type FontKey = keyof typeof Fonts;