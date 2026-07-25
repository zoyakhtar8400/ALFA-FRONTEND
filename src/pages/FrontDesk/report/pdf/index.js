import { exportFrontDeskReportPDF } from './frontDeskReportPDF';
import { exportCheckInGuestDetailPDF } from './checkInGuestDetailPDF';
import { exportCheckInRegisterPDF } from './checkInRegisterPDF';
import { exportRoomCheckOutReportPDF } from './roomCheckOutReportPDF';
import { exportCollectionRegisterPDF } from './collectionRegisterPDF';
import { exportTaxRegisterPDF } from './taxRegisterPDF';
import { exportOccupancyReportMonthlyPDF } from './occupancyReportMonthlyPDF';
import { exportGSTR1PDF } from './gstr1PDF';

export {
  exportFrontDeskReportPDF,
  exportCheckInGuestDetailPDF,
  exportCheckInRegisterPDF,
  exportRoomCheckOutReportPDF,
  exportCollectionRegisterPDF,
  exportTaxRegisterPDF,
  exportOccupancyReportMonthlyPDF,
  exportGSTR1PDF
};

/**
 * Central Front Desk PDF Exporter Dispatcher
 * Handles all 31 reports across the 6 Front Desk categories:
 * 1. Arrival & Departure (7 reports)
 * 2. Revenue & Collection (10 reports)
 * 3. Reservation Stays (1 report)
 * 4. Occupancy Analysis (8 reports)
 * 5. GSTR Filing (3 reports)
 * 6. Log Reports (2 reports)
 */
export const exportFrontDeskPDF = (reportName, columns, data, activeFilters, printedOnStr) => {
  const normName = (reportName || '').toLowerCase().trim();

  if (normName.includes('check in guest detail') || normName === 'check in guest detail') {
    exportCheckInGuestDetailPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('check in register') || normName === 'check in register') {
    exportCheckInRegisterPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('room check out report') || normName.includes('check out report')) {
    exportRoomCheckOutReportPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('collection register') || normName.includes('collection')) {
    exportCollectionRegisterPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('tax register')) {
    exportTaxRegisterPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('occupancy report monthly') || normName.includes('occupancy monthly')) {
    exportOccupancyReportMonthlyPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('gstr-1') || normName.includes('gstr 1')) {
    exportGSTR1PDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  // All other reports use the standardized Front Desk Report PDF Exporter
  exportFrontDeskReportPDF(reportName, columns, data, activeFilters, printedOnStr);
};
