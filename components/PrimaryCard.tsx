import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '@/theme';

type Props = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onPress: () => void;
  testID?: string;
};

export function PrimaryCard({ title, subtitle, icon, onPress, testID }: Props) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.titleRow}>
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
        <Text
          style={styles.title}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {title}
        </Text>
      </View>
      {subtitle ? (
        <Text style={styles.subtitle} numberOfLines={2}>
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 110,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadow.card,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
    transform: [{ scale: 0.98 }],
  },
  titleRow: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    width: '100%',
  },
  title: {
    ...typography.h2,
    color: colors.ink,
    textAlign: 'center',
    flexShrink: 1,
    ...shadow.text,
  },
  iconWrap: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});
