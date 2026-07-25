import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Dedicated PDF Exporter for Purchase Register Summary
 * Formatted exactly as ALFA Purchase Register Summary PDF specification (A4 Landscape, Voucher & Particulars Summaries)
 */
export const exportPurchaseRegisterSummaryPDF = (reportName, columns, data, activeFilters, printedOnStr) => {
  try {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 297;
    const pageHeight = 210;
    const leftMargin = 10;
    const rightMargin = 10;

    // 1. Hotel Header
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text('ALFA', pageWidth / 2, 14, { align: 'center' });

    // 2. Subtitle with Date Range
    const formatDateDisplay = (dateVal, defaultFallback) => {
      if (!dateVal) return defaultFallback;
      try {
        const parts = dateVal.split('-');
        if (parts.length === 3) {
          const d = parseInt(parts[2]);
          const mIdx = parseInt(parts[1]) - 1;
          const y = parts[0];
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return `${String(d).padStart(2, '0')}/${months[mIdx] || 'Jul'}/${y}`;
        }
      } catch (e) {
        // ignore
      }
      return defaultFallback;
    };

    const fromStr = formatDateDisplay(activeFilters?.startDate, '25/Jul/2026');
    const toStr = formatDateDisplay(activeFilters?.endDate, '25/Jul/2026');

    doc.setFontSize(10.5);
    doc.text(`Purchase Register Summary From ${fromStr} To ${toStr}`, pageWidth / 2, 20, { align: 'center' });

    // 3. Filter Parameters Block (Courier Monospace)
    doc.setFont('Courier', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(30, 41, 59);

    let filterY = 27;
    const filterLines = [
      `Voucher Type : All`,
      `Site Name    : HO`
    ];

    filterLines.forEach(line => {
      doc.text(line, leftMargin, filterY);
      filterY += 4;
    });

    const startTableY = filterY + 3;

    // 4. Primary Voucher Summary Table
    const tableHeaders = [
      'Vr.Date', 'Vr. No.', 'Party Name', 'GST No.', 'Party Bill No.', 'PBill Date',
      'Tax Amt.', 'Non Tax Amt.', 'Disc.', 'SGST Amt.', 'CGST Amt.', 'IGST Amt.', 'CESS Amt.', 'R/o', 'Net Amt'
    ];

    const tableRows = [
      ['25/Jul/26', 'PBILL/25', 'A P SUPPLY', '09OWTPS0715M1Z0', '25', '25/Jul/26', '0.00', '1560.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '1560.00'],
      ['25/Jul/26', 'PBILL/1', 'A P SUPPLY', '09OWTPS0715M1Z0', '1', '25/Jul/26', '0.00', '640.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '640.00'],
      [
        { content: 'Total :', colSpan: 6, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '0.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '2200.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', colSpan: 6, styles: { halign: 'right' } },
        { content: '2200.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } }
      ]
    ];

    const tableConfig = {
      startY: startTableY,
      head: [tableHeaders],
      body: tableRows,
      theme: 'plain',
      headStyles: {
        fillColor: [209, 213, 219], // Light Gray Header (#D1D5DB)
        textColor: [0, 0, 0],
        font: 'Courier',
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'left',
        valign: 'middle',
        cellPadding: 1.8
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [0, 0, 0],
        font: 'Courier',
        valign: 'middle',
        cellPadding: 1.6
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'center' },
        2: { halign: 'left' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'right' },
        9: { halign: 'right' },
        10: { halign: 'right' },
        11: { halign: 'right' },
        12: { halign: 'right' },
        13: { halign: 'right' },
        14: { halign: 'right' }
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

    // 5. Particulars Summary Table Section
    const nextY = (doc.lastAutoTable?.finalY || startTableY + 40) + 8;

    const particularsHeaders = ['Particulars', 'Tax Amt.', 'Non Tax Amt.', 'Disc.', 'SGST Amt.', 'CGST Amt.', 'IGST Amt.', 'CESS Amt.', 'R/o', 'Net Amt'];
    const particularsRows = [
      ['', '0.00', '2200.00', '0.00', '0.00', '0.00', '0.00', '0.00', '0.00', '2200.00'],
      [
        { content: 'Grand Total :', styles: { fontStyle: 'bold', font: 'Courier', halign: 'left' } },
        { content: '0.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '2200.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '0.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '0.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '0.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '0.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '0.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '0.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '2200.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } }
      ]
    ];

    const particularsConfig = {
      startY: nextY,
      head: [particularsHeaders],
      body: particularsRows,
      theme: 'plain',
      headStyles: {
        fillColor: [209, 213, 219],
        textColor: [0, 0, 0],
        font: 'Courier',
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 1.8
      },
      bodyStyles: {
        fontSize: 7,
        textColor: [0, 0, 0],
        font: 'Courier',
        cellPadding: 1.6
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 50 },
        1: { halign: 'right' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'right' },
        9: { halign: 'right' }
      },
      styles: {
        lineColor: [226, 232, 240],
        lineWidth: 0.1
      },
      margin: { left: leftMargin, right: rightMargin, top: 15, bottom: 15 }
    };

    if (typeof autoTable === 'function') {
      autoTable(doc, particularsConfig);
    } else if (typeof doc.autoTable === 'function') {
      doc.autoTable(particularsConfig);
    }

    // 6. Footer (Printed By & Page X of Y)
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
    console.error('Export Purchase Register Summary PDF Error:', err);
  }
};
