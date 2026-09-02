import { Ionicons } from '@expo/vector-icons';
import { ColorValue, StyleSheet, Text, View } from 'react-native';
import { CATEGORY_LABEL } from '../data/constants';
import type { MealCategory } from '../domain/types';
import { useI18n } from '../i18n';
import { categoryLabel } from '../i18n/labels';
import { Fonts, space, Type, useTheme, useThemedStyles } from '../theme';
import type { Palette } from '../theme';
import { PressableScale } from './PressableScale';

type Props = {
  slot: MealCategory;
  name: string;
  kcal: number;
  /** Cuisine identity colour — a small dot so day cards carry each dish's colour. */
  tone?: ColorValue;
  /** Small transparency line under the dish name — e.g. why an off-preference cuisine showed up. */
  note?: string;
  onOpen?: () => void;
  onSwap?: () => void;
  /** Rendered on a dark (feature) card — flips text to light. */
  onDark?: boolean;
};

// One planned meal: micro slot label over the dish name, kcal + swap on the right.
export function MealRow({ slot, name, kcal, tone, note, onOpen, onSwap, onDark }: Props) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { locale, strings } = useI18n();
  const nameColor = onDark ? colors.onInk : colors.ink;
  const subColor = onDark ? colors.onInkSoft : colors.muted;
  const iconColor = onDark ? colors.onInkSoft : colors.muted;

  return (
    <View style={styles.row}>
      <PressableScale style={styles.body} contentStyle={styles.bodyInner} onPress={onOpen} accessibilityRole="button">
        {tone ? <View style={[styles.toneDot, { backgroundColor: tone }]} /> : null}
        <View style={styles.nameCol}>
          <Text style={[styles.slot, { color: subColor }]} maxFontSizeMultiplier={1.3}>
            {categoryLabel(locale, slot, CATEGORY_LABEL[slot])}
          </Text>
          <Text style={[styles.name, { color: nameColor }]} numberOfLines={1}>
            {name}
          </Text>
          {note ? (
            <Text style={[styles.note, { color: subColor }]} numberOfLines={1} maxFontSizeMultiplier={1.3}>
              {note}
            </Text>
          ) : null}
        </View>
      </PressableScale>
      <Text style={[styles.kcal, { color: subColor }]} maxFontSizeMultiplier={1.3}>
        {kcal} {strings.menu.kcal}
      </Text>
      {onSwap ? (
        <PressableScale
          onPress={onSwap}
          hitSlop={14}
          style={styles.swap}
          scaleTo={0.88}
          accessibilityLabel={strings.common.remove}
        >
          <Ionicons name="sync-outline" size={16} color={iconColor} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      paddingVertical: 6,
    },
    body: {
      flex: 1,
    },
    bodyInner: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    nameCol: { flex: 1, gap: 1 },
    toneDot: { width: 10, height: 10, borderRadius: 999 },
    slot: {
      fontFamily: Fonts.bodyMedium,
      fontSize: 10,
      letterSpacing: 0.4,
      lineHeight: 14,
      color: c.muted,
    },
    name: {
      fontFamily: Fonts.bodyMedium,
      ...Type.body,
      color: c.ink,
    },
    note: {
      fontFamily: Fonts.body,
      fontSize: 11,
      lineHeight: 14,
      fontStyle: 'italic',
      marginTop: 1,
    },
    kcal: {
      fontFamily: Fonts.bodyMedium,
      ...Type.caption,
      color: c.muted,
    },
    swap: {
      padding: 2,
    },
  });
