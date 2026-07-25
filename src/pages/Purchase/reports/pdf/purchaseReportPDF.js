import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generic Purchase PDF Exporter for all 35 Purchase Module Reports
 * Standardized with HOTEL BOBINA Header, Filter Parameters Block, and Courier Data Table
 */
export const exportPurchaseReportPDF = (reportName, columns, data, activeFilters, printedOnStr) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const leftMargin = 12;
    const rightMargin = 12;

    // 1. Hotel Header
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text('ALFA', pageWidth / 2, 14, { align: 'center' });

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

    const fromStr = formatDateDisplay(activeFilters?.startDate, '01/Apr/2026');
    const toStr = formatDateDisplay(activeFilters?.endDate, '25/Jul/2026');

    doc.setFontSize(10.5);
    doc.text(`${reportName} From ${fromStr} To ${toStr}`, pageWidth / 2, 20, { align: 'center' });

    // 3. Filter Parameters Block (Left Aligned Key-Value Pairs)
    doc.setFont('Courier', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(30, 41, 59);

    let filterY = 27;
    const filterLines = [
      `From Date       : ${fromStr}`,
      `To Date         : ${toStr}`,
      `Category Name   : ${activeFilters?.category || 'All'}`,
      `Group Name      : All`,
      `Item            : All`,
      `In Department   : All`,
      `Site Name       : HO`,
      `Item Type       : All`,
      `Type            : Detailed`
    ];

    filterLines.forEach(line => {
      doc.text(line, leftMargin, filterY);
      filterY += 4;
    });

    const startTableY = filterY + 3;

    // 4. Columns & Data mapping
    const tableHeaders = columns;
    const tableRows = (data || []).map((rowObj) =>
      columns.map((_, colIdx) => {
        const rawVal = rowObj[`c${colIdx + 1}`] || '';
        return String(rawVal).replace(/₹/g, 'Rs. ');
      })
    );

    const tableConfig = {
      startY: startTableY,
      head: [tableHeaders],
      body: tableRows,
      theme: 'plain',
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
        if (name.includes('AMOUNT') || name.includes('RATE') || name.includes('VALUATION') || name.includes('TOTAL') || name.includes('PRICE') || name.includes('TAX')) {
          acc[idx] = { halign: 'right' };
        } else if (name.includes('QTY') || name.includes('UNIT') || name.includes('DATE') || name.includes('NO') || name.includes('#')) {
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
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  } catch (err) {
    console.error('Export Purchase PDF Error:', err);
  }
};
