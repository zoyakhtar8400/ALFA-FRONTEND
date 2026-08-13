import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { addRupeeFont } from './addRupeeFont';

const cleanPdfText = (val) => String(val ?? '').replace(/Rs\.\s*/gi, '₹ ').replace(/¹/g, '₹');

export const exportTablewiseSalePDF = (columns, data, filters = {}, printedOn = '') => {
  // 1. Initialize Document in A4 Portrait
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  addRupeeFont(doc);

  const pageWidth = 210;
  const pageHeight = 297;
  const leftMargin = 15;
  const rightMargin = 15;

  const dateRangeStr = `Tablewise Itemwise Sale From ${filters.dateFrom || 'Start'} To ${filters.dateTo || 'End'}`;
  const outletStr = `${filters.outlet || 'All'}`;

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
  doc.text('Item        : All', leftMargin, 27.5);

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
    // Outlet Header
    tableRows.push([
      {
        content: outlet.toUpperCase(),
        colSpan: 7,
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
      const qtyNum = parseFloat(item.rawQty || 1);
      const qtyText = (qtyNum === 2 || qtyNum === 1 || qtyNum === 3) && (item.c6 || '').includes('BOTTLE') || (item.c6 || '').includes('MAX') 
        ? qtyNum.toFixed(3) 
        : String(qtyNum);

      tableRows.push([
        { content: cleanPdfText(item.c1), styles: { halign: 'center' } }, // S.No.
        { content: cleanPdfText(item.c2), styles: { halign: 'center' } }, // Tbl No./Rm No.
        { content: cleanPdfText(item.c3), styles: { halign: 'center' } }, // Bill No.
        { content: cleanPdfText(item.c4), styles: { halign: 'center' } }, // Time
        { content: cleanPdfText(item.c5), styles: { halign: 'right' } },  // Bill Amt.
        { content: cleanPdfText(item.c6), styles: { halign: 'center' } },  // Name
        { content: cleanPdfText(qtyText), styles: { halign: 'center' } }   // Qty.
      ]);
    });
  });

  // 4. Draw Plain Table
  autoTable(doc, {
    startY: startY,
    head: [['S.No.', 'Tbl No./Rm No.', 'Bill No.', 'Time', 'Bill Amt.', 'Name', 'Qty.']],
    body: tableRows,
    theme: 'plain',
    styles: { font: 'ArialRupee' },
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
      0: { cellWidth: 15 },  // S.No.
      1: { cellWidth: 25 },  // Tbl No./Rm No.
      2: { cellWidth: 20 },  // Bill No.
      3: { cellWidth: 20 },  // Time
      4: { cellWidth: 25 },  // Bill Amt.
      5: { cellWidth: 60 },  // Name
      6: { cellWidth: 15 }   // Qty.
    },
    margin: { left: leftMargin, right: rightMargin, top: 15, bottom: 15 },
    pageBreak: 'auto'
  });

  // 5. Running footers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setFont('ArialRupee', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);

    // running header page 2+
    if (i > 1) {
      doc.setFont('ArialRupee', 'bold');
      doc.text('ALFA HOTEL MANAGEMENT SYSTEM   |   Tablewise Itemwise Sale Report', leftMargin, 10);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.line(leftMargin, 12, pageWidth - rightMargin, 12);
    }

    // running footer page indicator
    doc.setFont('ArialRupee', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - rightMargin, pageHeight - 8, { align: 'right' });
  }

  // Open in new tab
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank');
};
