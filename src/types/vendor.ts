export interface Vendor {
  id: string;
  code: string;
  name: string;
  city: string;
  active: boolean;
  email: string;
  phone: string;
  gstNumber: string | null;
  createdAt: string;
  inUseCount: number;
}

export interface VendorListResponse {
  items: Vendor[];
  total: number;
  offset: number;
  limit: number;
}

interface VendorApiResponse {
  id: string;
  tenant_id: string;
  organisation_id: string;
  branch_id: string | null;
  vendor_code: string;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  country: string;
  gst_number: string | null;
  pan_number: string | null;
  tan_number: string | null;
  bank_account_last4: string | null;
  ifsc_code: string | null;
  bank_name: string | null;
  branch_name: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

interface VendorListApiResponse {
  items: VendorApiResponse[];
  total: number;
  offset: number;
  limit: number;
}

export function mapVendorFromApi(apiVendor: VendorApiResponse): Vendor {
  const date = new Date(apiVendor.created_at);
  const createdAt = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;

  return {
    id: apiVendor.id,
    code: apiVendor.vendor_code,
    name: apiVendor.name,
    city: apiVendor.city,
    active: apiVendor.status === 'active',
    email: apiVendor.email,
    phone: apiVendor.phone_number,
    gstNumber: apiVendor.gst_number,
    createdAt,
    inUseCount: 0,
  };
}

export function mapVendorListFromApi(apiResponse: VendorListApiResponse): VendorListResponse {
  return {
    items: apiResponse.items.map(mapVendorFromApi),
    total: apiResponse.total,
    offset: apiResponse.offset,
    limit: apiResponse.limit,
  };
}

export interface CreateVendorRequest {
  name: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  country: string;
  gst_number?: string;
  pan_number?: string;
  tan_number?: string;
  bank_account_number?: string;
  ifsc_code?: string;
  bank_name?: string;
  branch_name?: string;
  is_active: boolean;
}
