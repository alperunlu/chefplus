import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { ColorValue, StyleSheet, View } from 'react-native';
import { useI18n } from '../../src/i18n';
import { Fonts, Type, useTheme } from '../../src/theme';

// Active tab gets a filled icon plus a lime dot so the selected tab reads
// instantly even before the label. Outline icon = inactive, filled = active.
function TabIcon({
  focused,
  color,
  size,
  active,
  inactive,
}: {
  focused: boolean;
  color: ColorValue;
  size: number;
  active: keyof typeof Ionicons.glyphMap;
  inactive: keyof typeof Ionicons.glyphMap;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.iconWrap}>
      <Ionicons name={focused ? active : inactive} size={size} color={color} />
      <View style={[styles.dot, { backgroundColor: focused ? colors.accentCanvas : 'transparent' }]} />
    </View>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const { strings } = useI18n();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.bg },
        tabBarActiveTintColor: colors.ink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          borderTopColor: colors.divider,
          paddingTop: 6,
          shadowColor: colors.feature,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.bodyMedium,
          fontSize: Type.micro.fontSize,
        },
      }}
    >
      <Tabs.Screen
        name="menu"
        options={{
          title: strings.menu.title,
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon focused={focused} color={color} size={size} active="restaurant" inactive="restaurant-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: strings.shopping.title,
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon focused={focused} color={color} size={size} active="cart" inactive="cart-outline" />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 999,
    marginTop: 3,
  },
});
