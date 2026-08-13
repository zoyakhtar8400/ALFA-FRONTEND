import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { addRupeeFont } from './addRupeeFont';

const cleanPdfText = (val) => String(val ?? '').replace(/Rs\.\s*/gi, '₹ ').replace(/¹/g, '₹');

export const exportCustomerInfoPDF = (columns, data, filters = {}, printedOn = '') => {
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

  const titleStr = 'Customer Info Report';
  const subStr = `Guest loyalty registers, mobile contacts, and VIP tags database.`;

  // 2. Report Header (Plain text matching layout style)
  doc.setFont('ArialRupee', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(0, 0, 0);
  doc.text('ALFA HOTEL MANAGEMENT SYSTEM', pageWidth / 2, 14, { align: 'center' });

  doc.setFontSize(8.5);
  doc.text(titleStr, pageWidth / 2, 18.5, { align: 'center' });

  // Metadata block (Plain text left-aligned)
  doc.setFont('ArialRupee', 'normal');
  doc.setFontSize(7.5);
  doc.text(subStr, leftMargin, 23.5);

  const startY = 28;

  // 3. Build Table Rows
  const tableRows = data.map(item => [
    { content: cleanPdfText(item.c1), styles: { halign: 'center' } }, // Customer Name
    { content: cleanPdfText(item.c2), styles: { halign: 'center' } }, // Mobile
    { content: cleanPdfText(item.c3), styles: { halign: 'left' } },   // Type
    { content: cleanPdfText(item.c4), styles: { halign: 'center' } }, // Visits Count
    { content: cleanPdfText(item.c5), styles: { halign: 'center' } }  // Last Visit
  ]);

  // 4. Draw Plain Table
  autoTable(doc, {
    startY: startY,
    head: [['Customer Name', 'Mobile', 'Type', 'Visits Count', 'Last Visit']],
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
      cellPadding: 1.2
    },
    columnStyles: {
      0: { cellWidth: 50 },  // Customer Name
      1: { cellWidth: 35 },  // Mobile
      2: { cellWidth: 35 },  // Type
      3: { cellWidth: 30 },  // Visits Count
      4: { cellWidth: 40 }   // Last Visit
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
      doc.text('ALFA HOTEL MANAGEMENT SYSTEM   |   Customer Info Report', leftMargin, 10);
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
