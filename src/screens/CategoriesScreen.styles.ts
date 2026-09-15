import { StyleSheet } from 'react-native';
import { theme, space, radius } from '../theme/tokens';

export const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.bgPage },
  header: { flexDirection: 'row', alignItems: 'center', gap: space[2], paddingHorizontal: space[6] - 10 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },

  searchRow: { flexDirection: 'row', gap: space[2], marginTop: space[3], paddingHorizontal: space[6] },
  searchRowDisabled: { opacity: 0.5 },
  searchBar: {
    flex: 1, height: 44, paddingHorizontal: space[3], backgroundColor: theme.bgRaised,
    borderWidth: 1, borderColor: theme.borderDefault, borderRadius: radius.md,
    flexDirection: 'row', alignItems: 'center', gap: space[2],
  },
  searchBarActive: { borderColor: theme.brandDefault },
  searchBarDisabled: { backgroundColor: theme.bgSunken },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, padding: 0 },
  sortButton: {
    width: 44, height: 44, backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderDefault,
    borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
  },
  sortButtonDisabled: { backgroundColor: theme.bgSunken },

  chipRow: { marginTop: space[3], marginBottom: space[3], flexGrow: 0 },
  chipRowContent: { gap: space[2], paddingHorizontal: space[6] },
  chip: {
    height: 28, paddingHorizontal: space[3], borderRadius: radius.full, borderWidth: 1,
    borderColor: theme.borderDefault, backgroundColor: theme.bgRaised, alignItems: 'center', justifyContent: 'center',
  },
  chipActive: { borderColor: theme.brandDefault, backgroundColor: theme.brandSubtle },
  chipDisabled: { backgroundColor: theme.bgSunken, borderColor: theme.borderSubtle },
  chipText: { fontSize: 13, fontFamily: 'Urbanist_500Medium', color: theme.textPrimary },
  chipTextActive: { fontFamily: 'Urbanist_600SemiBold', color: theme.brandActive },
  chipTextDisabled: { color: theme.textTertiary },

  contentContainer: { flex: 1 },
  listContent: { paddingHorizontal: space[6], paddingTop: space[4], paddingBottom: 112 },

  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[6], gap: space[2] },
  emptyTitle: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary, marginTop: space[2], textAlign: 'center' },
  emptyTitleLg: { fontSize: 15 },
  emptySubtitle: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, textAlign: 'center' },

  card: { backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderSubtle, borderRadius: radius.lg, padding: space[4] },
  breadcrumb: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginBottom: 2 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3] },
  cardTitleRow: { flexDirection: 'row', alignItems: 'baseline', gap: space[2], flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary, flexShrink: 1 },
  cardCode: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, fontVariant: ['tabular-nums'] },
  chevronUp: { transform: [{ rotate: '180deg' }] },
  cardDescription: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: space[1] },
  statusRow: { marginTop: space[2] },
  statusBadge: { height: 20, paddingHorizontal: space[2], borderRadius: radius.full, alignSelf: 'flex-start', alignItems: 'center', justifyContent: 'center' },
  statusBadgeActive: { backgroundColor: theme.statusSuccessBg },
  statusBadgeInactive: { backgroundColor: theme.statusDangerBg },
  statusBadgeText: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold' },

  details: { borderTopWidth: 1, borderTopColor: theme.borderSubtle, marginTop: space[3], paddingTop: space[3] },
  detailSpacingTop: { marginTop: space[3] },
  detailLabel: { fontSize: 12, fontFamily: 'Urbanist_500Medium', color: theme.textTertiary },
  detailValue: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, marginTop: 2 },
  detailFullDescription: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, marginTop: 2, lineHeight: 18 },
  detailGrid: { flexDirection: 'row', gap: space[3] },
  detailField: { flex: 1 },

  actionRow: { flexDirection: 'row', gap: space[2], marginTop: space[4] },
  actionButton: {
    height: 32, paddingHorizontal: space[3], backgroundColor: theme.bgRaised, borderWidth: 1,
    borderColor: theme.borderDefault, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: space[1] + 2,
  },
  actionButtonText: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  actionButtonDangerText: { color: theme.statusDanger },
  inUseText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: space[2] },

  fab: {
    position: 'absolute', right: space[5], width: 56, height: 56, borderRadius: radius.xl,
    backgroundColor: theme.brandDefault, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#080a0b', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },

  sheetRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: theme.bgOverlay },
  sheet: { backgroundColor: theme.bgRaised, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  sheetHandleRow: { alignItems: 'center', paddingTop: space[3] },
  sheetHandle: { width: 36, height: 4, borderRadius: radius.full, backgroundColor: theme.borderStrong },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space[5], paddingTop: space[4] },
  sheetTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  sheetCloseButton: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: theme.bgSunken, alignItems: 'center', justifyContent: 'center' },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: space[3] + 2, minHeight: 44 },
  sortRowDivider: { borderBottomWidth: 1, borderBottomColor: theme.borderSubtle },
  sortRowText: { fontSize: 15, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary },
  sortRowTextActive: { fontFamily: 'Urbanist_600SemiBold' },

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
