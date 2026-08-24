import apiClient from './apiClient';

export const posApi = {
  // Table Master
  getTables: (params) => apiClient.get('/tables', { params }),
  saveTable: (data) => data.id ? apiClient.put(`/tables/${data.id}`, data) : apiClient.post('/tables', data),
  deleteTable: (id) => apiClient.delete(`/tables/${id}`),

  // Area Master
  getAreas: (params) => apiClient.get('/areas', { params }),
  saveArea: (data) => data.id ? apiClient.put(`/areas/${data.id}`, data) : apiClient.post('/areas', data),
  deleteArea: (id) => apiClient.delete(`/areas/${id}`),

  // Payment Master / Modes
  getPaymentModes: (params) => apiClient.get('/payment-modes', { params }),
  savePaymentMode: (data) => data.id ? apiClient.put(`/payment-modes/${data.id}`, data) : apiClient.post('/payment-modes', data),
  deletePaymentMode: (id) => apiClient.delete(`/payment-modes/${id}`),

  // Steward / Waiter Master
  getStewards: (params) => apiClient.get('/menu/waiters', { params }),
  saveSteward: (data) => apiClient.post('/menu/waiters', data),
  deleteSteward: (id) => apiClient.delete(`/menu/waiters/${id}`),

  // Delivery Partner / Boy Master
  getDeliveryBoys: (params) => apiClient.get('/delivery-boys', { params }),
  saveDeliveryBoy: (data) => apiClient.post('/delivery-boys', data),
  deleteDeliveryBoy: (id) => apiClient.delete(`/delivery-boys/${id}`),

  // Outlet / Store Master
  getOutlets: () => apiClient.get('/stores'),
  saveOutlet: (data) => apiClient.post('/stores', data),
  deleteOutlet: (id) => apiClient.delete(`/stores/${id}`),

  // Item Tax Categories & Slabs
  getItemTaxCategories: (params) => apiClient.get('/taxes', { params }),
  saveItemTaxCategory: (data) => apiClient.post('/taxes', data),
  deleteItemTaxCategory: (id) => apiClient.delete(`/taxes/${id}`),

  // Item Rate Categories & Prices
  getItemRateCategories: (params) => apiClient.get('/rate-categories', { params }),
  saveItemRateCategory: (data) => apiClient.post('/rate-categories', data),
  deleteItemRateCategory: (id) => apiClient.delete(`/rate-categories/${id}`),
  updateItemRates: (data) => apiClient.post('/item-rates/update', data),

  // Non-Chargeable (NC) Types
  getNCTypes: (params) => apiClient.get('/nc-types', { params }),
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

  sendPrintRequest: async (data) => {
    console.log('%c🖨️ [Print Manager] Initiating print job...', 'color: #0284c7; font-weight: bold;', data);

    // 1. Direct browser WebSocket connection to ws://localhost:8989
    const sendViaDirectWebSocket = () => new Promise((resolve) => {
      try {
        console.log('%c🔌 [Print WebSocket] Connecting to ws://localhost:8989...', 'color: #059669; font-weight: bold;');
        const ws = new WebSocket('ws://localhost:8989');
        let done = false;

        ws.onopen = () => {
          const payload = {
            id: data.id || 'print-test',
            type: 'print',
            html: data.html,
            ...(data.printerIp ? { printerIp: data.printerIp, printerPort: data.printerPort || 9100 } : {}),
            ...(data.deviceName ? { deviceName: data.deviceName } : {})
          };
          console.log('%c🚀 [Print WebSocket] Connection opened! Sending payload to ws://localhost:8989:', 'color: #16a34a; font-weight: bold;', payload);
          ws.send(JSON.stringify(payload));
          setTimeout(() => {
            if (!done) {
              done = true;
              try { ws.close(); } catch (e) {}
              console.log('%c✅ [Print WebSocket] Job successfully dispatched to Windows Print Spooler!', 'color: #10b981; font-weight: bold;');
              resolve({ success: true, message: 'Print job dispatched via WebSocket' });
            }
          }, 2000);
        };

        ws.onmessage = (msg) => {
          console.log('%c📩 [Print WebSocket] Response from print server:', 'color: #0ea5e9; font-weight: bold;', msg.data);
          try {
            const res = JSON.parse(msg.data);
            if (!done) {
              done = true;
              try { ws.close(); } catch (e) {}
              resolve(res);
            }
          } catch (e) {
            if (!done) {
              done = true;
              try { ws.close(); } catch (e) {}
              resolve({ success: true });
            }
          }
        };

        ws.onerror = (err) => {
          console.warn('⚠️ [Print WebSocket] Direct socket connection to ws://localhost:8989 failed. Falling back to backend relay...', err);
          if (!done) {
            done = true;
            resolve(null);
          }
        };

        setTimeout(() => {
          if (!done) {
            done = true;
            resolve(null);
          }
        }, 3000);
      } catch (err) {
        console.warn('⚠️ [Print WebSocket] Exception opening direct socket:', err);
        resolve(null);
      }
    });

    const wsRes = await sendViaDirectWebSocket();
    if (wsRes && (wsRes.success || wsRes.data?.success)) {
      console.log('%c🎉 [Print Manager] Direct WebSocket print successful!', 'color: #16a34a; font-weight: bold;');
      return { data: wsRes, success: true };
    }

    // 2. Fallback to backend relay endpoint
    console.log('%c📡 [Print Manager] Relaying print request via backend POST /api/v1/print/send-print-request...', 'color: #d97706; font-weight: bold;');
    const backendRes = await apiClient.post('/v1/print/send-print-request', data);
    console.log('%c📦 [Print Manager] Backend relay response:', 'color: #d97706; font-weight: bold;', backendRes?.data || backendRes);
    return backendRes;
  },
  saveAsPdf: (data) => apiClient.post('/v1/print', data, { responseType: 'blob' }),
};

export default posApi;
