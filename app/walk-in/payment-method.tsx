import { router, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandHeader } from "@/components/BrandHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PrimaryCard } from "@/components/PrimaryCard";
import { CounterIcon, OnlinePayIcon } from "@/components/icons";
import { parseDiscount } from "@/lib/kiosk";
import { colors, spacing, typography } from "@/theme";

export default function PaymentMethodScreen() {
  const { name, phone, discount_type } = useLocalSearchParams<{ name: string; phone: string; discount_type?: string }>();
  const discount = parseDiscount(discount_type) ?? "";
  const onlineDisabled = discount !== "";

  const choose = (method: "counter" | "online") => {
    if (method === "counter") {
      router.replace({
        pathname: "/walk-in/success",
        params: { name, phone, method: "counter", discount_type: discount },
      });
    } else {
      if (onlineDisabled) return;
      router.replace({
        pathname: "/walk-in/pay-online",
        params: { name, phone, discount_type: discount },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BrandHeader size="md" />
        </View>

        <Text style={styles.title}>Choose Payment Method</Text>
        <Text style={styles.subtitle}>
          How would you like to pay, {name}?
          {onlineDisabled ? "  Online is unavailable — staff must verify your ID at the counter." : ""}
        </Text>

        <View style={styles.cards}>
          <PrimaryCard title="Over the Counter" subtitle="Pay cash at the front desk" icon={<CounterIcon size={48} />} onPress={() => choose("counter")} testID="pay-counter" />
          <PrimaryCard
            title="Pay Online"
            subtitle={onlineDisabled ? "Disabled for ID-verified discounts" : "Scan QR Ph with any bank or e-wallet"}
            icon={<OnlinePayIcon size={48} color={colors.white} />}
            onPress={() => choose("online")}
            tone="danger"
            disabled={onlineDisabled}
            testID="pay-online"
          />
        </View>

        <PrimaryButton label="Back" variant="outline" onPress={() => router.back()} style={styles.back} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    justifyContent: "center",
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
    marginBottom: spacing.lg,
  },
  cards: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "center",
    alignSelf: "stretch",
    gap: spacing.xl,
  },
  back: {
    alignSelf: "center",
    marginTop: spacing.lg,
    minWidth: 240,
  },
});
