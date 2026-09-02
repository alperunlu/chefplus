import { ViewStyle } from 'react-native';
import { layout } from '../theme';

// One shared content container: on web, everything is capped to a comfortable
// reading column and centered so heroes and cards never stretch edge-to-edge.
// Spread into ScrollView contentContainerStyle / screen roots.
export const pageContainer: ViewStyle = {
  width: '100%',
  maxWidth: layout.contentMaxWidth,
  alignSelf: 'center',
};
