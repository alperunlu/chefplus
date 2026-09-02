import { StyleSheet, Text } from 'react-native';
import { Fonts, useTheme } from '../theme';

type BrandMarkProps = {
  /** Font size — small masthead by default. */
  size?: number;
  /** On the dark feature surface (cook, poster). */
  onDark?: boolean;
};

// Small "chef+" wordmark used as a persistent masthead across every screen.
export function BrandMark({ size = 18, onDark }: BrandMarkProps) {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        styles.mark,
        { fontSize: size, lineHeight: size + 4, color: onDark ? colors.onInk : colors.ink },
      ]}
    >
      chef<Text style={{ color: colors.accentCanvas }}>+</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  mark: {
    fontFamily: Fonts.displayBold,
    letterSpacing: -0.3,
  },
});
