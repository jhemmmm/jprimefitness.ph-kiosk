import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandHeader } from '@/components/BrandHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { PrimaryCard } from '@/components/PrimaryCard';
import { colors, spacing, typography } from '@/theme';

export default function PaymentMethodScreen() {
  const { name, phone } = useLocalSearchParams<{ name: string; phone: string }>();

  const choose = (method: 'counter' | 'online') => {
    if (method === 'counter') {
      router.replace({
        pathname: '/walk-in/success',
        params: { name, phone, method: 'counter' },
      });
    } else {
      router.replace({
        pathname: '/walk-in/pay-online',
        params: { name, phone },
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BrandHeader size="md" />
        </View>

        <Text style={styles.title}>Choose Payment Method</Text>
        <Text style={styles.subtitle}>How would you like to pay, {name}?</Text>

        <View style={styles.cards}>
          <PrimaryCard
            title="Over the Counter"
            subtitle="Pay cash at the front desk"
            onPress={() => choose('counter')}
            testID="pay-counter"
          />
          <View style={{ width: spacing.xl }} />
          <PrimaryCard
            title="Pay Online"
            subtitle="Scan with GCash"
            onPress={() => choose('online')}
            testID="pay-online"
          />
        </View>

        <PrimaryButton
          label="Back"
          variant="outline"
          onPress={() => router.back()}
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
