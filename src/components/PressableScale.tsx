import { ReactNode, useRef } from 'react';
import {
  Animated,
  GestureResponderEvent,
  Platform,
  Pressable,
  PressableProps,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { motion } from '../theme';

// Animated.View can't run transforms on the native driver on web, so gate it.
const USE_NATIVE_DRIVER = Platform.OS !== 'web';

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  /** Sizing/layout for the outer animated shell (button pill, icon tile, …). */
  style?: StyleProp<ViewStyle>;
  /** Optional visual change on the inner pressable (fills the shell). */
  pressedStyle?: StyleProp<ViewStyle>;
  /** Layout for the inner pressable itself (fills the shell by default). */
  contentStyle?: StyleProp<ViewStyle>;
  /** Press-in scale. Defaults to the shared motion token. */
  scaleTo?: number;
  children: ReactNode;
};

// One press language for the whole app: a subtle spring-in scale. Replaces the
// patchwork of opacity/color-only feedback with a consistent, tactile squeeze.
export function PressableScale({ style, pressedStyle, contentStyle, scaleTo = motion.pressScale, children, onPressIn, onPressOut, ...rest }: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (e: GestureResponderEvent) => {
    Animated.spring(scale, { toValue: scaleTo, ...motion.pressSpring, useNativeDriver: USE_NATIVE_DRIVER }).start();
    onPressIn?.(e);
  };
  const handlePressOut = (e: GestureResponderEvent) => {
    Animated.spring(scale, { toValue: 1, ...motion.pressSpring, useNativeDriver: USE_NATIVE_DRIVER }).start();
    onPressOut?.(e);
  };

  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable {...rest} onPressIn={handlePressIn} onPressOut={handlePressOut} style={[styles.fill, contentStyle, pressedStyle]}>
        {children}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Centered by default so icon-only buttons sit their glyph flush inside the
  // shell; callers override layout through `contentStyle` (e.g. MealRow rows).
  //
  // NOTE: this is deliberately `flexGrow` + `flexBasis: 'auto'` and NOT `flex: 1`.
  // RN's `flex: 1` shorthand also sets `flexBasis: 0`, which makes the inner
  // pressable contribute zero height when the outer shell has no explicit height
  // (the common case: pill CTAs, chips, text buttons). Yoga then sizes the shell
  // to 0 and iOS clips the label to that empty frame — the button renders as an
  // empty pill. Web survives it because the overflowing text still paints, which
  // is why this only ever showed up on device/TestFlight. With `flexBasis: 'auto'`
  // the content measures itself, while `flexGrow` still fills shells that DO have
  // a fixed size (44×44 icon buttons, etc.).
  fill: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
