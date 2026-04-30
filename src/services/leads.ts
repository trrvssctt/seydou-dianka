import apiClient from './api';

export interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  mission_type?: string;
  budget?: string;
  message: string;
  status: string;
  created_at: string;
}

export const leadsService = {
  async getLeads(): Promise<Lead[]> {
    return apiClient.get('/leads', true);
  },

  async getLead(id: string): Promise<Lead> {
    return apiClient.get(`/leads/${id}`, true);
  },

  async submitLead(data: Omit<Lead, 'id' | 'status' | 'created_at'>): Promise<Lead> {
    return apiClient.post('/leads', data, false);
  },

  async updateLeadStatus(id: string, status: string): Promise<Lead> {
    return apiClient.patch(`/leads/${id}`, { status }, true);
  },

  async deleteLead(id: string): Promise<{ success: boolean; id: string }> {
    return apiClient.delete(`/leads/${id}`, true);
  },
};

export default leadsService;
