import { StyleSheet } from 'react-native';
import { theme, space, radius, type } from '../theme/tokens';

export const styles = StyleSheet.create({
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
  logoutButton: {
    marginTop: space[6],
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    backgroundColor: theme.statusDanger,
    borderRadius: radius.md,
  },
  logoutButtonText: {
    ...type.body,
    color: theme.textInverse,
    fontFamily: 'Urbanist_600SemiBold',
  },
});
