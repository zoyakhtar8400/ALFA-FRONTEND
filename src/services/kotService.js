import apiClient from './apiClient';

export const kotService = {
  // Generate Kitchen Order Ticket (KOT) in PostgreSQL
  async createKOT(kotPayload) {
    return await apiClient.post('/kot', kotPayload);
  },

  // Load KOT tickets from PostgreSQL
  async getKOTList(params) {
    return await apiClient.get('/kot', { params });
  },

  // Get single KOT by ID
  async getKOTById(kotId) {
    return await apiClient.get(`/kot/${kotId}`);
  },

  // Alias used by POSBillingPage KOT view mode
  async getKOTDetails(kotId) {
    return await apiClient.get(`/kot/${kotId}`);
  },

  // Update KOT item status (Preparing, Ready, Served, Cancelled)
  async updateKOTStatus(kotId, statusData) {
    return await apiClient.patch(`/kot/${kotId}/status`, statusData);
  },

  // Delete / cancel KOT ticket in PostgreSQL
  async deleteKOT(kotId) {
    return await apiClient.delete(`/kot/${kotId}`);
  },

  // Move KOT from one table to another in PostgreSQL
  async moveKOT(kotId, payload) {
    return await apiClient.post(`/kot/${kotId}/move`, payload);
  },

  // Move entire table order to another table in PostgreSQL
  async moveTable(payload) {
    return await apiClient.post('/kot/move-table', payload);
  },

  // Move specific items / quantities from one table to another in PostgreSQL
  async moveItems(payload) {
    return await apiClient.post('/kot/move-items', payload);
  }
};

export default kotService;

