import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

const formatIndianCurrency = (num) => {
  const parsed = parseFloat(num);
  if (isNaN(parsed)) return '0.00';
  return parsed.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const exportItemwiseCategorywiseSalePDF = (columns, data, filters = {}, printedOn = '') => {
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

  const dateRangeStr = `Itemwise Categorywise Sale From ${filters.dateFrom || '01/Apr/2026'} To ${filters.dateTo || '15/Apr/2026'}`;
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

  const startY = 35;

  // 3. Build Grouped Table Rows
  const tableRows = [];

  // Group data by Category -> MainGrp -> Grp
  const grouped = {};
  data.forEach(row => {
    const cat = row.category || 'GST 0 %';
    const main = row.mainGrp || 'FOOD';
    const grp = row.grp || 'BEVERAGE';
    
    if (!grouped[cat]) grouped[cat] = {};
    if (!grouped[cat][main]) grouped[cat][main] = {};
    if (!grouped[cat][main][grp]) grouped[cat][main][grp] = [];
    
    grouped[cat][main][grp].push(row);
  });

  const categoriesList = Object.keys(grouped).sort();

  categoriesList.forEach(cat => {
    // A. Category Header Row
    tableRows.push([
      {
        content: `Category: ${cat.toUpperCase()}`,
        colSpan: 4,
        styles: {
          fontStyle: 'bold',
          textColor: [0, 0, 0],
          fontSize: 7.5,
          halign: 'left',
          cellPadding: { top: 1.5, bottom: 1.5, left: 0 }
        }
      }
    ]);

    let catValue = 0;
    const mainGroups = Object.keys(grouped[cat]).sort();

    mainGroups.forEach(main => {
      // B. Main Group Header Row
      tableRows.push([
        {
          content: `Main Grp: ${main.toUpperCase()}`,
          colSpan: 4,
          styles: {
            fontStyle: 'bold',
            textColor: [0, 0, 0],
            fontSize: 7.5,
            halign: 'left',
            cellPadding: { top: 1.5, bottom: 1.5, left: 0 }
          }
        }
      ]);

      let mainValue = 0;
      const groups = Object.keys(grouped[cat][main]).sort();

      groups.forEach(grp => {
        // C. Group Header Row
        tableRows.push([
          {
            content: `Grp: ${grp.toUpperCase()}`,
            colSpan: 4,
            styles: {
              fontStyle: 'bold',
              textColor: [0, 0, 0],
              fontSize: 7.5,
              halign: 'left',
              cellPadding: { top: 1.5, bottom: 1.5, left: 0 }
            }
          }
        ]);

        const items = grouped[cat][main][grp];
        let grpValue = 0;

        items.forEach(item => {
          tableRows.push([
            { content: `      ${item.c1}`, styles: { halign: 'left' } }, // Item Name
            { content: item.c2, styles: { halign: 'center' } }, // Unit
            { content: String(item.rawQty), styles: { halign: 'center' } }, // Qty
            { content: formatIndianCurrency(item.rawValue), styles: { halign: 'right' } } // Value
          ]);

          grpValue += item.rawValue || 0;
          mainValue += item.rawValue || 0;
          catValue += item.rawValue || 0;
        });

        // D. Group Total Row (sums Value, Qty blank, thin top & bottom border lines)
        tableRows.push([
          { 
            content: `             ${grp} Total :`, 
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
            content: formatIndianCurrency(grpValue), 
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

      // E. Main Group Total Row (sums Value)
      tableRows.push([
        { 
          content: `             ${main} Total :`, 
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
          content: formatIndianCurrency(mainValue), 
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

    // F. Category Total Row (sums Value)
    tableRows.push([
      { 
        content: `             ${cat} Total :`, 
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
        content: formatIndianCurrency(catValue), 
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
    head: [['Item Name', 'Unit', 'Qty.', 'Value']],
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
      0: { cellWidth: 105 },  // Item Name
      1: { cellWidth: 25, halign: 'center' },  // Unit
      2: { cellWidth: 25, halign: 'center' },  // Qty.
      3: { cellWidth: 25, halign: 'right' }   // Value
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
      doc.text('ALFA HOTEL MANAGEMENT SYSTEM   |   Itemwise Categorywise Sale Report', leftMargin, 10);
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
