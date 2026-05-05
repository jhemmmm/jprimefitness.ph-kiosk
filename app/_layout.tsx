import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as ScreenOrientation from "expo-screen-orientation";
import * as NavigationBar from "expo-navigation-bar";
import { useKeepAwake } from "expo-keep-awake";
import { useFonts, Oswald_400Regular, Oswald_700Bold } from "@expo-google-fonts/oswald";
import { useEffect } from "react";
import { ActivityIndicator, BackHandler, Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KioskSessionProvider, useKioskSession } from "@/lib/session";
import { BackendProvider } from "@/lib/BackendProvider";
import { startLockTask } from "@/lib/kioskLock";
import { colors } from "@/theme";

function RootShell({ children }: { children: React.ReactNode }) {
  const { resetIdle } = useKioskSession();
  return (
    <View
      style={{ flex: 1, backgroundColor: colors.white }}
      onStartShouldSetResponder={() => {
        resetIdle();
        return false;
      }}
      onMoveShouldSetResponder={() => {
        resetIdle();
        return false;
      }}>
      {children}
    </View>
  );
}

export default function RootLayout() {
  useKeepAwake();
  const [fontsLoaded] = useFonts({
    Oswald_400Regular,
    Oswald_700Bold,
  });

  useEffect(() => {
    if (Platform.OS !== "web") {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    NavigationBar.setVisibilityAsync("hidden").catch(() => {});
    NavigationBar.setBehaviorAsync("overlay-swipe").catch(() => {});
    NavigationBar.setBackgroundColorAsync(colors.white).catch(() => {});
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    startLockTask().catch(() => {});
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={fontGate.splash}>
        <ActivityIndicator color={colors.crimson} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BackendProvider>
          <KioskSessionProvider>
            <RootShell>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.white },
                  animation: "fade",
                }}
              />
            </RootShell>
            <StatusBar hidden />
          </KioskSessionProvider>
        </BackendProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const fontGate = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
});
