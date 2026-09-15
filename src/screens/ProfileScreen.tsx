import { useState } from 'react';
import {
  Text,
  View,
  Pressable,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { LogOut, ChevronLeft } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { styles } from './ProfileScreen.styles';
import { theme } from '../theme/tokens';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

const formatStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getStatusColor = (status: string): { bg: string; text: string } => {
  switch (status.toLowerCase()) {
    case 'active':
      return { bg: theme.statusSuccessBg, text: theme.statusSuccessStrong };
    case 'inactive':
      return { bg: theme.statusDangerBg, text: theme.statusDangerStrong };
    default:
      return { bg: theme.bgRaised, text: theme.textPrimary };
  }
};

export default function ProfileScreen({ navigation }: Props) {
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [errorDialogVisible, setErrorDialogVisible] = useState(false);
  const { logout } = useAuth();
  const { clearUser, user, isLoading } = useUser();

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
        <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color={theme.textPrimary} strokeWidth={1.75} />
        </Pressable>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.brandDefault} />
          </View>
        ) : user ? (
          <>
            <View style={styles.userCard}>
              <Text style={styles.nameText}>{user.name}</Text>
              <Text style={styles.emailText}>{user.email}</Text>
              <View style={styles.statusContainer}>
                <View style={[styles.statusChip, { backgroundColor: getStatusColor(user.status).bg }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(user.status).text }]}>
                    {formatStatus(user.status)}
                  </Text>
                </View>
              </View>
            </View>

            <Pressable
              style={styles.logoutButton}
              onPress={() => setLogoutDialogVisible(true)}
            >
              <LogOut size={20} color={theme.statusDanger} />
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
          </>
        ) : null}
      </View>

      <Modal visible={logoutDialogVisible} transparent animationType="fade" onRequestClose={() => setLogoutDialogVisible(false)}>
        <Pressable style={styles.dialogOverlay} onPress={() => setLogoutDialogVisible(false)}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>Logout?</Text>
            <Text style={styles.dialogMessage}>Are you sure you want to log out?</Text>
            <View style={styles.dialogButtonRow}>
              <Pressable
                style={[styles.dialogButton, styles.dialogButtonCancel]}
                onPress={() => setLogoutDialogVisible(false)}
              >
                <Text style={styles.dialogButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.dialogButton, styles.dialogButtonDelete]}
                onPress={handleLogoutConfirm}
              >
                <Text style={[styles.dialogButtonText, styles.dialogButtonDeleteText]}>Logout</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Modal visible={errorDialogVisible} transparent animationType="fade" onRequestClose={() => setErrorDialogVisible(false)}>
        <Pressable style={styles.dialogOverlay} onPress={() => setErrorDialogVisible(false)}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>Error</Text>
            <Text style={styles.dialogMessage}>Failed to logout. Please try again.</Text>
            <View style={styles.dialogButtonRow}>
              <Pressable
                style={[styles.dialogButton, styles.dialogButtonCancel]}
                onPress={() => setErrorDialogVisible(false)}
              >
                <Text style={styles.dialogButtonText}>OK</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
