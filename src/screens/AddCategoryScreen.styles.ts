import { StyleSheet } from 'react-native';
import { theme, space, radius, shadow } from '../theme/tokens';

export const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.bgPage },
  header: { flexDirection: 'row', alignItems: 'center', gap: space[2], paddingHorizontal: space[6] - 10, paddingBottom: space[3] },
  closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  scrollContent: { paddingHorizontal: space[6], paddingBottom: space[6], gap: space[4] },

  fieldGroup: { gap: space[1] },
  label: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  labelError: { color: theme.statusDanger },
  required: { color: theme.statusDanger },
  helperText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary },
  errorText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.statusDanger },
  counterText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, textAlign: 'right' },

  input: {
    minHeight: 44, paddingHorizontal: space[3], fontSize: 16, fontFamily: 'Urbanist_400Regular',
    color: theme.textPrimary, backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderDefault,
    borderRadius: radius.md,
  },
  inputError: { borderColor: theme.statusDanger },

  pickerRow: {
    minHeight: 44, paddingHorizontal: space[3], backgroundColor: theme.bgRaised, borderWidth: 1,
    borderColor: theme.borderDefault, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  pickerText: { fontSize: 15, color: theme.textTertiary },
  pickerTextFilled: { color: theme.textPrimary },

  segmented: { flexDirection: 'row', backgroundColor: theme.bgSunken, borderRadius: radius.md, padding: 3, gap: 3 },
  segment: { flex: 1, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: theme.bgRaised, ...shadow[1] },
  segmentText: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textSecondary },
  segmentTextActive: { color: theme.textPrimary },

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
  saveButton: {
    height: 44, paddingHorizontal: space[5], backgroundColor: theme.brandDefault, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  saveButtonText: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textOnBrand },

  sheetRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: theme.bgOverlay },
  sheet: { backgroundColor: theme.bgRaised, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, height: 560 },
  sheetHandleRow: { alignItems: 'center', paddingTop: space[3] },
  sheetHandle: { width: 36, height: 4, borderRadius: radius.full, backgroundColor: theme.borderStrong },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space[5], paddingTop: space[4] },
  sheetTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  sheetCloseButton: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: theme.bgSunken, alignItems: 'center', justifyContent: 'center' },
  sheetSearchWrap: { paddingHorizontal: space[5], paddingTop: space[4] },
  sheetSearchBar: { height: 40, paddingHorizontal: space[3], backgroundColor: theme.bgSunken, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: space[2] },
  sheetSearchInput: { flex: 1, fontSize: 14, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, padding: 0 },
  sheetOptionsList: { paddingHorizontal: space[5], paddingTop: space[3], paddingBottom: space[5] },
  sheetLoadingState: { alignItems: 'center', paddingVertical: space[6] },
  sheetOptionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: space[3], minHeight: 44, borderBottomWidth: 1, borderBottomColor: theme.borderSubtle,
  },
  sheetOptionRowStrong: { borderBottomColor: theme.borderDefault, marginBottom: space[1] },
  sheetOptionNameRow: { flexDirection: 'row', alignItems: 'baseline', gap: space[2] },
  sheetOptionText: { fontSize: 15, color: theme.textPrimary },
  sheetOptionTextStrong: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  sheetOptionCode: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, fontVariant: ['tabular-nums'] },
  sheetEmptyState: { alignItems: 'center', paddingVertical: space[8], gap: space[2] },
  emptyTitle: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary, marginTop: space[2], textAlign: 'center' },
  emptySubtitle: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, textAlign: 'center' },
});
