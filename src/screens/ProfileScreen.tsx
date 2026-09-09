import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { LogOut } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { radius, space, theme, type } from '../theme/tokens';
import type { RootStackParamList } from '../../App';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import Dialog from '../components/Dialog';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const { logout } = useAuth();
  const { clearUser } = useUser();

  const handleLogoutConfirm = async () => {
    try {
      setLogoutDialogVisible(false);
      await clearUser();
      await logout();
      // Don't navigate manually - auth state change in AuthContext
      // will trigger RootNavigator to show SignIn automatically
    } catch (error) {
      setErrorDialogVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <Pressable
          style={styles.logoutButton}
          onPress={() => setLogoutDialogVisible(true)}
        >
          <LogOut size={20} color={theme.statusDanger} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </Pressable>
      </View>

      <Dialog
        visible={logoutDialogVisible}
        title="Logout"
        description="Are you sure you want to log out?"
        buttons={[
          {
            label: 'Cancel',
            type: 'cancel',
            onPress: () => setLogoutDialogVisible(false),
          },
          {
            label: 'Logout',
            type: 'destructive',
            onPress: handleLogoutConfirm,
          },
        ]}
        onDismiss={() => setLogoutDialogVisible(false)}
      />

      <Dialog
        visible={errorDialogVisible}
        title="Error"
        description="Failed to logout. Please try again."
        buttons={[
          {
            label: 'OK',
            type: 'primary',
            onPress: () => setErrorDialogVisible(false),
          },
        ]}
        onDismiss={() => setErrorDialogVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bgPage,
  },
  header: {
    paddingHorizontal: space[6],
    paddingVertical: space[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDefault,
  },
  title: {
    ...type.h2,
    color: theme.textPrimary,
  },
  content: {
    flex: 1,
    padding: space[6],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[4],
    paddingVertical: space[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.statusDanger,
    backgroundColor: 'transparent',
  },
  logoutButtonText: {
    ...type.body,
    color: theme.statusDanger,
  },
});
