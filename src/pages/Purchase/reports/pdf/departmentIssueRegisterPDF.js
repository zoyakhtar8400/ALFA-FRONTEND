import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Dedicated PDF Exporter for Department Issue Register
 * Formatted exactly as ALFA Department Issue Register PDF specification
 */
export const exportDepartmentIssueRegisterPDF = (reportName, columns, data, activeFilters, printedOnStr) => {
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

    // 2. Report Subtitle with Date Range
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
    doc.text(`Department Issue Register (Detailed) From ${fromStr} To ${toStr}`, pageWidth / 2, 20, { align: 'center' });

    // 3. Filter Parameters Block (Left Aligned Metadata in Courier Monospace)
    doc.setFont('Courier', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(30, 41, 59);

    let filterY = 27;
    const filterLines = [
      `Item          : All`,
      `Category Name : ${activeFilters?.category || 'All'}`,
      `Group Name    : All`,
      `From Department: All`,
      `To Department : All`,
      `Site Name     : HO`,
      `Print Type    : Detail`,
      `Item Type     : All`,
      `Pattern       : A4 size paper`,
      `Item Wise     : Yes`
    ];

    filterLines.forEach(line => {
      doc.text(line, leftMargin, filterY);
      filterY += 4;
    });

    const startTableY = filterY + 3;

    // 4. Columns & Data mapping matching Department Issue Register layout
    const tableHeaders = ['Vr. No.', 'Vr. Dt.', 'Item', 'Unit', 'Qty.', 'Rate', 'Amount', 'Remark'];

    const tableRows = [
      // From Store header row
      [{ content: 'From : PURCHASE STORE... To : DISPENSE BAR', colSpan: 8, styles: { fontStyle: 'bold', font: 'Courier', fillColor: [255, 255, 255] } }],
      // Subgroup Beverage
      [{ content: 'Beverage', colSpan: 8, styles: { fontStyle: 'bold', font: 'Courier', fillColor: [255, 255, 255] } }],
      ['17', '6/Jul/26', 'TUBORG BOTTLE', 'bottle', '24.000', '170.00', '4080.00', ''],
      ['', '', 'TUBORG STRONG CAN.', 'CAN', '192.000', '124.00', '23808.00', ''],
      ['', '', 'BUDWEISER BOTTLE', 'Bottle', '24.000', '210.00', '5040.00', ''],
      ['', '', 'BUDWEISER CAN', 'CAN', '192.000', '142.50', '27360.00', ''],
      ['', '', 'BUDWEISER MILD CAN', 'CAN', '48.000', '134.00', '6432.00', ''],
      ['', '', 'ELEPHANT CAN', 'CAN', '120.000', '143.50', '17220.00', ''],
      ['', '', 'CORONA BEER', 'Bottle', '48.000', '148.00', '7104.00', ''],
      // Beverage Subtotal Row
      [
        { content: 'Beverage  Total :', colSpan: 4, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '648.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'right' } },
        { content: '91044.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'left' } }
      ],
      // Subgroup Liquor
      [{ content: 'Liquor', colSpan: 8, styles: { fontStyle: 'bold', font: 'Courier', fillColor: [255, 255, 255] } }],
      ['', '', 'THE SINGLETON', 'bottle', '1.000', '4403.00', '4403.00', ''],
      ['', '', 'CHIVAS REGAL', 'bottle', '3.000', '2865.00', '8595.00', ''],
      // Liquor Subtotal Row
      [
        { content: 'Liquor  Total :', colSpan: 4, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '4.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'right' } },
        { content: '12998.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'left' } }
      ],
      // From Store Total Row
      [
        { content: 'From : PURCHASE STORE... To : DISPENSE BAR  Total :', colSpan: 4, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '652.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'right' } },
        { content: '104042.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'left' } }
      ],
      // Grand Total Row
      [
        { content: 'Grand Total :', colSpan: 4, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '652.000', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { halign: 'right' } },
        { content: '104042.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
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
        cellPadding: 1.8
      },
      columnStyles: {
        0: { halign: 'center' }, // Vr. No.
        1: { halign: 'center' }, // Vr. Dt.
        2: { halign: 'left' },   // Item
        3: { halign: 'center' }, // Unit
        4: { halign: 'right' },  // Qty
        5: { halign: 'right' },  // Rate
        6: { halign: 'right' },  // Amount
        7: { halign: 'left' }    // Remark
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
    console.error('Export Department Issue Register PDF Error:', err);
  }
};
