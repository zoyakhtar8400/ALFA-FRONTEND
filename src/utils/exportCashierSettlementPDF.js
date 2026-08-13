import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { addRupeeFont } from './addRupeeFont';

const formatIndianCurrency = (num) => {
  const parsed = parseFloat(num);
  if (isNaN(parsed) || parsed === 0) return '';
  return '₹ ' + parsed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const cleanPdfText = (val) => String(val ?? '').replace(/Rs\.\s*/gi, '₹ ').replace(/¹/g, '₹');

export const exportCashierSettlementPDF = (columns, data, filters = {}, printedOn = '') => {
  // 1. Initialize Document in A4 Portrait
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  addRupeeFont(doc);

  const pageWidth = 210;
  const pageHeight = 297;
  const leftMargin = 10;
  const rightMargin = 10;

  const dateRangeStr = `Cashier Settlement Report(Detailed) From ${filters.dateFrom || 'Start'} To ${filters.dateTo || 'End'}`;
  const outletStr = `${filters.outlet || 'All'}`;
  const userStr = `${filters.user || 'All'}`;

  // 2. Report Header (Plain text matching screenshot)
  doc.setFont('ArialRupee', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(0, 0, 0);
  doc.text('ALFA HOTEL MANAGEMENT SYSTEM', pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(8.5);
  doc.text(dateRangeStr, pageWidth / 2, 18.5, { align: 'center' });

  // Metadata block (Plain text left-aligned)
  doc.setFont('ArialRupee', 'normal');
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

  outletsList.forEach(outlet => {
    // Outlet Header Row
    tableRows.push([
      {
        content: `Outlet :    ${outlet.toUpperCase()}`,
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
    items.forEach((item) => {
      tableRows.push([
        { content: cleanPdfText(item.c1), styles: { halign: 'center' } }, // S.No
        { content: cleanPdfText(item.c2), styles: { halign: 'center' } }, // Bill Date
        { content: cleanPdfText(item.c3), styles: { halign: 'center' } }, // Bill No
        { content: cleanPdfText(item.c4), styles: { halign: 'right' } },  // Bill Amount
        { content: cleanPdfText(item.c5), styles: { halign: 'center' } }, // Date
        { content: cleanPdfText(item.c6), styles: { halign: 'left' } },   // Pay Type
        { content: cleanPdfText(item.c7), styles: { halign: 'center' } }, // GRCNo
        { content: cleanPdfText(item.c8), styles: { halign: 'center' } },  // Party Name
        { content: cleanPdfText(item.c9), styles: { halign: 'right' } },  // Paid Amount
        { content: cleanPdfText(item.c10), styles: { halign: 'center' } } // user Name
      ]);
    });
  });

  // 4. Draw Plain Table
  autoTable(doc, {
    startY: startY,
    head: [['S.No.', 'Bill Date', 'Bill No.', 'Bill Amount', 'Date', 'Pay Type', 'GRCNo', 'Party Name', 'Paid Amount', 'user Name']],
    body: tableRows,
    theme: 'plain',
    styles: { font: 'ArialRupee' },
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
      0: { cellWidth: 10 },  // S.No
      1: { cellWidth: 20 },  // Bill Date
      2: { cellWidth: 15 },  // Bill No
      3: { cellWidth: 20 },  // Bill Amount
      4: { cellWidth: 18 },  // Date
      5: { cellWidth: 25 },  // Pay Type
      6: { cellWidth: 15 },  // GRCNo
      7: { cellWidth: 25 },  // Party Name
      8: { cellWidth: 22 },  // Paid Amount
      9: { cellWidth: 20 }   // user Name
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
      doc.text('ALFA HOTEL MANAGEMENT SYSTEM   |   Cashier Settlement Report', leftMargin, 10);
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
