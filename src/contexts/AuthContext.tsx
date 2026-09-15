import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { apiClient } from '../services/api';
import type { AuthState } from '../types/auth';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

interface AuthContextType extends AuthState {
  login: (token: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Check for debug flag to clear storage
      if (typeof window !== 'undefined' && window.location) {
        const params = new URL(window.location.href).searchParams;
        const shouldClearStorage = params.get('clear-storage') === 'true';
        if (shouldClearStorage) {
          console.log('[Auth] Clearing storage via debug flag...');
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
          apiClient.clearAuthToken();
          apiClient.clearRefreshToken();
          setState({
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
          });
          window.history.replaceState({}, '', window.location.pathname);
          return;
        }
      }

      await restoreToken();
    } catch (error) {
      console.error('[Auth] Init error:', error);
    }

    // Set up 401 handler for automatic logout on unauthorized
    apiClient.setOnUnauthorized(async () => {
      console.log('[Auth] 401 Unauthorized - triggering logout');
      await logout();
    });

    // Set up token refresh handler to persist new tokens
    apiClient.setOnTokenRefresh(async (newToken: string, newRefreshToken: string) => {
      console.log('[Auth] Token refreshed - persisting new tokens');
      await SecureStore.setItemAsync(TOKEN_KEY, newToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);
      setState((prev) => ({
        ...prev,
        token: newToken,
        refreshToken: newRefreshToken,
      }));
    });
  };

  const restoreToken = async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (token) {
        apiClient.setAuthToken(token);
        if (refreshToken) {
          apiClient.setRefreshToken(refreshToken);
        }
        setState({
          token,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setState({
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Failed to restore token:', error);
      setState({
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = async (token: string, refreshToken: string) => {
    try {
      console.log('[Auth] Login - saving tokens:', token.substring(0, 20) + '...');
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      apiClient.setAuthToken(token);
      apiClient.setRefreshToken(refreshToken);
      setState({
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
      console.log('[Auth] Login successful');
    } catch (error) {
      console.error('Failed to save tokens:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('[Auth] Logout - clearing tokens and storage');
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      apiClient.clearAuthToken();
      apiClient.clearRefreshToken();
      setState({
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      console.log('[Auth] Logout completed - user redirected to login');
    } catch (error) {
      console.error('Failed to clear tokens:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
