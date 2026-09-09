import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type { LoginRequest, LoginResponse } from '../types/auth';

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<LoginResponse> => {
      return apiClient.request({
        method: 'POST',
        endpoint: '/auth/login',
        body: credentials,
      });
    },
  });
}
