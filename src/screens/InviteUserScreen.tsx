import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Building2,
  Check,
  ChevronDown,
  CircleAlert,
  MapPin,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react-native';

import type { RootStackParamList } from '../navigation/RootNavigator';
import { styles } from './InviteUserScreen.styles';
import { theme } from '../theme/tokens';

const ORGANISATIONS = [
  { id: 'org1', name: 'Acme Retail' },
  { id: 'org2', name: 'Acme Logistics' },
  { id: 'org3', name: 'Acme Group' },
  { id: 'org4', name: 'Acme Facilities' },
];

const ROLES = ['Office Admin', 'Finance', 'Facility Manager', 'Facility Staff'];

const BRANCHES: Record<string, { id: string; name: string; city: string }[]> = {
  org1: [
    { id: 'b1', name: 'MG Road Branch', city: 'Bengaluru' },
    { id: 'b2', name: 'Andheri East Branch', city: 'Mumbai' },
    { id: 'b3', name: 'Sector 62 Branch', city: 'Noida' },
  ],
  org2: [
    { id: 'b4', name: 'Salt Lake Branch', city: 'Kolkata' },
    { id: 'b5', name: 'Banjara Hills Branch', city: 'Hyderabad' },
    { id: 'b6', name: 'Anna Nagar Branch', city: 'Chennai' },
  ],
  org3: [
    { id: 'b1', name: 'MG Road Branch', city: 'Bengaluru' },
    { id: 'b4', name: 'Salt Lake Branch', city: 'Kolkata' },
  ],
  org4: [],
};

const EXISTING_EMAILS = ['priya.sharma@acmegroup.in', 'arjun.mehta@acmegroup.in'];

interface Membership {
  key: string;
  orgId: string | null;
  role: string | null;
  allBranches: boolean;
  branchIds: string[];
}

interface MembershipErrors {
  org?: string;
  role?: string;
  branches?: string;
}

let membershipCounter = 0;
function newMembership(): Membership {
  membershipCounter += 1;
  return { key: `m${membershipCounter}`, orgId: null, role: null, allBranches: true, branchIds: [] };
}

function membershipHasData(m: Membership): boolean {
  return !!m.orgId || !!m.role || !m.allBranches || m.branchIds.length > 0;
}

function validateMembership(m: Membership): MembershipErrors {
  const err: MembershipErrors = {};
  if (!m.orgId) err.org = 'Choose an organisation';
  if (!m.role) err.role = 'Choose a role';
  if (!m.allBranches && m.branchIds.length === 0) err.branches = 'Select at least one branch, or turn on All branches.';
  return err;
}

type InviteUserScreenProps = {
  onBack: () => void;
  route?: { params?: RootStackParamList['InviteUser'] };
};

export default function InviteUserScreen({ onBack, route }: InviteUserScreenProps) {
  const seatsUsed = route?.params?.seatsUsed ?? 20;
  const seatsTotal = route?.params?.seatsTotal ?? 40;
  const onSent = route?.params?.onSent;
  const seatsRemaining = seatsTotal - seatsUsed;
  const seatWarning = seatsRemaining <= 2;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailDuplicate, setEmailDuplicate] = useState(false);

  const [memberships, setMemberships] = useState<Membership[]>([newMembership()]);
  const [membershipErrors, setMembershipErrors] = useState<Record<string, MembershipErrors>>({});

  const [orgSheetFor, setOrgSheetFor] = useState<string | null>(null);
  const [roleSheetFor, setRoleSheetFor] = useState<string | null>(null);
  const [branchSheetFor, setBranchSheetFor] = useState<string | null>(null);
  const [pickerQuery, setPickerQuery] = useState('');

  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [discardConfirmVisible, setDiscardConfirmVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);

  const isDirty = name.trim() !== '' || email.trim() !== '' || phone.trim() !== '' || memberships.some(membershipHasData);

  const patchMembership = (key: string, patch: Partial<Membership>) => {
    setMemberships((current) => current.map((m) => (m.key === key ? { ...m, ...patch } : m)));
  };

  const clearMembershipError = (key: string, field: keyof MembershipErrors) => {
    setMembershipErrors((current) => {
      if (!current[key]) return current;
      return { ...current, [key]: { ...current[key], [field]: undefined } };
    });
  };

  const handleValidate = (): boolean => {
    let valid = true;

    const nErr = name.trim() ? null : 'Enter a full name';
    let eErr: string | null = null;
    let eDup = false;
    if (!email.trim()) {
      eErr = 'Enter an email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      eErr = 'Enter a valid email address';
    } else if (EXISTING_EMAILS.includes(email.trim().toLowerCase())) {
      eErr = 'This email already has an account in this tenant.';
      eDup = true;
    }
    setNameError(nErr);
    setEmailError(eErr);
    setEmailDuplicate(eDup);
    if (nErr || eErr) valid = false;

    const nextMembershipErrors: Record<string, MembershipErrors> = {};
    memberships.forEach((m) => {
      const err = validateMembership(m);
      nextMembershipErrors[m.key] = err;
      if (err.org || err.role || err.branches) valid = false;
    });
    setMembershipErrors(nextMembershipErrors);

    return valid;
  };

  const invalidFieldCount = (() => {
    let count = 0;
    if (nameError) count += 1;
    if (emailError) count += 1;
    Object.values(membershipErrors).forEach((err) => {
      count += [err.org, err.role, err.branches].filter(Boolean).length;
    });
    return count;
  })();

  const invalidSectionLabels = (() => {
    const labels: string[] = [];
    if (nameError || emailError) labels.push('Identity');
    memberships.forEach((m, i) => {
      const err = membershipErrors[m.key];
      if (err && (err.org || err.role || err.branches)) labels.push(`Membership ${i + 1}`);
    });
    return labels;
  })();

  const summaryText = (() => {
    if (invalidSectionLabels.length === 0) return null;
    const labels = invalidSectionLabels;
    const joined =
      labels.length === 1
        ? labels[0]
        : labels.length === 2
        ? `${labels[0]} and ${labels[1]}`
        : `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
    return `${invalidFieldCount} field${invalidFieldCount === 1 ? '' : 's'} need attention — ${joined}.`;
  })();

  const handleCancel = () => {
    if (isDirty) setDiscardConfirmVisible(true);
    else onBack();
  };

  const handleAddMembership = () => setMemberships((current) => [...current, newMembership()]);

  const requestRemoveMembership = (key: string) => {
    if (memberships.length <= 1) return;
    setRemoveTarget(key);
  };

  const confirmRemoveMembership = () => {
    if (!removeTarget) return;
    setMemberships((current) => current.filter((m) => m.key !== removeTarget));
    setMembershipErrors((current) => {
      const next = { ...current };
      delete next[removeTarget];
      return next;
    });
    setRemoveTarget(null);
  };

  const handleSend = async () => {
    if (!handleValidate()) return;
    setSendError(false);
    setSending(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setSending(false);
      onSent?.();
      onBack();
    } catch {
      setSending(false);
      setSendError(true);
    }
  };

  const orgSheetMembership = memberships.find((m) => m.key === orgSheetFor) ?? null;
  const roleSheetMembership = memberships.find((m) => m.key === roleSheetFor) ?? null;
  const branchSheetMembership = memberships.find((m) => m.key === branchSheetFor) ?? null;
  const branchSheetOrg = branchSheetMembership?.orgId ? BRANCHES[branchSheetMembership.orgId] ?? [] : [];

  const usedOrgIds = new Set(memberships.filter((m) => m.key !== orgSheetFor).map((m) => m.orgId).filter(Boolean));
  const orgOptions = ORGANISATIONS.filter(
    (o) => !usedOrgIds.has(o.id) && o.name.toLowerCase().includes(pickerQuery.trim().toLowerCase())
  );
  const roleOptions = ROLES.filter((r) => r.toLowerCase().includes(pickerQuery.trim().toLowerCase()));
  const branchOptions = branchSheetOrg.filter((b) => b.name.toLowerCase().includes(pickerQuery.trim().toLowerCase()));
  const branchSelectAllChecked =
    branchSheetMembership != null &&
    branchSheetOrg.length > 0 &&
    branchSheetOrg.every((b) => branchSheetMembership.branchIds.includes(b.id));

  const removeTargetMembership = memberships.find((m) => m.key === removeTarget) ?? null;
  const removeTargetIndex = memberships.findIndex((m) => m.key === removeTarget);
  const removeTargetOrgName = removeTargetMembership?.orgId
    ? ORGANISATIONS.find((o) => o.id === removeTargetMembership.orgId)?.name
    : null;

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={handleCancel}>
          <X size={20} color={theme.textPrimary} strokeWidth={2} />
        </Pressable>
        <Text style={styles.headerTitle}>Invite User</Text>
      </View>
      <Text style={[styles.seatLine, seatWarning && styles.seatLineWarning]}>
        {seatsUsed} of {seatsTotal} seats used — this invite will take one.
      </Text>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, (nameError || emailError) && styles.cardError]}>
          <View>
            <Text style={styles.cardTitle}>Identity</Text>
            <Text style={styles.cardSubtitle}>One login per tenant. Roles are assigned per organisation below.</Text>
          </View>

          <Field label="Full name" required error={nameError}>
            <TextInput
              style={[styles.input, nameError && styles.inputError]}
              value={name}
              onChangeText={(v) => { setName(v); setNameError(null); }}
              placeholder="Enter full name"
              placeholderTextColor={theme.textTertiary}
            />
          </Field>

          <Field
            label="Email"
            required
            error={emailDuplicate ? null : emailError}
            errorNode={
              emailDuplicate ? (
                <Text style={styles.errorText}>
                  {emailError} <Text style={styles.viewUserLink}>View user</Text>
                </Text>
              ) : undefined
            }
          >
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              value={email}
              onChangeText={(v) => { setEmail(v); setEmailError(null); setEmailDuplicate(false); }}
              placeholder="name@company.com"
              placeholderTextColor={theme.textTertiary}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </Field>

          <Field label="Phone" hint="Optional">
            <View style={styles.phoneRow}>
              <Text style={styles.phonePrefix}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="98765 43210"
                placeholderTextColor={theme.textTertiary}
                keyboardType="phone-pad"
              />
            </View>
          </Field>
        </View>

        <View style={styles.card}>
          <View>
            <Text style={styles.cardTitle}>Organisation memberships</Text>
            <Text style={styles.cardSubtitle}>One role per organisation. Grant all branches, or pick specific branches.</Text>
          </View>

          {memberships.map((m, index) => (
            <MembershipBlock
              key={m.key}
              membership={m}
              index={index}
              errors={membershipErrors[m.key]}
              orgName={m.orgId ? ORGANISATIONS.find((o) => o.id === m.orgId)?.name ?? null : null}
              canRemove={memberships.length > 1}
              onRemove={() => requestRemoveMembership(m.key)}
              onPressOrg={() => { setPickerQuery(''); setOrgSheetFor(m.key); }}
              onPressRole={() => { if (m.orgId) { setPickerQuery(''); setRoleSheetFor(m.key); } }}
              onPressBranches={() => { if (m.orgId) { setPickerQuery(''); setBranchSheetFor(m.key); } }}
              onToggleAllBranches={(value) => {
                patchMembership(m.key, { allBranches: value });
                clearMembershipError(m.key, 'branches');
              }}
              onRemoveBranchChip={(branchId) => {
                patchMembership(m.key, { branchIds: m.branchIds.filter((id) => id !== branchId) });
              }}
              branches={m.orgId ? BRANCHES[m.orgId] ?? [] : []}
            />
          ))}

          <Pressable style={styles.addMembershipButton} onPress={handleAddMembership}>
            <Plus size={18} color={theme.brandActive} strokeWidth={2.25} />
            <Text style={styles.addMembershipText}>Add membership</Text>
          </Pressable>
        </View>

        {summaryText ? (
          <View style={styles.summaryBanner}>
            <CircleAlert size={16} color={theme.statusDangerStrong} strokeWidth={2} />
            <Text style={styles.summaryText}>{summaryText}</Text>
          </View>
        ) : null}

        {sendError ? (
          <View style={styles.summaryBanner}>
            <CircleAlert size={16} color={theme.statusDangerStrong} strokeWidth={2} />
            <View style={styles.flexShrink}>
              <Text style={styles.summaryText}>Something failed. The invite wasn't sent.</Text>
              <Pressable onPress={handleSend}>
                <Text style={styles.retryText}>Retry</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={handleCancel} disabled={sending}>
          <Text style={[styles.footerCancel, sending && styles.footerCancelDisabled]}>Cancel</Text>
        </Pressable>
        <Pressable style={[styles.sendButton, sending && styles.sendButtonBusy]} onPress={handleSend} disabled={sending}>
          {sending ? (
            <>
              <ActivityIndicator size="small" color={theme.textOnBrand} />
              <Text style={styles.sendButtonText}>Sending invite…</Text>
            </>
          ) : (
            <Text style={styles.sendButtonText}>Send invite</Text>
          )}
        </Pressable>
      </View>

      <PickerSheet
        visible={!!orgSheetMembership}
        title="Select organisation"
        query={pickerQuery}
        onQueryChange={setPickerQuery}
        searchPlaceholder="Search organisations"
        onClose={() => setOrgSheetFor(null)}
      >
        {orgOptions.map((o) => (
          <Pressable
            key={o.id}
            style={styles.pickerRow}
            onPress={() => {
              if (orgSheetMembership) {
                patchMembership(orgSheetMembership.key, { orgId: o.id, role: null, allBranches: true, branchIds: [] });
                clearMembershipError(orgSheetMembership.key, 'org');
              }
              setOrgSheetFor(null);
            }}
          >
            <Text style={styles.pickerRowText}>{o.name}</Text>
            {orgSheetMembership?.orgId === o.id ? <Check size={18} color={theme.brandActive} strokeWidth={2.25} /> : null}
          </Pressable>
        ))}
      </PickerSheet>

      <PickerSheet
        visible={!!roleSheetMembership}
        title="Select role"
        query={pickerQuery}
        onQueryChange={setPickerQuery}
        searchPlaceholder="Search roles"
        onClose={() => setRoleSheetFor(null)}
      >
        {roleOptions.map((r) => (
          <Pressable
            key={r}
            style={styles.pickerRow}
            onPress={() => {
              if (roleSheetMembership) {
                patchMembership(roleSheetMembership.key, { role: r });
                clearMembershipError(roleSheetMembership.key, 'role');
              }
              setRoleSheetFor(null);
            }}
          >
            <Text style={styles.pickerRowText}>{r}</Text>
            {roleSheetMembership?.role === r ? <Check size={18} color={theme.brandActive} strokeWidth={2.25} /> : null}
          </Pressable>
        ))}
      </PickerSheet>

      <Modal visible={!!branchSheetMembership} transparent animationType="slide" onRequestClose={() => setBranchSheetFor(null)}>
        <View style={styles.sheetRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setBranchSheetFor(null)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandleRow}><View style={styles.sheetHandle} /></View>
            <View style={styles.sheetTitleRow}>
              <Text style={styles.sheetTitle}>Select branches</Text>
              <Pressable style={styles.sheetCloseButton} onPress={() => setBranchSheetFor(null)}>
                <X size={18} color={theme.textSecondary} strokeWidth={2} />
              </Pressable>
            </View>
            {branchSheetOrg.length > 0 ? (
              <View style={styles.pickerSearchBar}>
                <Search size={16} color={theme.textTertiary} strokeWidth={1.75} />
                <TextInput
                  style={styles.pickerSearchInput}
                  value={pickerQuery}
                  onChangeText={setPickerQuery}
                  placeholder="Search branches"
                  placeholderTextColor={theme.textTertiary}
                />
              </View>
            ) : null}

            {branchSheetOrg.length === 0 ? (
              <View style={styles.branchEmptyState}>
                <View style={styles.branchEmptyIcon}>
                  <MapPin size={22} color={theme.textTertiary} strokeWidth={1.75} />
                </View>
                <Text style={styles.branchEmptyTitle}>No branches yet</Text>
                <Text style={styles.branchEmptySubtitle}>
                  {ORGANISATIONS.find((o) => o.id === branchSheetMembership?.orgId)?.name} has no branches set up.
                  Branches are managed from Manage → Branches.
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.pickerList} keyboardShouldPersistTaps="handled">
                <Pressable
                  style={styles.selectAllRow}
                  onPress={() => {
                    if (!branchSheetMembership) return;
                    const allIds = branchSheetOrg.map((b) => b.id);
                    patchMembership(branchSheetMembership.key, {
                      branchIds: branchSelectAllChecked ? [] : allIds,
                    });
                  }}
                >
                  <Text style={styles.selectAllText}>Select all</Text>
                  <Checkbox checked={branchSelectAllChecked} />
                </Pressable>
                <Text style={styles.selectAllHint}>Selecting every branch here does not include branches added later.</Text>
                {branchOptions.map((b) => {
                  const checked = !!branchSheetMembership?.branchIds.includes(b.id);
                  return (
                    <Pressable
                      key={b.id}
                      style={styles.branchRow}
                      onPress={() => {
                        if (!branchSheetMembership) return;
                        const next = checked
                          ? branchSheetMembership.branchIds.filter((id) => id !== b.id)
                          : [...branchSheetMembership.branchIds, b.id];
                        patchMembership(branchSheetMembership.key, { branchIds: next });
                        clearMembershipError(branchSheetMembership.key, 'branches');
                      }}
                    >
                      <View style={styles.branchIcon}>
                        <MapPin size={17} color={theme.brandActive} strokeWidth={1.75} />
                      </View>
                      <View style={styles.flex1}>
                        <Text style={styles.branchName}>{b.name}</Text>
                        <Text style={styles.branchCity}>{b.city}</Text>
                      </View>
                      <Checkbox checked={checked} />
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}

            <View style={styles.sheetFooter}>
              <Pressable style={styles.sheetApplyButton} onPress={() => setBranchSheetFor(null)}>
                <Text style={styles.sheetApplyButtonText}>
                  Apply{branchSheetMembership && branchSheetMembership.branchIds.length > 0 ? ` (${branchSheetMembership.branchIds.length})` : ''}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!removeTarget} transparent animationType="slide" onRequestClose={() => setRemoveTarget(null)}>
        <View style={styles.sheetRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setRemoveTarget(null)} />
          <View style={styles.confirmSheet}>
            <View style={styles.sheetHandleRow}><View style={styles.sheetHandle} /></View>
            <View style={styles.confirmSheetBody}>
              <Text style={styles.confirmTitle}>Remove this membership?</Text>
              <Text style={styles.confirmDescription}>
                {removeTargetMembership && membershipHasData(removeTargetMembership)
                  ? `Membership ${removeTargetIndex + 1}${removeTargetOrgName ? ` (${removeTargetOrgName})` : ''} has data entered. Removing it will discard that data.`
                  : `This will remove Membership ${removeTargetIndex + 1}.`}
              </Text>
              <View style={styles.confirmActions}>
                <Pressable style={styles.confirmKeepButton} onPress={() => setRemoveTarget(null)}>
                  <Text style={styles.confirmKeepText}>Keep it</Text>
                </Pressable>
                <Pressable style={styles.confirmRemoveButton} onPress={confirmRemoveMembership}>
                  <Text style={styles.confirmRemoveText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={discardConfirmVisible} transparent animationType="slide" onRequestClose={() => setDiscardConfirmVisible(false)}>
        <View style={styles.sheetRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setDiscardConfirmVisible(false)} />
          <View style={styles.confirmSheet}>
            <View style={styles.sheetHandleRow}><View style={styles.sheetHandle} /></View>
            <View style={styles.confirmSheetBody}>
              <Text style={styles.confirmTitle}>Discard this invite?</Text>
              <Text style={styles.confirmDescription}>You have unsaved changes. Closing now will discard them.</Text>
              <View style={styles.confirmActions}>
                <Pressable style={styles.confirmKeepButton} onPress={() => setDiscardConfirmVisible(false)}>
                  <Text style={styles.confirmKeepText}>Keep editing</Text>
                </Pressable>
                <Pressable style={styles.confirmRemoveButton} onPress={() => { setDiscardConfirmVisible(false); onBack(); }}>
                  <Text style={styles.confirmRemoveText}>Discard</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Field({
  label, required, hint, error, errorNode, children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string | null;
  errorNode?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.fieldLabelRow}>
        <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
        {required ? <Text style={styles.required}>*</Text> : null}
      </View>
      {children}
      {errorNode ? errorNode : error ? <Text style={styles.errorText}>{error}</Text> : hint ? <Text style={styles.hintText}>{hint}</Text> : null}
    </View>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked ? <Check size={13} color={theme.textOnBrand} strokeWidth={3} /> : null}
    </View>
  );
}

function MembershipBlock({
  membership, index, errors, orgName, canRemove, onRemove, onPressOrg, onPressRole, onPressBranches,
  onToggleAllBranches, onRemoveBranchChip, branches,
}: {
  membership: Membership;
  index: number;
  errors?: MembershipErrors;
  orgName: string | null;
  canRemove: boolean;
  onRemove: () => void;
  onPressOrg: () => void;
  onPressRole: () => void;
  onPressBranches: () => void;
  onToggleAllBranches: (value: boolean) => void;
  onRemoveBranchChip: (branchId: string) => void;
  branches: { id: string; name: string; city: string }[];
}) {
  const roleEnabled = !!membership.orgId;
  const selectedBranches = branches.filter((b) => membership.branchIds.includes(b.id));

  return (
    <View style={[styles.membershipBlock, (errors?.org || errors?.role || errors?.branches) && styles.membershipBlockError]}>
      <View style={styles.membershipHeaderRow}>
        <Text style={styles.membershipTitle}>Membership {index + 1}</Text>
        {canRemove ? (
          <Pressable style={styles.removeRow} onPress={onRemove} hitSlop={8}>
            <Trash2 size={16} color={theme.statusDangerStrong} strokeWidth={1.75} />
            <Text style={styles.removeText}>Remove</Text>
          </Pressable>
        ) : null}
      </View>

      <Field label="Organisation" required error={errors?.org}>
        <Pressable style={[styles.selectField, errors?.org && styles.inputError]} onPress={onPressOrg}>
          <Text style={orgName ? styles.selectValue : styles.selectPlaceholder}>{orgName ?? 'Select organisation'}</Text>
          <ChevronDown size={18} color={errors?.org ? theme.statusDangerStrong : theme.textTertiary} strokeWidth={1.75} />
        </Pressable>
      </Field>

      <Field
        label="Role in this organisation"
        required
        error={roleEnabled ? errors?.role : 'Select an organisation first'}
      >
        <Pressable
          style={[styles.selectField, !roleEnabled && styles.selectFieldDisabled, errors?.role && styles.inputError]}
          onPress={onPressRole}
        >
          <Text style={membership.role ? styles.selectValue : roleEnabled ? styles.selectPlaceholder : styles.selectDisabledText}>
            {membership.role ?? (roleEnabled ? 'Select role' : 'Select an organisation first')}
          </Text>
          <ChevronDown
            size={18}
            color={!roleEnabled ? theme.textDisabled : errors?.role ? theme.statusDangerStrong : theme.textTertiary}
            strokeWidth={1.75}
          />
        </Pressable>
      </Field>

      <View style={styles.allBranchesRow}>
        <View style={styles.flex1}>
          <Text style={styles.allBranchesLabel}>All branches</Text>
          <Text style={styles.allBranchesHint}>Grants access to every current and future branch in this organisation.</Text>
        </View>
        <Switch
          value={membership.allBranches}
          onValueChange={onToggleAllBranches}
          trackColor={{ false: theme.borderDefault, true: theme.brandDefault }}
          thumbColor="#fff"
        />
      </View>

      {!membership.allBranches ? (
        <Field label="Branches" required error={errors?.branches}>
          <Pressable style={[styles.selectField, errors?.branches && styles.inputError]} onPress={onPressBranches}>
            <Text style={selectedBranches.length > 0 ? styles.selectValue : styles.selectPlaceholder}>
              {selectedBranches.length > 0 ? `${selectedBranches.length} branch${selectedBranches.length > 1 ? 'es' : ''} selected` : 'Select branches'}
            </Text>
            <ChevronDown size={18} color={errors?.branches ? theme.statusDangerStrong : theme.textTertiary} strokeWidth={1.75} />
          </Pressable>
          {selectedBranches.length > 0 ? (
            <View style={styles.chipRow}>
              {selectedBranches.map((b) => (
                <View key={b.id} style={styles.chip}>
                  <Text style={styles.chipText}>{b.name}</Text>
                  <Pressable onPress={() => onRemoveBranchChip(b.id)} hitSlop={6}>
                    <X size={14} color={theme.brandActive} strokeWidth={2} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </Field>
      ) : null}
    </View>
  );
}

function PickerSheet({
  visible, title, query, onQueryChange, searchPlaceholder, onClose, children,
}: {
  visible: boolean;
  title: string;
  query: string;
  onQueryChange: (v: string) => void;
  searchPlaceholder: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandleRow}><View style={styles.sheetHandle} /></View>
          <View style={styles.sheetTitleRow}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable style={styles.sheetCloseButton} onPress={onClose}>
              <X size={18} color={theme.textSecondary} strokeWidth={2} />
            </Pressable>
          </View>
          <View style={styles.pickerSearchBar}>
            <Search size={16} color={theme.textTertiary} strokeWidth={1.75} />
            <TextInput
              style={styles.pickerSearchInput}
              value={query}
              onChangeText={onQueryChange}
              placeholder={searchPlaceholder}
              placeholderTextColor={theme.textTertiary}
            />
          </View>
          <ScrollView style={styles.pickerList} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
