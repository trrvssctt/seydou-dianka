import apiClient from './api';

export interface User {
  id: string;
  email: string;
  isAdmin?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export const authService = {
  async signup(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/auth/signup',
      { email, password },
      false
    );
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  },

  async signin(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      '/auth/signin',
      { email, password },
      false
    );
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  },

  async getCurrentUser(): Promise<{ user: User; isAdmin: boolean }> {
    return apiClient.get('/auth/me', true);
  },

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getStoredUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  async claimAdmin(): Promise<{ success: boolean }> {
    return apiClient.post('/auth/claim-admin', {}, true);
  },

  isLoggedIn(): boolean {
    return !!this.getToken();
  },
};

export default authService;
