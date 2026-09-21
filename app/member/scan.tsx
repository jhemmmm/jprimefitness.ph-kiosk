import { CameraView, useCameraPermissions } from "expo-camera";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BrandHeader } from "@/components/BrandHeader";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScannerFrame } from "@/components/ScannerFrame";
import { colors, spacing, typography } from "@/theme";

type Action = "time_in" | "time_out";

export default function MemberScanScreen() {
  const { action } = useLocalSearchParams<{ action: Action }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const handledRef = useRef(false);
  // Camera takes ~60% of screen height; Cancel sits at the bottom via marginTop: "auto".
  const stage = Math.round(useWindowDimensions().height * 0.6);

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
        pathname: "/result",
        params: {
          flow: "member",
          action: action ?? "time_in",
          qr_payload: qrPayload,
        },
      });
    },
    [action]
  );

  const cancel = () => router.replace("/");

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
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.center}>
          <BrandHeader size="md" />
          <Text style={[styles.title, { marginTop: spacing.xl }]}>Camera permission required</Text>
          <Text style={styles.muted}>We need camera access to scan member QR codes.</Text>
          <PrimaryButton label="Grant Permission" onPress={() => requestPermission()} style={{ marginTop: spacing.lg, minWidth: 280 }} />
          <PrimaryButton label="Back" variant="outline" onPress={cancel} style={{ marginTop: spacing.md, minWidth: 280 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BrandHeader size="md" />
        </View>

        <Text style={styles.cue}>Place your QR here</Text>

        <View style={[styles.scannerStage, { width: stage, height: stage }]}>
          <View style={styles.cameraWrap}>
            <CameraView style={StyleSheet.absoluteFill} facing="front" barcodeScannerSettings={{ barcodeTypes: ["qr"] }} onBarcodeScanned={scanning ? ({ data }) => handleScan(data) : undefined} />
          </View>
          <View style={styles.frameOverlay} pointerEvents="none">
            <ScannerFrame size={Math.round(stage * 0.85)} color={colors.ink} thickness={12} />
          </View>
        </View>

        <PrimaryButton label="Cancel" variant="outline" onPress={cancel} style={styles.cancel} />
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
    alignItems: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  header: { alignItems: "center", alignSelf: "stretch" },
  cue: {
    ...typography.h2,
    color: colors.ink,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h1,
    color: colors.ink,
    textAlign: "center",
  },
  muted: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
  },
  scannerStage: {
    alignItems: "center",
    justifyContent: "center",
  },
  cameraWrap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.surfaceMuted,
    overflow: "hidden",
    borderRadius: 24,
  },
  frameOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  cancel: {
    marginTop: "auto",
    minWidth: 280,
  },
});
