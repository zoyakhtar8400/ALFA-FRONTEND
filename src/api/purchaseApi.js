import apiClient from './apiClient';

export const purchaseApi = {
  getPurchaseIndents: (params) => apiClient.get('/purchase/indents', { params }),
  createPurchaseIndent: (data) => apiClient.post('/purchase/indents', data),

  getPurchaseOrders: (params) => apiClient.get('/purchase/orders', { params }),
  createPurchaseOrder: (data) => apiClient.post('/purchase/orders', data),

  getGRNs: (params) => apiClient.get('/purchase/grn', { params }),
  createGRN: (data) => apiClient.post('/purchase/grn', data),

  getVendors: (params) => apiClient.get('/purchase/vendors', { params }),
};

export default purchaseApi;
