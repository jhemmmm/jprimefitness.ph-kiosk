import { router } from "expo-router";
import { forwardRef, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";
import { BrandHeader } from "@/components/BrandHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { colors, radius, spacing, typography } from "@/theme";

const phoneRe = /^(?:\+63|0)9\d{9}$/;

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(80, "Name is too long."),
  phone: z.string().trim().regex(phoneRe, "Use a PH number like 09171234567 or +639171234567."),
});

type DiscountChoice = "" | "student" | "senior";

export default function WalkInFormScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [discount, setDiscount] = useState<DiscountChoice>("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const phoneRef = useRef<TextInput>(null);

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
      pathname: "/walk-in/payment-method",
      params: { name: parsed.data.name, phone: parsed.data.phone, discount_type: discount || "" },
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
        <View style={styles.container}>
          <View style={styles.header}>
            <BrandHeader size="md" />
          </View>

          <Text style={styles.title}>Walk-In Registration</Text>
          <Text style={styles.subtitle}>Tell us a little about yourself so we can record your visit.</Text>

          <View style={styles.form}>
            <Field label="Full Name" value={name} onChange={setName} placeholder="Your full name" error={errors.name} autoCapitalize="words" returnKeyType="next" onSubmitEditing={() => phoneRef.current?.focus()} blurOnSubmit={false} />
            <Field ref={phoneRef} label="Contact Number" value={phone} onChange={setPhone} placeholder="09171234567" error={errors.phone} keyboardType="phone-pad" returnKeyType="done" onSubmitEditing={onContinue} />

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Discount</Text>
              <Text style={styles.fieldHint}>Staff will check your ID at the counter — cash payment only.</Text>
              <View style={styles.discountRow}>
                {([
                  { value: "" as DiscountChoice, label: "None" },
                  { value: "student" as DiscountChoice, label: "Student" },
                  { value: "senior" as DiscountChoice, label: "Senior" },
                ]).map((opt) => {
                  const active = discount === opt.value;
                  return (
                    <Pressable
                      key={opt.label}
                      onPress={() => setDiscount(opt.value)}
                      style={[styles.discountOption, active && styles.discountOptionActive]}
                      testID={`discount-${opt.value || "none"}`}
                    >
                      <Text style={[styles.discountLabel, active && styles.discountLabelActive]}>{opt.label}</Text>
                      {opt.value !== "" ? <Text style={[styles.discountSub, active && styles.discountSubActive]}>20% off</Text> : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <PrimaryButton label="Cancel" variant="outline" onPress={() => router.replace("/")} style={{ flex: 1 }} />
            <PrimaryButton label="Continue" onPress={onContinue} style={{ flex: 2 }} testID="walk-in-continue" />
          </View>
        </View>
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
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "phone-pad" | "email-address";
  returnKeyType?: "next" | "done" | "go";
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
};

const Field = forwardRef<TextInput, FieldProps>(function Field({ label, value, onChange, placeholder, error, autoCapitalize, keyboardType, returnKeyType, onSubmitEditing, blurOnSubmit }, ref) {
  return (
    <Pressable style={styles.fieldWrap} onPress={() => {}}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput ref={ref} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.textMuted} style={[styles.input, error ? styles.inputError : null]} autoCapitalize={autoCapitalize} keyboardType={keyboardType} autoCorrect={false} returnKeyType={returnKeyType} onSubmitEditing={onSubmitEditing} blurOnSubmit={blurOnSubmit} />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.ink,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  form: {
    gap: spacing.md,
  },
  fieldWrap: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.body,
    fontWeight: "700",
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
    borderColor: "transparent",
  },
  inputError: {
    borderColor: colors.danger,
  },
  fieldError: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  fieldHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  discountRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  discountOption: {
    flex: 1,
    minHeight: 64,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  discountOptionActive: {
    borderColor: colors.crimson,
    backgroundColor: "#fff5f5",
  },
  discountLabel: {
    ...typography.body,
    fontWeight: "700",
    color: colors.ink,
  },
  discountLabelActive: {
    color: colors.crimson,
  },
  discountSub: {
    ...typography.caption,
    color: colors.textMuted,
  },
  discountSubActive: {
    color: colors.crimson,
  },
  actions: {
    flexDirection: "row",
    marginTop: spacing.lg,
    gap: spacing.md,
  },
});
