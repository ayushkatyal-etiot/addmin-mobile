import { StyleSheet } from 'react-native';
import { theme, space, radius, shadow } from '../theme/tokens';

export const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.bgPage },
  header: { flexDirection: 'row', alignItems: 'center', gap: space[2], paddingHorizontal: space[6] - 10, paddingBottom: space[3] },
  closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },

  scrollContent: { paddingHorizontal: space[6], paddingBottom: space[6], gap: space[4] },

  card: {
    backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderSubtle, borderRadius: radius.lg,
    padding: space[4], gap: space[4],
  },
  cardError: { borderColor: theme.statusDanger },
  cardTitle: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  cardSubtitle: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: space[1] },

  fieldGroup: { gap: space[1] },
  label: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  labelError: { color: theme.statusDanger },
  required: { color: theme.statusDanger },
  errorText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.statusDanger },

  inputError: { borderColor: theme.statusDanger },

  phoneRow: {
    flexDirection: 'row', alignItems: 'center', minHeight: 44, backgroundColor: theme.bgRaised,
    borderWidth: 1, borderColor: theme.borderDefault, borderRadius: radius.md, overflow: 'hidden',
  },
  phonePrefix: {
    paddingHorizontal: 10, fontSize: 16, color: theme.textSecondary, height: 44, lineHeight: 44,
    borderRightWidth: 1, borderRightColor: theme.borderDefault,
  },
  phoneInput: { flex: 1, minHeight: 44, paddingHorizontal: space[3], fontSize: 16, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary },

  segmented: { flexDirection: 'row', backgroundColor: theme.bgSunken, borderRadius: radius.md, padding: 3, gap: 3 },
  segment: { flex: 1, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: theme.bgRaised, ...shadow[1] },
  segmentText: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textSecondary },
  segmentTextActive: { color: theme.textPrimary },

  textarea: {
    minHeight: 76, padding: space[3], fontSize: 16, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary,
    backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderDefault, borderRadius: radius.md,
  },

  pickerRow: {
    minHeight: 44, paddingHorizontal: space[3], backgroundColor: theme.bgRaised, borderWidth: 1,
    borderColor: theme.borderDefault, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  pickerRowDisabled: {
    minHeight: 44, paddingHorizontal: space[3], backgroundColor: theme.bgRaised, borderWidth: 1,
    borderColor: theme.borderDefault, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  pickerText: { fontSize: 15, color: theme.textTertiary },
  pickerTextFilled: { color: theme.textPrimary, fontSize: 15 },

  uploadDash: {
    minHeight: 44, paddingHorizontal: space[4], backgroundColor: theme.bgSunken, borderWidth: 1, borderColor: theme.borderStrong,
    borderStyle: 'dashed', borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2],
  },
  uploadDashText: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.brandActive },

  docRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  docIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: theme.statusInfoBg, alignItems: 'center', justifyContent: 'center' },
  docIconFailed: { backgroundColor: theme.statusDangerBg },
  docText: { flex: 1, minWidth: 0 },
  docName: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  docMeta: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: 2 },
  docMetaError: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.statusDanger, marginTop: 2 },
  progressTrack: { height: 4, backgroundColor: theme.bgSunken, borderRadius: radius.full, marginTop: space[1] + 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: theme.brandDefault },
  retryButton: { height: 28, paddingHorizontal: space[2] + 2, backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.statusDanger, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  retryButtonText: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDanger },
  docRemove: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  footer: {
    backgroundColor: theme.bgRaised, borderTopWidth: 1, borderTopColor: theme.borderSubtle,
    paddingHorizontal: space[6], paddingTop: space[3], paddingBottom: space[3], gap: space[2] + 2,
  },
  footerErrorRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  footerErrorText: { flex: 1, fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDanger },
  footerActionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerActions: { flexDirection: 'row', gap: space[4] },
  footerCancel: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  footerReset: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDanger },
  footerResetDisabled: { color: theme.textDisabled },
  saveButton: { height: 44, paddingHorizontal: space[5], backgroundColor: theme.brandDefault, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textOnBrand },

  sheetRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: theme.bgOverlay },
  sheet: { backgroundColor: theme.bgRaised, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '75%' },
  sheetHandleRow: { alignItems: 'center', paddingTop: space[3] },
  sheetHandle: { width: 36, height: 4, borderRadius: radius.full, backgroundColor: theme.borderStrong },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space[5], paddingTop: space[4] },
  sheetTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  sheetCloseButton: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: theme.bgSunken, alignItems: 'center', justifyContent: 'center' },
  sheetSearchWrap: { paddingHorizontal: space[5], paddingTop: space[4] },
  sheetSearchBar: { height: 40, paddingHorizontal: space[3], backgroundColor: theme.bgSunken, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: space[2] },
  sheetSearchInput: { flex: 1, fontSize: 14, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, padding: 0 },
  sheetOptionsList: { paddingHorizontal: space[5], paddingTop: space[3], paddingBottom: space[5] },
  sheetOptionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: space[3], minHeight: 44, borderBottomWidth: 1, borderBottomColor: theme.borderSubtle,
  },
  sheetOptionText: { fontSize: 15, color: theme.textPrimary },
  sheetOptionTextSelected: { fontFamily: 'Urbanist_600SemiBold' },

  uploadOptionsList: { paddingHorizontal: space[5], paddingTop: space[3], paddingBottom: space[6], gap: space[1] },
  uploadOptionRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 52 },
  uploadOptionText: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
});
