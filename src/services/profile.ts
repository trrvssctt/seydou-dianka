import apiClient from './api';

export interface Profile {
  id: string;
  full_name: string;
  title_en?: string;
  title_fr?: string;
  bio_en?: string;
  bio_fr?: string;
  email?: string;
  phone?: string;
  location?: string;
  avatar_url?: string;
  github_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  calendar_url?: string;
  created_at: string;
  updated_at: string;
}

export const profileService = {
  async getProfile(): Promise<Profile> {
    return apiClient.get('/profile', false);
  },

  async updateProfile(data: Partial<Profile>): Promise<Profile> {
    return apiClient.patch('/profile', data, true);
  },

  async uploadAvatar(filename: string, data: string): Promise<{ url: string; profile: Profile }> {
    return apiClient.post('/profile/avatar', { filename, data }, true);
  },
};

export default profileService;
