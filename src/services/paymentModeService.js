import apiClient from './apiClient';

export const paymentModeService = {
  // Get all payment modes
  async getPaymentModes() {
    return await apiClient.get('/payment-modes');
  },

  // Get single payment mode by ID
  async getPaymentMode(id) {
    return await apiClient.get(`/payment-modes/${id}`);
  },

  // Create new payment mode
  async createPaymentMode(payload) {
    return await apiClient.post('/payment-modes', payload);
  },

  // Update existing payment mode
  async updatePaymentMode(id, payload) {
    return await apiClient.put(`/payment-modes/${id}`, payload);
  },

  // Delete payment mode
  async deletePaymentMode(id) {
    return await apiClient.delete(`/payment-modes/${id}`);
  }
};

export default paymentModeService;
