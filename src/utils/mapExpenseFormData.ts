import type { CreateExpenseBody, ExpenseNatureBody, ExpensePaymentType, ExpenseBehavior, RecurrenceFrequency, ExpenseApiItem } from '../types/expense';

// Mock UUID mappings for categories, vendors, departments, projects
// In production, these would come from API responses
const CATEGORY_IDS: Record<string, string> = {
  'Utility': '550e8400-e29b-41d4-a716-446655440001',
  'Rent & Lease': '550e8400-e29b-41d4-a716-446655440002',
  'Maintenance': '550e8400-e29b-41d4-a716-446655440003',
  'Office Supplies': '550e8400-e29b-41d4-a716-446655440004',
  'Cloud & Software': '550e8400-e29b-41d4-a716-446655440005',
  'Travel': '550e8400-e29b-41d4-a716-446655440006',
  'Professional Services': '550e8400-e29b-41d4-a716-446655440007',
};

const SUBCATEGORY_IDS: Record<string, Record<string, string>> = {
  'Utility': {
    'Electricity': '550e8400-e29b-41d4-a716-446655440101',
    'Water': '550e8400-e29b-41d4-a716-446655440102',
    'Gas': '550e8400-e29b-41d4-a716-446655440103',
    'Internet': '550e8400-e29b-41d4-a716-446655440104',
    'Telephone': '550e8400-e29b-41d4-a716-446655440105',
  },
  'Rent & Lease': {
    'Office Rent': '550e8400-e29b-41d4-a716-446655440201',
    'Warehouse Rent': '550e8400-e29b-41d4-a716-446655440202',
  },
  'Maintenance': {
    'AMC': '550e8400-e29b-41d4-a716-446655440301',
    'Repairs': '550e8400-e29b-41d4-a716-446655440302',
  },
  'Office Supplies': {
    'Stationery': '550e8400-e29b-41d4-a716-446655440401',
    'Pantry': '550e8400-e29b-41d4-a716-446655440402',
  },
  'Cloud & Software': {
    'SaaS Subscription': '550e8400-e29b-41d4-a716-446655440501',
    'Hosting': '550e8400-e29b-41d4-a716-446655440502',
  },
  'Travel': {
    'Airfare': '550e8400-e29b-41d4-a716-446655440601',
    'Local Transport': '550e8400-e29b-41d4-a716-446655440602',
  },
  'Professional Services': {
    'Legal': '550e8400-e29b-41d4-a716-446655440701',
    'Consulting': '550e8400-e29b-41d4-a716-446655440702',
  },
};

const VENDOR_IDS: Record<string, string> = {
  'Sharma Facility Services': '550e8400-e29b-41d4-a716-446655440801',
  'Blue Star Ltd': '550e8400-e29b-41d4-a716-446655440802',
  'Godrej Interio': '550e8400-e29b-41d4-a716-446655440803',
  'Quess Corp': '550e8400-e29b-41d4-a716-446655440804',
};

const PAYEE_IDS: Record<string, string> = {
  'CESC Ltd': '550e8400-e29b-41d4-a716-446655440901',
  'Tata Power': '550e8400-e29b-41d4-a716-446655440902',
  'Mahanagar Gas': '550e8400-e29b-41d4-a716-446655440903',
  'Airtel Business': '550e8400-e29b-41d4-a716-446655440904',
  'AWS': '550e8400-e29b-41d4-a716-446655440905',
  'Vercel': '550e8400-e29b-41d4-a716-446655440906',
  'Google Workspace': '550e8400-e29b-41d4-a716-446655440907',
  'Zoom': '550e8400-e29b-41d4-a716-446655440908',
};

const DEPARTMENT_IDS: Record<string, string> = {
  'Facilities': '550e8400-e29b-41d4-a716-446655441001',
  'Finance': '550e8400-e29b-41d4-a716-446655441002',
  'Human Resources': '550e8400-e29b-41d4-a716-446655441003',
  'IT': '550e8400-e29b-41d4-a716-446655441004',
  'Operations': '550e8400-e29b-41d4-a716-446655441005',
};

const PROJECT_IDS: Record<string, string> = {
  'Head Office Fitout': '550e8400-e29b-41d4-a716-446655441101',
  'Mumbai Expansion': '550e8400-e29b-41d4-a716-446655441102',
  'Annual Maintenance Contract': '550e8400-e29b-41d4-a716-446655441103',
};

interface FormState {
  title: string;
  category: string | null;
  subCategory: string | null;
  date: string;
  nature: string | null;
  behavior: string | null;
  recurrenceFrequency: string | null;
  startDate: string;
  endDate: string;

  payeeKind: string | null;
  vendor: string | null;
  payee: string | null;
  invoiceNumber: string;
  invoiceDate: string;
  billDueDate: string;

  currency: string;
  subtotal: string;
  taxAmount: string;
  otherCharges: string;
  tdsApplicable: boolean;

  department: string | null;
  project: string | null;

  notes: string;
}

// Map form nature display value to API value
function mapNature(displayValue: string | null): ExpenseNatureBody | null {
  if (!displayValue) return null;
  if (displayValue.includes('Operating') || displayValue.includes('OPEX')) return 'operating';
  if (displayValue.includes('Capital') || displayValue.includes('CAPEX')) return 'capital';
  return null;
}

// Map form behavior display value to API value
function mapBehavior(displayValue: string | null): ExpenseBehavior | null {
  if (!displayValue) return null;
  if (displayValue.includes('One-time')) return 'one_time';
  if (displayValue.includes('Recurring')) return 'recurring';
  return null;
}

// Map form frequency display value to API value
function mapFrequency(displayValue: string | null): RecurrenceFrequency | null {
  if (!displayValue) return null;
  const lower = displayValue.toLowerCase();
  if (lower === 'monthly') return 'monthly';
  if (lower === 'quarterly') return 'quarterly';
  if (lower === 'half-yearly' || lower === 'half yearly') return 'half_yearly';
  if (lower === 'annually') return 'annually';
  return null;
}

// Map form payment type display value to API value
function mapPaymentType(payeeKind: string | null): ExpensePaymentType | null {
  if (!payeeKind) return null;
  if (payeeKind === 'Vendor') return 'vendor';
  if (payeeKind === 'Utility') return 'payee';
  if (payeeKind === 'Cloud / SaaS') return 'payee';
  return null;
}

// Convert date string (DD/MM/YYYY) to ISO format (YYYY-MM-DD)
function toISODate(dateStr: string): string | null {
  if (!dateStr) return null;
  try {
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return null;
    const date = new Date(`${year}-${month}-${day}`);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

export function mapFormDataToExpenseBody(
  formState: FormState,
  organisationId: string,
  branchId: string,
): CreateExpenseBody {
  // Form state now stores actual IDs from API, so we can use them directly
  // Fallback to hardcoded mappings only if IDs are names (backward compatibility)
  const getCategoryId = (value: string | null) => {
    if (!value) return null;
    // If it looks like a UUID, use it directly; otherwise try to map it
    if (value.includes('-')) return value; // UUID
    return CATEGORY_IDS[value] ?? null;
  };

  const getSubCategoryId = (categoryName: string | null, subCatValue: string | null) => {
    if (!subCatValue || !categoryName) return null;
    // If it looks like a UUID, use it directly; otherwise try to map it
    if (subCatValue.includes('-')) return subCatValue;
    return SUBCATEGORY_IDS[categoryName]?.[subCatValue] ?? null;
  };

  const getVendorId = (value: string | null) => {
    if (!value) return null;
    if (value.includes('-')) return value;
    return VENDOR_IDS[value] ?? null;
  };

  const getPayeeId = (value: string | null) => {
    if (!value) return null;
    if (value.includes('-')) return value;
    return PAYEE_IDS[value] ?? null;
  };

  const getDepartmentId = (value: string | null) => {
    if (!value) return null;
    if (value.includes('-')) return value;
    return DEPARTMENT_IDS[value] ?? null;
  };

  const getProjectId = (value: string | null) => {
    if (!value) return null;
    if (value.includes('-')) return value;
    return PROJECT_IDS[value] ?? null;
  };

  return {
    organisation_id: organisationId,
    branch_id: branchId,
    basic_information: {
      title: formState.title,
      category_id: getCategoryId(formState.category),
      sub_category_id: getSubCategoryId(formState.category, formState.subCategory),
      expense_date: toISODate(formState.date),
      nature: mapNature(formState.nature),
      behavior: mapBehavior(formState.behavior),
      recurrence_frequency: mapFrequency(formState.recurrenceFrequency),
      start_date: toISODate(formState.startDate),
      end_date: toISODate(formState.endDate),
    },
    payee_and_invoice: {
      payment_type: mapPaymentType(formState.payeeKind),
      vendor: {
        vendor_id: getVendorId(formState.vendor),
      },
      payee: {
        payee_id: getPayeeId(formState.payee),
      },
      invoice_number: formState.invoiceNumber || null,
      invoice_date: toISODate(formState.invoiceDate),
      bill_due_date: toISODate(formState.billDueDate),
    },
    amount_tax_tds: {
      currency: formState.currency || null,
      subtotal: parseFloat(formState.subtotal) || 0,
      tax_amount: parseFloat(formState.taxAmount) || 0,
      other_charges: parseFloat(formState.otherCharges) || 0,
      tds_applicable: formState.tdsApplicable,
    },
    cost_allocation: {
      department_id: getDepartmentId(formState.department),
      project_id: getProjectId(formState.project),
    },
    attachments_and_notes: {
      invoice_file_url: null, // Will be handled separately with file upload
      supporting_document_urls: [], // Will be handled separately with file upload
      notes: formState.notes || null,
    },
  };
}

// Mapping for expense list display
type Status = 'approved' | 'pending' | 'rejected' | 'draft' | 'paid';

export interface MappedExpense {
  id: string;
  title: string;
  vendor: string;
  category: 'Opex' | 'Capex';
  amount: number;
  amountLabel: string;
  status: Status;
  dueLabel: string | null;
  expenseDateLabel: string;
  invoiceId: string;
  categoryDetail: string;
  subcategory: string;
  department: string;
  attachments: { name: string; size: string; uploaded: string; kind: 'pdf' | 'image' | 'sheet' }[];
}

interface LookupItem {
  id: string;
  name: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function formatAmount(amount: string, currency: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return `${currency} 0`;

  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);

  const currencySymbol = currency === 'INR' ? '₹' : currency;
  return `${currencySymbol}${formatted}`;
}

function mapApprovalStatus(status: string): Status {
  if (status === 'approved' || status === 'pending' || status === 'rejected' || status === 'draft' || status === 'paid') {
    return status as Status;
  }
  return 'draft' as Status;
}

export function mapExpenseFromApi(
  apiExpense: ExpenseApiItem,
  categoriesMap: Map<string, LookupItem>,
  vendorsMap: Map<string, LookupItem>,
  departmentsMap: Map<string, LookupItem>
): MappedExpense {
  const categoryDetail = categoriesMap.get(apiExpense.basic_information.category_id)?.name || 'Unknown';
  const subcategoryName = apiExpense.basic_information.sub_category_id
    ? categoriesMap.get(apiExpense.basic_information.sub_category_id)?.name || 'Unknown'
    : 'Unknown';
  const vendorId = apiExpense.payee_and_invoice.vendor.vendor_id;
  const vendorName = vendorId
    ? vendorsMap.get(vendorId)?.name || 'Unknown'
    : 'Unknown';
  const departmentName = apiExpense.cost_allocation.department_id
    ? departmentsMap.get(apiExpense.cost_allocation.department_id)?.name || 'Unknown'
    : 'Unknown';

  const amount = parseFloat(apiExpense.amount_tax_tds.total_amount);
  const amountLabel = formatAmount(apiExpense.amount_tax_tds.total_amount, apiExpense.amount_tax_tds.currency);
  const dueLabel = apiExpense.payee_and_invoice.bill_due_date
    ? `Due ${formatDate(apiExpense.payee_and_invoice.bill_due_date)}`
    : null;

  return {
    id: apiExpense.id,
    title: apiExpense.basic_information.title,
    vendor: vendorName,
    category: apiExpense.basic_information.nature === 'operating' ? 'Opex' : 'Capex',
    amount,
    amountLabel,
    status: mapApprovalStatus(apiExpense.approval_status),
    dueLabel,
    expenseDateLabel: formatDate(apiExpense.basic_information.expense_date),
    invoiceId: apiExpense.payee_and_invoice.invoice_number,
    categoryDetail,
    subcategory: subcategoryName,
    department: departmentName,
    attachments: [],
  };
}
