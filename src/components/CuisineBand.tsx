import { ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import type { Cuisine } from '../domain/types';
import { cuisineTone, radius } from '../theme';

type CuisineBandProps = {
  cuisine: Cuisine;
  /** Fixed band height. */
  height: number;
  /** Extra layout (e.g. borderRadius). */
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
};

// Deterministic, dependency-free "gradient": a deep cuisine tone with two soft
// translucent blobs. Gives every dish a color-led identity without photography.
export function CuisineBand({ cuisine, height, style, children }: CuisineBandProps) {
  return (
    <View style={[styles.band, { height, backgroundColor: cuisineTone[cuisine].deep }, style]}>
      <View style={[styles.blob, styles.blobHi, { top: -70, right: -44, width: 190, height: 190 }]} />
      <View style={[styles.blob, styles.blobLo, { bottom: -80, left: -36, width: 210, height: 210 }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    overflow: 'hidden',
    borderRadius: radius.lg,
  },
  blob: {
    position: 'absolute',
    borderRadius: radius.pill,
  },
  blobHi: { backgroundColor: 'rgba(255,255,255,0.14)' },
  blobLo: { backgroundColor: 'rgba(0,0,0,0.12)' },
  content: { flex: 1, justifyContent: 'space-between' },
});
