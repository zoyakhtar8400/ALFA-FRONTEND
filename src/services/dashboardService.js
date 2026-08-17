import apiClient from './apiClient';

export const dashboardService = {
  getStats: async (params) => {
    try {
      const response = await apiClient.get('/orders/getdashboardstats', { params });
      return response.data || response;
    } catch (err) {
      console.warn('Could not fetch live dashboard stats:', err.message);
      return null;
    }
  },
};
