import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark, CuisineBand, PillTag, PressableScale, PrimaryButton, pageContainer } from '../../src/components';
import { CATALOG } from '../../src/data/ingredients';
import { getRecipe } from '../../src/data/recipes';
import { scaledIngredients } from '../../src/domain/scaling';
import { estimateTimeMinutes } from '../../src/domain/time';
import { useI18n } from '../../src/i18n';
import { formatQtyLocal } from '../../src/i18n/format';
import { ingredientLabel } from '../../src/i18n/ingredients';
import { categoryLabel, cuisineLabel } from '../../src/i18n/labels';
import { getLocalizedRecipe } from '../../src/i18n/recipes';
import { useProfileStore, usePlanStore, useShoppingStore } from '../../src/store';
import { Fonts, radius, shadow, space, Type, useTheme, useThemedStyles } from '../../src/theme';
import type { Palette } from '../../src/theme';

export default function RecipeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { locale, strings } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const size = useProfileStore((s) => s.profile.size);
  const isFavorite = useProfileStore((s) => s.profile.favoriteRecipes.includes(id));
  const blockRecipe = useProfileStore((s) => s.blockRecipe);
  const toggleFavorite = useProfileStore((s) => s.toggleFavorite);
  const swap = usePlanStore((s) => s.swap);
  const week = usePlanStore((s) => s.week);
  const clearShopping = useShoppingStore((s) => s.clear);
  const base = getRecipe(id);
  const recipe = base ? getLocalizedRecipe(locale, base) : base;

  if (!recipe) {
    return (
      <View style={[styles.missing, { paddingTop: insets.top + space.huge }]}>
        <Stack.Screen options={{ animation: 'default' }} />
        <Text style={styles.missingText}>{strings.error.recipeNotFound}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>{strings.common.goBack}</Text>
        </Pressable>
      </View>
    );
  }

  const ingredients = scaledIngredients(recipe, size);
  const timeMinutes = estimateTimeMinutes(recipe);

  // After blocking, replace this recipe wherever it appears in the current week using
  // the freshly-updated profile (not the stale render-time snapshot), so the just-blocked
  // recipe can't be picked as its own replacement.
  const onBlock = () => {
    blockRecipe(recipe.id);
    const freshProfile = useProfileStore.getState().profile;
    if (week) {
      week.days.forEach((d) => {
        d.meals.forEach((m, i) => {
          if (m.recipeId === recipe.id) {
            swap(freshProfile, d.day, i);
          }
        });
      });
      clearShopping();
    }
    router.back();
  };

  return (
    <View style={styles.root}>
      {/* Override the root Stack's blanket fade with a native push — this
          screen is a drill-in from the menu, not a top-level tab swap. */}
      <Stack.Screen options={{ animation: 'default' }} />
      <ScrollView
        contentContainerStyle={{ ...pageContainer, paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.huge }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <PressableScale
            style={styles.back}
            onPress={() => router.back()}
            hitSlop={10}
            scaleTo={0.92}
            accessibilityLabel={strings.common.goBack}
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={22} color={colors.ink} />
          </PressableScale>
          <View style={styles.brandWrap}>
            <BrandMark />
          </View>
          <View style={styles.topActions}>
            <PressableScale
              style={styles.iconToggle}
              onPress={() => toggleFavorite(recipe.id)}
              hitSlop={8}
              scaleTo={0.92}
              accessibilityLabel={
                isFavorite ? strings.recipe.favourited : strings.recipe.favorite
              }
              accessibilityRole="button"
            >
              <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={19} color={colors.ink} />
            </PressableScale>
            <PressableScale
              style={styles.iconToggle}
              onPress={onBlock}
              hitSlop={8}
              scaleTo={0.92}
              accessibilityLabel={`${strings.recipe.dontShow} ${recipe.name}`}
              accessibilityRole="button"
            >
              <Ionicons name="ban-outline" size={19} color={colors.ink} />
            </PressableScale>
          </View>
        </View>

        <View style={styles.body}>
          <CuisineBand cuisine={recipe.cuisine} height={348} style={{ borderRadius: radius.xl }}>
            <View style={styles.hero}>
              <View style={styles.heroTags}>
                <PillTag label={categoryLabel(locale, recipe.category)} tone="glass" />
                <PillTag label={cuisineLabel(locale, recipe.cuisine)} tone="glass" />
              </View>
              <View>
                <Text style={styles.title}>{recipe.name}</Text>
                {recipe.description ? <Text style={styles.desc}>{recipe.description}</Text> : null}
                <View style={styles.meta}>
                  <Meta onDark icon="people-outline" text={strings.recipe.servings(size)} />
                  <Meta onDark icon="flame-outline" text={strings.recipe.kcalPerServing(recipe.kcalPerServing)} />
                  <Meta onDark icon="time-outline" text={strings.recipe.approxMin(timeMinutes)} />
                </View>
              </View>
              <PrimaryButton
                title={strings.recipe.startCooking}
                icon="play"
                onPress={() => router.push(`/cook/${recipe.id}`)}
                style={styles.cookBtn}
              />
            </View>
          </CuisineBand>

          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>{strings.recipe.ingredients}</Text>
              <Text style={styles.sectionNote}>{strings.recipe.scaledFor(size)}</Text>
            </View>
            <View style={styles.card}>
              {ingredients.map((ing) => (
                <View key={ing.key} style={styles.ingRow}>
                  <Text style={styles.ingLabel} numberOfLines={1}>
                    {ingredientLabel(locale, ing.key, CATALOG[ing.key]?.label)}
                  </Text>
                  <Text style={styles.ingQty}>{formatQtyLocal(locale, ing.qty, ing.unit)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{strings.recipe.method}</Text>
            <View style={{ gap: space.md, marginTop: space.md }}>
              {recipe.steps.map((step, i) => (
                <View key={i} style={styles.step}>
                  <View style={styles.stepNum}>
                    <Text style={styles.stepNumText} maxFontSizeMultiplier={1.3}>
                      {i + 1}
                    </Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Meta({ icon, text, onDark }: { icon: keyof typeof Ionicons.glyphMap; text: string; onDark?: boolean }) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={15} color={onDark ? colors.onInkSoft : colors.muted} />
      <Text style={[styles.metaText, onDark && styles.metaTextOnDark]} maxFontSizeMultiplier={1.3}>
        {text}
      </Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: space.lg,
      paddingBottom: space.sm,
    },
    brandWrap: { flex: 1, alignItems: 'center' },
    back: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surface,
      ...shadow.card,
    },
    topActions: { flexDirection: 'row', gap: space.sm },
    iconToggle: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surface,
      ...shadow.card,
    },
    body: { paddingHorizontal: space.xl },
    hero: {
      flex: 1,
      justifyContent: 'space-between',
      padding: space.xl,
    },
    heroTags: { flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' },
    title: {
      fontFamily: Fonts.displayBold,
      ...Type.screen,
      color: c.onInk,
    },
    desc: {
      fontFamily: Fonts.accentItalic,
      fontSize: 17,
      color: c.onInk,
      marginTop: space.sm,
    },
    meta: {
      flexDirection: 'row',
      gap: space.xl,
      marginTop: space.lg,
      flexWrap: 'wrap',
      rowGap: space.sm,
    },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { fontFamily: Fonts.bodyMedium, ...Type.labelSm, color: c.muted },
    metaTextOnDark: { color: c.onInk },
    cookBtn: { marginTop: space.xl },
    section: { marginTop: space.xxl },
    sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: space.md },
    sectionTitle: {
      fontFamily: Fonts.displaySemi,
      ...Type.section,
      color: c.ink,
    },
    sectionNote: { fontFamily: Fonts.body, ...Type.caption, color: c.muted },
    card: {
      borderRadius: radius.lg,
      backgroundColor: c.surface,
      paddingVertical: space.md,
      paddingHorizontal: space.lg,
      gap: space.xs,
      ...shadow.card,
    },
    ingRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      gap: space.md,
      paddingVertical: space.xs,
    },
    ingLabel: { flexShrink: 1, fontFamily: Fonts.body, ...Type.body, color: c.ink },
    ingQty: { fontFamily: Fonts.bodyMedium, ...Type.labelSm, color: c.muted },
    step: { flexDirection: 'row', gap: space.md, alignItems: 'flex-start' },
    stepNum: {
      width: 28,
      height: 28,
      borderRadius: radius.pill,
      backgroundColor: c.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepNumText: { fontFamily: Fonts.bodySemi, ...Type.labelSm, color: c.onAccent },
    stepText: { flex: 1, fontFamily: Fonts.body, ...Type.body, color: c.ink, paddingTop: 2 },
    missing: { flex: 1, backgroundColor: c.bg, alignItems: 'center', gap: space.md },
    missingText: { fontFamily: Fonts.body, ...Type.body, color: c.ink },
    link: { fontFamily: Fonts.bodySemi, ...Type.label, color: c.ink, textDecorationLine: 'underline' },
  });
