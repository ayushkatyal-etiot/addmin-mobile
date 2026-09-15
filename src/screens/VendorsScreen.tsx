import { useCallback, useMemo, useState } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
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

import { useGetVendors, useDeleteVendor } from '../api/vendors';
import type { Vendor } from '../types/vendor';
import Toast from '../components/Toast';
import { styles } from './VendorsScreen.styles';
import { theme, space } from '../theme/tokens';

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
  onAddVendor: (vendorId?: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('nameAsc');
  const [sortSheetOpen, setSortSheetOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [localVendors, setLocalVendors] = useState<Vendor[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('error');

  const { data: vendorsData, isLoading, refetch } = useGetVendors();
  const { mutateAsync: deleteVendor, isPending: isDeleting } = useDeleteVendor();

  useFocusEffect(
    useCallback(() => {
      console.log('[VendorsScreen] Screen focused, refetching vendors...');
      refetch().catch((err) => console.error('[VendorsScreen] Refetch failed:', err));
    }, [refetch])
  );

  console.log('[VendorsScreen] Render - Loading:', isLoading, 'Vendors:', localVendors.length);

  useMemo(() => {
    if (vendorsData?.items) {
      setLocalVendors(vendorsData.items);
    }
  }, [vendorsData]);

  const filtered = useMemo(() => {
    const byFilter = filter === 'all' ? localVendors : localVendors.filter((v) => (filter === 'active' ? v.active : !v.active));
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
  }, [localVendors, filter, query, sortKey]);

  const isSearching = query.trim().length > 0;
  const isEmpty = filtered.length === 0;
  const noVendorsAtAll = localVendors.length === 0;

  const copyGst = async (vendorId: string, gst: string) => {
    await Clipboard.setStringAsync(gst);
    setCopiedId(vendorId);
    setTimeout(() => setCopiedId((current) => (current === vendorId ? null : current)), 1500);
  };

  const handleDeletePress = (vendorId: string) => {
    console.log('[VendorsScreen] DELETE BUTTON PRESSED - vendorId:', vendorId);
    console.log('[VendorsScreen] Current deleteId state:', deleteId);
    setDeleteId(vendorId);
    console.log('[VendorsScreen] Set deleteId to:', vendorId);
  };

  const handleDeleteConfirm = async () => {
    console.log('[VendorsScreen] handleDeleteConfirm called, deleteId:', deleteId);
    if (!deleteId) {
      console.log('[VendorsScreen] No deleteId, returning');
      return;
    }

    try {
      console.log('[VendorsScreen] Calling deleteVendor with ID:', deleteId);
      await deleteVendor(deleteId);
      console.log('[VendorsScreen] Delete succeeded');
      setToastType('success');
      setToastMessage('Vendor deleted successfully');
      setToastVisible(true);
      setDeleteId(null);
      await refetch();
    } catch (err: any) {
      console.error('[VendorsScreen] Failed to delete vendor:', err);
      console.error('[VendorsScreen] Error data:', err?.data);
      const message = err?.data?.detail || err?.data?.message || err?.message || 'Failed to delete vendor';
      setToastType('error');
      setToastMessage(message);
      setToastVisible(true);
      setDeleteId(null);
    }
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
                onDelete={() => handleDeletePress(item.id)}
                onEdit={() => onAddVendor(item.id)}
              />
            )}
          />
        )}
      </View>

      <Pressable style={[styles.fab, { bottom: insets.bottom + space[6] }]} onPress={() => onAddVendor()}>
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

      <Modal visible={!!deleteId} transparent animationType="fade" onRequestClose={() => setDeleteId(null)}>
        <Pressable style={styles.dialogOverlay} onPress={() => setDeleteId(null)}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>Delete vendor?</Text>
            <Text style={styles.dialogMessage}>This action cannot be undone.</Text>
            <View style={styles.dialogButtonRow}>
              <Pressable
                style={[styles.dialogButton, styles.dialogButtonCancel]}
                onPress={() => setDeleteId(null)}
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

function VendorCard({
  vendor, expanded, copied, onToggle, onCopyGst, onDelete, onEdit,
}: {
  vendor: Vendor;
  expanded: boolean;
  copied: boolean;
  onToggle: () => void;
  onCopyGst: () => void;
  onDelete: () => void;
  onEdit: () => void;
}) {
  const canDelete = vendor.inUseCount === 0;
  console.log('[VendorCard] Rendering vendor:', vendor.name, 'canDelete:', canDelete, 'inUseCount:', vendor.inUseCount);

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
            <Pressable style={styles.actionButton} onPress={() => onEdit()}>
              <Pencil size={14} color={theme.textPrimary} strokeWidth={1.75} />
              <Text style={styles.actionButtonText}>Edit</Text>
            </Pressable>
            {canDelete ? (
              <Pressable
                style={styles.actionButton}
                onPress={() => {
                  console.log('[VendorCard] DELETE BUTTON PRESSED - calling onDelete for:', vendor.name);
                  onDelete();
                }}
              >
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
