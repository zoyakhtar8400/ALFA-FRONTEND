import apiClient from './apiClient';

export const posApi = {
  // Table Master
  getTables: (params) => apiClient.get('/tables', { params }),
  saveTable: (data) => data.id ? apiClient.put(`/tables/${data.id}`, data) : apiClient.post('/tables', data),
  deleteTable: (id) => apiClient.delete(`/tables/${id}`),

  // Steward / Waiter Master
  getStewards: () => apiClient.get('/menu/waiters'),
  saveSteward: (data) => apiClient.post('/menu/waiters', data),
  deleteSteward: (id) => apiClient.delete(`/menu/waiters/${id}`),

  // Delivery Partner / Boy Master
  getDeliveryBoys: () => apiClient.get('/delivery-boys'),
  saveDeliveryBoy: (data) => apiClient.post('/delivery-boys', data),
  deleteDeliveryBoy: (id) => apiClient.delete(`/delivery-boys/${id}`),

  // Outlet / Store Master
  getOutlets: () => apiClient.get('/stores'),
  saveOutlet: (data) => apiClient.post('/stores', data),

  // Item Tax Categories & Slabs
  getItemTaxCategories: () => apiClient.get('/taxes'),
  saveItemTaxCategory: (data) => apiClient.post('/taxes', data),
  deleteItemTaxCategory: (id) => apiClient.delete(`/taxes/${id}`),

  // Item Rate Categories & Prices
  getItemRateCategories: () => apiClient.get('/rate-categories'),
  saveItemRateCategory: (data) => apiClient.post('/rate-categories', data),
  deleteItemRateCategory: (id) => apiClient.delete(`/rate-categories/${id}`),
  updateItemRates: (data) => apiClient.post('/item-rates/update', data),

  // Non-Chargeable (NC) Types
  getNCTypes: () => apiClient.get('/nc-types'),
  saveNCType: (data) => apiClient.post('/nc-types', data),
  deleteNCType: (id) => apiClient.delete(`/nc-types/${id}`),

  // Printer Master
  getPrinters: () => apiClient.get('/printers'),
  savePrinter: (data) => apiClient.post('/printers', data),
  deletePrinter: (id) => apiClient.delete(`/printers/${id}`),

  // Production Categories (Kitchen Routing)
  getProductionCategories: () => apiClient.get('/production-categories'),
  saveProductionCategory: (data) => apiClient.post('/production-categories', data),

  // HSN Update & CSV Upload
  updateHsnCodes: (data) => apiClient.post('/items/hsn-update', data),
  uploadItemsCsv: (items) => apiClient.post('/items/csv-upload', { items }),

  // Categories & Menu Items
  getProductGroups: () => apiClient.get('/product-groups'),
  saveProductGroup: (data) => apiClient.post('/product-groups', data),
  deleteProductGroup: (id) => apiClient.delete(`/product-groups/${id}`),

  getCategories: (params) => apiClient.get('/categories', { params }),
  saveCategory: (data) => apiClient.post('/categories', data),
  deleteCategory: (id) => apiClient.delete(`/categories/${id}`),

  getMenuItems: (params) => apiClient.get('/menu-items', { params }),
  saveMenuItem: (data) => apiClient.post('/menu-items', data),
  deleteMenuItem: (id) => apiClient.delete(`/menu-items/${id}`),
};

export default posApi;
