import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { addRupeeFont } from './addRupeeFont';

// Helper to format currency for PDF
const formatPdfCurrency = (num) => {
  const parsed = parseFloat(num);
  if (isNaN(parsed)) return '₹ 0.00';
  const parts = parsed.toFixed(2).split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherParts = parts[0].substring(0, parts[0].length - 3);
  if (otherParts !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return `₹ ${formattedInt}.${parts[1]}`;
};

const cleanPdfText = (val) => String(val ?? '').replace(/Rs\.\s*/gi, '₹ ').replace(/¹|`/g, '₹ ');

export const exportSalesRegisterPDF = (columns, data, filters = {}, printedOn = '', companyName = 'ALFA HOTEL MANAGEMENT SYSTEM', companyLogo = null) => {
  // 1. Initialize Document in A4 Landscape
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  addRupeeFont(doc);

  const pageWidth = 297;
  const pageHeight = 210;
  const leftMargin = 5;
  const rightMargin = 5;

  const dateFromText = filters.dateFrom || 'Start';
  const dateToText = filters.dateTo || 'End';
  const dateRangeStr = `Sales Register From ${dateFromText} To ${dateToText}`;
  const uniqueOutlets = [...new Set(data.map(i => String(i.outlet || 'MAIN RESTAURANT')))];
  const isSingleOutlet = uniqueOutlets.length === 1;
  
  // If specific outlet is filtered (or all data belongs to one outlet), use its name. Otherwise use companyName
  const headerTitle = isSingleOutlet ? uniqueOutlets[0].toUpperCase() : (companyName || 'ALFA HOTEL MANAGEMENT SYSTEM').toUpperCase();
  
  // Also fix the sub-header to show the real name instead of potentially an ID
  const displayOutletSub = isSingleOutlet ? uniqueOutlets[0] : 'All Outlets';
  
  // 1. Hotel Header & Logo
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
  doc.text(`Outlet      : ${displayOutletSub}`, leftMargin, currentY);

  const startY = currentY + 4;

  // 3. Build Table Rows with Totals
  const tableRows = [];
  let totalGross = 0, totalDiscount = 0, totalDeduction = 0, totalNonTaxable = 0, totalTaxable = 0;
  let totalCgst = 0, totalSgst = 0, totalIgst = 0, totalVat = 0, totalCess = 0;
  let totalRoundOff = 0, totalNet = 0;

  data.forEach((item, idx) => {
    tableRows.push([
      { content: String(idx + 1), styles: { halign: 'center' } }, // c1 S.No
      // c2 is Outlet, skipping in PDF as requested
      { content: cleanPdfText(item.c3), styles: { halign: 'center' } }, // c3 Date
      { content: cleanPdfText(item.c4), styles: { halign: 'center' } }, // c4 Time
      { content: cleanPdfText(item.c5), styles: { halign: 'center' } }, // c5 Bill No
      { content: cleanPdfText(item.c6), styles: { halign: 'center' } }, // c6 Table
      { content: cleanPdfText(item.c7), styles: { halign: 'center' } }, // c7 Customer
      { content: cleanPdfText(item.c8), styles: { halign: 'center' } }, // c8 Pay Mode
      
      { content: cleanPdfText(item.c9), styles: { halign: 'center' } }, // c9 Gross
      { content: cleanPdfText(item.c10), styles: { halign: 'center' } }, // c10 Discount
      { content: cleanPdfText(item.c11), styles: { halign: 'center' } }, // c11 Non Tax
      { content: cleanPdfText(item.c12), styles: { halign: 'center' } }, // c12 Taxable
      { content: cleanPdfText(item.c13), styles: { halign: 'center' } }, // c13 GST 5%
      { content: cleanPdfText(item.c14), styles: { halign: 'center' } }, // c14 IGST
      { content: cleanPdfText(item.c15), styles: { halign: 'center' } }, // c15 Round Off
      { content: cleanPdfText(item.c16), styles: { halign: 'center', fontStyle: 'bold' } }, // c16 Net
      { content: cleanPdfText(item.c17), styles: { halign: 'center' } }, // c17 User
    ]);

    totalGross += Number(item.rawGross || 0);
    totalDiscount += Number(item.rawDiscount || 0);
    // Add logic if raw values for these are available, otherwise 0
    totalTaxable += Number(item.rawTaxable || 0);
    totalCgst += Number(item.rawCgst || 0);
    totalSgst += Number(item.rawSgst || 0);
    totalNet += Number(item.rawNet || 0);
  });

  // 4. Draw Plain Table
  autoTable(doc, {
    startY: startY,
    head: [['S.No', 'Date', 'Time', 'Bill No', 'Table', 'Customer', 'Pay Type', 'Gross Amt', 'Disc.', 'Non Tax', 'Taxable', 'GST 5%', 'IGST', 'Round Off', 'Net Amt', 'User']],
    body: tableRows,
    theme: 'plain',
    styles: { font: 'ArialRupee', fontSize: 6.5, textColor: [0, 0, 0], cellPadding: 1 },
    headStyles: {
      textColor: [0, 0, 0],
      fontSize: 6.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: { top: 1.5, bottom: 1.5 },
      lineWidth: { top: 0.25, bottom: 0.25, left: 0, right: 0 },
      lineColor: [0, 0, 0]
    },
    bodyStyles: {
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 8 },  // S.No
      1: { cellWidth: 17 }, // Date
      2: { cellWidth: 16 }, // Time
      3: { cellWidth: 15 }, // Bill No
      4: { cellWidth: 12 }, // Table
      5: { cellWidth: 22 }, // Customer
      6: { cellWidth: 16 }, // Mode
      7: { cellWidth: 16 }, // Gross Amount
      8: { cellWidth: 13 }, // Discount
      9: { cellWidth: 15 }, // Non Tax
      10: { cellWidth: 16 }, // Taxable
      11: { cellWidth: 14 }, // GST 5%
      12: { cellWidth: 11 }, // IGST
      13: { cellWidth: 14 }, // Round Off
      14: { cellWidth: 17 }, // Net Amount
      15: { cellWidth: 14 }, // User
    },
    margin: { left: leftMargin, right: rightMargin, top: 15, bottom: 15 },
    pageBreak: 'auto'
  });

  // 4b. Summary Section
  let finalY = doc.lastAutoTable.finalY + 10;
  
  const summaryPageCheck = (neededHeight) => {
    if (finalY + neededHeight > pageHeight - 15) {
      doc.addPage();
      finalY = 15;
    }
  };
  
  summaryPageCheck(10);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Printed By : SA on ${printedOn || new Date().toLocaleString()}`, leftMargin, finalY);
  finalY += 5;

  // Pay Type Vertical Summary
  const payTypesMap = {};
  data.forEach(item => {
    const pt = String(item.rawPayment || 'CASH').toUpperCase();
    payTypesMap[pt] = (payTypesMap[pt] || 0) + Number(item.rawNet || 0);
  });
  
  const payTypeRows = [];
  let summaryTotal = 0;
  Object.keys(payTypesMap).sort().forEach(pt => {
    if (payTypesMap[pt] > 0) {
      payTypeRows.push([
        { content: pt, styles: { halign: 'center' } },
        { content: cleanPdfText(formatPdfCurrency(payTypesMap[pt])), styles: { halign: 'right' } }
      ]);
      summaryTotal += payTypesMap[pt];
    }
  });
  
  payTypeRows.push([
    { content: 'Grand Total', styles: { fontStyle: 'bold', halign: 'center', lineWidth: { top: 0.5, bottom: 0.5 } } },
    { content: cleanPdfText(formatPdfCurrency(summaryTotal)), styles: { fontStyle: 'bold', halign: 'right', lineWidth: { top: 0.5, bottom: 0.5 } } }
  ]);

  autoTable(doc, {
    startY: finalY,
    head: [['Pay Type', 'Amount']],
    body: payTypeRows,
    theme: 'plain',
    styles: { font: 'ArialRupee', fontSize: 7.5, textColor: [0, 0, 0], cellPadding: 2 },
    headStyles: {
      fillColor: [204, 204, 204],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 40 }
    },
    margin: { left: leftMargin },
  });

  finalY = doc.lastAutoTable.finalY + 15;
  summaryPageCheck(20);

  // Matrix Summary: Outlet vs Pay Type
  const sortedOutlets = [...new Set(data.map(i => String(i.outlet || 'MAIN RESTAURANT')))].sort();
  const sortedPayTypes = Object.keys(payTypesMap).sort();
  
  const outletPaySums = {};
  sortedOutlets.forEach(o => { outletPaySums[o] = {}; });
  
  data.forEach(item => {
    const o = String(item.outlet || 'MAIN RESTAURANT');
    const pt = String(item.rawPayment || 'CASH').toUpperCase();
    outletPaySums[o][pt] = (outletPaySums[o][pt] || 0) + Number(item.rawNet || 0);
  });

  const matrixHead = ['Outlet', ...sortedPayTypes, 'Total'];
  const matrixRows = [];
  
  sortedOutlets.forEach(outlet => {
    const row = [{ content: outlet, styles: { halign: 'left' } }];
    let rowTotal = 0;
    sortedPayTypes.forEach(pt => {
      const v = outletPaySums[outlet][pt] || 0;
      row.push({ content: v > 0 ? cleanPdfText(formatPdfCurrency(v)) : '', styles: { halign: 'right' } });
      rowTotal += v;
    });
    row.push({ content: cleanPdfText(formatPdfCurrency(rowTotal)), styles: { halign: 'right' } });
    matrixRows.push(row);
  });
  
  const matrixTotalRow = [{ content: 'Total', styles: { halign: 'left' } }];
  let matGrandTotal = 0;
  sortedPayTypes.forEach(pt => {
    let colTotal = 0;
    sortedOutlets.forEach(o => { colTotal += (outletPaySums[o][pt] || 0); });
    matrixTotalRow.push({ content: cleanPdfText(formatPdfCurrency(colTotal)), styles: { halign: 'right' } });
    matGrandTotal += colTotal;
  });
  matrixTotalRow.push({ content: cleanPdfText(formatPdfCurrency(matGrandTotal)), styles: { halign: 'right' } });
  matrixRows.push(matrixTotalRow);

  autoTable(doc, {
    startY: finalY,
    head: [matrixHead],
    body: matrixRows,
    theme: 'grid',
    styles: { font: 'ArialRupee', fontSize: 7, textColor: [0, 0, 0], cellPadding: 2, lineColor: [0,0,0], lineWidth: 0.1 },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      halign: 'center'
    },
    tableWidth: 'wrap',
    margin: { left: leftMargin },
  });

  // 5. Running footers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);

    if (i > 1) {
      doc.setFont('Helvetica', 'bold');
      doc.text(`${headerTitle}   |   Sales Register Report`, leftMargin, 10);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.line(leftMargin, 12, pageWidth - rightMargin, 12);
    }

    doc.setFont('Helvetica', 'normal');
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - rightMargin, pageHeight - 8, { align: 'right' });
  }

  // Open in new tab
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank');
};
