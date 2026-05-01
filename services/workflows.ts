import apiClient from './api';

export interface Workflow {
  id: string;
  title_en: string;
  title_fr: string;
  trigger_en?: string;
  trigger_fr?: string;
  steps_en: string[];
  steps_fr: string[];
  nodes: string[];
  status?: string;
  exec_time?: string;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export const workflowsService = {
  async getWorkflows(): Promise<Workflow[]> {
    return apiClient.get('/workflows', false);
  },

  async getWorkflow(id: string): Promise<Workflow> {
    return apiClient.get(`/workflows/${id}`, false);
  },

  async createWorkflow(data: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>): Promise<Workflow> {
    return apiClient.post('/workflows', data, true);
  },

  async updateWorkflow(id: string, data: Partial<Omit<Workflow, 'id' | 'created_at' | 'updated_at'>>): Promise<Workflow> {
    return apiClient.patch(`/workflows/${id}`, data, true);
  },

  async deleteWorkflow(id: string): Promise<{ success: boolean; id: string }> {
    return apiClient.delete(`/workflows/${id}`, true);
  },
};

export default workflowsService;
