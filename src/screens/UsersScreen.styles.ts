import { StyleSheet } from 'react-native';
import { theme, space, radius } from '../theme/tokens';

export const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.bgPage },
  header: { paddingHorizontal: space[6], paddingTop: space[2] },
  headerTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },

  seatCardWrap: { paddingHorizontal: space[6], paddingTop: space[4] },
  seatCard: { backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderSubtle, borderRadius: radius.lg, padding: space[4] },
  seatTopRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  seatIconCircle: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: theme.brandSubtle, alignItems: 'center', justifyContent: 'center' },
  seatIconCircleWarning: { backgroundColor: theme.statusWarningBg },
  seatIconCircleDanger: { backgroundColor: theme.statusDangerBg },
  seatTextCol: { flex: 1, minWidth: 0 },
  seatLabel: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary },
  seatValue: { fontSize: 20, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary, fontVariant: ['tabular-nums'], marginTop: 2 },
  seatBarTrack: { height: 6, borderRadius: radius.full, backgroundColor: theme.bgSunken, overflow: 'hidden', marginTop: space[3] + 2 },
  seatBarFill: { height: '100%', backgroundColor: theme.brandDefault, borderRadius: radius.full },
  seatHint: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', marginTop: space[2] },
  seatHintWarning: { color: theme.statusWarningStrong },
  seatHintDanger: { color: theme.statusDangerStrong },
  seatSubtext: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: 4 },

  stickyControls: { paddingHorizontal: space[6], paddingTop: space[3], paddingBottom: space[3], backgroundColor: theme.bgPage },
  searchBar: {
    height: 44, paddingHorizontal: space[3], backgroundColor: theme.bgRaised,
    borderWidth: 1, borderColor: theme.borderDefault, borderRadius: radius.md,
    flexDirection: 'row', alignItems: 'center', gap: space[2],
  },
  searchBarActive: { borderColor: theme.brandDefault },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, padding: 0 },

  chipRow: { marginTop: space[3], flexGrow: 0 },
  chipRowContent: { gap: space[2] },
  chip: {
    height: 28, paddingHorizontal: space[3], borderRadius: radius.full, borderWidth: 1,
    borderColor: theme.borderDefault, backgroundColor: theme.bgRaised, alignItems: 'center', justifyContent: 'center',
  },
  chipActive: { borderColor: theme.brandDefault, backgroundColor: theme.brandSubtle },
  chipText: { fontSize: 13, fontFamily: 'Urbanist_500Medium', color: theme.textPrimary },
  chipTextActive: { fontFamily: 'Urbanist_600SemiBold', color: theme.brandActive },

  contentContainer: { flex: 1 },
  listContent: { paddingHorizontal: space[6], paddingTop: space[1], paddingBottom: 112 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[6], gap: space[2] },
  emptyTitle: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary, marginTop: space[2], textAlign: 'center' },
  emptySubtitle: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, textAlign: 'center' },

  card: { backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderSubtle, borderRadius: radius.lg, padding: space[4] },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[2] },
  cardTopRight: { flexDirection: 'row', alignItems: 'center', gap: space[2], flexShrink: 0 },
  cardTitle: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary, flex: 1, minWidth: 0 },
  chevronUp: { transform: [{ rotate: '180deg' }] },
  cardRole: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: 4 },
  cardScope: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: 2 },
  statusBadge: { height: 20, paddingHorizontal: space[2], borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  statusBadgeText: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold' },

  details: { borderTopWidth: 1, borderTopColor: theme.borderSubtle, marginTop: space[3], paddingTop: space[3], gap: space[3] },
  detailLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailLabel: { fontSize: 12, fontFamily: 'Urbanist_500Medium', color: theme.textTertiary },
  detailValue: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, marginTop: 2, fontVariant: ['tabular-nums'] },
  linkText: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.brandActive, marginTop: 2 },
  expiryValue: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.statusWarningStrong, marginTop: 2 },
  expiryValueDanger: { color: theme.statusDangerStrong },

  membershipsLabel: { marginBottom: space[2] },
  membershipList: { gap: space[2] + 2 },
  membershipRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] + 2 },
  membershipIcon: { width: 32, height: 32, borderRadius: radius.md, backgroundColor: theme.bgSunken, alignItems: 'center', justifyContent: 'center' },
  membershipTextCol: { flex: 1, minWidth: 0 },
  membershipOrg: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  membershipRole: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary },

  actionRow: { flexDirection: 'row', gap: space[2], flexWrap: 'wrap' },
  actionButton: {
    height: 32, paddingHorizontal: space[3], backgroundColor: theme.bgRaised, borderWidth: 1,
    borderColor: theme.borderDefault, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: space[1] + 2,
  },
  actionButtonText: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },

  fab: {
    position: 'absolute', right: space[5], width: 56, height: 56, borderRadius: radius.xl,
    backgroundColor: theme.brandDefault, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#080a0b', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },
  fabDisabled: { backgroundColor: theme.textDisabled },

  sheetRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: theme.bgOverlay },
  sheet: { backgroundColor: theme.bgRaised, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  sheetHandleRow: { alignItems: 'center', paddingTop: space[3] },
  sheetHandle: { width: 36, height: 4, borderRadius: radius.full, backgroundColor: theme.borderStrong },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space[5], paddingTop: space[4] },
  sheetTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  sheetCloseButton: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: theme.bgSunken, alignItems: 'center', justifyContent: 'center' },
  sheetIconWrap: { alignItems: 'center', marginTop: space[5], marginBottom: space[4] },
  sheetBody: { fontSize: 14, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, textAlign: 'center', lineHeight: 21 },
  sheetPrimaryButton: { height: 44, backgroundColor: theme.brandDefault, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: space[5] },
  sheetPrimaryButtonText: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textOnBrand },
  sheetSecondaryButton: { height: 44, backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderDefault, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginTop: space[2] },
  sheetSecondaryButtonText: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
});
