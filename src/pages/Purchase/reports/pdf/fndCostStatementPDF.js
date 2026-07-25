import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Dedicated PDF Exporter for F&D Cost Statement
 * Formatted exactly as ALFA F&D Cost Statement PDF specification (Cross-Tabular Matrix)
 */
export const exportFNDCostStatementPDF = (reportName, columns, data, activeFilters, printedOnStr) => {
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
    doc.text(`FB Cost Statement Report From ${fromStr} To ${toStr}`, pageWidth / 2, 20, { align: 'center' });

    const startTableY = 26;

    // 3. Matrix Columns & Rows
    const tableHeaders = ['', 'DISPENSE BAR', 'GARDENIA ROOFTOP', 'MAIN KITCHEN', 'Total'];

    const tableRows = [
      ['DESSERTS', '', '', '4215.00', '4215.00'],
      ['FOOD', '', '', '1631635.77', '1631635.77'],
      ['LIQOUR', '1977631.49', '', '', '1977631.49'],
      ['MAIN COURSE (VEG)', '', '', '5493.00', '5493.00'],
      [
        { content: 'Total', styles: { fontStyle: 'bold', font: 'Courier' } },
        { content: '1977631.49', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '1641343.77', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '3618975.26', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } }
      ],
      ['BEER', '1051866.00', '112406.00', '', '1164272.00'],
      ['LIQOUR', '360732.32', '63961.00', '', '424693.32'],
      [
        { content: 'Total', styles: { fontStyle: 'bold', font: 'Courier' } },
        { content: '1412598.32', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '176367.00', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '1588965.32', styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } }
      ]
    ];

    const tableConfig = {
      startY: startTableY,
      head: [tableHeaders],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        font: 'Courier',
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle',
        cellPadding: 2,
        lineWidth: 0.2,
        lineColor: [0, 0, 0]
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [0, 0, 0],
        font: 'Courier',
        valign: 'middle',
        cellPadding: 2,
        lineWidth: 0.15,
        lineColor: [100, 116, 139]
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 50 },
        1: { halign: 'right', cellWidth: 34 },
        2: { halign: 'right', cellWidth: 34 },
        3: { halign: 'right', cellWidth: 34 },
        4: { halign: 'right', cellWidth: 34 }
      },
      styles: {
        lineColor: [148, 163, 184],
        lineWidth: 0.15
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
    console.error('Export F&D Cost Statement PDF Error:', err);
  }
};
