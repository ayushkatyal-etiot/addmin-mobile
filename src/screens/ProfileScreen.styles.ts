import { StyleSheet } from 'react-native';
import { theme, space, radius, type } from '../theme/tokens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bgPage,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[6] - 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDefault,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...type.h2,
    color: theme.textPrimary,
  },
  content: {
    flex: 1,
    padding: space[6],
    justifyContent: 'flex-start',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userCard: {
    backgroundColor: theme.bgRaised,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    borderRadius: radius.lg,
    padding: space[6],
    marginBottom: space[6],
    gap: space[4],
  },
  nameText: {
    ...type.h2,
    color: theme.textPrimary,
  },
  emailText: {
    ...type.body,
    color: theme.textSecondary,
  },
  statusContainer: {
    marginTop: space[2],
  },
  statusChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: space[3],
    paddingVertical: space[2],
    borderRadius: radius.full,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Urbanist_600SemiBold',
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

  dialogOverlay: { flex: 1, backgroundColor: theme.bgOverlay, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[6] },
  dialogBox: { backgroundColor: theme.bgRaised, borderRadius: radius.lg, padding: space[5], width: '100%', maxWidth: 340 },
  dialogTitle: { fontSize: 16, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary, marginBottom: space[2] },
  dialogMessage: { fontSize: 14, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginBottom: space[5] },
  dialogButtonRow: { flexDirection: 'row', gap: space[2] },
  dialogButton: { flex: 1, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  dialogButtonCancel: { borderColor: theme.borderDefault, backgroundColor: theme.bgRaised },
  dialogButtonDelete: { backgroundColor: theme.statusDanger, borderColor: theme.statusDanger },
  dialogButtonText: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  dialogButtonDeleteText: { color: theme.textInverse },
});
