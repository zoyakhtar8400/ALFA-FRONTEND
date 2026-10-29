import apiClient from './apiClient';

export const nightAuditService = {
  // Get active business date and session status
  async getStatus(params = {}) {
    return await apiClient.get('/night-audit/status', { params });
  },

  // Get full financial reconciliation & operational blockers for a business date
  async getReconciliation(params = {}) {
    const queryParams = typeof params === 'string' ? { business_date: params } : params;
    return await apiClient.get('/night-audit/reconcile', { params: queryParams });
  },

  // Close business day / complete night audit
  async closeBusinessDay(payload) {
    return await apiClient.post('/night-audit/close-day', payload);
  },

  // Fetch durable audit history
  async getHistory(params = {}) {
    return await apiClient.get('/night-audit/history', { params });
  }
};

export default nightAuditService;
