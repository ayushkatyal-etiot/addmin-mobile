import { useMemo, useState } from 'react';
import {
  FlatList,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  Copy,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Truck,
  X,
} from 'lucide-react-native';

import { radius, space, theme } from '../theme/tokens';

type Vendor = {
  id: string;
  code: string;
  name: string;
  city: string;
  active: boolean;
  email: string;
  phone: string;
  gstNumber: string | null;
  createdAt: string;
  inUseCount: number;
};

const VENDORS: Vendor[] = [
  {
    id: 'vnd-1', code: 'VND-001', name: 'Sharma Facility Services', city: 'Mumbai', active: true,
    email: 'contact@sharmafacility.in', phone: '+91 98200 12345', gstNumber: '27AABCS1429B1ZQ',
    createdAt: '02/08/2022', inUseCount: 12,
  },
  {
    id: 'vnd-2', code: 'VND-002', name: 'Blue Star Ltd', city: 'Pune', active: true,
    email: 'accounts.payable@bluestarindia.com', phone: '+91 22 4567 8901', gstNumber: '27AABCB1234C1ZP',
    createdAt: '14/03/2024', inUseCount: 0,
  },
  {
    id: 'vnd-3', code: 'VND-003', name: 'Godrej Interio', city: 'Mumbai', active: true,
    email: 'vendor.support@godrejinterio.com', phone: '+91 22 6796 5500', gstNumber: '27AAACG0057B1Z2',
    createdAt: '11/05/2023', inUseCount: 0,
  },
  {
    id: 'vnd-4', code: 'VND-004', name: 'Quess Corp', city: 'Bengaluru', active: true,
    email: 'vendor.ops@quesscorp.com', phone: '+91 80 4567 1234', gstNumber: null,
    createdAt: '19/11/2023', inUseCount: 0,
  },
  {
    id: 'vnd-5', code: 'VND-005', name: 'Nilkamal Ltd', city: 'Ahmedabad', active: false,
    email: 'sales@nilkamal.com', phone: '+91 79 2630 4040', gstNumber: '24AAACN1234D1Z5',
    createdAt: '30/01/2021', inUseCount: 0,
  },
];

type SortKey = 'nameAsc' | 'nameDesc' | 'recentlyAdded' | 'recentlyUpdated' | 'cityAsc' | 'idAsc';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'nameAsc', label: 'Name — A to Z' },
  { key: 'nameDesc', label: 'Name — Z to A' },
  { key: 'recentlyAdded', label: 'Recently added' },
  { key: 'recentlyUpdated', label: 'Recently updated' },
  { key: 'cityAsc', label: 'City — A to Z' },
  { key: 'idAsc', label: 'Vendor ID — ascending' },
];

function sortVendors(list: Vendor[], sortKey: SortKey): Vendor[] {
  const sorted = [...list];
  switch (sortKey) {
    case 'nameAsc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'nameDesc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case 'cityAsc':
      return sorted.sort((a, b) => a.city.localeCompare(b.city));
    case 'idAsc':
      return sorted.sort((a, b) => a.code.localeCompare(b.code));
    default:
      return sorted;
  }
}

export default function VendorsScreen({
  onBack,
  onAddVendor,
}: {
  onBack: () => void;
  onAddVendor: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('nameAsc');
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [vendors, setVendors] = useState(VENDORS);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const byFilter = filter === 'all' ? vendors : vendors.filter((v) => (filter === 'active' ? v.active : !v.active));
    const q = query.trim().toLowerCase();
    const byQuery = q
      ? byFilter.filter(
          (v) =>
            v.name.toLowerCase().includes(q) ||
            v.code.toLowerCase().includes(q) ||
            v.city.toLowerCase().includes(q) ||
            v.email.toLowerCase().includes(q) ||
            (v.gstNumber ?? '').toLowerCase().includes(q)
        )
      : byFilter;
    return sortVendors(byQuery, sortKey);
  }, [vendors, filter, query, sortKey]);

  const isSearching = query.trim().length > 0;
  const isEmpty = filtered.length === 0;
  const noVendorsAtAll = vendors.length === 0;

  const copyGst = async (vendorId: string, gst: string) => {
    await Clipboard.setStringAsync(gst);
    setCopiedId(vendorId);
    setTimeout(() => setCopiedId((current) => (current === vendorId ? null : current)), 1500);
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onBack}>
          <ChevronLeft size={22} color={theme.textPrimary} strokeWidth={1.75} />
        </Pressable>
        <Text style={styles.headerTitle}>Vendors</Text>
      </View>

      {!noVendorsAtAll ? (
        <>
          <View style={styles.searchRow}>
            <View style={[styles.searchBar, isSearching && styles.searchBarActive]}>
              <Search size={18} color={theme.textTertiary} strokeWidth={1.75} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder="Search vendors"
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
                <Text style={styles.emptyTitle}>No vendors match "{query.trim()}"</Text>
                <Text style={styles.emptySubtitle}>Try a different name, ID, city, email or GSTIN</Text>
              </>
            ) : (
              <>
                <Truck size={40} color={theme.textTertiary} strokeWidth={1.75} />
                <Text style={[styles.emptyTitle, styles.emptyTitleLg]}>Nothing here yet</Text>
                <Text style={styles.emptySubtitle}>No vendors have been added — tap + to add the first one</Text>
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
              <VendorCard
                vendor={item}
                expanded={expandedId === item.id}
                copied={copiedId === item.id}
                onToggle={() => setExpandedId((current) => (current === item.id ? null : item.id))}
                onCopyGst={() => item.gstNumber && copyGst(item.id, item.gstNumber)}
                onDelete={() => setVendors((current) => current.filter((v) => v.id !== item.id))}
              />
            )}
          />
        )}
      </View>

      <Pressable style={[styles.fab, { bottom: insets.bottom + space[6] }]} onPress={onAddVendor}>
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

function VendorCard({
  vendor, expanded, copied, onToggle, onCopyGst, onDelete,
}: {
  vendor: Vendor;
  expanded: boolean;
  copied: boolean;
  onToggle: () => void;
  onCopyGst: () => void;
  onDelete: () => void;
}) {
  const canDelete = vendor.inUseCount === 0;

  return (
    <View style={styles.card}>
      <Pressable onPress={onToggle}>
        <View style={styles.cardTopRow}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{vendor.name}</Text>
            <Text style={styles.cardCode}>{vendor.code}</Text>
          </View>
          <ChevronDown
            size={18}
            color={theme.textTertiary}
            strokeWidth={2}
            style={expanded ? styles.chevronUp : undefined}
          />
        </View>
        <View style={styles.cardMidRow}>
          <View style={styles.cityRow}>
            <MapPin size={14} color={theme.textSecondary} strokeWidth={1.75} />
            <Text style={styles.cityText}>{vendor.city}</Text>
          </View>
          <View style={[styles.statusBadge, vendor.active ? styles.statusBadgeActive : styles.statusBadgeInactive]}>
            <Text style={[styles.statusBadgeText, { color: vendor.active ? theme.statusSuccessStrong : theme.statusDangerStrong }]}>
              {vendor.active ? 'Active' : 'Inactive'}
            </Text>
          </View>
        </View>
      </Pressable>

      {expanded ? (
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <Pressable onPress={() => Linking.openURL(`mailto:${vendor.email}`)}>
              <View style={styles.linkRow}>
                <Mail size={12} color={theme.textTertiary} strokeWidth={1.75} />
                <Text style={styles.linkText} numberOfLines={1}>{vendor.email}</Text>
              </View>
            </Pressable>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Pressable onPress={() => Linking.openURL(`tel:${vendor.phone.replace(/\s+/g, '')}`)}>
              <View style={styles.linkRow}>
                <Phone size={12} color={theme.textTertiary} strokeWidth={1.75} />
                <Text style={styles.linkText}>{vendor.phone}</Text>
              </View>
            </Pressable>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>GST Number</Text>
            {vendor.gstNumber ? (
              <View style={styles.gstRow}>
                <Text style={styles.detailValue}>{vendor.gstNumber}</Text>
                <Pressable style={styles.copyButton} onPress={onCopyGst} hitSlop={8}>
                  {copied ? (
                    <Check size={14} color={theme.brandActive} strokeWidth={1.75} />
                  ) : (
                    <Copy size={14} color={theme.textSecondary} strokeWidth={1.75} />
                  )}
                </Pressable>
                {copied ? (
                  <View style={styles.copiedTooltip}>
                    <Text style={styles.copiedTooltipText}>Copied</Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <Text style={styles.detailValueMuted}>—</Text>
            )}
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Created at</Text>
            <Text style={styles.detailValue}>{vendor.createdAt}</Text>
          </View>
          <View style={styles.actionRow}>
            <Pressable style={styles.actionButton}>
              <Pencil size={14} color={theme.textPrimary} strokeWidth={1.75} />
              <Text style={styles.actionButtonText}>Edit</Text>
            </Pressable>
            {canDelete ? (
              <Pressable style={styles.actionButton} onPress={onDelete}>
                <Trash2 size={14} color={theme.statusDanger} strokeWidth={1.75} />
                <Text style={[styles.actionButtonText, { color: theme.statusDanger }]}>Delete</Text>
              </Pressable>
            ) : null}
          </View>
          {!canDelete ? (
            <Text style={styles.inUseText}>In use by {vendor.inUseCount} expenses — deactivate instead.</Text>
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

  chipRow: { marginTop: space[3], flexGrow: 0 },
  chipRowContent: { gap: space[2], paddingHorizontal: space[6], paddingBottom: space[2] },
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
  cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3] },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], flex: 1, minWidth: 0 },
  cardTitle: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary, flexShrink: 1 },
  cardCode: {
    fontSize: 11, fontFamily: 'Urbanist_600SemiBold', color: theme.textSecondary, backgroundColor: theme.bgSunken,
    height: 18, paddingHorizontal: space[1] + 2, borderRadius: radius.sm, textAlignVertical: 'center',
    fontVariant: ['tabular-nums'],
  },
  chevronUp: { transform: [{ rotate: '180deg' }] },
  cardMidRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space[3], marginTop: space[1] + 2 },
  cityRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  cityText: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary },
  statusBadge: { height: 20, paddingHorizontal: space[2], borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  statusBadgeActive: { backgroundColor: theme.statusSuccessBg },
  statusBadgeInactive: { backgroundColor: theme.statusDangerBg },
  statusBadgeText: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold' },

  details: { borderTopWidth: 1, borderTopColor: theme.borderSubtle, marginTop: space[3], paddingTop: space[3], gap: space[3] },
  detailRow: {},
  detailLabelRow: { flexDirection: 'row', alignItems: 'center', gap: space[1] },
  detailLabel: { fontSize: 12, fontFamily: 'Urbanist_500Medium', color: theme.textTertiary },
  detailValue: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, marginTop: 2, fontVariant: ['tabular-nums'] },
  detailValueMuted: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textTertiary, marginTop: 2 },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: space[1], marginTop: 2 },
  linkText: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.brandActive },
  gstRow: { flexDirection: 'row', alignItems: 'center', gap: space[2], marginTop: 2 },
  copyButton: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  copiedTooltip: {
    position: 'absolute', left: 0, top: -32, backgroundColor: theme.textPrimary,
    paddingHorizontal: space[2], paddingVertical: 4, borderRadius: radius.sm,
  },
  copiedTooltipText: { fontSize: 11, fontFamily: 'Urbanist_600SemiBold', color: theme.textInverse },

  actionRow: { flexDirection: 'row', gap: space[2] },
  actionButton: {
    height: 32, paddingHorizontal: space[3], backgroundColor: theme.bgRaised, borderWidth: 1,
    borderColor: theme.borderDefault, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: space[1] + 2,
  },
  actionButtonText: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  inUseText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary },

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
