import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KioskSessionProvider, useKioskSession } from '@/lib/session';
import { colors } from '@/theme';

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
      }}
    >
      {children}
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.LANDSCAPE,
      ).catch(() => {});
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <KioskSessionProvider>
          <RootShell>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.white },
                animation: 'fade',
              }}
            />
          </RootShell>
          <StatusBar hidden />
        </KioskSessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
