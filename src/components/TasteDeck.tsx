import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  PanGestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';
import { CUISINE_LABEL } from '../data/constants';
import type { Recipe } from '../domain/types';
import { useI18n } from '../i18n';
import { cuisineLabel } from '../i18n/labels';
import { Fonts, radius, shadow, space, Type, useTheme, useThemedStyles } from '../theme';
import type { Palette } from '../theme';
import { CuisineBand } from './CuisineBand';
import { PillTag } from './Chip';
import { PressableScale } from './PressableScale';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

type TasteDeckProps = {
  deck: Recipe[];
  onFinish: (likes: Recipe[], passes: Recipe[]) => void;
};

// Compact swipe-through taste deck (the optional "help me pick" path). Owns
// the card stack + drag feedback; the screen owns the header and what happens
// to the likes/passes once the deck runs out.
export function TasteDeck({ deck, onFinish }: TasteDeckProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { locale, strings } = useI18n();

  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<Recipe[]>([]);
  const [passed, setPassed] = useState<Recipe[]>([]);

  const tx = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(1)).current;

  // Drag feedback: the card tilts toward the thumb and a LIKE/PASS stamp fades
  // in past a threshold, so the gesture reads instantly without needing the hint.
  const rotate = tx.interpolate({
    inputRange: [-320, 0, 320],
    outputRange: ['-10deg', '0deg', '10deg'],
  });
  const likeOpacity = tx.interpolate({ inputRange: [0, 70], outputRange: [0, 1], extrapolate: 'clamp' });
  const passOpacity = tx.interpolate({ inputRange: [-70, 0], outputRange: [1, 0], extrapolate: 'clamp' });

  const current = deck[index];
  const progress = deck.length ? index / deck.length : 1;

  const decide = (like: boolean) => {
    const nextLiked = like ? [...liked, current] : liked;
    const nextPassed = like ? passed : [...passed, current];
    // Card exit: fly out with a subtle sink so the swipe reads as a departure,
    // then hand the deck to the next dish.
    Animated.parallel([
      Animated.timing(tx, { toValue: like ? 560 : -560, duration: 200, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(ty, { toValue: 0, duration: 200, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.timing(cardScale, { toValue: 0.92, duration: 200, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start(() => {
      tx.setValue(0);
      ty.setValue(0);
      cardScale.setValue(1);
      if (index + 1 >= deck.length) onFinish(nextLiked, nextPassed);
      else {
        setLiked(nextLiked);
        setPassed(nextPassed);
        setIndex(index + 1);
      }
    });
  };

  const snapBack = () => {
    Animated.parallel([
      Animated.spring(tx, { toValue: 0, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.spring(ty, { toValue: 0, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.spring(cardScale, { toValue: 1, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
  };

  const onGestureEvent = (e: PanGestureHandlerGestureEvent) => {
    tx.setValue(e.nativeEvent.translationX);
    ty.setValue(e.nativeEvent.translationY);
  };

  const onHandlerStateChange = (e: PanGestureHandlerStateChangeEvent) => {
    if (e.nativeEvent.state !== State.END) return;
    const x = e.nativeEvent.translationX;
    const y = e.nativeEvent.translationY;
    if (x > 110) decide(true);
    else if (x < -110 || y < -130) decide(false);
    else snapBack();
  };

  return (
    <>
      <View style={styles.progressRow}>
        <Text style={styles.progressText} maxFontSizeMultiplier={1.3}>
          {strings.deck.of(Math.min(index + 1, deck.length), deck.length)}
        </Text>
        <PressableScale
          onPress={() => onFinish([], [])}
          hitSlop={8}
          scaleTo={0.94}
          accessibilityRole="button"
          style={styles.skip}
        >
          <Text style={styles.skipText}>{strings.common.skip}</Text>
        </PressableScale>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${Math.max(4, progress * 100)}%` }]} />
      </View>

      <View style={styles.stage}>
        {current ? (
          <PanGestureHandler
            minDist={8}
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
          >
            <Animated.View
              style={[styles.card, { transform: [{ translateX: tx }, { translateY: ty }, { rotate }, { scale: cardScale }] }]}
            >
              <Animated.View style={[styles.decision, styles.decisionLike, { opacity: likeOpacity }]}>
                <Ionicons name="heart" size={20} color={colors.onAccent} />
                <Text style={[styles.decisionText, styles.decisionLikeText]} maxFontSizeMultiplier={1.3}>
                  {strings.deck.like.toUpperCase()}
                </Text>
              </Animated.View>
              <Animated.View style={[styles.decision, styles.decisionPass, { opacity: passOpacity }]}>
                <Ionicons name="close" size={20} color={colors.danger} />
                <Text style={[styles.decisionText, styles.decisionPassText]} maxFontSizeMultiplier={1.3}>
                  {strings.deck.pass.toUpperCase()}
                </Text>
              </Animated.View>
              <TasteCard recipe={current} />
            </Animated.View>
          </PanGestureHandler>
        ) : (
          <View style={styles.done}>
            <Text style={styles.doneText}>{strings.deck.finish}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <PressableScale
          style={[styles.roundAction, styles.passBtn]}
          onPress={() => decide(false)}
          hitSlop={8}
          scaleTo={0.92}
          accessibilityRole="button"
          accessibilityLabel={strings.deck.pass}
        >
          <Ionicons name="close" size={26} color={colors.muted} />
        </PressableScale>
        <PressableScale
          style={[styles.roundAction, styles.likeBtn]}
          onPress={() => decide(true)}
          hitSlop={8}
          scaleTo={0.92}
          accessibilityRole="button"
          accessibilityLabel={strings.deck.like}
        >
          <Ionicons name="heart" size={24} color={colors.accent} />
        </PressableScale>
      </View>
    </>
  );
}

function TasteCard({ recipe }: { recipe: Recipe }) {
  const styles = useThemedStyles(makeStyles);
  const { locale, strings } = useI18n();
  return (
    <View style={styles.cardInner}>
      <CuisineBand cuisine={recipe.cuisine} height={92} style={{ borderRadius: radius.lg }}>
        <View style={styles.bandRow}>
          <Text style={styles.bandName}>{cuisineLabel(locale, recipe.cuisine, CUISINE_LABEL[recipe.cuisine])}</Text>
          <Text style={styles.bandKcal} maxFontSizeMultiplier={1.3}>
            {recipe.kcalPerServing} kcal
          </Text>
        </View>
      </CuisineBand>
      <Text style={styles.cardName}>{recipe.name}</Text>
      <View style={styles.cardMeta}>
        <PillTag label={cuisineLabel(locale, recipe.cuisine, CUISINE_LABEL[recipe.cuisine])} tone="ink" />
        <Text style={styles.cardSteps} maxFontSizeMultiplier={1.3}>
          {strings.deck.steps(recipe.steps.length)}
        </Text>
      </View>
      <Text style={styles.cardDesc} numberOfLines={5}>
        {recipe.description}
      </Text>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: space.xxl,
    },
    progressText: { fontFamily: Fonts.bodySemi, ...Type.caption, color: c.inkSoft },
    skip: { paddingVertical: space.sm, paddingHorizontal: space.md, borderRadius: radius.pill },
    skipText: { fontFamily: Fonts.bodySemi, ...Type.labelSm, color: c.muted },
    progressTrack: {
      height: 5,
      borderRadius: radius.pill,
      backgroundColor: c.surface,
      marginTop: space.sm,
      overflow: 'hidden',
    },
    progressFill: { height: '100%', borderRadius: radius.pill, backgroundColor: c.accent },

    stage: { flex: 1, justifyContent: 'center', paddingTop: space.md },
    card: {
      height: 300,
      borderRadius: radius.xl,
      backgroundColor: c.surface,
      padding: space.xxl,
      ...shadow.raised,
    },
    decision: {
      position: 'absolute',
      top: space.lg,
      zIndex: 2,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      borderWidth: 2.5,
      borderRadius: radius.pill,
      paddingVertical: 6,
      paddingHorizontal: space.md,
    },
    decisionLike: { left: space.lg, borderColor: c.accent, backgroundColor: 'rgba(214,255,63,0.12)' },
    decisionPass: { right: space.lg, borderColor: c.danger, backgroundColor: 'rgba(255,255,255,0.72)' },
    decisionText: { fontFamily: Fonts.displayBold, fontSize: 15, letterSpacing: 1 },
    decisionLikeText: { color: c.onAccent },
    decisionPassText: { color: c.danger },
    cardInner: { flex: 1 },
    bandRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: space.lg,
      paddingTop: space.lg,
    },
    bandName: { fontFamily: Fonts.displaySemi, ...Type.label, color: c.onInk, letterSpacing: 0.2 },
    bandKcal: { fontFamily: Fonts.bodyMedium, ...Type.caption, color: c.onInk },
    cardName: {
      fontFamily: Fonts.displayBold,
      ...Type.dish,
      color: c.ink,
      marginTop: space.lg,
    },
    cardMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.sm,
      marginTop: space.md,
      flexWrap: 'wrap',
    },
    cardDesc: {
      fontFamily: Fonts.body,
      ...Type.body,
      color: c.inkSoft,
      marginTop: space.lg,
      flex: 1,
    },
    cardSteps: { fontFamily: Fonts.bodyMedium, ...Type.labelSm, color: c.muted },

    done: { alignItems: 'center' },
    doneText: { fontFamily: Fonts.body, ...Type.body, color: c.muted, textAlign: 'center' },

    actions: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: space.xl,
      paddingTop: space.xl,
      paddingBottom: space.lg,
    },
    roundAction: {
      width: 60,
      height: 60,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow.card,
    },
    passBtn: { backgroundColor: c.surface },
    likeBtn: { backgroundColor: c.feature },
  });
