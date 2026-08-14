import apiClient from './apiClient';

export const floorService = {
  // Get all floors
  async getFloors() {
    return await apiClient.get('/floors');
  },

  // Get single floor by ID
  async getFloor(id) {
    return await apiClient.get(`/floors/${id}`);
  },

  // Create new floor
  async createFloor(payload) {
    return await apiClient.post('/floors', payload);
  },

  // Update existing floor
  async updateFloor(id, payload) {
    return await apiClient.put(`/floors/${id}`, payload);
  },

  // Delete floor
  async deleteFloor(id) {
    return await apiClient.delete(`/floors/${id}`);
  }
};

export default floorService;
