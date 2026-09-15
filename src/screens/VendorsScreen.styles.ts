import { StyleSheet } from 'react-native';
import { theme, space, radius } from '../theme/tokens';

export const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.bgPage },
  header: { flexDirection: 'row', alignItems: 'center', gap: space[2], paddingHorizontal: space[6] - 10 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },

  searchRow: { flexDirection: 'row', gap: space[2], marginTop: space[3], paddingHorizontal: space[6] },
  searchBar: {
    flex: 1, height: 44, paddingHorizontal: space[3], backgroundColor: theme.bgRaised,
    borderWidth: 1, borderColor: theme.borderDefault, borderRadius: radius.md,
    flexDirection: 'row', alignItems: 'center', gap: space[2],
  },
  searchBarActive: { borderColor: theme.brandDefault },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, padding: 0 },
  sortButton: {
    width: 44, height: 44, backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderDefault,
    borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
  },

  chipRow: { marginTop: space[3], flexGrow: 0 },
  chipRowContent: { gap: space[2], paddingHorizontal: space[6], paddingBottom: space[2] },
  chip: {
    height: 28, paddingHorizontal: space[3], borderRadius: radius.full, borderWidth: 1,
    borderColor: theme.borderDefault, backgroundColor: theme.bgRaised, alignItems: 'center', justifyContent: 'center',
  },
  chipActive: { borderColor: theme.brandDefault, backgroundColor: theme.brandSubtle },
  chipText: { fontSize: 13, fontFamily: 'Urbanist_500Medium', color: theme.textPrimary },
  chipTextActive: { fontFamily: 'Urbanist_600SemiBold', color: theme.brandActive },

  contentContainer: { flex: 1 },
  listContent: { paddingHorizontal: space[6], paddingTop: space[4], paddingBottom: 112 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[6], gap: space[2] },
  emptyTitle: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary, marginTop: space[2], textAlign: 'center' },
  emptyTitleLg: { fontSize: 15 },
  emptySubtitle: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, textAlign: 'center' },

  card: { backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderSubtle, borderRadius: radius.lg, padding: space[4] },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3] },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary, flexShrink: 1 },
  cardCode: {
    fontSize: 11, fontFamily: 'Urbanist_600SemiBold', color: theme.textSecondary, backgroundColor: theme.bgSunken,
    height: 18, paddingHorizontal: space[1] + 2, borderRadius: radius.sm, textAlignVertical: 'center',
    fontVariant: ['tabular-nums'],
  },
  chevronUp: { transform: [{ rotate: '180deg' }] },
  cardMidRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3], marginTop: space[1] + 2 },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  cityText: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary },
  statusBadge: { height: 20, paddingHorizontal: space[2], borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  statusBadgeActive: { backgroundColor: theme.statusSuccessBg },
  statusBadgeInactive: { backgroundColor: theme.statusDangerBg },
  statusBadgeText: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold' },

  details: { borderTopWidth: 1, borderTopColor: theme.borderSubtle, marginTop: space[3], paddingTop: space[3], gap: space[3] },
  detailRow: {},
  detailLabelRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  detailLabel: { fontSize: 12, fontFamily: 'Urbanist_500Medium', color: theme.textTertiary },
  detailValue: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, marginTop: 2, fontVariant: ['tabular-nums'] },
  detailValueMuted: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textTertiary, marginTop: 2 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: space[1], marginTop: 2 },
  linkText: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.brandActive },
  gstRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: 2 },
  copyButton: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  copiedTooltip: {
    position: 'absolute', left: 0, top: -32, backgroundColor: theme.textPrimary,
    paddingHorizontal: space[2], paddingVertical: 4, borderRadius: radius.sm,
  },
  copiedTooltipText: { fontSize: 11, fontFamily: 'Urbanist_600SemiBold', color: theme.textInverse },

  actionRow: { flexDirection: 'row', gap: space[2] },
  actionButton: {
    height: 32, paddingHorizontal: space[3], backgroundColor: theme.bgRaised, borderWidth: 1,
    borderColor: theme.borderDefault, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: space[1] + 2,
  },
  actionButtonText: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  inUseText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary },

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
