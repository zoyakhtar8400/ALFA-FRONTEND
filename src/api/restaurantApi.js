import apiClient from './apiClient';

export const restaurantApi = {
  // Tables
  getTables: (params) => apiClient.get('/tables', { params }),
  createTable: (data) => apiClient.post('/tables', data),
  updateTable: (tableId, data) => apiClient.put(`/tables/${tableId}`, data),
  patchTableStatus: (tableId, data) => apiClient.patch(`/tables/${tableId}/status`, data),
  deleteTable: (tableId) => apiClient.delete(`/tables/${tableId}`),

  // Menu & Departments
  getMenu: () => apiClient.get('/menu'),
  getDepartments: () => apiClient.get('/department'),

  // Orders
  getOrders: (params) => apiClient.get('/orders', { params }),
  getOrderDetails: (orderId) => apiClient.get(`/orders/${orderId}`),
  createOrder: (data) => apiClient.post('/orders', data),
  updateOrder: (orderId, data) => apiClient.put(`/orders/${orderId}`, data),
  deleteOrder: (orderId) => apiClient.delete(`/orders/${orderId}`),

  // KOT (Kitchen Order Ticket)
  getKOTList: (params) => apiClient.get('/kot', { params }),
  cutKOT: (data) => apiClient.post('/kot', data),
  updateKOTStatus: (kotId, data) => apiClient.put(`/kot/${kotId}`, data),
  deleteKOT: (kotId) => apiClient.delete(`/kot/${kotId}`),

  // Billing & Settlement
  createPayment: (data) => apiClient.post('/billing/pay', data),
  settleOrder: (orderId, data) => apiClient.post(`/billing/settle/${orderId}`, data),
};

export default restaurantApi;
