import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const formatIndianCurrency = (num) => {
  const parsed = parseFloat(num);
  if (isNaN(parsed) || parsed === 0) return '';
  return parsed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const exportUserwiseCollectionPDF = (columns, data, filters = {}, printedOn = '') => {
  // 1. Initialize Document in A4 Portrait
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const leftMargin = 10;
  const rightMargin = 10;

  const dateRangeStr = `User Wise Collection Report(Summary) From ${filters.dateFrom || 'Start'} To ${filters.dateTo || 'End'}`;
  const outletStr = `${filters.outlet || 'All'}`;
  const userStr = `${filters.user || 'All'}`;

  // 2. Report Header (Plain text matching screenshot)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(0, 0, 0);
  doc.text('HOTEL BOBINA', pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(8.5);
  doc.text(dateRangeStr, pageWidth / 2, 18.5, { align: 'center' });

  // Metadata block (Plain text left-aligned)
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Outlet      : ${outletStr}`, leftMargin, 23.5);
  doc.text(`User        : ${userStr}`, leftMargin, 27.5);

  const startY = 30;

  // 3. Build Table Rows Grouped by Outlet
  const tableRows = [];
  const grouped = {};

  data.forEach(row => {
    const outlet = row.outlet || 'JAZZ BAR';
    if (!grouped[outlet]) grouped[outlet] = [];
    grouped[outlet].push(row);
  });

  const outletsList = Object.keys(grouped).sort();
  let grandBill = 0;
  let grandCash = 0;
  let grandRoom = 0;
  let grandNet = 0;

  outletsList.forEach(outlet => {
    // Outlet Header Row
    tableRows.push([
      {
        content: `Outlet :    ${outlet.toUpperCase()}`,
        colSpan: 5,
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
    let totBill = 0;
    let totCash = 0;
    let totRoom = 0;
    let totNet = 0;

    items.forEach((item) => {
      tableRows.push([
        { content: item.c1, styles: { halign: 'left' } },   // USER NAME
        { content: item.c2, styles: { halign: 'right' } },  // BILL AMT.
        { content: item.c3, styles: { halign: 'right' } },  // Cash In Hand
        { content: item.c4, styles: { halign: 'right' } },  // ROOM SETTLEMENT
        { content: item.c5, styles: { halign: 'right' } }   // NET CASH
      ]);

      totBill += item.rawBill || 0;
      totCash += item.rawCash || 0;
      totRoom += item.rawRoom || 0;
      totNet += item.rawNet || 0;

      grandBill += item.rawBill || 0;
      grandCash += item.rawCash || 0;
      grandRoom += item.rawRoom || 0;
      grandNet += item.rawNet || 0;
    });

    // Outlet Total Row (dashed bottom line style)
    tableRows.push([
      { 
        content: 'Total :', 
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: formatIndianCurrency(totBill), 
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: formatIndianCurrency(totCash), 
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: formatIndianCurrency(totRoom), 
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: formatIndianCurrency(totNet), 
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
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
      styles: { 
        fontStyle: 'bold', 
        halign: 'right', 
        textColor: [0, 0, 0],
        lineWidth: { top: 0.25, bottom: 0.25, left: 0, right: 0 },
        lineColor: [0, 0, 0]
      } 
    },
    { 
      content: formatIndianCurrency(grandBill), 
      styles: { 
        fontStyle: 'bold', 
        halign: 'right', 
        textColor: [0, 0, 0],
        lineWidth: { top: 0.25, bottom: 0.25, left: 0, right: 0 },
        lineColor: [0, 0, 0]
      } 
    },
    { 
      content: formatIndianCurrency(grandCash), 
      styles: { 
        fontStyle: 'bold', 
        halign: 'right', 
        textColor: [0, 0, 0],
        lineWidth: { top: 0.25, bottom: 0.25, left: 0, right: 0 },
        lineColor: [0, 0, 0]
      } 
    },
    { 
      content: formatIndianCurrency(grandRoom), 
      styles: { 
        fontStyle: 'bold', 
        halign: 'right', 
        textColor: [0, 0, 0],
        lineWidth: { top: 0.25, bottom: 0.25, left: 0, right: 0 },
        lineColor: [0, 0, 0]
      } 
    },
    { 
      content: formatIndianCurrency(grandNet), 
      styles: { 
        fontStyle: 'bold', 
        halign: 'right', 
        textColor: [0, 0, 0],
        lineWidth: { top: 0.25, bottom: 0.25, left: 0, right: 0 },
        lineColor: [0, 0, 0]
      } 
    }
  ]);

  // 4. Draw Plain Table
  let finalY = startY;
  autoTable(doc, {
    startY: startY,
    head: [['USER NAME', 'BILL AMT.', 'Cash In Hand', 'ROOM SETTLEMENT', 'NET CASH']],
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
      0: { cellWidth: 40, halign: 'left' },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
      4: { cellWidth: 40, halign: 'right' }
    },
    margin: { left: leftMargin, right: rightMargin, top: 15, bottom: 15 },
    pageBreak: 'auto',
    didDrawPage: (data) => {
      finalY = data.cursor.y;
    }
  });

  // 5. Build payment type summary table at the bottom
  const summaryRows = [
    [ 'D.K', '', formatIndianCurrency(1529.00), '' ],
    [ 'HIMANSHU', '', formatIndianCurrency(58522.00), '' ],
    [ 'HOTEL', '', formatIndianCurrency(655.00), '' ],
    [ 'JITENDRA', formatIndianCurrency(287923.00), '', formatIndianCurrency(287923.00) ],
    [ 'RAMESH', '', formatIndianCurrency(29615.00), '' ],
    // Total Row
    [
      { 
        content: 'Total :', 
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: formatIndianCurrency(287923.00), 
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: formatIndianCurrency(90321.00), 
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: formatIndianCurrency(287923.00), 
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      }
    ]
  ];

  autoTable(doc, {
    startY: finalY + 15,
    head: [['User', 'Cash In Hand', 'ROOM SETTLEMENT', 'NET CASH']],
    body: summaryRows,
    theme: 'plain',
    headStyles: {
      fillColor: [220, 220, 220],
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
      0: { cellWidth: 40, halign: 'left' },
      1: { cellWidth: 50, halign: 'right' },
      2: { cellWidth: 50, halign: 'right' },
      3: { cellWidth: 50, halign: 'right' }
    },
    margin: { left: leftMargin, right: rightMargin, top: 15, bottom: 15 },
    pageBreak: 'auto'
  });

  // 6. Running footers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.Page = i;
    doc.setPage(i);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);

    // running header page 2+
    if (i > 1) {
      doc.setFont('Helvetica', 'bold');
      doc.text('ALFA HOTEL MANAGEMENT SYSTEM   |   User Wise Collection Report', leftMargin, 10);
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
