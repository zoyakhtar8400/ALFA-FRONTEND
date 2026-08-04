import apiClient from './apiClient';

export const customerApi = {
  getCustomers: (params = {}) => apiClient.get('/customer', { params: { store_id: 'STORE_1', ...params } }),
  getCustomerById: (id) => apiClient.get(`/customer/${id}`),
  createCustomer: (data) => apiClient.post('/customer', { store_id: 'STORE_1', ...data }),
  updateCustomer: (id, data) => apiClient.put(`/customer/${id}`, data),
};

export default customerApi;
