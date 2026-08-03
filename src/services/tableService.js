import apiClient from './apiClient';

export const tableService = {
  // Load all restaurant tables from PostgreSQL
  async getTables() {
    return await apiClient.get('/tables');
  },

  // Create a new dining table in PostgreSQL
  async createTable(tablePayload) {
    return await apiClient.post('/tables', tablePayload);
  },

  // Update table details / status in PostgreSQL
  async updateTableStatus(tableId, statusData) {
    return await apiClient.put(`/tables/${tableId}`, statusData);
  },

  // Patch table status directly
  async patchTableStatus(tableId, statusData) {
    return await apiClient.patch(`/tables/${tableId}/status`, statusData);
  },

  // Delete dining table from PostgreSQL
  async deleteTable(tableId) {
    return await apiClient.delete(`/tables/${tableId}`);
  }
};

export default tableService;

