import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandHeader } from "@/components/BrandHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PrimaryCard } from "@/components/PrimaryCard";
import { TimeInIcon, TimeOutIcon } from "@/components/icons";
import { colors, spacing, typography } from "@/theme";

export default function MemberActionScreen() {
  const choose = (action: "time_in" | "time_out") => {
    router.push({ pathname: "/member/scan", params: { action } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BrandHeader size="md" />
        </View>

        <Text style={styles.title}>Member Check-In</Text>
        <Text style={styles.subtitle}>Are you arriving or leaving today?</Text>

        <View style={styles.cards}>
          <PrimaryCard title="Time In" subtitle="Start your session" icon={<TimeInIcon size={48} />} onPress={() => choose("time_in")} testID="member-time-in" />
          <PrimaryCard title="Time Out" subtitle="End your session" icon={<TimeOutIcon size={48} color={colors.white} />} onPress={() => choose("time_out")} tone="danger" testID="member-time-out" />
        </View>

        <PrimaryButton label="Back" variant="outline" onPress={() => router.replace("/")} style={styles.back} />
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
