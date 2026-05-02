import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandHeader } from '@/components/BrandHeader';
import { CountdownRing } from '@/components/CountdownRing';
import { PrimaryButton } from '@/components/PrimaryButton';
import { config } from '@/lib/config';
import { createPayment, pollPayment, PaymentIntent } from '@/lib/kiosk';
import { colors, radius, spacing, typography } from '@/theme';

export default function PayOnlineScreen() {
  const { name, phone } = useLocalSearchParams<{ name: string; phone: string }>();
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const settledRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    createPayment({ name, phone, amount: 150 })
      .then((pi) => {
        if (!cancelled) setIntent(pi);
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? 'Failed to start payment.');
      });
    return () => {
      cancelled = true;
    };
  }, [name, phone]);

  const finish = useCallback(
    (status: 'paid' | 'timeout' | 'cancelled') => {
      if (settledRef.current) return;
      settledRef.current = true;
      router.replace({
        pathname: '/result',
        params: {
          flow: 'walk_in',
          status: status === 'paid' ? 'success' : 'failed',
          name,
          phone,
          method: 'online',
          payment_status: status,
          payment_reference: intent?.reference ?? '',
          reason: status === 'timeout' ? 'timeout' : '',
        },
      });
    },
    [name, phone, intent?.reference],
  );

  useEffect(() => {
    if (!intent) return;
    let cancelled = false;
    const id = setInterval(async () => {
      if (cancelled || settledRef.current) return;
      try {
        const status = await pollPayment(intent.reference);
        if (cancelled || settledRef.current) return;
        if (status === 'paid') finish('paid');
        else if (status === 'expired') finish('timeout');
      } catch {
        // swallow transient poll errors; CountdownRing will eventually fire timeout
      }
    }, 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intent, finish]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BrandHeader size="md" />
        </View>

        <Text style={styles.title}>Scan to Pay with GCash</Text>
        <Text style={styles.subtitle}>
          Open GCash on your phone and scan the QR code below.
        </Text>

        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <View style={styles.body}>
            <View style={styles.qrCard}>
              {intent ? (
                <QRCode
                  value={intent.qr_data_url}
                  size={260}
                  backgroundColor={colors.white}
                  color={colors.ink}
                />
              ) : (
                <View style={styles.qrPlaceholder} />
              )}
              <Text style={styles.amount}>₱ 150.00</Text>
              {intent ? (
                <Text style={styles.ref}>Ref: {intent.reference}</Text>
              ) : null}
            </View>

            <View style={styles.timerWrap}>
              <CountdownRing
                durationSec={config.paymentTimeoutSec}
                onExpire={() => finish('timeout')}
                active={!!intent}
              />
              <Text style={styles.timerHint}>
                Payment expires when the timer runs out.
              </Text>
            </View>
          </View>
        )}

        <PrimaryButton
          label="Cancel"
          variant="outline"
          onPress={() => finish('cancelled')}
          style={styles.cancel}
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
  },
  header: { alignItems: 'center' },
  title: {
    ...typography.h1,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  body: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxl,
    marginTop: spacing.lg,
  },
  qrCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
  },
  qrPlaceholder: {
    width: 260,
    height: 260,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
  },
  amount: {
    ...typography.h2,
    color: colors.ink,
  },
  ref: {
    ...typography.caption,
    color: colors.textMuted,
  },
  timerWrap: {
    alignItems: 'center',
    gap: spacing.md,
  },
  timerHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 240,
  },
  error: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
  cancel: {
    alignSelf: 'center',
    marginTop: spacing.md,
    minWidth: 240,
  },
});
