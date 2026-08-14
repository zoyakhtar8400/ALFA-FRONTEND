import apiClient from './apiClient';

export const companyProfileService = {
  getProfile: async () => {
    try {
      const res = await apiClient.get('/company-profile');
      return res?.data || res;
    } catch (err) {
      console.warn('Failed to get company profile:', err.message);
      return { data: null };
    }
  },

  saveProfile: async (data) => {
    const res = await apiClient.post('/company-profile', data);
    return res?.data || res;
  },

  createProfile: async (data) => {
    const res = await apiClient.post('/company-profile', data);
    return res?.data || res;
  },

  updateProfile: async (id, data) => {
    const url = id ? `/company-profile/${id}` : '/company-profile';
    const res = await apiClient.put(url, data);
    return res?.data || res;
  },

  deleteProfile: async (id) => {
    const url = id ? `/company-profile/${id}` : '/company-profile';
    const res = await apiClient.delete(url);
    return res?.data || res;
  }
};

export default companyProfileService;
