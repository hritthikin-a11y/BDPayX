import React, { useState, useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { AuthProvider, useAuth } from '../providers/AuthProvider';
import { BankingProvider } from '../providers/BankingProvider';
import { ThemeProvider } from '../providers/ThemeProvider';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const InitialLayout = () => {
  const { user, isAdmin, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Preload fonts and icons
        await Font.loadAsync({
          ...Ionicons.font,
        });
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately
      SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  useEffect(() => {
    if (isLoading || !appIsReady) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inAdminGroup = segments[0] === '(admin)';
    const inAuthGroup = segments[0] === '(auth)';

    if (user) {
      if (isAdmin && !inAdminGroup) {
        // Admin users go to admin dashboard
        router.replace('/(admin)/');
      } else if (!isAdmin && !inTabsGroup) {
        // Regular users go to user tabs
        router.replace('/(tabs)/');
      } else if (!isAdmin && inAdminGroup) {
        // Regular users shouldn't access admin
        router.replace('/(tabs)/');
      }
    } else if (!user && (inTabsGroup || inAdminGroup)) {
      // Not logged in, redirect to login
      router.replace('/(auth)/login');
    }
  }, [user, isAdmin, isLoading, segments, router, appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BankingProvider>
          <InitialLayout />
        </BankingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}