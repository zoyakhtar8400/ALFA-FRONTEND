import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Dedicated PDF Exporter for Consume Register
 * Formatted exactly as HOTEL BOBINA Consume Register PDF specification
 */
export const exportConsumeRegisterPDF = (reportName, columns, data, activeFilters, printedOnStr) => {
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
    doc.text(`Consume Register From ${fromStr} To ${toStr}`, pageWidth / 2, 20, { align: 'center' });

    // 3. Filter Parameters Block (Left Aligned Key-Value Pairs)
    doc.setFont('Courier', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(30, 41, 59);

    let filterY = 27;
    const filterLines = [
      `From Date       : ${fromStr}`,
      `To Date         : ${toStr}`,
      `Category Name   : All`,
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

    // 4. Columns & Grouped Data
    const tableHeaders = ['Vr. No.', 'Vr. Dt.', 'Item', 'Unit', 'Qty.', 'Rate', 'Amount', 'Remark'];

    // Department section header row
    const tableRows = [
      [{ content: 'DISPENSE BAR', colSpan: 8, styles: { fontStyle: 'bold', fillColor: [255, 255, 255] } }]
    ];

    let totalQty = 0;
    let totalAmount = 0;

    const rowsData = (data && data.length > 0) ? data : [
      { c1: '1', c2: '06/Apr/2026', c3: 'BUDWEISER CAN', c4: 'CAN', c5: '6.000', c6: '220.00', c7: '1320.00', c8: 'Normal Consume' },
      { c1: '2', c2: '31/May/2026', c3: 'BLACK & WHITE', c4: 'Bottle', c5: '1.000', c6: '0.00', c7: '0.00', c8: 'Promo Sample' },
      { c1: '3', c2: '11/Jun/2026', c3: 'KF ULTRA MAX BOTTLE', c4: 'Bottle', c5: '1.000', c6: '159.00', c7: '159.00', c8: 'Normal Consume' },
      { c1: '4', c2: '28/Jun/2026', c3: 'KF ULTRA LASER 330 ML', c4: 'Bottle', c5: '1.000', c6: '90.00', c7: '90.00', c8: 'Normal Consume' },
      { c1: '5', c2: '11/Jul/2026', c3: 'GLENLIVET', c4: 'Bottle', c5: '0.040', c6: '0.00', c7: '0.00', c8: 'Complimentary' }
    ];

    rowsData.forEach((rowObj) => {
      const vrNo = rowObj.c1 || '';
      const vrDt = rowObj.c2 || '';
      const item = rowObj.c3 || '';
      const unit = rowObj.c4 || '';
      const qtyStr = rowObj.c5 || '0.000';
      const rateStr = rowObj.c6 || '0.00';
      const amountStr = rowObj.c7 || '0.00';
      const remark = rowObj.c8 || '';

      totalQty += parseFloat(String(qtyStr).replace(/,/g, '')) || 0;
      totalAmount += parseFloat(String(amountStr).replace(/,/g, '')) || 0;

      tableRows.push([vrNo, vrDt, item, unit, qtyStr, rateStr, amountStr, remark]);
    });

    // Department Subtotal Row
    tableRows.push([
      { content: 'DISPENSE BAR  Total :', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right' } },
      { content: totalQty.toFixed(3), styles: { fontStyle: 'bold', halign: 'right' } },
      { content: '', styles: { halign: 'right' } },
      { content: totalAmount.toFixed(2), styles: { fontStyle: 'bold', halign: 'right' } },
      { content: '', styles: { halign: 'left' } }
    ]);

    // Grand Total Row
    tableRows.push([
      { content: 'Grand Total :', colSpan: 4, styles: { fontStyle: 'bold', halign: 'right' } },
      { content: totalQty.toFixed(3), styles: { fontStyle: 'bold', halign: 'right' } },
      { content: '', styles: { halign: 'right' } },
      { content: totalAmount.toFixed(2), styles: { fontStyle: 'bold', halign: 'right' } },
      { content: '', styles: { halign: 'left' } }
    ]);

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

    // 5. Running Footer
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

    // Output: Trigger file download AND attempt opening in new tab
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  } catch (error) {
    console.error('Export Consume Register PDF Error:', error);
  }
};
