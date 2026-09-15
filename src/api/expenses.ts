import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type { CreateExpenseBody, CreatedExpense, ExpenseListResponse } from '../types/expense';

export interface ExpenseCategory {
  id: string;
  name: string;
  is_active: boolean;
}

export interface ExpenseCategoryListResponse {
  items: ExpenseCategory[];
  total: number;
  offset: number;
  limit: number;
}

export interface Vendor {
  id: string;
  name: string;
  status: string;
}

export interface VendorListResponse {
  items: Vendor[];
  total: number;
  offset: number;
  limit: number;
}

export interface Department {
  id: string;
  name: string;
  is_active: boolean;
}

export interface DepartmentListResponse {
  items: Department[];
  total: number;
  offset: number;
  limit: number;
}

export interface Project {
  id: string;
  name: string;
  is_active: boolean;
}

export interface ProjectListResponse {
  items: Project[];
  total: number;
  offset: number;
  limit: number;
}

export interface Payee {
  id: string;
  name: string;
  status: string;
}

export interface PayeeListResponse {
  items: Payee[];
  total: number;
  offset: number;
  limit: number;
}

export function useGetExpenseCategories() {
  return useQuery({
    queryKey: ['expenseCategories'],
    queryFn: async (): Promise<ExpenseCategoryListResponse> => {
      console.log('[useGetExpenseCategories] Fetching expense categories');
      const result = await apiClient.request<any>({
        method: 'GET',
        endpoint: '/expense-categories?roots_only=false',
      });
      console.log('[useGetExpenseCategories] Response:', { total: result.total, items: result.items.length });
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useGetVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: async (): Promise<VendorListResponse> => {
      console.log('[useGetVendors] Fetching vendors');
      const result = await apiClient.request<any>({
        method: 'GET',
        endpoint: '/vendors',
      });
      console.log('[useGetVendors] Response:', { total: result.total, items: result.items.length });
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async (): Promise<DepartmentListResponse> => {
      console.log('[useGetDepartments] Fetching departments');
      const result = await apiClient.request<any>({
        method: 'GET',
        endpoint: '/departments',
      });
      console.log('[useGetDepartments] Response:', { total: result.total, items: result.items.length });
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<ProjectListResponse> => {
      console.log('[useGetProjects] Fetching projects');
      const result = await apiClient.request<any>({
        method: 'GET',
        endpoint: '/projects',
      });
      console.log('[useGetProjects] Response:', { total: result.total, items: result.items.length });
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetPayees() {
  return useQuery({
    queryKey: ['payees'],
    queryFn: async (): Promise<PayeeListResponse> => {
      console.log('[useGetPayees] Fetching payees');
      const result = await apiClient.request<any>({
        method: 'GET',
        endpoint: '/payees',
      });
      console.log('[useGetPayees] Response:', { total: result.total, items: result.items.length });
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateExpense() {
  return useMutation({
    mutationFn: async (body: CreateExpenseBody): Promise<CreatedExpense> => {
      console.log('[useCreateExpense] Creating expense:', body.basic_information.title);
      const result = await apiClient.request<CreatedExpense>({
        method: 'POST',
        endpoint: '/expenses',
        body,
      });
      console.log('[useCreateExpense] Expense created successfully:', result.id);
      return result;
    },
  });
}

export function useGetExpenses(orgId: string, branchId: string, offset: number, limit: number = 20) {
  return useQuery({
    queryKey: ['expenses', orgId, branchId, offset, limit],
    queryFn: async (): Promise<ExpenseListResponse> => {
      console.log('[useGetExpenses] Fetching expenses:', { orgId, branchId, offset, limit });
      const result = await apiClient.request<ExpenseListResponse>({
        method: 'GET',
        endpoint: `/expenses?org_id=${orgId}&branch_id=${branchId}&offset=${offset}&limit=${limit}`,
      });
      console.log('[useGetExpenses] Response:', { total: result.total, items: result.items.length });
      return result;
    },
    enabled: !!orgId && !!branchId,
  });
}

export function useDeleteExpense() {
  return useMutation({
    mutationFn: async (expenseId: string): Promise<void> => {
      console.log('[useDeleteExpense] Deleting expense:', expenseId);
      await apiClient.request<void>({
        method: 'DELETE',
        endpoint: `/expenses/${expenseId}`,
      });
      console.log('[useDeleteExpense] Expense deleted successfully');
    },
  });
}
