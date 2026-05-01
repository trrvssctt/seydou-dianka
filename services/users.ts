import apiClient from './api';

export interface UserRole {
  id: string;
  user_id: string;
  email: string;
  role: string;
  created_at: string;
}

export const usersService = {
  async getUserRoles(): Promise<UserRole[]> {
    return apiClient.get('/users/roles', true);
  },

  async grantAdminRole(userId: string): Promise<UserRole> {
    return apiClient.post('/users/roles', { userId }, true);
  },

  async revokeAdminRole(roleId: string): Promise<{ success: boolean; id: string }> {
    return apiClient.delete(`/users/roles/${roleId}`, true);
  },
};

export default usersService;
