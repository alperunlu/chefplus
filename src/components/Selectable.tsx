import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Fonts, radius, space, Type, useThemedStyles } from '../theme';
import type { Palette } from '../theme';
import { PressableScale } from './PressableScale';

type OptionButtonProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
};

// Pill-shaped selectable chip. Selected = solid feature fill, light label.
// Used for size pickers, meal toggles, diet chips and cuisine choices.
// Press feedback is the shared PressableScale squeeze; selection is the fill.
export function OptionButton({ label, selected, onPress, size = 'md', style }: OptionButtonProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <PressableScale accessibilityRole="button" accessibilityState={{ selected }} onPress={onPress} style={style}>
      <View
        style={[
          styles.opt,
          size === 'sm' ? styles.optSm : styles.optMd,
          selected ? styles.optSelected : styles.optIdle,
        ]}
      >
        <Text
          style={[styles.optLabel, size === 'sm' && styles.optLabelSm, selected && styles.optLabelSelected]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
      </View>
    </PressableScale>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    opt: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      borderWidth: 1,
    },
    optMd: { paddingVertical: 13, paddingHorizontal: space.xl },
    optSm: { paddingVertical: 12, paddingHorizontal: space.lg },
    optIdle: { backgroundColor: c.surface, borderColor: c.border },
    optSelected: { backgroundColor: c.feature, borderColor: c.feature },
    optLabel: {
      fontFamily: Fonts.bodyMedium,
      ...Type.label,
      color: c.ink,
    },
    optLabelSm: { ...Type.labelSm },
    optLabelSelected: { color: c.onInk },
  });
