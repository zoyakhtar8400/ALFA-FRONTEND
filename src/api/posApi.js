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
  saveOutletConfig: (id, data) => apiClient.post(`/stores/${id}/config`, data),
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
  bulkDeleteMenuItems: (ids) => apiClient.post('/menu-items/bulk-delete', { ids }),
  clearAllMenuItems: (store_id) => apiClient.post('/menu-items/bulk-delete', { deleteAll: true, store_id }),
  markItemBilled: (id) => apiClient.post(`/menu-items/${id}/mark-billed`),

  sendPrintRequest: async (data) => {
    const targetPrinter = data.printerName || data.deviceName || data.printer;
    const docType = String(data.job_type || data.type || data.print_purpose || '').toUpperCase();
    const rawId = data.id || data.kotNo || data.bill_number || data.invoice_number || '';

    // Format clean default document name e.g. BILL-17930078191136, KOT-38, SHIFT-TAC3-TO-TAC5
    let docName = String(rawId).trim();
    if (docType.includes('BILL') || docType.includes('INVOICE')) {
      if (!docName.toUpperCase().startsWith('BILL')) {
        docName = `BILL-${docName || Date.now()}`;
      }
    } else if (docType.includes('KOT')) {
      if (!docName.toUpperCase().startsWith('KOT') && !docName.toUpperCase().startsWith('NC')) {
        docName = `KOT-${docName || Date.now()}`;
      }
    } else if (docType.includes('SHIFT') || docType.includes('MOVE')) {
      if (!docName.toUpperCase().startsWith('SHIFT')) {
        docName = `SHIFT-${docName || Date.now()}`;
      }
    }
    if (!docName) {
      docName = `Print-${Date.now()}`;
    }
    docName = docName.replace(/\s+/g, '-');

    // 1. Silent native hardware printing inside alfa.exe with native "Save Print Output As" dialog
    if (typeof window !== 'undefined' && window.electronAPI && typeof window.electronAPI.printSilent === 'function') {
      try {
        console.log('%c🖨️ [Electron Print] Printing silently to:', 'color: #0284c7; font-weight: bold;', targetPrinter);
        const res = await window.electronAPI.printSilent({
          html: data.html,
          deviceName: targetPrinter,
          filename: docName
        });
        if (res && res.success) {
          return { success: true, message: `Printed silently to ${targetPrinter}` };
        }
      } catch (electronPrintErr) {
        console.warn('[Electron Print] Native print error, trying backend fallback:', electronPrintErr);
      }
    }

    // 2. Fallback to backend API
    console.log('%c🖨️ [Print Manager] Dispatching print job to backend POST /api/v1/print/send-print-request...', 'color: #0284c7; font-weight: bold;', data);
    try {
      const backendRes = await apiClient.post('/v1/print/send-print-request', {
        ...data,
        filename: docName
      });
      console.log('%c📦 [Print Manager] Backend print response:', 'color: #10b981; font-weight: bold;', backendRes?.data || backendRes);
      return backendRes?.data || backendRes;
    } catch (err) {
      console.error('%c❌ [Print Manager] Backend print error:', 'color: #ef4444; font-weight: bold;', err.response?.data || err.message);
      return { success: false, error: err.response?.data?.message || err.message };
    }
  },
  saveAsPdf: (data) => apiClient.post('/v1/print', data, { responseType: 'blob' }),
};

export default posApi;
