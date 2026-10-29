import apiClient from './apiClient';

export const orderService = {
  // Create a new POS / Table order in PostgreSQL
  async createOrder(orderPayload) {
    return await apiClient.post('/orders', orderPayload);
  },

  // Get active / historical orders from PostgreSQL
  async getOrders(params) {
    return await apiClient.get('/orders', { params });
  },

  // Get single order by ID
  async getOrderById(orderId) {
    return await apiClient.get(`/orders/${orderId}`);
  },

  // Update existing order
  async updateOrder(orderId, updatePayload) {
    return await apiClient.put(`/orders/${orderId}`, updatePayload);
  },

  // Update order status
  async updateOrderStatus(orderId, statusData) {
    return await apiClient.patch(`/orders/${orderId}/status`, statusData);
  },

  // Settle bill / payment
  async settleOrder(orderId, paymentData) {
    return await apiClient.patch(`/orders/${orderId}/payment`, paymentData);
  },

  // Assign delivery boy to order
  async assignDeliveryBoy(orderId, deliveryBoyData) {
    return await apiClient.patch(`/orders/${orderId}/status`, deliveryBoyData);
  },

  // Get pending bills for Billing Desk from PostgreSQL
  async getPendingBills() {
    return await apiClient.get('/billing/pending');
  },

  // Process payment settlement in PostgreSQL
  async processPayment(paymentData) {
    return await apiClient.post('/payments', paymentData);
  },

  // Delete order entry from PostgreSQL
  async deleteOrder(orderId) {
    return await apiClient.delete(`/orders/${orderId}`);
  },

  // Delete all orders (admin only)
  async deleteAllOrders() {
    return await apiClient.delete('/orders');
  }
};

export default orderService;

