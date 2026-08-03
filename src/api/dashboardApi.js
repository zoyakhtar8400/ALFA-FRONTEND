import apiClient from './apiClient';

export const dashboardApi = {
  getHotelOverview: () => apiClient.get('/dashboard/hotel-overview'),
  getRestaurantOverview: () => apiClient.get('/dashboard/restaurant-overview'),
  getRevenueMetrics: (params) => apiClient.get('/dashboard/revenue-metrics', { params }),
};

export default dashboardApi;
