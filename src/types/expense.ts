export type ExpenseNatureBody = 'operating' | 'capital';
export type ExpensePaymentType = 'vendor' | 'payee';
export type ExpenseBehavior = 'one_time' | 'recurring';
export type RecurrenceFrequency = 'monthly' | 'quarterly' | 'half_yearly' | 'annually';

export interface CreateExpenseVendor {
  vendor_id: string | null;
}

export interface CreateExpensePayee {
  payee_id: string | null;
}

export interface CreateExpenseBasicInformation {
  title: string;
  category_id: string | null;
  sub_category_id: string | null;
  expense_date: string | null;
  nature: ExpenseNatureBody | null;
  behavior: ExpenseBehavior | null;
  recurrence_frequency: RecurrenceFrequency | null;
  start_date: string | null;
  end_date: string | null;
}

export interface CreateExpensePayeeAndInvoice {
  payment_type: ExpensePaymentType | null;
  vendor: CreateExpenseVendor;
  payee: CreateExpensePayee;
  invoice_number: string | null;
  invoice_date: string | null;
  bill_due_date: string | null;
}

export interface CreateExpenseAmountTaxTds {
  currency: string | null;
  subtotal: number;
  tax_amount: number;
  other_charges: number;
  tds_applicable: boolean;
}

export interface CreateExpenseCostAllocation {
  department_id: string | null;
  project_id: string | null;
}

export interface CreateExpenseAttachmentsAndNotes {
  invoice_file_url: string | null;
  supporting_document_urls: string[];
  notes: string | null;
}

export interface CreateExpenseBody {
  organisation_id: string;
  branch_id: string;
  basic_information: CreateExpenseBasicInformation;
  payee_and_invoice: CreateExpensePayeeAndInvoice;
  amount_tax_tds: CreateExpenseAmountTaxTds;
  cost_allocation: CreateExpenseCostAllocation;
  attachments_and_notes: CreateExpenseAttachmentsAndNotes;
}

export interface CreatedExpense {
  id: string;
  organisation_id: string;
  branch_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseApiItem {
  id: string;
  organisation_id: string;
  branch_id: string;
  created_by: string;
  basic_information: {
    title: string;
    category_id: string;
    sub_category_id: string | null;
    expense_date: string;
    nature: 'operating' | 'capital';
    behavior: ExpenseBehavior;
    recurrence_frequency: RecurrenceFrequency | null;
    start_date: string | null;
    end_date: string | null;
  };
  payee_and_invoice: {
    payment_type: 'vendor' | 'payee';
    vendor: { vendor_id: string | null };
    payee: { payee_id: string | null };
    invoice_number: string;
    invoice_date: string;
    bill_due_date: string;
  };
  amount_tax_tds: {
    currency: string;
    subtotal: string;
    tax_amount: string;
    other_charges: string;
    total_amount: string;
    tds_applicable: boolean;
  };
  cost_allocation: {
    department_id: string | null;
    project_id: string | null;
  };
  attachments_and_notes: {
    invoice_file_url: string | null;
    supporting_document_urls: string[];
    notes: string | null;
  };
  approval_status: 'pending' | 'approved' | 'rejected' | 'draft';
  payment_status: string | null;
  payee_kind: 'vendor' | 'payee';
  created_at: string;
  updated_at: string;
}

export interface ExpenseListResponse {
  items: ExpenseApiItem[];
  total: number;
  offset: number;
  limit: number;
}
