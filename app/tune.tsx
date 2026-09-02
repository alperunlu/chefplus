import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark, Chip, Field, OptionButton, PressableScale, TagInput, pageContainer } from '../src/components';
import { CUISINES, DIET_OPTIONS } from '../src/data/constants';
import { getRecipe } from '../src/data/recipes';
import type { Cuisine, Diet, HouseholdProfile } from '../src/domain/types';
import { useI18n } from '../src/i18n';
import { LOCALES, type Locale } from '../src/i18n/locale';
import { cuisineLabel, dietLabel } from '../src/i18n/labels';
import { getLocalizedRecipe } from '../src/i18n/recipes';
import { useI18nStore, usePlanStore, useProfileStore, useShoppingStore, useThemeStore } from '../src/store';
import { Fonts, radius, shadow, space, Type, useTheme, useThemedStyles } from '../src/theme';
import type { Palette } from '../src/theme';

const SIZES = [1, 2, 3, 4, 5, 6];

/** Compact snapshot of the plan-shaping fields — used to detect real changes. */
function planSignature(p: HouseholdProfile): string {
  return JSON.stringify({
    size: p.size,
    diets: p.diets,
    cuisines: p.cuisines,
    meals: p.meals,
    disliked: p.disliked,
  });
}

export default function TuneScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { locale, strings } = useI18n();
  const profile = useProfileStore((s) => s.profile);
  const update = useProfileStore((s) => s.updateProfile);
  const reset = useProfileStore((s) => s.reset);
  const toggleFavorite = useProfileStore((s) => s.toggleFavorite);
  const unblockRecipe = useProfileStore((s) => s.unblockRecipe);
  const regenerateWeek = usePlanStore((s) => s.regenerateWeek);
  const resetPlan = usePlanStore((s) => s.reset);
  const clearShopping = useShoppingStore((s) => s.clear);
  const themeMode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);
  const setLocale = useI18nStore((s) => s.setLocale);

  // Rebuild the week whenever a plan-shaping preference actually changes —
  // never on first open (that would reshuffle an untouched plan).
  const applied = useRef<string>(planSignature(profile));
  useEffect(() => {
    const sig = planSignature(profile);
    if (sig === applied.current) return;
    applied.current = sig;
    regenerateWeek(profile);
    clearShopping();
  }, [profile, regenerateWeek, clearShopping]);

  const toggleDiet = (key: Diet) =>
    update({ diets: profile.diets.includes(key) ? profile.diets.filter((d) => d !== key) : [...profile.diets, key] });
  const toggleCuisine = (key: Cuisine) =>
    update({ cuisines: profile.cuisines.includes(key) ? profile.cuisines.filter((c) => c !== key) : [...profile.cuisines, key] });
  const toggleMeal = (k: 'breakfast' | 'lunch') => update({ meals: { ...profile.meals, [k]: !profile.meals[k] } });

  const onDeleteAllData = () => {
    const erase = () => {
      reset();
      resetPlan();
      clearShopping();
      router.replace('/');
    };
    const message = strings.tune.deleteDialogMessage;
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm(`${strings.tune.deleteDialogTitle}\n\n${message}`)) erase();
      return;
    }
    Alert.alert(strings.tune.deleteDialogTitle, message, [
      { text: strings.common.cancel, style: 'cancel' },
      { text: strings.common.delete, style: 'destructive', onPress: erase },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ presentation: 'modal' }} />
      <View style={[styles.topBar, { paddingTop: insets.top + space.sm }]}>
        <BrandMark />
        <Text style={styles.topTitle}>{strings.tune.title}</Text>
        <PressableScale
          style={styles.close}
          onPress={() => router.back()}
          hitSlop={10}
          scaleTo={0.92}
          accessibilityLabel={strings.common.close}
          accessibilityRole="button"
        >
          <Ionicons name="close" size={20} color={colors.ink} />
        </PressableScale>
      </View>

      <ScrollView
        contentContainerStyle={{ ...pageContainer, paddingHorizontal: space.xl, paddingBottom: insets.bottom + space.huge }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>{strings.tune.subtitle}</Text>

        <View style={styles.group}>
          <Text style={styles.groupEyebrow}>{strings.tune.eyebrow.table}</Text>
          <Field label={strings.tune.howMany}>
            <View style={styles.wrap}>
              {SIZES.map((n) => (
                <OptionButton
                  key={n}
                  label={n === 6 ? strings.tune.sixPlus : String(n)}
                  selected={profile.size === n}
                  onPress={() => update({ size: n })}
                />
              ))}
            </View>
          </Field>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupEyebrow}>{strings.tune.eyebrow.meals}</Text>
          <Field label={strings.tune.mealsToPlan} note={strings.tune.dinnerAlways}>
            <View style={styles.wrap}>
              <OptionButton label={strings.tune.breakfast} selected={profile.meals.breakfast} onPress={() => toggleMeal('breakfast')} />
              <OptionButton label={strings.tune.lunch} selected={profile.meals.lunch} onPress={() => toggleMeal('lunch')} />
            </View>
          </Field>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupEyebrow}>{strings.tune.eyebrow.diet}</Text>
          <Field label={strings.tune.diets} hint={strings.common.optional} note={strings.tune.dietsNote}>
            <View style={styles.wrap}>
              {DIET_OPTIONS.map((o) => (
                <OptionButton
                  key={o.key}
                  label={dietLabel(locale, o.key, o.label)}
                  size="sm"
                  selected={profile.diets.includes(o.key)}
                  onPress={() => toggleDiet(o.key)}
                />
              ))}
            </View>
          </Field>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupEyebrow}>{strings.tune.eyebrow.taste}</Text>
          <Field label={strings.tune.cuisinesLove} hint={strings.common.optional} note={strings.tune.cuisinesNote}>
            <View style={styles.wrap}>
              {CUISINES.map((c) => (
                <OptionButton
                  key={c.key}
                  label={cuisineLabel(locale, c.key, c.label)}
                  size="sm"
                  selected={profile.cuisines.includes(c.key)}
                  onPress={() => toggleCuisine(c.key)}
                />
              ))}
            </View>
          </Field>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupEyebrow}>{strings.tune.eyebrow.aversion}</Text>
          <Field label={strings.tune.disliked} hint={strings.common.optional} note={strings.tune.dislikedNote}>
            <TagInput
              value={profile.disliked}
              onChange={(next) => update({ disliked: next })}
              placeholder={strings.tune.dislikedPlaceholder}
            />
          </Field>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupEyebrow}>{strings.tune.eyebrow.saved}</Text>
          <Field label={strings.tune.favorites} note={profile.favoriteRecipes.length > 0 ? strings.onboarding.tapRemove : undefined}>
            {profile.favoriteRecipes.length > 0 ? (
              <View style={styles.wrap}>
                {profile.favoriteRecipes.map((id) => {
                  const recipe = getRecipe(id);
                  if (!recipe) return null;
                  return (
                    <Chip
                      key={id}
                      label={getLocalizedRecipe(locale, recipe).name}
                      onRemove={() => toggleFavorite(id)}
                    />
                  );
                })}
              </View>
            ) : (
              <Text style={styles.emptyNote}>{strings.tune.favoritesEmpty}</Text>
            )}
          </Field>
          <Field label={strings.tune.blocked} note={profile.blockedRecipes.length > 0 ? strings.tune.unblock : undefined}>
            {profile.blockedRecipes.length > 0 ? (
              <View style={styles.wrap}>
                {profile.blockedRecipes.map((id) => {
                  const recipe = getRecipe(id);
                  if (!recipe) return null;
                  return (
                    <Chip
                      key={id}
                      label={getLocalizedRecipe(locale, recipe).name}
                      onRemove={() => unblockRecipe(id)}
                    />
                  );
                })}
              </View>
            ) : (
              <Text style={styles.emptyNote}>{strings.tune.blockedEmpty}</Text>
            )}
          </Field>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupEyebrow}>{strings.tune.eyebrow.language}</Text>
          <Field label={strings.tune.eyebrow.language}>
            <View style={styles.wrap}>
              {LOCALES.map((l) => (
                <OptionButton
                  key={l.key}
                  label={l.label}
                  selected={locale === l.key}
                  onPress={() => setLocale(l.key)}
                />
              ))}
            </View>
          </Field>
        </View>

        <View style={styles.group}>
          <Text style={styles.groupEyebrow}>{strings.tune.eyebrow.appearance}</Text>
          <Field label={strings.tune.theme} note={strings.tune.themeNote}>
            <View style={styles.wrap}>
              {(['light', 'dark'] as const).map((m) => (
                <OptionButton
                  key={m}
                  label={m === 'light' ? strings.tune.light : strings.tune.dark}
                  selected={themeMode === m}
                  onPress={() => setMode(m)}
                />
              ))}
            </View>
          </Field>
        </View>

        <View style={styles.danger}>
          <Text style={styles.dangerText}>{strings.tune.erase}</Text>
          <PressableScale
            style={styles.dangerBtn}
            contentStyle={styles.dangerBtnInner}
            onPress={onDeleteAllData}
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
            <Text style={styles.dangerBtnText}>{strings.tune.deleteAll}</Text>
          </PressableScale>
        </View>

        <View style={styles.about}>
          <Text style={styles.aboutVersion}>{strings.tune.version}</Text>
          <Text style={styles.aboutText}>{strings.tune.about}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: space.xl,
      paddingBottom: space.sm,
    },
    close: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surface,
      ...shadow.card,
    },
    topTitle: { fontFamily: Fonts.displaySemi, ...Type.section, color: c.ink },
    subtitle: {
      fontFamily: Fonts.body,
      ...Type.label,
      color: c.muted,
      marginBottom: space.xxl,
      marginTop: space.sm,
    },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
    group: {
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      padding: space.lg,
      gap: space.md,
      marginBottom: space.lg,
      ...shadow.card,
    },
    groupEyebrow: { fontFamily: Fonts.accentItalic, ...Type.label, color: c.inkSoft },
    emptyNote: { fontFamily: Fonts.body, ...Type.labelSm, color: c.muted },
    about: { marginTop: space.sm },
    aboutText: { fontFamily: Fonts.body, ...Type.labelSm, color: c.muted },
    aboutVersion: {
      fontFamily: Fonts.bodySemi,
      ...Type.micro,
      color: c.muted,
      marginTop: space.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    danger: {
      marginTop: space.xxxl,
      borderRadius: radius.lg,
      backgroundColor: c.dangerTint,
      padding: space.xl,
      gap: space.md,
    },
    dangerText: { fontFamily: Fonts.body, ...Type.labelSm, color: c.muted },
    dangerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: c.surface,
      paddingVertical: 12,
    },
    dangerBtnInner: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    dangerBtnText: { fontFamily: Fonts.bodySemi, ...Type.labelSm, color: c.danger },
  });
