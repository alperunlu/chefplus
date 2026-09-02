# chef+

A weekly home-cooking meal planner. Pick the cuisines you love, build a
household profile, and get a rule-based weekly menu with an automatic
aisle-grouped shopping list and a recipe for every dish — all offline, no
account, no network calls.

Built with **Expo (React Native) + Expo Router + TypeScript**. Ships to iOS via
**EAS Build** (cloud builds — no Mac required, works from Windows).

## Features

- **Onboarding** — pick cuisines you love from a tile grid, or an optional
  swipe-through taste deck that predicts cuisines/diets/dislikes from what you
  like and pass on; then household size and dietary preferences.
- **Rule-based weekly menu** — deterministic, offline generation that honours
  diets and dislikes, keeps variety (no repeats within the week, no same
  protein two nights running), stays within your chosen cuisines, and nudges
  the week's dinners toward a healthy mix (at most one red-meat night, at
  least two vegetarian, at least one seafood) whenever the pool allows it.
  When a dish outside your chosen cuisines has to fill a slot, the menu says
  so in place rather than surprising you.
- **Per-meal swap** and **per-day / whole-week rewrite**, anchored to a
  rolling 7-day window starting today.
- **Favourites** and **block** ("don't show again") — favourited dishes get
  worked back into the plan; blocked dishes are excluded from generation.
  Post-cook "meh" ratings softly deprioritise a dish without hard-blocking it.
  Both lists are reviewable and reversible from the settings screen.
- **Cook mode** — full-screen step-by-step flow with a per-step timer
  (auto-detected from the instruction text, or a manual quick-pick), and a
  Cooked / Loved / Meh rating on the last step.
- **Recipe detail** — ingredients auto-scaled to household size, an estimated
  time, and the method.
- **Automatic shopping list** — every ingredient aggregated across the week,
  grouped by aisle, pantry staples flagged "at home", tick-off progress
  (kept in sync when the plan changes), copy/share as text.
- **Shareable week poster** — a single image of the whole week.
- **Settings** (`/tune`) — household size, meals to plan, diets, cuisines,
  disliked ingredients, favourites/blocked lists, language, light/dark theme,
  and a "delete all data" reset.
- **Light/dark theme** — seeded from the device's appearance the first time
  the app is opened, then an explicit, persisted choice from there on.
- **English, Turkish and Vietnamese** — UI strings and the full recipe corpus
  (names, descriptions, steps, ingredient labels) are localized for all three.

## Run it (development)

```bash
npm install
npm start          # or: npx expo start
```

Scan the QR code with **Expo Go** on your iPhone/Android. Live reload works from
Windows — no Mac needed for development.

Web preview (for quick checks): `npm run web`.

## Tests

Pure-logic and dataset-integrity tests (generator, filters, scaling, shopping,
taste-deck prediction, and a recipe validator):

```bash
npm test
```

## Project structure

```
app/                       Expo Router screens
  index.tsx                gate → onboarding or menu, based on persisted state
  onboarding/
    taste.tsx               cuisine tile picker (+ link to the swipe deck)
    quick-swipe.tsx          optional swipe-through taste probe
    index.tsx                household size + diets, then builds the week
  (tabs)/
    menu.tsx                 weekly menu board
    shopping.tsx             shopping list
  recipe/[id].tsx           recipe detail (favourite / block / start cooking)
  cook/[id].tsx             step-by-step cook mode with timers
  tune.tsx                  settings: profile, favourites/blocked, language, theme
  share.tsx                 shareable week poster
src/
  theme/                    tokens, fonts, type scale
  components/               design-system components (PressableScale, Button, …)
  domain/                   types, generator, filters, shopping, scaling, taste, validate
  data/                     recipes (per cuisine), ingredient catalog, constants
  i18n/                     en/tr/vi UI strings + localized recipe content
  store/                    zustand stores (profile / plan / shopping / theme / i18n) + persistence
```

## Design identity

"Soft kitchen": a pale-stone canvas, dark slate ink and one signature **lime**
accent, set in a warm serif display face (Fraunces) with a clean body sans
(Inter). The structural language is rounded, shadowed cards and pill-shaped
controls. Recipes don't use photography yet — each cuisine gets its own
deterministic colour identity (`CuisineBand`) instead.

## Recipe dataset

Recipes live in `src/data/recipes/<cuisine>.ts` and are merged in
`src/data/recipes/index.ts`. A validator (`src/domain/validate.ts`, run by
`npm test`) guarantees unique dish names, resolvable ingredient keys, valid
diet flags and adequate category coverage.

Currently **783 recipes across 18 cuisines** (American, Arabic, Chinese,
French, German, Greek, Indonesian, Italian, Japanese, Mexican, Peruvian,
Polish, Portuguese, Scandinavian, Serbian, Spanish, Turkish, Vietnamese).
Recipe content is fully localized into Turkish and Vietnamese alongside the
English source (`src/i18n/recipe-data/`).

## Known follow-ups

- No per-recipe photography — every dish falls back to a solid colour band.
- No way to browse/search the full recipe catalog outside of what the
  generator plans for the week.
- Breakfast/lunch are only toggled in Settings, not asked during onboarding.
- Six of the nine recipe categories (snack, soup, side, salad, meze,
  hot-starter) are authored in the data but never planned into a week yet.
