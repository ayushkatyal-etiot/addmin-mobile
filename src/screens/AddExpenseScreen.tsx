import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Building2,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  FileText,
  Image as ImageIcon,
  MapPin,
  Plus,
  Search,
  Upload,
  X,
} from 'lucide-react-native';

import { radius, shadow, space, theme } from '../theme/tokens';

const CATEGORIES = ['Utility', 'Rent & Lease', 'Maintenance', 'Office Supplies', 'Cloud & Software', 'Travel', 'Professional Services'];
const SUBCATS: Record<string, string[]> = {
  Utility: ['Electricity', 'Water', 'Gas', 'Internet', 'Telephone'],
  'Rent & Lease': ['Office Rent', 'Warehouse Rent'],
  Maintenance: ['AMC', 'Repairs'],
  'Office Supplies': ['Stationery', 'Pantry'],
  'Cloud & Software': ['SaaS Subscription', 'Hosting'],
  Travel: ['Airfare', 'Local Transport'],
  'Professional Services': ['Legal', 'Consulting'],
};
const NATURES = ['Operating Expense (OPEX)', 'Capital Expense (CAPEX)'];
const BEHAVIORS = ['One-time', 'Recurring'];
const FREQUENCIES = ['Monthly', 'Quarterly', 'Half-yearly', 'Annually'];
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP'];
const CURRENCY_SYMBOLS: Record<string, string> = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };
const DEPARTMENTS = ['Facilities', 'Finance', 'Human Resources', 'IT', 'Operations'];
const PROJECTS = ['Head Office Fitout', 'Mumbai Expansion', 'Annual Maintenance Contract'];
const PAYEE_KINDS = ['Vendor', 'Utility', 'Cloud / SaaS'];
const VENDORS = ['Sharma Facility Services', 'Blue Star Ltd', 'Godrej Interio', 'Quess Corp'];
const UTILITY_PAYEES = ['CESC Ltd', 'Tata Power', 'Mahanagar Gas', 'Airtel Business'];
const SAAS_PAYEES = ['AWS', 'Vercel', 'Google Workspace', 'Zoom'];

type FileStatus = 'done' | 'progress' | 'failed';
type FileKind = 'pdf' | 'image' | 'other';
type FileItem = { id: number; name: string; kind: FileKind; meta: string; status: FileStatus; progress?: number };

type Errors = Partial<Record<string, string | null>>;

type FormState = {
  title: string; titleTouched: boolean;
  category: string | null; subCategory: string | null;
  date: string; nature: string | null; behavior: string | null;
  recurrenceFrequency: string | null; startDate: string; endDate: string;
  step1Complete: boolean;

  payeeKind: string | null; vendor: string | null; payee: string | null;
  consumerNumber: string; accountOrgId: string;
  billPeriodStart: string; billPeriodEnd: string;
  invoiceNumber: string; invoiceDate: string; billDueDate: string;
  step2Complete: boolean; step2Error: boolean;

  currency: string; subtotal: string; taxAmount: string; otherCharges: string;
  tdsApplicable: boolean; tdsRate: string; step3Complete: boolean;

  department: string | null; project: string | null; step4Complete: boolean;

  invoiceFile: FileItem | null;
  supportingFiles: FileItem[];
  notes: string; step5Complete: boolean;

  openStep: 1 | 2 | 3 | 4 | 5;
  errors: Errors;
  blockedMessage: string;
  categoryChangeNotice: boolean; currencyChangeNotice: boolean;
};

const initialState: FormState = {
  title: '', titleTouched: false,
  category: null, subCategory: null,
  date: '', nature: null, behavior: null,
  recurrenceFrequency: null, startDate: '', endDate: '',
  step1Complete: false,

  payeeKind: null, vendor: null, payee: null,
  consumerNumber: '', accountOrgId: '',
  billPeriodStart: '', billPeriodEnd: '',
  invoiceNumber: '', invoiceDate: '', billDueDate: '',
  step2Complete: false, step2Error: false,

  currency: 'INR', subtotal: '', taxAmount: '', otherCharges: '',
  tdsApplicable: false, tdsRate: '', step3Complete: false,

  department: null, project: null, step4Complete: false,

  invoiceFile: null,
  supportingFiles: [
    { id: 1, name: 'Site_photos.zip', kind: 'other', meta: '2.4 MB · uploaded 2 mins ago', status: 'done' },
    { id: 2, name: 'Approval_email.pdf', kind: 'pdf', meta: 'Uploading… 62%', status: 'progress', progress: 62 },
    { id: 3, name: 'Warranty_card.jpg', kind: 'image', meta: 'Upload failed — connection lost', status: 'failed' },
  ],
  notes: '', step5Complete: false,

  openStep: 1,
  errors: {},
  blockedMessage: '',
  categoryChangeNotice: false, currencyChangeNotice: false,
};

function parseDay(str: string): number | null {
  if (!str) return null;
  return parseInt(str.split('/')[0], 10);
}

function fmtNum(n: number): string {
  const neg = n < 0;
  n = Math.abs(n);
  const intPart = n.toFixed(0);
  const last3 = intPart.slice(-3);
  const rest = intPart.slice(0, -3);
  const grouped = rest ? rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3 : last3;
  return (neg ? '-' : '') + grouped;
}

function num(v: string): number {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

// activeSheet identifiers for the option-list bottom sheet
type OptionSheetKind = 'category' | 'subCategory' | 'nature' | 'behavior' | 'frequency' | 'payeeKind' | 'vendor' | 'payee' | 'currency' | 'department' | 'project';
type DateSheetKind = 'date-expense' | 'date-start' | 'date-end' | 'date-invoice' | 'date-due' | 'date-billstart' | 'date-billend';
type ActiveSheet = OptionSheetKind | DateSheetKind | null;

const DATE_SHEET_TITLES: Record<DateSheetKind, string> = {
  'date-expense': 'Expense Date',
  'date-start': 'Start Date',
  'date-end': 'End Date',
  'date-invoice': 'Invoice Date',
  'date-due': 'Bill Due Date',
  'date-billstart': 'Bill Period Start',
  'date-billend': 'Bill Period End',
};

export default function AddExpenseScreen({ onBack }: { onBack: () => void }) {
  const [s, setS] = useState<FormState>(initialState);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [categorySearch, setCategorySearch] = useState('');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [pendingBehavior, setPendingBehavior] = useState<string | null>(null);
  const [showPayeeKindConfirm, setShowPayeeKindConfirm] = useState(false);
  const [pendingPayeeKind, setPendingPayeeKind] = useState<string | null>(null);
  const [uploadSheetOpen, setUploadSheetOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<'invoice' | 'supporting' | null>(null);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
  const [pendingInvoiceFile, setPendingInvoiceFile] = useState<FileItem | null>(null);
  const [fileCounter, setFileCounter] = useState(100);

  const patch = (p: Partial<FormState>) => setS((prev) => ({ ...prev, ...p }));
  const patchErrors = (p: Errors) => setS((prev) => ({ ...prev, errors: { ...prev.errors, ...p } }));

  const openSheet = (kind: ActiveSheet) => {
    setActiveSheet(kind);
    setCategorySearch('');
  };
  const closeSheet = () => setActiveSheet(null);

  // ---- Step 1: Basic Information ----
  const selectCategory = (name: string) => {
    const changed = !!s.category && s.category !== name;
    patch({
      category: name, subCategory: null,
      categoryChangeNotice: changed || s.categoryChangeNotice,
      step2Error: changed && s.step2Complete ? true : s.step2Error,
      step2Complete: changed && s.step2Complete ? false : s.step2Complete,
    });
    patchErrors({ category: null });
    closeSheet();
  };
  const selectSubCategory = (name: string) => { patch({ subCategory: name }); closeSheet(); };
  const selectNature = (name: string) => { patch({ nature: name }); patchErrors({ nature: null }); closeSheet(); };
  const selectFrequency = (name: string) => { patch({ recurrenceFrequency: name }); patchErrors({ recurrenceFrequency: null }); closeSheet(); };

  const selectBehavior = (name: string) => {
    if (name === 'One-time' && s.behavior === 'Recurring' && (s.recurrenceFrequency || s.startDate || s.endDate)) {
      closeSheet();
      setPendingBehavior(name);
      setShowDiscardConfirm(true);
    } else {
      patch({ behavior: name });
      patchErrors({ behavior: null });
      closeSheet();
    }
  };
  const confirmDiscard = () => {
    patch({ behavior: pendingBehavior ?? undefined, recurrenceFrequency: null, startDate: '', endDate: '' });
    patchErrors({ behavior: null, recurrenceFrequency: null, startDate: null, endDate: null });
    setShowDiscardConfirm(false);
    setPendingBehavior(null);
  };
  const cancelDiscard = () => { setShowDiscardConfirm(false); setPendingBehavior(null); };

  const onNext = () => {
    const errors: Errors = { ...s.errors };
    errors.title = s.title.trim() ? null : 'Expense title is required';
    errors.category = s.category ? null : 'Choose a category to continue';
    errors.date = s.date ? null : 'Expense date is required';
    errors.nature = s.nature ? null : 'Select the expense nature';
    errors.behavior = s.behavior ? null : 'Select one-time or recurring';
    if (s.behavior === 'Recurring') {
      errors.recurrenceFrequency = s.recurrenceFrequency ? null : 'Select a frequency';
      errors.startDate = s.startDate ? null : 'Start date is required';
    } else {
      errors.recurrenceFrequency = null;
      errors.startDate = null;
    }
    if (s.endDate && s.startDate) {
      const sd = parseDay(s.startDate), ed = parseDay(s.endDate);
      errors.endDate = ed !== null && sd !== null && ed <= sd ? 'End date must be after start date' : null;
    } else {
      errors.endDate = null;
    }
    const hasError = ['title', 'category', 'date', 'nature', 'behavior', 'recurrenceFrequency', 'startDate', 'endDate'].some((k) => errors[k]);
    if (!hasError) {
      patch({ errors, step1Complete: true, openStep: 2, titleTouched: true });
    } else {
      patch({ errors, titleTouched: true });
    }
  };

  // ---- Step 2: Payee & Invoice Details ----
  const hasVariantData = (kind: string | null) => {
    if (kind === 'Vendor') return !!s.vendor;
    if (kind === 'Utility') return !!(s.payee || s.consumerNumber || s.billPeriodStart || s.billPeriodEnd);
    if (kind === 'Cloud / SaaS') return !!(s.payee || s.accountOrgId);
    return false;
  };
  const clearVariantFields = () => ({ vendor: null, payee: null, consumerNumber: '', accountOrgId: '', billPeriodStart: '', billPeriodEnd: '' });
  const selectPayeeKind = (kind: string) => {
    if (s.payeeKind && s.payeeKind !== kind && hasVariantData(s.payeeKind)) {
      closeSheet();
      setPendingPayeeKind(kind);
      setShowPayeeKindConfirm(true);
    } else {
      patch({ payeeKind: kind, ...clearVariantFields() });
      patchErrors({ payeeKind: null, payee: null, vendor: null });
      closeSheet();
    }
  };
  const confirmPayeeKindSwitch = () => {
    patch({ payeeKind: pendingPayeeKind, ...clearVariantFields() });
    patchErrors({ payeeKind: null, payee: null, vendor: null, billPeriodEnd: null });
    setShowPayeeKindConfirm(false);
    setPendingPayeeKind(null);
  };
  const cancelPayeeKindSwitch = () => { setShowPayeeKindConfirm(false); setPendingPayeeKind(null); };
  const selectVendor = (name: string) => { patch({ vendor: name }); patchErrors({ payee: null }); closeSheet(); };
  const selectPayee = (name: string) => { patch({ payee: name }); patchErrors({ payee: null }); closeSheet(); };

  const selectDay = (day: number) => {
    const formatted = `${day}/10/2026`;
    const t = activeSheet as DateSheetKind;
    if (t === 'date-expense') { patch({ date: formatted }); patchErrors({ date: null }); }
    else if (t === 'date-start') { patch({ startDate: formatted }); patchErrors({ startDate: null, endDate: null }); }
    else if (t === 'date-end') { patch({ endDate: formatted }); patchErrors({ endDate: null }); }
    else if (t === 'date-invoice') { patch({ invoiceDate: formatted }); patchErrors({ invoiceDate: null, billDueDate: null }); }
    else if (t === 'date-due') { patch({ billDueDate: formatted }); patchErrors({ billDueDate: null }); }
    else if (t === 'date-billstart') { patch({ billPeriodStart: formatted }); patchErrors({ billPeriodEnd: null }); }
    else if (t === 'date-billend') { patch({ billPeriodEnd: formatted }); patchErrors({ billPeriodEnd: null }); }
    closeSheet();
  };

  const onNextStep2 = () => {
    const errors: Errors = { ...s.errors };
    errors.payeeKind = s.payeeKind ? null : 'Select a payee kind';
    if (s.payeeKind === 'Vendor') errors.payee = s.vendor ? null : 'Choose a vendor to continue';
    else if (s.payeeKind === 'Utility' || s.payeeKind === 'Cloud / SaaS') errors.payee = s.payee ? null : 'Choose a payee to continue';
    else errors.payee = null;
    errors.invoiceNumber = s.invoiceNumber.trim() ? null : 'Invoice or bill number is required';
    errors.invoiceDate = s.invoiceDate ? null : 'Invoice date is required';
    errors.billDueDate = s.billDueDate ? null : 'Bill due date is required';
    if (s.invoiceDate && s.billDueDate) {
      const inv = parseDay(s.invoiceDate), due = parseDay(s.billDueDate);
      if (inv !== null && due !== null && due < inv) errors.billDueDate = 'Due date cannot be before the invoice date';
    }
    if (s.payeeKind === 'Utility' && s.billPeriodStart && s.billPeriodEnd) {
      const bs = parseDay(s.billPeriodStart), be = parseDay(s.billPeriodEnd);
      errors.billPeriodEnd = bs !== null && be !== null && be < bs ? 'Bill period end must be on or after the start date' : null;
    } else {
      errors.billPeriodEnd = null;
    }
    const hasError = ['payeeKind', 'payee', 'invoiceNumber', 'invoiceDate', 'billDueDate', 'billPeriodEnd'].some((k) => errors[k]);
    if (!hasError) {
      patch({ errors, step2Complete: true, step2Error: false, openStep: s.step2Error ? s.openStep : 3, blockedMessage: '' });
    } else {
      patch({ errors });
    }
  };

  // ---- Step 3: Amount, Tax & TDS ----
  const selectCurrency = (code: string) => {
    const changed = s.currency !== code;
    patch({ currency: code, currencyChangeNotice: changed || s.currencyChangeNotice });
    closeSheet();
  };
  const toggleTds = () => patch({ tdsApplicable: !s.tdsApplicable });
  const onNextStep3 = () => {
    const errors: Errors = { ...s.errors };
    const subtotalNum = parseFloat(s.subtotal);
    errors.subtotal = !s.subtotal || isNaN(subtotalNum) || subtotalNum <= 0 ? 'Subtotal must be greater than zero' : null;
    if (s.tdsApplicable) {
      const rateNum = parseFloat(s.tdsRate);
      errors.tdsRate = s.tdsRate === '' || isNaN(rateNum) || rateNum < 0 || rateNum > 100 ? 'TDS rate must be between 0 and 100' : null;
    } else {
      errors.tdsRate = null;
    }
    const hasError = ['subtotal', 'tdsRate'].some((k) => errors[k]);
    if (!hasError) patch({ errors, step3Complete: true, openStep: 4 });
    else patch({ errors });
  };

  // ---- Step 4: Cost Allocation ----
  const selectDepartment = (name: string) => { patch({ department: name }); closeSheet(); };
  const selectProject = (name: string) => { patch({ project: name }); closeSheet(); };
  const onNextStep4 = () => patch({ step4Complete: true, openStep: 5 });

  // ---- Step 5: Attachments & Notes ----
  const mockFile = (kind: 'photo' | 'library' | 'files'): FileItem => {
    const next = fileCounter + 1;
    setFileCounter(next);
    const names: Record<string, [string, FileKind]> = {
      photo: [`Photo_${next}.jpg`, 'image'],
      library: [`Selected_image_${next}.png`, 'image'],
      files: [`Document_${next}.pdf`, 'pdf'],
    };
    const [name, kindOut] = names[kind];
    return { id: next, name, kind: kindOut, meta: '1.2 MB · uploaded just now', status: 'done' };
  };
  const openInvoiceUploadSheet = () => { setUploadSheetOpen(true); setUploadTarget('invoice'); };
  const openSupportingUploadSheet = () => { setUploadSheetOpen(true); setUploadTarget('supporting'); };
  const closeUploadSheet = () => { setUploadSheetOpen(false); setUploadTarget(null); };
  const handleUpload = (kind: 'photo' | 'library' | 'files') => {
    const file = mockFile(kind);
    if (uploadTarget === 'invoice') {
      if (s.invoiceFile) {
        setUploadSheetOpen(false);
        setPendingInvoiceFile(file);
        setShowReplaceConfirm(true);
      } else {
        patch({ invoiceFile: file });
        patchErrors({ invoiceFile: null });
        setUploadSheetOpen(false);
        setUploadTarget(null);
      }
    } else {
      patch({ supportingFiles: [...s.supportingFiles, file] });
      setUploadSheetOpen(false);
      setUploadTarget(null);
    }
  };
  const confirmReplace = () => {
    patch({ invoiceFile: pendingInvoiceFile });
    patchErrors({ invoiceFile: null });
    setPendingInvoiceFile(null);
    setShowReplaceConfirm(false);
  };
  const cancelReplace = () => { setPendingInvoiceFile(null); setShowReplaceConfirm(false); };
  const removeInvoiceFile = () => patch({ invoiceFile: null });
  const removeSupportingFile = (id: number) => patch({ supportingFiles: s.supportingFiles.filter((f) => f.id !== id) });
  const retrySupportingFile = (id: number) =>
    patch({ supportingFiles: s.supportingFiles.map((f) => (f.id === id ? { ...f, status: 'done', meta: '1.1 MB · uploaded just now' } : f)) });

  const onNextStep5 = () => {
    if (s.step2Error) {
      patch({ blockedMessage: 'Step 2, Payee & Invoice Details needs review.', openStep: 2 });
      return;
    }
    if (!s.invoiceFile) {
      patchErrors({ invoiceFile: 'An invoice file is required' });
    } else {
      patchErrors({ invoiceFile: null });
      patch({ step5Complete: true, blockedMessage: '' });
      onBack();
    }
  };

  // ---- Step gating ----
  const canOpenStep = (n: number) => {
    if (n === 1) return true;
    if (n === 2) return s.step1Complete || s.step2Error;
    if (n === 3) return s.step2Complete;
    if (n === 4) return s.step3Complete;
    if (n === 5) return s.step4Complete;
    return false;
  };
  const gotoStep = (n: 1 | 2 | 3 | 4 | 5) => {
    const complete = [s.step1Complete, s.step2Complete, s.step3Complete, s.step4Complete, s.step5Complete][n - 1];
    if (canOpenStep(n) || complete || (n === 2 && s.step2Error)) patch({ openStep: n });
  };

  const resetForm = () => setS(initialState);
  const resetDisabled = !(s.title || s.category || s.date || s.nature || s.behavior);

  // ---- Derived values ----
  const err = s.errors;
  const natureAbbrev = s.nature ? (s.nature.match(/\(([^)]+)\)/) || [, ''])[1] : '';
  const step1Summary = s.category ? `${s.title} · ${s.category} · ${s.date} · ${natureAbbrev} · ${s.behavior || ''}` : '';
  const payeeName = s.payeeKind === 'Vendor' ? s.vendor : s.payee;
  const step2Summary = payeeName ? `${payeeName} · ${s.invoiceNumber} · Due ${s.billDueDate}` : '';

  const { subtotalNum, taxNum, otherNum, totalNum, tdsAmountNum, netNum } = useMemo(() => {
    const subtotalNum = num(s.subtotal), taxNum = num(s.taxAmount), otherNum = num(s.otherCharges);
    const totalNum = subtotalNum + taxNum + otherNum;
    const tdsAmountNum = s.tdsApplicable ? subtotalNum * (num(s.tdsRate) / 100) : 0;
    const netNum = totalNum - tdsAmountNum;
    return { subtotalNum, taxNum, otherNum, totalNum, tdsAmountNum, netNum };
  }, [s.subtotal, s.taxAmount, s.otherCharges, s.tdsApplicable, s.tdsRate]);
  const sym = CURRENCY_SYMBOLS[s.currency] || '₹';
  const step3Summary = s.tdsApplicable ? `${sym}${fmtNum(totalNum)} total · ${sym}${fmtNum(netNum)} net payable` : `${sym}${fmtNum(totalNum)} total`;
  const step4Summary = s.department || s.project ? [s.department, s.project].filter(Boolean).join(' · ') : 'Not allocated';
  const supportingDoneCount = s.supportingFiles.filter((f) => f.status !== 'failed').length;
  const step5Summary = s.invoiceFile ? (supportingDoneCount > 0 ? `Invoice + ${supportingDoneCount} supporting files` : 'Invoice only') : '';

  const step2State: 'error' | 'complete' | 'active' | 'locked' = s.step2Error ? 'error' : s.step2Complete ? 'complete' : s.step1Complete ? 'active' : 'locked';
  const step3State: 'complete' | 'active' | 'locked' = s.step3Complete ? 'complete' : s.step2Complete ? 'active' : 'locked';
  const step4State: 'complete' | 'active' | 'locked' = s.step4Complete ? 'complete' : s.step3Complete ? 'active' : 'locked';
  const step5State: 'complete' | 'active' | 'locked' = s.step5Complete ? 'complete' : s.step4Complete ? 'active' : 'locked';

  // ---- Option sheet contents ----
  const mkOptions = (list: string[], current: string | null, onSelect: (name: string) => void) =>
    list.map((name) => ({ name, selected: name === current, onSelect: () => onSelect(name) }));

  let sheetTitle = '';
  let sheetOptions: { name: string; selected: boolean; onSelect: () => void }[] = [];
  let sheetShowSearch = false;
  if (activeSheet === 'category') {
    sheetTitle = 'Expense Category';
    sheetShowSearch = true;
    sheetOptions = mkOptions(CATEGORIES.filter((c) => c.toLowerCase().includes(categorySearch.toLowerCase())), s.category, selectCategory);
  } else if (activeSheet === 'subCategory') {
    sheetTitle = 'Sub Category';
    sheetOptions = mkOptions(SUBCATS[s.category || ''] || [], s.subCategory, selectSubCategory);
  } else if (activeSheet === 'nature') {
    sheetTitle = 'Expense Nature';
    sheetOptions = mkOptions(NATURES, s.nature, selectNature);
  } else if (activeSheet === 'behavior') {
    sheetTitle = 'Expense Behavior';
    sheetOptions = mkOptions(BEHAVIORS, s.behavior, selectBehavior);
  } else if (activeSheet === 'frequency') {
    sheetTitle = 'Recurrence Frequency';
    sheetOptions = mkOptions(FREQUENCIES, s.recurrenceFrequency, selectFrequency);
  } else if (activeSheet === 'payeeKind') {
    sheetTitle = 'Payee Kind';
    sheetOptions = mkOptions(PAYEE_KINDS, s.payeeKind, selectPayeeKind);
  } else if (activeSheet === 'vendor') {
    sheetTitle = 'Vendor';
    sheetShowSearch = true;
    sheetOptions = mkOptions(VENDORS.filter((c) => c.toLowerCase().includes(categorySearch.toLowerCase())), s.vendor, selectVendor);
  } else if (activeSheet === 'payee') {
    sheetTitle = 'Payee';
    sheetShowSearch = true;
    const list = s.payeeKind === 'Utility' ? UTILITY_PAYEES : SAAS_PAYEES;
    sheetOptions = mkOptions(list.filter((c) => c.toLowerCase().includes(categorySearch.toLowerCase())), s.payee, selectPayee);
  } else if (activeSheet === 'currency') {
    sheetTitle = 'Currency';
    sheetOptions = mkOptions(CURRENCIES, s.currency, selectCurrency);
  } else if (activeSheet === 'department') {
    sheetTitle = 'Department';
    sheetOptions = mkOptions(DEPARTMENTS, s.department, selectDepartment);
  } else if (activeSheet === 'project') {
    sheetTitle = 'Project';
    sheetOptions = mkOptions(PROJECTS, s.project, selectProject);
  }
  const optionSheetKinds: OptionSheetKind[] = ['category', 'subCategory', 'nature', 'behavior', 'frequency', 'payeeKind', 'vendor', 'payee', 'currency', 'department', 'project'];
  const sheetOpen = activeSheet !== null && optionSheetKinds.includes(activeSheet as OptionSheetKind);
  const sheetEmpty = sheetOpen && sheetOptions.length === 0;

  const dateSheetKinds: DateSheetKind[] = ['date-expense', 'date-start', 'date-end', 'date-invoice', 'date-due', 'date-billstart', 'date-billend'];
  const dateSheetOpen = activeSheet !== null && dateSheetKinds.includes(activeSheet as DateSheetKind);
  const dateSheetTitle = dateSheetOpen ? DATE_SHEET_TITLES[activeSheet as DateSheetKind] : '';
  let highlightDay: number | null = null;
  if (activeSheet === 'date-expense') highlightDay = parseDay(s.date);
  else if (activeSheet === 'date-start') highlightDay = parseDay(s.startDate);
  else if (activeSheet === 'date-end') highlightDay = parseDay(s.endDate);
  else if (activeSheet === 'date-invoice') highlightDay = parseDay(s.invoiceDate);
  else if (activeSheet === 'date-due') highlightDay = parseDay(s.billDueDate);
  else if (activeSheet === 'date-billstart') highlightDay = parseDay(s.billPeriodStart);
  else if (activeSheet === 'date-billend') highlightDay = parseDay(s.billPeriodEnd);

  return (
    <SafeAreaView style={styles.flex} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable style={styles.headerClose} onPress={onBack}>
          <X size={20} color={theme.textPrimary} strokeWidth={1.75} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Expense</Text>
      </View>
      <View style={styles.scopeRow}>
        <Building2 size={14} color={theme.textTertiary} strokeWidth={1.75} />
        <Text style={styles.scopeText} numberOfLines={1}>Acme Group</Text>
        <Text style={styles.scopeDot}>·</Text>
        <MapPin size={14} color={theme.textTertiary} strokeWidth={1.75} />
        <Text style={styles.scopeText} numberOfLines={1}>Mumbai Office</Text>
      </View>

      <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
        {s.blockedMessage ? (
          <View style={styles.blockedBanner}>
            <CircleAlert size={16} color={theme.statusDangerStrong} strokeWidth={2} />
            <Text style={styles.blockedText}>{s.blockedMessage}</Text>
          </View>
        ) : null}

        {/* Step 1 */}
        <StepCard
          number={1}
          title="Basic Information"
          state={s.step1Complete ? 'complete' : 'active'}
          summary={step1Summary}
          open={s.openStep === 1}
          onPress={() => gotoStep(1)}
        >
          <TextField
            label="Expense Title" required
            value={s.title}
            onChangeText={(v) => patch({ title: v })}
            onBlur={() => patch({ titleTouched: true })}
            placeholder="Enter expense title"
            error={err.title}
          />
          <PickerField
            label="Expense Category" required
            display={s.category || 'Select expense category'}
            filled={!!s.category}
            error={err.category}
            helper={!err.category ? 'From Expenses → Categories' : undefined}
            notice={s.categoryChangeNotice ? 'This may affect the payee selected in Step 2.' : undefined}
            onPress={() => openSheet('category')}
          />
          <PickerField
            label="Sub Category"
            display={s.subCategory || 'Select sub category'}
            filled={!!s.subCategory}
            disabled={!s.category}
            helper={!s.category ? 'Select a category first' : 'From the chosen category'}
            onPress={() => { if (s.category) openSheet('subCategory'); }}
          />
          <DateField
            label="Expense Date" required
            display={s.date || 'dd/mm/yyyy'}
            filled={!!s.date}
            error={err.date}
            onPress={() => openSheet('date-expense')}
          />
          <PickerField
            label="Expense Nature" required
            display={s.nature || 'Select nature'}
            filled={!!s.nature}
            error={err.nature}
            onPress={() => openSheet('nature')}
          />
          <PickerField
            label="Expense Behavior" required
            display={s.behavior || 'Select behavior'}
            filled={!!s.behavior}
            error={err.behavior}
            onPress={() => openSheet('behavior')}
          />
          {s.behavior === 'Recurring' ? (
            <View style={styles.subGroup}>
              <PickerField
                label="Recurrence Frequency" required
                display={s.recurrenceFrequency || 'Select frequency'}
                filled={!!s.recurrenceFrequency}
                error={err.recurrenceFrequency}
                onPress={() => openSheet('frequency')}
              />
              <DateField
                label="Start Date" required
                display={s.startDate || 'dd/mm/yyyy'}
                filled={!!s.startDate}
                error={err.startDate}
                onPress={() => openSheet('date-start')}
              />
              <DateField
                label="End Date"
                display={s.endDate || 'dd/mm/yyyy'}
                filled={!!s.endDate}
                error={err.endDate}
                helper={!err.endDate ? 'Leave blank if ongoing' : undefined}
                onPress={() => openSheet('date-end')}
              />
            </View>
          ) : null}
          <PrimaryButton label="Next" onPress={onNext} />
        </StepCard>

        {/* Step 2 */}
        <StepCard
          number={2}
          title="Payee & Invoice Details"
          state={step2State}
          summary={step2Summary}
          open={s.openStep === 2}
          onPress={() => gotoStep(2)}
        >
          <PickerField
            label="Payee Kind" required
            display={s.payeeKind || 'Select payee kind'}
            filled={!!s.payeeKind}
            error={err.payeeKind}
            onPress={() => openSheet('payeeKind')}
          />
          {s.payeeKind === 'Vendor' ? (
            <PickerField
              label="Vendor" required
              display={s.vendor || 'Select vendor'}
              filled={!!s.vendor}
              error={err.payee}
              helper={!err.payee ? 'Managed under Vendors' : undefined}
              onPress={() => openSheet('vendor')}
            />
          ) : null}
          {s.payeeKind === 'Utility' ? (
            <>
              <PickerField
                label="Payee" required
                display={s.payee || 'Select payee'}
                filled={!!s.payee}
                error={err.payee}
                helper={!err.payee ? 'Managed under Settings → Payees' : undefined}
                onPress={() => openSheet('payee')}
              />
              <TextField
                label="Consumer / CA Number"
                value={s.consumerNumber}
                onChangeText={(v) => patch({ consumerNumber: v })}
                placeholder="Connection consumer number"
              />
              <DateField
                label="Bill Period Start"
                display={s.billPeriodStart || 'dd/mm/yyyy'}
                filled={!!s.billPeriodStart}
                onPress={() => openSheet('date-billstart')}
              />
              <DateField
                label="Bill Period End"
                display={s.billPeriodEnd || 'dd/mm/yyyy'}
                filled={!!s.billPeriodEnd}
                error={err.billPeriodEnd}
                onPress={() => openSheet('date-billend')}
              />
            </>
          ) : null}
          {s.payeeKind === 'Cloud / SaaS' ? (
            <>
              <PickerField
                label="Payee" required
                display={s.payee || 'Select payee'}
                filled={!!s.payee}
                error={err.payee}
                helper={!err.payee ? 'Managed under Settings → Payees' : undefined}
                onPress={() => openSheet('payee')}
              />
              <TextField
                label="Account / Org ID"
                value={s.accountOrgId}
                onChangeText={(v) => patch({ accountOrgId: v })}
                placeholder="AWS account or Vercel team"
              />
            </>
          ) : null}
          <TextField
            label="Invoice / Bill Number" required
            value={s.invoiceNumber}
            onChangeText={(v) => { patch({ invoiceNumber: v }); patchErrors({ invoiceNumber: null }); }}
            placeholder="e.g. INV-88213"
            error={err.invoiceNumber}
          />
          <DateField
            label="Invoice Date" required
            display={s.invoiceDate || 'dd/mm/yyyy'}
            filled={!!s.invoiceDate}
            error={err.invoiceDate}
            onPress={() => openSheet('date-invoice')}
          />
          <DateField
            label="Bill Due Date" required
            display={s.billDueDate || 'dd/mm/yyyy'}
            filled={!!s.billDueDate}
            error={err.billDueDate}
            onPress={() => openSheet('date-due')}
          />
          <View style={styles.buttonRow}>
            <SecondaryButton label="Previous" onPress={() => gotoStep(1)} />
            <PrimaryButton label="Next" flex onPress={onNextStep2} />
          </View>
        </StepCard>

        {/* Step 3 */}
        <StepCard
          number={3}
          title="Amount, Tax & TDS"
          state={step3State}
          summary={step3Summary}
          open={s.openStep === 3}
          onPress={() => gotoStep(3)}
        >
          <PickerField
            label="Currency" required
            display={s.currency}
            filled
            notice={s.currencyChangeNotice ? 'Amounts are not converted.' : undefined}
            onPress={() => openSheet('currency')}
          />
          <AmountField
            label="Subtotal" required symbol={sym}
            value={s.subtotal}
            onChangeText={(v) => { patch({ subtotal: v }); patchErrors({ subtotal: null }); }}
            error={err.subtotal}
          />
          <AmountField
            label="Tax Amount" symbol={sym}
            value={s.taxAmount}
            onChangeText={(v) => patch({ taxAmount: v })}
          />
          <AmountField
            label="Other Charges" symbol={sym}
            value={s.otherCharges}
            onChangeText={(v) => patch({ otherCharges: v })}
          />
          <Pressable style={styles.toggleRow} onPress={toggleTds}>
            <Text style={styles.toggleLabel}>TDS Applicable</Text>
            <View style={[styles.toggleTrack, s.tdsApplicable && styles.toggleTrackOn]}>
              <View style={[styles.toggleThumb, s.tdsApplicable && styles.toggleThumbOn]} />
            </View>
          </Pressable>
          {s.tdsApplicable ? (
            <View style={styles.subGroup}>
              <TextField
                label="TDS Rate (%)" required
                value={s.tdsRate}
                onChangeText={(v) => { patch({ tdsRate: v }); patchErrors({ tdsRate: null }); }}
                placeholder="Enter TDS rate"
                keyboardType="decimal-pad"
                error={err.tdsRate}
              />
            </View>
          ) : null}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Amount</Text>
              <Text style={styles.summaryValue}>{sym}{fmtNum(totalNum)}</Text>
            </View>
            {s.tdsApplicable ? (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>TDS ({s.tdsRate || 0}%)</Text>
                <Text style={styles.summaryValue}>−{sym}{fmtNum(tdsAmountNum)}</Text>
              </View>
            ) : null}
            <View style={styles.summaryDivider}>
              <Text style={styles.netLabel}>Net Payable</Text>
              <Text style={styles.netValue}>{sym}{fmtNum(netNum)}</Text>
            </View>
            {s.tdsApplicable && tdsAmountNum > totalNum ? (
              <Text style={styles.warningText}>TDS exceeds the total amount</Text>
            ) : null}
          </View>
          <View style={styles.buttonRow}>
            <SecondaryButton label="Previous" onPress={() => gotoStep(2)} />
            <PrimaryButton label="Next" flex onPress={onNextStep3} />
          </View>
        </StepCard>

        {/* Step 4 */}
        <StepCard
          number={4}
          title="Cost Allocation"
          state={step4State}
          summary={step4Summary}
          open={s.openStep === 4}
          onPress={() => gotoStep(4)}
        >
          <PickerField
            label="Department"
            display={s.department || 'Select department'}
            filled={!!s.department}
            helper="Settings → Departments"
            onPress={() => openSheet('department')}
          />
          <PickerField
            label="Project"
            display={s.project || 'Select project'}
            filled={!!s.project}
            helper="Settings → Projects"
            onPress={() => openSheet('project')}
          />
          <Text style={styles.hintText}>Cost allocation is optional and can be set later.</Text>
          <View style={styles.buttonRow}>
            <SecondaryButton label="Previous" onPress={() => gotoStep(3)} />
            <PrimaryButton label="Next" flex onPress={onNextStep4} />
          </View>
        </StepCard>

        {/* Step 5 */}
        <StepCard
          number={5}
          title="Attachments & Notes"
          state={step5State}
          summary={step5Summary}
          open={s.openStep === 5}
          onPress={() => gotoStep(5)}
        >
          <View style={styles.fieldGroup}>
            <Text style={[styles.label, err.invoiceFile && styles.labelError]}>
              Invoice File<Text style={styles.required}> *</Text>
            </Text>
            {s.invoiceFile ? (
              <FileRow file={s.invoiceFile} onRemove={removeInvoiceFile} />
            ) : (
              <Pressable
                style={[styles.uploadDash, err.invoiceFile && styles.uploadDashError]}
                onPress={openInvoiceUploadSheet}
              >
                <Upload size={18} color={theme.brandDefault} strokeWidth={1.75} />
                <Text style={styles.uploadDashText}>Upload invoice</Text>
              </Pressable>
            )}
            {err.invoiceFile ? <Text style={styles.errorText}>{err.invoiceFile}</Text> : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Supporting Documents</Text>
            {s.supportingFiles.map((f) => (
              <FileRow
                key={f.id}
                file={f}
                onRemove={() => removeSupportingFile(f.id)}
                onRetry={() => retrySupportingFile(f.id)}
              />
            ))}
            <Pressable style={styles.uploadDash} onPress={openSupportingUploadSheet}>
              <Plus size={18} color={theme.brandDefault} strokeWidth={1.75} />
              <Text style={styles.uploadDashText}>Add file</Text>
            </Pressable>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.textarea}
              value={s.notes}
              onChangeText={(v) => patch({ notes: v })}
              placeholder="Enter additional notes"
              placeholderTextColor={theme.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonRow}>
            <SecondaryButton label="Previous" onPress={() => gotoStep(4)} />
            <PrimaryButton label="Add Expense" flex onPress={onNextStep5} />
          </View>
        </StepCard>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerActions}>
          <Pressable onPress={onBack}>
            <Text style={styles.footerCancel}>Cancel</Text>
          </Pressable>
          <Pressable disabled={resetDisabled} onPress={resetForm}>
            <Text style={[styles.footerReset, resetDisabled && styles.footerResetDisabled]}>Reset</Text>
          </Pressable>
        </View>
        <Text style={styles.footerStep}>Step {s.openStep} of 5</Text>
      </View>

      {/* Option picker sheet */}
      <Modal visible={sheetOpen} transparent animationType="slide" onRequestClose={closeSheet}>
        <View style={styles.sheetRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
          <View style={[styles.sheet, styles.optionSheet]}>
            <View style={styles.sheetHandleRow}><View style={styles.sheetHandle} /></View>
            <View style={styles.sheetTitleRow}>
              <Text style={styles.sheetTitle}>{sheetTitle}</Text>
              <Pressable style={styles.sheetCloseButton} onPress={closeSheet}>
                <X size={16} color={theme.textSecondary} strokeWidth={2} />
              </Pressable>
            </View>
            {sheetShowSearch ? (
              <View style={styles.sheetSearchWrap}>
                <View style={styles.sheetSearchBar}>
                  <Search size={16} color={theme.textTertiary} strokeWidth={1.75} />
                  <TextInput
                    style={styles.sheetSearchInput}
                    value={categorySearch}
                    onChangeText={setCategorySearch}
                    placeholder="Search"
                    placeholderTextColor={theme.textTertiary}
                  />
                </View>
              </View>
            ) : null}
            <ScrollView contentContainerStyle={styles.sheetOptionsList}>
              {sheetOptions.map((opt) => (
                <Pressable key={opt.name} style={styles.sheetOptionRow} onPress={opt.onSelect}>
                  <Text style={styles.sheetOptionText}>{opt.name}</Text>
                  {opt.selected ? <Check size={18} color={theme.brandDefault} strokeWidth={2.5} /> : null}
                </Pressable>
              ))}
              {sheetEmpty ? (
                <View style={styles.sheetEmptyState}>
                  <Search size={32} color={theme.textTertiary} strokeWidth={1.75} />
                  <Text style={styles.emptyTitle}>No matches</Text>
                  <Text style={styles.emptySubtitle}>Try a different search term</Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Date picker sheet */}
      <Modal visible={dateSheetOpen} transparent animationType="slide" onRequestClose={closeSheet}>
        <View style={styles.sheetRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
          <View style={[styles.sheet, styles.dateSheet]}>
            <View style={styles.sheetHandleRow}><View style={styles.sheetHandle} /></View>
            <View style={styles.sheetTitleRow}>
              <Text style={styles.sheetTitle}>{dateSheetTitle}</Text>
              <Pressable style={styles.sheetCloseButton} onPress={closeSheet}>
                <X size={16} color={theme.textSecondary} strokeWidth={2} />
              </Pressable>
            </View>
            <Text style={styles.calendarMonth}>October 2026</Text>
            <ScrollView contentContainerStyle={styles.calendarGrid}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const selected = day === highlightDay;
                return (
                  <Pressable
                    key={day}
                    style={[styles.calendarDay, selected && styles.calendarDaySelected]}
                    onPress={() => selectDay(day)}
                  >
                    <Text style={[styles.calendarDayText, selected && styles.calendarDayTextSelected]}>{day}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Upload action sheet */}
      <Modal visible={uploadSheetOpen} transparent animationType="slide" onRequestClose={closeUploadSheet}>
        <View style={styles.sheetRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeUploadSheet} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandleRow}><View style={styles.sheetHandle} /></View>
            <Text style={styles.uploadSheetTitle}>Add a file</Text>
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

      <ConfirmDialog
        visible={showDiscardConfirm}
        title="Discard recurrence details?"
        description="Switching to one-time will clear the frequency, start date, and end date you entered."
        confirmLabel="Discard"
        onCancel={cancelDiscard}
        onConfirm={confirmDiscard}
      />
      <ConfirmDialog
        visible={showPayeeKindConfirm}
        title="Discard payee details?"
        description="Changing the payee kind will clear the payee and related fields you entered. Invoice details are kept."
        confirmLabel="Discard"
        onCancel={cancelPayeeKindSwitch}
        onConfirm={confirmPayeeKindSwitch}
      />
      <ConfirmDialog
        visible={showReplaceConfirm}
        title="Replace invoice file?"
        description="Only one invoice file is allowed. Uploading a new one replaces the current file."
        confirmLabel="Replace"
        onCancel={cancelReplace}
        onConfirm={confirmReplace}
      />
    </SafeAreaView>
  );
}

// ---------------- Reusable pieces ----------------

type StepState = 'complete' | 'active' | 'locked' | 'error';

function StepCard({
  number, title, state, summary, open, onPress, children,
}: {
  number: number; title: string; state: StepState; summary?: string;
  open: boolean; onPress: () => void; children: React.ReactNode;
}) {
  const labelColor = state === 'locked' ? theme.textTertiary : state === 'error' ? theme.statusDanger : theme.textPrimary;
  const chevronColor = state === 'locked' ? theme.textTertiary : theme.textSecondary;
  return (
    <View style={styles.card}>
      <Pressable style={styles.cardHeader} onPress={onPress}>
        <StepBadge number={number} state={state} />
        <View style={styles.cardHeaderText}>
          <Text style={[styles.cardHeaderTitle, { color: labelColor }]}>{title}</Text>
          {state === 'complete' && summary ? (
            <Text style={styles.cardHeaderSummary} numberOfLines={1}>{summary}</Text>
          ) : null}
          {state === 'error' ? <Text style={styles.cardHeaderError}>Needs review</Text> : null}
        </View>
        {open ? (
          <ChevronUp size={18} color={theme.textSecondary} strokeWidth={2} />
        ) : (
          <ChevronDown size={18} color={chevronColor} strokeWidth={2} />
        )}
      </Pressable>
      {open ? <View style={styles.cardBody}>{children}</View> : null}
    </View>
  );
}

function StepBadge({ number, state }: { number: number; state: StepState }) {
  if (state === 'complete') {
    return (
      <View style={[styles.badge, styles.badgeBrand]}>
        <Check size={14} color={theme.textOnBrand} strokeWidth={3} />
      </View>
    );
  }
  if (state === 'error') {
    return (
      <View style={[styles.badge, styles.badgeDanger]}>
        <CircleAlert size={16} color="#FFFFFF" strokeWidth={2} />
      </View>
    );
  }
  if (state === 'active') {
    return (
      <View style={[styles.badge, styles.badgeBrand]}>
        <Text style={styles.badgeText}>{number}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.badge, styles.badgeLocked]}>
      <Text style={styles.badgeTextLocked}>{number}</Text>
    </View>
  );
}

function TextField({
  label, required, value, onChangeText, onBlur, placeholder, error, keyboardType,
}: {
  label: string; required?: boolean; value: string; onChangeText: (v: string) => void;
  onBlur?: () => void; placeholder?: string; error?: string | null; keyboardType?: 'decimal-pad';
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
        onBlur={onBlur}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        keyboardType={keyboardType}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function AmountField({
  label, required, symbol, value, onChangeText, error,
}: {
  label: string; required?: boolean; symbol: string; value: string; onChangeText: (v: string) => void; error?: string | null;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, error && styles.labelError]}>
        {label}{required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <View style={[styles.amountRow, error && styles.inputError]}>
        <Text style={styles.amountSymbol}>{symbol}</Text>
        <TextInput
          style={styles.amountInput}
          value={value}
          onChangeText={onChangeText}
          placeholder="0"
          placeholderTextColor={theme.textTertiary}
          keyboardType="decimal-pad"
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

function PickerField({
  label, required, display, filled, disabled, error, helper, notice, onPress,
}: {
  label: string; required?: boolean; display: string; filled: boolean; disabled?: boolean;
  error?: string | null; helper?: string; notice?: string; onPress: () => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, disabled && styles.labelDisabled, error && styles.labelError]}>
        {label}{required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <Pressable
        style={[styles.pickerRow, disabled && styles.pickerRowDisabled, error && styles.inputError]}
        disabled={disabled}
        onPress={onPress}
      >
        <Text style={[styles.pickerText, filled ? styles.pickerTextFilled : disabled && styles.pickerTextDisabled]} numberOfLines={1}>
          {display}
        </Text>
        <ChevronDown size={18} color={disabled ? theme.textDisabled : theme.textTertiary} strokeWidth={2} />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : helper ? <Text style={styles.helperText}>{helper}</Text> : null}
      {notice ? <Text style={styles.noticeText}>{notice}</Text> : null}
    </View>
  );
}

function DateField({
  label, required, display, filled, error, helper, onPress,
}: {
  label: string; required?: boolean; display: string; filled: boolean; error?: string | null; helper?: string; onPress: () => void;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, error && styles.labelError]}>
        {label}{required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <Pressable style={[styles.pickerRow, error && styles.inputError]} onPress={onPress}>
        <Text style={[styles.pickerText, filled && styles.pickerTextFilled]}>{display}</Text>
        <ChevronDown size={18} color={theme.textTertiary} strokeWidth={2} />
      </Pressable>
      {error ? <Text style={styles.errorText}>{error}</Text> : helper ? <Text style={styles.helperText}>{helper}</Text> : null}
    </View>
  );
}

function PrimaryButton({ label, onPress, flex }: { label: string; onPress: () => void; flex?: boolean }) {
  return (
    <Pressable style={[styles.primaryButton, flex && styles.flex1]} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}
function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.secondaryButton} onPress={onPress}>
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

function FileRow({ file, onRemove, onRetry }: { file: FileItem; onRemove: () => void; onRetry?: () => void }) {
  const Icon = file.kind === 'image' ? ImageIcon : FileText;
  const iconColor = file.status === 'failed' ? theme.statusDanger : theme.textSecondary;
  return (
    <View style={styles.fileRow}>
      <View style={styles.fileIcon}><Icon size={18} color={iconColor} strokeWidth={1.75} /></View>
      <View style={styles.fileText}>
        <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
        <Text style={[styles.fileMeta, file.status === 'failed' && styles.fileMetaError]}>{file.meta}</Text>
        {file.status === 'progress' ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${file.progress ?? 0}%` }]} />
          </View>
        ) : null}
      </View>
      {file.status === 'failed' ? (
        <Pressable style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.fileRemove} onPress={onRemove} hitSlop={8}>
          <X size={18} color={theme.textSecondary} strokeWidth={2} />
        </Pressable>
      )}
    </View>
  );
}

function ConfirmDialog({
  visible, title, description, confirmLabel, onCancel, onConfirm,
}: {
  visible: boolean; title: string; description: string; confirmLabel: string; onCancel: () => void; onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.confirmRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        <View style={styles.confirmCard}>
          <Text style={styles.confirmTitle}>{title}</Text>
          <Text style={styles.confirmDescription}>{description}</Text>
          <View style={styles.confirmActions}>
            <Pressable style={styles.confirmCancel} onPress={onCancel}>
              <Text style={styles.confirmCancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.confirmDestructive} onPress={onConfirm}>
              <Text style={styles.confirmDestructiveText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flex1: { flex: 1 },
  container: { flex: 1, backgroundColor: theme.bgPage },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[2],
    paddingHorizontal: space[6] - 10,
    backgroundColor: theme.bgPage,
  },
  headerClose: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  scopeRow: {
    flexDirection: 'row', alignItems: 'center', gap: space[1] + 2,
    paddingHorizontal: space[6], paddingTop: space[1], paddingBottom: space[3],
    backgroundColor: theme.bgPage,
  },
  scopeText: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary },
  scopeDot: { fontSize: 13, color: theme.textTertiary },

  scrollContent: { paddingHorizontal: space[6], paddingBottom: space[6], gap: space[3] },

  blockedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: space[2],
    backgroundColor: theme.statusDangerBg, borderRadius: radius.md, padding: space[3] - 2,
  },
  blockedText: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDangerStrong, flex: 1 },

  card: {
    backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderSubtle,
    borderRadius: radius.lg, overflow: 'hidden',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[3], minHeight: 44 },
  cardHeaderText: { flex: 1, minWidth: 0 },
  cardHeaderTitle: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold' },
  cardHeaderSummary: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: 2 },
  cardHeaderError: { fontSize: 12, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDanger, marginTop: 2 },
  cardBody: {
    paddingHorizontal: space[4], paddingBottom: space[4], paddingTop: space[4],
    borderTopWidth: 1, borderTopColor: theme.borderSubtle, gap: space[4],
  },

  badge: { width: 24, height: 24, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  badgeBrand: { backgroundColor: theme.brandDefault },
  badgeDanger: { backgroundColor: theme.statusDanger },
  badgeLocked: { borderWidth: 1, borderColor: theme.borderStrong },
  badgeText: { fontSize: 13, fontFamily: 'Urbanist_700Bold', color: theme.textOnBrand },
  badgeTextLocked: { fontSize: 13, fontFamily: 'Urbanist_700Bold', color: theme.textTertiary },

  fieldGroup: { gap: space[1] },
  label: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  labelDisabled: { color: theme.textTertiary },
  labelError: { color: theme.statusDanger },
  required: { color: theme.statusDanger },
  helperText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary },
  errorText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.statusDanger },
  noticeText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.statusWarning },
  hintText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary },

  input: {
    minHeight: 44, paddingHorizontal: space[3], fontSize: 16, fontFamily: 'Urbanist_400Regular',
    color: theme.textPrimary, backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderDefault,
    borderRadius: radius.md,
  },
  inputError: { borderColor: theme.statusDanger },

  amountRow: {
    minHeight: 44, paddingHorizontal: space[3], backgroundColor: theme.bgRaised, borderWidth: 1,
    borderColor: theme.borderDefault, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: space[1] + 2,
  },
  amountSymbol: { fontSize: 16, color: theme.textTertiary },
  amountInput: { flex: 1, fontSize: 16, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, padding: 0 },

  pickerRow: {
    minHeight: 44, paddingHorizontal: space[3], backgroundColor: theme.bgRaised, borderWidth: 1,
    borderColor: theme.borderDefault, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  pickerRowDisabled: { backgroundColor: theme.bgSunken, borderColor: theme.borderSubtle },
  pickerText: { fontSize: 15, color: theme.textTertiary, flex: 1 },
  pickerTextFilled: { color: theme.textPrimary },
  pickerTextDisabled: { color: theme.textDisabled },

  subGroup: {
    borderLeftWidth: 2, borderLeftColor: theme.borderDefault, paddingLeft: space[3], marginLeft: 2, gap: space[4],
  },

  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44 },
  toggleLabel: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  toggleTrack: { width: 44, height: 26, borderRadius: radius.full, backgroundColor: theme.borderStrong },
  toggleTrackOn: { backgroundColor: theme.brandDefault },
  toggleThumb: { position: 'absolute', top: 3, left: 3, width: 20, height: 20, borderRadius: radius.full, backgroundColor: '#FFFFFF' },
  toggleThumbOn: { left: 21 },

  summaryCard: { backgroundColor: theme.bgSunken, borderRadius: radius.lg, padding: space[4], gap: space[2] },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryLabel: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.textSecondary },
  summaryValue: { fontSize: 16, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  summaryDivider: {
    borderTopWidth: 1, borderTopColor: theme.borderDefault, marginTop: space[1],
    paddingTop: space[2], flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  netLabel: { fontSize: 15, fontFamily: 'Urbanist_700Bold', color: theme.textPrimary },
  netValue: { fontSize: 24, fontFamily: 'Urbanist_700Bold', color: theme.textPrimary },
  warningText: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.statusWarning, marginTop: space[1] },

  buttonRow: { flexDirection: 'row', gap: space[2] },
  primaryButton: {
    minHeight: 44, paddingHorizontal: space[5], backgroundColor: theme.brandDefault, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  primaryButtonText: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textOnBrand },
  secondaryButton: {
    minHeight: 44, paddingHorizontal: space[4], borderWidth: 1, borderColor: theme.borderDefault,
    borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
  },
  secondaryButtonText: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },

  fileRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], padding: space[2] + 2, backgroundColor: theme.bgSunken, borderRadius: radius.md },
  fileIcon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: theme.bgRaised, alignItems: 'center', justifyContent: 'center' },
  fileText: { flex: 1, minWidth: 0 },
  fileName: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  fileMeta: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: 2 },
  fileMetaError: { color: theme.statusDanger },
  progressTrack: { height: 4, backgroundColor: theme.borderSubtle, borderRadius: radius.full, marginTop: space[1] + 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: theme.brandDefault },
  retryButton: { height: 32, paddingHorizontal: space[3], backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderDefault, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  retryButtonText: { fontSize: 13, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  fileRemove: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },

  uploadDash: {
    minHeight: 56, padding: space[3], backgroundColor: theme.bgSunken, borderWidth: 1, borderColor: theme.borderDefault,
    borderStyle: 'dashed', borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space[2],
  },
  uploadDashError: { borderColor: theme.statusDanger },
  uploadDashText: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.brandDefault },

  textarea: {
    minHeight: 96, padding: space[3], fontSize: 16, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary,
    backgroundColor: theme.bgRaised, borderWidth: 1, borderColor: theme.borderDefault, borderRadius: radius.md,
  },

  footer: {
    backgroundColor: theme.bgRaised, borderTopWidth: 1, borderTopColor: theme.borderSubtle,
    paddingHorizontal: space[6], paddingTop: space[3], paddingBottom: space[3],
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  footerActions: { flexDirection: 'row', gap: space[4] },
  footerCancel: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  footerReset: { fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.statusDanger },
  footerResetDisabled: { color: theme.textDisabled },
  footerStep: { fontSize: 12, fontFamily: 'Urbanist_400Regular', color: theme.textTertiary },

  sheetRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: theme.bgOverlay },
  sheet: { backgroundColor: theme.bgRaised, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, ...shadow[4] },
  optionSheet: { height: 560 },
  dateSheet: { maxHeight: '70%' },
  sheetHandleRow: { alignItems: 'center', paddingTop: space[3] },
  sheetHandle: { width: 36, height: 4, borderRadius: radius.full, backgroundColor: theme.borderStrong },
  sheetTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: space[5], paddingTop: space[4] },
  sheetTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  sheetCloseButton: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: theme.bgSunken, alignItems: 'center', justifyContent: 'center' },
  sheetSearchWrap: { paddingHorizontal: space[5], paddingTop: space[4] },
  sheetSearchBar: { height: 40, paddingHorizontal: space[3], backgroundColor: theme.bgSunken, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', gap: space[2] },
  sheetSearchInput: { flex: 1, fontSize: 14, fontFamily: 'Urbanist_400Regular', color: theme.textPrimary, padding: 0 },
  sheetOptionsList: { paddingHorizontal: space[5], paddingTop: space[3], paddingBottom: space[5] },
  sheetOptionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: space[3], minHeight: 44, borderBottomWidth: 1, borderBottomColor: theme.borderSubtle },
  sheetOptionText: { fontSize: 15, color: theme.textPrimary },
  sheetEmptyState: { alignItems: 'center', textAlign: 'center', paddingVertical: space[8], gap: space[2] },
  emptyTitle: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary, marginTop: space[2] },
  emptySubtitle: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary },

  calendarMonth: { textAlign: 'center', fontSize: 15, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary, paddingHorizontal: space[5], paddingTop: space[4], paddingBottom: space[2] },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2], paddingHorizontal: space[5], paddingBottom: space[5] },
  calendarDay: { width: 38, height: 38, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  calendarDaySelected: { backgroundColor: theme.brandDefault },
  calendarDayText: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  calendarDayTextSelected: { color: theme.textOnBrand },

  uploadSheetTitle: { fontSize: 18, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary, paddingHorizontal: space[5], paddingTop: space[4] },
  uploadOptionsList: { paddingHorizontal: space[5], paddingTop: space[3], paddingBottom: space[6], gap: space[1] },
  uploadOptionRow: { flexDirection: 'row', alignItems: 'center', gap: space[3], minHeight: 52 },
  uploadOptionText: { fontSize: 15, color: theme.textPrimary },

  confirmRoot: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space[6], backgroundColor: theme.bgOverlay },
  confirmCard: { backgroundColor: theme.bgRaised, borderRadius: radius.lg, padding: space[5], width: '100%', maxWidth: 320, ...shadow[4] },
  confirmTitle: { fontSize: 16, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  confirmDescription: { fontSize: 13, fontFamily: 'Urbanist_400Regular', color: theme.textSecondary, marginTop: space[2], lineHeight: 18 },
  confirmActions: { flexDirection: 'row', gap: space[2], marginTop: space[5], justifyContent: 'flex-end' },
  confirmCancel: { height: 40, paddingHorizontal: space[4], borderWidth: 1, borderColor: theme.borderDefault, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  confirmCancelText: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textPrimary },
  confirmDestructive: { height: 40, paddingHorizontal: space[4], backgroundColor: theme.statusDanger, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  confirmDestructiveText: { fontSize: 14, fontFamily: 'Urbanist_600SemiBold', color: theme.textOnBrand },
});
