import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const formatIndianCurrency = (num) => {
  const parsed = parseFloat(num);
  if (isNaN(parsed) || parsed === 0) return '';
  return parsed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const exportPendingKOTPDF = (columns, data, filters = {}, printedOn = '') => {
  // 1. Initialize Document in A4 Landscape
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const leftMargin = 10;
  const rightMargin = 10;

  const dateRangeStr = `Pending KOT Report As on Date ${filters.dateTo || 'Today'}`;
  const outletStr = `${filters.outlet || 'All'}`;

  // 2. Report Header (Plain text matching screenshot)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(0, 0, 0);
  doc.text('ALFA HOTEL MANAGEMENT SYSTEM', pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(8.5);
  doc.text(dateRangeStr, pageWidth / 2, 18.5, { align: 'center' });

  // Metadata block (Plain text left-aligned)
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Outlet      : ${outletStr}`, leftMargin, 23.5);

  const startY = 26;

  // 3. Build Table Rows Grouped by Outlet
  const tableRows = [];
  const grouped = {};

  data.forEach(row => {
    const outlet = row.outlet || 'JAZZ BAR';
    if (!grouped[outlet]) grouped[outlet] = [];
    grouped[outlet].push(row);
  });

  const outletsList = Object.keys(grouped).sort();
  let grandTotalAmount = 0;

  outletsList.forEach(outlet => {
    // Outlet Header Row
    tableRows.push([
      {
        content: outlet.toUpperCase(),
        colSpan: 10,
        styles: {
          fontStyle: 'bold',
          textColor: [0, 0, 0],
          fontSize: 7.5,
          halign: 'left',
          cellPadding: { top: 1.5, bottom: 1.5, left: 0 }
        }
      }
    ]);

    const items = grouped[outlet];
    let outletTotalAmount = 0;

    items.forEach((item) => {
      tableRows.push([
        { content: item.c1, styles: { halign: 'center' } }, // Date
        { content: item.c2, styles: { halign: 'center' } }, // KOT No
        { content: item.c3, styles: { halign: 'center' } }, // Time
        { content: item.c4, styles: { halign: 'left' } },   // Steward
        { content: item.c5, styles: { halign: 'center' } }, // Table No
        { content: item.c6, styles: { halign: 'left' } },   // Item
        { content: item.c7, styles: { halign: 'center' } }, // Qty
        { content: item.c8, styles: { halign: 'right' } },  // Rate
        { content: item.c9, styles: { halign: 'right' } },  // Amount
        { content: item.c10, styles: { halign: 'left' } }   // User
      ]);

      outletTotalAmount += item.rawAmount || 0;
      grandTotalAmount += item.rawAmount || 0;
    });

    // Outlet Total Row (dashed bottom line style)
    tableRows.push([
      { 
        content: `${outlet} Total :`, 
        colSpan: 8,
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: formatIndianCurrency(outletTotalAmount), 
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: '',
        styles: { 
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      }
    ]);
  });

  // Grand Total Row
  tableRows.push([
    { 
      content: 'Grand Total :', 
      colSpan: 8,
      styles: { 
        fontStyle: 'bold', 
        halign: 'right', 
        textColor: [0, 0, 0],
        lineWidth: { top: 0.25, bottom: 0.25, left: 0, right: 0 },
        lineColor: [0, 0, 0]
      } 
    },
    { 
      content: formatIndianCurrency(grandTotalAmount), 
      styles: { 
        fontStyle: 'bold', 
        halign: 'right', 
        textColor: [0, 0, 0],
        lineWidth: { top: 0.25, bottom: 0.25, left: 0, right: 0 },
        lineColor: [0, 0, 0]
      } 
    },
    { 
      content: '', 
      styles: { 
        lineWidth: { top: 0.25, bottom: 0.25, left: 0, right: 0 },
        lineColor: [0, 0, 0]
      } 
    }
  ]);

  // 4. Draw Plain Table
  autoTable(doc, {
    startY: startY,
    head: [['Date', 'KOT No.', 'Time', 'Steward', 'Table No.', 'Item', 'Qty.', 'Rate', 'Amount', 'User']],
    body: tableRows,
    theme: 'plain',
    headStyles: {
      textColor: [0, 0, 0],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: { top: 1.5, bottom: 1.5 },
      lineWidth: { top: 0.25, bottom: 0.25, left: 0, right: 0 },
      lineColor: [0, 0, 0]
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [0, 0, 0],
      valign: 'middle',
      cellPadding: 1.0
    },
    columnStyles: {
      0: { cellWidth: 22 },  // Date
      1: { cellWidth: 18 },  // KOT No
      2: { cellWidth: 18 },  // Time
      3: { cellWidth: 28 },  // Steward
      4: { cellWidth: 18 },  // Table No
      5: { cellWidth: 75 },  // Item
      6: { cellWidth: 16 },  // Qty
      7: { cellWidth: 22 },  // Rate
      8: { cellWidth: 24 },  // Amount
      9: { cellWidth: 38 }   // User
    },
    margin: { left: leftMargin, right: rightMargin, top: 15, bottom: 15 },
    pageBreak: 'auto'
  });

  // 5. Running footers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);

    // running header page 2+
    if (i > 1) {
      doc.setFont('Helvetica', 'bold');
      doc.text('ALFA HOTEL MANAGEMENT SYSTEM   |   Pending KOT Report', leftMargin, 10);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.line(leftMargin, 12, pageWidth - rightMargin, 12);
    }

    // running footer page indicator
    doc.setFont('Helvetica', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - rightMargin, pageHeight - 8, { align: 'right' });
  }

  // Open in new tab
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank');
};
