import apiClient from '../services/apiClient';

export const inventoryApi = {
  // Inventory Item Catalog
  getInventoryItems: (params) => apiClient.get('/inventory-items', { params }),
  saveInventoryItem: (data) => apiClient.post('/inventory-items', data),
  deleteInventoryItem: (id) => apiClient.delete(`/inventory-items/${id}`),

  // Open Stock Entry
  postOpenStock: (data) => apiClient.post('/open-stock', data),

  // CSV Bulk Item Upload
  uploadItemCsv: (items) => apiClient.post('/inventory-items/upload-csv', { items }),

  // Item Groups
  getItemGroups: (params) => apiClient.get('/item-groups', { params }),
  saveItemGroup: (data) => apiClient.post('/item-groups', data),

  // Measurement Units
  getUnits: () => apiClient.get('/units'),
  saveUnit: (data) => apiClient.post('/units', data),

  // Stock Ledger Audit Trail
  getStockLedger: (params) => apiClient.get('/stock-ledger', { params }),
};

export default inventoryApi;
