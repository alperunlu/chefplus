import { Ionicons } from '@expo/vector-icons';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Fonts, radius, shadow, space, Type, useTheme, useThemedStyles } from '../theme';
import type { Palette } from '../theme';
import { PressableScale } from './PressableScale';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
};

// Pill-shaped, borderless buttons — soft-kitchen language. Press feedback is the
// shared PressableScale squeeze (0.97), not a colour swap.
export function PrimaryButton({ title, onPress, disabled, icon, style }: ButtonProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <PressableScale accessibilityRole="button" disabled={disabled} onPress={onPress} style={style}>
      <View style={[styles.base, styles.primary, disabled && styles.disabled]}>
        {icon ? <Ionicons name={icon} size={18} color={colors.onInk} style={styles.leftIcon} /> : null}
        <Text style={styles.primaryText} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      </View>
    </PressableScale>
  );
}

export function SecondaryButton({ title, onPress, disabled, icon, style }: ButtonProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <PressableScale accessibilityRole="button" disabled={disabled} onPress={onPress} style={style}>
      <View style={[styles.base, styles.secondary, disabled && styles.disabled]}>
        {icon ? <Ionicons name={icon} size={18} color={colors.ink} style={styles.leftIcon} /> : null}
        <Text style={styles.secondaryText} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      </View>
    </PressableScale>
  );
}

export function TextButton({ title, onPress, icon = 'chevron-back', style }: ButtonProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <PressableScale onPress={onPress} hitSlop={8} scaleTo={0.96} style={style}>
      <View style={styles.textBtn}>
        {icon ? <Ionicons name={icon} size={18} color={colors.ink} /> : null}
        <Text style={styles.textBtnLabel} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
      </View>
    </PressableScale>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      paddingHorizontal: space.xxl,
      borderRadius: radius.pill,
      flexShrink: 1,
      alignSelf: 'stretch',
    },
    leftIcon: { marginRight: space.sm },
    primary: { backgroundColor: c.feature, ...shadow.card },
    primaryText: {
      fontFamily: Fonts.bodySemi,
      fontSize: 16,
      color: c.onInk,
      letterSpacing: 0.2,
      flexShrink: 1,
    },
    secondary: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    secondaryText: {
      fontFamily: Fonts.bodySemi,
      fontSize: 16,
      color: c.ink,
      letterSpacing: 0.2,
      flexShrink: 1,
    },
    disabled: { opacity: 0.4 },
    textBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.xs,
      paddingVertical: space.sm,
    },
    textBtnLabel: {
      fontFamily: Fonts.bodySemi,
      ...Type.label,
      color: c.ink,
      flexShrink: 1,
    },
  });
