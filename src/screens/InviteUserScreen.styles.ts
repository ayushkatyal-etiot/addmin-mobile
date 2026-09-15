import { StyleSheet } from 'react-native';
import { theme, space, radius } from '../theme/tokens';

export const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.bgPage },
  flex1: { flex: 1, minWidth: 0 },
  flexShrink: { flexShrink: 1 },

  header: { flexDirection: 'row', alignItems: 'center', gap: space[2], paddingHorizontal: space[6] - 10, paddingBottom: space[3] },
  closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontFamily: 'Urbanist_700Bold', color: theme.textPrimary },
  seatLine: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, paddingHorizontal: space[6], paddingBottom: space[3] },
  seatLineWarning: { color: theme.statusWarningStrong, fontFamily: 'Urbanist_700Bold' },

  scrollContent: { paddingHorizontal: space[6], paddingBottom: space[6], gap: space[4] },

  card: { backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderSubtle, borderRadius: radius.lg, padding: space[4], gap: space[3] + 2 },
  cardError: { borderColor: theme.statusDanger },
  cardTitle: { fontSize: 16, fontFamily: 'Urbanist_700Bold', color: theme.textPrimary },
  cardSubtitle: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: 4 },

  fieldGroup: { gap: 6 },
  fieldLabelRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  label: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  labelError: { color: theme.statusDangerStrong },
  required: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDangerStrong },
  errorText: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDangerStrong },
  hintText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary },
  viewUserLink: { color: theme.brandActive, textDecorationLine: 'underline' },

  input: {
    height: 46, paddingHorizontal: space[3], fontSize: 16, fontFamily: 'Urbanist_400Regular',
    color: theme.textPrimary, backgroundColor: theme.bgPage, borderWidth: 1, borderColor: theme.borderDefault,
    borderRadius: radius.md,
  },
  inputError: { borderColor: theme.statusDangerStrong },

  phoneRow: {
    flexDirection: 'row', alignItems: 'center', height: 46, backgroundColor: theme.bgPage,
    borderWidth: 1, borderColor: theme.borderDefault, borderRadius: radius.md, paddingHorizontal: space[3], gap: space[1] + 2,
  },
  phonePrefix: { fontSize: 16, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary },
  phoneInput: { flex: 1, fontSize: 16, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, padding: 0 },

  selectField: {
    height: 46, paddingHorizontal: space[3], backgroundColor: theme.bgPage, borderWidth: 1, borderColor: theme.borderDefault,
    borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  selectFieldDisabled: { backgroundColor: theme.bgSunken },
  selectValue: { fontSize: 16, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary },
  selectPlaceholder: { fontSize: 16, fontFamily: 'Urbanist_400Regular', color: theme.textTertiary },
  selectDisabledText: { fontSize: 16, fontFamily: 'Urbanist_400Regular', color: theme.textDisabled },

  membershipBlock: { backgroundColor: theme.bgSunken, borderWidth: 1, borderColor: theme.borderSubtle, borderRadius: radius.md, padding: space[3] + 2, gap: space[3] },
  membershipBlockError: { borderColor: theme.statusDangerStrong },
  membershipHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  membershipTitle: { fontSize: 14, fontFamily: 'Urbanist_700Bold', color: theme.textPrimary },
  removeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  removeText: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDangerStrong },

  allBranchesRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space[3] },
  allBranchesLabel: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  allBranchesHint: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: 2 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 6, height: 28, paddingLeft: space[3], paddingRight: space[2],
    borderRadius: radius.full, backgroundColor: theme.brandSubtle,
  },
  chipText: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.brandActive },

  addMembershipButton: {
    height: 46, borderWidth: 1, borderColor: theme.borderDefault, borderRadius: radius.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2],
  },
  addMembershipText: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.brandActive },

  summaryBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: space[2], padding: space[3] - 2,
    backgroundColor: theme.statusDangerBg, borderRadius: radius.md,
  },
  summaryText: { flex: 1, fontSize: 12, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDangerStrong, lineHeight: 17 },
  retryText: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDangerStrong, textDecorationLine: 'underline', marginTop: 4 },

  footer: {
    borderTopWidth: 1, borderTopColor: theme.borderSubtle, backgroundColor: theme.bgRaised,
    paddingHorizontal: space[6], paddingTop: space[3], paddingBottom: space[5], flexDirection: 'row', alignItems: 'center', gap: space[3],
  },
  footerCancel: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textSecondary },
  footerCancelDisabled: { color: theme.textDisabled },
  sendButton: { flex: 1, height: 48, borderRadius: radius.md, backgroundColor: theme.brandDefault, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: space[2] },
  sendButtonBusy: { backgroundColor: theme.brandHover },
  sendButtonText: { fontSize: 15, fontFamily: 'Urbanist_700Bold', color: theme.textOnBrand },

  sheetRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: theme.bgOverlay },
  sheet: { backgroundColor: theme.bgRaised, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '78%' },
  sheetHandleRow: { alignItems: 'center', paddingTop: space[3] },
  sheetHandle: { width: 36, height: 4, borderRadius: radius.full, backgroundColor: theme.borderDefault },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space[5], paddingTop: space[2], paddingBottom: space[3] },
  sheetTitle: { fontSize: 16, fontFamily: 'Urbanist_700Bold', color: theme.textPrimary },
  sheetCloseButton: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  pickerSearchBar: {
    marginHorizontal: space[5], marginBottom: space[3], height: 44, paddingHorizontal: space[3], borderWidth: 1,
    borderColor: theme.borderDefault, borderRadius: radius.md, backgroundColor: theme.bgPage, flexDirection: 'row', alignItems: 'center', gap: space[2],
  },
  pickerSearchInput: { flex: 1, fontSize: 14, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, padding: 0 },
  pickerList: { paddingHorizontal: space[5] },
  pickerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: space[3] + 1, borderBottomWidth: 1, borderBottomColor: theme.borderSubtle },
  pickerRowText: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },

  selectAllRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: space[3], borderBottomWidth: 1, borderBottomColor: theme.borderDefault },
  selectAllText: { fontSize: 15, fontFamily: 'Urbanist_700Bold', color: theme.textPrimary },
  selectAllHint: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, paddingVertical: space[2] },
  branchRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], paddingVertical: space[3], borderBottomWidth: 1, borderBottomColor: theme.borderSubtle },
  branchIcon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: theme.brandSubtle, alignItems: 'center', justifyContent: 'center' },
  branchName: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  branchCity: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: 2 },
  checkbox: { width: 22, height: 22, borderRadius: 5, borderWidth: 2, borderColor: theme.borderDefault, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { borderColor: theme.brandDefault, backgroundColor: theme.brandDefault },

  branchEmptyState: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[8], paddingVertical: space[6], gap: space[3] },
  branchEmptyIcon: { width: 48, height: 48, borderRadius: radius.full, backgroundColor: theme.bgSunken, alignItems: 'center', justifyContent: 'center' },
  branchEmptyTitle: { fontSize: 15, fontFamily: 'Urbanist_700Bold', color: theme.textPrimary },
  branchEmptySubtitle: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, textAlign: 'center', lineHeight: 19 },

  sheetFooter: { padding: space[5], paddingTop: space[3], borderTopWidth: 1, borderTopColor: theme.borderSubtle },
  sheetApplyButton: { height: 48, borderRadius: radius.md, backgroundColor: theme.brandDefault, alignItems: 'center', justifyContent: 'center' },
  sheetApplyButtonText: { fontSize: 15, fontFamily: 'Urbanist_700Bold', color: theme.textOnBrand },

  confirmSheet: { backgroundColor: theme.bgRaised, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  confirmSheetBody: { padding: space[6], paddingTop: space[2], gap: space[4] },
  confirmTitle: { fontSize: 16, fontFamily: 'Urbanist_700Bold', color: theme.textPrimary },
  confirmDescription: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, lineHeight: 19 },
  confirmActions: { flexDirection: 'row', gap: space[3] },
  confirmKeepButton: { flex: 1, height: 46, borderWidth: 1, borderColor: theme.borderDefault, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  confirmKeepText: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  confirmRemoveButton: { flex: 1, height: 46, borderRadius: radius.md, backgroundColor: theme.statusDangerStrong, alignItems: 'center', justifyContent: 'center' },
  confirmRemoveText: { fontSize: 14, fontFamily: 'Urbanist_700Bold', color: '#fff' },
});
