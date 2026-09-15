import { StyleSheet } from 'react-native';
import { theme, space, radius, shadow } from '../theme/tokens';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex1: { flex: 1 },
  container: { flex: 1, backgroundColor: theme.bgPage },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[6] - 10,
    backgroundColor: theme.bgPage,
  },
  headerClose: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  scopeRow: {
    flexDirection: 'row', alignItems: 'center', gap: space[1] + 2,
    paddingHorizontal: space[6], paddingTop: space[1], paddingBottom: space[3],
    backgroundColor: theme.bgPage,
  },
  scopeText: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary },
  scopeDot: { fontSize: 13, color: theme.textTertiary },

  scrollContent: { paddingHorizontal: space[6], paddingBottom: space[6], gap: space[3] },

  blockedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: space[2],
    backgroundColor: theme.statusDangerBg, borderRadius: radius.md, padding: space[3] - 2,
  },
  blockedText: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDangerStrong, flex: 1 },

  card: {
    backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderSubtle,
    borderRadius: radius.lg, overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[3], minHeight: 44 },
  cardHeaderText: { flex: 1, minWidth: 0 },
  cardHeaderTitle: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold' },
  cardHeaderSummary: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: 2 },
  cardHeaderError: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDanger, marginTop: 2 },
  cardBody: {
    paddingHorizontal: space[4], paddingBottom: space[4], paddingTop: space[4],
    borderTopWidth: 1, borderTopColor: theme.borderSubtle, gap: space[4],
  },

  badge: { width: 24, height: 24, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  badgeBrand: { backgroundColor: theme.brandDefault },
  badgeDanger: { backgroundColor: theme.statusDanger },
  badgeLocked: { borderWidth: 1, borderColor: theme.borderStrong },
  badgeText: { fontSize: 13, fontFamily: 'Urbanist_700Bold', color: theme.textOnBrand },
  badgeTextLocked: { fontSize: 13, fontFamily: 'Urbanist_700Bold', color: theme.textTertiary },

  fieldGroup: { gap: space[1] },
  label: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  labelDisabled: { color: theme.textTertiary },
  labelError: { color: theme.statusDanger },
  required: { color: theme.statusDanger },
  helperText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary },
  errorText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.statusDanger },
  noticeText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.statusWarning },
  hintText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary },

  inputError: { borderColor: theme.statusDanger },

  amountRow: {
    minHeight: 44, paddingHorizontal: space[3], backgroundColor: theme.bgRaised, borderWidth: 1,
    borderColor: theme.borderDefault, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: space[1] + 2,
  },
  amountSymbol: { fontSize: 16, color: theme.textTertiary },
  amountInput: { flex: 1, fontSize: 16, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, padding: 0 },

  pickerRow: {
    minHeight: 44, paddingHorizontal: space[3], backgroundColor: theme.bgRaised, borderWidth: 1,
    borderColor: theme.borderDefault, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  pickerRowDisabled: { backgroundColor: theme.bgSunken, borderColor: theme.borderSubtle },
  pickerText: { fontSize: 15, color: theme.textTertiary, flex: 1 },
  pickerTextFilled: { color: theme.textPrimary },
  pickerTextDisabled: { color: theme.textDisabled },

  subGroup: {
    borderLeftWidth: 2, borderLeftColor: theme.borderDefault, paddingLeft: space[3], marginLeft: 2, gap: space[4],
  },

  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  toggleLabel: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  toggleTrack: { width: 44, height: 26, borderRadius: radius.full, backgroundColor: theme.borderStrong },
  toggleTrackOn: { backgroundColor: theme.brandDefault },
  toggleThumb: { position: 'absolute', top: 3, left: 3, width: 20, height: 20, borderRadius: radius.full, backgroundColor: '#FFFFFF' },
  toggleThumbOn: { left: 21 },

  summaryCard: { backgroundColor: theme.bgSunken, borderRadius: radius.lg, padding: space[4], gap: space[2] },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.textSecondary },
  summaryValue: { fontSize: 16, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  summaryDivider: {
    borderTopWidth: 1, borderTopColor: theme.borderDefault, marginTop: space[1],
    paddingTop: space[2], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  netLabel: { fontSize: 15, fontFamily: 'Urbanist_700Bold', color: theme.textPrimary },
  netValue: { fontSize: 24, fontFamily: 'Urbanist_700Bold', color: theme.textPrimary },
  warningText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.statusWarning, marginTop: space[1] },

  buttonRow: { flexDirection: 'row', gap: space[2] },
  primaryButton: {
    minHeight: 44, paddingHorizontal: space[5], backgroundColor: theme.brandDefault, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryButtonText: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textOnBrand },
  secondaryButton: {
    minHeight: 44, paddingHorizontal: space[4], borderWidth: 1, borderColor: theme.borderDefault,
    borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
  },
  secondaryButtonText: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },

  fileRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[2] + 2, backgroundColor: theme.bgSunken, borderRadius: radius.md },
  fileIcon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: theme.bgRaised, alignItems: 'center', justifyContent: 'center' },
  fileText: { flex: 1, minWidth: 0 },
  fileName: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  fileMeta: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: 2 },
  fileMetaError: { color: theme.statusDanger },
  progressTrack: { height: 4, backgroundColor: theme.borderSubtle, borderRadius: radius.full, marginTop: space[1] + 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: theme.brandDefault },
  retryButton: { height: 32, paddingHorizontal: space[3], backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderDefault, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  retryButtonText: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  fileRemove: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  uploadDash: {
    minHeight: 56, padding: space[3], backgroundColor: theme.bgSunken, borderWidth: 1, borderColor: theme.borderDefault,
    borderStyle: 'dashed', borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2],
  },
  uploadDashError: { borderColor: theme.statusDanger },
  uploadDashText: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.brandDefault },

  textarea: {
    minHeight: 96, padding: space[3], fontSize: 16, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary,
    backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderDefault, borderRadius: radius.md,
  },

  footer: {
    backgroundColor: theme.bgRaised, borderTopWidth: 1, borderTopColor: theme.borderSubtle,
    paddingHorizontal: space[6], paddingTop: space[3], paddingBottom: space[3],
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  footerActions: { flexDirection: 'row', gap: space[4] },
  footerCancel: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  footerReset: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDanger },
  footerResetDisabled: { color: theme.textDisabled },
  footerStep: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textTertiary },

  sheetRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: theme.bgOverlay },
  sheet: { backgroundColor: theme.bgRaised, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, ...shadow[4] },
  optionSheet: { height: 560 },
  dateSheet: { maxHeight: '70%' },
  sheetHandleRow: { alignItems: 'center', paddingTop: space[3] },
  sheetHandle: { width: 36, height: 4, borderRadius: radius.full, backgroundColor: theme.borderStrong },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space[5], paddingTop: space[4] },
  sheetTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  sheetCloseButton: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: theme.bgSunken, alignItems: 'center', justifyContent: 'center' },
  sheetSearchWrap: { paddingHorizontal: space[5], paddingTop: space[4] },
  sheetSearchBar: { height: 40, paddingHorizontal: space[3], backgroundColor: theme.bgSunken, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: space[2] },
  sheetSearchInput: { flex: 1, fontSize: 14, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, padding: 0 },
  sheetOptionsList: { paddingHorizontal: space[5], paddingTop: space[3], paddingBottom: space[5] },
  sheetOptionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: space[3], minHeight: 44, borderBottomWidth: 1, borderBottomColor: theme.borderSubtle },
  sheetOptionText: { fontSize: 15, color: theme.textPrimary },
  sheetEmptyState: { alignItems: 'center', textAlign: 'center', paddingVertical: space[8], gap: space[2] },
  emptyTitle: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary, marginTop: space[2] },
  emptySubtitle: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary },


  uploadSheetTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary, paddingHorizontal: space[5], paddingTop: space[4] },
  uploadOptionsList: { paddingHorizontal: space[5], paddingTop: space[3], paddingBottom: space[6], gap: space[1] },
  uploadOptionRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 52 },
  uploadOptionText: { fontSize: 15, color: theme.textPrimary },
});
