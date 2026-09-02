import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark, BuildOverlay, EmptyState, MealRow, PressableScale, pageContainer } from '../../src/components';
import { CUISINE_LABEL } from '../../src/data/constants';
import { getRecipe } from '../../src/data/recipes';
import type { Cuisine, DayPlan, Weekday } from '../../src/domain/types';
import { useI18n } from '../../src/i18n';
import { localDateLabel, localRangeLabel } from '../../src/i18n/dates';
import { cuisineLabel, weekdayLabel } from '../../src/i18n/labels';
import { usePlanStore, useProfileStore, useShoppingStore } from '../../src/store';
import { Fonts, cuisineTone, radius, shadow, space, Type, useTheme, useThemedStyles } from '../../src/theme';
import type { Palette } from '../../src/theme';

const JS_TO_WD: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function sameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function MenuScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { locale, strings } = useI18n();
  const profile = useProfileStore((s) => s.profile);
  const week = usePlanStore((s) => s.week);
  const generate = usePlanStore((s) => s.generate);
  const regenerateWeek = usePlanStore((s) => s.regenerateWeek);
  const regenerateDay = usePlanStore((s) => s.regenerateDay);
  const swap = usePlanStore((s) => s.swap);
  const reanchor = usePlanStore((s) => s.reanchor);
  const clearShopping = useShoppingStore((s) => s.clear);

  // If the stored week predates today, roll it forward so the menu only shows
  // upcoming days (keeping the plan itself untouched).
  useEffect(() => {
    if (week && !sameLocalDay(new Date(week.startISO), new Date())) reanchor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const todayKey = JS_TO_WD[new Date().getDay()];
  const [building, setBuilding] = useState(false);

  // Data-viz weight for the landing surface: one glance at the week's shape.
  // Must run on every render (before any early return) so the hook count stays
  // stable — otherwise navigation in/out can trip "rendered fewer hooks".
  const summary = useMemo(() => {
    if (!week) return null;
    const dishes = new Set<string>();
    const ingredients = new Set<string>();
    let kcal = 0;
    for (const d of week.days) {
      kcal += d.totalKcal;
      for (const m of d.meals) {
        dishes.add(m.recipeId);
        getRecipe(m.recipeId)?.ingredients.forEach((i) => ingredients.add(i.key));
      }
    }
    return { kcal, dishes: dishes.size, ingredients: ingredients.size };
  }, [week]);

  const onBuild = () => {
    if (building) return;
    setBuilding(true);
    setTimeout(() => {
      generate(profile);
      setBuilding(false);
    }, 950);
  };

  if (!week) {
    return (
      <View style={styles.root}>
        <View style={{ flex: 1, paddingTop: insets.top + space.huge }}>
          <EmptyState
            title={strings.menu.noPlanTitle}
            message={strings.menu.noPlanMessage}
            actionLabel={strings.menu.buildWeek}
            onAction={onBuild}
          />
        </View>
        <BuildOverlay visible={building} />
      </View>
    );
  }

  const onRefreshWeek = () => {
    clearShopping();
    regenerateWeek(profile);
  };

  const openRecipe = (id: string) => router.push(`/recipe/${id}`);

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={{ ...pageContainer, paddingBottom: insets.bottom + space.huge }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: insets.top + space.xl }]}>
        <View style={styles.headerTop}>
          <View>
            <BrandMark />
            <Text style={styles.title}>{strings.menu.title}</Text>
            <Text style={styles.range}>
              {localRangeLabel(locale, week.startISO)} · {strings.menu.portions(profile.size)}
            </Text>
          </View>
          <View style={styles.tools}>
            <IconButton icon="share-outline" label={strings.menu.shareWeek} onPress={() => router.push('/share')} />
            <IconButton icon="refresh" label={strings.menu.shuffleWeek} onPress={onRefreshWeek} />
            <IconButton icon="settings-outline" label={strings.menu.tunePlan} onPress={() => router.push('/tune')} />
          </View>
        </View>
      </View>

      {summary ? (
        <View style={styles.summary}>
          <Stat icon="flame-outline" value={summary.kcal} unit={strings.menu.kcal} />
          <Stat icon="restaurant-outline" value={summary.dishes} unit={strings.menu.dishes} />
          <Stat icon="leaf-outline" value={summary.ingredients} unit={strings.menu.ingredients} />
          <Stat icon="calendar-outline" value={week.days.length} unit={strings.menu.days} />
        </View>
      ) : null}

      {week.days.map((d, i) => (
        <DayCard
          key={d.day}
          day={d}
          dayLabel={weekdayLabel(locale, d.day, d.label)}
          dateLabel={localDateLabel(locale, week.startISO, i)}
          highlight={d.day === todayKey}
          preferredCuisines={profile.cuisines}
          onOpen={openRecipe}
          onSwap={(m) => {
            clearShopping();
            swap(profile, d.day, m);
          }}
          onRefresh={() => {
            clearShopping();
            regenerateDay(profile, d.day);
          }}
        />
      ))}
    </ScrollView>
  );
}

function IconButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <PressableScale
      style={styles.iconBtn}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={18} color={colors.ink} />
    </PressableScale>
  );
}

function Stat({
  icon,
  value,
  unit,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  unit: string;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.stat}>
      <View style={styles.statTop}>
        <Ionicons name={icon} size={15} color={colors.accentCanvas} />
        <Text style={styles.statValue} maxFontSizeMultiplier={1.3}>
          {value}
        </Text>
      </View>
      <Text style={styles.statUnit} maxFontSizeMultiplier={1.3}>
        {unit}
      </Text>
    </View>
  );
}

function DayCard({
  day,
  dayLabel,
  dateLabel,
  highlight,
  preferredCuisines,
  onOpen,
  onSwap,
  onRefresh,
}: {
  day: DayPlan;
  dayLabel: string;
  dateLabel: string;
  highlight?: boolean;
  preferredCuisines: Cuisine[];
  onOpen: (id: string) => void;
  onSwap: (mealIndex: number) => void;
  onRefresh: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { locale, strings } = useI18n();
  const dark = !!highlight;
  const sub = dark ? colors.onInkSoft : colors.muted;
  const nameColor = dark ? colors.onInk : colors.ink;
  return (
    <View style={[styles.card, dark ? styles.cardHi : styles.cardPlain]}>
      <View style={styles.cardHead}>
        <View style={styles.cardHeadLeft}>
          <View style={styles.dayNameRow}>
            <Text style={[styles.dayName, { color: nameColor }]}>{dayLabel}</Text>
            {dark ? (
              <View style={styles.todayPill}>
                <Text style={styles.todayPillText} maxFontSizeMultiplier={1.3}>
                  {strings.menu.today}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.dayMeta, { color: sub }]}>
            {dateLabel} · ≈ {day.totalKcal} kcal
          </Text>
        </View>
      </View>

      <View style={styles.meals}>
        {day.meals.map((m, i) => {
          const recipe = getRecipe(m.recipeId);
          const offPreference =
            !!recipe && preferredCuisines.length > 0 && !preferredCuisines.includes(recipe.cuisine);
          return (
            <MealRow
              key={`${m.recipeId}-${i}`}
              slot={m.slot}
              name={recipe?.name ?? m.recipeId}
              kcal={m.kcal}
              tone={recipe ? cuisineTone[recipe.cuisine].deep : undefined}
              note={
                offPreference && recipe
                  ? strings.menu.addedForVariety(cuisineLabel(locale, recipe.cuisine, CUISINE_LABEL[recipe.cuisine]))
                  : undefined
              }
              onDark={dark}
              onOpen={() => onOpen(m.recipeId)}
              onSwap={() => onSwap(i)}
            />
          );
        })}
      </View>
      <PressableScale
        style={styles.refreshDay}
        contentStyle={styles.refreshDayInner}
        onPress={onRefresh}
        hitSlop={8}
        accessibilityRole="button"
      >
        <Ionicons name="refresh" size={14} color={dark ? colors.accent : colors.muted} />
        <Text style={[styles.refreshDayText, { color: dark ? colors.accent : colors.muted }]}>
          {strings.menu.rewriteDay}
        </Text>
      </PressableScale>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    header: { paddingHorizontal: space.xl, paddingBottom: space.md },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: space.md,
    },
    title: {
      fontFamily: Fonts.displayBold,
      ...Type.screen,
      color: c.ink,
    },
    range: { fontFamily: Fonts.bodyMedium, ...Type.labelSm, color: c.muted, marginTop: 4 },
    tools: { flexDirection: 'row', gap: space.sm, paddingTop: 4 },
    iconBtn: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow.card,
    },

    summary: {
      marginHorizontal: space.xl,
      marginTop: space.lg,
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      paddingVertical: space.lg,
      ...shadow.card,
    },
    stat: { alignItems: 'center', gap: 2 },
    statTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    statValue: { fontFamily: Fonts.displaySemi, ...Type.day, color: c.ink },
    statUnit: { fontFamily: Fonts.bodyMedium, ...Type.micro, color: c.muted },

    card: {
      marginHorizontal: space.xl,
      marginTop: space.lg,
      borderRadius: radius.xl,
      padding: space.xl,
      ...shadow.card,
    },
    cardPlain: { backgroundColor: c.surface },
    cardHi: {
      backgroundColor: c.feature,
      borderWidth: 1,
      borderColor: 'rgba(214,255,63,0.28)',
      ...shadow.raised,
    },
    cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardHeadLeft: { flex: 1 },
    dayNameRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, flexWrap: 'wrap' },
    dayName: { fontFamily: Fonts.displaySemi, ...Type.day },
    todayPill: {
      backgroundColor: c.accent,
      borderRadius: radius.pill,
      paddingHorizontal: space.md,
      paddingVertical: 3,
    },
    todayPillText: { fontFamily: Fonts.bodySemi, ...Type.micro, color: c.onAccent },
    dayMeta: { fontFamily: Fonts.bodyMedium, ...Type.caption, marginTop: 3 },
    meals: { marginTop: space.md },
    refreshDay: { flexDirection: 'row', alignItems: 'center', marginTop: space.md, alignSelf: 'flex-start' },
    refreshDayInner: { gap: 6 },
    refreshDayText: { fontFamily: Fonts.bodySemi, ...Type.labelSm },
  });
