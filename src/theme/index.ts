import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useThemeStore } from '../store/useThemeStore';
import type { ThemeMode } from '../store/useThemeStore';
import { darkColors, lightColors } from './tokens';
import type { Palette } from './tokens';

export {
  colors,
  space,
  radius,
  shadow,
  motion,
  layout,
  lightColors,
  darkColors,
} from './tokens';
export type { Palette, ColorToken } from './tokens';
export { cuisineTone } from './palette';
export { Fonts, Type } from './fonts';
export type { FontKey } from './fonts';

// Resolve the active palette. The device's appearance only seeds the mode at
// first launch (see useThemeStore) — from then on it's an explicit, persisted
// choice, not a live-following system setting.
export function useTheme() {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  return {
    mode,
    resolved: mode,
    isDark: mode === 'dark',
    setMode,
    colors: mode === 'dark' ? darkColors : lightColors,
  };
}

// Build a StyleSheet from the active palette. Pass a stable module-level
// factory (`(colors) => ({...})`) — the result is memoized per palette, so
// screens re-style automatically when the theme switches.
export function useThemedStyles(
  factory: (c: Palette) => StyleSheet.NamedStyles<any>,
): StyleSheet.NamedStyles<any> {
  const { colors } = useTheme();
  return useMemo(() => StyleSheet.create(factory(colors)), [colors]);
}

export type { ThemeMode };
