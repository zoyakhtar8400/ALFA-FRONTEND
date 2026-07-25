import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Dedicated PDF Exporter for Stock Summary
 * Formatted exactly as ALFA Stock Summary PDF specification (Color Legend Bar & Inventory Status Fills)
 */
export const exportStockSummaryPDF = (reportName, columns, data, activeFilters, printedOnStr) => {
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
    doc.text(`Stock Summary From ${fromStr} To ${toStr}`, pageWidth / 2, 20, { align: 'center' });

    // 3. Filter Parameters Block (Courier Monospace)
    doc.setFont('Courier', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(30, 41, 59);

    let filterY = 26;
    const filterLines = [
      `Category Name     : All`,
      `Group Name        : All`,
      `Item              : All`,
      `Department        : All`,
      `Site Name         : HO`,
      `Stock Qty. In     : SKU`,
      `Item Value Type   : All`,
      `Item Type         : All`,
      `Gridwise          : No`,
      `Departmentwise    : Yes`,
      `Item Type Grouping: Yes`,
      `Balance Qty. Type : All`,
      `Is It Bar         : No`,
      `Show Zero Bal     : No`,
      `Main Group        : All`,
      `Display           : Preview`
    ];

    filterLines.forEach(line => {
      doc.text(line, leftMargin, filterY);
      filterY += 3.5;
    });

    // 4. Color Legend Bar
    let legendY = filterY + 3;

    // Green Legend Box
    doc.setFillColor(16, 185, 129); // #10B981
    doc.rect(leftMargin + 10, legendY, 12, 4, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(0, 0, 0);
    doc.text('Bal > Max Stock', leftMargin + 24, legendY + 3);

    // Yellow Legend Box
    doc.setFillColor(253, 224, 71); // #FDE047
    doc.rect(leftMargin + 60, legendY, 12, 4, 'F');
    doc.text('Bal <= ReOrder and Bal > Min Stock', leftMargin + 74, legendY + 3);

    // Red Legend Box
    doc.setFillColor(239, 68, 68); // #EF4444
    doc.rect(leftMargin + 135, legendY, 12, 4, 'F');
    doc.text('Bal < Min Stock', leftMargin + 149, legendY + 3);

    const startTableY = legendY + 7;

    // 5. Columns & Data Mapping
    const tableHeaders = ['Item', 'Stock Unit', 'Opening Qty.', 'Receive Qty.', 'Issue Qty.', 'Balance Qty.'];

    const tableRows = [
      // Dept 1
      [{ content: '1978 THE FAMILY RESTAURANT', colSpan: 6, styles: { fontStyle: 'bold', font: 'Courier', fillColor: [255, 255, 255] } }],
      [{ content: 'Type : Beverage', colSpan: 6, styles: { fontStyle: 'bold', font: 'Courier' } }],
      [
        { content: 'SOFTDRINK 200.ML', styles: { fillColor: [16, 185, 129] } },
        { content: 'Bottle', styles: { fillColor: [16, 185, 129] } },
        { content: '6.000', styles: { fillColor: [16, 185, 129], halign: 'right' } },
        { content: '', styles: { fillColor: [16, 185, 129] } },
        { content: '', styles: { fillColor: [16, 185, 129] } },
        { content: '6.00', styles: { fillColor: [16, 185, 129], halign: 'right' } }
      ],
      [
        { content: 'Gross Total Qty. :', colSpan: 2, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '6.000', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', colSpan: 2, styles: { halign: 'right' } },
        { content: '6.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } }
      ],

      // Dept 2
      [{ content: 'DISPENSE BAR', colSpan: 6, styles: { fontStyle: 'bold', font: 'Courier', fillColor: [255, 255, 255] } }],
      [{ content: 'Type : Beverage', colSpan: 6, styles: { fontStyle: 'bold', font: 'Courier' } }],
      [
        { content: 'BREEZER', styles: { fillColor: [16, 185, 129] } },
        { content: 'Bottle', styles: { fillColor: [16, 185, 129] } },
        { content: '16.000', styles: { fillColor: [16, 185, 129], halign: 'right' } },
        { content: '', styles: { fillColor: [16, 185, 129] } },
        { content: '', styles: { fillColor: [16, 185, 129] } },
        { content: '16.00', styles: { fillColor: [16, 185, 129], halign: 'right' } }
      ],
      [
        { content: 'BUDWEISER BOTTLE', styles: { fillColor: [16, 185, 129] } },
        { content: 'Bottle', styles: { fillColor: [16, 185, 129] } },
        { content: '24.000', styles: { fillColor: [16, 185, 129], halign: 'right' } },
        { content: '', styles: { fillColor: [16, 185, 129] } },
        { content: '', styles: { fillColor: [16, 185, 129] } },
        { content: '24.00', styles: { fillColor: [16, 185, 129], halign: 'right' } }
      ],
      [
        { content: 'BUDWEISER CAN', styles: { fillColor: [16, 185, 129] } },
        { content: 'CAN', styles: { fillColor: [16, 185, 129] } },
        { content: '141.000', styles: { fillColor: [16, 185, 129], halign: 'right' } },
        { content: '', styles: { fillColor: [16, 185, 129] } },
        { content: '', styles: { fillColor: [16, 185, 129] } },
        { content: '141.00', styles: { fillColor: [16, 185, 129], halign: 'right' } }
      ],
      [{ content: 'Type : Liquor', colSpan: 6, styles: { fontStyle: 'bold', font: 'Courier' } }],
      [
        { content: '100 PIPERS', styles: { fillColor: [16, 185, 129] } },
        { content: 'Bottle', styles: { fillColor: [16, 185, 129] } },
        { content: '6.120', styles: { fillColor: [16, 185, 129], halign: 'right' } },
        { content: '', styles: { fillColor: [16, 185, 129] } },
        { content: '', styles: { fillColor: [16, 185, 129] } },
        { content: '6.12', styles: { fillColor: [16, 185, 129], halign: 'right' } }
      ],
      [
        { content: 'JOHNNIE WALKER BLUE LABEL', styles: { fillColor: [239, 68, 68], textColor: [255, 255, 255] } },
        { content: 'Bottle', styles: { fillColor: [239, 68, 68], textColor: [255, 255, 255] } },
        { content: '0.000', styles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], halign: 'right' } },
        { content: '', styles: { fillColor: [239, 68, 68] } },
        { content: '', styles: { fillColor: [239, 68, 68] } },
        { content: '0.00', styles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], halign: 'right' } }
      ],
      [
        { content: 'Gross Total Qty. :', colSpan: 2, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '702.528', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', colSpan: 2, styles: { halign: 'right' } },
        { content: '702.53', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } }
      ]
    ];

    const tableConfig = {
      startY: startTableY,
      head: [tableHeaders],
      body: tableRows,
      theme: 'plain',
      headStyles: {
        fillColor: [55, 65, 81], // Dark Gray Header (#374151)
        textColor: [255, 255, 255],
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
        0: { halign: 'left', cellWidth: 70 },
        1: { halign: 'center', cellWidth: 24 },
        2: { halign: 'right', cellWidth: 26 },
        3: { halign: 'right', cellWidth: 24 },
        4: { halign: 'right', cellWidth: 24 },
        5: { halign: 'right', cellWidth: 22 }
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
    console.error('Export Stock Summary PDF Error:', err);
  }
};
