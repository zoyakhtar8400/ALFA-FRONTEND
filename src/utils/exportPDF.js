import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
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

export const exportPDF = (reportName, columns, data, activeFilters, printedOn) => {
  // Delegate Customer Info to custom portrait exporter
  if (reportName === 'Customer Info Report') {
    exportCustomerInfoPDF(columns, data, activeFilters, printedOn);
    return;
  }
  // Delegate Customer Outlet Visit to custom portrait exporter
  if (reportName === 'Customer Outlet Visit Report') {
    exportCustomerOutletVisitPDF(columns, data, activeFilters, printedOn);
    return;
  }
  // Delegate User Wise Collection to custom portrait exporter
  if (reportName === 'User Wise Collection Report(Summary)') {
    exportUserwiseCollectionPDF(columns, data, activeFilters, printedOn);
    return;
  }
  // Delegate Cashier Settlement to custom portrait exporter
  if (reportName === 'Cashier Settlement Report(Detailed)') {
    exportCashierSettlementPDF(columns, data, activeFilters, printedOn);
    return;
  }
  // Delegate Pending KOT to custom landscape exporter
  if (reportName === 'Pending KOT Report') {
    exportPendingKOTPDF(columns, data, activeFilters, printedOn);
    return;
  }
  // Delegate NC KOT to custom portrait exporter
  if (reportName === 'NC KOT(Bill Report)(Detailed)') {
    exportNCKOTPDF(columns, data, activeFilters, printedOn);
    return;
  }
  // Delegate KOT Register to custom landscape exporter
  if (reportName === 'KOT Register') {
    exportKOTRegisterPDF(columns, data, activeFilters, printedOn);
    return;
  }
  // Delegate Tax Register (Detailed) to custom landscape exporter
  if (reportName === 'Tax Register (Detailed)') {
    exportTaxRegisterDetailedPDF(columns, data, activeFilters, printedOn);
    return;
  }
  // Delegate Tax Summary Datewise to custom landscape exporter
  if (reportName === 'Tax Summary Datewise') {
    exportTaxSummaryDatewisePDF(columns, data, activeFilters, printedOn);
    return;
  }
  // Delegate Sales Register to custom landscape exporter
  if (reportName === 'Sales Register') {
    exportSalesRegisterPDF(columns, data, activeFilters, printedOn);
    return;
  }
  // Delegate Itemwise Sale to custom portrait exporter
  if (reportName === 'Itemwise Sale') {
    exportItemwiseSalePDF(columns, data, activeFilters, printedOn);
    return;
  }
  // Delegate Itemwise Categorywise Sale to custom portrait exporter
  if (reportName === 'Itemwise Categorywise Sale') {
    exportItemwiseCategorywiseSalePDF(columns, data, activeFilters, printedOn);
    return;
  }
  // Delegate Itemwise Outletwise Sale to custom portrait exporter
  if (reportName === 'Itemwise Outletwise Sale') {
    exportItemwiseSalePDF(columns, data, activeFilters, printedOn);
    return;
  }
  // Delegate Tablewise Itemwise Sale to custom portrait exporter
  if (reportName === 'Tablewise Itemwise Sale') {
    exportTablewiseSalePDF(columns, data, activeFilters, printedOn);
    return;
  }
  // Delegate Cover Analysis Report to custom portrait exporter
  if (reportName === 'Cover Analysis Report') {
    exportCoverAnalysisPDF(columns, data, activeFilters, printedOn);
    return;
  }
  // Delegate Kitchen Time Gap Report to custom landscape exporter
  if (reportName === 'Kitchen Time Gap Report') {
    exportKitchenTimeGapPDF(columns, data, activeFilters, printedOn);
    return;
  }
  // Delegate Stewardwise Item Sale to custom portrait exporter
  if (reportName === 'Stewardwise Item Sale') {
    exportStewardwiseSalePDF(columns, data, activeFilters, printedOn);
    return;
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const leftMargin = 15;
  const rightMargin = 15;
  const printableWidth = pageWidth - leftMargin - rightMargin; // 180mm

  // Ensure actualPrintedOn is set
  const actualPrintedOn = printedOn || (() => {
    const now = new Date();
    const datePart = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const timePart = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${datePart} ${timePart}`;
  })();

  // 1. Clean Title Block
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text('ALFA HOTEL MANAGEMENT SYSTEM', pageWidth / 2, 14, { align: 'center' });
  
  doc.setFontSize(10.5);
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text(`${reportName} Report`, pageWidth / 2, 19.5, { align: 'center' });

  // 2. Printed Metadata Info
  doc.setFontSize(7.5);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(100, 116, 139); // Slate-500
  
  // Format filter text if filters are passed
  let filterText = 'Outlet: All Outlets';
  if (activeFilters) {
    if (activeFilters.startDate && activeFilters.endDate) {
      filterText = `Date Range: ${activeFilters.startDate} to ${activeFilters.endDate}   |   ${filterText}`;
    } else if (activeFilters.dateFrom && activeFilters.dateTo) {
      filterText = `Date Range: ${activeFilters.dateFrom} to ${activeFilters.dateTo}   |   ${filterText}`;
    }
  }

  doc.text(filterText, leftMargin, 26);
  doc.text(`Generated By: Admin   |   Generated On: ${actualPrintedOn}`, pageWidth - rightMargin, 26, { align: 'right' });

  // Subtle separator line
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.3);
  doc.line(leftMargin, 28, pageWidth - rightMargin, 28);

  const yOffset = 32;

  // 3. Table Rows Mapping
  const tableHeaders = columns;
  const tableRows = data.map((rowObj) => 
    columns.map((_, colIdx) => {
      const rawVal = rowObj[`c${colIdx + 1}`] || '';
      return String(rawVal);
    })
  );

  // 4. AutoTable Configuration
  autoTable(doc, {
    startY: yOffset,
    head: [tableHeaders],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Dark Navy/Slate header (#1E293B)
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: 2.2
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
      valign: 'middle',
      cellPadding: 2.2
    },
    columnStyles: {
      ...columns.reduce((acc, colName, idx) => {
        const name = colName.toUpperCase();
        
        // Right-align currency / numeric values automatically
        const isNumeric = name.includes('AMOUNT') || 
                          name.includes('REVENUE') || 
                          name.includes('TAX') || 
                          name.includes('BILL') || 
                          name.includes('PAID') || 
                          name.includes('TOTAL') ||
                          name.includes('VAL') ||
                          name.includes('QUANTITY') ||
                          name.includes('SUBTOTAL') ||
                          name.includes('DISCOUNT') ||
                          name.includes('QTY');
        
        const isDateOrTime = name.includes('DATE') || name.includes('TIME') || name === 'SR NO' || name === 'S.NO.';

        if (isNumeric) {
          acc[idx] = { halign: 'right', fontStyle: name.includes('TOTAL') || name.includes('NET') ? 'bold' : 'normal' };
        } else if (isDateOrTime) {
          acc[idx] = { halign: 'center' };
        } else {
          acc[idx] = { halign: 'left' };
        }
        return acc;
      }, {})
    },
    styles: {
      lineColor: [226, 232, 240],
      lineWidth: 0.15
    },
    margin: { left: leftMargin, right: rightMargin, top: 15, bottom: 15 },
    pageBreak: 'auto'
  });

  // 5. Running Headers and Footers (Two-pass)
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Draw running header for page >= 2
    if (i > 1) {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`ALFA HOTEL MANAGEMENT SYSTEM   |   ${reportName} Report`, leftMargin, 10);
      
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.25);
      doc.line(leftMargin, 12, pageWidth - rightMargin, 12);
    }

    // Running Footer
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(leftMargin, pageHeight - 12, pageWidth - rightMargin, pageHeight - 12);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    
    // Left: ALFA HMS
    doc.text('ALFA HMS', leftMargin, pageHeight - 8);
    
    // Center: Report Title
    doc.text(`${reportName} Report`, pageWidth / 2, pageHeight - 8, { align: 'center' });
    
    // Right: Page X of Y
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - rightMargin, pageHeight - 8, { align: 'right' });
  }

  // Open the PDF in a new browser tab/window instead of downloading it directly
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank');
};
