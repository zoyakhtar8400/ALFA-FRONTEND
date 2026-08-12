import apiClient from '../services/apiClient';

export const purchaseApi = {
  // Purchase Dashboard KPIs
  getDashboardKPIs: () => apiClient.get('/purchase/dashboard-kpis'),
  getDashboardSummary: () => apiClient.get('/purchase/dashboard'),

  // Indent Requisitions
  getIndents: (params) => apiClient.get('/indents', { params }),
  createIndent: (data) => apiClient.post('/indents', data),
  updateIndentStatus: (id, status) => apiClient.put(`/indents/${id}/status`, { status }),

  // Purchase Orders
  getPurchaseOrders: (params) => apiClient.get('/purchase-orders', { params }),
  createPurchaseOrder: (data) => apiClient.post('/purchase-orders', data),

  // Goods Received Notes (GRN)
  getGRNs: (params) => apiClient.get('/grn', { params }),
  createGRN: (data) => apiClient.post('/grn', data),

  // Purchase Bills & Vendor Invoices
  getPurchaseBills: (params) => apiClient.get('/purchase-bills', { params }),
  createPurchaseBill: (data) => apiClient.post('/purchase-bills', data),

  // Stock Returns & Department Issues
  createPurchaseReturn: (data) => apiClient.post('/purchase-returns', data),
  createDepartmentIssue: (data) => apiClient.post('/department-issues', data),

  // 100% Real PostgreSQL Purchase Report Engine
  getPurchaseReport: (reportId, params) => apiClient.get(`/purchase/reports/${reportId}`, { params }),
};

export default purchaseApi;
