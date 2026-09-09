import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type { User } from '../types/user';

export function useGetUserInfo() {
  return useMutation({
    mutationFn: async (): Promise<User> => {
      return apiClient.request({
        method: 'GET',
        endpoint: '/auth/me',
      });
    },
  });
}
