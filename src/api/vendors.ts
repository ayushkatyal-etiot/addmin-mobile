import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { mapVendorListFromApi, mapVendorFromApi } from '../types/vendor';
import type { VendorListResponse, CreateVendorRequest, Vendor } from '../types/vendor';

export function useGetVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async (): Promise<VendorListResponse> => {
      console.log('[useGetVendors] Fetching all vendors');
      const result = await apiClient.request<any>({
        method: 'GET',
        endpoint: '/vendors',
      });
      console.log('[useGetVendors] Response:', { total: result.total, items: result.items.length });
      return mapVendorListFromApi(result);
    },
    staleTime: 0,
  });
}

export function useDeleteVendor() {
  return useMutation({
    mutationFn: async (vendorId: string): Promise<void> => {
      console.log('[useDeleteVendor] Deleting vendor:', vendorId);
      await apiClient.request<void>({
        method: 'DELETE',
        endpoint: `/vendors/${vendorId}`,
      });
      console.log('[useDeleteVendor] Vendor deleted successfully');
    },
  });
}

export function useCreateVendor() {
  return useMutation({
    mutationFn: async (payload: CreateVendorRequest): Promise<Vendor> => {
      console.log('[useCreateVendor] Creating vendor:', payload.name);
      const result = await apiClient.request<any>({
        method: 'POST',
        endpoint: '/vendors',
        body: payload,
      });
      console.log('[useCreateVendor] Vendor created successfully:', result.id);
      return mapVendorFromApi(result);
    },
  });
}

export function useGetVendorById(vendorId: string) {
  return useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: async (): Promise<any> => {
      console.log('[useGetVendorById] Fetching vendor:', vendorId);
      return apiClient.request<any>({
        method: 'GET',
        endpoint: `/vendors/${vendorId}`,
      });
    },
    enabled: !!vendorId, // Only fetch if vendorId exists
  });
}

export function useUpdateVendor() {
  return useMutation({
    mutationFn: async ({ vendorId, ...payload }: CreateVendorRequest & { vendorId: string }): Promise<Vendor> => {
      console.log('[useUpdateVendor] Updating vendor:', vendorId);
      const result = await apiClient.request<any>({
        method: 'PUT',
        endpoint: `/vendors/${vendorId}`,
        body: payload,
      });
      console.log('[useUpdateVendor] Vendor updated successfully:', result.id);
      return mapVendorFromApi(result);
    },
  });
}
