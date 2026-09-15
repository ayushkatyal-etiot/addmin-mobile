import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type { User } from '../types/user';

export function useGetUserInfo() {
  return useMutation({
    mutationFn: async (): Promise<User> => {
      console.log('[useGetUserInfo] Mutation started');
      const result = await apiClient.request<User>({
        method: 'GET',
        endpoint: '/auth/me',
      });
      console.log('[useGetUserInfo] Mutation returned:', result);
      return result;
    },
  });
}
