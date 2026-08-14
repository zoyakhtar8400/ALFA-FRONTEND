import apiClient from './apiClient';

export const dashboardService = {
  getStats: async () => {
    try {
      const response = await apiClient.get('/api/orders/getdashboardstats');
      return response.data || response;
    } catch (err) {
      console.warn('Could not fetch live dashboard stats:', err.message);
      return null;
    }
  },
};
