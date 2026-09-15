import React, { useMemo, useState, useCallback } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, ChevronDown, Folder, Search, X } from 'lucide-react-native';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useGetCategories, useCreateCategory, useGetCategoryById, useUpdateCategory } from '../api/categories';
import { useUser } from '../contexts/UserContext';
import Toast from '../components/Toast';
import Dialog from '../components/Dialog';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { styles } from './AddCategoryScreen.styles';
import { theme } from '../theme/tokens';

const DESCRIPTION_LIMIT = 280;

type FormState = {
  name: string;
  parentId: string | null;
  status: 'active' | 'inactive';
  description: string;
};

const initialState: FormState = { name: '', parentId: null, status: 'active', description: '' };

type AddCategoryScreenProps = {
  onBack?: () => void;
  route?: { params?: { categoryId?: string } };
};

export default function AddCategoryScreen({ onBack = () => {}, route }: AddCategoryScreenProps) {
  const categoryId = route?.params?.categoryId;
  const isEditMode = !!categoryId;

  console.log('[AddCategoryScreen] Screen mounted/updated - categoryId:', categoryId, 'isEditMode:', isEditMode);

  const [form, setForm] = useState<FormState>(initialState);
  const [nameError, setNameError] = useState<string | null>(null);
  const [parentSheetOpen, setParentSheetOpen] = useState(false);
  const [parentSearch, setParentSearch] = useState('');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('error');

  const { data: categoriesData, isLoading: categoriesLoading, refetch } = useGetCategories();
  const { data: categoryData, isLoading: categoryLoading, error: categoryError } = useGetCategoryById(categoryId || '');
  const { mutateAsync: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutateAsync: updateCategory, isPending: isUpdating } = useUpdateCategory();
  const { getCurrentOrganisation, getCurrentBranch } = useUser();

  console.log('[AddCategoryScreen] useGetCategoryById state:', { categoryId, isLoading: categoryLoading, hasData: !!categoryData, error: categoryError?.message });
  console.log('[AddCategoryScreen] useGetCategories state:', { isLoading: categoriesLoading, itemCount: categoriesData?.items?.length ?? 0 });

  // Prefill form when in edit mode
  React.useEffect(() => {
    if (isEditMode && categoryData) {
      setForm({
        name: categoryData.name,
        parentId: categoryData.parent_id,
        status: categoryData.is_active ? 'active' : 'inactive',
        description: categoryData.description,
      });
    } else if (!isEditMode) {
      setForm(initialState);
    }
  }, [categoryId, isEditMode, categoryData]);

  // Refetch categories when screen is focused
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Filter for all active categories that can be parents
  const eligibleParents = useMemo(() => {
    const categories = categoriesData?.items ?? [];
    return categories
      .filter((cat) => cat.is_active)
      .map((cat) => ({ id: cat.id, code: cat.category_code, name: cat.name }));
  }, [categoriesData]);

  // Get all category names for duplicate check
  const existingCategoryNames = useMemo(() => {
    const categories = categoriesData?.items ?? [];
    return categories.map((cat) => cat.name);
  }, [categoriesData]);

  const isDirty = form.name !== '' || form.parentId !== null || form.status !== 'active' || form.description !== '';
  const overLimit = form.description.length > DESCRIPTION_LIMIT;
  const parentName = eligibleParents.find((p) => p.id === form.parentId)?.name ?? null;

  const filteredParents = useMemo(
    () => eligibleParents.filter((p) => p.name.toLowerCase().includes(parentSearch.toLowerCase())),
    [eligibleParents, parentSearch]
  );

  const validateName = (value: string): string | null => {
    if (!value.trim()) return 'Category name is required';
    const trimmedValue = value.trim().toLowerCase();
    const dup = existingCategoryNames.some((n) => {
      if (isEditMode && categoryData && n.toLowerCase() === categoryData.name.toLowerCase()) {
        return false; // Skip the current category when editing
      }
      return n.toLowerCase() === trimmedValue;
    });
    if (dup) return 'A category with this name already exists';
    return null;
  };

  const handleSave = async () => {
    const err = validateName(form.name);
    setNameError(err);
    if (err || overLimit) return;

    const isSaving = isCreating || isUpdating;

    try {
      if (isEditMode && categoryData) {
        console.log('[AddCategoryScreen] Updating category...');
        await updateCategory({
          categoryId: categoryData.id,
          name: form.name,
          description: form.description,
          is_active: form.status === 'active',
          parent_id: form.parentId ?? '',
        });
        setToastType('success');
        setToastMessage('Category updated successfully');
      } else {
        const currentOrg = getCurrentOrganisation();
        const currentBranch = getCurrentBranch();

        if (!currentOrg || !currentBranch) {
          setToastType('error');
          setToastMessage('No organisation or branch selected');
          setToastVisible(true);
          return;
        }

        console.log('[AddCategoryScreen] Creating category...');
        await createCategory({
          organisation_id: currentOrg.id,
          branch_id: currentBranch.id,
          name: form.name,
          description: form.description,
          is_active: form.status === 'active',
          parent_id: form.parentId ?? '',
        });
        setToastType('success');
        setToastMessage('Category created successfully');
      }

      setToastVisible(true);

      // Refetch categories and navigate back
      await refetch();
      setTimeout(() => onBack(), 1500);
    } catch (err: any) {
      console.error('[AddCategoryScreen] Failed to save category:', err);
      const message = err?.data?.detail || err?.data?.message || err?.message || 'Failed to save category';
      setToastType('error');
      setToastMessage(message);
      setToastVisible(true);
    }
  };

  const handleCancel = () => {
    if (isDirty) setShowDiscardConfirm(true);
    else onBack();
  };

  const handleReset = () => {
    setForm(initialState);
    setNameError(null);
  };;

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={handleCancel}>
          <X size={20} color={theme.textPrimary} strokeWidth={1.75} />
        </Pressable>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Category' : 'Add Category'}</Text>
      </View>

      {isEditMode && categoryLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.brandDefault} />
        </View>
      ) : null}

      <ScrollView style={[styles.flex, (isEditMode && categoryLoading) && { display: 'none' }]} contentContainerStyle={styles.scrollContent}>
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
        <Pressable style={styles.saveButton} onPress={handleSave} disabled={isCreating || isUpdating}>
          <Text style={styles.saveButtonText}>{isCreating || isUpdating ? 'Saving...' : isEditMode ? 'Update category' : 'Save category'}</Text>
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
              {categoriesLoading ? (
                <View style={styles.sheetLoadingState}>
                  <ActivityIndicator size="small" color={theme.brandDefault} />
                </View>
              ) : (
                <>
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
                      <Text style={styles.emptySubtitle}>Only active categories can be a parent</Text>
                    </View>
                  ) : null}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Dialog
        visible={showDiscardConfirm}
        title="Discard this category?"
        description="The details you entered will be lost."
        onDismiss={() => setShowDiscardConfirm(false)}
        buttons={[
          { label: 'Keep editing', onPress: () => setShowDiscardConfirm(false), type: 'cancel' },
          { label: 'Discard', onPress: () => { setShowDiscardConfirm(false); onBack(); }, type: 'destructive' },
        ]}
      />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}
