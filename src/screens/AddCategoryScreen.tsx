import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, ChevronDown, Folder, Search, X } from 'lucide-react-native';

import { radius, shadow, space, theme } from '../theme/tokens';

const DESCRIPTION_LIMIT = 280;

// Only top-level, active categories can be a parent — matches CategoriesScreen's mock data.
const ELIGIBLE_PARENTS = [
  { id: 'cat-1', code: 'CAT-001', name: 'Utility' },
  { id: 'cat-2', code: 'CAT-002', name: 'Rent & Lease' },
  { id: 'cat-3', code: 'CAT-003', name: 'Maintenance' },
  { id: 'cat-4', code: 'CAT-004', name: 'Office Supplies' },
];

const EXISTING_CATEGORY_NAMES = ['Utility', 'Rent & Lease', 'Maintenance', 'Office Supplies', 'Electricity', 'Pantry & Refreshments'];

type FormState = {
  name: string;
  parentId: string | null;
  status: 'active' | 'inactive';
  description: string;
};

const initialState: FormState = { name: '', parentId: null, status: 'active', description: '' };

export default function AddCategoryScreen({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<FormState>(initialState);
  const [nameError, setNameError] = useState<string | null>(null);
  const [parentSheetOpen, setParentSheetOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState('');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const isDirty = form.name !== '' || form.parentId !== null || form.status !== 'active' || form.description !== '';
  const overLimit = form.description.length > DESCRIPTION_LIMIT;
  const parentName = ELIGIBLE_PARENTS.find((p) => p.id === form.parentId)?.name ?? null;

  const filteredParents = useMemo(
    () => ELIGIBLE_PARENTS.filter((p) => p.name.toLowerCase().includes(parentSearch.toLowerCase())),
    [parentSearch]
  );

  const validateName = (value: string): string | null => {
    if (!value.trim()) return 'Category name is required';
    const dup = EXISTING_CATEGORY_NAMES.some((n) => n.toLowerCase() === value.trim().toLowerCase());
    if (dup) return 'A category with this name already exists';
    return null;
  };

  const handleSave = () => {
    const err = validateName(form.name);
    setNameError(err);
    if (err || overLimit) return;
    onBack();
  };

  const handleCancel = () => {
    if (isDirty) setShowDiscardConfirm(true);
    else onBack();
  };

  const handleReset = () => {
    setForm(initialState);
    setNameError(null);
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={handleCancel}>
          <X size={20} color={theme.textPrimary} strokeWidth={1.75} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Category</Text>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, nameError && styles.labelError]}>
            Category Name<Text style={styles.required}> *</Text>
          </Text>
          <TextInput
            style={[styles.input, nameError && styles.inputError]}
            value={form.name}
            onChangeText={(v) => {
              setForm((f) => ({ ...f, name: v }));
              if (nameError) setNameError(null);
            }}
            onBlur={() => setNameError(validateName(form.name))}
            placeholder="Enter category name"
            placeholderTextColor={theme.textTertiary}
          />
          {nameError ? (
            <Text style={styles.errorText}>{nameError}</Text>
          ) : (
            <Text style={styles.helperText}>Shown when creating an expense</Text>
          )}
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Parent Category</Text>
          <Pressable style={styles.pickerRow} onPress={() => setParentSheetOpen(true)}>
            <Text style={[styles.pickerText, parentName && styles.pickerTextFilled]}>
              {parentName ?? 'Select parent category'}
            </Text>
            <ChevronDown size={18} color={theme.textTertiary} strokeWidth={2} />
          </Pressable>
          <Text style={styles.helperText}>Leave blank to create a top-level category</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>
            Status<Text style={styles.required}> *</Text>
          </Text>
          <View style={styles.segmented}>
            {(['active', 'inactive'] as const).map((key) => {
              const active = form.status === key;
              return (
                <Pressable
                  key={key}
                  style={[styles.segment, active && styles.segmentActive]}
                  onPress={() => setForm((f) => ({ ...f, status: key }))}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {key === 'active' ? 'Active' : 'Inactive'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.helperText}>Inactive categories cannot be selected on new expenses</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.textarea, overLimit && styles.inputError]}
            value={form.description}
            onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
            placeholder="Enter description"
            placeholderTextColor={theme.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={[styles.counterText, overLimit && styles.errorText]}>
            {form.description.length}/{DESCRIPTION_LIMIT}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerActions}>
          <Pressable onPress={handleCancel}>
            <Text style={styles.footerCancel}>Cancel</Text>
          </Pressable>
          <Pressable disabled={!isDirty} onPress={handleReset}>
            <Text style={[styles.footerReset, !isDirty && styles.footerResetDisabled]}>Reset</Text>
          </Pressable>
        </View>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save category</Text>
        </Pressable>
      </View>

      <Modal visible={parentSheetOpen} transparent animationType="slide" onRequestClose={() => setParentSheetOpen(false)}>
        <View style={styles.sheetRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setParentSheetOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandleRow}><View style={styles.sheetHandle} /></View>
            <View style={styles.sheetTitleRow}>
              <Text style={styles.sheetTitle}>Select parent category</Text>
              <Pressable style={styles.sheetCloseButton} onPress={() => setParentSheetOpen(false)}>
                <X size={16} color={theme.textSecondary} strokeWidth={2} />
              </Pressable>
            </View>
            <View style={styles.sheetSearchWrap}>
              <View style={styles.sheetSearchBar}>
                <Search size={16} color={theme.textTertiary} strokeWidth={1.75} />
                <TextInput
                  style={styles.sheetSearchInput}
                  value={parentSearch}
                  onChangeText={setParentSearch}
                  placeholder="Search categories"
                  placeholderTextColor={theme.textTertiary}
                />
              </View>
            </View>
            <ScrollView contentContainerStyle={styles.sheetOptionsList}>
              <Pressable
                style={[styles.sheetOptionRow, styles.sheetOptionRowStrong]}
                onPress={() => { setForm((f) => ({ ...f, parentId: null })); setParentSheetOpen(false); }}
              >
                <Text style={styles.sheetOptionTextStrong}>None — top-level category</Text>
              </Pressable>
              {filteredParents.map((p) => (
                <Pressable
                  key={p.id}
                  style={styles.sheetOptionRow}
                  onPress={() => { setForm((f) => ({ ...f, parentId: p.id })); setParentSheetOpen(false); }}
                >
                  <View style={styles.sheetOptionNameRow}>
                    <Text style={styles.sheetOptionText}>{p.name}</Text>
                    <Text style={styles.sheetOptionCode}>{p.code}</Text>
                  </View>
                  {form.parentId === p.id ? <Check size={18} color={theme.brandDefault} strokeWidth={2.5} /> : null}
                </Pressable>
              ))}
              {filteredParents.length === 0 ? (
                <View style={styles.sheetEmptyState}>
                  <Folder size={32} color={theme.textTertiary} strokeWidth={1.75} />
                  <Text style={styles.emptyTitle}>No eligible parent categories</Text>
                  <Text style={styles.emptySubtitle}>Only top-level, active categories can be a parent</Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showDiscardConfirm} transparent animationType="fade" onRequestClose={() => setShowDiscardConfirm(false)}>
        <View style={styles.confirmRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowDiscardConfirm(false)} />
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Discard this category?</Text>
            <Text style={styles.confirmDescription}>The details you entered will be lost.</Text>
            <View style={styles.confirmActions}>
              <Pressable style={styles.confirmPrimary} onPress={() => setShowDiscardConfirm(false)}>
                <Text style={styles.confirmPrimaryText}>Keep editing</Text>
              </Pressable>
              <Pressable
                style={styles.confirmDestructive}
                onPress={() => { setShowDiscardConfirm(false); onBack(); }}
              >
                <Text style={styles.confirmDestructiveText}>Discard</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.bgPage },
  header: { flexDirection: 'row', alignItems: 'center', gap: space[2], paddingHorizontal: space[6] - 10, paddingBottom: space[3] },
  closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },

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

  confirmRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space[6], backgroundColor: theme.bgOverlay },
  confirmCard: { backgroundColor: theme.bgRaised, borderRadius: radius.lg, padding: space[5], width: '100%', maxWidth: 320, ...shadow[4] },
  confirmTitle: { fontSize: 16, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  confirmDescription: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: space[2], lineHeight: 18 },
  confirmActions: { gap: space[2], marginTop: space[5] },
  confirmPrimary: { minHeight: 44, paddingHorizontal: space[4], backgroundColor: theme.brandDefault, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  confirmPrimaryText: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textOnBrand },
  confirmDestructive: { minHeight: 44, paddingHorizontal: space[4], borderWidth: 1, borderColor: theme.statusDanger, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  confirmDestructiveText: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDanger },
});
