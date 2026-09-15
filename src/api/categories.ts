import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type { CategoryListResponse, Category, CreateCategoryRequest } from '../types/category';

export function useGetCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<CategoryListResponse> => {
      console.log('[useGetCategories] Fetching all categories');
      const result = await apiClient.request<CategoryListResponse>({
        method: 'GET',
        endpoint: '/expense-categories?roots_only=false',
      });
      console.log('[useGetCategories] Response:', { total: result.total, items: result.items.length });
      return result;
    },
    staleTime: 0, // Always refetch on mount
  });
}

export function useDeleteCategory() {
  return useMutation({
    mutationFn: async (categoryId: string): Promise<void> => {
      console.log('[useDeleteCategory] Deleting category:', categoryId);
      await apiClient.request<void>({
        method: 'DELETE',
        endpoint: `/expense-categories/${categoryId}`,
      });
      console.log('[useDeleteCategory] Category deleted successfully');
    },
  });
}

export function useCreateCategory() {
  return useMutation({
    mutationFn: async (payload: CreateCategoryRequest): Promise<Category> => {
      console.log('[useCreateCategory] Creating category:', payload.name);
      const result = await apiClient.request<Category>({
        method: 'POST',
        endpoint: '/expense-categories',
        body: payload,
      });
      console.log('[useCreateCategory] Category created successfully:', result.id);
      return result;
    },
  });
}

export function useGetCategoryById(categoryId: string) {
  return useQuery({
    queryKey: ['category', categoryId],
    queryFn: async (): Promise<Category> => {
      console.log('[useGetCategoryById] Fetching category:', categoryId);
      return apiClient.request<Category>({
        method: 'GET',
        endpoint: `/expense-categories/${categoryId}`,
      });
    },
    enabled: !!categoryId, // Only fetch if categoryId exists
  });
}

export interface UpdateCategoryRequest {
  name: string;
  description: string;
  is_active: boolean;
  parent_id: string;
}

export function useUpdateCategory() {
  return useMutation({
    mutationFn: async ({ categoryId, ...payload }: UpdateCategoryRequest & { categoryId: string }): Promise<Category> => {
      console.log('[useUpdateCategory] Updating category:', categoryId);
      const result = await apiClient.request<Category>({
        method: 'PUT',
        endpoint: `/expense-categories/${categoryId}`,
        body: payload,
      });
      console.log('[useUpdateCategory] Category updated successfully:', result.id);
      return result;
    },
  });
}
