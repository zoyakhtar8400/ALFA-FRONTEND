import apiClient from './apiClient';

export const inventoryApi = {
  getItems: (params) => apiClient.get('/inventory/items', { params }),
  createItem: (data) => apiClient.post('/inventory/items', data),
  updateItem: (id, data) => apiClient.put(`/inventory/items/${id}`, data),

  getItemGroups: (params) => apiClient.get('/inventory/groups', { params }),
  getUnits: () => apiClient.get('/inventory/units'),
  getStockEntries: (params) => apiClient.get('/inventory/stock', { params }),
};

export default inventoryApi;
