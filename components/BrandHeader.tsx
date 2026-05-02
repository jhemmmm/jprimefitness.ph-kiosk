import { StyleSheet, Text, View } from 'react-native';
import { colors, shadow, typography } from '@/theme';

type Size = 'lg' | 'md';

export function BrandHeader({ size = 'lg' }: { size?: Size }) {
  const fontSize = size === 'lg' ? typography.brand.fontSize : 56;
  const letterSpacing = size === 'lg' ? -2 : -1;
  return (
    <View style={styles.row}>
      <Text
        style={[styles.word, { fontSize, letterSpacing, color: colors.ink }]}
      >
        JPRIME
      </Text>
      <Text style={styles.gap}> </Text>
      <Text
        style={[styles.word, { fontSize, letterSpacing, color: colors.crimson }]}
      >
        FITNESS
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  word: {
    ...shadow.text,
    fontWeight: '900',
  },
  gap: {
    width: 12,
  },
});
