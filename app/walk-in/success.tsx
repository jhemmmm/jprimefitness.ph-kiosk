import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CheckIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/PrimaryButton";
import { createPayment, postAttendance } from "@/lib/kiosk";
import { config } from "@/lib/config";
import { useAutoRedirectHome, useOnce } from "@/lib/hooks";
import { colors, radius, spacing, typography } from "@/theme";

function formatAmount(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function CounterSuccessScreen() {
  const { name, phone, discount_type } = useLocalSearchParams<{
    name: string;
    phone: string;
    discount_type?: string;
  }>();
  const discount = discount_type === "student" || discount_type === "senior" ? discount_type : null;
  const [posting, setPosting] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [amountDue, setAmountDue] = useState<number | null>(null);

  useOnce(() => {
    let cancelled = false;

    createPayment({ name, phone, method: "cash", discount_type: discount })
      .then((pi) => {
        if (cancelled) return null;
        setReference(pi.reference);
        setAmountDue(pi.amount);
        return pi.reference;
      })
      .catch(() => null)
      .then((ref) =>
        postAttendance({
          type: "walk_in",
          status: "success",
          name,
          phone,
          payment_method: "counter",
          payment_status: "pending",
          payment_reference: ref ?? null,
          discount_type: discount,
        }),
      )
      .then(() => {
        if (!cancelled) setPosting(false);
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

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <Text style={styles.title}>PROCEED TO THE COUNTER</Text>

        <View style={styles.badge}>
          <CheckIcon size={56} color={colors.white} />
        </View>

        <Text style={styles.message}>Thank you, {name || "guest"}. Please proceed to the counter to complete your payment.</Text>

        {amountDue !== null ? (
          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Amount due</Text>
            <Text style={styles.amountValue}>{formatAmount(amountDue)}</Text>
            {discount ? <Text style={styles.amountBadge}>{discount === "student" ? "Student" : "Senior"} −20% applied</Text> : null}
            {reference ? <Text style={styles.refValue}>Ref: {reference}</Text> : null}
          </View>
        ) : null}

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
  },
  badge: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: spacing.lg,
  },
  message: {
    ...typography.h2,
    color: colors.ink,
    textAlign: "center",
    maxWidth: 720,
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
  amountBox: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    gap: 4,
  },
  amountLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  amountValue: {
    ...typography.h1,
    color: colors.ink,
  },
  amountBadge: {
    ...typography.caption,
    color: colors.crimson,
    fontWeight: "700",
  },
  refValue: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  cta: {
    marginTop: spacing.lg,
    minWidth: 240,
    backgroundColor: colors.crimsonDark,
  },
});
