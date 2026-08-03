import apiClient from './apiClient';

export const reportsApi = {
  getSalesReport: (params) => apiClient.get('/reports/sales', { params }),
  getOccupancyReport: (params) => apiClient.get('/reports/occupancy', { params }),
  getAuditLogs: (params) => apiClient.get('/reports/audit-logs', { params }),
  getInventoryReport: (params) => apiClient.get('/reports/inventory', { params }),
};

export default reportsApi;
