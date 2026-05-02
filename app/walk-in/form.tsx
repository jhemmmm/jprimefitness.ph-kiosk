import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { BrandHeader } from '@/components/BrandHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, radius, spacing, typography } from '@/theme';

const phoneRe = /^(?:\+63|0)9\d{9}$/;

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Please enter your full name.')
    .max(80, 'Name is too long.'),
  phone: z
    .string()
    .trim()
    .regex(phoneRe, 'Use a PH number like 09171234567 or +639171234567.'),
});

export default function WalkInFormScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  const onContinue = () => {
    const parsed = schema.safeParse({ name, phone });
    if (!parsed.success) {
      const flat = parsed.error.flatten().fieldErrors;
      setErrors({
        name: flat.name?.[0],
        phone: flat.phone?.[0],
      });
      return;
    }
    setErrors({});
    router.push({
      pathname: '/walk-in/payment-method',
      params: { name: parsed.data.name, phone: parsed.data.phone },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <BrandHeader size="md" />
          </View>

          <Text style={styles.title}>Walk-In Registration</Text>
          <Text style={styles.subtitle}>
            Tell us a little about yourself so we can record your visit.
          </Text>

          <View style={styles.form}>
            <Field
              label="Full Name"
              value={name}
              onChange={setName}
              placeholder="Juan Dela Cruz"
              error={errors.name}
              autoCapitalize="words"
            />
            <Field
              label="Contact Number"
              value={phone}
              onChange={setPhone}
              placeholder="09171234567"
              error={errors.phone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              label="Cancel"
              variant="outline"
              onPress={() => router.replace('/')}
              style={{ flex: 1 }}
            />
            <View style={{ width: spacing.md }} />
            <PrimaryButton
              label="Continue"
              onPress={onContinue}
              style={{ flex: 2 }}
              testID="walk-in-continue"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'phone-pad' | 'email-address';
};

function Field({
  label,
  value,
  onChange,
  placeholder,
  error,
  autoCapitalize,
  keyboardType,
}: FieldProps) {
  return (
    <Pressable style={styles.fieldWrap} onPress={() => {}}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : null]}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        autoCorrect={false}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  container: {
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.lg,
  },
  fieldWrap: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.body,
    fontWeight: '700',
    color: colors.ink,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 22,
    color: colors.ink,
    minHeight: 64,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: colors.danger,
  },
  fieldError: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.xl,
  },
});
