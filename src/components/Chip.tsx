import { Ionicons } from '@expo/vector-icons';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useI18n } from '../i18n';
import { Fonts, radius, space, Type, useTheme, useThemedStyles } from '../theme';
import type { Palette } from '../theme';
import { PressableScale } from './PressableScale';

type ChipProps = {
  label: string;
  onRemove?: () => void;
  style?: StyleProp<ViewStyle>;
};

// Removable input chip: "olive oil ×". Used for disliked ingredients & pantry staples.
export function Chip({ label, onRemove, style }: ChipProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { strings } = useI18n();
  return (
    <View style={[styles.chip, style]}>
      <Text style={styles.chipLabel}>{label}</Text>
      {onRemove ? (
        <PressableScale
          onPress={onRemove}
          hitSlop={12}
          scaleTo={0.9}
          accessibilityLabel={`${strings.common.remove} ${label}`}
          accessibilityRole="button"
        >
          <Ionicons name="close" size={15} color={colors.ink} />
        </PressableScale>
      ) : null}
    </View>
  );
}

type PillTagProps = {
  label: string;
  tone?: 'ink' | 'accent' | 'outline' | 'glass';
  style?: StyleProp<ViewStyle>;
};

// Static category tag: "Main", "Turkish". Small rounded pill.
export function PillTag({ label, tone = 'outline', style }: PillTagProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View
      style={[
        styles.pill,
        tone === 'ink' && styles.pillInk,
        tone === 'accent' && styles.pillAccent,
        tone === 'glass' && styles.pillGlass,
        style,
      ]}
    >
      <Text
        style={[
          styles.pillLabel,
          tone === 'ink' && styles.pillLabelOnInk,
          tone === 'accent' && styles.pillLabelOnAccent,
          tone === 'glass' && styles.pillLabelOnGlass,
        ]}
        maxFontSizeMultiplier={1.3}
      >
        {label}
      </Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      backgroundColor: c.surfaceSoft,
      borderRadius: radius.pill,
      paddingVertical: 8,
      paddingHorizontal: space.md,
    },
    chipLabel: {
      fontFamily: Fonts.bodyMedium,
      ...Type.labelSm,
      color: c.ink,
    },
    pill: {
      alignSelf: 'flex-start',
      backgroundColor: c.surfaceSoft,
      paddingVertical: 5,
      paddingHorizontal: space.md,
      borderRadius: radius.pill,
    },
    pillInk: { backgroundColor: c.feature },
    pillAccent: { backgroundColor: c.accent },
    pillGlass: { backgroundColor: 'rgba(0,0,0,0.22)' },
    pillLabel: {
      fontFamily: Fonts.bodySemi,
      ...Type.micro,
      color: c.inkSoft,
      letterSpacing: 0.2,
    },
    pillLabelOnInk: { color: c.onInk },
    pillLabelOnAccent: { color: c.onAccent },
    pillLabelOnGlass: { color: c.onInk },
  });
