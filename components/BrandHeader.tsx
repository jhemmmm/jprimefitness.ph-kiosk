import { StyleSheet, Text, View } from 'react-native';
import { colors, shadow, typography } from '@/theme';

type Size = 'lg' | 'md';

export function BrandHeader({ size = 'lg' }: { size?: Size }) {
  const fontSize = size === 'lg' ? typography.brand.fontSize : 36;
  const letterSpacing = size === 'lg' ? -2 : -1;
  return (
    <View style={styles.row}>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
        style={[styles.word, { fontSize, letterSpacing, color: colors.ink }]}
      >
        JPRIME
      </Text>
      <Text style={styles.gap}> </Text>
      <Text
        adjustsFontSizeToFit
        numberOfLines={1}
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
    flexShrink: 1,
  },
  word: {
    ...shadow.text,
    fontWeight: '900',
    flexShrink: 1,
  },
  gap: {
    width: 8,
  },
});
