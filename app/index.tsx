import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { useProfileStore } from '../src/store';
import { useTheme } from '../src/theme';

// Landing route. Returning users go straight to their menu; new users swipe
// through a taste-probe deck first, then the quick setup screen.
export default function Index() {
  const { colors } = useTheme();
  const hydrated = useProfileStore((s) => s.hydrated);
  const onboarded = useProfileStore((s) => s.onboarded);
  const tasteDone = useProfileStore((s) => s.tasteDone);

  // Wait for persisted state before routing so returning users don't flash setup.
  if (!hydrated) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  if (onboarded) return <Redirect href="/(tabs)/menu" />;
  if (!tasteDone) return <Redirect href="/onboarding/taste" />;
  return <Redirect href="/onboarding" />;
}
