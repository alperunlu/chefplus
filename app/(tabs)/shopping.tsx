import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { buildShoppingList, groupByAisle } from '../../src/domain/shopping';
import type { ShoppingItem } from '../../src/domain/types';
import { useI18n } from '../../src/i18n';
import { formatQtyLocal } from '../../src/i18n/format';
import { localRangeLabel } from '../../src/i18n/dates';
import { ingredientLabel } from '../../src/i18n/ingredients';
import { aisleLabel } from '../../src/i18n/labels';
import { usePlanStore, useProfileStore, useShoppingStore } from '../../src/store';
import { copyText } from '../../src/lib/clipboard';
import { BrandMark, BuildOverlay, EmptyState, PressableScale, pageContainer } from '../../src/components';
import { Fonts, radius, shadow, space, Type, useTheme, useThemedStyles } from '../../src/theme';
import type { Palette } from '../../src/theme';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

export default function ShoppingScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { locale, strings } = useI18n();
  const profile = useProfileStore((s) => s.profile);
  const week = usePlanStore((s) => s.week);
  const generate = usePlanStore((s) => s.generate);
  const checked = useShoppingStore((s) => s.checked);
  const toggle = useShoppingStore((s) => s.toggle);

  const items = useMemo(
    () => (week ? buildShoppingList(week, profile) : []),
    [week, profile],
  );
  const groups = useMemo(() => groupByAisle(items), [items]);
  const localizedRange = week ? localRangeLabel(locale, week.startISO) : '';

  const [building, setBuilding] = useState(false);
  const [copying, setCopying] = useState(false);
  const onBuild = () => {
    if (building) return;
    setBuilding(true);
    setTimeout(() => {
      generate(profile);
      setBuilding(false);
    }, 950);
  };

  if (!week || items.length === 0) {
    return (
      <View style={styles.root}>
        <View style={{ flex: 1, paddingTop: insets.top + space.huge }}>
          <EmptyState
            title={strings.shopping.emptyTitle}
            message={strings.shopping.emptyMessage}
            actionLabel={strings.shopping.buildWeek}
            icon="cart-outline"
            onAction={onBuild}
          />
        </View>
        <BuildOverlay visible={building} />
      </View>
    );
  }

  const done = items.filter((i) => checked[i.key]).length;

  const listText = () =>
    groups
      .map((g) => {
        const header = aisleLabel(locale, g.aisle);
        const body = g.items.map((i) => `• ${ingredientLabel(locale, i.key, i.label)} — ${formatQtyLocal(locale, i.qty, i.unit)}`).join('\n');
        return `${header}\n${body}`;
      })
      .join('\n\n');

  const onShare = () => {
    Share.share({ message: `${strings.share.message(localizedRange)} \n\n${listText()}` });
  };

  const onCopy = async () => {
    if (copying) return;
    const ok = await copyText(`${strings.share.message(localizedRange)} \n\n${listText()}`);
    setCopying(ok);
    if (ok) setTimeout(() => setCopying(false), 1600);
  };

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
            <Text style={styles.title}>{strings.shopping.title}</Text>
            <Text style={styles.range}>{localizedRange}</Text>
          </View>
          <View style={styles.headerActions}>
            <PressableScale
              style={styles.shareBtn}
              onPress={onCopy}
              accessibilityRole="button"
              accessibilityLabel={strings.shopping.copy}
            >
              <Ionicons name={copying ? 'checkmark' : 'copy-outline'} size={18} color={colors.ink} />
            </PressableScale>
            <PressableScale
              style={styles.shareBtn}
              onPress={onShare}
              accessibilityRole="button"
              accessibilityLabel={strings.shopping.share}
            >
              <Ionicons name="share-outline" size={18} color={colors.ink} />
            </PressableScale>
          </View>
        </View>
        <View style={styles.progressCard}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(done / items.length) * 100}%` }]} />
          </View>
          <Text style={styles.progressText} maxFontSizeMultiplier={1.3}>
            {strings.shopping.picked(done, items.length)}
          </Text>
        </View>
      </View>

      {groups.map((g) => (
        <View key={g.aisle} style={styles.sectionCard}>
          <View style={styles.aisleHead}>
            <Text style={styles.aisleTitle}>{aisleLabel(locale, g.aisle)}</Text>
            <Text style={styles.aisleCount} maxFontSizeMultiplier={1.3}>
              {strings.shopping.items(g.items.length)}
            </Text>
          </View>
          {g.items.map((item, i) => (
            <ItemRow
              key={`${item.key}|${item.unit}`}
              item={item}
              checked={!!checked[item.key]}
              onToggle={() => toggle(item.key)}
              last={i === g.items.length - 1}
            />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

function ItemRow({
  item,
  checked,
  onToggle,
  last,
}: {
  item: ShoppingItem;
  checked: boolean;
  onToggle: () => void;
  last?: boolean;
}) {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { locale } = useI18n();
  const checkScale = useRef(new Animated.Value(1)).current;
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      // Skip the pop on first render — only animate on actual toggles.
      isMounted.current = true;
      return;
    }
    Animated.sequence([
      Animated.spring(checkScale, { toValue: 1.15, speed: 20, bounciness: 10, useNativeDriver: USE_NATIVE_DRIVER }),
      Animated.spring(checkScale, { toValue: 1, speed: 20, bounciness: 10, useNativeDriver: USE_NATIVE_DRIVER }),
    ]).start();
  }, [checked, checkScale]);

  const name = ingredientLabel(locale, item.key, item.label);
  return (
    <Pressable
      style={[styles.item, !last && styles.itemDivider]}
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={`${name}, ${formatQtyLocal(locale, item.qty, item.unit)}`}
    >
      <Animated.View style={[styles.check, checked && styles.checkOn, { transform: [{ scale: checkScale }] }]}>
        {checked ? <Ionicons name="checkmark" size={14} color={colors.onAccent} /> : null}
      </Animated.View>
      <View style={styles.itemBody}>
        <Text style={[styles.itemName, checked && styles.itemNameDone]}>{name}</Text>
        {item.sources.length ? (
          <Text style={styles.itemSources} numberOfLines={1}>
            {item.sources.slice(0, 2).join(' · ')}
            {item.sources.length > 2 ? ` +${item.sources.length - 2}` : ''}
          </Text>
        ) : null}
      </View>
      <Text style={styles.itemQty} maxFontSizeMultiplier={1.3}>
        {formatQtyLocal(locale, item.qty, item.unit)}
      </Text>
      {item.staple ? <Ionicons name="home-outline" size={15} color={colors.muted} style={{ marginLeft: 6 }} /> : null}
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg },
    header: { paddingHorizontal: space.xl, paddingBottom: space.xs },
    headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    title: {
      fontFamily: Fonts.displayBold,
      ...Type.screen,
      color: c.ink,
    },
    range: { fontFamily: Fonts.bodyMedium, ...Type.labelSm, color: c.muted, marginTop: 4 },
    headerActions: { flexDirection: 'row', gap: space.sm, marginTop: 6 },
    shareBtn: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      backgroundColor: c.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadow.card,
    },
    progressCard: {
      marginTop: space.lg,
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      padding: space.lg,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.md,
      ...shadow.card,
    },
    progressBar: {
      flex: 1,
      height: 8,
      borderRadius: radius.pill,
      backgroundColor: c.surfaceSoft,
      overflow: 'hidden',
    },
    progressFill: { height: '100%', backgroundColor: c.accent, borderRadius: radius.pill },
    progressText: { fontFamily: Fonts.bodyMedium, ...Type.caption, color: c.muted },

    sectionCard: {
      marginTop: space.lg,
      marginHorizontal: space.xl,
      backgroundColor: c.surface,
      borderRadius: radius.lg,
      paddingHorizontal: space.lg,
      paddingBottom: space.xs,
      ...shadow.card,
    },
    aisleHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      paddingTop: space.lg,
      paddingBottom: space.xs,
    },
    aisleTitle: { fontFamily: Fonts.displaySemi, ...Type.section, color: c.ink },
    aisleCount: { fontFamily: Fonts.bodyMedium, ...Type.micro, color: c.muted },
    item: { flexDirection: 'row', alignItems: 'center', paddingVertical: space.md },
    itemDivider: { borderBottomWidth: 1, borderBottomColor: c.divider },
    check: {
      width: 24,
      height: 24,
      borderRadius: radius.pill,
      borderWidth: 1.5,
      borderColor: c.border,
      marginRight: space.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surface,
    },
    checkOn: { backgroundColor: c.accent, borderColor: c.accent },
    itemBody: { flex: 1 },
    itemName: { fontFamily: Fonts.bodyMedium, ...Type.body, color: c.ink },
    itemNameDone: { color: c.muted, textDecorationLine: 'line-through' },
    itemSources: { fontFamily: Fonts.body, ...Type.micro, color: c.muted, marginTop: 1 },
    itemQty: { fontFamily: Fonts.bodyMedium, ...Type.labelSm, color: c.muted },
  });
