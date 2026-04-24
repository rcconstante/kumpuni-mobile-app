import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ShareIntentProvider, useShareIntentContext } from 'expo-share-intent';

import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AppDataProvider, useAppData } from '@/context/AppDataContext';
import { UiProvider, useUi } from '@/context/UiContext';
import { LockProvider } from '@/context/LockContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { I18nProvider } from '@/context/I18nContext';
import { ToastProvider } from '@/components/Toast';
import { DialogsProvider } from '@/components/Dialogs';

function Gate({ children }: { children: React.ReactNode }) {
  const { ready } = useAppData();
  const { colors } = useTheme();
  if (!ready) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }
  return <>{children}</>;
}

// Listens for incoming share-intents (Chrome / FB / TikTok "Share to Savit")
// and routes them into the AddModal pre-filled with the URL.
function ShareIntentBridge() {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();
  const { ready } = useAppData();
  const { openAddModal } = useUi();
  const router = useRouter();

  useEffect(() => {
    if (!ready || !hasShareIntent) return;
    const url =
      shareIntent.webUrl ||
      (shareIntent.text && /(https?:\/\/\S+)/i.exec(shareIntent.text)?.[1]) ||
      shareIntent.text ||
      '';
    if (!url) { resetShareIntent(); return; }
    router.replace('/(tabs)' as any);
    setTimeout(() => {
      openAddModal({ tab: 'link', presetUrl: url });
      resetShareIntent();
    }, 60);
  }, [ready, hasShareIntent, shareIntent, openAddModal, resetShareIntent, router]);

  return null;
}

function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? 'light' : 'dark'} translucent={Platform.OS === 'android'} />;
}

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ShareIntentProvider options={{ debug: __DEV__, resetOnBackground: true }}>
      <SafeAreaProvider>
        <AppDataProvider>
          <ThemeProvider>
            <I18nProvider>
              <UiProvider>
              <ToastProvider>
                <DialogsProvider>
                  <LockProvider>
                    <Gate>
                      <ShareIntentBridge />
                      <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="settings" options={{ presentation: 'card' }} />
                        <Stack.Screen name="about" options={{ presentation: 'card' }} />
                        <Stack.Screen name="webview" options={{ presentation: 'card' }} />
                        <Stack.Screen name="collection/[id]" options={{ presentation: 'card' }} />
                        <Stack.Screen name="tag/[id]" options={{ presentation: 'card' }} />
                      </Stack>
                    </Gate>
                  </LockProvider>
                </DialogsProvider>
              </ToastProvider>
            </UiProvider>
            </I18nProvider>
            <ThemedStatusBar />
          </ThemeProvider>
        </AppDataProvider>
      </SafeAreaProvider>
    </ShareIntentProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
