import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { colors, radius, shadow, spacing, typography } from '@/theme';

// Copied from jprimefitness.ph resources/views/home/terms.blade.php — bundled so
// it shows during an outage. Update both together.
const INTRO =
  'These Terms and Conditions govern your use of the facilities and services of JPrime Fitness ("the Gym", "we", "us"). By registering for a membership or purchasing a walk-in pass, you agree to be bound by these terms.';

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: '1. Membership Activation',
    body: [
      'Your membership is only activated after full payment has been confirmed. Submitting a registration form does not constitute an active membership. Until payment is confirmed, your account will remain in a pending state and you will not have access to gym facilities under a membership plan.',
      'For online payments, activation occurs once the payment gateway confirms a successful transaction. For on-site payments, activation occurs upon receipt and verification of payment by gym staff.',
    ],
  },
  {
    title: '2. Membership Plans and Duration',
    body: [
      'Memberships are valid for the duration specified in the chosen plan (e.g., 30 days for Monthly, 90 days for 3 Months) beginning on the confirmed start date. Memberships are non-transferable and may only be used by the registered member.',
      'Walk-in passes (Daily Pass) grant access for a single visit on the date of purchase and cannot be applied toward a membership plan.',
    ],
  },
  {
    title: '3. Fees and Payment',
    body: [
      'All prices are in Philippine Peso (PHP) and are inclusive of applicable taxes. Prices are subject to change without prior notice; however, any change will not affect a membership plan already paid for.',
      'Accepted payment methods include GCash, Maya, Instant Pay, and cash on site. The Gym is not liable for any charges, fees, or issues imposed by your bank or payment provider.',
    ],
  },
  {
    title: '4. Cancellation and Refund Policy',
    body: [
      'Memberships are generally non-refundable once activated. Refund requests before activation may be considered on a case-by-case basis at the sole discretion of management. To request a refund or discuss your membership, please contact us directly at the gym or through our official email.',
      'The Gym reserves the right to cancel or suspend a membership without refund if a member is found to be in violation of these Terms, gym rules, or applicable Philippine law.',
    ],
  },
  {
    title: '5. Gym Rules and Member Conduct',
    body: [
      '• Members must present a valid QR code or ID upon entry.',
      '• Proper athletic attire and clean, closed-toe shoes are required at all times on the gym floor.',
      '• Members must re-rack weights and wipe down equipment after use.',
      '• Aggressive, threatening, or disrespectful behaviour toward staff or other members will result in immediate suspension or termination of membership.',
      '• The use of illegal substances or alcohol within gym premises is strictly prohibited.',
      '• Smoking is not permitted anywhere on the premises.',
      '• The Gym reserves the right to update its house rules at any time; updated rules will be posted on the premises.',
    ],
  },
  {
    title: '6. Health and Safety',
    body: [
      'By entering the gym, you confirm that you are in adequate physical health to participate in exercise activities. You are encouraged to consult a physician before beginning any new fitness programme, especially if you have a pre-existing medical condition, injury, or are pregnant.',
      'The Gym and its staff are not responsible for injuries sustained during the use of equipment or participation in any exercise activity. Members are responsible for using equipment safely and correctly. If you are unsure how to use a piece of equipment, please ask a staff member for guidance.',
    ],
  },
  {
    title: '7. Personal Belongings',
    body: [
      'The Gym is not responsible for the loss, theft, or damage of personal belongings brought onto the premises. Members are advised not to bring valuables and to use available lockers where provided.',
    ],
  },
  {
    title: '8. Privacy and Data Protection',
    body: [
      'We collect personal information (name, contact details, date of birth, emergency contact) during registration for the purpose of managing your membership and ensuring your safety. Your data will not be sold to third parties.',
      'We may use your contact information to send you updates regarding your membership, payment confirmations, and relevant gym announcements. By registering, you consent to receiving these communications. You may opt out at any time by contacting us.',
      'Your information is stored securely and handled in accordance with the Data Privacy Act of 2012 (Republic Act No. 10173) of the Philippines.',
    ],
  },
  {
    title: '9. Limitation of Liability',
    body: [
      'To the fullest extent permitted by applicable Philippine law, JPrime Fitness, its owners, employees, and agents shall not be liable for any indirect, incidental, or consequential damages arising out of or in connection with your use of our facilities or services.',
    ],
  },
  {
    title: '10. Amendments',
    body: [
      'We reserve the right to update these Terms and Conditions at any time. The most current version will be available on our website and posted at the gym. Continued use of our facilities after any changes constitutes your acceptance of the updated terms.',
    ],
  },
  {
    title: '11. Governing Law',
    body: [
      'These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of the Philippines. Any disputes shall be subject to the exclusive jurisdiction of the appropriate courts in the Philippines.',
    ],
  },
];

// An in-tree overlay, not a <Modal>: a Modal renders outside RootShell, so
// touches in it wouldn't reset the idle timer while someone reads.
export function TermsSheet({ onAgree, onClose }: { onAgree: () => void; onClose: () => void }) {
  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={styles.title}>Terms and Conditions</Text>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollBody}>
          <Text style={styles.para}>{INTRO}</Text>
          {SECTIONS.map((s) => (
            <View key={s.title} style={styles.section}>
              <Text style={styles.heading}>{s.title}</Text>
              {s.body.map((p) => (
                <Text key={p} style={styles.para}>
                  {p}
                </Text>
              ))}
            </View>
          ))}
        </ScrollView>
        <View style={styles.actions}>
          <PrimaryButton label="Close" variant="outline" onPress={onClose} style={{ flex: 1 }} />
          <PrimaryButton label="I Agree" onPress={onAgree} style={{ flex: 2 }} testID="terms-agree" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    zIndex: 10,
    elevation: 10,
  },
  card: {
    width: '100%',
    maxWidth: 820,
    maxHeight: '100%',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xl,
    ...shadow.card,
  },
  title: {
    ...typography.h1,
    color: colors.ink,
    textAlign: 'center',
  },
  scroll: {
    marginTop: spacing.md,
    flexShrink: 1,
  },
  scrollBody: {
    gap: spacing.sm,
  },
  section: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  heading: {
    ...typography.h2,
    color: colors.ink,
  },
  para: {
    ...typography.body,
    color: colors.inkSoft,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
