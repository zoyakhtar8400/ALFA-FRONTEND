import apiClient from '../services/apiClient';

export const stockApi = {
  // Read
  getStockLedger: (params) => apiClient.get('/stock-ledger', { params }),
  getPurchaseReturns: (params) => apiClient.get('/purchase-returns', { params }),
  getDepartmentIssues: (params) => apiClient.get('/department-issues', { params }),
  getStockTransfers: (params) => apiClient.get('/stock-transfers', { params }),
  getConsumerEntries: (params) => apiClient.get('/consumer-entries', { params }),
  // Write
  issueStockToDepartment: (data) => apiClient.post('/department-issues', data),
  processPurchaseReturn: (data) => apiClient.post('/purchase-returns', data),
  createStockTransfer: (data) => apiClient.post('/stock-transfers', data),
  createConsumerEntry: (data) => apiClient.post('/consumer-entries', data),
};

export default stockApi;
