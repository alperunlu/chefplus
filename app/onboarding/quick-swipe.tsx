import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { pageContainer, TasteDeck } from '../../src/components';
import { RECIPES } from '../../src/data/recipes';
import { buildQuickDeck, predictProfile, QUICK_DECK_SIZE } from '../../src/domain/taste';
import type { Recipe } from '../../src/domain/types';
import { useI18n } from '../../src/i18n';
import { useProfileStore } from '../../src/store';
import { Fonts, space, Type, useTheme, useThemedStyles } from '../../src/theme';
import type { Palette } from '../../src/theme';

export default function QuickSwipeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { strings } = useI18n();
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const markTasteDone = useProfileStore((s) => s.markTasteDone);

  const deck = useMemo(() => buildQuickDeck(RECIPES, QUICK_DECK_SIZE), []);

  const finish = (likes: Recipe[], passes: Recipe[]) => {
    const predicted = predictProfile(likes, passes);
    updateProfile({
      cuisines: Array.from(new Set([...profile.cuisines, ...predicted.cuisines])),
      diets: Array.from(new Set([...profile.diets, ...predicted.diets])),
      disliked: Array.from(new Set([...profile.disliked, ...predicted.disliked])),
    });
    markTasteDone();
    router.replace('/onboarding');
  };

  return (
    <View style={[styles.root, pageContainer, { paddingTop: insets.top + space.huge }]}>
      <Text style={styles.brand}>
        chef<Text style={styles.plus}>+</Text>
      </Text>
      <Text style={styles.eyebrow}>{strings.tagline}</Text>
      <Text style={styles.title}>{strings.onboarding.swipeTitle}</Text>
      <Text style={styles.subtitle}>{strings.onboarding.swipeSubtitle(QUICK_DECK_SIZE)}</Text>
      <TasteDeck deck={deck} onFinish={finish} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg, paddingHorizontal: space.xl },
    brand: {
      fontFamily: Fonts.displayBold,
      ...Type.brand,
      color: c.ink,
    },
    plus: { color: c.accentCanvas },
    eyebrow: { fontFamily: Fonts.accentItalic, ...Type.eyebrow, color: c.inkSoft, marginTop: space.md },
    title: {
      fontFamily: Fonts.displayBold,
      ...Type.dish,
      color: c.ink,
      marginTop: space.xl,
    },
    subtitle: {
      fontFamily: Fonts.body,
      ...Type.body,
      color: c.muted,
      marginTop: space.sm,
      maxWidth: 340,
    },
  });
