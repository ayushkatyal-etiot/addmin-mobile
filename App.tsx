import React, { useCallback, useEffect } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import {
  useFonts,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
} from '@expo-google-fonts/urbanist';
import { AuthProvider } from './src/contexts/AuthContext';
import { UserProvider } from './src/contexts/UserContext';
import { NavigationWrapper } from './src/navigation/AppContent';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function App() {
  const [fontsLoaded] = useFonts({
    Urbanist_400Regular,
    Urbanist_500Medium,
    Urbanist_600SemiBold,
    Urbanist_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    onLayoutRootView();
    if (Platform.OS === 'android') {
      SystemNavigationBar.setBarColor('#212121');
    }
  }, [onLayoutRootView]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <UserProvider>
                <NavigationWrapper />
                <StatusBar style="light" />
              </UserProvider>
            </AuthProvider>
          </QueryClientProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
