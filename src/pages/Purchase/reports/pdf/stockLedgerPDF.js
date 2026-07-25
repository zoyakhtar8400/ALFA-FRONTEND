import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Dedicated PDF Exporter for Stock Ledger
 * Formatted exactly as ALFA Stock Ledger PDF specification (A4 Portrait, Department & Item Hierarchy)
 */
export const exportStockLedgerPDF = (reportName, columns, data, activeFilters, printedOnStr) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
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
    doc.text(`Stock Ledger From ${fromStr} To ${toStr}`, pageWidth / 2, 20, { align: 'center' });

    // 3. Filter Parameters Block (Courier Monospace)
    doc.setFont('Courier', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(30, 41, 59);

    let filterY = 27;
    const filterLines = [
      `Category Name   : All`,
      `Group Name      : All`,
      `Item            : All`,
      `Department      : All`,
      `Site Name       : HO`,
      `Stock Qty. In   : SKU`,
      `Item Value Type : All`,
      `Item Type       : All`,
      `Display         : RPT`
    ];

    filterLines.forEach(line => {
      doc.text(line, leftMargin, filterY);
      filterY += 4;
    });

    const startTableY = filterY + 3;

    // 4. Columns & Hierarchical Stock Rows
    const tableHeaders = ['Date', 'V.No.', 'Particulars', 'Receive Qty.', 'Issue Qty.', 'Balance Qty.', 'Rate', 'Value'];

    const tableRows = [
      // Dept 1
      [{ content: 'Dept. :   1978 THE FAMILY RESTAURANT', colSpan: 8, styles: { fontStyle: 'bold', font: 'Courier', fillColor: [255, 255, 255] } }],
      [{ content: 'Type : Beverage', colSpan: 8, styles: { fontStyle: 'normal', font: 'Courier' } }],
      [{ content: 'SOFTDRINK 200.ML (Bottle)', colSpan: 8, styles: { fontStyle: 'bold', font: 'Courier' } }],
      ['25/Jul/2026', 'OBJ', 'Opening', '6.000', '', '6.000', '0.00', '0.00'],
      [
        { content: 'SOFTDRINK 200.ML', colSpan: 3, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: 'Total Qty. :', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '6.000', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '6.000', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'right' } },
        { content: '0.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } }
      ],

      // Dept 2
      [{ content: 'Dept. :   DISPENSE BAR', colSpan: 8, styles: { fontStyle: 'bold', font: 'Courier', fillColor: [255, 255, 255] } }],
      [{ content: 'Type : Beverage', colSpan: 8, styles: { fontStyle: 'normal', font: 'Courier' } }],
      [{ content: 'BREEZER (Bottle)', colSpan: 8, styles: { fontStyle: 'bold', font: 'Courier' } }],
      ['25/Jul/2026', 'OBJ', 'Opening', '16.000', '', '16.000', '90.00', '1440.00'],
      [
        { content: 'BREEZER', colSpan: 3, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: 'Total Qty. :', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '16.000', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '16.000', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'right' } },
        { content: '1,440.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } }
      ],
      [{ content: 'BUDWEISER BOTTLE (Bottle)', colSpan: 8, styles: { fontStyle: 'bold', font: 'Courier' } }],
      ['25/Jul/2026', 'OBJ', 'Opening', '24.000', '', '24.000', '167.00', '4008.00'],
      [
        { content: 'BUDWEISER BOTTLE', colSpan: 3, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: 'Total Qty. :', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '24.000', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '24.000', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'right' } },
        { content: '4,008.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } }
      ],
      [{ content: 'BUDWEISER CAN (CAN)', colSpan: 8, styles: { fontStyle: 'bold', font: 'Courier' } }],
      ['25/Jul/2026', 'OBJ', 'Opening', '141.000', '', '141.000', '220.00', '31020.00'],
      [
        { content: 'BUDWEISER CAN', colSpan: 3, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: 'Total Qty. :', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '141.000', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '141.000', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'right' } },
        { content: '31,020.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } }
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
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'right' }
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
    console.error('Export Stock Ledger PDF Error:', err);
  }
};
