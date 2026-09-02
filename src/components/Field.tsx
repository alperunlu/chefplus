import { ReactNode } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Fonts, space, Type, useThemedStyles } from '../theme';
import type { Palette } from '../theme';

type FieldProps = {
  label: string;
  hint?: string; // small parenthetical to the right of the label, e.g. "(optional)"
  note?: string; // helper text below the control
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

// Labelled form section used across the onboarding wizard.
export function Field({ label, hint, note, children, style }: FieldProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint} maxFontSizeMultiplier={1.3}>{hint}</Text> : null}
      </View>
      {children}
      {note ? <Text style={styles.note}>{note}</Text> : null}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    wrap: { marginBottom: space.xxl },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: space.sm,
      marginBottom: space.md,
    },
    label: {
      fontFamily: Fonts.bodySemi,
      ...Type.body,
      color: c.ink,
    },
    hint: {
      fontFamily: Fonts.body,
      ...Type.caption,
      color: c.muted,
    },
    note: {
      fontFamily: Fonts.body,
      ...Type.caption,
      color: c.muted,
      marginTop: space.sm,
    },
  });
