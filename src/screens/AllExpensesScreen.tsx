import { useMemo, useState } from 'react';
import {
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
} from 'lucide-react-native';

import { colors, radius, space, theme } from '../theme/tokens';

type Status = 'approved' | 'pending' | 'rejected' | 'draft' | 'paid';

type Expense = {
  id: string;
  title: string;
  vendor: string;
  category: 'Opex' | 'Capex';
  amount: number;
  amountLabel: string;
  status: Status;
  dueLabel: string | null;
  expenseDateLabel: string;
  invoiceId: string;
  categoryDetail: string;
  subcategory: string;
  department: string;
  attachments: { name: string; size: string; uploaded: string; kind: 'pdf' | 'image' | 'sheet' }[];
};

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

const EXPENSES: Expense[] = [
  {
    id: 'exp-1',
    title: 'Team offsite catering',
    vendor: 'Priya Caterers',
    category: 'Opex',
    amount: 42000,
    amountLabel: '₹42,000',
    status: 'approved',
    dueLabel: 'Due Oct 25, 2026',
    expenseDateLabel: 'Oct 8, 2026',
    invoiceId: 'INV-8790',
    categoryDetail: 'Events',
    subcategory: 'Catering',
    department: 'HR',
    attachments: [],
  },
  {
    id: 'exp-2',
    title: 'Server hosting renewal',
    vendor: 'AWS India',
    category: 'Capex',
    amount: 1000001,
    amountLabel: '₹1,000,001',
    status: 'pending',
    dueLabel: 'Due Nov 2, 2026',
    expenseDateLabel: 'Oct 15, 2026',
    invoiceId: 'INV-8899',
    categoryDetail: 'Infrastructure',
    subcategory: 'Hosting',
    department: 'Engineering',
    attachments: [],
  },
  {
    id: 'exp-3',
    title: 'Client gift hampers',
    vendor: 'Corporate Gifts Co',
    category: 'Opex',
    amount: 8400,
    amountLabel: '₹8,400',
    status: 'rejected',
    dueLabel: 'Due Oct 18, 2026',
    expenseDateLabel: 'Oct 12, 2026',
    invoiceId: 'INV-8821',
    categoryDetail: 'Employee Engagement',
    subcategory: 'Gifting',
    department: 'Admin',
    attachments: [
      { name: 'Invoice_8821_final.pdf', size: '240 KB', uploaded: 'Oct 12, 2026', kind: 'pdf' },
      { name: 'Receipt_scan.jpg', size: '1.1 MB', uploaded: 'Oct 12, 2026', kind: 'image' },
      { name: 'Cost_breakdown.xlsx', size: '64 KB', uploaded: 'Oct 11, 2026', kind: 'sheet' },
    ],
  },
  {
    id: 'exp-4',
    title: 'Office chairs',
    vendor: 'Featherlite',
    category: 'Capex',
    amount: 56000,
    amountLabel: '₹56,000',
    status: 'draft',
    dueLabel: null,
    expenseDateLabel: 'Oct 20, 2026',
    invoiceId: 'Not generated',
    categoryDetail: 'Furniture',
    subcategory: 'Seating',
    department: 'Admin',
    attachments: [],
  },
  {
    id: 'exp-5',
    title: 'Electricity backup AMC',
    vendor: 'PowerCare Services',
    category: 'Opex',
    amount: 124500,
    amountLabel: '₹1,24,500',
    status: 'paid',
    dueLabel: 'Due Oct 10, 2026',
    expenseDateLabel: 'Sep 28, 2026',
    invoiceId: 'INV-8654',
    categoryDetail: 'Utilities',
    subcategory: 'AMC',
    department: 'Facilities',
    attachments: [],
  },
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
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('expenseDateDesc');
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [attachmentsFor, setAttachmentsFor] = useState<Expense | null>(null);
  const [expenses, setExpenses] = useState(EXPENSES);

  const filtered = useMemo(() => {
    const byFilter = filter === 'all' ? expenses : expenses.filter((e) => e.status === filter);
    const q = query.trim().toLowerCase();
    const byQuery = q
      ? byFilter.filter((e) => e.title.toLowerCase().includes(q) || e.vendor.toLowerCase().includes(q))
      : byFilter;
    return sortExpenses(byQuery, sortKey);
  }, [expenses, filter, query, sortKey]);

  const isSearching = query.trim().length > 0;
  const isEmpty = filtered.length === 0;

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
        {isEmpty ? (
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
                onDelete={() =>
                  setExpenses((current) => current.filter((e) => e.id !== item.id))
                }
              />
            )}
          />
        )}
      </View>

      <Pressable style={styles.fab} onPress={onAddExpense}>
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

const shadowFab = {
  shadowColor: '#080a0b',
  shadowOpacity: 0.1,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: theme.bgPage,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[6] - 10,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.textPrimary,
  },
  searchRow: {
    flexDirection: 'row',
    gap: space[2],
    marginTop: space[3],
    paddingHorizontal: space[6],
  },
  searchBar: {
    flex: 1,
    height: 44,
    paddingHorizontal: space[3],
    backgroundColor: theme.bgRaised,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  searchBarActive: {
    borderColor: theme.brandDefault,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Urbanist_400Regular',
    color: theme.textPrimary,
    padding: 0,
  },
  sortButton: {
    width: 44,
    height: 44,
    backgroundColor: theme.bgRaised,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    marginTop: space[3],
    flexGrow: 0,
  },
  chipRowContent: {
    gap: space[2],
    paddingHorizontal: space[6],
  },
  chip: {
    height: 28,
    paddingHorizontal: space[3],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    backgroundColor: theme.bgRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    borderColor: theme.brandDefault,
    backgroundColor: theme.brandSubtle,
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'Urbanist_500Medium',
    color: theme.textPrimary,
  },
  chipTextActive: {
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.brandActive,
  },
  contentContainer: { flex: 1 },
  listContent: {
    paddingHorizontal: space[6],
    paddingTop: space[4],
    paddingBottom: 112,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[6],
    gap: space[2],
  },
  emptyTitle: {
    fontSize: 14,
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.textPrimary,
    marginTop: space[2],
    textAlign: 'center',
  },
  emptyTitleLg: {
    fontSize: 15,
  },
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Urbanist_400Regular',
    color: theme.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.bgRaised,
    borderWidth: 1,
    borderColor: theme.borderSubtle,
    borderRadius: radius.lg,
    padding: space[4],
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
  },
  cardTitle: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.textPrimary,
  },
  categoryBadge: {
    height: 20,
    paddingHorizontal: space[2],
    borderRadius: radius.full,
    backgroundColor: colors.slate50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadgeText: {
    fontSize: 12,
    fontFamily: 'Urbanist_600SemiBold',
    color: colors.slate600,
  },
  cardMidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
    marginTop: space[1] + 2,
  },
  cardVendor: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Urbanist_400Regular',
    color: theme.textSecondary,
  },
  cardAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  cardAmount: {
    fontSize: 15,
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  chevronUp: {
    transform: [{ rotate: '180deg' }],
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space[3],
    marginTop: space[1] + 2,
  },
  cardDue: {
    fontSize: 13,
    fontFamily: 'Urbanist_400Regular',
    color: theme.textSecondary,
  },
  statusBadge: {
    height: 20,
    paddingHorizontal: space[2],
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: 'Urbanist_600SemiBold',
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: theme.borderSubtle,
    marginTop: space[3],
    paddingTop: space[3],
  },
  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space[3] + 4,
  },
  detailField: {
    width: '45%',
  },
  detailLabel: {
    fontSize: 12,
    fontFamily: 'Urbanist_500Medium',
    color: theme.textTertiary,
  },
  detailValue: {
    fontSize: 13,
    fontFamily: 'Urbanist_400Regular',
    color: theme.textPrimary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    gap: space[2],
    marginTop: space[4],
  },
  actionButton: {
    height: 32,
    paddingHorizontal: space[3],
    backgroundColor: theme.bgRaised,
    borderWidth: 1,
    borderColor: theme.borderDefault,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[1] + 2,
  },
  actionButtonText: {
    fontSize: 13,
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.textPrimary,
  },
  fab: {
    position: 'absolute',
    right: space[5],
    bottom: space[10],
    width: 56,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: theme.brandDefault,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowFab,
  },
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.bgOverlay,
  },
  sheet: {
    backgroundColor: theme.bgRaised,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  attachmentsSheet: {
    height: 480,
  },
  sheetHandleRow: {
    alignItems: 'center',
    paddingTop: space[3],
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: theme.borderStrong,
  },
  sheetTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[5],
    paddingTop: space[4],
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.textPrimary,
  },
  sheetCloseButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: theme.bgSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: space[3] + 2,
    minHeight: 44,
  },
  sortRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.borderSubtle,
  },
  sortRowText: {
    fontSize: 15,
    fontFamily: 'Urbanist_400Regular',
    color: theme.textPrimary,
  },
  sortRowTextActive: {
    fontFamily: 'Urbanist_600SemiBold',
  },
  attachmentsList: {
    paddingHorizontal: space[5],
    paddingTop: space[3],
    paddingBottom: space[5],
    gap: space[2],
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
  },
  attachmentIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachmentText: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 15,
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.textPrimary,
  },
  attachmentMeta: {
    fontSize: 12,
    fontFamily: 'Urbanist_400Regular',
    color: theme.textSecondary,
    marginTop: 2,
  },
  attachmentsEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space[6],
    gap: space[2],
  },
});
