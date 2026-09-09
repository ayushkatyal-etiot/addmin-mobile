const API_BASE_URL = 'https://qa.api.addmin.etiot.in/api/v1';

export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  async request<T>({
    method,
    endpoint,
    body,
    headers,
  }: ApiRequest & { headers?: Record<string, string> }): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const finalHeaders = { ...this.defaultHeaders, ...headers };

    const config: RequestInit = {
      method,
      headers: finalHeaders,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(
        errorData.message || `API Error: ${response.status} ${response.statusText}`
      );
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }

    return response.json() as Promise<T>;
  }

  setAuthToken(token: string) {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  clearAuthToken() {
    delete this.defaultHeaders.Authorization;
  }
}

export const apiClient = new ApiClient();
