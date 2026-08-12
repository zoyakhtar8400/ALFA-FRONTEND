import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const formatIndianCurrency = (num) => {
  const parsed = parseFloat(num);
  if (isNaN(parsed)) return '0.00';
  return parsed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const exportSalesRegisterPDF = (columns, data, filters = {}, printedOn = '') => {
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
  const printableWidth = pageWidth - leftMargin - rightMargin; // 277mm

  const dateFromText = filters.dateFrom || 'Start';
  const dateToText = filters.dateTo || 'End';
  const dateRangeStr = `Sales Register From ${dateFromText} To ${dateToText}`;
  const outletStr = `${filters.outlet || 'All Outlets'}`;

  // 2. Report Header (Plain text matching screenshot style)
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
  doc.text('Main Grp    : All', leftMargin, 27.5);

  const startY = 30;

  // 3. Build Table Rows with Totals
  const tableRows = [];
  let totalGross = 0;
  let totalDiscount = 0;
  let totalTax = 0;
  let totalNet = 0;

  data.forEach((item, idx) => {
    tableRows.push([
      { content: String(idx + 1), styles: { halign: 'center' } }, // Sr No
      { content: item.c2, styles: { halign: 'center' } },        // Date
      { content: item.c3, styles: { halign: 'center' } },        // Time
      { content: item.c4, styles: { halign: 'center' } },        // Bill No
      { content: item.c5, styles: { halign: 'center' } },        // Table
      { content: item.c6, styles: { halign: 'left' } },          // Customer
      { content: item.c7, styles: { halign: 'center' } },        // Payment Mode
      { content: formatIndianCurrency(item.rawGross), styles: { halign: 'right' } }, // Gross Amount
      { content: formatIndianCurrency(item.rawDiscount), styles: { halign: 'right' } }, // Discount
      { content: formatIndianCurrency(item.rawTax), styles: { halign: 'right' } }, // Tax
      { content: formatIndianCurrency(item.rawNet), styles: { halign: 'right' } }  // Net Amount
    ]);

    totalGross += item.rawGross || 0;
    totalDiscount += item.rawDiscount || 0;
    totalTax += item.rawTax || 0;
    totalNet += item.rawNet || 0;
  });

  // Table Total Row (with horizontal border lines)
  tableRows.push([
    { 
      content: 'Total :', 
      colSpan: 7,
      styles: { 
        fontStyle: 'bold', 
        halign: 'right', 
        textColor: [0, 0, 0],
        lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
        lineColor: [0, 0, 0]
      } 
    },
    { 
      content: formatIndianCurrency(totalGross), 
      styles: { 
        fontStyle: 'bold', 
        halign: 'right', 
        textColor: [0, 0, 0],
        lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
        lineColor: [0, 0, 0]
      } 
    },
    { 
      content: formatIndianCurrency(totalDiscount), 
      styles: { 
        fontStyle: 'bold', 
        halign: 'right', 
        textColor: [0, 0, 0],
        lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
        lineColor: [0, 0, 0]
      } 
    },
    { 
      content: formatIndianCurrency(totalTax), 
      styles: { 
        fontStyle: 'bold', 
        halign: 'right', 
        textColor: [0, 0, 0],
        lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
        lineColor: [0, 0, 0]
      } 
    },
    { 
      content: formatIndianCurrency(totalNet), 
      styles: { 
        fontStyle: 'bold', 
        halign: 'right', 
        textColor: [0, 0, 0],
        lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
        lineColor: [0, 0, 0]
      } 
    }
  ]);

  // 4. Draw Plain Table
  autoTable(doc, {
    startY: startY,
    head: [['Sr No', 'Date', 'Time', 'Bill No', 'Table', 'Customer', 'Payment Mode', 'Gross Amount', 'Discount', 'Tax', 'Net Amount']],
    body: tableRows,
    theme: 'plain',
    headStyles: {
      textColor: [0, 0, 0],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: { top: 1.5, bottom: 1.5 },
      lineWidth: { top: 0.25, bottom: 0.25, left: 0, right: 0 },
      lineColor: [0, 0, 0]
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [0, 0, 0],
      valign: 'middle',
      cellPadding: 1.2
    },
    columnStyles: {
      0: { cellWidth: 12 },  // Sr No
      1: { cellWidth: 22 },  // Date
      2: { cellWidth: 18 },  // Time
      3: { cellWidth: 20 },  // Bill No
      4: { cellWidth: 18 },  // Table
      5: { cellWidth: 45 },  // Customer
      6: { cellWidth: 32 },  // Payment Mode
      7: { cellWidth: 28 },  // Gross Amount
      8: { cellWidth: 25 },  // Discount
      9: { cellWidth: 25 },  // Tax
      10: { cellWidth: 32 }  // Net Amount
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
      doc.text('ALFA HOTEL MANAGEMENT SYSTEM   |   Sales Register Report', leftMargin, 10);
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
