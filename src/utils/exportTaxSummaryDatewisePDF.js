import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const formatIndianCurrency = (num) => {
  const parsed = parseFloat(num);
  if (isNaN(parsed) || parsed === 0) return '';
  return parsed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const exportTaxSummaryDatewisePDF = (columns, data, filters = {}, printedOn = '') => {
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

  const dateRangeStr = `Tax Summary Datewise From ${filters.dateFrom || 'Start'} To ${filters.dateTo || 'End'}`;
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

  outletsList.forEach(outlet => {
    // Outlet Header Row
    tableRows.push([
      {
        content: outlet.toUpperCase(),
        colSpan: 16,
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
    let totalGross = 0;
    let totalTaxable = 0;
    let totalNonTaxable = 0;
    let totalDiscount = 0;
    let totalSgst = 0;
    let totalCgst = 0;
    let totalRound = 0;
    let totalNet = 0;

    items.forEach((item) => {
      tableRows.push([
        { content: item.c1, styles: { halign: 'center' } }, // Date
        { content: item.c2, styles: { halign: 'center' } }, // Bill No
        { content: item.c3, styles: { halign: 'right' } },  // Gross Amt
        { content: item.c4, styles: { halign: 'right' } },  // Taxable
        { content: item.c5, styles: { halign: 'right' } },  // Non-Taxable
        { content: item.c6, styles: { halign: 'right' } },  // Discount
        { content: item.c7, styles: { halign: 'right' } },  // SGST
        { content: item.c8, styles: { halign: 'right' } },  // CGST
        { content: item.c9, styles: { halign: 'right' } },  // IGST
        { content: item.c10, styles: { halign: 'right' } }, // CESS
        { content: item.c11, styles: { halign: 'right' } }, // VAT
        { content: item.c12, styles: { halign: 'right' } }, // Service Charge
        { content: item.c13, styles: { halign: 'right' } }, // S.C(SGST)
        { content: item.c14, styles: { halign: 'right' } }, // S.C(CGST)
        { content: item.c15, styles: { halign: 'right' } }, // Round Off
        { content: item.c16, styles: { halign: 'right' } }  // Net Amount
      ]);

      totalGross += item.rawGross || 0;
      totalTaxable += item.rawTaxable || 0;
      totalNonTaxable += item.rawNonTaxable || 0;
      totalDiscount += item.rawDiscount || 0;
      totalSgst += item.rawSgst || 0;
      totalCgst += item.rawCgst || 0;
      totalRound += item.rawRoundOff || 0;
      totalNet += item.rawNet || 0;
    });

    // Total Row
    tableRows.push([
      { 
        content: `${outlet} Total :`, 
        colSpan: 2,
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
        content: formatIndianCurrency(totalTaxable), 
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: formatIndianCurrency(totalNonTaxable), 
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
        content: formatIndianCurrency(totalSgst), 
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      { 
        content: formatIndianCurrency(totalCgst), 
        styles: { 
          fontStyle: 'bold', 
          halign: 'right', 
          textColor: [0, 0, 0],
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        } 
      },
      ...Array(6).fill('').map(() => ({
        content: '',
        styles: {
          lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
          lineColor: [0, 0, 0]
        }
      })),
      { 
        content: totalRound !== 0 ? totalRound.toFixed(2) : '', 
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
  });

  // 4. Draw Plain Table
  autoTable(doc, {
    startY: startY,
    head: [[
      'DATE', 'BILL No.', 'GROSS AMT.', 'TAXABLE AMT.', 'NON TAXABLE AMT.', 'DISCOUNT', 
      'SGST', 'CGST', 'IGST', 'CESS', 'VAT', 'SERVICE CHARGE', 'S.C(SGST)', 'S.C(CGST)', 'ROUND OFF', 'NET AMOUNT'
    ]],
    body: tableRows,
    theme: 'plain',
    headStyles: {
      textColor: [0, 0, 0],
      fontSize: 6,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: { top: 1.5, bottom: 1.5 },
      lineWidth: { top: 0.25, bottom: 0.25, left: 0, right: 0 },
      lineColor: [0, 0, 0]
    },
    bodyStyles: {
      fontSize: 5.8,
      textColor: [0, 0, 0],
      valign: 'middle',
      cellPadding: 1.0
    },
    columnStyles: {
      0: { cellWidth: 20 },  // DATE
      1: { cellWidth: 15 },  // BILL No
      2: { cellWidth: 18 },  // GROSS AMT
      3: { cellWidth: 18 },  // TAXABLE AMT
      4: { cellWidth: 22 },  // NON TAXABLE
      5: { cellWidth: 16 },  // DISCOUNT
      6: { cellWidth: 14 },  // SGST
      7: { cellWidth: 14 },  // CGST
      8: { cellWidth: 12 },  // IGST
      9: { cellWidth: 12 },  // CESS
      10: { cellWidth: 12 }, // VAT
      11: { cellWidth: 22 }, // SERVICE CHARGE
      12: { cellWidth: 16 }, // S.C(SGST)
      13: { cellWidth: 16 }, // S.C(CGST)
      14: { cellWidth: 15 }, // ROUND OFF
      15: { cellWidth: 25 }  // NET AMOUNT
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
      doc.text('ALFA HOTEL MANAGEMENT SYSTEM   |   Tax Summary Datewise', leftMargin, 10);
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
