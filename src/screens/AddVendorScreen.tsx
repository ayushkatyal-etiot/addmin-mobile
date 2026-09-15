import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';
import {
  Camera,
  Check,
  ChevronDown,
  CircleAlert,
  FileText,
  Image as ImageIcon,
  Search,
  Upload,
  X,
} from 'lucide-react-native';

import { useCreateVendor, useGetVendorById, useUpdateVendor } from '../api/vendors';
import { useUser } from '../contexts/UserContext';
import Toast from '../components/Toast';
import Dialog from '../components/Dialog';
import TextField from '../components/TextField';
import type { CreateVendorRequest } from '../types/vendor';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { useFocusEffect } from '@react-navigation/native';
import { styles } from './AddVendorScreen.styles';
import { theme } from '../theme/tokens';

const EXISTING_VENDOR_NAMES = ['Sharma Facility Services', 'Blue Star Ltd', 'Godrej Interio', 'Quess Corp', 'Nilkamal Ltd'];
const STATES = ['Delhi', 'Gujarat', 'Karnataka', 'Maharashtra', 'Tamil Nadu'];

type DocStatus = 'done' | 'progress' | 'failed';
type DocItem = { id: number; name: string; meta: string; status: DocStatus; progress?: number };

type Errors = Partial<Record<
  'name' | 'email' | 'phone' | 'city' | 'state' | 'country' | 'gst' | 'pan' | 'tan' | 'bankAccount' | 'ifsc' | 'bankName' | 'branchName',
  string | null
>>;

type FormState = {
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  address: string;
  city: string;
  state: string;
  country: string;
  gst: string;
  pan: string;
  tan: string;
  bankAccount: string;
  ifsc: string;
  bankName: string;
  branchName: string;
};

const initialForm: FormState = {
  name: '', email: '', phone: '', status: 'active',
  address: '', city: '', state: '', country: '',
  gst: '', pan: '', tan: '',
  bankAccount: '', ifsc: '', bankName: '', branchName: '',
};

const initialDocs: DocItem[] = [
  { id: 1, name: 'GST_certificate.pdf', meta: 'Upload failed', status: 'failed' },
  { id: 2, name: 'Cancelled_cheque.jpg', meta: '', status: 'progress', progress: 60 },
];

type Props = NativeStackScreenProps<RootStackParamList, 'AddVendor'>;

type AddVendorScreenProps = {
  onBack?: () => void;
  route?: { params?: { vendorId?: string } };
};

export default function AddVendorScreen({ onBack = () => {}, route }: AddVendorScreenProps) {
  const vendorId = route?.params?.vendorId;
  const isEditMode = !!vendorId;

  console.log('[AddVendorScreen] Screen mounted/updated - vendorId:', vendorId, 'isEditMode:', isEditMode);

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [docs, setDocs] = useState<DocItem[]>(initialDocs);
  const [docCounter, setDocCounter] = useState(100);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('error');

  const queryClient = useQueryClient();
  const { mutateAsync: createVendor, isPending: isCreating } = useCreateVendor();
  const { mutateAsync: updateVendor, isPending: isUpdating } = useUpdateVendor();
  const { data: vendorData, isLoading: vendorLoading, refetch: refetchVendor, error: vendorError } = useGetVendorById(vendorId || '');
  const { getCurrentOrganisation } = useUser();

  console.log('[AddVendorScreen] useGetVendorById state:', { vendorId, isLoading: vendorLoading, hasData: !!vendorData, error: vendorError?.message });

  // Prefill form when in edit mode
  React.useEffect(() => {
    if (isEditMode && vendorData) {
      setForm({
        name: vendorData.name,
        email: vendorData.email,
        phone: vendorData.phone_number,
        status: vendorData.status === 'active' ? 'active' : 'inactive',
        address: vendorData.address,
        city: vendorData.city,
        state: vendorData.state,
        country: vendorData.country,
        gst: vendorData.gst_number || '',
        pan: vendorData.pan_number || '',
        tan: vendorData.tan_number || '',
        bankAccount: vendorData.bank_account_number ? vendorData.bank_account_number.replace(/X/g, '') : '',
        ifsc: vendorData.ifsc_code || '',
        bankName: vendorData.bank_name || '',
        branchName: vendorData.branch_name || '',
      });
    } else if (!isEditMode) {
      setForm(initialForm);
    }
  }, [vendorId, isEditMode, vendorData]);

  const isDirty =
    form.name !== '' || form.email !== '' || form.phone !== '' || form.status !== 'active' ||
    form.address !== '' || form.city !== '' || form.state !== '' || form.country !== '' ||
    form.gst !== '' || form.pan !== '' || form.tan !== '' ||
    form.bankAccount !== '' || form.ifsc !== '' || form.bankName !== '' || form.branchName !== '';

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));
  const patchErrors = (p: Errors) => setErrors((e) => ({ ...e, ...p }));

  const validate = (): Errors => {
    const err: Errors = {};

    // Mandatory fields
    err.name = form.name.trim()
      ? EXISTING_VENDOR_NAMES.some((n) => n.toLowerCase() === form.name.trim().toLowerCase())
        ? 'A vendor with this name already exists'
        : null
      : 'Vendor name is required';

    err.email = form.email.trim()
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
        ? null
        : 'Enter a valid email address'
      : 'Email is required';

    err.phone = form.phone.replace(/\D/g, '').length >= 10
      ? null
      : 'Enter a valid phone number (at least 10 digits)';

    err.city = form.city.trim() ? null : 'City is required';
    err.state = form.state.trim() ? null : 'State is required';
    err.country = form.country.trim() ? null : 'Country is required';

    // GST validation: 15 characters, format: ##AABCU####A#Z#
    err.gst = form.gst.trim()
      ? /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gst.trim())
        ? null
        : 'Enter a valid GSTIN (e.g., 27AABCS1429B1ZQ)'
      : null;

    // PAN validation: 10 characters, format: AAAAA####A (5 letters, 4 digits, 1 letter)
    err.pan = form.pan.trim()
      ? /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan.trim())
        ? null
        : 'Enter a valid PAN (e.g., AAAAA1234A)'
      : null;

    // TAN validation: 10 characters, format: A#A#A####A (letter, digit pattern)
    err.tan = form.tan.trim()
      ? /^[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{1}[A-Z]{1}[0-9]{4}$/.test(form.tan.trim())
        ? null
        : 'Enter a valid TAN (e.g., A1A1A0001)'
      : null;

    // Banking details - all or nothing
    const bankFields = [form.bankAccount, form.ifsc, form.bankName, form.branchName];
    const bankFilled = bankFields.some((v) => v.trim());
    const bankComplete = bankFields.every((v) => v.trim());

    if (bankFilled && !bankComplete) {
      const msg = 'Complete all banking details or leave them all blank';
      err.bankAccount = form.bankAccount.trim() ? null : msg;
      err.ifsc = form.ifsc.trim() ? null : msg;
      err.bankName = form.bankName.trim() ? null : msg;
      err.branchName = form.branchName.trim() ? null : msg;
    } else if (bankComplete) {
      // IFSC validation: 11 characters, format: ABCD0123456
      err.ifsc = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc.trim())
        ? null
        : 'Enter a valid IFSC code (e.g., SBIN0000456)';
      err.bankAccount = null;
      err.bankName = null;
      err.branchName = null;
    } else {
      err.bankAccount = null;
      err.ifsc = null;
      err.bankName = null;
      err.branchName = null;
    }
    return err;
  };

  const CARD_FIELDS = {
    'Vendor Details': ['name', 'email', 'phone'] as const,
    'Address Details': ['city', 'state', 'country'] as const,
    'Tax Details': ['gst', 'pan', 'tan'] as const,
    'Banking Details': ['bankAccount', 'ifsc', 'bankName', 'branchName'] as const,
  };
  const cardHasError = (fields: readonly string[]) => fields.some((f) => errors[f as keyof Errors]);
  const erroredCardNames = Object.entries(CARD_FIELDS)
    .filter(([, fields]) => (fields as readonly string[]).some((f) => errors[f as keyof Errors]))
    .map(([name]) => name);

  const handleSave = async () => {
    const err = validate();
    setErrors(err);
    const hasError = Object.values(err).some(Boolean);
    if (hasError) return;

    try {
      const phoneNumber = form.phone.trim();
      const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91-${phoneNumber}`;

      const payload: CreateVendorRequest = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone_number: formattedPhone,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        is_active: form.status === 'active',
      };

      // Add optional fields if filled
      if (form.gst.trim()) payload.gst_number = form.gst.trim();
      if (form.pan.trim()) payload.pan_number = form.pan.trim();
      if (form.tan.trim()) payload.tan_number = form.tan.trim();
      if (form.bankAccount.trim()) payload.bank_account_number = form.bankAccount.trim();
      if (form.ifsc.trim()) payload.ifsc_code = form.ifsc.trim();
      if (form.bankName.trim()) payload.bank_name = form.bankName.trim();
      if (form.branchName.trim()) payload.branch_name = form.branchName.trim();

      if (isEditMode && vendorData) {
        console.log('[AddVendorScreen] Updating vendor...');
        await updateVendor({ ...payload, vendorId: vendorData.id });
        setToastType('success');
        setToastMessage('Vendor updated successfully');
      } else {
        const org = getCurrentOrganisation();
        if (!org) {
          setToastType('error');
          setToastMessage('No organisation selected');
          setToastVisible(true);
          return;
        }

        console.log('[AddVendorScreen] Creating vendor...');
        await createVendor(payload);
        setToastType('success');
        setToastMessage('Vendor created successfully');
        // Invalidate vendors list to refresh it
        await queryClient.invalidateQueries({ queryKey: ['vendors'] });
      }

      setToastVisible(true);
      setTimeout(() => onBack(), 1500);
    } catch (err: any) {
      console.error('[AddVendorScreen] Failed to save vendor:', err);
      const message = err?.data?.detail || err?.data?.message || err?.message || 'Failed to save vendor';
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
    setForm(initialForm);
    setErrors({});
  };

  const mockDoc = (kind: 'photo' | 'library' | 'files'): DocItem => {
    const next = docCounter + 1;
    setDocCounter(next);
    const names: Record<string, string> = {
      photo: `Photo_${next}.jpg`, library: `Selected_image_${next}.png`, files: `Document_${next}.pdf`,
    };
    return { id: next, name: names[kind], meta: '1.1 MB', status: 'done' };
  };
  const handleUpload = (kind: 'photo' | 'library' | 'files') => {
    setDocs((d) => [...d, mockDoc(kind)]);
    setUploadSheetOpen(false);
  };
  const removeDoc = (id: number) => setDocs((d) => d.filter((f) => f.id !== id));
  const retryDoc = (id: number) => setDocs((d) => d.map((f) => (f.id === id ? { ...f, status: 'done', meta: '1.1 MB' } : f)));

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable style={styles.closeButton} onPress={handleCancel}>
          <X size={20} color={theme.textPrimary} strokeWidth={1.75} />
        </Pressable>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Vendor' : 'Add Vendor'}</Text>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        <Card title="Vendor Details" hasError={cardHasError(CARD_FIELDS['Vendor Details'])}>
          <TextField
            label="Vendor Name" required
            value={form.name}
            onChangeText={(v) => { patch({ name: v }); patchErrors({ name: null }); }}
            placeholder="Enter vendor name"
            error={errors.name}
          />
          <TextField
            label="Email" required
            value={form.email}
            onChangeText={(v) => { patch({ email: v }); patchErrors({ email: null }); }}
            placeholder="name@vendor.com"
            keyboardType="email-address"
            error={errors.email}
          />
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, errors.phone && styles.labelError]}>
              Phone Number<Text style={styles.required}> *</Text>
            </Text>
            <View style={[styles.phoneRow, errors.phone && styles.inputError]}>
              <Text style={styles.phonePrefix}>+91</Text>
              <TextInput
                style={styles.phoneInput}
                value={form.phone}
                onChangeText={(v) => { patch({ phone: v }); patchErrors({ phone: null }); }}
                placeholder="98765 43210"
                placeholderTextColor={theme.textTertiary}
                keyboardType="phone-pad"
              />
            </View>
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Status<Text style={styles.required}> *</Text>
            </Text>
            <View style={styles.segmented}>
              {(['active', 'inactive'] as const).map((key) => {
                const active = form.status === key;
                return (
                  <Pressable key={key} style={[styles.segment, active && styles.segmentActive]} onPress={() => patch({ status: key })}>
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{key === 'active' ? 'Active' : 'Inactive'}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Card>

        <Card title="Address Details" hasError={cardHasError(CARD_FIELDS['Address Details'])}>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.textarea}
              value={form.address}
              onChangeText={(v) => patch({ address: v })}
              placeholder="Street, area, landmark"
              placeholderTextColor={theme.textTertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
          <TextField
            label="City" required
            value={form.city}
            onChangeText={(v) => { patch({ city: v }); patchErrors({ city: null }); }}
            placeholder="Enter city"
            error={errors.city}
          />
          <TextField
            label="State" required
            value={form.state}
            onChangeText={(v) => { patch({ state: v }); patchErrors({ state: null }); }}
            placeholder="Enter state"
            error={errors.state}
          />
          <TextField
            label="Country" required
            value={form.country}
            onChangeText={(v) => { patch({ country: v }); patchErrors({ country: null }); }}
            placeholder="Enter country"
            error={errors.country}
          />
        </Card>

        <Card
          title="Tax Details"
          subtitle="Optional. Required only if you will claim input tax credit on this vendor's invoices."
          hasError={cardHasError(CARD_FIELDS['Tax Details'])}
        >
          <TextField
            label="GST Number"
            value={form.gst}
            onChangeText={(v) => { patch({ gst: v.toUpperCase() }); patchErrors({ gst: null }); }}
            placeholder="27AABCS1429B1ZQ"
            autoCapitalize="characters"
            error={errors.gst}
          />
          <TextField
            label="PAN Number"
            value={form.pan}
            onChangeText={(v) => { patch({ pan: v.toUpperCase() }); patchErrors({ pan: null }); }}
            placeholder="AAAAA1234A"
            autoCapitalize="characters"
            error={errors.pan}
          />
          <TextField
            label="TAN Number"
            value={form.tan}
            onChangeText={(v) => { patch({ tan: v.toUpperCase() }); patchErrors({ tan: null }); }}
            placeholder="A1A1A0001"
            autoCapitalize="characters"
            error={errors.tan}
          />
        </Card>

        <Card title="Banking Details" hasError={cardHasError(CARD_FIELDS['Banking Details'])}>
          <TextField
            label="Bank Account Number"
            value={form.bankAccount}
            onChangeText={(v) => { patch({ bankAccount: v }); patchErrors({ bankAccount: null }); }}
            placeholder="Enter account number"
            keyboardType="number-pad"
            error={errors.bankAccount}
          />
          <TextField
            label="IFSC Code"
            value={form.ifsc}
            onChangeText={(v) => { patch({ ifsc: v.toUpperCase() }); patchErrors({ ifsc: null }); }}
            placeholder="HDFC0001234"
            autoCapitalize="characters"
            error={errors.ifsc}
          />
          <TextField
            label="Bank Name"
            value={form.bankName}
            onChangeText={(v) => { patch({ bankName: v }); patchErrors({ bankName: null }); }}
            placeholder="Enter bank name"
            error={errors.bankName}
          />
          <TextField
            label="Branch Name"
            value={form.branchName}
            onChangeText={(v) => { patch({ branchName: v }); patchErrors({ branchName: null }); }}
            placeholder="Enter branch name"
            error={errors.branchName}
          />
        </Card>

        <Card title="Documents">
          <Pressable style={styles.uploadDash} onPress={() => setUploadSheetOpen(true)}>
            <Upload size={18} color={theme.brandActive} strokeWidth={1.75} />
            <Text style={styles.uploadDashText}>Upload vendor documents</Text>
          </Pressable>
          {docs.map((doc) => (
            <DocRow key={doc.id} doc={doc} onRemove={() => removeDoc(doc.id)} onRetry={() => retryDoc(doc.id)} />
          ))}
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        {erroredCardNames.length > 0 ? (
          <View style={styles.footerErrorRow}>
            <CircleAlert size={16} color={theme.statusDanger} strokeWidth={2} />
            <Text style={styles.footerErrorText}>
              {erroredCardNames.length} field{erroredCardNames.length > 1 ? 's' : ''} need attention — {erroredCardNames.join(', ')}
            </Text>
          </View>
        ) : null}
        <View style={styles.footerActionsRow}>
          <View style={styles.footerActions}>
            <Pressable onPress={handleCancel}>
              <Text style={styles.footerCancel}>Cancel</Text>
            </Pressable>
            <Pressable disabled={!isDirty} onPress={handleReset}>
              <Text style={[styles.footerReset, !isDirty && styles.footerResetDisabled]}>Reset</Text>
            </Pressable>
          </View>
          <Pressable style={styles.saveButton} onPress={handleSave} disabled={isCreating || isUpdating}>
            <Text style={styles.saveButtonText}>
              {isEditMode ? 'Update Vendor' : 'Add Vendor'}
            </Text>
          </Pressable>
        </View>
      </View>

<Modal visible={uploadSheetOpen} transparent animationType="slide" onRequestClose={() => setUploadSheetOpen(false)}>
        <View style={styles.sheetRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setUploadSheetOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandleRow}><View style={styles.sheetHandle} /></View>
            <View style={styles.uploadOptionsList}>
              <Pressable style={styles.uploadOptionRow} onPress={() => handleUpload('photo')}>
                <Camera size={20} color={theme.textPrimary} strokeWidth={1.75} />
                <Text style={styles.uploadOptionText}>Take photo</Text>
              </Pressable>
              <Pressable style={styles.uploadOptionRow} onPress={() => handleUpload('library')}>
                <ImageIcon size={20} color={theme.textPrimary} strokeWidth={1.75} />
                <Text style={styles.uploadOptionText}>Choose from library</Text>
              </Pressable>
              <Pressable style={styles.uploadOptionRow} onPress={() => handleUpload('files')}>
                <FileText size={20} color={theme.textPrimary} strokeWidth={1.75} />
                <Text style={styles.uploadOptionText}>Browse files</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Dialog
        visible={showDiscardConfirm}
        title="Discard this vendor?"
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

function Card({
  title, subtitle, hasError, children,
}: {
  title: string; subtitle?: string; hasError?: boolean; children: React.ReactNode;
}) {
  return (
    <View style={[styles.card, hasError && styles.cardError]}>
      <View>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}


function DocRow({ doc, onRemove, onRetry }: { doc: DocItem; onRemove: () => void; onRetry: () => void }) {
  const isFailed = doc.status === 'failed';
  const isProgress = doc.status === 'progress';
  return (
    <View style={styles.docRow}>
      <View style={[styles.docIcon, isFailed && styles.docIconFailed]}>
        <FileText size={18} color={isFailed ? theme.statusDangerStrong : theme.statusInfoStrong} strokeWidth={1.75} />
      </View>
      <View style={styles.docText}>
        <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
        {isFailed ? <Text style={styles.docMetaError}>Upload failed</Text> : null}
        {!isFailed && !isProgress ? <Text style={styles.docMeta}>{doc.meta}</Text> : null}
        {isProgress ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${doc.progress ?? 0}%` }]} />
          </View>
        ) : null}
      </View>
      {isFailed ? (
        <Pressable style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.docRemove} onPress={onRemove} hitSlop={8}>
          <X size={16} color={theme.textSecondary} strokeWidth={2} />
        </Pressable>
      )}
    </View>
  );
}
