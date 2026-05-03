import { CameraView, useCameraPermissions } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BrandHeader } from '@/components/BrandHeader';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ScannerFrame } from '@/components/ScannerFrame';
import { colors, spacing, typography } from '@/theme';

type Action = 'time_in' | 'time_out';

export default function MemberScanScreen() {
  const { action } = useLocalSearchParams<{ action: Action }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const handledRef = useRef(false);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleScan = useCallback(
    (qrPayload: string) => {
      if (handledRef.current) return;
      handledRef.current = true;
      setScanning(false);
      router.replace({
        pathname: '/result',
        params: {
          flow: 'member',
          action: action ?? 'time_in',
          qr_payload: qrPayload,
        },
      });
    },
    [action],
  );

  const cancel = () => router.replace('/');

  if (!permission) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.muted}>Preparing camera…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <BrandHeader size="md" />
          <Text style={[styles.title, { marginTop: spacing.xl }]}>
            Camera permission required
          </Text>
          <Text style={styles.muted}>
            We need camera access to scan member QR codes.
          </Text>
          <PrimaryButton
            label="Grant Permission"
            onPress={() => requestPermission()}
            style={{ marginTop: spacing.lg, minWidth: 280 }}
          />
          <PrimaryButton
            label="Back"
            variant="outline"
            onPress={cancel}
            style={{ marginTop: spacing.md, minWidth: 280 }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BrandHeader size="md" />
        </View>

        <Text style={styles.cue}>Place your QR here</Text>

        <View style={styles.scannerStage}>
          <View style={styles.cameraWrap}>
            {Platform.OS !== 'web' ? (
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="front"
                barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                onBarcodeScanned={
                  scanning ? ({ data }) => handleScan(data) : undefined
                }
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.webStub]}>
                <Text style={styles.muted}>
                  Camera preview is not available on web.
                </Text>
                <Pressable
                  onPress={() => handleScan('JPRIME:demo_encrypted_payload')}
                  style={styles.webStubBtn}
                >
                  <Text style={styles.webStubBtnText}>
                    Simulate successful scan
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => handleScan('UNKNOWN-QR')}
                  style={[styles.webStubBtn, styles.webStubBtnAlt]}
                >
                  <Text style={styles.webStubBtnText}>
                    Simulate unknown QR
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
          <View style={styles.frameOverlay} pointerEvents="none">
            <ScannerFrame size={240} color={colors.ink} thickness={10} />
          </View>
        </View>

        <PrimaryButton
          label="Cancel"
          variant="outline"
          onPress={cancel}
          style={styles.cancel}
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
    alignItems: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: { alignItems: 'center', alignSelf: 'stretch' },
  cue: {
    ...typography.h2,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.ink,
    textAlign: 'center',
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  scannerStage: {
    width: 280,
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
    borderRadius: 24,
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webStub: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  webStubBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.crimsonDark,
  },
  webStubBtnAlt: {
    backgroundColor: colors.danger,
  },
  webStubBtnText: {
    ...typography.caps,
    color: colors.white,
  },
  cancel: {
    marginTop: spacing.lg,
    minWidth: 240,
  },
});
