import apiClient from './apiClient';

export const customerApi = {
  getCustomers: (params) => apiClient.get('/customer', { params }),
  getCustomerById: (id) => apiClient.get(`/customer/${id}`),
  createCustomer: (data) => apiClient.post('/customer', data),
  updateCustomer: (id, data) => apiClient.put(`/customer/${id}`, data),
};

export default customerApi;
