import { useMutation } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type { LoginRequest, LoginResponse, RefreshTokenRequest, RefreshTokenResponse } from '../types/auth';

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

export async function refreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
  return apiClient.request<RefreshTokenResponse>({
    method: 'POST',
    endpoint: '/auth/refresh',
    body: { refresh_token: refreshToken },
  });
}
