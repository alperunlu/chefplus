import { Ionicons } from '@expo/vector-icons';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Fonts, radius, space, useTheme, useThemedStyles } from '../theme';
import type { Palette } from '../theme';
import { PrimaryButton } from './Button';

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
};

// One empty-state language across the app: an icon, a clear title, a single
// line of guidance, and one obvious action. Menu / shopping / share all render
// through this so the pattern can't drift.
export function EmptyState({ title, message, actionLabel, onAction, actionIcon = 'sparkles', icon = 'restaurant-outline', style }: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.root, style]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={colors.muted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <PrimaryButton title={actionLabel} icon={actionIcon} onPress={onAction} style={styles.cta} />
      ) : null}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: space.xl,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: radius.pill,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: space.lg,
    },
    title: {
      fontFamily: Fonts.displaySemi,
      fontSize: 18,
      lineHeight: 24,
      color: c.ink,
      letterSpacing: -0.2,
      textAlign: 'center',
    },
    message: {
      fontFamily: Fonts.body,
      fontSize: 15,
      lineHeight: 22,
      color: c.muted,
      textAlign: 'center',
      marginTop: space.xs,
      maxWidth: 320,
    },
    cta: { marginTop: space.xl },
  });
