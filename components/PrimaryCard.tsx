import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '@/theme';

type Tone = 'default' | 'danger';

type Props = {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onPress: () => void;
  testID?: string;
  tone?: Tone;
  disabled?: boolean;
};

export function PrimaryCard({
  title,
  subtitle,
  icon,
  onPress,
  testID,
  tone = 'default',
  disabled = false,
}: Props) {
  const isDanger = tone === 'danger';
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        isDanger && styles.cardDanger,
        !disabled && pressed && styles.pressed,
        !disabled && pressed && isDanger && styles.pressedDanger,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.titleRow}>
        {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
        <Text
          style={[styles.title, isDanger && styles.titleDanger]}
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {title}
        </Text>
      </View>
      {subtitle ? (
        <Text
          style={[styles.subtitle, isDanger && styles.subtitleDanger]}
          numberOfLines={2}
        >
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
  cardDanger: {
    backgroundColor: colors.crimson,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
    transform: [{ scale: 0.98 }],
  },
  pressedDanger: {
    backgroundColor: colors.crimsonDark,
  },
  disabled: {
    opacity: 0.45,
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
  titleDanger: {
    color: colors.white,
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
  subtitleDanger: {
    color: colors.white,
    opacity: 0.92,
  },
});
