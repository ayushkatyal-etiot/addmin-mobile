import { useMemo, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  Folder,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
  X,
} from 'lucide-react-native';

import { useGetCategories, useDeleteCategory } from '../api/categories';
import type { Category } from '../types/category';
import Toast from '../components/Toast';
import { styles } from './CategoriesScreen.styles';
import { theme, space } from '../theme/tokens';

type SortKey = 'nameAsc' | 'nameDesc' | 'recentlyCreated' | 'recentlyUpdated' | 'codeAsc';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'nameAsc', label: 'Name — A to Z' },
  { key: 'nameDesc', label: 'Name — Z to A' },
  { key: 'recentlyCreated', label: 'Recently created' },
  { key: 'recentlyUpdated', label: 'Recently updated' },
  { key: 'codeAsc', label: 'Category code — ascending' },
];

function sortCategories(list: Category[], sortKey: SortKey): Category[] {
  const sorted = [...list];
  switch (sortKey) {
    case 'nameAsc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'nameDesc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'codeAsc':
      return sorted.sort((a, b) => a.category_code.localeCompare(b.category_code));
    case 'recentlyCreated':
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case 'recentlyUpdated':
      return sorted.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    default:
      return sorted;
  }
}

export default function CategoriesScreen({
  onBack,
  onAddCategory,
}: {
  onBack: () => void;
  onAddCategory: (categoryId?: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('nameAsc');
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('error');

  const { data, isLoading, refetch, error } = useGetCategories();
  const { mutateAsync: deleteCategory, isPending: isDeleting } = useDeleteCategory();

  console.log('[CategoriesScreen] Query state:', { isLoading, data: data?.items?.length ?? 0, error: error?.message });

  // Refetch categories when screen is focused
  useFocusEffect(
    useCallback(() => {
      console.log('[CategoriesScreen] Screen focused, refetching...');
      refetch();
    }, [refetch])
  );

  const allCategories = useMemo(() => {
    const items = data?.items ?? [];
    console.log('[CategoriesScreen] All categories:', items.length);
    return items;
  }, [data]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    allCategories.forEach((cat) => {
      map.set(cat.id, cat.name);
    });
    return map;
  }, [allCategories]);

  const filtered = useMemo(() => {
    const byFilter =
      filter === 'all'
        ? allCategories
        : allCategories.filter((c) => (filter === 'active' ? c.is_active : !c.is_active));
    const q = query.trim().toLowerCase();
    const byQuery = q
      ? byFilter.filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.category_code.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q)
        )
      : byFilter;
    return sortCategories(byQuery, sortKey);
  }, [allCategories, filter, query, sortKey]);

  const isSearching = query.trim().length > 0;
  const isEmpty = filtered.length === 0;
  const isInitialLoading = isLoading;

  const handleDeletePress = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      setDeleteDialogVisible(false);
      await deleteCategory(categoryToDelete.id);
      setExpandedId(null);
      setToastType('success');
      setToastMessage('Category deleted successfully');
      setToastVisible(true);
      await refetch();
    } catch (err: any) {
      console.log('[CategoriesScreen] Delete error:', err);
      const message = err?.data?.detail || err?.data?.message || err?.message || 'Failed to delete category';
      setToastType('error');
      setToastMessage(message);
      setToastVisible(true);
    }
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <ChevronLeft size={22} color={theme.textPrimary} strokeWidth={1.75} />
        </Pressable>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      {allCategories.length > 0 ? (
        <>
          <View style={[styles.searchRow, isInitialLoading && styles.searchRowDisabled]}>
            <View style={[styles.searchBar, isSearching && styles.searchBarActive, isInitialLoading && styles.searchBarDisabled]}>
              <Search size={18} color={isInitialLoading ? theme.textTertiary : theme.textTertiary} strokeWidth={1.75} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search categories"
                placeholderTextColor={theme.textTertiary}
                editable={!isInitialLoading}
              />
              {isSearching && !isInitialLoading ? (
                <Pressable onPress={() => setQuery('')} hitSlop={8}>
                  <X size={16} color={theme.textTertiary} strokeWidth={2} />
                </Pressable>
              ) : null}
            </View>
            <Pressable
              style={[styles.sortButton, isInitialLoading && styles.sortButtonDisabled]}
              onPress={() => setSortSheetOpen(true)}
              disabled={isInitialLoading}
            >
              <ArrowUpDown size={18} color={isInitialLoading ? theme.textTertiary : theme.textSecondary} strokeWidth={1.75} />
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipRow}
            contentContainerStyle={styles.chipRowContent}
            scrollEnabled={!isInitialLoading}
          >
            {(
              [
                { key: 'all', label: 'All' },
                { key: 'active', label: 'Active' },
                { key: 'inactive', label: 'Inactive' },
              ] as const
            ).map((chip) => {
              const active = filter === chip.key;
              return (
                <Pressable
                  key={chip.key}
                  style={[styles.chip, active && styles.chipActive, isInitialLoading && styles.chipDisabled]}
                  onPress={() => setFilter(chip.key)}
                  disabled={isInitialLoading}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive, isInitialLoading && styles.chipTextDisabled]}>{chip.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      ) : null}

      <View style={styles.contentContainer}>
        {isInitialLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={theme.brandDefault} />
          </View>
        ) : isEmpty ? (
          <View style={styles.emptyState}>
            {isSearching ? (
              <>
                <Search size={36} color={theme.textTertiary} strokeWidth={1.75} />
                <Text style={styles.emptyTitle}>No categories match "{query.trim()}"</Text>
                <Text style={styles.emptySubtitle}>Try a different name, ID, or description</Text>
              </>
            ) : (
              <>
                <Folder size={40} color={theme.textTertiary} strokeWidth={1.75} />
                <Text style={[styles.emptyTitle, styles.emptyTitleLg]}>Nothing here yet</Text>
                <Text style={styles.emptySubtitle}>No expense categories have been created — tap + to add the first one</Text>
              </>
            )}
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={{ height: space[3] }} />}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                parentName={item.parent_id ? categoryMap.get(item.parent_id) : undefined}
                expanded={expandedId === item.id}
                onToggle={() => setExpandedId((current) => (current === item.id ? null : item.id))}
                onEdit={() => onAddCategory(item.id)}
                onDelete={() => handleDeletePress(item)}
              />
            )}
          />
        )}
      </View>

      <Pressable style={[styles.fab, { bottom: insets.bottom + space[6] }]} onPress={() => onAddCategory()}>
        <Plus size={24} color={theme.textOnBrand} strokeWidth={2.25} />
      </Pressable>

      <SortSheet
        visible={sortSheetOpen}
        selected={sortKey}
        onSelect={(key) => {
          setSortKey(key);
          setSortSheetOpen(false);
        }}
        onClose={() => setSortSheetOpen(false)}
      />

      <Modal visible={deleteDialogVisible} transparent animationType="fade" onRequestClose={() => setDeleteDialogVisible(false)}>
        <Pressable style={styles.dialogOverlay} onPress={() => setDeleteDialogVisible(false)}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>Delete category?</Text>
            <Text style={styles.dialogMessage}>This action cannot be undone.</Text>
            <View style={styles.dialogButtonRow}>
              <Pressable
                style={[styles.dialogButton, styles.dialogButtonCancel]}
                onPress={() => setDeleteDialogVisible(false)}
                disabled={isDeleting}
              >
                <Text style={styles.dialogButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.dialogButton, styles.dialogButtonDelete]}
                onPress={handleDeleteConfirm}
                disabled={isDeleting}
              >
                <Text style={[styles.dialogButtonText, styles.dialogButtonDeleteText]}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
}

function CategoryCard({
  category,
  parentName,
  expanded,
  onToggle,
  onEdit,
  onDelete,
}: {
  category: Category;
  parentName?: string;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  return (
    <View style={styles.card}>
      <Pressable onPress={onToggle}>
        {parentName ? <Text style={styles.breadcrumb}>{parentName} ›</Text> : null}
        <View style={styles.cardTopRow}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{category.name}</Text>
            <Text style={styles.cardCode}>{category.category_code}</Text>
          </View>
          <ChevronDown
            size={18}
            color={theme.textTertiary}
            strokeWidth={2}
            style={expanded ? styles.chevronUp : undefined}
          />
        </View>
        <Text style={styles.cardDescription} numberOfLines={expanded ? undefined : 1}>
          {category.description}
        </Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, category.is_active ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
            <Text style={[styles.statusBadgeText, { color: category.is_active ? theme.statusSuccessStrong : theme.statusDangerStrong }]}>
              {category.is_active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.details}>
          <View>
            <Text style={styles.detailLabel}>Full code</Text>
            <Text style={styles.detailValue}>{category.full_code}</Text>
          </View>
          <View style={[styles.detailGrid, styles.detailSpacingTop]}>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Created at</Text>
              <Text style={styles.detailValue}>{formatDate(category.created_at)}</Text>
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Updated at</Text>
              <Text style={styles.detailValue}>{formatDate(category.updated_at)}</Text>
            </View>
          </View>
          <View style={styles.actionRow}>
            <Pressable style={styles.actionButton} onPress={onEdit}>
              <Pencil size={14} color={theme.textPrimary} strokeWidth={1.75} />
              <Text style={styles.actionButtonText}>Edit</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={onDelete}>
              <Trash2 size={14} color={theme.statusDanger} strokeWidth={1.75} />
              <Text style={[styles.actionButtonText, styles.actionButtonDangerText]}>Delete</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function SortSheet({
  visible, selected, onSelect, onClose,
}: {
  visible: boolean;
  selected: SortKey;
  onSelect: (key: SortKey) => void;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandleRow}>
            <View style={styles.sheetHandle} />
          </View>
          <View style={styles.sheetTitleRow}>
            <Text style={styles.sheetTitle}>Sort by</Text>
            <Pressable style={styles.sheetCloseButton} onPress={onClose}>
              <X size={16} color={theme.textSecondary} strokeWidth={2} />
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: space[5], paddingBottom: Math.max(insets.bottom, space[5]) }}>
            {SORT_OPTIONS.map((opt, index) => (
              <Pressable
                key={opt.key}
                style={[styles.sortRow, index < SORT_OPTIONS.length - 1 && styles.sortRowDivider]}
                onPress={() => onSelect(opt.key)}
              >
                <Text style={[styles.sortRowText, selected === opt.key && styles.sortRowTextActive]}>{opt.label}</Text>
                {selected === opt.key ? <Check size={18} color={theme.brandDefault} strokeWidth={2.5} /> : null}
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}
