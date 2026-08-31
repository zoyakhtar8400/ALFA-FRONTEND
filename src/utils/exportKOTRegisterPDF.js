import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { addRupeeFont } from './addRupeeFont';

const formatIndianCurrency = (num) => {
  const parsed = parseFloat(num);
  if (isNaN(parsed) || parsed === 0) return '0.00';
  return parsed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const cleanPdfText = (val) => String(val ?? '').replace(/Rs\.\s*/gi, '₹ ').replace(/¹/g, '₹');

export const exportKOTRegisterPDF = (columns, data, filters = {}, printedOn = '', companyName = 'ALFA HOTEL MANAGEMENT SYSTEM', companyLogo = null) => {
  // Filter out NC KOTs
  const filteredData = data.filter(row => row.c13 !== 'Yes');

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });
  addRupeeFont(doc);

  const pageWidth = 297;
  const pageHeight = 210;
  const leftMargin = 10;
  const rightMargin = 10;

  const dateFromText = filters.dateFrom || 'Start';
  const dateToText = filters.dateTo || 'End';
  const dateRangeStr = `KOT Register From ${dateFromText} To ${dateToText}`;
  const outletStr = `${filters.outlet || 'All'}`;
  
  const headerTitle = (companyName || 'ALFA HOTEL MANAGEMENT SYSTEM').toUpperCase();

  let currentY = 12;
  if (companyLogo && companyLogo.startsWith('data:image')) {
    try {
      doc.addImage(companyLogo, 'PNG', (pageWidth / 2) - 8, 4, 16, 16);
      doc.setFont('ArialRupee', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      currentY = 25;
      doc.text(headerTitle, pageWidth / 2, currentY, { align: 'center' });
    } catch (e) {
      doc.setFont('ArialRupee', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(0, 0, 0);
      doc.text(headerTitle, pageWidth / 2, currentY, { align: 'center' });
    }
  } else {
    doc.setFont('ArialRupee', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text(headerTitle, pageWidth / 2, currentY, { align: 'center' });
  }

  currentY += 5;
  doc.setFontSize(8.5);
  doc.text(dateRangeStr, pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 6;

  // Metadata block
  doc.setFont('ArialRupee', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Outlet      : ${outletStr}`, leftMargin, currentY);
  currentY += 4;
  doc.text(`Type        : All`, leftMargin, currentY);

  const startY = currentY + 3;

  // 3. Build Table Rows Grouped by Outlet
  const tableRows = [];
  const grouped = {};

  filteredData.forEach(row => {
    const outlet = row.outlet || 'MAIN RESTAURANT';
    if (!grouped[outlet]) grouped[outlet] = [];
    grouped[outlet].push(row);
  });

  const outletsList = Object.keys(grouped).sort();
  let grandTotal = 0;

  outletsList.forEach(outlet => {
    // Outlet Header Row
    tableRows.push([
      {
        content: outlet.toUpperCase(),
        colSpan: 15,
        styles: {
          fontStyle: 'bold',
          textColor: [0, 0, 0],
          fontSize: 7,
          halign: 'left',
          cellPadding: { top: 1.5, bottom: 1.5, left: 0 }
        }
      }
    ]);

    const items = grouped[outlet];
    let totalAmount = 0;
    
    let prevDate = null;
    let prevKotNo = null;

    items.forEach((item) => {
      const currentDate = cleanPdfText(item.c1);
      const currentKot = cleanPdfText(item.c2);
      
      const showDate = currentDate !== prevDate;
      const showKot = currentKot !== prevKotNo;
      
      if (showDate) prevDate = currentDate;
      if (showKot) prevKotNo = currentKot;

      tableRows.push([
        { content: showDate ? currentDate : '', styles: { halign: 'center' } }, // Date
        { content: showKot ? currentKot : '', styles: { halign: 'center' } }, // KOT No.
        { content: showKot ? cleanPdfText(item.c3) : '', styles: { halign: 'center' } }, // Bill No
        { content: showKot ? cleanPdfText(item.c4) : '', styles: { halign: 'center' } }, // Time
        { content: showKot ? cleanPdfText(item.c5) : '', styles: { halign: 'center' } },   // Steward
        { content: showKot ? cleanPdfText(item.c6) : '', styles: { halign: 'center' } }, // Table No.
        { content: cleanPdfText(item.c7), styles: { halign: 'center' } },   // Item
        { content: cleanPdfText(item.c8), styles: { halign: 'center' } }, // Qty.
        { content: cleanPdfText(item.c9), styles: { halign: 'center' } },  // Rate
        { content: cleanPdfText(item.c10), styles: { halign: 'center' } }, // Amount
        { content: cleanPdfText(item.c11), styles: { halign: 'center' } }, // Void
        { content: cleanPdfText(item.c12), styles: { halign: 'center' } },   // Reason
        { content: cleanPdfText(item.c13), styles: { halign: 'center' } }, // NC KOT
        { content: cleanPdfText(item.c14), styles: { halign: 'center' } },   // Remarks
        { content: cleanPdfText(item.c15), styles: { halign: 'center' } }    // User
      ]);

      totalAmount += Number(item.rawAmount || 0);
    });

    grandTotal += totalAmount;

    // Total Row
    tableRows.push([
      { 
        content: `${outlet} Total :`, 
        colSpan: 9,
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: formatIndianCurrency(totalAmount), 
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: '', colSpan: 5,
        styles: {
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        }
      }
    ]);
  });

  // Grand Total Row
  if (outletsList.length > 0) {
    tableRows.push([
      { 
        content: `Grand Total :`, 
        colSpan: 9,
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: formatIndianCurrency(grandTotal), 
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: '', colSpan: 5,
        styles: {
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        }
      }
    ]);
  }

  // 4. Draw Plain Table
  autoTable(doc, {
    startY: startY,
    head: [[
      'Date', 'KOT No.', 'Bill No.', 'Time', 'Steward', 'Table No.', 'Item', 'Qty.', 'Rate', 'Amount', 'Void', 'Reason', 'NC KOT', 'Remarks', 'User'
    ]],
    body: tableRows,
    theme: 'plain',
    styles: { font: 'ArialRupee', fontSize: 6, textColor: [0, 0, 0], cellPadding: 1 },
    headStyles: {
      fillColor: [225, 225, 225],
      textColor: [0, 0, 0],
      fontSize: 6,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: { top: 1.5, bottom: 1.5 },
      lineWidth: { top: 0, bottom: 0, left: 0, right: 0 }
    },
    bodyStyles: {
      fontSize: 5.8,
      textColor: [0, 0, 0],
      valign: 'middle',
      cellPadding: 1.0
    },
    columnStyles: {
      0: { cellWidth: 16 },  // Date
      1: { cellWidth: 14 },  // KOT No.
      2: { cellWidth: 14 },  // Bill No
      3: { cellWidth: 12 },  // Time
      4: { cellWidth: 20 },  // Steward
      5: { cellWidth: 14 },  // Table No
      6: { cellWidth: 42 },  // Item
      7: { cellWidth: 10 },  // Qty.
      8: { cellWidth: 12 },  // Rate
      9: { cellWidth: 16 },  // Amount
      10: { cellWidth: 10 }, // Void
      11: { cellWidth: 18 }, // Reason
      12: { cellWidth: 12 }, // NC KOT
      13: { cellWidth: 24 }, // Remarks
      14: { cellWidth: 15 }  // User
    },
    margin: { left: leftMargin, right: rightMargin, top: 15, bottom: 15 },
    pageBreak: 'auto'
  });

  // Footer
  let finalY = doc.lastAutoTable.finalY + 2;
  if (finalY > pageHeight - 15) {
    doc.addPage();
    finalY = 15;
  }

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
      doc.text(`${headerTitle}   |   KOT Register`, leftMargin, 10);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.line(leftMargin, 12, pageWidth - rightMargin, 12);
    }

    // running page indicator top right
    doc.setFont('Helvetica', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - rightMargin, 12, { align: 'right' });
  }

  // Open in new tab
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank');
};
