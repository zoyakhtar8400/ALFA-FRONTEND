import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Dedicated PDF Exporter for Collection Register Report
 */
export const exportCollectionRegisterPDF = (reportName, columns, data, activeFilters, printedOnStr) => {
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

    const fromStr = activeFilters?.startDate || '01/Apr/2026';
    const toStr = activeFilters?.endDate || '25/Jul/2026';

    doc.setFontSize(10.5);
    doc.text(`Collection Register Report From ${fromStr} To ${toStr}`, pageWidth / 2, 20, { align: 'center' });

    // 2. Filter Parameters Block
    doc.setFont('Courier', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(30, 41, 59);

    let filterY = 27;
    const filterLines = [
      `From Date       : ${fromStr}`,
      `To Date         : ${toStr}`,
      `Payment Mode    : ${activeFilters?.payMode || 'All Payment Modes'}`,
      `Cashier         : ${activeFilters?.cashier || 'All Cashiers'}`,
      `Site Name       : HO`,
      `Report Type     : Detailed Receipts`
    ];

    filterLines.forEach((line) => {
      doc.text(line, leftMargin, filterY);
      filterY += 4;
    });

    const startTableY = filterY + 3;

    // 3. Columns & Data Mapping
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
        fillColor: [209, 213, 219],
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
      columnStyles: {
        0: { halign: 'center' }, // Receipt #
        1: { halign: 'center' }, // Date
        2: { halign: 'left' },   // Guest Name
        3: { halign: 'left' },   // Payment Mode
        4: { halign: 'right' },  // Amount
        5: { halign: 'left' },   // Settled For
        6: { halign: 'center' }  // Cashier
      },
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

    // 4. Footer (Printed By & Page X of Y)
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
    console.error('Export Collection Register PDF Error:', err);
  }
};
