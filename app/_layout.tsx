import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useEffect, useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { store } from '@/store';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkAuth } from '@/store/slices/userSlice';
import SplashScreen from '@/components/SplashScreen';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const dispatch = useAppDispatch();
  const { isAuthenticated, hasCompletedOnboarding, loading } = useAppSelector((state) => state.user);
  const segments = useSegments();
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const [isSplashFinished, setIsSplashFinished] = useState(false);

  // Check for stored session on mount
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Handle Redirection based on Auth State
  useEffect(() => {
    if (!rootNavigationState?.key) return;
    if (loading) return;
    if (!isSplashFinished) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isWelcomeScreen = (segments as string[]).length === 0 || (segments as string[]).some(s => s === 'index' || s === '');

    if (isAuthenticated) {
      if (inAuthGroup || isWelcomeScreen) {
        // If user is signed in and trying to access auth/welcome screens, redirect to tabs
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 0);
      }
    } else {
      // NOT Authenticated
      if (!hasCompletedOnboarding) {
        if (!isWelcomeScreen) {
          // If hasn't completed onboarding and not on welcome screen, go to welcome
          setTimeout(() => {
            router.replace('/');
          }, 0);
        }
      } else {
        // Completed onboarding but not logged in - ALLOW access to tabs
        // Users can browse as guests, but will see login prompts on restricted screens
      }
    }
  }, [isAuthenticated, hasCompletedOnboarding, segments, loading, rootNavigationState?.key, isSplashFinished]);

  // Show splash screen first
  if (!isSplashFinished) {
    return <SplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <BottomSheetModalProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="offer-detail" options={{ headerShown: true, title: 'Details', headerBackButtonDisplayMode: 'minimal' }} />
          <Stack.Screen name="brand-offers" options={{ headerShown: true, title: 'Brand Offers', headerBackButtonDisplayMode: 'minimal' }} />
          <Stack.Screen name="category-offers" options={{ headerShown: true, title: 'Category Offers', headerBackButtonDisplayMode: 'minimal' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </BottomSheetModalProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <RootLayoutNav />
      </Provider>
    </GestureHandlerRootView>
  );
}
