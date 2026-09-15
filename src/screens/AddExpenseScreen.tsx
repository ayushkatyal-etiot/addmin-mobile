import { useMemo, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
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

import { useCreateExpense, useGetExpenseCategories, useGetVendors, useGetDepartments, useGetProjects, useGetPayees } from '../api/expenses';
import { mapFormDataToExpenseBody } from '../utils/mapExpenseFormData';
import Toast from '../components/Toast';
import Dialog from '../components/Dialog';
import TextField from '../components/TextField';
import DatePickerSheet from '../components/DatePickerSheet';
import { useUser } from '../contexts/UserContext';
import { styles } from './AddExpenseScreen.styles';
import { theme } from '../theme/tokens';

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

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('error');
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const queryClient = useQueryClient();
  const { mutateAsync: createExpense, isPending: isCreatingExpense } = useCreateExpense();
  const { getCurrentOrganisation, getCurrentBranch } = useUser();
  const currentOrg = getCurrentOrganisation();
  const currentBranch = getCurrentBranch();

  // Fetch dropdown data from APIs
  const { data: categoriesData, isLoading: categoriesLoading } = useGetExpenseCategories();
  const { data: vendorsData, isLoading: vendorsLoading } = useGetVendors();
  const { data: departmentsData, isLoading: departmentsLoading } = useGetDepartments();
  const { data: projectsData, isLoading: projectsLoading } = useGetProjects();
  const { data: payeesData, isLoading: payeesLoading } = useGetPayees();

  // Helper functions to convert IDs to display names
  const getCategoryName = (id: string | null): string => {
    if (!id) return 'Select expense category';
    const cat = categoriesData?.items.find((c) => c.id === id);
    return cat?.name || id;
  };

  const getSubCategoryName = (id: string | null): string => {
    if (!id || !s.category) return 'Select sub category';
    const cats = categoriesData?.items || [];
    const subcat = cats.find((c) => c.id === id && (c as any).parent_id === s.category);
    return subcat?.name || id;
  };

  const getVendorName = (id: string | null): string => {
    if (!id) return 'Select vendor';
    const vendor = vendorsData?.items.find((v) => v.id === id);
    return vendor?.name || id;
  };

  const getDepartmentName = (id: string | null): string => {
    if (!id) return 'Select department';
    const dept = departmentsData?.items.find((d) => d.id === id);
    return dept?.name || id;
  };

  const getProjectName = (id: string | null): string => {
    if (!id) return 'Select project';
    const proj = projectsData?.items.find((p) => p.id === id);
    return proj?.name || id;
  };

  const getPayeeName = (id: string | null): string => {
    if (!id) return 'Select payee';
    const payee = payeesData?.items.find((p) => p.id === id);
    return payee?.name || id;
  };

  const patch = (p: Partial<FormState>) => setS((prev) => ({ ...prev, ...p }));
  const patchErrors = (p: Errors) => setS((prev) => ({ ...prev, errors: { ...prev.errors, ...p } }));

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    toastTimeoutRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 3000);
  };

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

  const onNextStep5 = async () => {
    if (s.step2Error) {
      patch({ blockedMessage: 'Step 2, Payee & Invoice Details needs review.', openStep: 2 });
      return;
    }
    if (!s.invoiceFile) {
      patchErrors({ invoiceFile: 'An invoice file is required' });
      return;
    }

    try {
      const org = getCurrentOrganisation();
      const branch = getCurrentBranch();
      if (!org?.id || !branch?.id) {
        showToast('No organisation or branch selected', 'error');
        return;
      }

      patchErrors({ invoiceFile: null });
      const expenseBody = mapFormDataToExpenseBody(s, org.id, branch.id);

      console.log('[AddExpenseScreen] Submitting expense:', expenseBody);
      await createExpense(expenseBody);

      showToast('Expense created successfully', 'success');

      // Invalidate expenses query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ['expenses'] });

      setTimeout(() => {
        patch({ step5Complete: true, blockedMessage: '' });
        onBack();
      }, 1500);
    } catch (error: any) {
      console.error('[AddExpenseScreen] Failed to create expense:', error);
      const message = error?.data?.message || error?.message || 'Failed to create expense';
      showToast(message, 'error');
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

  const mkOptionsWithId = (
    list: Array<{ id: string; name: string }>,
    currentId: string | null,
    onSelect: (id: string, name: string) => void,
  ) =>
    list.map((item) => ({
      name: item.name,
      selected: item.id === currentId,
      onSelect: () => onSelect(item.id, item.name),
    }));

  let sheetTitle = '';
  let sheetOptions: { name: string; selected: boolean; onSelect: () => void }[] = [];
  let sheetShowSearch = false;

  if (activeSheet === 'category') {
    sheetTitle = 'Expense Category';
    sheetShowSearch = true;
    const cats = categoriesData?.items || [];
    // Only show root categories (parent_id is null)
    const rootCats = cats.filter((c) => (c as any).parent_id === null);
    const filtered = rootCats.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
    sheetOptions = mkOptionsWithId(filtered, s.category, (id) => {
      const changed = !!s.category && s.category !== id;
      patch({
        category: id, subCategory: null,
        categoryChangeNotice: changed || s.categoryChangeNotice,
        step2Error: changed && s.step2Complete ? true : s.step2Error,
        step2Complete: changed && s.step2Complete ? false : s.step2Complete,
      });
      patchErrors({ category: null });
      closeSheet();
    });
  } else if (activeSheet === 'subCategory') {
    sheetTitle = 'Sub Category';
    const cats = categoriesData?.items || [];
    // Find subcategories where parent_id matches the selected category
    const subcats = s.category ? cats.filter((c) => (c as any).parent_id === s.category) : [];
    const filtered = subcats.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
    sheetOptions = mkOptionsWithId(filtered, s.subCategory, (id) => {
      patch({ subCategory: id });
      closeSheet();
    });
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
    const vendors = vendorsData?.items || [];
    const filtered = vendors.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
    sheetOptions = mkOptionsWithId(filtered, s.vendor, (id) => {
      patch({ vendor: id });
      closeSheet();
    });
  } else if (activeSheet === 'payee') {
    sheetTitle = 'Payee';
    sheetShowSearch = true;
    // Fetch payees from API data
    const payees = payeesData?.items || [];
    const filtered = payees.filter((p) => p.name.toLowerCase().includes(categorySearch.toLowerCase()));
    sheetOptions = mkOptionsWithId(filtered, s.payee, (id) => {
      patch({ payee: id });
      patchErrors({ payee: null });
      closeSheet();
    });
  } else if (activeSheet === 'currency') {
    sheetTitle = 'Currency';
    sheetOptions = mkOptions(CURRENCIES, s.currency, selectCurrency);
  } else if (activeSheet === 'department') {
    sheetTitle = 'Department';
    const departments = departmentsData?.items || [];
    const filtered = departments.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
    sheetOptions = mkOptionsWithId(filtered, s.department, (id) => {
      patch({ department: id });
      closeSheet();
    });
  } else if (activeSheet === 'project') {
    sheetTitle = 'Project';
    const projects = projectsData?.items || [];
    const filtered = projects.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
    sheetOptions = mkOptionsWithId(filtered, s.project, (id) => {
      patch({ project: id });
      closeSheet();
    });
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
        <Text style={styles.scopeText} numberOfLines={1}>{currentOrg?.name || 'No organisation'}</Text>
        <Text style={styles.scopeDot}>·</Text>
        <MapPin size={14} color={theme.textTertiary} strokeWidth={1.75} />
        <Text style={styles.scopeText} numberOfLines={1}>{currentBranch?.name || 'No branch'}</Text>
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
            display={getCategoryName(s.category)}
            filled={!!s.category}
            error={err.category}
            helper={!err.category ? 'From Expenses → Categories' : undefined}
            notice={s.categoryChangeNotice ? 'This may affect the payee selected in Step 2.' : undefined}
            onPress={() => openSheet('category')}
          />
          <PickerField
            label="Sub Category"
            display={getSubCategoryName(s.subCategory)}
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
              display={getVendorName(s.vendor)}
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
                display={getPayeeName(s.payee)}
                filled={!!s.payee}
                error={err.payee}
                helper={!err.payee ? 'Managed under Other → Payees' : undefined}
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
                display={getPayeeName(s.payee)}
                filled={!!s.payee}
                error={err.payee}
                helper={!err.payee ? 'Managed under Other → Payees' : undefined}
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
            display={getDepartmentName(s.department)}
            filled={!!s.department}
            helper="Other → Departments"
            onPress={() => openSheet('department')}
          />
          <PickerField
            label="Project"
            display={getProjectName(s.project)}
            filled={!!s.project}
            helper="Other → Projects"
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
            <SecondaryButton label="Previous" onPress={() => !isCreatingExpense && gotoStep(4)} />
            <PrimaryButton label={isCreatingExpense ? 'Creating...' : 'Add Expense'} flex onPress={() => !isCreatingExpense && onNextStep5()} />
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

      {/* Date picker bottom sheet */}
      <DatePickerSheet
        visible={dateSheetOpen}
        title={dateSheetTitle}
        selectedDate={s.date || s.startDate || s.endDate || s.invoiceDate || s.billDueDate || s.billPeriodStart || s.billPeriodEnd}
        onDateSelect={(dateStr) => {
          if (activeSheet === 'date-expense') patch({ date: dateStr });
          else if (activeSheet === 'date-start') patch({ startDate: dateStr });
          else if (activeSheet === 'date-end') patch({ endDate: dateStr });
          else if (activeSheet === 'date-invoice') patch({ invoiceDate: dateStr });
          else if (activeSheet === 'date-due') patch({ billDueDate: dateStr });
          else if (activeSheet === 'date-billstart') patch({ billPeriodStart: dateStr });
          else if (activeSheet === 'date-billend') patch({ billPeriodEnd: dateStr });
        }}
        onClose={closeSheet}
      />

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

      <Dialog
        visible={showDiscardConfirm}
        title="Discard recurrence details?"
        description="Switching to one-time will clear the frequency, start date, and end date you entered."
        onDismiss={cancelDiscard}
        buttons={[
          { label: 'Cancel', onPress: cancelDiscard, type: 'cancel' },
          { label: 'Discard', onPress: confirmDiscard, type: 'destructive' },
        ]}
      />
      <Dialog
        visible={showPayeeKindConfirm}
        title="Discard payee details?"
        description="Changing the payee kind will clear the payee and related fields you entered. Invoice details are kept."
        onDismiss={cancelPayeeKindSwitch}
        buttons={[
          { label: 'Cancel', onPress: cancelPayeeKindSwitch, type: 'cancel' },
          { label: 'Discard', onPress: confirmPayeeKindSwitch, type: 'destructive' },
        ]}
      />
      <Dialog
        visible={showReplaceConfirm}
        title="Replace invoice file?"
        description="Only one invoice file is allowed. Uploading a new one replaces the current file."
        onDismiss={cancelReplace}
        buttons={[
          { label: 'Cancel', onPress: cancelReplace, type: 'cancel' },
          { label: 'Replace', onPress: confirmReplace, type: 'destructive' },
        ]}
      />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
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

