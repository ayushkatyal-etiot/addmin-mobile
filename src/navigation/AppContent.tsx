import React, { useEffect, useRef, useState } from 'react';
import { BackHandler, AppState, type AppStateStatus } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useAuthSync } from '../hooks/useAuthSync';
import { RootNavigator } from './RootNavigator';

export function NavigationWrapper() {
  useAuthSync();
  return <AppContent />;
}

function AppContent() {
  const navigationRef = useRef<any>(null);
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [isAuthenticated]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to foreground - refresh user info if logged in
      if (isAuthenticated) {
        // Trigger user info refresh (will be handled by a hook in screens)
      }
    }
    appState.current = nextAppState;
    setAppStateVisible(nextAppState);
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // Only close app from home tab (Dashboard), allow back navigation elsewhere
      const state = navigationRef.current?.getRootState();
      if (state?.type === 'stack') {
        const currentRouteName = state?.routes?.[state.index]?.name;
        if (currentRouteName === 'Dashboard') {
          BackHandler.exitApp();
          return true;
        }
      }
      return false; // Let default behavior handle navigation back
    });

    return () => backHandler.remove();
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <RootNavigator />
    </NavigationContainer>
  );
}
