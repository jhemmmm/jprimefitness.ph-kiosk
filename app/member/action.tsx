import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandHeader } from '@/components/BrandHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PrimaryCard } from '@/components/PrimaryCard';
import { colors, spacing, typography } from '@/theme';

export default function MemberActionScreen() {
  const choose = (action: 'time_in' | 'time_out') => {
    router.push({ pathname: '/member/scan', params: { action } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BrandHeader size="md" />
        </View>

        <Text style={styles.title}>Member Check-In</Text>
        <Text style={styles.subtitle}>
          Are you arriving or leaving today?
        </Text>

        <View style={styles.cards}>
          <PrimaryCard
            title="Time In"
            subtitle="Start your session"
            onPress={() => choose('time_in')}
            testID="member-time-in"
          />
          <View style={{ width: spacing.xl }} />
          <PrimaryCard
            title="Time Out"
            subtitle="End your session"
            onPress={() => choose('time_out')}
            testID="member-time-out"
          />
        </View>

        <PrimaryButton
          label="Back"
          variant="outline"
          onPress={() => router.replace('/')}
          style={styles.back}
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
    marginBottom: spacing.xl,
  },
  cards: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  back: {
    alignSelf: 'center',
    marginTop: spacing.lg,
    minWidth: 240,
  },
});
