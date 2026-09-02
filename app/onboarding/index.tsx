import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BuildOverlay, Chip, Field, OptionButton, PrimaryButton, pageContainer } from '../../src/components';
import { CUISINE_LABEL, DIET_OPTIONS } from '../../src/data/constants';
import { CATALOG } from '../../src/data/ingredients';
import type { Diet } from '../../src/domain/types';
import { useI18n } from '../../src/i18n';
import { cuisineLabel, dietLabel } from '../../src/i18n/labels';
import { ingredientLabel } from '../../src/i18n/ingredients';
import { usePlanStore, useProfileStore, useShoppingStore } from '../../src/store';
import { Fonts, radius, shadow, space, Type, useTheme, useThemedStyles } from '../../src/theme';
import type { Palette } from '../../src/theme';

const SIZES = [1, 2, 3, 4, 5, 6];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { locale, strings } = useI18n();
  const profile = useProfileStore((s) => s.profile);
  const update = useProfileStore((s) => s.updateProfile);
  const completeOnboarding = useProfileStore((s) => s.completeOnboarding);
  const generate = usePlanStore((s) => s.generate);
  const clearShopping = useShoppingStore((s) => s.clear);

  const toggleDiet = (key: Diet) => {
    const has = profile.diets.includes(key);
    update({
      diets: has ? profile.diets.filter((d) => d !== key) : [...profile.diets, key],
    });
  };

  const [building, setBuilding] = useState(false);

  const onBuild = () => {
    if (building) return;
    setBuilding(true);
    setTimeout(() => {
      completeOnboarding();
      clearShopping();
      generate(profile);
      router.replace('/(tabs)/menu');
    }, 950);
  };

  const hasTaste = profile.cuisines.length > 0 || profile.disliked.length > 0;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, pageContainer, { paddingTop: insets.top + space.huge }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brand}>
          chef<Text style={styles.plus}>+</Text>
        </Text>
        <Text style={styles.eyebrow}>{strings.tagline}</Text>
        <Text style={styles.title}>{strings.onboarding.title}</Text>
        <Text style={styles.subtitle}>
          {hasTaste ? strings.onboarding.subtitleWithTaste : strings.onboarding.subtitlePlain}
        </Text>

        {hasTaste ? (
          <View style={styles.review}>
            <Text style={styles.reviewTitle}>{strings.onboarding.yourTaste}</Text>
            {profile.cuisines.length > 0 ? (
              <Field label={strings.onboarding.cuisines} note={strings.onboarding.tapRemove}>
                <View style={styles.wrap}>
                  {profile.cuisines.map((c) => (
                    <Chip
                      key={c}
                      label={cuisineLabel(locale, c, CUISINE_LABEL[c])}
                      onRemove={() => update({ cuisines: profile.cuisines.filter((x) => x !== c) })}
                    />
                  ))}
                </View>
              </Field>
            ) : null}
            {profile.disliked.length > 0 ? (
              <Field label={strings.onboarding.dislikesAvoid} note={strings.onboarding.tapKeep}>
                <View style={styles.wrap}>
                  {profile.disliked.map((k) => (
                    <Chip
                      key={k}
                      label={ingredientLabel(locale, k, CATALOG[k]?.label ?? k)}
                      onRemove={() => update({ disliked: profile.disliked.filter((x) => x !== k) })}
                    />
                  ))}
                </View>
              </Field>
            ) : null}
          </View>
        ) : null}

        <View style={styles.fields}>
          <Field label={strings.onboarding.howMany} note={strings.onboarding.qtyNote}>
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

          <Field label={strings.onboarding.anyDiets} hint={strings.common.optional} note={strings.onboarding.dietsNote}>
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
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <PrimaryButton title={strings.onboarding.buildWeek} icon="sparkles" onPress={onBuild} style={styles.cta} />
      </View>
      <BuildOverlay visible={building} />
    </KeyboardAvoidingView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    scroll: { flex: 1 },
    content: { paddingHorizontal: space.xl },
    brand: {
      fontFamily: Fonts.displayBold,
      ...Type.brand,
      color: c.ink,
      marginBottom: space.md,
    },
    plus: { color: c.accentCanvas },
    eyebrow: { fontFamily: Fonts.accentItalic, ...Type.eyebrow, color: c.inkSoft },
    title: {
      fontFamily: Fonts.displayBold,
      ...Type.hero,
      color: c.ink,
      marginTop: 30,
    },
    subtitle: {
      fontFamily: Fonts.body,
      ...Type.body,
      color: c.muted,
      marginTop: space.sm,
      maxWidth: 340,
    },
    review: {
      marginTop: space.xxxl,
      borderRadius: radius.lg,
      backgroundColor: c.surface,
      padding: space.lg,
      gap: space.md,
      ...shadow.card,
    },
    reviewTitle: {
      fontFamily: Fonts.displaySemi,
      ...Type.section,
      color: c.ink,
    },
    fields: { marginTop: space.xxxl },
    wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
    footer: {
      paddingHorizontal: space.xl,
      paddingTop: space.md,
      borderTopWidth: 1,
      borderTopColor: c.divider,
      backgroundColor: c.bg,
    },
    cta: { width: '100%' },
  });
