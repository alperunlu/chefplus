import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, Pressable, StyleSheet, Text, View, Vibration } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark, PressableScale } from '../../src/components';
import { getRecipe } from '../../src/data/recipes';
import { extractTimerMinutes } from '../../src/domain/time';
import { useI18n } from '../../src/i18n';
import { getLocalizedRecipe } from '../../src/i18n/recipes';
import { useProfileStore } from '../../src/store';
import { Fonts, radius, space, Type, useTheme, useThemedStyles } from '../../src/theme';
import type { Palette } from '../../src/theme';

const QUICK_TIMERS = [1, 3, 5, 10, 15];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function CookScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { locale, strings } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const base = getRecipe(id);
  const recipe = base ? getLocalizedRecipe(locale, base) : base;

  const [step, setStep] = useState(0);
  const stepText = recipe?.steps[step] ?? '';
  const timerMinutes = extractTimerMinutes(stepText);
  const [remaining, setRemaining] = useState(timerMinutes ? timerMinutes * 60 : 0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [manualMin, setManualMin] = useState<number | null>(null);
  const pulse = useRef(new Animated.Value(1)).current;

  // Post-cook verdict: pre-fill from the stored profile, then let local picks
  // win until this recipe is rated again.
  const profile = useProfileStore((s) => s.profile);
  const recordFeedback = useProfileStore((s) => s.recordFeedback);
  const recipeId = recipe?.id;
  const storedRating: 'loved' | 'meh' | null = useMemo(() => {
    if (recipeId && profile.loved.includes(recipeId)) return 'loved';
    if (recipeId && profile.meh.includes(recipeId)) return 'meh';
    return null;
  }, [recipeId, profile.loved, profile.meh]);
  const [picked, setPicked] = useState<'loved' | 'meh' | null | undefined>(undefined);
  const activeRating = picked !== undefined ? picked : storedRating;
  const isCooked = !!recipeId && profile.cooked.some((c) => c.id === recipeId);

  // Re-arm the countdown when moving to a new step.
  useEffect(() => {
    setRemaining(timerMinutes ? timerMinutes * 60 : 0);
    setRunning(false);
    setDone(false);
    setManualMin(null);
  }, [step, stepText]);

  useEffect(() => {
    if (!running) return;
    if (remaining <= 0) {
      setRunning(false);
      setDone(true);
      Vibration.vibrate(Platform.OS === 'android' ? [0, 300, 150, 300] : 400);
      return;
    }
    const t = setTimeout(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearTimeout(t);
  }, [running, remaining]);

  // Pulse the digits while the timer has finished so completion reads visually
  // even if vibration is unavailable.
  useEffect(() => {
    if (!done) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 320, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 320, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [done, pulse]);

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

  const isLast = step >= recipe.steps.length - 1;
  const progress = recipe.steps.length > 1 ? step / (recipe.steps.length - 1) : 1;
  const timerSource = manualMin ?? timerMinutes;
  const timerTotal = timerSource ? timerSource * 60 : 0;

  const setManualTimer = (min: number) => {
    setManualMin(min);
    setRemaining(min * 60);
    setDone(false);
    setRunning(true);
  };

  const next = () => {
    if (isLast) router.back();
    else setStep((s) => s + 1);
  };

  const onRate = (rating: 'loved' | 'meh' | null) => {
    const next = activeRating === rating ? null : rating;
    setPicked(next);
    recordFeedback(recipe.id, next);
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.lg }]}>
      {/* Override the root Stack's blanket fade with a native push, matching recipe → cook. */}
      <Stack.Screen options={{ animation: 'default' }} />
      <StatusBar style="light" />
      <View style={styles.topBar}>
        <BrandMark onDark size={16} />
        <Text style={styles.title} numberOfLines={1}>
          {recipe.name}
        </Text>
        <View style={styles.topRight}>
          <View style={styles.stepCount}>
            <Text style={styles.stepCountText} maxFontSizeMultiplier={1.3}>
              {step + 1}/{recipe.steps.length}
            </Text>
          </View>
          <PressableScale
            style={styles.close}
            onPress={() => router.back()}
            hitSlop={8}
            scaleTo={0.92}
            accessibilityLabel={strings.cook.close}
            accessibilityRole="button"
          >
            <Ionicons name="close" size={20} color={colors.onInk} />
          </PressableScale>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(4, progress * 100)}%` }]} />
      </View>

      <View style={styles.body}>
        <View style={styles.stepWrap}>
          <Text style={styles.stepLabel}>{strings.cook.step(step + 1)}</Text>
          <Text style={styles.stepText}>{stepText}</Text>
        </View>

        {timerMinutes || manualMin !== null ? (
          <View style={[styles.timerCard, done && styles.timerCardDone]}>
            <View style={styles.timerRow}>
              <Ionicons name="timer-outline" size={20} color={colors.accent} />
              <Text style={[styles.timerCaption, done && styles.timerCaptionDone]}>
                {done ? strings.cook.timeUp : running || remaining > 0 ? strings.cook.timer : strings.cook.setTimer}
              </Text>
            </View>
            <Animated.Text
              style={[styles.timerValue, done && styles.timerValueDone, { transform: [{ scale: pulse }] }]}
              adjustsFontSizeToFit
              numberOfLines={1}
            >
              {formatTime(remaining)}
            </Animated.Text>
            <View style={styles.timerActions}>
              {running ? (
                <TimerButton label={strings.cook.pause} icon="pause" onPress={() => setRunning(false)} />
              ) : (
                <TimerButton
                  label={strings.cook.start}
                  icon="play"
                  onPress={() => {
                    if (remaining <= 0) setRemaining(timerTotal);
                    setDone(false);
                    setRunning(true);
                  }}
                />
              )}
              {remaining > 0 || running || done ? (
                <TimerButton
                  label={strings.cook.reset}
                  icon="refresh"
                  onPress={() => {
                    setRunning(false);
                    setDone(false);
                    setRemaining(timerTotal);
                  }}
                />
              ) : null}
            </View>
          </View>
        ) : (
          <View style={styles.timerCard}>
            <View style={styles.timerRow}>
              <Ionicons name="timer-outline" size={20} color={colors.accent} />
              <Text style={styles.timerCaption}>{strings.cook.needTimer}</Text>
            </View>
            <View style={styles.quickChips}>
              {QUICK_TIMERS.map((min) => (
                <PressableScale
                  key={min}
                  style={styles.quickChip}
                  onPress={() => setManualTimer(min)}
                  hitSlop={4}
                  accessibilityRole="button"
                >
                  <Text style={styles.quickChipText} maxFontSizeMultiplier={1.3}>
                    {strings.cook.min(min)}
                  </Text>
                </PressableScale>
              ))}
            </View>
          </View>
        )}
      </View>

      {isLast ? (
        <View style={styles.feedback}>
          <FeedbackButton
            label={strings.cook.cooked}
            icon="checkmark-circle"
            selected={activeRating === null && isCooked}
            onPress={() => onRate(null)}
          />
          <FeedbackButton
            label={strings.cook.loved}
            icon="heart"
            selected={activeRating === 'loved'}
            onPress={() => onRate('loved')}
          />
          <FeedbackButton
            label={strings.cook.meh}
            icon="thumbs-down"
            selected={activeRating === 'meh'}
            onPress={() => onRate('meh')}
          />
        </View>
      ) : null}

      <View style={styles.footer}>
        {step > 0 ? (
          <PressableScale
            style={styles.footerBtn}
            contentStyle={styles.footerBtnInner}
            onPress={() => setStep((s) => s - 1)}
            accessibilityRole="button"
          >
            <Ionicons name="chevron-back" size={18} color={colors.onInk} />
            <Text style={styles.footerBtnText}>{strings.common.back}</Text>
          </PressableScale>
        ) : (
          <View />
        )}
        <PressableScale
          style={[styles.footerBtn, styles.nextBtn]}
          contentStyle={styles.footerBtnInner}
          onPress={next}
          accessibilityRole="button"
        >
          <Text style={[styles.footerBtnText, styles.nextBtnText]}>
            {isLast ? strings.common.done : strings.common.next}
          </Text>
          {!isLast ? <Ionicons name="chevron-forward" size={18} color={colors.onAccent} /> : null}
        </PressableScale>
      </View>
    </View>
  );
}

function TimerButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <PressableScale
      style={styles.timerBtn}
      contentStyle={styles.timerBtnInner}
      onPress={onPress}
      hitSlop={6}
      accessibilityRole="button"
    >
      <Ionicons name={icon} size={15} color={colors.accent} />
      <Text style={styles.timerBtnText}>{label}</Text>
    </PressableScale>
  );
}

function FeedbackButton({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <PressableScale
      style={[styles.feedbackBtn, selected && styles.feedbackBtnOn]}
      contentStyle={styles.feedbackBtnInner}
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Ionicons name={icon} size={15} color={selected ? colors.onAccent : colors.accent} />
      <Text style={[styles.feedbackBtnText, selected && styles.feedbackBtnTextOn]}>{label}</Text>
    </PressableScale>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.feature },
    missing: { flex: 1, backgroundColor: c.bg, alignItems: 'center', gap: space.md },
    missingText: { fontFamily: Fonts.body, ...Type.body, color: c.ink },
    link: { fontFamily: Fonts.bodySemi, ...Type.label, color: c.ink, textDecorationLine: 'underline' },

    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: space.xl,
      gap: space.md,
    },
    topRight: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    close: {
      width: 40,
      height: 40,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.featureSoft,
    },
    title: {
      flex: 1,
      fontFamily: Fonts.displaySemi,
      ...Type.section,
      color: c.onInk,
      textAlign: 'center',
    },
    stepCount: {
      minWidth: 40,
      paddingVertical: 7,
      paddingHorizontal: space.md,
      borderRadius: radius.pill,
      backgroundColor: c.featureSoft,
      alignItems: 'center',
    },
    stepCountText: { fontFamily: Fonts.bodySemi, ...Type.caption, color: c.onInk },

    progressTrack: {
      marginTop: space.xl,
      marginHorizontal: space.xl,
      height: 5,
      borderRadius: radius.pill,
      backgroundColor: c.featureSoft,
      overflow: 'hidden',
    },
    progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: c.accent },

    body: { flex: 1, paddingHorizontal: space.xl, paddingTop: space.huge },
    stepWrap: { flex: 1, justifyContent: 'center' },
    stepLabel: {
      fontFamily: Fonts.bodySemi,
      ...Type.labelSm,
      color: c.accent,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: space.lg,
    },
    stepText: {
      fontFamily: Fonts.displaySemi,
      ...Type.step,
      color: c.onInk,
    },

    timerCard: {
      backgroundColor: c.featureSoft,
      borderRadius: radius.xl,
      padding: space.xl,
      marginBottom: space.lg,
    },
    timerCardDone: { borderWidth: 1.5, borderColor: 'rgba(214,255,63,0.55)' },
    timerRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
    timerCaption: { fontFamily: Fonts.bodySemi, ...Type.labelSm, color: c.onInkSoft },
    timerCaptionDone: { color: c.accent },
    timerValue: {
      fontFamily: Fonts.bodySemi,
      fontSize: 56,
      color: c.onInk,
      marginTop: space.md,
      letterSpacing: -1,
    },
    timerValueDone: { color: c.accent },
    timerActions: { flexDirection: 'row', gap: space.md, marginTop: space.lg },
    timerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.pill,
      backgroundColor: c.feature,
      paddingVertical: 10,
      paddingHorizontal: space.lg,
    },
    timerBtnInner: { gap: 6 },
    timerBtnText: { fontFamily: Fonts.bodySemi, ...Type.labelSm, color: c.onInk },

    quickChips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.lg },
    quickChip: {
      borderRadius: radius.pill,
      backgroundColor: c.feature,
      paddingVertical: 10,
      paddingHorizontal: space.lg,
    },
    quickChipText: { fontFamily: Fonts.bodySemi, ...Type.labelSm, color: c.onInk },

    feedback: {
      flexDirection: 'row',
      gap: space.sm,
      paddingHorizontal: space.xl,
      paddingBottom: space.lg,
    },
    feedbackBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.pill,
      backgroundColor: c.featureSoft,
      paddingVertical: 13,
    },
    feedbackBtnInner: { gap: 6 },
    feedbackBtnOn: { backgroundColor: c.accent },
    feedbackBtnText: { fontFamily: Fonts.bodySemi, fontSize: 15, color: c.onInk },
    feedbackBtnTextOn: { color: c.onAccent },

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: space.xl,
    },
    footerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.pill,
      backgroundColor: c.featureSoft,
      paddingVertical: 15,
      paddingHorizontal: space.xl,
    },
    footerBtnInner: { gap: space.xs },
    footerBtnText: { fontFamily: Fonts.bodySemi, fontSize: 16, color: c.onInk },
    nextBtn: { backgroundColor: c.accent },
    nextBtnText: { color: c.onAccent },
  });
