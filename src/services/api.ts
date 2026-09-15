const API_BASE_URL = 'https://qa.api.addmin.etiot.in/api/v1';

export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
}

export type OnUnauthorizedCallback = () => void;
export type OnTokenRefreshCallback = (newToken: string, newRefreshToken: string) => void;

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private onUnauthorized: OnUnauthorizedCallback | null = null;
  private onTokenRefresh: OnTokenRefreshCallback | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  setOnUnauthorized(callback: OnUnauthorizedCallback) {
    this.onUnauthorized = callback;
  }

  setOnTokenRefresh(callback: OnTokenRefreshCallback) {
    this.onTokenRefresh = callback;
  }

  setRefreshToken(token: string) {
    this.refreshToken = token;
    console.log('[ApiClient] Refresh token set');
  }

  clearRefreshToken() {
    this.refreshToken = null;
    console.log('[ApiClient] Refresh token cleared');
  }

  async request<T>(
    req: ApiRequest & { headers?: Record<string, string> },
    retryCount = 0
  ): Promise<T> {
    const { method, endpoint, body, headers } = req;
    const url = `${this.baseUrl}${endpoint}`;
    const finalHeaders = { ...this.defaultHeaders, ...headers };

    const authHeader = finalHeaders.Authorization;
    console.log(`[ApiClient] ${method} ${endpoint} - Token: ${authHeader ? authHeader.substring(0, 30) + '...' : 'NO TOKEN'}`);

    const config: RequestInit = {
      method,
      headers: finalHeaders,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, config);
      console.log(`[ApiClient] Response status: ${response.status}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log(`[ApiClient] Error response:`, errorData);

        // Handle 401 Unauthorized - try to refresh token
        if (response.status === 401 && retryCount === 0 && this.refreshToken) {
          console.log('[ApiClient] 401 received, attempting token refresh...');
          try {
            const newToken = await this.performTokenRefresh();
            // Retry original request with new token
            finalHeaders.Authorization = `Bearer ${newToken}`;
            return this.request<T>({ method, endpoint, body, headers: finalHeaders }, retryCount + 1);
          } catch (refreshError) {
            console.error('[ApiClient] Token refresh failed:', refreshError);
            this.clearAuthToken();
            this.clearRefreshToken();
            if (this.onUnauthorized) {
              this.onUnauthorized();
            }
          }
        } else if (response.status === 401) {
          this.clearAuthToken();
          this.clearRefreshToken();
          if (this.onUnauthorized) {
            this.onUnauthorized();
          }
        }

        const error = new Error(
          errorData.message || `API Error: ${response.status} ${response.statusText}`
        );
        (error as any).status = response.status;
        (error as any).data = errorData;
        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        console.log(`[ApiClient] Success response for ${endpoint}: No Content (204)`);
        return undefined as T;
      }

      const data = await response.json() as T;
      console.log(`[ApiClient] Success response for ${endpoint}:`, JSON.stringify(data).substring(0, 500));
      return data;
    } catch (error) {
      console.error(`[ApiClient] Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  private async performTokenRefresh(): Promise<string> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;

    this.refreshPromise = (async () => {
      try {
        if (!this.refreshToken) {
          throw new Error('No refresh token available');
        }

        const url = `${this.baseUrl}/auth/refresh`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ refresh_token: this.refreshToken }),
        });

        if (!response.ok) {
          throw new Error(`Token refresh failed with status ${response.status}`);
        }

        const data = await response.json();
        const newAccessToken = data.access_token;
        const newRefreshToken = data.refresh_token;

        // Update tokens
        this.setAuthToken(newAccessToken);
        this.setRefreshToken(newRefreshToken);

        // Notify context to persist new tokens
        if (this.onTokenRefresh) {
          this.onTokenRefresh(newAccessToken, newRefreshToken);
        }

        console.log('[ApiClient] Token refreshed successfully');
        return newAccessToken;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  setAuthToken(token: string) {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
    console.log('[ApiClient] Token set:', token.substring(0, 20) + '...');
  }

  clearAuthToken() {
    console.log('[ApiClient] Token cleared (likely due to 401 error)');
    delete this.defaultHeaders.Authorization;
  }
}

export const apiClient = new ApiClient();
