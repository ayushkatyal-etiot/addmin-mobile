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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  AlertCircle,
  Building2,
  ChevronDown,
  Mail,
  Pencil,
  Search,
  Send,
  UserCheck,
  UserMinus,
  UserPlus,
  Users as UsersIcon,
  X,
} from 'lucide-react-native';

import { useUser } from '../contexts/UserContext';
import Dialog from '../components/Dialog';
import Toast from '../components/Toast';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { styles } from './UsersScreen.styles';
import { theme, space, colors } from '../theme/tokens';

type UsersNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type UserStatus = 'active' | 'invited' | 'expired' | 'deactivated';

interface Membership {
  orgName: string;
  role: string;
}

interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: string;
  orgScope: string;
  status: UserStatus;
  createdAt?: string;
  inviteDispatchedAt?: string;
  expiresInHours?: number;
  memberships: Membership[];
}

const CURRENT_USER_FALLBACK_ID = 'u1';

const INITIAL_USERS: TenantUser[] = [
  {
    id: 'u1',
    name: 'Priya Sharma',
    email: 'priya.sharma@acmegroup.in',
    role: 'Tenant Owner',
    orgScope: 'All organisations',
    status: 'active',
    createdAt: '12/01/2022',
    memberships: [{ orgName: 'Acme Group', role: 'Tenant Owner' }],
  },
  {
    id: 'u2',
    name: 'Arjun Mehta',
    email: 'arjun.mehta@acmegroup.in',
    role: 'Tenant Admin',
    orgScope: 'All organisations',
    status: 'active',
    createdAt: '03/03/2022',
    memberships: [{ orgName: 'Acme Group', role: 'Tenant Admin' }],
  },
  {
    id: 'u3',
    name: 'Sanjana Iyer',
    email: 'sanjana.iyer@acmegroup.in',
    role: 'Office Admin',
    orgScope: '2 organisations',
    status: 'active',
    createdAt: '18/07/2023',
    memberships: [
      { orgName: 'Acme Group', role: 'Office Admin' },
      { orgName: 'Acme Logistics', role: 'Facility Manager' },
    ],
  },
  {
    id: 'u4',
    name: 'Rohit Kapoor',
    email: 'rohit.kapoor@acmeretail.in',
    role: 'Finance',
    orgScope: 'Acme Retail',
    status: 'active',
    createdAt: '09/11/2023',
    memberships: [{ orgName: 'Acme Retail', role: 'Finance' }],
  },
  {
    id: 'u5',
    name: 'Neha Verma',
    email: 'neha.verma@gmail.com',
    role: 'Facility Staff',
    orgScope: 'Acme Logistics',
    status: 'invited',
    inviteDispatchedAt: '13/09/2026, 14:00',
    expiresInHours: 18,
    memberships: [{ orgName: 'Acme Logistics', role: 'Facility Staff' }],
  },
  {
    id: 'u6',
    name: 'Karan Malhotra',
    email: 'karan.malhotra@acmeretail.in',
    role: 'Office Admin',
    orgScope: 'Acme Retail',
    status: 'expired',
    inviteDispatchedAt: '01/09/2026, 10:00',
    memberships: [{ orgName: 'Acme Retail', role: 'Office Admin' }],
  },
  {
    id: 'u7',
    name: 'Divya Nair',
    email: 'divya.nair@acmegroup.in',
    role: 'Finance',
    orgScope: 'Acme Group',
    status: 'deactivated',
    createdAt: '22/05/2023',
    memberships: [{ orgName: 'Acme Group', role: 'Finance' }],
  },
  {
    id: 'u8',
    name: 'Vikram Desai',
    email: 'vikram.desai@acmelogistics.in',
    role: 'Facility Staff',
    orgScope: 'Acme Logistics',
    status: 'deactivated',
    createdAt: '02/02/2023',
    memberships: [{ orgName: 'Acme Logistics', role: 'Facility Staff' }],
  },
];

const SEATS_TOTAL = 10;

// Clears the floating pill BottomNav (16px margin + 72px height + 20px gap),
// matching the mockup's fixed 108px offset for the add-user FAB.
const NAV_BAR_CLEARANCE = 108;

const STATUS_BADGE: Record<UserStatus, { label: string; bg: string; text: string }> = {
  active: { label: 'Active', bg: theme.statusSuccessBg, text: theme.statusSuccessStrong },
  invited: { label: 'Invited', bg: theme.statusInfoBg, text: theme.statusInfoStrong },
  expired: { label: 'Expired', bg: theme.statusDangerBg, text: theme.statusDangerStrong },
  deactivated: { label: 'Deactivated', bg: colors.slate100, text: theme.textSecondary },
};

// Invited and expired invites both hold a seat until they're resolved.
function occupiesSeat(status: UserStatus): boolean {
  return status === 'active' || status === 'invited' || status === 'expired';
}

export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<UsersNavigationProp>();
  const { user: currentUser } = useUser();
  const currentUserId = currentUser?.id ?? CURRENT_USER_FALLBACK_ID;

  const [users, setUsers] = useState<TenantUser[]>(INITIAL_USERS);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'invited' | 'deactivated'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [seatSheetVisible, setSeatSheetVisible] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<{ user: TenantUser; action: 'deactivate' | 'revoke' } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const activeTenantOwnerCount = useMemo(
    () => users.filter((u) => u.status === 'active' && u.role === 'Tenant Owner').length,
    [users]
  );

  const seatsUsed = useMemo(() => users.filter((u) => occupiesSeat(u.status)).length, [users]);
  const seatsRemaining = SEATS_TOTAL - seatsUsed;
  const seatState: 'normal' | 'warning' | 'danger' =
    seatsRemaining <= 0 ? 'danger' : seatsRemaining <= 2 ? 'warning' : 'normal';

  const filtered = useMemo(() => {
    const byFilter = users.filter((u) => {
      if (filter === 'invited') return u.status === 'invited' || u.status === 'expired';
      if (filter === 'deactivated') return u.status === 'deactivated';
      return true;
    });
    const q = query.trim().toLowerCase();
    if (!q) return byFilter;
    return byFilter.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, filter, query]);

  const isSearching = query.trim().length > 0;
  const isEmpty = filtered.length === 0;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastType(type);
    setToastMessage(message);
    setToastVisible(true);
  };

  const updateUserStatus = (userId: string, status: UserStatus) => {
    setUsers((current) => current.map((u) => (u.id === userId ? { ...u, status } : u)));
  };

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    const { user, action } = confirmTarget;
    if (action === 'deactivate') {
      updateUserStatus(user.id, 'deactivated');
      showToast(`${user.name} deactivated`);
    } else {
      setUsers((current) => current.filter((u) => u.id !== user.id));
      showToast(`Invite for ${user.name} revoked`);
    }
    setConfirmTarget(null);
  };

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Users</Text>
      </View>

      <View style={styles.seatCardWrap}>
        <View style={styles.seatCard}>
          <View style={styles.seatTopRow}>
            <View
              style={[
                styles.seatIconCircle,
                seatState === 'warning' && styles.seatIconCircleWarning,
                seatState === 'danger' && styles.seatIconCircleDanger,
              ]}
            >
              <UsersIcon
                size={20}
                strokeWidth={1.75}
                color={
                  seatState === 'warning'
                    ? theme.statusWarningStrong
                    : seatState === 'danger'
                    ? theme.statusDangerStrong
                    : theme.brandActive
                }
              />
            </View>
            <View style={styles.seatTextCol}>
              <Text style={styles.seatLabel}>Active Members</Text>
              <Text style={styles.seatValue}>
                {seatsUsed} / {SEATS_TOTAL} seats
              </Text>
            </View>
          </View>
          <View style={styles.seatBarTrack}>
            <View
              style={[
                styles.seatBarFill,
                { width: `${Math.min(100, (seatsUsed / SEATS_TOTAL) * 100)}%` },
                seatState === 'warning' && { backgroundColor: theme.statusWarning },
                seatState === 'danger' && { backgroundColor: theme.statusDanger },
              ]}
            />
          </View>
          {seatState === 'danger' ? (
            <Text style={[styles.seatHint, styles.seatHintDanger]}>No seats remaining</Text>
          ) : seatState === 'warning' ? (
            <Text style={[styles.seatHint, styles.seatHintWarning]}>{seatsRemaining} seats remaining</Text>
          ) : null}
          <Text style={styles.seatSubtext}>Invited users occupy a seat until the invite expires.</Text>
        </View>
      </View>

      <View style={styles.stickyControls}>
        <View style={[styles.searchBar, isSearching && styles.searchBarActive]}>
          <Search size={18} color={theme.textTertiary} strokeWidth={1.75} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search users"
            placeholderTextColor={theme.textTertiary}
          />
          {isSearching ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <X size={16} color={theme.textTertiary} strokeWidth={2} />
            </Pressable>
          ) : null}
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
              { key: 'invited', label: 'Invited' },
              { key: 'deactivated', label: 'Deactivated' },
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
      </View>

      <View style={styles.contentContainer}>
        {isEmpty ? (
          <View style={styles.emptyState}>
            <Search size={36} color={theme.textTertiary} strokeWidth={1.75} />
            <Text style={styles.emptyTitle}>
              {isSearching ? `No users match "${query.trim()}"` : 'No users in this view'}
            </Text>
            <Text style={styles.emptySubtitle}>Try a different name, email or role</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={{ height: space[3] }} />}
            renderItem={({ item }) => (
              <UserCard
                user={item}
                expanded={expandedId === item.id}
                isSelf={item.id === currentUserId}
                isLastTenantOwner={item.role === 'Tenant Owner' && item.status === 'active' && activeTenantOwnerCount <= 1}
                onToggle={() => setExpandedId((current) => (current === item.id ? null : item.id))}
                onEdit={() => showToast('Edit user — coming soon')}
                onDeactivate={() => setConfirmTarget({ user: item, action: 'deactivate' })}
                onReactivate={() => {
                  updateUserStatus(item.id, 'active');
                  showToast(`${item.name} reactivated`);
                }}
                onResendInvite={() => showToast(`Invite resent to ${item.name}`)}
                onRevokeInvite={() => setConfirmTarget({ user: item, action: 'revoke' })}
              />
            )}
          />
        )}
      </View>

      <Pressable
        style={[styles.fab, { bottom: insets.bottom + NAV_BAR_CLEARANCE }, seatState === 'danger' && styles.fabDisabled]}
        onPress={() => {
          if (seatState === 'danger') {
            setSeatSheetVisible(true);
          } else {
            navigation.navigate('InviteUser', {
              seatsUsed,
              seatsTotal: SEATS_TOTAL,
              onSent: () => showToast('Invite sent'),
            });
          }
        }}
      >
        <UserPlus size={24} color={theme.textOnBrand} strokeWidth={2.25} />
      </Pressable>

      <SeatLimitSheet visible={seatSheetVisible} onClose={() => setSeatSheetVisible(false)} />

      <Dialog
        visible={!!confirmTarget}
        title={confirmTarget?.action === 'deactivate' ? 'Deactivate user?' : 'Revoke invite?'}
        description={
          confirmTarget?.action === 'deactivate'
            ? `${confirmTarget.user.name} will lose access immediately.`
            : `The pending invite for ${confirmTarget?.user.name} will be revoked.`
        }
        buttons={[
          { label: 'Cancel', type: 'cancel', onPress: () => setConfirmTarget(null) },
          { label: confirmTarget?.action === 'deactivate' ? 'Deactivate' : 'Revoke', type: 'destructive', onPress: handleConfirm },
        ]}
        onDismiss={() => setConfirmTarget(null)}
      />

      <Toast visible={toastVisible} message={toastMessage} type={toastType} onHide={() => setToastVisible(false)} />
    </SafeAreaView>
  );
}

function UserCard({
  user,
  expanded,
  isSelf,
  isLastTenantOwner,
  onToggle,
  onEdit,
  onDeactivate,
  onReactivate,
  onResendInvite,
  onRevokeInvite,
}: {
  user: TenantUser;
  expanded: boolean;
  isSelf: boolean;
  isLastTenantOwner: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDeactivate: () => void;
  onReactivate: () => void;
  onResendInvite: () => void;
  onRevokeInvite: () => void;
}) {
  const badge = STATUS_BADGE[user.status];
  const canDeactivate = user.status === 'active' && !isSelf && !isLastTenantOwner;

  return (
    <View style={styles.card}>
      <Pressable onPress={onToggle}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {user.name}
          </Text>
          <View style={styles.cardTopRight}>
            <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.statusBadgeText, { color: badge.text }]}>{badge.label}</Text>
            </View>
            <ChevronDown
              size={18}
              color={theme.textTertiary}
              strokeWidth={2}
              style={expanded ? styles.chevronUp : undefined}
            />
          </View>
        </View>
        <Text style={styles.cardRole}>{user.role}</Text>
        <Text style={styles.cardScope}>{user.orgScope}</Text>
      </Pressable>

      {expanded ? (
        <View style={styles.details}>
          <View>
            <View style={styles.detailLabelRow}>
              <Mail size={12} color={theme.textTertiary} strokeWidth={1.75} />
              <Text style={styles.detailLabel}>Email</Text>
            </View>
            <Pressable onPress={() => Linking.openURL(`mailto:${user.email}`)}>
              <Text style={styles.linkText} numberOfLines={1}>
                {user.email}
              </Text>
            </Pressable>
          </View>

          {user.status === 'active' || user.status === 'deactivated' ? (
            <View>
              <Text style={styles.detailLabel}>Created At</Text>
              <Text style={styles.detailValue}>{user.createdAt}</Text>
            </View>
          ) : (
            <>
              <View>
                <Text style={styles.detailLabel}>Invite Dispatched</Text>
                <Text style={styles.detailValue}>{user.inviteDispatchedAt}</Text>
              </View>
              <View>
                <Text style={styles.detailLabel}>Expiry</Text>
                <Text style={[styles.expiryValue, user.status === 'expired' && styles.expiryValueDanger]}>
                  {user.status === 'expired' ? 'Invite expired' : `Expires in ${user.expiresInHours} hours`}
                </Text>
              </View>
            </>
          )}

          <View>
            <Text style={[styles.detailLabel, styles.membershipsLabel]}>
              {user.status === 'active' || user.status === 'deactivated' ? 'Memberships and scope' : 'Pending memberships'}
            </Text>
            <View style={styles.membershipList}>
              {user.memberships.map((m, i) => (
                <View key={i} style={styles.membershipRow}>
                  <View style={styles.membershipIcon}>
                    <Building2 size={14} color={theme.textSecondary} strokeWidth={1.75} />
                  </View>
                  <View style={styles.membershipTextCol}>
                    <Text style={styles.membershipOrg}>{m.orgName}</Text>
                    <Text style={styles.membershipRole}>{m.role}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.actionRow}>
            {user.status === 'deactivated' ? (
              <Pressable style={styles.actionButton} onPress={onReactivate}>
                <UserCheck size={14} color={theme.textPrimary} strokeWidth={1.75} />
                <Text style={styles.actionButtonText}>Reactivate</Text>
              </Pressable>
            ) : (
              <>
                <Pressable style={styles.actionButton} onPress={onEdit}>
                  <Pencil size={14} color={theme.textPrimary} strokeWidth={1.75} />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </Pressable>
                {canDeactivate ? (
                  <Pressable style={styles.actionButton} onPress={onDeactivate}>
                    <UserMinus size={14} color={theme.statusDanger} strokeWidth={1.75} />
                    <Text style={[styles.actionButtonText, { color: theme.statusDanger }]}>Deactivate</Text>
                  </Pressable>
                ) : null}
                {(user.status === 'invited' || user.status === 'expired') ? (
                  <>
                    <Pressable style={styles.actionButton} onPress={onResendInvite}>
                      <Send size={14} color={theme.textPrimary} strokeWidth={1.75} />
                      <Text style={styles.actionButtonText}>Resend Invite</Text>
                    </Pressable>
                    <Pressable style={styles.actionButton} onPress={onRevokeInvite}>
                      <X size={14} color={theme.statusDanger} strokeWidth={1.75} />
                      <Text style={[styles.actionButtonText, { color: theme.statusDanger }]}>Revoke Invite</Text>
                    </Pressable>
                  </>
                ) : null}
              </>
            )}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function SeatLimitSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
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
            <Text style={styles.sheetTitle}>No seats remaining</Text>
            <Pressable style={styles.sheetCloseButton} onPress={onClose}>
              <X size={16} color={theme.textSecondary} strokeWidth={2} />
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: space[5], paddingBottom: Math.max(insets.bottom, space[5]) }}>
            <View style={styles.sheetIconWrap}>
              <AlertCircle size={24} color={theme.statusDangerStrong} strokeWidth={1.75} />
            </View>
            <Text style={styles.sheetBody}>
              All {SEATS_TOTAL} seats on this plan are in use by active and invited members. Free up a seat by
              deactivating a member or revoking a pending invite, or add more seats on your plan.
            </Text>
            <Pressable style={styles.sheetPrimaryButton} onPress={onClose}>
              <Text style={styles.sheetPrimaryButtonText}>Go to billing</Text>
            </Pressable>
            <Pressable style={styles.sheetSecondaryButton} onPress={onClose}>
              <Text style={styles.sheetSecondaryButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
