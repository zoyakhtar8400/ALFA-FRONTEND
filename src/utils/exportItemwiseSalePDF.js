import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const formatIndianCurrency = (num) => {
  const parsed = parseFloat(num);
  if (isNaN(parsed)) return '0.00';
  return parsed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const exportItemwiseSalePDF = (columns, data, filters = {}, printedOn = '') => {
  // 1. Initialize Document in A4 Portrait
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const leftMargin = 15;
  const rightMargin = 15;
  const printableWidth = pageWidth - leftMargin - rightMargin; // 180mm

  const dateRangeStr = `Itemwise Sale From ${filters.dateFrom || '01/Apr/2026'} To ${filters.dateTo || '15/Apr/2026'}`;
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
  doc.text('Main Grp    : All', leftMargin, 27.5);
  doc.text('Item Grp    : All', leftMargin, 31.5);
  doc.text('Inc.NC KOT: Yes', leftMargin, 35.5);

  const startY = 38;

  // 3. Build Grouped Table Rows
  const tableRows = [];

  // Group data by Outlet -> MainGrp -> Grp
  const grouped = {};
  data.forEach(row => {
    const outlet = row.outlet || 'All Outlets';
    const mainGrp = row.mainGrp || 'General';
    const grp = row.grp || 'General';
    
    if (!grouped[outlet]) grouped[outlet] = {};
    if (!grouped[outlet][mainGrp]) grouped[outlet][mainGrp] = {};
    if (!grouped[outlet][mainGrp][grp]) grouped[outlet][mainGrp][grp] = [];
    
    grouped[outlet][mainGrp][grp].push(row);
  });

  const outletsList = Object.keys(grouped).sort();

  outletsList.forEach(outlet => {
    // A. Outlet Header
    tableRows.push([
      {
        content: `Outlet : ${outlet.toUpperCase()}`,
        colSpan: 5,
        styles: {
          fontStyle: 'bold',
          textColor: [0, 0, 0],
          fontSize: 7.5,
          halign: 'left',
          cellPadding: { top: 1.5, bottom: 1.5, left: 0 }
        }
      }
    ]);

    const mainGroups = Object.keys(grouped[outlet]).sort();
    mainGroups.forEach(mainGrp => {
      // B. Main Group Header
      tableRows.push([
        {
          content: `Main Grp: ${mainGrp.toUpperCase()}`,
          colSpan: 5,
          styles: {
            fontStyle: 'bold',
            textColor: [0, 0, 0],
            fontSize: 7.5,
            halign: 'left',
            cellPadding: { top: 1.5, bottom: 1.5, left: 0 }
          }
        }
      ]);

      const groups = Object.keys(grouped[outlet][mainGrp]).sort();
      groups.forEach(grp => {
        // C. Group Header
        tableRows.push([
          {
            content: `Grp: ${grp.toUpperCase()}`,
            colSpan: 5,
            styles: {
              fontStyle: 'bold',
              textColor: [0, 0, 0],
              fontSize: 7.5,
              halign: 'left',
              cellPadding: { top: 1.5, bottom: 1.5, left: 0 }
            }
          }
        ]);

        // D. Company Header
        tableRows.push([
          {
            content: 'Company :',
            colSpan: 5,
            styles: {
              fontStyle: 'bold',
              textColor: [0, 0, 0],
              fontSize: 7.5,
              halign: 'left',
              cellPadding: { top: 1, bottom: 1, left: 0 }
            }
          }
        ]);

        const items = grouped[outlet][mainGrp][grp];
        let grpQty = 0;
        let grpNCQty = 0;

        items.forEach(item => {
          let ncQtyText = '';
          let qtyText = '';

          if (item.rawNCQty > 0) {
            ncQtyText = item.rawNCQty.toFixed(3);
          } else {
            qtyText = String(item.rawQty);
          }

          tableRows.push([
            { content: item.c1, styles: { halign: 'left' } },
            { content: item.c2, styles: { halign: 'center' } },
            { content: ncQtyText, styles: { halign: 'center' } },
            { content: qtyText, styles: { halign: 'center' } },
            { content: formatIndianCurrency(item.rawValue), styles: { halign: 'right' } }
          ]);

          grpQty += item.rawQty || 0;
          grpNCQty += item.rawNCQty || 0;
        });

        // E. Group Total Row with Horizontal Rules (solid line borders on cell edges)
        const totalText = `             ${grp} Total :`;
        const totalQty = grpQty > 0 ? grpQty : grpNCQty;

        tableRows.push([
          { 
            content: totalText, 
            styles: { 
              fontStyle: 'bold', 
              halign: 'left', 
              textColor: [0, 0, 0],
              lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
              lineColor: [0, 0, 0]
            } 
          },
          { 
            content: '', 
            styles: { 
              lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
              lineColor: [0, 0, 0]
            } 
          },
          { 
            content: '', 
            styles: { 
              lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
              lineColor: [0, 0, 0]
            } 
          },
          { 
            content: String(totalQty), 
            styles: { 
              fontStyle: 'bold', 
              halign: 'center', 
              textColor: [0, 0, 0],
              lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
              lineColor: [0, 0, 0]
            } 
          },
          { 
            content: '', 
            styles: { 
              lineWidth: { top: 0.15, bottom: 0.15, left: 0, right: 0 },
              lineColor: [0, 0, 0]
            } 
          }
        ]);
      });
    });
  });

  // 4. Draw Plain Table
  autoTable(doc, {
    startY: startY,
    head: [['Item Name', 'Unit', 'NC Qty.', 'Qty.', 'Value']],
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
      0: { cellWidth: 80 },  // Item Name
      1: { cellWidth: 25, halign: 'center' },  // Unit
      2: { cellWidth: 25, halign: 'center' },  // NC Qty.
      3: { cellWidth: 25, halign: 'center' },  // Qty.
      4: { cellWidth: 25, halign: 'right' }   // Value
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

    // Draw running header for page >= 2
    if (i > 1) {
      doc.setFont('Helvetica', 'bold');
      doc.text('ALFA HOTEL MANAGEMENT SYSTEM   |   Itemwise Sale Report', leftMargin, 10);
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
