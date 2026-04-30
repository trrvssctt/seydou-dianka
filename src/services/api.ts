const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const apiClient = {
  async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    includeAuth = true
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('authToken');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(response.status, error.error || 'Request failed');
    }

    return response.json();
  },

  get<T>(endpoint: string, includeAuth = true) {
    return this.request<T>('GET', endpoint, undefined, includeAuth);
  },

  post<T>(endpoint: string, body: any, includeAuth = true) {
    return this.request<T>('POST', endpoint, body, includeAuth);
  },

  patch<T>(endpoint: string, body: any, includeAuth = true) {
    return this.request<T>('PATCH', endpoint, body, includeAuth);
  },

  delete<T>(endpoint: string, includeAuth = true) {
    return this.request<T>('DELETE', endpoint, undefined, includeAuth);
  },
};

export default apiClient;
