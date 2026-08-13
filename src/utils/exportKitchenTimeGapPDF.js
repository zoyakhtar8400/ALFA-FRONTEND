import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { addRupeeFont } from './addRupeeFont';

const cleanPdfText = (val) => String(val ?? '').replace(/Rs\.\s*/gi, '₹ ').replace(/¹/g, '₹');

export const exportKitchenTimeGapPDF = (columns, data, filters = {}, printedOn = '') => {
  // 1. Initialize Document in A4 Landscape
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  addRupeeFont(doc);

  const pageWidth = 297;
  const pageHeight = 210;
  const leftMargin = 15;
  const rightMargin = 15;

  const dateRangeStr = `Kitchen Time Gap Report From ${filters.dateFrom || 'Start'} To ${filters.dateTo || 'End'}`;
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

  const startY = 26;

  // 3. Build Table Rows Grouped by Outlet -> Type
  const tableRows = [];
  const grouped = {};

  data.forEach(row => {
    const outlet = row.outlet || 'JAZZ BAR';
    const type = row.type || 'Bill';
    
    if (!grouped[outlet]) grouped[outlet] = {};
    if (!grouped[outlet][type]) grouped[outlet][type] = [];
    
    grouped[outlet][type].push(row);
  });

  const outletsList = Object.keys(grouped).sort();

  outletsList.forEach(outlet => {
    // Outlet Header
    tableRows.push([
      {
        content: `Outlet : ${outlet.toUpperCase()}`,
        colSpan: 12,
        styles: {
          fontStyle: 'bold',
          textColor: [0, 0, 0],
          fontSize: 7.5,
          halign: 'left',
          cellPadding: { top: 1.5, bottom: 1.5, left: 0 }
        }
      }
    ]);

    const typesList = Object.keys(grouped[outlet]).sort();
    typesList.forEach(type => {
      // Type Header
      tableRows.push([
        {
          content: `Type : ${type}`,
          colSpan: 12,
          styles: {
            fontStyle: 'bold',
            textColor: [0, 0, 0],
            fontSize: 7.5,
            halign: 'left',
            cellPadding: { top: 1.5, bottom: 1.5, left: 0 }
          }
        }
      ]);

      const items = grouped[outlet][type];
      items.forEach((item) => {
        tableRows.push([
          { content: cleanPdfText(item.c1), styles: { halign: 'center' } }, // Ord./Bill Date
          { content: cleanPdfText(item.c2), styles: { halign: 'center' } }, // Ord./Bill No.
          { content: cleanPdfText(item.c3), styles: { halign: 'center' } }, // Ord./Bill Time (A)
          { content: cleanPdfText(item.c4), styles: { halign: 'left' } },   // Item Name
          { content: cleanPdfText(item.c5), styles: { halign: 'center' } }, // Qty
          { content: cleanPdfText(item.c6), styles: { halign: 'center' } }, // Ord. Complete Date
          { content: cleanPdfText(item.c7), styles: { halign: 'center' } }, // Ord. Complete Time (B)
          { content: cleanPdfText(item.c8), styles: { halign: 'center' } }, // Diff. (B-A)
          { content: cleanPdfText(item.c9), styles: { halign: 'center' } }, // Bill No.
          { content: cleanPdfText(item.c10), styles: { halign: 'center' } }, // Bill Date
          { content: cleanPdfText(item.c11), styles: { halign: 'center' } }, // Bill Time (C)
          { content: cleanPdfText(item.c12), styles: { halign: 'center' } }  // Diff. (C-A)
        ]);
      });
    });
  });

  // 4. Draw Plain Table
  autoTable(doc, {
    startY: startY,
    head: [['Ord./Bill Date', 'Ord./Bill No.', 'Ord./Bill Time (A)', 'Item Name', 'Qty', 'Ord. Complete Date', 'Ord. Complete Time (B)', 'Diff. (B-A)', 'Bill No.', 'Bill Date', 'Bill Time (C)', 'Diff. (C-A)']],
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
      fontSize: 7.2,
      textColor: [0, 0, 0],
      valign: 'middle',
      cellPadding: 1.2
    },
    columnStyles: {
      0: { cellWidth: 20 },  // Date
      1: { cellWidth: 20 },  // No
      2: { cellWidth: 25 },  // Time A
      3: { cellWidth: 62 },  // Item Name
      4: { cellWidth: 10 },  // Qty
      5: { cellWidth: 20 },  // Complete Date
      6: { cellWidth: 25 },  // Time B
      7: { cellWidth: 15 },  // Diff B-A
      8: { cellWidth: 15 },  // Bill No
      9: { cellWidth: 20 },  // Bill Date
      10: { cellWidth: 20 }, // Bill Time C
      11: { cellWidth: 15 }  // Diff C-A
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
      doc.text('ALFA HOTEL MANAGEMENT SYSTEM   |   Kitchen Time Gap Report', leftMargin, 10);
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
