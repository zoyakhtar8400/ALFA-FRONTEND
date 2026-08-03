import apiClient from './apiClient';

export const customerService = {
  // Search or fetch customer list
  async getCustomers(query) {
    return await apiClient.get('/customer', { params: { query } });
  },

  // Create new customer profile
  async createCustomer(customerData) {
    return await apiClient.post('/customer', customerData);
  },
};

export default customerService;
