import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Dedicated PDF Exporter for Purchase Register Tax Summary (Summary Tax Detail)
 * Formatted exactly as ALFA Purchase Register Tax Summary PDF specification (A4 Landscape with GSTIN sublines)
 */
export const exportPurchaseRegisterTaxSummaryPDF = (reportName, columns, data, activeFilters, printedOnStr) => {
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

    // 4. Columns & Sample Tax Summary Rows with GSTIN
    const tableHeaders = ['Inv No.', 'Inv Date', 'V.Type', 'Party Bill No.', 'Party Date', 'Party', 'Gross Amt.', 'Disc.', 'R/O', 'Net Amt.'];

    const tableRows = [
      ['1', '07/Apr/2026', 'PBDCR', '93', '07/Apr/2026', 'RADHIKA ENTERPRISES\n06JWPK1506C1ZL', '6800.00', '', '', '6800.00'],
      ['2', '07/Apr/2026', 'PBDCR', '56', '07/Apr/2026', 'A P SUPPLY\n09OWTPS0715M1Z0', '6615.00', '', '', '6615.00'],
      ['3', '10/Apr/2026', 'PBDCR', 'B-127 F129', '10/Apr/2026', 'ANITAJAISWAL', '92064.00', '', '', '92064.00'],
      ['4', '10/Apr/2026', 'PBDCR', '013', '10/Apr/2026', 'ENGINEERING SOLUTION\n09BNSPK3062P1ZX', '8926.20', '', '-0.20', '8926.00'],
      ['5', '18/Apr/2026', 'PBDCR', 'F-242,B235', '18/Apr/2026', 'ANITAJAISWAL', '95628.00', '', '', '95628.00'],
      ['1', '23/Apr/2026', 'PBDNT', '48', '23/Apr/2026', 'SHAILENDRA STORE\n06ABBPJ8787F1ZD', '3953.60', '', '0.40', '3954.00'],
      ['6', '28/Apr/2026', 'PBDCR', 'B339,F360', '28/Apr/2026', 'ANITAJAISWAL', '125634.00', '', '', '125634.00'],
      ['7', '05/May/2026', 'PBDCR', 'B-961 F985', '05/May/2026', 'SUNIL KUMAR JAISWAL', '107334.00', '', '', '107334.00'],
      ['8', '14/May/2026', 'PBDCR', 'B-1216,F1272', '14/May/2026', 'SUNIL KUMAR JAISWAL', '78744.00', '', '', '78744.00'],
      ['9', '23/May/2026', 'PBDCR', 'B-874', '23/May/2026', 'REENA KEDIA', '62320.00', '', '', '62320.00'],
      ['10', '23/May/2026', 'PBDCR', '384', '23/May/2026', 'A P SUPPLY\n09OWTPS0715M1Z0', '6615.00', '', '', '6615.00'],
      ['11', '28/May/2026', 'PBDCR', 'B325', '28/May/2026', 'Suryansh Jaiswal', '87780.00', '', '', '87780.00'],
      ['12', '28/May/2026', 'PBDCR', 'F1722,23', '28/May/2026', 'SUNIL KUMAR JAISWAL', '67486.00', '', '', '67486.00']
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
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'left' },
        6: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'right' },
        9: { halign: 'right' }
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
    console.error('Export Purchase Register Tax Summary PDF Error:', err);
  }
};
