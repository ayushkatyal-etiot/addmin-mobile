import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { styles } from './StubScreen.styles';

export default function StubScreen({ tab }: { tab: string }) {
  const { logout } = useAuth();
  const { clearUser } = useUser();

  const handleLogout = async () => {
    try {
      await clearUser();
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.flex}>
        <Text style={styles.title}>{tab}</Text>
        <Text style={styles.subtitle}>This screen is coming soon.</Text>

        {tab === 'Settings' && (
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Force Logout</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
