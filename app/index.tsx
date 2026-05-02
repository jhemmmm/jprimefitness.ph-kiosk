import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandHeader } from '@/components/BrandHeader';
import { PrimaryCard } from '@/components/PrimaryCard';
import { MembershipIcon, WalkInIcon } from '@/components/icons';
import { colors, spacing, typography } from '@/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BrandHeader />
        </View>

        <Text style={styles.subtitle}>
          Select your entry type to begin your session.
        </Text>

        <View style={styles.cards}>
          <PrimaryCard
            title="Walk-In"
            subtitle="One-time Entry"
            icon={<WalkInIcon size={72} />}
            onPress={() => router.push('/walk-in/form')}
            testID="card-walk-in"
          />
          <View style={{ width: spacing.xl }} />
          <PrimaryCard
            title="Membership"
            subtitle="Member Face Verification"
            icon={<MembershipIcon size={72} />}
            onPress={() => router.push('/member/action')}
            testID="card-membership"
          />
        </View>

        <Text style={styles.footer}>
          Sweat is your body's way of showing progress.
        </Text>
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
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  cards: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  footer: {
    ...typography.caps,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
