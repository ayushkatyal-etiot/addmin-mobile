import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

import { radius, shadow, space, theme } from '../theme/tokens';

const EXISTING_VENDOR_NAMES = ['Sharma Facility Services', 'Blue Star Ltd', 'Godrej Interio', 'Quess Corp', 'Nilkamal Ltd'];
const STATES = ['Delhi', 'Gujarat', 'Karnataka', 'Maharashtra', 'Tamil Nadu'];

type DocStatus = 'done' | 'progress' | 'failed';
type DocItem = { id: number; name: string; meta: string; status: DocStatus; progress?: number };

type Errors = Partial<Record<
  'name' | 'email' | 'phone' | 'city' | 'state' | 'gst' | 'bankAccount' | 'ifsc' | 'bankName' | 'branchName',
  string | null
>>;

type FormState = {
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  address: string;
  city: string;
  state: string | null;
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
  address: '', city: '', state: null,
  gst: '', pan: '', tan: '',
  bankAccount: '', ifsc: '', bankName: '', branchName: '',
};

const initialDocs: DocItem[] = [
  { id: 1, name: 'GST_certificate.pdf', meta: 'Upload failed', status: 'failed' },
  { id: 2, name: 'Cancelled_cheque.jpg', meta: '', status: 'progress', progress: 60 },
];

export default function AddVendorScreen({ onBack }: { onBack: () => void }) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Errors>({});
  const [stateSheetOpen, setStateSheetOpen] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [docs, setDocs] = useState<DocItem[]>(initialDocs);
  const [docCounter, setDocCounter] = useState(100);

  const isDirty =
    form.name !== '' || form.email !== '' || form.phone !== '' || form.status !== 'active' ||
    form.address !== '' || form.city !== '' || form.state !== null ||
    form.gst !== '' || form.pan !== '' || form.tan !== '' ||
    form.bankAccount !== '' || form.ifsc !== '' || form.bankName !== '' || form.branchName !== '';

  const patch = (p: Partial<FormState>) => setForm((f) => ({ ...f, ...p }));
  const patchErrors = (p: Errors) => setErrors((e) => ({ ...e, ...p }));

  const filteredStates = STATES.filter((s) => s.toLowerCase().includes(stateSearch.toLowerCase()));

  const validate = (): Errors => {
    const err: Errors = {};
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
    err.phone = form.phone.replace(/\D/g, '').length >= 10 ? null : 'Enter a valid phone number';
    err.city = form.city.trim() ? null : 'City is required';
    err.state = form.state ? null : 'State is required';

    err.gst = form.gst.trim() && form.gst.trim().length !== 15
      ? 'GSTIN must be 15 characters, e.g. 27AABCS1429B1ZQ'
      : null;

    const bankFields = [form.bankAccount, form.ifsc, form.bankName, form.branchName];
    const bankFilled = bankFields.some((v) => v.trim());
    const bankComplete = bankFields.every((v) => v.trim());
    if (bankFilled && !bankComplete) {
      const msg = 'Complete all banking details or leave them all blank';
      err.bankAccount = form.bankAccount.trim() ? null : msg;
      err.ifsc = form.ifsc.trim() ? null : msg;
      err.bankName = form.bankName.trim() ? null : msg;
      err.branchName = form.branchName.trim() ? null : msg;
    } else {
      err.bankAccount = null; err.ifsc = null; err.bankName = null; err.branchName = null;
    }
    return err;
  };

  const CARD_FIELDS = {
    'Vendor Details': ['name', 'email', 'phone'] as const,
    'Address Details': ['city', 'state'] as const,
    'Tax Details': ['gst'] as const,
    'Banking Details': ['bankAccount', 'ifsc', 'bankName', 'branchName'] as const,
  };
  const cardHasError = (fields: readonly string[]) => fields.some((f) => errors[f as keyof Errors]);
  const erroredCardNames = Object.entries(CARD_FIELDS)
    .filter(([, fields]) => (fields as readonly string[]).some((f) => errors[f as keyof Errors]))
    .map(([name]) => name);

  const handleSave = () => {
    const err = validate();
    setErrors(err);
    const hasError = Object.values(err).some(Boolean);
    if (!hasError) onBack();
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
        <Text style={styles.headerTitle}>Add Vendor</Text>
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
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, errors.state && styles.labelError]}>
              State<Text style={styles.required}> *</Text>
            </Text>
            <Pressable style={[styles.pickerRow, errors.state && styles.inputError]} onPress={() => setStateSheetOpen(true)}>
              <Text style={[styles.pickerText, form.state && styles.pickerTextFilled]}>{form.state ?? 'Select state'}</Text>
              <ChevronDown size={18} color={theme.textTertiary} strokeWidth={2} />
            </Pressable>
            {errors.state ? <Text style={styles.errorText}>{errors.state}</Text> : null}
          </View>
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>
              Country<Text style={styles.required}> *</Text>
            </Text>
            <View style={styles.pickerRowDisabled}>
              <Text style={styles.pickerTextFilled}>India</Text>
            </View>
          </View>
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
            onChangeText={(v) => patch({ pan: v.toUpperCase() })}
            placeholder="AABCS1429B"
            autoCapitalize="characters"
          />
          <TextField
            label="TAN Number"
            value={form.tan}
            onChangeText={(v) => patch({ tan: v.toUpperCase() })}
            placeholder="AABC12345A"
            autoCapitalize="characters"
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
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Add Vendor</Text>
          </Pressable>
        </View>
      </View>

      <Modal visible={stateSheetOpen} transparent animationType="slide" onRequestClose={() => setStateSheetOpen(false)}>
        <View style={styles.sheetRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setStateSheetOpen(false)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandleRow}><View style={styles.sheetHandle} /></View>
            <View style={styles.sheetTitleRow}>
              <Text style={styles.sheetTitle}>Select state</Text>
              <Pressable style={styles.sheetCloseButton} onPress={() => setStateSheetOpen(false)}>
                <X size={16} color={theme.textSecondary} strokeWidth={2} />
              </Pressable>
            </View>
            <View style={styles.sheetSearchWrap}>
              <View style={styles.sheetSearchBar}>
                <Search size={16} color={theme.textTertiary} strokeWidth={1.75} />
                <TextInput
                  style={styles.sheetSearchInput}
                  value={stateSearch}
                  onChangeText={setStateSearch}
                  placeholder="Search states"
                  placeholderTextColor={theme.textTertiary}
                />
              </View>
            </View>
            <ScrollView contentContainerStyle={styles.sheetOptionsList}>
              {filteredStates.map((s) => (
                <Pressable
                  key={s}
                  style={styles.sheetOptionRow}
                  onPress={() => { patch({ state: s }); patchErrors({ state: null }); setStateSheetOpen(false); }}
                >
                  <Text style={[styles.sheetOptionText, form.state === s && styles.sheetOptionTextSelected]}>{s}</Text>
                  {form.state === s ? <Check size={18} color={theme.brandDefault} strokeWidth={2.5} /> : null}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

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

      <Modal visible={showDiscardConfirm} transparent animationType="fade" onRequestClose={() => setShowDiscardConfirm(false)}>
        <View style={styles.confirmRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowDiscardConfirm(false)} />
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Discard this vendor?</Text>
            <Text style={styles.confirmDescription}>The details you entered will be lost.</Text>
            <View style={styles.confirmActions}>
              <Pressable style={styles.confirmPrimary} onPress={() => setShowDiscardConfirm(false)}>
                <Text style={styles.confirmPrimaryText}>Keep editing</Text>
              </Pressable>
              <Pressable style={styles.confirmDestructive} onPress={() => { setShowDiscardConfirm(false); onBack(); }}>
                <Text style={styles.confirmDestructiveText}>Discard</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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

function TextField({
  label, required, value, onChangeText, placeholder, error, keyboardType, autoCapitalize,
}: {
  label: string; required?: boolean; value: string; onChangeText: (v: string) => void;
  placeholder?: string; error?: string | null; keyboardType?: 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'characters';
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, error && styles.labelError]}>
        {label}{required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.bgPage },
  header: { flexDirection: 'row', alignItems: 'center', gap: space[2], paddingHorizontal: space[6] - 10, paddingBottom: space[3] },
  closeButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },

  scrollContent: { paddingHorizontal: space[6], paddingBottom: space[6], gap: space[4] },

  card: {
    backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderSubtle, borderRadius: radius.lg,
    padding: space[4], gap: space[4],
  },
  cardError: { borderColor: theme.statusDanger },
  cardTitle: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  cardSubtitle: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: space[1] },

  fieldGroup: { gap: space[1] },
  label: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  labelError: { color: theme.statusDanger },
  required: { color: theme.statusDanger },
  errorText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.statusDanger },

  input: {
    minHeight: 44, paddingHorizontal: space[3], fontSize: 16, fontFamily: 'Urbanist_400Regular',
    color: theme.textPrimary, backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderDefault,
    borderRadius: radius.md,
  },
  inputError: { borderColor: theme.statusDanger },

  phoneRow: {
    flexDirection: 'row', alignItems: 'center', minHeight: 44, backgroundColor: theme.bgRaised,
    borderWidth: 1, borderColor: theme.borderDefault, borderRadius: radius.md, overflow: 'hidden',
  },
  phonePrefix: {
    paddingHorizontal: 10, fontSize: 16, color: theme.textSecondary, height: 44, lineHeight: 44,
    borderRightWidth: 1, borderRightColor: theme.borderDefault,
  },
  phoneInput: { flex: 1, minHeight: 44, paddingHorizontal: space[3], fontSize: 16, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary },

  segmented: { flexDirection: 'row', backgroundColor: theme.bgSunken, borderRadius: radius.md, padding: 3, gap: 3 },
  segment: { flex: 1, height: 38, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: theme.bgRaised, ...shadow[1] },
  segmentText: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textSecondary },
  segmentTextActive: { color: theme.textPrimary },

  textarea: {
    minHeight: 76, padding: space[3], fontSize: 16, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary,
    backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderDefault, borderRadius: radius.md,
  },

  pickerRow: {
    minHeight: 44, paddingHorizontal: space[3], backgroundColor: theme.bgRaised, borderWidth: 1,
    borderColor: theme.borderDefault, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  pickerRowDisabled: {
    minHeight: 44, paddingHorizontal: space[3], backgroundColor: theme.bgRaised, borderWidth: 1,
    borderColor: theme.borderDefault, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  pickerText: { fontSize: 15, color: theme.textTertiary },
  pickerTextFilled: { color: theme.textPrimary, fontSize: 15 },

  uploadDash: {
    minHeight: 44, paddingHorizontal: space[4], backgroundColor: theme.bgSunken, borderWidth: 1, borderColor: theme.borderStrong,
    borderStyle: 'dashed', borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2],
  },
  uploadDashText: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.brandActive },

  docRow: { flexDirection: 'row', alignItems: 'center', gap: space[3] },
  docIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: theme.statusInfoBg, alignItems: 'center', justifyContent: 'center' },
  docIconFailed: { backgroundColor: theme.statusDangerBg },
  docText: { flex: 1, minWidth: 0 },
  docName: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  docMeta: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: 2 },
  docMetaError: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.statusDanger, marginTop: 2 },
  progressTrack: { height: 4, backgroundColor: theme.bgSunken, borderRadius: radius.full, marginTop: space[1] + 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: theme.brandDefault },
  retryButton: { height: 28, paddingHorizontal: space[2] + 2, backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.statusDanger, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  retryButtonText: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDanger },
  docRemove: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

  footer: {
    backgroundColor: theme.bgRaised, borderTopWidth: 1, borderTopColor: theme.borderSubtle,
    paddingHorizontal: space[6], paddingTop: space[3], paddingBottom: space[3], gap: space[2] + 2,
  },
  footerErrorRow: { flexDirection: 'row', alignItems: 'center', gap: space[2] },
  footerErrorText: { flex: 1, fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDanger },
  footerActionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerActions: { flexDirection: 'row', gap: space[4] },
  footerCancel: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  footerReset: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDanger },
  footerResetDisabled: { color: theme.textDisabled },
  saveButton: { height: 44, paddingHorizontal: space[5], backgroundColor: theme.brandDefault, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textOnBrand },

  sheetRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: theme.bgOverlay },
  sheet: { backgroundColor: theme.bgRaised, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '75%' },
  sheetHandleRow: { alignItems: 'center', paddingTop: space[3] },
  sheetHandle: { width: 36, height: 4, borderRadius: radius.full, backgroundColor: theme.borderStrong },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space[5], paddingTop: space[4] },
  sheetTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  sheetCloseButton: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: theme.bgSunken, alignItems: 'center', justifyContent: 'center' },
  sheetSearchWrap: { paddingHorizontal: space[5], paddingTop: space[4] },
  sheetSearchBar: { height: 40, paddingHorizontal: space[3], backgroundColor: theme.bgSunken, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: space[2] },
  sheetSearchInput: { flex: 1, fontSize: 14, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, padding: 0 },
  sheetOptionsList: { paddingHorizontal: space[5], paddingTop: space[3], paddingBottom: space[5] },
  sheetOptionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: space[3], minHeight: 44, borderBottomWidth: 1, borderBottomColor: theme.borderSubtle,
  },
  sheetOptionText: { fontSize: 15, color: theme.textPrimary },
  sheetOptionTextSelected: { fontFamily: 'Urbanist_600SemiBold' },

  uploadOptionsList: { paddingHorizontal: space[5], paddingTop: space[3], paddingBottom: space[6], gap: space[1] },
  uploadOptionRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 52 },
  uploadOptionText: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },

  confirmRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space[6], backgroundColor: theme.bgOverlay },
  confirmCard: { backgroundColor: theme.bgRaised, borderRadius: radius.lg, padding: space[5], width: '100%', maxWidth: 320, ...shadow[4] },
  confirmTitle: { fontSize: 16, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  confirmDescription: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: space[2], lineHeight: 18 },
  confirmActions: { gap: space[2], marginTop: space[5] },
  confirmPrimary: { minHeight: 44, paddingHorizontal: space[4], backgroundColor: theme.brandDefault, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  confirmPrimaryText: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textOnBrand },
  confirmDestructive: { minHeight: 44, paddingHorizontal: space[4], borderWidth: 1, borderColor: theme.statusDanger, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  confirmDestructiveText: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDanger },
});
