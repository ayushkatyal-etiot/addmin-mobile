import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { theme, type } from '../theme/tokens';

export default function StubScreen({ tab }: { tab: string }) {
  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.flex}>
        <Text style={styles.title}>{tab}</Text>
        <Text style={styles.subtitle}>This screen is coming soon.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.bgPage,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  title: {
    ...type.h2,
    color: theme.textPrimary,
  },
  subtitle: {
    ...type.body,
    color: theme.textSecondary,
  },
});
