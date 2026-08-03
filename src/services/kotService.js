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
    return await apiClient.post(`/api/kot/${kotId}/move`, payload);
  }
};

export default kotService;

