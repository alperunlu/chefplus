import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useRef } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import { BrandMark, EmptyState, PressableScale, PrimaryButton, pageContainer } from '../src/components';
import { getRecipe } from '../src/data/recipes';
import type { DayPlan } from '../src/domain/types';
import { useI18n } from '../src/i18n';
import { localRangeLabel } from '../src/i18n/dates';
import { weekdayLabel } from '../src/i18n/labels';
import type { Locale } from '../src/i18n/locale';
import { usePlanStore } from '../src/store';
import { Fonts, radius, shadow, space, Type, useTheme, useThemedStyles } from '../src/theme';
import type { Palette } from '../src/theme';

export default function ShareScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { locale, strings } = useI18n();
  const week = usePlanStore((s) => s.week);
  const posterRef = useRef<View>(null);

  const onShare = async () => {
    try {
      const uri = await captureRef(posterRef, { format: 'png', quality: 1 });
      if (Platform.OS === 'web') {
        // Sharing files isn't supported on web preview; open the image instead.
        window.open(uri, '_blank');
        return;
      }
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: strings.share.title });
      }
    } catch (e) {
      // no-op — capture unsupported on this platform
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ presentation: 'modal' }} />
      <View style={[styles.topBar, { paddingTop: insets.top + space.sm }]}>
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
        <Text style={styles.topTitle}>{strings.share.title}</Text>
        <BrandMark />
      </View>

      {!week ? (
        <View style={{ flex: 1 }}>
          <EmptyState
            title={strings.share.emptyTitle}
            message={strings.share.emptyMessage}
            actionLabel={strings.share.backToWeek}
            actionIcon="arrow-back"
            icon="share-outline"
            onAction={() => router.back()}
          />
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ ...pageContainer, padding: space.lg, paddingBottom: insets.bottom + 100 }}>
            <View ref={posterRef} collapsable={false} style={styles.poster}>
              <Text style={styles.brand}>
                chef<Text style={styles.plus}>+</Text>
              </Text>
              <View style={styles.posterHead}>
                <Text style={styles.posterTitle}>{strings.share.ourWeek}</Text>
                <View style={styles.rangePill}>
                  <Text style={styles.rangePillText} maxFontSizeMultiplier={1.3}>
                    {localRangeLabel(locale, week.startISO)}
                  </Text>
                </View>
              </View>
              <View style={styles.posterDays}>
                {week.days.map((d) => (
                  <PosterDay key={d.day} day={d} locale={locale} />
                ))}
              </View>
              <Text style={styles.posterFoot}>{strings.share.madeWith}</Text>
            </View>
          </ScrollView>

          <View style={[styles.footer, { paddingBottom: insets.bottom + space.md }]}>
            <PrimaryButton title={strings.share.shareImage} icon="share-outline" onPress={onShare} style={{ flex: 1 }} />
          </View>
        </>
      )}
    </View>
  );
}

function PosterDay({ day, locale }: { day: DayPlan; locale: Locale }) {
  const styles = useThemedStyles(makeStyles);
  const names = day.meals.map((m) => getRecipe(m.recipeId)?.name ?? '').filter(Boolean);
  return (
    <View style={styles.pday}>
      <View style={styles.pdayHead}>
        <Text style={styles.pdayName}>{weekdayLabel(locale, day.day, day.label)}</Text>
        <Text style={styles.pdayKcal}>≈ {day.totalKcal} kcal</Text>
      </View>
      {names.length ? <Text style={styles.pdayMeals}>{names.join(' · ')}</Text> : null}
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
    back: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surface,
      ...shadow.card,
    },
    topTitle: { fontFamily: Fonts.bodySemi, ...Type.label, color: c.ink },

    poster: {
      backgroundColor: c.feature,
      borderRadius: radius.xl,
      padding: space.xxl,
      ...shadow.raised,
    },
    brand: { fontFamily: Fonts.displayBold, fontSize: 40, color: c.onInk, letterSpacing: -0.5 },
    plus: { color: c.accentDeep },
    posterHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: space.sm,
    },
    posterTitle: { fontFamily: Fonts.displaySemi, fontSize: 20, color: c.onInk, letterSpacing: -0.3 },
    rangePill: {
      backgroundColor: c.accent,
      borderRadius: radius.pill,
      paddingHorizontal: space.md,
      paddingVertical: 4,
    },
    rangePillText: { fontFamily: Fonts.bodySemi, ...Type.caption, color: c.onAccent },
    posterDays: { marginTop: space.lg, gap: space.md },
    pday: {
      backgroundColor: 'rgba(243,244,239,0.08)',
      borderRadius: radius.md,
      paddingVertical: space.md,
      paddingHorizontal: space.lg,
    },
    pdayHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    pdayName: { fontFamily: Fonts.bodySemi, ...Type.body, color: c.onInk },
    pdayKcal: { fontFamily: Fonts.bodyMedium, ...Type.micro, color: c.onInkFaint },
    pdayMeals: { fontFamily: Fonts.body, ...Type.labelSm, color: c.onInkSoft, marginTop: 2 },
    posterFoot: {
      fontFamily: Fonts.bodyMedium,
      ...Type.micro,
      color: c.onInkFaint,
      textAlign: 'center',
      marginTop: space.lg,
    },
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      paddingHorizontal: space.xl,
      paddingTop: space.md,
      backgroundColor: c.bg,
    },
  });
