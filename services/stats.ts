import apiClient from './api';

export interface Stats {
  leads: number;
  newLeads: number;
  cases: number;
  workflows: number;
}

export const statsService = {
  async getStats(): Promise<Stats> {
    return apiClient.get('/stats', true);
  },
};

export default statsService;
