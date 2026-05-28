import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Heebo_300Light,
  Heebo_400Regular,
  Heebo_600SemiBold,
  Heebo_700Bold,
  Heebo_800ExtraBold,
} from '@expo-google-fonts/heebo';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useAppStore } from '../store/appStore';
import { applyRTL } from '../i18n';
import { Colors } from '../constants/colors';
import Toast from '../components/shared/Toast';
import GateModal from '../components/shared/GateModal';

SplashScreen.preventAutoHideAsync();
applyRTL();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Heebo_300Light,
    Heebo_400Regular,
    Heebo_600SemiBold,
    Heebo_700Bold,
    Heebo_800ExtraBold,
  });

  useFirebaseAuth();
  const { isAuthenticated, isLoading, user } = useAppStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isLoading]);

  // Auth routing: redirect to welcome if user has no name yet
  useEffect(() => {
    if (isLoading || !fontsLoaded) return;
    const inAuth = segments[0] === '(auth)';
    const needsOnboarding = isAuthenticated && user?.name === '';

    if (!isAuthenticated && !inAuth) {
      // Allow browsing unauthenticated — auth only required for gated actions
      return;
    }
    if (needsOnboarding && !inAuth) {
      router.replace('/(auth)/welcome');
    } else if (isAuthenticated && user?.name && inAuth) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, fontsLoaded, user?.name, segments]);

  if (!fontsLoaded || isLoading) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={Colors.bg} />
        <Slot />
        <Toast />
        <GateModal />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
