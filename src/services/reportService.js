import apiClient from './apiClient';

/**
 * REPORT_TYPES enumeration mapping to backend constants in ReportTypes.js
 */
export const REPORT_TYPES = {
  SALES_REPORT: 1,
  TOP_ITEMS: 2,
  CANCELLED_ITEMS: 3,
  SOLD_ITEMS: 4,
  COMPLEMENTARY_ITEMS: 5,
  DEAD_ITEMS: 6,
  TODAYS_REPORT: 7,
  SECTIONWISE_ITEMS: 8,
  PAYMENT: 9,
  ORDER_FROM: 10,
  CATEGORYWISE: 11,
  KDWISE: 12,
  COUPON_HISTORY: 13,
  START_CLOSEDAY: 14,
  USER_SHIFT: 15,
  DUE_PAYMENT: 16,
  DUE_PAYMENT_HISTORY: 17,
  DELETED_ITEMS: 18,
  ADDON_ITEMS: 19,
  DUE_BY_CUSTOMER: 20,
  DISCOUNTED_ITEMS: 21,
  BILLPRINT_HISTORY: 22,
  APPLIED_CHARGES_HISTORY: 23,
  PRE_ORDER_REPORT: 24,
  VAT_REPORT: 25,
  MALL_REPORT: 26,
  KOT_REPORT: 27,
  RESERVATION_REPORT: 28,
  DELIVERY_BOY_REPORT: 29,
  USER_REPORT: 30,
};

/**
 * Map frontend report ID string to corresponding backend reportType code
 */
export const REPORT_ID_MAP = {
  'sales-register': REPORT_TYPES.SALES_REPORT,
  'itemwise-sale': REPORT_TYPES.SOLD_ITEMS,
  'itemwise-outletwise-sale': REPORT_TYPES.SOLD_ITEMS,
  'itemwise-categorywise-sale': REPORT_TYPES.CATEGORYWISE,
  'tablewise-sale': REPORT_TYPES.SALES_REPORT,
  'cover-analysis': REPORT_TYPES.SALES_REPORT,
  'kitchen-time-gap': REPORT_TYPES.KOT_REPORT,
  'stewardwise-sale': REPORT_TYPES.SALES_REPORT,
  'flash-report': REPORT_TYPES.SALES_REPORT,
  'tax-datawise-summary': REPORT_TYPES.VAT_REPORT,
  'taxwise-summary': REPORT_TYPES.VAT_REPORT,
  'kot-register': REPORT_TYPES.KOT_REPORT,
  'nc-kot': REPORT_TYPES.COMPLEMENTARY_ITEMS,
  'pending-kot-report': REPORT_TYPES.KOT_REPORT,
  'cashier-settlement-summarized': REPORT_TYPES.START_CLOSEDAY,
  'userwise-collection-report': REPORT_TYPES.USER_REPORT,
  'customer-info-report': REPORT_TYPES.DUE_BY_CUSTOMER,
  'customer-outlet-visit-report': REPORT_TYPES.USER_REPORT,
};

export const reportService = {
  /**
   * Fetch live report data from backend API
   */
  async getReportData(params = {}) {
    try {
      const response = await apiClient.get('/v1/report/getReportData', { params });
      let data = response;
      // Backend may return JSON stringified string
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          console.error('Error parsing report JSON response:', e);
        }
      }
      return data;
    } catch (error) {
      const errMsg = error?.message || 'Error fetching report data';
      console.warn('Report fetch notice:', errMsg);
      return {};
    }
  }
};

export default reportService;
