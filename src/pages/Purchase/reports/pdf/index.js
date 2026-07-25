import { exportChallanReceiveRegisterPDF } from './challanReceiveRegisterPDF';
import { exportConsumeRegisterPDF } from './consumeRegisterPDF';
import { exportCurrentStockRegisterPDF } from './currentStockRegisterPDF';
import { exportDepartmentIssueRegisterPDF } from './departmentIssueRegisterPDF';
import { exportFNDCostStatementPDF } from './fndCostStatementPDF';
import { exportGRNRegisterPDF } from './grnRegisterPDF';
import { exportIndentRegisterPDF } from './indentRegisterPDF';
import { exportPartywiseAverageRatePDF } from './partywiseAverageRatePDF';
import { exportPOLifeCyclePDF } from './poLifeCyclePDF';
import { exportPurchaseOrderPDF } from './purchaseOrderPDF';
import { exportPurchaseRegisterDetailPDF } from './purchaseRegisterDetailPDF';
import { exportPurchaseRegisterSummaryPDF } from './purchaseRegisterSummaryPDF';
import { exportPurchaseRegisterTaxSummaryPDF } from './purchaseRegisterTaxSummaryPDF';
import { exportPurchaseReportPDF } from './purchaseReportPDF';
import { exportPurchaseReturnRegisterPDF } from './purchaseReturnRegisterPDF';
import { exportQuotationRegisterPDF } from './quotationRegisterPDF';
import { exportStockLedgerPDF } from './stockLedgerPDF';
import { exportStockSummaryPDF } from './stockSummaryPDF';
import { exportStockTransferRegisterPDF } from './stockTransferRegisterPDF';

export {
  exportChallanReceiveRegisterPDF,
  exportConsumeRegisterPDF,
  exportCurrentStockRegisterPDF,
  exportDepartmentIssueRegisterPDF,
  exportFNDCostStatementPDF,
  exportGRNRegisterPDF,
  exportIndentRegisterPDF,
  exportPartywiseAverageRatePDF,
  exportPOLifeCyclePDF,
  exportPurchaseOrderPDF,
  exportPurchaseRegisterDetailPDF,
  exportPurchaseRegisterSummaryPDF,
  exportPurchaseRegisterTaxSummaryPDF,
  exportPurchaseReportPDF,
  exportPurchaseReturnRegisterPDF,
  exportQuotationRegisterPDF,
  exportStockLedgerPDF,
  exportStockSummaryPDF,
  exportStockTransferRegisterPDF
};

/**
 * Main Purchase Module PDF Export Entry Point
 * Dispatches to specific report PDF exporters or generic Purchase PDF exporter
 */
export const exportPurchasePDF = (reportName, columns, data, activeFilters, printedOnStr) => {
  const normName = (reportName || '').toLowerCase().trim();

  if (normName.includes('challan') || normName.includes('challan recieve') || normName.includes('challan receive')) {
    exportChallanReceiveRegisterPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('consume register')) {
    exportConsumeRegisterPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('stock summary') || normName.includes('stock-summary')) {
    exportStockSummaryPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('stock transfer') || normName.includes('transfer register') || normName.includes('stock-transfer')) {
    exportStockTransferRegisterPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('current stock') || normName.includes('stock register')) {
    exportCurrentStockRegisterPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('stock ledger')) {
    exportStockLedgerPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('department issue') || normName.includes('department-issue')) {
    exportDepartmentIssueRegisterPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('cost statement') || normName.includes('f&d cost')) {
    exportFNDCostStatementPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('grn register') || normName.includes('grn-register')) {
    exportGRNRegisterPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('indent register') || normName.includes('indent-register')) {
    exportIndentRegisterPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('partywise') || normName.includes('average rate') || normName.includes('party wise')) {
    exportPartywiseAverageRatePDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('life cycle') || normName.includes('po life')) {
    exportPOLifeCyclePDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('quotation register') || normName.includes('quotation-register') || normName.includes('quotation')) {
    exportQuotationRegisterPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('summary tax detail') || normName.includes('tax detail') || normName.includes('tax summary')) {
    exportPurchaseRegisterTaxSummaryPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('purchase return') || normName.includes('return register')) {
    exportPurchaseReturnRegisterPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('register summary') || normName.includes('purchase register summary')) {
    exportPurchaseRegisterSummaryPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('register detail') || normName.includes('purchase register detail')) {
    exportPurchaseRegisterDetailPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  if (normName.includes('purchase order')) {
    exportPurchaseOrderPDF(reportName, columns, data, activeFilters, printedOnStr);
    return;
  }

  // Fallback to standardized Purchase PDF Exporter
  exportPurchaseReportPDF(reportName, columns, data, activeFilters, printedOnStr);
};
