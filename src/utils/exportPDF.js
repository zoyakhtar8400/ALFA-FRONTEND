import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addRupeeFont } from './addRupeeFont';
import { exportSalesRegisterPDF } from './exportSalesRegisterPDF';
import { exportItemwiseSalePDF } from './exportItemwiseSalePDF';
import { exportItemwiseCategorywiseSalePDF } from './exportItemwiseCategorywiseSalePDF';
import { exportTablewiseSalePDF } from './exportTablewiseSalePDF';
import { exportCoverAnalysisPDF } from './exportCoverAnalysisPDF';
import { exportKitchenTimeGapPDF } from './exportKitchenTimeGapPDF';
import { exportStewardwiseSalePDF } from './exportStewardwiseSalePDF';
import { exportTaxRegisterDetailedPDF } from './exportTaxRegisterDetailedPDF';
import { exportTaxSummaryDatewisePDF } from './exportTaxSummaryDatewisePDF';
import { exportKOTRegisterPDF } from './exportKOTRegisterPDF';
import { exportNCKOTPDF } from './exportNCKOTPDF';
import { exportPendingKOTPDF } from './exportPendingKOTPDF';
import { exportCashierSettlementPDF } from './exportCashierSettlementPDF';
import { exportUserwiseCollectionPDF } from './exportUserwiseCollectionPDF';
import { exportCustomerInfoPDF } from './exportCustomerInfoPDF';
import { exportCustomerOutletVisitPDF } from './exportCustomerOutletVisitPDF';

export const exportPDF = (reportName, columns, data, activeFilters, printedOnStr, companyName = 'ALFA HOTEL MANAGEMENT SYSTEM', companyLogo = null) => {
  // Delegate Customer Info to custom portrait exporter
  if (reportName === 'Customer Info Report') {
    exportCustomerInfoPDF(columns, data, activeFilters, printedOnStr);
    return;
  }
  // Delegate Customer Outlet Visit to custom portrait exporter
  if (reportName === 'Customer Outlet Visit Report') {
    exportCustomerOutletVisitPDF(columns, data, activeFilters, printedOnStr);
    return;
  }
  // Delegate User Wise Collection to custom portrait exporter
  if (reportName === 'User Wise Collection Report(Summary)') {
    exportUserwiseCollectionPDF(columns, data, activeFilters, printedOnStr);
    return;
  }
  // Delegate Cashier Settlement to custom portrait exporter
  if (reportName === 'Cashier Settlement Report(Detailed)') {
    exportCashierSettlementPDF(columns, data, activeFilters, printedOnStr);
    return;
  }
  // Delegate Pending KOT to custom landscape exporter
  if (reportName === 'Pending KOT Report') {
    exportPendingKOTPDF(columns, data, activeFilters, printedOnStr);
    return;
  }
  // Delegate NC KOT to custom portrait exporter
  if (reportName === 'NC KOT(Bill Report)(Detailed)') {
    exportNCKOTPDF(columns, data, activeFilters, printedOnStr);
    return;
  }
  // Delegate KOT Register to custom landscape exporter
  if (reportName === 'KOT Register') {
    exportKOTRegisterPDF(columns, data, activeFilters, printedOnStr);
    return;
  }
  // Delegate Tax Register (Detailed) to custom landscape exporter
  if (reportName === 'Tax Register (Detailed)') {
    exportTaxRegisterDetailedPDF(columns, data, activeFilters, printedOnStr);
    return;
  }
  // Delegate Tax Summary Datewise to custom landscape exporter
  if (reportName === 'Tax Summary Datewise') {
    exportTaxSummaryDatewisePDF(columns, data, activeFilters, printedOnStr);
    return;
  }
  // Delegate Sales Register to custom landscape exporter
  if (reportName === 'Sales Register') {
    exportSalesRegisterPDF(columns, data, activeFilters, printedOnStr, companyName, companyLogo);
    return;
  }
  // Delegate Itemwise Sale to custom portrait exporter
  if (reportName === 'Itemwise Sale') {
    exportItemwiseSalePDF(columns, data, activeFilters, printedOnStr);
    return;
  }
  // Delegate Itemwise Categorywise Sale to custom portrait exporter
  if (reportName === 'Itemwise Categorywise Sale') {
    exportItemwiseCategorywiseSalePDF(columns, data, activeFilters, printedOnStr);
    return;
  }
  // Delegate Itemwise Outletwise Sale to custom portrait exporter
  if (reportName === 'Itemwise Outletwise Sale') {
    exportItemwiseSalePDF(columns, data, activeFilters, printedOnStr);
    return;
  }
  // Delegate Tablewise Itemwise Sale to custom portrait exporter
  if (reportName === 'Tablewise Itemwise Sale') {
    exportTablewiseSalePDF(columns, data, activeFilters, printedOnStr);
    return;
  }
  // Delegate Cover Analysis Report to custom portrait exporter
  if (reportName === 'Cover Analysis Report') {
    exportCoverAnalysisPDF(columns, data, activeFilters, printedOnStr);
    return;
  }
  // Delegate Kitchen Time Gap Report to custom landscape exporter
  if (reportName === 'Kitchen Time Gap Report') {
    exportKitchenTimeGapPDF(columns, data, activeFilters, printedOnStr);
    return;
  }
  // Delegate Stewardwise Item Sale to custom portrait exporter
  if (reportName === 'Stewardwise Item Sale') {
    exportStewardwiseSalePDF(columns, data, activeFilters, printedOnStr);
    return;
  }

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    addRupeeFont(doc);

    const pageWidth = 210;
    const pageHeight = 297;
    const leftMargin = 12;
    const rightMargin = 12;

    // 1. Hotel Header
    let currentY = 14;
    if (companyLogo && companyLogo.startsWith('data:image')) {
      try {
        // Simple center logic for a roughly square logo
        doc.addImage(companyLogo, 'PNG', (pageWidth / 2) - 8, 4, 16, 16);
        doc.setFont('ArialRupee', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(0, 0, 0);
        currentY = 25;
        doc.text(companyName, pageWidth / 2, currentY, { align: 'center' });
      } catch (e) {
        doc.setFont('ArialRupee', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(0, 0, 0);
        doc.text(companyName, pageWidth / 2, currentY, { align: 'center' });
      }
    } else {
      doc.setFont('ArialRupee', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text(companyName, pageWidth / 2, currentY, { align: 'center' });
    }

    // 2. Date Range Format
    const formatDateDisplay = (dateVal, defaultFallback) => {
      if (!dateVal) return defaultFallback;
      try {
        const parts = dateVal.split('-');
        if (parts.length === 3) {
          const d = parseInt(parts[2]);
          const mIdx = parseInt(parts[1]) - 1;
          const y = parts[0];
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return `${String(d).padStart(2, '0')}/${months[mIdx] || 'Apr'}/${y}`;
        }
      } catch (e) {
        // ignore
      }
      return defaultFallback;
    };

    const fromStr = formatDateDisplay(activeFilters?.startDate || activeFilters?.dateFrom, 'Start');
    const toStr = formatDateDisplay(activeFilters?.endDate || activeFilters?.dateTo, 'End');

    currentY += 6;
    doc.setFontSize(10.5);
    doc.text(`${reportName} From ${fromStr} To ${toStr}`, pageWidth / 2, currentY, { align: 'center' });

    // 3. Filter Parameters Block (Left Aligned Key-Value Pairs)
    doc.setFont('ArialRupee', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(30, 41, 59);

    let filterY = currentY + 7;
    const filterLines = [
      `From Date       : ${fromStr}`,
      `To Date         : ${toStr}`,
      `Outlet Name     : ${activeFilters?.outlet || activeFilters?.category || 'All Outlets'}`,
      `Site Name       : HO`,
      `Report Type     : Detailed`
    ];

    filterLines.forEach((line) => {
      doc.text(line, leftMargin, filterY);
      filterY += 4;
    });

    const startTableY = filterY + 3;

    // 4. Columns & Data Mapping
    const tableHeaders = columns;
    const tableRows = (data || []).map((rowObj) =>
      columns.map((_, colIdx) => {
        const rawVal = rowObj[`c${colIdx + 1}`] || '';
        return String(rawVal).replace(/Rs\.\s*/gi, '₹ ').replace(/¹/g, '₹');
      })
    );

    const tableConfig = {
      startY: startTableY,
      head: [tableHeaders],
      body: tableRows,
      theme: 'plain',
      styles: {
        font: 'ArialRupee',
        lineColor: [226, 232, 240],
        lineWidth: 0.1
      },
      headStyles: {
        fillColor: [209, 213, 219], // Light Gray Header (#D1D5DB)
        textColor: [0, 0, 0],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left',
        valign: 'middle',
        cellPadding: 2
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [0, 0, 0],
        font: 'Courier',
        valign: 'middle',
        cellPadding: 2
      },
      columnStyles: columns.reduce((acc, colName, idx) => {
        const name = colName.toUpperCase();
        if (name.includes('AMOUNT') || name.includes('RATE') || name.includes('VALUATION') || name.includes('TOTAL') || name.includes('PRICE') || name.includes('TAX') || name.includes('REVENUE') || name.includes('PAID') || name.includes('BILL')) {
          acc[idx] = { halign: 'right' };
        } else if (name.includes('QTY') || name.includes('UNIT') || name.includes('DATE') || name.includes('NO') || name.includes('#') || name.includes('ROOM')) {
          acc[idx] = { halign: 'center' };
        } else {
          acc[idx] = { halign: 'left' };
        }
        return acc;
      }, {}),
      styles: {
        lineColor: [226, 232, 240],
        lineWidth: 0.1
      },
      margin: { left: leftMargin, right: rightMargin, top: 15, bottom: 15 },
      pageBreak: 'auto'
    };

    if (typeof autoTable === 'function') {
      autoTable(doc, tableConfig);
    } else if (typeof doc.autoTable === 'function') {
      doc.autoTable(tableConfig);
    }

    // 5. Footer (Printed By & Page X of Y)
    const totalPages = doc.internal.getNumberOfPages();
    const printDateStr = printedOnStr || new Date().toLocaleString();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);

      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.2);
      doc.line(leftMargin, pageHeight - 12, pageWidth - rightMargin, pageHeight - 12);

      doc.text(`Printed By : SA on ${printDateStr}`, leftMargin, pageHeight - 7);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - rightMargin, pageHeight - 7, { align: 'right' });
    }

    // Open PDF in new browser tab
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  } catch (err) {
    console.error('Export FrontDesk PDF Error:', err);
  }
};
