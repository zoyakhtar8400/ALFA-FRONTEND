import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const formatIndianCurrency = (num) => {
  const parsed = parseFloat(num);
  if (isNaN(parsed) || parsed === 0) return '';
  return parsed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const exportNCKOTPDF = (columns, data, filters = {}, printedOn = '') => {
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

  const dateRangeStr = `NC KOT(Bill Report)(Detailed) From ${filters.dateFrom || 'Start'} To ${filters.dateTo || 'End'}`;
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
  doc.text('NC Type     : All', leftMargin, 27.5);

  const startY = 30;

  // 3. Build Table Rows Grouped by Outlet -> Date -> NC Type
  const tableRows = [];
  const grouped = {};

  data.forEach(row => {
    const outlet = row.outlet || '1978 THE FAMILY RESTAURANT';
    const date = row.c4 || '';
    const ncType = row.ncType || 'Complementry (0.00%)';

    if (!grouped[outlet]) grouped[outlet] = {};
    if (!grouped[outlet][date]) grouped[outlet][date] = {};
    if (!grouped[outlet][date][ncType]) grouped[outlet][date][ncType] = [];

    grouped[outlet][date][ncType].push(row);
  });

  const outletsList = Object.keys(grouped).sort();

  outletsList.forEach(outlet => {
    // Outlet Header
    tableRows.push([
      {
        content: `Outlet : ${outlet.toUpperCase()}`,
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

    const datesList = Object.keys(grouped[outlet]).sort();
    datesList.forEach(date => {
      // Date Header
      tableRows.push([
        {
          content: `Date : ${date}`,
          colSpan: 10,
          styles: {
            fontStyle: 'bold',
            textColor: [0, 0, 0],
            fontSize: 7.2,
            halign: 'left',
            cellPadding: { top: 1.5, bottom: 1.5, left: 0 }
          }
        }
      ]);

      const ncTypesList = Object.keys(grouped[outlet][date]).sort();
      let dateTotalAmount = 0;

      ncTypesList.forEach(ncType => {
        // NC Type Header
        tableRows.push([
          {
            content: `NC Type : ${ncType}`,
            colSpan: 10,
            styles: {
              fontStyle: 'bold',
              textColor: [0, 0, 0],
              fontSize: 7,
              halign: 'left',
              cellPadding: { top: 1.5, bottom: 1.5, left: 0 }
            }
          }
        ]);

        const items = grouped[outlet][date][ncType];
        let ncTypeTotalAmount = 0;

        items.forEach((item) => {
          tableRows.push([
            { content: item.c1, styles: { halign: 'center' } }, // S.No.
            { content: item.c2, styles: { halign: 'center' } }, // KOT/Bill No.
            { content: item.c3, styles: { halign: 'center' } }, // Table/Room
            { content: item.c4, styles: { halign: 'center' } }, // Date
            { content: item.c5, styles: { halign: 'left' } },   // Item
            { content: item.c6, styles: { halign: 'left' } },   // Remarks
            { content: item.c7, styles: { halign: 'left' } },   // Cust. Remarks
            { content: item.c8, styles: { halign: 'center' } }, // Qty.
            { content: item.c9, styles: { halign: 'right' } },  // Rate
            { content: item.c10, styles: { halign: 'right' } }  // Amount
          ]);

          ncTypeTotalAmount += item.rawAmount || 0;
          dateTotalAmount += item.rawAmount || 0;
        });

        // NC Type Total Row (dotted bottom line)
        const shortType = ncType.split(' ')[0];
        tableRows.push([
          { 
            content: `${shortType} Total :`, 
            colSpan: 9,
            styles: { 
              fontStyle: 'bold', 
              halign: 'right', 
              textColor: [0, 0, 0],
              lineWidth: { bottom: 0.15 },
              lineColor: [0, 0, 0]
            } 
          },
          { 
            content: formatIndianCurrency(ncTypeTotalAmount), 
            styles: { 
              fontStyle: 'bold', 
              halign: 'right', 
              textColor: [0, 0, 0],
              lineWidth: { bottom: 0.15 },
              lineColor: [0, 0, 0]
            } 
          }
        ]);
      });

      // Date Total Row (solid bottom line)
      tableRows.push([
        { 
          content: `${date} Total :`, 
          colSpan: 9,
          styles: { 
            fontStyle: 'bold', 
            halign: 'right', 
            textColor: [0, 0, 0],
            lineWidth: { bottom: 0.25 },
            lineColor: [0, 0, 0]
          } 
        },
        { 
          content: formatIndianCurrency(dateTotalAmount), 
          styles: { 
            fontStyle: 'bold', 
            halign: 'right', 
            textColor: [0, 0, 0],
            lineWidth: { bottom: 0.25 },
            lineColor: [0, 0, 0]
          } 
        }
      ]);
    });
  });

  // 4. Draw Plain Table
  autoTable(doc, {
    startY: startY,
    head: [['S.No.', 'KOT/Bill No.', 'Table/Room', 'Date', 'Item', 'Remarks', 'Cust. Remarks', 'Qty.', 'Rate', 'Amount']],
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
      0: { cellWidth: 10 },  // S.No.
      1: { cellWidth: 18 },  // KOT/Bill No.
      2: { cellWidth: 18 },  // Table/Room
      3: { cellWidth: 22 },  // Date
      4: { cellWidth: 44 },  // Item
      5: { cellWidth: 26 },  // Remarks
      6: { cellWidth: 14 },  // Cust. Remarks
      7: { cellWidth: 10 },  // Qty.
      8: { cellWidth: 13 },  // Rate
      9: { cellWidth: 15 }   // Amount
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
      doc.text('ALFA HOTEL MANAGEMENT SYSTEM   |   NC KOT Report', leftMargin, 10);
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
