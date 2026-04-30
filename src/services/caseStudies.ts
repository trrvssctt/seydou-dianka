import apiClient from './api';

export interface CaseStudy {
  id: string;
  number: string;
  badge?: string;
  title_en: string;
  title_fr: string;
  subtitle?: string;
  problem_en?: string;
  problem_fr?: string;
  solution_en?: string;
  solution_fr?: string;
  tech: string[];
  metrics: any[];
  testimonial_en?: string;
  testimonial_fr?: string;
  testimonial_author?: string;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export const caseStudiesService = {
  async getCaseStudies(withAuth = false): Promise<CaseStudy[]> {
    return apiClient.get('/case-studies', withAuth);
  },

  async getCaseStudy(id: string): Promise<CaseStudy> {
    return apiClient.get(`/case-studies/${id}`, false);
  },

  async createCaseStudy(data: Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'>): Promise<CaseStudy> {
    return apiClient.post('/case-studies', data, true);
  },

  async updateCaseStudy(id: string, data: Partial<Omit<CaseStudy, 'id' | 'created_at' | 'updated_at'>>): Promise<CaseStudy> {
    return apiClient.patch(`/case-studies/${id}`, data, true);
  },

  async deleteCaseStudy(id: string): Promise<{ success: boolean; id: string }> {
    return apiClient.delete(`/case-studies/${id}`, true);
  },
};

export default caseStudiesService;
