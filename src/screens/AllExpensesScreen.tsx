import { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  Download,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react-native';

import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { useGetExpenses, useGetVendors, useGetExpenseCategories, useGetDepartments, useDeleteExpense } from '../api/expenses';
import { mapExpenseFromApi, type MappedExpense } from '../utils/mapExpenseFormData';
import Toast from '../components/Toast';
import { styles } from './AllExpensesScreen.styles';
import { theme, space, colors } from '../theme/tokens';

type Status = 'approved' | 'pending' | 'rejected' | 'draft' | 'paid';
type Expense = MappedExpense;

const STATUS_CONFIG: Record<Status, { label: string; bg: string; color: string; locked: boolean }> = {
  approved: { label: 'Approved', bg: theme.statusSuccessBg, color: theme.statusSuccessStrong, locked: true },
  pending: { label: 'Pending approval', bg: theme.statusWarningBg, color: theme.statusWarningStrong, locked: false },
  rejected: { label: 'Rejected', bg: theme.statusDangerBg, color: theme.statusDangerStrong, locked: false },
  draft: { label: 'Draft', bg: colors.slate50, color: colors.slate600, locked: false },
  paid: { label: 'Paid', bg: theme.brandSubtle, color: theme.brandActive, locked: true },
};

const FILTER_CHIPS: { key: 'all' | Status; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'pending', label: 'Pending' },
  { key: 'rejected', label: 'Rejected' },
];


type SortKey = 'expenseDateDesc' | 'expenseDateAsc' | 'dueDateAsc' | 'dueDateDesc' | 'amountDesc' | 'amountAsc';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'expenseDateDesc', label: 'Expense date — newest first' },
  { key: 'expenseDateAsc', label: 'Expense date — oldest first' },
  { key: 'dueDateAsc', label: 'Due date — soonest first' },
  { key: 'dueDateDesc', label: 'Due date — latest first' },
  { key: 'amountDesc', label: 'Amount — highest first' },
  { key: 'amountAsc', label: 'Amount — lowest first' },
];

// Mock data has no real Date values, so date-based sorts fall back to list order.
function sortExpenses(list: Expense[], sortKey: SortKey): Expense[] {
  const sorted = [...list];
  switch (sortKey) {
    case 'amountDesc':
      return sorted.sort((a, b) => b.amount - a.amount);
    case 'amountAsc':
      return sorted.sort((a, b) => a.amount - b.amount);
    default:
      return sorted;
  }
}

export default function AllExpensesScreen({
  onBack,
  onAddExpense,
}: {
  onBack: () => void;
  onAddExpense: () => void;
}) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const { user } = useUser();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('expenseDateDesc');
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [attachmentsFor, setAttachmentsFor] = useState<Expense | null>(null);

  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const { mutateAsync: deleteExpense, isPending: isDeleting } = useDeleteExpense();

  const orgId = user?.current_context.organisation_id || null;
  const branchId = user?.current_context.branch_id || null;

  // Reset page and expenses when org/branch changes
  useEffect(() => {
    console.log('[AllExpensesScreen] Org/branch changed:', { orgId, branchId });
    setAllExpenses([]);
    setPage(0);
    setHasMore(true);
  }, [orgId, branchId]);

  // Fetch vendors, categories, and departments
  const { data: vendorsData } = useGetVendors();
  const { data: categoriesData } = useGetExpenseCategories();
  const { data: departmentsData } = useGetDepartments();

  // Fetch expenses for current page
  const { data: expensesData, isLoading: isLoadingExpenses, isError } = useGetExpenses(
    orgId || '',
    branchId || '',
    page * 20,
    20
  );

  // Process incoming expense data
  useEffect(() => {
    if (!expensesData || !vendorsData || !categoriesData || !departmentsData) {
      console.log('[AllExpensesScreen] Waiting for data:', {
        hasExpenses: !!expensesData,
        hasVendors: !!vendorsData,
        hasCategories: !!categoriesData,
        hasDepartments: !!departmentsData,
      });
      return;
    }

    console.log('[AllExpensesScreen] Processing expenses:', {
      expensesCount: expensesData.items.length,
      vendorsCount: vendorsData.items.length,
      categoriesCount: categoriesData.items.length,
      departmentsCount: departmentsData.items.length,
    });

    const vendorsMap = new Map<string, { id: string; name: string }>();
    const categoriesMap = new Map<string, { id: string; name: string }>();
    const departmentsMap = new Map<string, { id: string; name: string }>();

    vendorsData.items.forEach((v) => vendorsMap.set(v.id, { id: v.id, name: v.name }));
    categoriesData.items.forEach((c) => categoriesMap.set(c.id, { id: c.id, name: c.name }));
    departmentsData.items.forEach((d) => departmentsMap.set(d.id, { id: d.id, name: d.name }));

    const mapped = expensesData.items.map((item) =>
      mapExpenseFromApi(item, categoriesMap, vendorsMap, departmentsMap)
    );

    console.log('[AllExpensesScreen] Mapped expenses:', mapped.length);
    setAllExpenses((prev) => [...prev, ...mapped]);
    setLoadingMore(false);
    setHasMore(expensesData.items.length === 20);
  }, [expensesData, vendorsData, categoriesData, departmentsData]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !isLoadingExpenses) {
      console.log('[AllExpensesScreen] Loading more...');
      setLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  }, [loadingMore, hasMore, isLoadingExpenses]);

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    try {
      await deleteExpense(expenseToDelete.id);
      setAllExpenses((prev) => prev.filter((e) => e.id !== expenseToDelete.id));
      setDeleteDialogVisible(false);
      setExpenseToDelete(null);
      setToastMessage('Expense deleted successfully');
      setToastType('success');
      setToastVisible(true);
      // Invalidate expenses query to ensure fresh data
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });
    } catch (err: any) {
      const message = err?.data?.detail || err?.data?.message || err?.message || 'Failed to delete expense';
      setToastMessage(message);
      setToastType('error');
      setToastVisible(true);
      console.error('[AllExpensesScreen] Delete failed:', err);
    }
  };

  const filtered = useMemo(() => {
    const byFilter = filter === 'all' ? allExpenses : allExpenses.filter((e) => e.status === filter);
    const q = query.trim().toLowerCase();
    const byQuery = q
      ? byFilter.filter((e) => e.title.toLowerCase().includes(q) || e.vendor.toLowerCase().includes(q))
      : byFilter;
    return sortExpenses(byQuery, sortKey);
  }, [allExpenses, filter, query, sortKey]);

  const isSearching = query.trim().length > 0;
  const isEmpty = filtered.length === 0;
  const isInitialLoading = page === 0 && isLoadingExpenses && allExpenses.length === 0;

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <ChevronLeft size={22} color={theme.textPrimary} strokeWidth={1.75} />
        </Pressable>
        <Text style={styles.headerTitle}>All Expenses</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={[styles.searchBar, isSearching && styles.searchBarActive]}>
          <Search size={18} color={theme.textTertiary} strokeWidth={1.75} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search expenses"
            placeholderTextColor={theme.textTertiary}
          />
          {isSearching ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <X size={16} color={theme.textTertiary} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>
        <Pressable style={styles.sortButton} onPress={() => setSortSheetOpen(true)}>
          <ArrowUpDown size={18} color={theme.textSecondary} strokeWidth={1.75} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipRow}
        contentContainerStyle={styles.chipRowContent}
      >
        {FILTER_CHIPS.map((chip) => {
          const active = filter === chip.key;
          return (
            <Pressable
              key={chip.key}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilter(chip.key)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.contentContainer}>
        {isInitialLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={theme.brandDefault} />
            <Text style={styles.loadingText}>Loading expenses...</Text>
          </View>
        ) : isError || error ? (
          <View style={styles.errorState}>
            <AlertCircle size={40} color={theme.statusDanger} strokeWidth={1.75} />
            <Text style={styles.emptyTitle}>Something went wrong</Text>
            <Text style={styles.emptySubtitle}>{error || 'Failed to load expenses'}</Text>
          </View>
        ) : isEmpty ? (
          <View style={styles.emptyState}>
            {isSearching ? (
              <>
                <Search size={36} color={theme.textTertiary} strokeWidth={1.75} />
                <Text style={styles.emptyTitle}>No expenses match "{query.trim()}"</Text>
                <Text style={styles.emptySubtitle}>Try a different title, vendor, or invoice reference</Text>
              </>
            ) : (
              <>
                <FileText size={40} color={theme.textTertiary} strokeWidth={1.75} />
                <Text style={[styles.emptyTitle, styles.emptyTitleLg]}>Nothing here yet</Text>
                <Text style={styles.emptySubtitle}>No expenses have been recorded in this scope</Text>
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
              <ExpenseCard
                expense={item}
                expanded={expandedId === item.id}
                onToggle={() =>
                  setExpandedId((current) => (current === item.id ? null : item.id))
                }
                onOpenAttachments={() => setAttachmentsFor(item)}
                onDelete={() => {
                  setExpenseToDelete(item);
                  setDeleteDialogVisible(true);
                }}
              />
            )}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loadingMore && hasMore ? (
                <View style={styles.loadingMore}>
                  <ActivityIndicator size="small" color={theme.brandDefault} />
                </View>
              ) : null
            }
          />
        )}
      </View>

      <Pressable style={[styles.fab, { bottom: insets.bottom + space[6] }]} onPress={onAddExpense}>
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

      <AttachmentsSheet expense={attachmentsFor} onClose={() => setAttachmentsFor(null)} />

      <Modal visible={deleteDialogVisible} transparent animationType="fade" onRequestClose={() => setDeleteDialogVisible(false)}>
        <Pressable style={styles.dialogOverlay} onPress={() => setDeleteDialogVisible(false)}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>Delete expense?</Text>
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

function ExpenseCard({
  expense,
  expanded,
  onToggle,
  onOpenAttachments,
  onDelete,
}: {
  expense: Expense;
  expanded: boolean;
  onToggle: () => void;
  onOpenAttachments: () => void;
  onDelete: () => void;
}) {
  const status = STATUS_CONFIG[expense.status];

  return (
    <View style={styles.card}>
      <Pressable onPress={onToggle}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {expense.title}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{expense.category}</Text>
          </View>
        </View>
        <View style={styles.cardMidRow}>
          <Text style={styles.cardVendor} numberOfLines={1}>
            {expense.vendor}
          </Text>
          <View style={styles.cardAmountRow}>
            <Text style={styles.cardAmount}>{expense.amountLabel}</Text>
            <ChevronDown
              size={18}
              color={theme.textTertiary}
              strokeWidth={2}
              style={expanded ? styles.chevronUp : undefined}
            />
          </View>
        </View>
        <View style={styles.cardBottomRow}>
          <Text style={styles.cardDue}>{expense.dueLabel ?? 'Not submitted'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.details}>
          <View style={styles.detailGrid}>
            <DetailField label="Invoice ID" value={expense.invoiceId} />
            <DetailField label="Category" value={expense.categoryDetail} />
            <DetailField label="Expense date" value={expense.expenseDateLabel} />
            <DetailField label="Subcategory" value={expense.subcategory} />
            <DetailField label="Department" value={expense.department} />
          </View>
          <View style={styles.actionRow}>
            {!status.locked ? (
              <Pressable style={styles.actionButton}>
                <Pencil size={14} color={theme.textPrimary} strokeWidth={1.75} />
                <Text style={styles.actionButtonText}>Edit</Text>
              </Pressable>
            ) : null}
            <Pressable style={styles.actionButton} onPress={onOpenAttachments}>
              <Paperclip size={14} color={theme.textPrimary} strokeWidth={1.75} />
              <Text style={styles.actionButtonText}>Attachments</Text>
            </Pressable>
            {!status.locked ? (
              <Pressable style={styles.actionButton} onPress={onDelete}>
                <Trash2 size={14} color={theme.statusDanger} strokeWidth={1.75} />
                <Text style={[styles.actionButtonText, { color: theme.statusDanger }]}>Delete</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailField}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function SortSheet({
  visible,
  selected,
  onSelect,
  onClose,
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
                style={[
                  styles.sortRow,
                  index < SORT_OPTIONS.length - 1 && styles.sortRowDivider,
                ]}
                onPress={() => onSelect(opt.key)}
              >
                <Text
                  style={[styles.sortRowText, selected === opt.key && styles.sortRowTextActive]}
                >
                  {opt.label}
                </Text>
                {selected === opt.key ? (
                  <Check size={18} color={theme.brandDefault} strokeWidth={2.5} />
                ) : null}
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const ATTACHMENT_ICONS = {
  pdf: { Icon: FileText, bg: theme.statusDangerBg, color: theme.statusDangerStrong },
  image: { Icon: ImageIcon, bg: theme.statusInfoBg, color: theme.statusInfoStrong },
  sheet: { Icon: FileSpreadsheet, bg: theme.statusSuccessBg, color: theme.statusSuccessStrong },
} as const;

function AttachmentsSheet({ expense, onClose }: { expense: Expense | null; onClose: () => void }) {
  const visible = expense !== null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, styles.attachmentsSheet]}>
          <View style={styles.sheetHandleRow}>
            <View style={styles.sheetHandle} />
          </View>
          <View style={styles.sheetTitleRow}>
            <Text style={styles.sheetTitle}>Attachments ({expense?.attachments.length ?? 0})</Text>
            <Pressable style={styles.sheetCloseButton} onPress={onClose}>
              <X size={16} color={theme.textSecondary} strokeWidth={2} />
            </Pressable>
          </View>
          {expense && expense.attachments.length > 0 ? (
            <ScrollView contentContainerStyle={styles.attachmentsList}>
              {expense.attachments.map((file) => {
                const { Icon, bg, color } = ATTACHMENT_ICONS[file.kind];
                return (
                  <View key={file.name} style={styles.attachmentRow}>
                    <View style={[styles.attachmentIcon, { backgroundColor: bg }]}>
                      <Icon size={18} color={color} strokeWidth={1.75} />
                    </View>
                    <View style={styles.attachmentText}>
                      <Text style={styles.attachmentName} numberOfLines={1}>
                        {file.name}
                      </Text>
                      <Text style={styles.attachmentMeta}>
                        {file.size} · Uploaded {file.uploaded}
                      </Text>
                    </View>
                    <Pressable hitSlop={8}>
                      <Download size={18} color={theme.textSecondary} strokeWidth={1.75} />
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.attachmentsEmpty}>
              <Paperclip size={36} color={theme.textTertiary} strokeWidth={1.75} />
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptySubtitle}>No files have been attached to this expense</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
