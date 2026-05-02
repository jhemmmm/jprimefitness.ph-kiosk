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
        <Text style={styles.title}>{title}</Text>
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 280,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    justifyContent: 'center',
    ...shadow.card,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
    transform: [{ scale: 0.98 }],
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  title: {
    ...typography.hero,
    color: colors.ink,
    ...shadow.text,
  },
  iconWrap: {
    marginLeft: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
