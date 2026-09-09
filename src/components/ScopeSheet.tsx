import { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Building2, Check, MapPin, Search, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius, space, theme } from '../theme/tokens';

export type Branch = { id: string; name: string; city: string };
export type Organisation = { id: string; name: string; branches: Branch[] };

type Tab = 'organisation' | 'branch';

type Props = {
  visible: boolean;
  initialTab: Tab;
  orgs: Organisation[];
  selectedOrgId: string;
  selectedBranchId: string | null;
  onApply: (orgId: string, branchId: string | null) => void;
  onClose: () => void;
};

const SHEET_HEIGHT = Dimensions.get('window').height * 0.76;

export default function ScopeSheet({
  visible,
  initialTab,
  orgs,
  selectedOrgId,
  selectedBranchId,
  onApply,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [orgId, setOrgId] = useState(selectedOrgId);
  const [branchId, setBranchId] = useState(selectedBranchId);
  const [orgQuery, setOrgQuery] = useState('');
  const [branchQuery, setBranchQuery] = useState('');

  useEffect(() => {
    if (visible) {
      setTab(initialTab);
      setOrgId(selectedOrgId);
      setBranchId(selectedBranchId);
      setOrgQuery('');
      setBranchQuery('');
    }
  }, [visible, initialTab, selectedOrgId, selectedBranchId]);

  const org = orgs.find((o) => o.id === orgId) ?? orgs[0];
  const orgSwitched = orgId !== selectedOrgId;
  const branchValid = org.branches.some((b) => b.id === branchId);
  const canApply = org.branches.length === 0 ? false : branchValid;

  const selectOrg = (id: string) => {
    setOrgId(id);
    const stillValid = orgs.find((o) => o.id === id)?.branches.some((b) => b.id === branchId);
    if (!stillValid) setBranchId(null);
  };

  const filteredOrgs = orgs.filter((o) =>
    o.name.toLowerCase().includes(orgQuery.toLowerCase()),
  );
  const filteredBranches = org.branches.filter((b) =>
    b.name.toLowerCase().includes(branchQuery.toLowerCase()),
  );

  const handleApply = () => {
    onApply(orgId, branchId);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, { height: SHEET_HEIGHT }]}>
          <View style={styles.handleRow}>
            <View style={styles.handle} />
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.title}>Switch scope</Text>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <X size={16} color={theme.textSecondary} strokeWidth={2} />
            </Pressable>
          </View>

          <View style={styles.tabRow}>
            <Pressable style={styles.tab} onPress={() => setTab('organisation')}>
              <Text style={[styles.tabText, tab === 'organisation' && styles.tabTextActive]}>
                Organisation
              </Text>
              <View style={[styles.tabIndicator, tab === 'organisation' && styles.tabIndicatorActive]} />
            </Pressable>
            <Pressable style={styles.tab} onPress={() => setTab('branch')}>
              <Text style={[styles.tabText, tab === 'branch' && styles.tabTextActive]}>
                Branch
              </Text>
              <View style={[styles.tabIndicator, tab === 'branch' && styles.tabIndicatorActive]} />
            </Pressable>
          </View>

          {tab === 'branch' && orgSwitched && org.branches.length > 0 ? (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>
                You switched organisations — choose a branch to continue
              </Text>
            </View>
          ) : null}

          {tab === 'organisation' ? (
            <>
              <View style={styles.searchWrap}>
                <View style={styles.searchBar}>
                  <Search size={16} color={theme.textTertiary} strokeWidth={1.75} />
                  <TextInput
                    style={styles.searchInput}
                    value={orgQuery}
                    onChangeText={setOrgQuery}
                    placeholder="Search organisations"
                    placeholderTextColor={theme.textTertiary}
                  />
                </View>
              </View>
              <View style={styles.list}>
                {filteredOrgs.map((o) => {
                  const selected = o.id === orgId;
                  return (
                    <Pressable
                      key={o.id}
                      style={[styles.row, selected && styles.rowSelected]}
                      onPress={() => selectOrg(o.id)}
                    >
                      <View style={[styles.rowIcon, selected && styles.rowIconSelected]}>
                        <Building2
                          size={18}
                          color={selected ? theme.brandDefault : theme.textSecondary}
                          strokeWidth={1.75}
                        />
                      </View>
                      <View style={styles.rowText}>
                        <Text style={styles.rowTitle}>{o.name}</Text>
                        <Text style={styles.rowSubtitle}>
                          {o.branches.length} {o.branches.length === 1 ? 'branch' : 'branches'}
                        </Text>
                      </View>
                      {selected ? (
                        <Check size={18} color={theme.brandDefault} strokeWidth={2.5} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : org.branches.length === 0 ? (
            <View style={styles.emptyState}>
              <MapPin size={36} color={theme.textTertiary} strokeWidth={1.75} />
              <Text style={styles.emptyTitle}>{org.name} has no branches yet</Text>
              <Text style={styles.emptySubtitle}>
                Ask an admin to add a branch to this organisation
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.searchWrap}>
                <View style={styles.searchBar}>
                  <Search size={16} color={theme.textTertiary} strokeWidth={1.75} />
                  <TextInput
                    style={styles.searchInput}
                    value={branchQuery}
                    onChangeText={setBranchQuery}
                    placeholder="Search branches"
                    placeholderTextColor={theme.textTertiary}
                  />
                </View>
              </View>
              <View style={styles.list}>
                {filteredBranches.map((b) => {
                  const selected = b.id === branchId;
                  return (
                    <Pressable
                      key={b.id}
                      style={[styles.row, selected && styles.rowSelected]}
                      onPress={() => setBranchId(b.id)}
                    >
                      <View style={[styles.rowIcon, selected && styles.rowIconSelected]}>
                        <MapPin
                          size={18}
                          color={selected ? theme.brandDefault : theme.textSecondary}
                          strokeWidth={1.75}
                        />
                      </View>
                      <View style={styles.rowText}>
                        <Text style={styles.rowTitle}>{b.name}</Text>
                        <Text style={styles.rowSubtitle}>{b.city}</Text>
                      </View>
                      {selected ? (
                        <Check size={18} color={theme.brandDefault} strokeWidth={2.5} />
                      ) : null}
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) + 8 }]}>
            <Pressable
              style={[styles.applyButton, !canApply && styles.applyButtonDisabled]}
              disabled={!canApply}
              onPress={handleApply}
            >
              <Text style={[styles.applyText, !canApply && styles.applyTextDisabled]}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: theme.bgOverlay,
  },
  sheet: {
    backgroundColor: theme.bgRaised,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    flexDirection: 'column',
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: space[3],
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: theme.borderStrong,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space[5],
    marginTop: space[4],
  },
  title: {
    fontSize: 18,
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.textPrimary,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: theme.bgSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    gap: space[5],
    paddingHorizontal: space[5],
    marginTop: space[4],
    borderBottomWidth: 1,
    borderBottomColor: theme.borderSubtle,
  },
  tab: {
    paddingVertical: space[3],
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.textTertiary,
  },
  tabTextActive: {
    color: theme.textPrimary,
  },
  tabIndicator: {
    height: 2,
    marginTop: space[3] - 2,
    backgroundColor: 'transparent',
  },
  tabIndicatorActive: {
    backgroundColor: theme.brandDefault,
  },
  warningBanner: {
    margin: space[3],
    marginBottom: 0,
    paddingHorizontal: space[3],
    paddingVertical: space[2] + 2,
    backgroundColor: theme.statusWarningBg,
    borderRadius: radius.md,
  },
  warningText: {
    fontSize: 13,
    fontFamily: 'Urbanist_500Medium',
    color: theme.statusWarningStrong,
  },
  searchWrap: {
    paddingHorizontal: space[5],
    paddingTop: space[4],
  },
  searchBar: {
    height: 40,
    paddingHorizontal: space[3],
    backgroundColor: theme.bgSunken,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Urbanist_400Regular',
    color: theme.textPrimary,
    padding: 0,
  },
  list: {
    flex: 1,
    paddingHorizontal: space[5],
    paddingTop: space[3],
    gap: space[2],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingHorizontal: space[3],
    paddingVertical: space[2] + 2,
    borderRadius: radius.md,
    minHeight: 44,
  },
  rowSelected: {
    backgroundColor: theme.brandSubtle,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: theme.bgSunken,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconSelected: {
    backgroundColor: theme.bgRaised,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.textPrimary,
  },
  rowSubtitle: {
    fontSize: 12,
    fontFamily: 'Urbanist_500Medium',
    color: theme.textSecondary,
    marginTop: 2,
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
  emptySubtitle: {
    fontSize: 13,
    fontFamily: 'Urbanist_400Regular',
    color: theme.textSecondary,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: space[5],
    paddingTop: space[4],
  },
  applyButton: {
    minHeight: 48,
    backgroundColor: theme.brandDefault,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: theme.bgSunken,
    borderWidth: 1,
    borderColor: theme.borderSubtle,
  },
  applyText: {
    fontSize: 15,
    fontFamily: 'Urbanist_600SemiBold',
    color: theme.textOnBrand,
  },
  applyTextDisabled: {
    color: theme.textDisabled,
  },
});
