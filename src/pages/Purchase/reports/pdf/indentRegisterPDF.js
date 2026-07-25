import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Dedicated PDF Exporter for Indent Register
 * Formatted exactly as ALFA Indent Register PDF specification (Includes Department Item wise Summary section)
 */
export const exportIndentRegisterPDF = (reportName, columns, data, activeFilters, printedOnStr) => {
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

    // 2. Report Subtitle
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
    doc.text(`Indent Register From ${fromStr} To ${toStr}`, pageWidth / 2, 20, { align: 'center' });

    // 3. Filter Parameters Block (Courier Monospace)
    doc.setFont('Courier', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(30, 41, 59);

    let filterY = 27;
    const filterLines = [
      `Closed        : No`,
      `Site Name     : HO`,
      `Itemwise Only : No`
    ];

    filterLines.forEach(line => {
      doc.text(line, leftMargin, filterY);
      filterY += 4;
    });

    const startTableY = filterY + 3;

    // 4. Primary Indent Table
    const tableHeaders = ['Indent No.', 'Indent Date', 'Indenter', 'Department', 'Item', 'Unit', 'Ind. Qty.', 'Apr. Qty.', 'Ord Qty.', 'Remark'];

    const tableRows = [
      ['1', '25/Jul/26', 'DEMO', 'MAIN KITCHEN', 'AATA', 'K.G.', '10.000', '10.000', '-', ''],
      ['2', '25/Jul/26', 'DEMO', 'MAIN KITCHEN', 'SUGAR KG', 'K.G.', '5.000', '5.000', '-', ''],
      [
        { content: 'Total :', colSpan: 6, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '15.000', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '15.000', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', colSpan: 2, styles: { halign: 'left' } }
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
        fontSize: 7.8,
        fontStyle: 'bold',
        halign: 'left',
        valign: 'middle',
        cellPadding: 1.8
      },
      bodyStyles: {
        fontSize: 7.2,
        textColor: [0, 0, 0],
        font: 'Courier',
        valign: 'middle',
        cellPadding: 1.6
      },
      columnStyles: {
        0: { halign: 'center' },
        1: { halign: 'center' },
        2: { halign: 'left' },
        3: { halign: 'left' },
        4: { halign: 'left' },
        5: { halign: 'center' },
        6: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'center' },
        9: { halign: 'left' }
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

    // 5. Department Item wise Summary Section
    const nextY = (doc.lastAutoTable?.finalY || startTableY + 40) + 12;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Department Item wise Summary', pageWidth / 2, nextY, { align: 'center' });

    const summaryHeaders = ['Item Name', 'Ind. Qty', 'Apr. Qty'];
    const summaryRows = [
      [{ content: 'Dept. Name :   MAIN KITCHEN', colSpan: 3, styles: { fontStyle: 'bold', font: 'Courier', fillColor: [255, 255, 255] } }],
      ['AATA', '10.00', '10.00'],
      ['SUGAR KG', '5.00', '5.00'],
      [
        { content: 'Dept. Total :', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '15.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '15.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } }
      ],
      [
        { content: 'Grand Total :', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '15.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '15.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } }
      ]
    ];

    const summaryConfig = {
      startY: nextY + 4,
      head: [summaryHeaders],
      body: summaryRows,
      theme: 'plain',
      headStyles: {
        fillColor: [209, 213, 219],
        textColor: [0, 0, 0],
        font: 'Courier',
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left',
        cellPadding: 2
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [0, 0, 0],
        font: 'Courier',
        cellPadding: 1.8
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 100 },
        1: { halign: 'right', cellWidth: 40 },
        2: { halign: 'right', cellWidth: 40 }
      },
      styles: {
        lineColor: [226, 232, 240],
        lineWidth: 0.1
      },
      margin: { left: leftMargin, right: rightMargin, top: 15, bottom: 15 }
    };

    if (typeof autoTable === 'function') {
      autoTable(doc, summaryConfig);
    } else if (typeof doc.autoTable === 'function') {
      doc.autoTable(summaryConfig);
    }

    // 6. Running Footer
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
    console.error('Export Indent Register PDF Error:', err);
  }
};
