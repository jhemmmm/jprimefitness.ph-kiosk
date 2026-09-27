import { router, useLocalSearchParams } from "expo-router";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandHeader } from "@/components/BrandHeader";
import { CountdownRing } from "@/components/CountdownRing";
import { PrimaryButton } from "@/components/PrimaryButton";
import { config } from "@/lib/config";
import { useOnce } from "@/lib/hooks";
import { useKioskSession } from "@/lib/session";
import { createPayment, parseDiscount, pollPayment, PaymentIntent } from "@/lib/kiosk";
import { colors, radius, shadow, spacing, typography } from "@/theme";

type FinishStatus = "paid" | "timeout" | "cancelled";

function formatAmount(amount: number): string {
  return `₱ ${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function PageFrame({ children, onCancel }: { children: ReactNode; onCancel: () => void }) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BrandHeader size="md" />
        </View>
        {children}
        <PrimaryButton label="Cancel" variant="outline" onPress={onCancel} style={styles.cancel} />
      </View>
    </SafeAreaView>
  );
}

export default function PayOnlineScreen() {
  const { name, phone, discount_type } = useLocalSearchParams<{ name: string; phone: string; discount_type?: string }>();
  const discount = parseDiscount(discount_type);
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageReady, setImageReady] = useState(false);
  const settledRef = useRef(false);
  const { holdIdle } = useKioskSession();

  // The payer is on their phone, not touching the kiosk: the CountdownRing is this screen's
  // deadline, so the global idle timer must not send the kiosk home mid-payment.
  useEffect(holdIdle, [holdIdle]);

  useOnce(() => {
    let cancelled = false;
    createPayment({ name, phone, method: "online", discount_type: discount })
      .then((pi) => {
        if (cancelled) return;
        if (!pi.qr_image_url && !pi.qr_data_url) {
          setError("Online payment is unavailable right now. Please pay at the counter.");
          return;
        }
        setIntent(pi);
        if (pi.qr_image_url) {
          Image.prefetch(pi.qr_image_url)
            .catch(() => {})
            .finally(() => {
              if (!cancelled) setImageReady(true);
            });
        }
      })
      .catch((e: { message?: string }) => {
        if (!cancelled) setError(e?.message ?? "Failed to start payment.");
      });
    return () => {
      cancelled = true;
    };
  });

  const finish = useCallback(
    (status: FinishStatus) => {
      if (settledRef.current) return;
      settledRef.current = true;
      router.replace({
        pathname: "/result",
        params: {
          flow: "walk_in",
          status: status === "paid" ? "success" : "failed",
          name,
          phone,
          method: "online",
          payment_status: status,
          payment_reference: intent?.reference ?? "",
          reason: status === "timeout" ? "timeout" : "",
          discount_type: discount ?? "",
        },
      });
    },
    [name, phone, intent?.reference, discount]
  );

  useEffect(() => {
    if (!intent) return;
    let cancelled = false;
    const id = setInterval(async () => {
      if (cancelled || settledRef.current) return;
      try {
        const status = await pollPayment(intent.reference);
        if (cancelled || settledRef.current) return;
        if (status === "paid") finish("paid");
        else if (status === "expired") finish("timeout");
      } catch {
        // swallow transient poll errors; CountdownRing will eventually fire timeout
      }
    }, 2000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intent, finish]);

  const cancel = () => finish("cancelled");

  if (error) {
    return (
      <PageFrame onCancel={cancel}>
        <View style={styles.center}>
          <Text style={styles.title}>Scan to Pay</Text>
          <Text style={styles.error}>{error}</Text>
        </View>
      </PageFrame>
    );
  }

  const ready = !!intent && (intent.qr_image_url ? imageReady : !!intent.qr_data_url);

  if (!ready) {
    return (
      <PageFrame onCancel={cancel}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.crimson} />
          <Text style={styles.loadingText}>Generating your QR code…</Text>
        </View>
      </PageFrame>
    );
  }

  return (
    <PageFrame onCancel={cancel}>
      <Text style={styles.title}>Scan to Pay</Text>
      <Text style={styles.subtitle}>Open any QR Ph-enabled banking app or e-wallet (GCash, Maya, BPI, BDO, UnionBank, …) and scan the QR code below.</Text>

      <View style={styles.body}>
        <View style={styles.qrCard}>
          <View style={styles.qrFrame}>
            {intent!.qr_image_url ? (
              <Image source={{ uri: intent!.qr_image_url }} style={styles.qrImage} resizeMode="contain" />
            ) : (
              <QRCode value={intent!.qr_data_url!} size={220} backgroundColor={colors.white} color={colors.ink} />
            )}
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Amount Due</Text>
            <Text style={styles.amount}>{formatAmount(intent!.amount)}</Text>
            <Text style={styles.ref}>Ref: {intent!.reference}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Time Remaining</Text>
            <CountdownRing durationSec={config.paymentTimeoutSec} onExpire={() => finish("timeout")} active size={100} />
            <Text style={styles.timerHint}>Payment expires when the timer runs out.</Text>
          </View>
        </View>
      </View>
    </PageFrame>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  header: { alignItems: "center" },
  title: {
    ...typography.h1,
    color: colors.ink,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  loadingText: {
    ...typography.body,
    color: colors.textMuted,
    marginTop: spacing.md,
  },
  body: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg,
  },
  qrCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    ...shadow.card,
  },
  qrFrame: {
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  qrImage: {
    width: 220,
    height: 220,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    minWidth: 220,
    ...shadow.card,
  },
  infoBlock: {
    alignItems: "center",
    gap: spacing.xs,
  },
  infoLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  divider: {
    height: 1,
    alignSelf: "stretch",
    backgroundColor: colors.border,
  },
  amount: {
    ...typography.h1,
    color: colors.ink,
  },
  ref: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  timerHint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 220,
    marginTop: spacing.xs,
  },
  error: {
    ...typography.body,
    color: colors.danger,
    textAlign: "center",
    marginTop: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  cancel: {
    alignSelf: "center",
    marginTop: spacing.xl,
    minWidth: 240,
  },
});
