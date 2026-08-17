import apiClient from './apiClient';

export const areaService = {
  // Get all areas
  async getAreas() {
    return await apiClient.get('/areas');
  },

  // Get single area by ID
  async getArea(id) {
    return await apiClient.get(`/areas/${id}`);
  },

  // Create new area
  async createArea(payload) {
    return await apiClient.post('/areas', payload);
  },

  // Update existing area
  async updateArea(id, payload) {
    return await apiClient.put(`/areas/${id}`, payload);
  },

  // Delete area
  async deleteArea(id) {
    return await apiClient.delete(`/areas/${id}`);
  }
};

export default areaService;
