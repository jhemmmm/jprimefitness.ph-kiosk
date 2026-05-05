import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandHeader } from "@/components/BrandHeader";
import { PrimaryCard } from "@/components/PrimaryCard";
import { MembershipIcon, WalkInIcon } from "@/components/icons";
import { colors, spacing, typography } from "@/theme";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BrandHeader />
        </View>

        <Text style={styles.subtitle}>Select your entry type to begin your session.</Text>

        <View style={styles.cards}>
          <PrimaryCard title="Walk-In" subtitle="One-time Entry" icon={<WalkInIcon size={48} />} onPress={() => router.push("/walk-in/form")} testID="card-walk-in" />
          <PrimaryCard title="Membership" subtitle="Member QR Verification" icon={<MembershipIcon size={48} color={colors.white} />} onPress={() => router.push("/member/action")} tone="danger" testID="card-membership" />
        </View>

        <Text style={styles.footer}>Sweat is your body's way of showing progress.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
  },
  subtitle: {
    ...typography.body,
    color: colors.ink,
    textAlign: "center",
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  cards: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "center",
    alignSelf: "stretch",
    gap: spacing.lg,
  },
  footer: {
    ...typography.caps,
    color: colors.ink,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});
