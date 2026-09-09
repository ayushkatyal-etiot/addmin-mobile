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
  Folder,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
  X,
} from 'lucide-react-native';

import { radius, space, theme } from '../theme/tokens';

type Category = {
  id: string;
  code: string;
  name: string;
  description: string;
  fullDescription: string;
  active: boolean;
  parent: string | null;
  createdAt: string;
  updatedAt: string;
  inUseCount: number;
};

const CATEGORIES: Category[] = [
  {
    id: 'cat-1', code: 'CAT-001', name: 'Utility',
    description: 'Electricity, water, gas and other utility bills',
    fullDescription: 'All recurring and one-time utility connections billed per office, including electricity, water, gas, internet and telephone.',
    active: true, parent: null, createdAt: '02/01/2024', updatedAt: '10/03/2026', inUseCount: 24,
  },
  {
    id: 'cat-2', code: 'CAT-002', name: 'Rent & Lease',
    description: 'Office and warehouse rent, lease renewals',
    fullDescription: 'Covers rent, common area maintenance charges and lease renewal costs across all office and warehouse properties held under the tenant.',
    active: true, parent: null, createdAt: '02/01/2024', updatedAt: '14/06/2026', inUseCount: 0,
  },
  {
    id: 'cat-3', code: 'CAT-003', name: 'Maintenance',
    description: 'Repairs, AMC contracts and upkeep',
    fullDescription: 'Repair work orders, annual maintenance contracts and general upkeep across offices and warehouses.',
    active: true, parent: null, createdAt: '02/01/2024', updatedAt: '12/02/2026', inUseCount: 0,
  },
  {
    id: 'cat-4', code: 'CAT-004', name: 'Office Supplies',
    description: 'Stationery, pantry and consumables',
    fullDescription: 'Day-to-day stationery, pantry supplies and general office consumables purchased for daily operations.',
    active: true, parent: null, createdAt: '02/01/2024', updatedAt: '05/01/2026', inUseCount: 0,
  },
  {
    id: 'cat-5', code: 'CAT-005', name: 'Electricity',
    description: 'Electricity connection bills across all offices',
    fullDescription: 'Electricity connection bills across all offices',
    active: true, parent: 'Utility', createdAt: '02/01/2024', updatedAt: '10/03/2026', inUseCount: 0,
  },
  {
    id: 'cat-11', code: 'CAT-011', name: 'Pantry & Refreshments',
    description: 'Tea, coffee and snacks for the office pantry',
    fullDescription: 'Merged into Office Supplies in 2026; retained for historical expenses only.',
    active: false, parent: 'Office Supplies', createdAt: '18/09/2023', updatedAt: '02/02/2026', inUseCount: 0,
  },
];

type SortKey = 'nameAsc' | 'nameDesc' | 'recentlyCreated' | 'recentlyUpdated' | 'idAsc';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'nameAsc', label: 'Name — A to Z' },
  { key: 'nameDesc', label: 'Name — Z to A' },
  { key: 'recentlyCreated', label: 'Recently created' },
  { key: 'recentlyUpdated', label: 'Recently updated' },
  { key: 'idAsc', label: 'Category ID — ascending' },
];

function sortCategories(list: Category[], sortKey: SortKey): Category[] {
  const sorted = [...list];
  switch (sortKey) {
    case 'nameAsc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'nameDesc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'idAsc':
      return sorted.sort((a, b) => a.code.localeCompare(b.code));
    default:
      return sorted;
  }
}

export default function CategoriesScreen({
  onBack,
  onAddCategory,
}: {
  onBack: () => void;
  onAddCategory: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('nameAsc');
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [categories, setCategories] = useState(CATEGORIES);

  const filtered = useMemo(() => {
    const byFilter =
      filter === 'all' ? categories : categories.filter((c) => (filter === 'active' ? c.active : !c.active));
    const q = query.trim().toLowerCase();
    const byQuery = q
      ? byFilter.filter(
          (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
        )
      : byFilter;
    return sortCategories(byQuery, sortKey);
  }, [categories, filter, query, sortKey]);

  const isSearching = query.trim().length > 0;
  const isEmpty = filtered.length === 0;
  const noCategoriesAtAll = categories.length === 0;

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <ChevronLeft size={22} color={theme.textPrimary} strokeWidth={1.75} />
        </Pressable>
        <Text style={styles.headerTitle}>Categories</Text>
      </View>

      {!noCategoriesAtAll ? (
        <>
          <View style={styles.searchRow}>
            <View style={[styles.searchBar, isSearching && styles.searchBarActive]}>
              <Search size={18} color={theme.textTertiary} strokeWidth={1.75} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search categories"
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
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setFilter(chip.key)}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      ) : null}

      <View style={styles.contentContainer}>
        {isEmpty ? (
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
                expanded={expandedId === item.id}
                onToggle={() => setExpandedId((current) => (current === item.id ? null : item.id))}
                onToggleActive={() =>
                  setCategories((current) =>
                    current.map((c) => (c.id === item.id ? { ...c, active: !c.active } : c))
                  )
                }
                onDelete={() => setCategories((current) => current.filter((c) => c.id !== item.id))}
              />
            )}
          />
        )}
      </View>

      <Pressable style={[styles.fab, { bottom: insets.bottom + space[6] }]} onPress={onAddCategory}>
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
    </SafeAreaView>
  );
}

function CategoryCard({
  category, expanded, onToggle, onToggleActive, onDelete,
}: {
  category: Category;
  expanded: boolean;
  onToggle: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}) {
  const canDelete = category.inUseCount === 0;

  return (
    <View style={styles.card}>
      <Pressable onPress={onToggle}>
        {category.parent ? <Text style={styles.breadcrumb}>{category.parent} ›</Text> : null}
        <View style={styles.cardTopRow}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{category.name}</Text>
            <Text style={styles.cardCode}>{category.code}</Text>
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
          <View style={[styles.statusBadge, category.active ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
            <Text style={[styles.statusBadgeText, { color: category.active ? theme.statusSuccessStrong : theme.statusDangerStrong }]}>
              {category.active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.details}>
          <View>
            <Text style={styles.detailLabel}>Full description</Text>
            <Text style={styles.detailFullDescription}>{category.fullDescription}</Text>
          </View>
          <View style={styles.detailSpacingTop}>
            <Text style={styles.detailLabel}>Parent category</Text>
            <Text style={styles.detailValue}>{category.parent ?? '—'}</Text>
          </View>
          <View style={[styles.detailGrid, styles.detailSpacingTop]}>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Created at</Text>
              <Text style={styles.detailValue}>{category.createdAt}</Text>
            </View>
            <View style={styles.detailField}>
              <Text style={styles.detailLabel}>Updated at</Text>
              <Text style={styles.detailValue}>{category.updatedAt}</Text>
            </View>
          </View>
          <View style={styles.actionRow}>
            <Pressable style={styles.actionButton}>
              <Pencil size={14} color={theme.textPrimary} strokeWidth={1.75} />
              <Text style={styles.actionButtonText}>Edit</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={onToggleActive}>
              <Power size={14} color={theme.textPrimary} strokeWidth={1.75} />
              <Text style={styles.actionButtonText}>{category.active ? 'Deactivate' : 'Activate'}</Text>
            </Pressable>
            {canDelete ? (
              <Pressable style={styles.actionButton} onPress={onDelete}>
                <Trash2 size={14} color={theme.statusDanger} strokeWidth={1.75} />
                <Text style={[styles.actionButtonText, { color: theme.statusDanger }]}>Delete</Text>
              </Pressable>
            ) : null}
          </View>
          {!canDelete ? (
            <Text style={styles.inUseText}>In use by {category.inUseCount} expenses — deactivate instead.</Text>
          ) : null}
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

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.bgPage },
  header: { flexDirection: 'row', alignItems: 'center', gap: space[2], paddingHorizontal: space[6] - 10 },
  backButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },

  searchRow: { flexDirection: 'row', gap: space[2], marginTop: space[3], paddingHorizontal: space[6] },
  searchBar: {
    flex: 1, height: 44, paddingHorizontal: space[3], backgroundColor: theme.bgRaised,
    borderWidth: 1, borderColor: theme.borderDefault, borderRadius: radius.md,
    flexDirection: 'row', alignItems: 'center', gap: space[2],
  },
  searchBarActive: { borderColor: theme.brandDefault },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, padding: 0 },
  sortButton: {
    width: 44, height: 44, backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderDefault,
    borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
  },

  chipRow: { marginTop: space[3], marginBottom: space[3], flexGrow: 0 },
  chipRowContent: { gap: space[2], paddingHorizontal: space[6] },
  chip: {
    height: 28, paddingHorizontal: space[3], borderRadius: radius.full, borderWidth: 1,
    borderColor: theme.borderDefault, backgroundColor: theme.bgRaised, alignItems: 'center', justifyContent: 'center',
  },
  chipActive: { borderColor: theme.brandDefault, backgroundColor: theme.brandSubtle },
  chipText: { fontSize: 13, fontFamily: 'Urbanist_500Medium', color: theme.textPrimary },
  chipTextActive: { fontFamily: 'Urbanist_600SemiBold', color: theme.brandActive },

  contentContainer: { flex: 1 },
  listContent: { paddingHorizontal: space[6], paddingTop: space[4], paddingBottom: 112 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space[6], gap: space[2] },
  emptyTitle: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary, marginTop: space[2], textAlign: 'center' },
  emptyTitleLg: { fontSize: 15 },
  emptySubtitle: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, textAlign: 'center' },

  card: { backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderSubtle, borderRadius: radius.lg, padding: space[4] },
  breadcrumb: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginBottom: 2 },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3] },
  cardTitleRow: { flexDirection: 'row', alignItems: 'baseline', gap: space[2], flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary, flexShrink: 1 },
  cardCode: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, fontVariant: ['tabular-nums'] },
  chevronUp: { transform: [{ rotate: '180deg' }] },
  cardDescription: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: space[1] },
  statusRow: { marginTop: space[2] },
  statusBadge: { height: 20, paddingHorizontal: space[2], borderRadius: radius.full, alignSelf: 'flex-start', alignItems: 'center', justifyContent: 'center' },
  statusBadgeActive: { backgroundColor: theme.statusSuccessBg },
  statusBadgeInactive: { backgroundColor: theme.statusDangerBg },
  statusBadgeText: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold' },

  details: { borderTopWidth: 1, borderTopColor: theme.borderSubtle, marginTop: space[3], paddingTop: space[3] },
  detailSpacingTop: { marginTop: space[3] },
  detailLabel: { fontSize: 12, fontFamily: 'Urbanist_500Medium', color: theme.textTertiary },
  detailValue: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, marginTop: 2 },
  detailFullDescription: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, marginTop: 2, lineHeight: 18 },
  detailGrid: { flexDirection: 'row', gap: space[3] },
  detailField: { flex: 1 },

  actionRow: { flexDirection: 'row', gap: space[2], marginTop: space[4] },
  actionButton: {
    height: 32, paddingHorizontal: space[3], backgroundColor: theme.bgRaised, borderWidth: 1,
    borderColor: theme.borderDefault, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: space[1] + 2,
  },
  actionButtonText: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  inUseText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: space[2] },

  fab: {
    position: 'absolute', right: space[5], width: 56, height: 56, borderRadius: radius.xl,
    backgroundColor: theme.brandDefault, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#080a0b', shadowOpacity: 0.1, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 4,
  },

  sheetRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: theme.bgOverlay },
  sheet: { backgroundColor: theme.bgRaised, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  sheetHandleRow: { alignItems: 'center', paddingTop: space[3] },
  sheetHandle: { width: 36, height: 4, borderRadius: radius.full, backgroundColor: theme.borderStrong },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space[5], paddingTop: space[4] },
  sheetTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  sheetCloseButton: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: theme.bgSunken, alignItems: 'center', justifyContent: 'center' },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: space[3] + 2, minHeight: 44 },
  sortRowDivider: { borderBottomWidth: 1, borderBottomColor: theme.borderSubtle },
  sortRowText: { fontSize: 15, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary },
  sortRowTextActive: { fontFamily: 'Urbanist_600SemiBold' },
});
