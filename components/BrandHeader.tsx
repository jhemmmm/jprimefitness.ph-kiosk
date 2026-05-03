import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/theme';

type Size = 'lg' | 'md';

const SIZES: Record<Size, { logo: number; font: number }> = {
  lg: { logo: 80, font: 48 },
  md: { logo: 44, font: 32 },
};

export function BrandHeader({ size = 'lg' }: { size?: Size }) {
  const dims = SIZES[size];
  return (
    <View style={styles.row}>
      <Image
        source={require('@/assets/jprime-logo.png')}
        style={{ width: dims.logo, height: dims.logo }}
        resizeMode="contain"
      />
      <View style={styles.wordmark}>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[styles.word, { fontSize: dims.font, color: colors.ink }]}
        >
          JPRIME
        </Text>
        <Text style={styles.gap}> </Text>
        <Text
          adjustsFontSizeToFit
          numberOfLines={1}
          style={[styles.word, { fontSize: dims.font, color: colors.crimson }]}
        >
          FITNESS
        </Text>
      </View>
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
  wordmark: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginLeft: 12,
  },
  word: {
    fontFamily: fonts.oswaldBold,
    flexShrink: 1,
    letterSpacing: 1,
  },
  gap: {
    width: 8,
  },
});
