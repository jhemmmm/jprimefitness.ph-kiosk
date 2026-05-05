import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckIcon, CrossIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/PrimaryButton";
import { AttendancePayload, AttendanceResponse, postAttendance } from "@/lib/kiosk";
import { config } from "@/lib/config";
import { useAutoRedirectHome, useOnce } from "@/lib/hooks";
import { colors, radius, spacing, typography } from "@/theme";

type Status = "success" | "failed";
type Phase = "pending" | "success" | "failed";
type Flow = "walk_in" | "member";
type MemberAction = "time_in" | "time_out";
type PaymentStatusParam = "pending" | "paid" | "timeout" | "cancelled";

type Params = {
  flow: Flow;
  status?: Status;
  // walk_in
  name?: string;
  phone?: string;
  method?: "counter" | "online";
  payment_status?: PaymentStatusParam;
  payment_reference?: string;
  // member
  action?: MemberAction;
  qr_payload?: string;
  // walk_in only
  reason?: string;
  discount_type?: string;
};

export default function ResultScreen() {
  const params = useLocalSearchParams<Params>();
  const flow: Flow = params.flow === "member" ? "member" : "walk_in";

  const [posting, setPosting] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);
  const [response, setResponse] = useState<AttendanceResponse | null>(null);

  useOnce(() => {
    let cancelled = false;
    postAttendance(buildPayload(params, flow))
      .then((r) => {
        if (!cancelled) {
          setResponse(r);
          setPosting(false);
        }
      })
      .catch((e: { message?: string }) => {
        if (cancelled) return;
        setPostError(e?.message ?? "Could not record visit.");
        setPosting(false);
      });
    return () => {
      cancelled = true;
    };
  });

  const remaining = useAutoRedirectHome(!posting, config.resultDisplaySec);

  const phase = derivePhase({ flow, posting, response, params });
  const headline = HEADLINES[phase];
  const subline = buildSubline({ flow, phase, params, response });

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Text style={styles.title}>{headline}</Text>

        <Badge phase={phase} />

        <Text style={styles.welcome}>{subline.primary}</Text>
        {subline.secondary ? <Text style={styles.tagline}>{subline.secondary}</Text> : null}

        {posting ? (
          <View style={styles.postRow}>
            <ActivityIndicator color={colors.crimson} />
            <Text style={styles.postingHint}>Recording your visit…</Text>
          </View>
        ) : postError ? (
          <Text style={styles.errorHint}>{postError}</Text>
        ) : null}

        <PrimaryButton label={posting ? "Back to Home" : `Back to Home (${remaining})`} onPress={() => router.replace("/")} style={styles.cta} />
      </View>
    </SafeAreaView>
  );
}

const HEADLINES: Record<Phase, string> = {
  pending: "VERIFYING…",
  success: "ACCESS GRANTED",
  failed: "ACCESS DENIED",
};

function Badge({ phase }: { phase: Phase }) {
  if (phase === "pending") {
    return (
      <View style={[styles.badge, { backgroundColor: colors.surfaceMuted }]}>
        <ActivityIndicator color={colors.crimson} size="large" />
      </View>
    );
  }
  const isSuccess = phase === "success";
  return <View style={[styles.badge, { backgroundColor: isSuccess ? colors.success : colors.danger }]}>{isSuccess ? <CheckIcon size={56} color={colors.white} /> : <CrossIcon size={56} color={colors.white} />}</View>;
}

function derivePhase(args: { flow: Flow; posting: boolean; response: AttendanceResponse | null; params: Params }): Phase {
  const { flow, posting, response, params } = args;
  if (flow === "member") {
    if (posting) return "pending";
    return response?.ok ? "success" : "failed";
  }
  return params.status === "success" ? "success" : "failed";
}

function buildPayload(p: Params, flow: Flow): AttendancePayload {
  if (flow === "member") {
    return {
      type: "member",
      action: p.action ?? "time_in",
      qr_payload: p.qr_payload ?? "",
    };
  }
  const discount = p.discount_type === "student" || p.discount_type === "senior" ? p.discount_type : null;
  return {
    type: "walk_in",
    status: p.status === "success" ? "success" : "failed",
    name: p.name ?? "",
    phone: p.phone ?? "",
    payment_method: p.method ?? "online",
    payment_status: p.payment_status ?? "paid",
    payment_reference: p.payment_reference || null,
    discount_type: discount,
  };
}

function buildSubline(args: { flow: Flow; phase: Phase; params: Params; response: AttendanceResponse | null }): { primary: string; secondary?: string } {
  const { flow, phase, params, response } = args;
  if (flow === "member") {
    if (phase === "pending") return { primary: "Verifying QR code…" };
    if (phase === "success") {
      const verb = params.action === "time_out" ? "Goodbye" : "Welcome back";
      const who = response?.member_name ?? "member";
      return {
        primary: `${verb}, ${who}`,
        secondary: params.action === "time_out" ? "See you next session." : "Stay strong and keep pushing your limits.",
      };
    }
    return {
      primary: response?.message ?? "QR code not recognized",
      secondary: "Please ask the front desk for assistance.",
    };
  }
  if (phase === "success") {
    return {
      primary: `Welcome, ${params.name ?? "guest"}`,
      secondary: "Enjoy your workout — your visit has been recorded.",
    };
  }
  if (params.reason === "timeout") {
    return {
      primary: "Payment timed out",
      secondary: "Please try again or pay over the counter.",
    };
  }
  return {
    primary: "Payment was cancelled",
    secondary: "No charge has been made. You can try again any time.",
  };
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.h1,
    color: colors.ink,
    textAlign: "center",
    fontWeight: "900",
    fontSize: 32,
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.lg,
  },
  welcome: {
    ...typography.h2,
    color: colors.ink,
    textAlign: "center",
  },
  tagline: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  postRow: {
    flexDirection: "row",
    alignItems: "center",
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
    marginTop: spacing.lg,
    minWidth: 240,
    backgroundColor: colors.crimsonDark,
  },
});
