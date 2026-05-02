import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckIcon } from '@/components/icons';
import { PrimaryButton } from '@/components/PrimaryButton';
import { postAttendance } from '@/lib/kiosk';
import { colors, radius, spacing, typography } from '@/theme';

export default function CounterSuccessScreen() {
  const { name, phone } = useLocalSearchParams<{
    name: string;
    phone: string;
  }>();
  const [posting, setPosting] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    postAttendance({
      type: 'walk_in',
      status: 'success',
      name,
      phone,
      payment_method: 'counter',
      payment_status: 'pending',
      payment_reference: null,
      occurred_at: new Date().toISOString(),
    })
      .then(() => {
        if (!cancelled) setPosting(false);
      })
      .catch((e) => {
        if (cancelled) return;
        setPostError(e?.message ?? 'Could not record visit.');
        setPosting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [name, phone]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>PROCEED TO THE COUNTER</Text>

        <View style={styles.badge}>
          <CheckIcon size={72} color={colors.white} />
        </View>

        <Text style={styles.message}>
          Thank you, {name || 'guest'}. Please proceed to the counter to
          complete your payment.
        </Text>

        {posting ? (
          <View style={styles.postRow}>
            <ActivityIndicator color={colors.crimson} />
            <Text style={styles.postingHint}>Recording your visit…</Text>
          </View>
        ) : postError ? (
          <Text style={styles.errorHint}>{postError}</Text>
        ) : null}

        <PrimaryButton
          label="Back to Home"
          onPress={() => router.replace('/')}
          style={styles.cta}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.ink,
    textAlign: 'center',
    fontWeight: '900',
  },
  badge: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  message: {
    ...typography.h2,
    color: colors.ink,
    textAlign: 'center',
    maxWidth: 720,
  },
  postRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  postingHint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  errorHint: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.md,
  },
  cta: {
    marginTop: spacing.xl,
    minWidth: 320,
    backgroundColor: colors.crimsonDark,
  },
});
