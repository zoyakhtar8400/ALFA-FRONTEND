import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { addRupeeFont } from './addRupeeFont';

const formatIndianCurrency = (num) => {
  const parsed = parseFloat(num);
  if (isNaN(parsed)) return '0.00';
  return '₹ ' + parsed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const cleanPdfText = (val) => String(val ?? '').replace(/Rs\.\s*/gi, '₹ ').replace(/¹/g, '₹');

export const exportStewardwiseSalePDF = (columns, data, filters = {}, printedOn = '') => {
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

  const dateRangeStr = `Stewardwise Item Sale From ${filters.dateFrom || 'Start'} To ${filters.dateTo || 'End'}`;
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

  // 3. Build Table Rows Grouped by Steward
  const tableRows = [];
  const grouped = {};

  data.forEach(row => {
    const steward = row.steward || 'B.M PATEL';
    if (!grouped[steward]) grouped[steward] = [];
    grouped[steward].push(row);
  });

  const stewardsList = Object.keys(grouped).sort();

  stewardsList.forEach(steward => {
    // Steward Header Row
    tableRows.push([
      {
        content: `Steward :    ${steward.toUpperCase()}`,
        colSpan: 8,
        styles: {
          fontStyle: 'bold',
          textColor: [0, 0, 0],
          fontSize: 7.5,
          halign: 'left',
          cellPadding: { top: 1.5, bottom: 1.5, left: 0 }
        }
      }
    ]);

    const items = grouped[steward];
    let stewardQty = 0;
    let stewardAmount = 0;
    let stewardIncentive = 0;
    let stewardTotInc = 0;

    items.forEach((item) => {
      tableRows.push([
        { content: item.c1, styles: { halign: 'center' } }, // S.No.
        { content: item.c2, styles: { halign: 'left' } },   // Item
        { content: item.c3, styles: { halign: 'center' } }, // Outlet
        { content: item.c4, styles: { halign: 'center' } }, // Unit
        { content: item.c5, styles: { halign: 'center' } }, // Qty
        { content: item.c6, styles: { halign: 'right' } },  // Amount
        { content: item.c7, styles: { halign: 'center' } }, // Incentive
        { content: item.c8, styles: { halign: 'right' } }   // Tot Inc.
      ]);

      stewardQty += item.rawQty || 0;
      stewardAmount += item.rawAmount || 0;
      stewardIncentive += item.rawIncentive || 0;
      stewardTotInc += item.rawTotInc || 0;
    });

    // Steward Total Row (with horizontal border lines)
    tableRows.push([
      { 
        content: 'Steward Total :', 
        colSpan: 4,
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: stewardQty.toFixed(2), 
        styles: { 
          fontStyle: 'bold', 
          halign: 'center', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: formatIndianCurrency(stewardAmount), 
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: String(stewardIncentive), 
        styles: { 
          fontStyle: 'bold', 
          halign: 'center', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: formatIndianCurrency(stewardTotInc), 
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

  // 4. Draw Plain Table
  autoTable(doc, {
    startY: startY,
    head: [['S.No.', 'Item', 'Outlet', 'Unit', 'Qty', 'Amount', 'Incentive', 'Tot Inc.']],
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
      0: { cellWidth: 10 },  // S.No.
      1: { cellWidth: 55 },  // Item
      2: { cellWidth: 30 },  // Outlet
      3: { cellWidth: 20 },  // Unit
      4: { cellWidth: 15 },  // Qty
      5: { cellWidth: 20 },  // Amount
      6: { cellWidth: 15 },  // Incentive
      7: { cellWidth: 15 }   // Tot Inc.
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
      doc.text('ALFA HOTEL MANAGEMENT SYSTEM   |   Stewardwise Item Sale Report', leftMargin, 10);
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
