import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../contexts/AuthContext';

import SignInScreen from '../screens/SignInScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AllExpensesScreen from '../screens/AllExpensesScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import AddCategoryScreen from '../screens/AddCategoryScreen';
import VendorsScreen from '../screens/VendorsScreen';
import AddVendorScreen from '../screens/AddVendorScreen';
import UsersScreen from '../screens/UsersScreen';
import InviteUserScreen from '../screens/InviteUserScreen';
import StubScreen from '../screens/StubScreen';
import BottomNav from '../components/BottomNav';

export type RootStackParamList = {
  SignIn: undefined;
  Dashboard: undefined;
  Profile: undefined;
  AllExpenses: undefined;
  AddExpense: undefined;
  Categories: undefined;
  AddCategory: { categoryId?: string } | undefined;
  Vendors: undefined;
  AddVendor: { vendorId?: string } | undefined;
  InviteUser: { seatsUsed?: number; seatsTotal?: number; onSent?: () => void } | undefined;
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
      <Tab.Screen name="Users" component={UsersScreen} />
      <Tab.Screen name="Support">{() => <StubScreen tab="Support" />}</Tab.Screen>
      <Tab.Screen name="Settings">{() => <StubScreen tab="Settings" />}</Tab.Screen>
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const auth = useAuth();

  if (auth.isLoading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {auth.isAuthenticated ? (
        <>
          <Stack.Screen name="Dashboard" component={MainTabs} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
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
                onAddCategory={(categoryId?: string) =>
                  navigation.navigate('AddCategory', categoryId ? { categoryId } : undefined)
                }
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="AddCategory">
            {({ navigation, route }) => (
              <AddCategoryScreen onBack={() => navigation.goBack()} route={route} />
            )}
          </Stack.Screen>
          <Stack.Screen name="Vendors">
            {({ navigation }) => (
              <VendorsScreen
                onBack={() => navigation.goBack()}
                onAddVendor={(vendorId?: string) =>
                  navigation.navigate('AddVendor', vendorId ? { vendorId } : undefined)
                }
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="AddVendor">
            {({ navigation, route }) => (
              <AddVendorScreen onBack={() => navigation.goBack()} route={route} />
            )}
          </Stack.Screen>
          <Stack.Screen name="InviteUser">
            {({ navigation, route }) => (
              <InviteUserScreen onBack={() => navigation.goBack()} route={route} />
            )}
          </Stack.Screen>
        </>
      ) : (
        <Stack.Screen name="SignIn" component={SignInScreen} />
      )}
    </Stack.Navigator>
  );
}
