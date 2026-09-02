import { Fraunces_400Regular_Italic, Fraunces_500Medium, Fraunces_500Medium_Italic, Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Fonts, space, useTheme, useThemedStyles } from '../src/theme';
import { useI18n } from '../src/i18n';
import type { Palette } from '../src/theme';

// Keep the native splash screen up until custom fonts are fully loaded. On
// release builds, `useFonts()` can resolve a beat before the fonts are truly
// attached to the native text renderer — without this, the very first paint
// of a screen can render a Text node in a custom font with no visible glyphs
// (the container/background still shows, only the text is blank). This never
// reproduces on web or in dev, where startup timing masks the race.
SplashScreen.preventAutoHideAsync();

// Catches render-time crashes anywhere in the app instead of a white screen.
// expo-router picks this up automatically when exported from the root layout.
export function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  const styles = useThemedStyles(makeStyles);
  const { strings } = useI18n();
  return (
    <View style={[styles.root]}>
      <Text style={styles.title}>{strings.error.title}</Text>
      <Text style={styles.message}>{error.message}</Text>
      <Pressable style={styles.button} onPress={retry}>
        <Text style={styles.buttonText}>{strings.error.retry}</Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  const { colors, isDark } = useTheme();
  const [fontsLoaded] = useFonts({
    // Headings / brand / italic accents (Fraunces warm serif)
    Fraunces_700Bold,
    Fraunces_600SemiBold,
    Fraunces_500Medium,
    Fraunces_500Medium_Italic,
    Fraunces_400Regular_Italic,
    // Body / labels (Inter neutral sans)
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hide();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    // Native splash screen is still covering the app at this point — render
    // nothing rather than a JS placeholder to avoid a flash between the two.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
            animation: 'fade',
          }}
        />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center', padding: space.xl, gap: space.md },
    title: { fontFamily: Fonts.displaySemi, fontSize: 22, color: c.ink, textAlign: 'center' },
    message: { fontFamily: Fonts.body, fontSize: 14, color: c.muted, textAlign: 'center' },
    button: { borderRadius: 999, backgroundColor: c.accent, paddingVertical: 14, paddingHorizontal: space.xxl, marginTop: space.sm },
    buttonText: { fontFamily: Fonts.bodySemi, fontSize: 15, color: c.onAccent },
  });
