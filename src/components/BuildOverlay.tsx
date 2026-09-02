import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet } from 'react-native';
import { useI18n } from '../i18n';
import { Fonts, radius, space, useTheme, useThemedStyles } from '../theme';
import type { Palette } from '../theme';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

type BuildOverlayProps = { visible: boolean };

// The "checked off" moment: a full-bleed feature veil that dims the screen while
// a lime badge springs in. Lets "Build my week" land as a small ceremony instead
// of an instant page swap. Native-driver-safe on web.
export function BuildOverlay({ visible }: BuildOverlayProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { strings } = useI18n();
  const fade = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  const titleFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      fade.setValue(0);
      pop.setValue(0);
      titleFade.setValue(0);
      return;
    }
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.spring(pop, { toValue: 1, speed: 16, bounciness: 9, useNativeDriver: USE_NATIVE_DRIVER }),
      // Title lands ~90ms after the badge starts popping, so the checkmark
      // reads as the first beat and the title as a considered follow-through
      // rather than both arriving in lockstep with the veil.
      Animated.timing(titleFade, { toValue: 1, duration: 220, delay: 90, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
  }, [visible, fade, pop, titleFade]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.veil, { opacity: fade }]}>
      <Animated.View style={[styles.badge, { transform: [{ scale: pop }] }]}>
        <Ionicons name="checkmark" size={30} color={colors.onAccent} />
      </Animated.View>
      <Animated.Text style={[styles.title, { opacity: titleFade }]}>{strings.build.ready}</Animated.Text>
    </Animated.View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    veil: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(14,16,14,0.86)',
      alignItems: 'center',
      justifyContent: 'center',
      gap: space.lg,
      zIndex: 10,
    },
    badge: {
      width: 68,
      height: 68,
      borderRadius: radius.pill,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontFamily: Fonts.displaySemi,
      fontSize: 20,
      lineHeight: 26,
      color: c.onInk,
      letterSpacing: -0.2,
    },
  });
