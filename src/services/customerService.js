import apiClient from './apiClient';

export const customerService = {
  // Search or fetch customer list
  async getCustomers(phone) {
    return await apiClient.get('/customer', { params: { phone } });
  },

  // Create new customer profile
  async createCustomer(customerData) {
    return await apiClient.post('/customer', customerData);
  },
};

export default customerService;
