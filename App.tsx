import { useCallback, useEffect } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import {
  useFonts,
  Urbanist_400Regular,
  Urbanist_500Medium,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
} from '@expo-google-fonts/urbanist';

import SignInScreen from './src/screens/SignInScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AllExpensesScreen from './src/screens/AllExpensesScreen';
import AddExpenseScreen from './src/screens/AddExpenseScreen';
import CategoriesScreen from './src/screens/CategoriesScreen';
import AddCategoryScreen from './src/screens/AddCategoryScreen';
import VendorsScreen from './src/screens/VendorsScreen';
import StubScreen from './src/screens/StubScreen';
import BottomNav from './src/components/BottomNav';

SplashScreen.preventAutoHideAsync();

export type RootStackParamList = {
  SignIn: undefined;
  Dashboard: undefined;
  AllExpenses: undefined;
  AddExpense: undefined;
  Categories: undefined;
  AddCategory: undefined;
  Vendors: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Users: undefined;
  Support: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// The floating pill nav is a custom tabBar, not per-screen UI, so it stays
// mounted once and never slides with a screen's push/pop transition.
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, tabBarStyle: { position: 'absolute' } }}
      tabBar={(props) => <BottomNav {...props} />}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Users">{() => <StubScreen tab="Users" />}</Tab.Screen>
      <Tab.Screen name="Support">{() => <StubScreen tab="Support" />}</Tab.Screen>
      <Tab.Screen name="Settings">{() => <StubScreen tab="Settings" />}</Tab.Screen>
    </Tab.Navigator>
  );
}

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
      SystemNavigationBar.setBarColor('#212121', false, 'none', 'navigation');
    }
  }, [onLayoutRootView]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              <Stack.Screen name="SignIn" component={SignInScreen} />
              <Stack.Screen name="Dashboard" component={MainTabs} />
              <Stack.Screen name="AllExpenses">
                {({ navigation }) => (
                  <AllExpensesScreen
                    onBack={() => navigation.goBack()}
                    onAddExpense={() => navigation.navigate('AddExpense')}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="AddExpense">
                {({ navigation }) => <AddExpenseScreen onBack={() => navigation.goBack()} />}
              </Stack.Screen>
              <Stack.Screen name="Categories">
                {({ navigation }) => (
                  <CategoriesScreen
                    onBack={() => navigation.goBack()}
                    onAddCategory={() => navigation.navigate('AddCategory')}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="AddCategory">
                {({ navigation }) => <AddCategoryScreen onBack={() => navigation.goBack()} />}
              </Stack.Screen>
              <Stack.Screen name="Vendors">
                {({ navigation }) => <VendorsScreen onBack={() => navigation.goBack()} />}
              </Stack.Screen>
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="light" />
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
