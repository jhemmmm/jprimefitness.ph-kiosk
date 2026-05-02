import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckIcon, CrossIcon } from '@/components/icons';
import { PrimaryButton } from '@/components/PrimaryButton';
import {
  AttendancePayload,
  AttendanceResponse,
  postAttendance,
} from '@/lib/kiosk';
import { colors, radius, spacing, typography } from '@/theme';

type Status = 'success' | 'failed';
type Flow = 'walk_in' | 'member';
type MemberAction = 'time_in' | 'time_out';
type PaymentStatusParam = 'pending' | 'paid' | 'timeout' | 'cancelled';

type Params = {
  flow: Flow;
  status: Status;
  // walk_in
  name?: string;
  phone?: string;
  method?: 'counter' | 'online';
  payment_status?: PaymentStatusParam;
  payment_reference?: string;
  // member
  action?: MemberAction;
  qr_payload?: string;
  // either
  reason?: string;
};

export default function ResultScreen() {
  const params = useLocalSearchParams<Params>();
  const status: Status = params.status === 'success' ? 'success' : 'failed';
  const flow: Flow = params.flow === 'member' ? 'member' : 'walk_in';

  const [posting, setPosting] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);
  const [response, setResponse] = useState<AttendanceResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const payload = buildPayload(params, flow, status);
    postAttendance(payload)
      .then((r) => {
        if (!cancelled) {
          setResponse(r);
          setPosting(false);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setPostError(e?.message ?? 'Could not record visit.');
        setPosting(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params, flow, status]);

  const isSuccess = status === 'success';

  const headline = isSuccess ? 'ACCESS GRANTED' : 'ACCESS DENIED';
  const memberName = response?.member_name;
  const subline = buildSubline({ flow, status, params, memberName });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <Text style={styles.title}>{headline}</Text>

        <View
          style={[
            styles.badge,
            { backgroundColor: isSuccess ? colors.success : colors.danger },
          ]}
        >
          {isSuccess ? (
            <CheckIcon size={72} color={colors.white} />
          ) : (
            <CrossIcon size={72} color={colors.white} />
          )}
        </View>

        <Text style={styles.welcome}>{subline.primary}</Text>
        {subline.secondary ? (
          <Text style={styles.tagline}>{subline.secondary}</Text>
        ) : null}

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

function buildPayload(
  p: Params,
  flow: Flow,
  status: Status,
): AttendancePayload {
  const occurred_at = new Date().toISOString();
  if (flow === 'member') {
    const reason = p.reason === 'unknown_qr' ? 'unknown_qr' : null;
    return {
      type: 'member',
      status,
      action: (p.action as MemberAction) ?? 'time_in',
      qr_payload: p.qr_payload ?? '',
      reason,
      occurred_at,
    };
  }
  return {
    type: 'walk_in',
    status,
    name: p.name ?? '',
    phone: p.phone ?? '',
    payment_method: p.method ?? 'online',
    payment_status: p.payment_status ?? 'paid',
    payment_reference: p.payment_reference ? p.payment_reference : null,
    occurred_at,
  };
}

function buildSubline(args: {
  flow: Flow;
  status: Status;
  params: Params;
  memberName?: string;
}): { primary: string; secondary?: string } {
  const { flow, status, params, memberName } = args;
  if (flow === 'member') {
    if (status === 'success') {
      const verb = params.action === 'time_out' ? 'Goodbye' : 'Welcome back';
      const who = memberName ?? 'member';
      return {
        primary: `${verb}, ${who}`,
        secondary:
          params.action === 'time_out'
            ? 'See you next session.'
            : 'Stay strong and keep pushing your limits.',
      };
    }
    return {
      primary: 'QR code not recognized',
      secondary: 'Please ask the front desk for assistance.',
    };
  }
  // walk_in
  if (status === 'success') {
    return {
      primary: `Welcome, ${params.name ?? 'guest'}`,
      secondary: 'Enjoy your workout — your visit has been recorded.',
    };
  }
  if (params.reason === 'timeout') {
    return {
      primary: 'Payment timed out',
      secondary: 'Please try again or pay over the counter.',
    };
  }
  return {
    primary: 'Payment was cancelled',
    secondary: 'No charge has been made. You can try again any time.',
  };
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
    fontSize: 44,
  },
  badge: {
    width: 120,
    height: 120,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  welcome: {
    ...typography.h2,
    color: colors.ink,
    textAlign: 'center',
  },
  tagline: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
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
