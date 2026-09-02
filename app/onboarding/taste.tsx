import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { pageContainer, PressableScale, PrimaryButton } from '../../src/components';
import { CUISINES } from '../../src/data/constants';
import type { Cuisine } from '../../src/domain/types';
import { useI18n } from '../../src/i18n';
import { cuisineLabel } from '../../src/i18n/labels';
import { useProfileStore } from '../../src/store';
import { cuisineTone, Fonts, radius, space, Type, useTheme, useThemedStyles } from '../../src/theme';
import type { Palette } from '../../src/theme';

export default function TasteScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { locale, strings } = useI18n();
  const profile = useProfileStore((s) => s.profile);
  const update = useProfileStore((s) => s.updateProfile);
  const markTasteDone = useProfileStore((s) => s.markTasteDone);

  const [picked, setPicked] = useState<Cuisine[]>(profile.cuisines);

  const toggle = (key: Cuisine) =>
    setPicked((prev) => (prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]));

  const onContinue = () => {
    update({ cuisines: picked });
    markTasteDone();
    router.replace('/onboarding');
  };

  return (
    <View style={[styles.root, pageContainer, { paddingTop: insets.top + space.huge }]}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.brand}>
          chef<Text style={styles.plus}>+</Text>
        </Text>
        <Text style={styles.eyebrow}>{strings.tagline}</Text>
        <Text style={styles.title}>{strings.onboarding.tasteTitle}</Text>
        <Text style={styles.subtitle}>{strings.onboarding.tasteSubtitle}</Text>

        <View style={styles.grid}>
          {CUISINES.map((c) => {
            const selected = picked.includes(c.key);
            return (
              <PressableScale
                key={c.key}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => toggle(c.key)}
                style={styles.tileWrap}
              >
                <View style={[styles.tile, selected ? styles.tileSelected : styles.tileIdle]}>
                  <View style={[styles.dot, { backgroundColor: cuisineTone[c.key].deep }]} />
                  <Text
                    style={[styles.tileLabel, selected && styles.tileLabelSelected]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {cuisineLabel(locale, c.key, c.label)}
                  </Text>
                </View>
              </PressableScale>
            );
          })}
        </View>

        <Text style={styles.hint}>
          {picked.length > 0 ? strings.onboarding.selected(picked.length) : strings.onboarding.noPicks}
        </Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
        <PrimaryButton title={strings.common.continue} icon="arrow-forward" onPress={onContinue} style={styles.cta} />
        <PressableScale
          onPress={() => router.push('/onboarding/quick-swipe')}
          hitSlop={8}
          scaleTo={0.96}
          accessibilityRole="button"
          style={styles.swipeAlt}
        >
          <Text style={styles.swipeAltText}>{strings.onboarding.swipeAlt}</Text>
        </PressableScale>
      </View>
    </View>
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
      maxWidth: 360,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: space.sm,
      marginTop: space.xxxl,
    },
    tileWrap: { flexBasis: '47%', flexGrow: 1 },
    tile: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      paddingVertical: 14,
      paddingHorizontal: space.lg,
      borderRadius: radius.lg,
      borderWidth: 1,
      alignSelf: 'stretch',
    },
    tileIdle: { backgroundColor: c.surface, borderColor: c.border },
    tileSelected: { backgroundColor: c.feature, borderColor: c.feature },
    dot: { width: 10, height: 10, borderRadius: 5 },
    tileLabel: {
      fontFamily: Fonts.bodySemi,
      ...Type.label,
      color: c.ink,
      letterSpacing: 0.1,
      flexShrink: 1,
    },
    tileLabelSelected: { color: c.onInk },
    hint: {
      fontFamily: Fonts.body,
      ...Type.caption,
      color: c.muted,
      textAlign: 'center',
      marginTop: space.xl,
    },
    footer: {
      paddingHorizontal: space.xl,
      paddingTop: space.md,
      borderTopWidth: 1,
      borderTopColor: c.divider,
      backgroundColor: c.bg,
    },
    cta: { width: '100%' },
    swipeAlt: {
      alignItems: 'center',
      paddingVertical: space.lg,
    },
    swipeAltText: {
      fontFamily: Fonts.bodySemi,
      ...Type.labelSm,
      color: c.muted,
    },
  });
