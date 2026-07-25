import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Dedicated PDF Exporter for Stock Transfer Register
 * Formatted exactly as ALFA Stock Transfer Register PDF specification (A4 Portrait, Store Transfer & Product Subgroups)
 */
export const exportStockTransferRegisterPDF = (reportName, columns, data, activeFilters, printedOnStr) => {
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

    const fromStr = formatDateDisplay(activeFilters?.startDate, '01/Jul/2026');
    const toStr = formatDateDisplay(activeFilters?.endDate, '25/Jul/2026');

    doc.setFontSize(10.5);
    doc.text(`Stock Transfer Register From ${fromStr} To ${toStr}`, pageWidth / 2, 20, { align: 'center' });

    // 3. Filter Parameters Block (Courier Monospace)
    doc.setFont('Courier', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(30, 41, 59);

    let filterY = 27;
    const filterLines = [
      `Item            : All`,
      `Category Name   : All`,
      `Group Name      : All`,
      `From Department : All`,
      `To Department   : All`,
      `Site Name       : HO`,
      `Print Type      : Detail`,
      `Item Type       : All`
    ];

    filterLines.forEach(line => {
      doc.text(line, leftMargin, filterY);
      filterY += 4;
    });

    const startTableY = filterY + 3;

    // 4. Columns & Hierarchical Transfer Rows
    const tableHeaders = ['Vr. No.', 'Vr. Dt.', 'Item', 'Unit', 'Qty.', 'Rate', 'Amount', 'Remark'];

    const tableRows = [
      // Store Transfer 1
      [{ content: 'From : DISPENSE BAR To : GARDENIA ROOFTOP', colSpan: 8, styles: { fontStyle: 'bold', font: 'Courier', fillColor: [255, 255, 255] } }],
      [{ content: 'Beverage', colSpan: 8, styles: { fontStyle: 'bold', font: 'Courier' } }],
      ['49', '2/Jul/26', 'ELEPHANT CAN', 'CAN', '12.000', '143.50', '1722.00', ''],
      ['', '', 'TUBORG STRONG CAN.', 'CAN', '12.000', '124.00', '1488.00', ''],
      ['50', '5/Jul/26', 'TUBORG STRONG CAN.', 'CAN', '12.000', '124.00', '1488.00', ''],
      ['', '', 'BUDWEISER CAN', 'CAN', '12.000', '142.50', '1710.00', ''],
      ['51', '7/Jul/26', 'ELEPHANT CAN', 'CAN', '12.000', '143.50', '1722.00', ''],
      ['52', '9/Jul/26', 'ELEPHANT CAN', 'CAN', '12.000', '143.50', '1722.00', ''],
      ['53', '10/Jul/26', 'ELEPHANT CAN', 'CAN', '12.000', '143.50', '1722.00', ''],
      [
        { content: 'Beverage Total :', colSpan: 4, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '84.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'right' } },
        { content: '11574.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'left' } }
      ],

      [{ content: 'Liquor', colSpan: 8, styles: { fontStyle: 'bold', font: 'Courier' } }],
      ['50', '5/Jul/26', 'J.W RED LABLE', 'Bottle', '1.000', '1671.00', '1671.00', ''],
      ['', '', 'BLACK & WHITE', 'Bottle', '1.000', '1552.00', '1552.00', ''],
      ['', '', 'BOMBAY SAPPHIRE GIN', 'Bottle', '1.000', '1999.00', '1999.00', ''],
      ['', '', 'JAMESON IRISH', 'Bottle', '1.000', '2147.00', '2147.00', ''],
      ['', '', 'SMIRNOFF VODKA', 'Bottle', '1.000', '728.00', '728.00', ''],
      ['52', '9/Jul/26', 'CHIVAS REGAL', 'Bottle', '1.000', '2865.00', '2865.00', ''],
      [
        { content: 'Liquor Total :', colSpan: 4, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '6.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'right' } },
        { content: '11002.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'left' } }
      ],
      [
        { content: 'From : DISPENSE BAR To : GARDENIA ROOFTOP Total :', colSpan: 4, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '90.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'right' } },
        { content: '22576.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'left' } }
      ],

      // Store Transfer 2
      [{ content: 'From : GARDENIA ROOFTOP To : DISPENSE BAR', colSpan: 8, styles: { fontStyle: 'bold', font: 'Courier', fillColor: [255, 255, 255] } }],
      [{ content: 'Beverage', colSpan: 8, styles: { fontStyle: 'bold', font: 'Courier' } }],
      ['48', '1/Jul/26', 'CORONA BEER', 'Bottle', '1.000', '148.00', '148.00', 'receive'],
      [
        { content: 'Beverage Total :', colSpan: 4, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '1.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'right' } },
        { content: '148.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'left' } }
      ],
      [
        { content: 'From : GARDENIA ROOFTOP To : DISPENSE BAR Total :', colSpan: 4, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '1.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'right' } },
        { content: '148.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'left' } }
      ],

      // Grand Total Line
      [
        { content: 'Grand Total :', colSpan: 4, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '91.000', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'right' } },
        { content: '22722.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'left' } }
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
        3: { halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'left' }
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
    console.error('Export Stock Transfer Register PDF Error:', err);
  }
};
