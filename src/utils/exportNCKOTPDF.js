import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { addRupeeFont } from './addRupeeFont';

  const formatAmount = (num) => {
    const parsed = parseFloat(String(num).replace(/[^0-9.-]/g, ''));
    if (isNaN(parsed)) return '0.00';
    return parsed.toFixed(2);
  };

  const cleanPdfText = (val) => String(val ?? '').replace(/Rs\.\s*/gi, '₹ ').replace(/¹/g, '₹');

  export const exportNCKOTPDF = (columns, data, filters = {}, printedOn = '', companyName = 'ALFA HOTEL MANAGEMENT SYSTEM', companyLogo = null) => {
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
  
    const dateRangeStr = `NC KOT/Bill Report(Detailed) From ${filters.dateFrom || 'Start'} To ${filters.dateTo || 'End'}`;
    const outletStr = `${filters.outlet || 'All'}`;
  
    const companyNameStr = (companyName || 'ALFA HOTEL MANAGEMENT SYSTEM').toUpperCase();
  
    // 2. Report Header (Plain text matching screenshot)
    let currentY = 14;
    if (companyLogo && companyLogo.startsWith('data:image')) {
      try {
        doc.addImage(companyLogo, 'PNG', (pageWidth / 2) - 8, 4, 16, 16);
        currentY = 25;
      } catch (e) {
        // Fallback if image fails
      }
    }

    doc.setFont('ArialRupee', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(companyNameStr, pageWidth / 2, currentY, { align: 'center' });
    
    doc.setFont('ArialRupee', 'bold');
    doc.setFontSize(9);
    doc.text(dateRangeStr, pageWidth / 2, currentY + 5, { align: 'center' });
  
    // Metadata block (Plain text left-aligned)
    doc.setFont('ArialRupee', 'normal');
    doc.setFontSize(8);
    doc.text(`Outlet    : ${outletStr}`, leftMargin, currentY + 11);
    doc.text(`NC Type: All`, leftMargin, currentY + 15);
  
    const startY = currentY + 18;
  
    // 3. Build Table Rows Grouped by Outlet -> Date -> NC Type
    const tableRows = [];
    const grouped = {};
  
    data.forEach(row => {
      const outlet = row.outlet || 'MAIN RESTAURANT';
      const date = row.c4 || '';
      const ncType = row.ncType || 'Complementry (0.00%)';
  
      if (!grouped[outlet]) grouped[outlet] = {};
      if (!grouped[outlet][date]) grouped[outlet][date] = {};
      if (!grouped[outlet][date][ncType]) grouped[outlet][date][ncType] = [];
  
      grouped[outlet][date][ncType].push(row);
    });
  
    const outletsList = Object.keys(grouped).sort();
    let grandTotalAmount = 0;
  
    outletsList.forEach(outlet => {
      // Outlet Header
      tableRows.push([
        {
          content: `Outlet : ${outlet.toUpperCase()}`,
          colSpan: 10,
          styles: { fontStyle: 'bold', textColor: [0, 0, 0], fontSize: 8, halign: 'left', cellPadding: { top: 1.5, bottom: 1.5, left: 1 } }
        }
      ]);
  
      let outletTotalAmount = 0;
  
      const datesList = Object.keys(grouped[outlet]).sort();
      datesList.forEach(date => {
        // Date Header
        tableRows.push([
          {
            content: `Date : ${date}`,
            colSpan: 10,
            styles: { fontStyle: 'bold', textColor: [0, 0, 0], fontSize: 8, halign: 'left', cellPadding: { top: 1.5, bottom: 1.5, left: 1 } }
          }
        ]);
  
        const ncTypesList = Object.keys(grouped[outlet][date]).sort();
        let dateTotalAmount = 0;
  
        ncTypesList.forEach(ncType => {
          // NC Type Header
          tableRows.push([
            {
              content: `NC Type :     ${ncType}`,
              colSpan: 10,
              styles: { fontStyle: 'bold', textColor: [0, 0, 0], fontSize: 7.5, halign: 'left', cellPadding: { top: 1.5, bottom: 1.5, left: 1 } }
            }
          ]);
  
          const items = grouped[outlet][date][ncType];
          let ncTypeTotalAmount = 0;
          let prevKotNo = null;
  
          items.forEach((item) => {
            const currentKot = cleanPdfText(item.c2);
            const showKot = currentKot !== prevKotNo;
            if (showKot) prevKotNo = currentKot;
  
            tableRows.push([
              { content: showKot ? cleanPdfText(item.c1) : '', styles: { halign: 'center' } }, // S.No.
              { content: showKot ? currentKot : '', styles: { halign: 'center' } }, // KOT/Bill No.
              { content: cleanPdfText(item.c3), styles: { halign: 'center' } }, // Table/Room
              { content: cleanPdfText(item.c4), styles: { halign: 'center' } }, // Date
              { content: cleanPdfText(item.c5), styles: { halign: 'left' } },   // Item
              { content: cleanPdfText(item.c6), styles: { halign: 'left' } },   // Remarks
              { content: cleanPdfText(item.c7), styles: { halign: 'left' } },   // Cust. Remarks
              { content: cleanPdfText(item.c8), styles: { halign: 'center' } }, // Qty.
              { content: formatAmount(item.c9), styles: { halign: 'right' } },  // Rate
              { content: formatAmount(item.c10), styles: { halign: 'right' } }  // Amount
            ]);
  
            ncTypeTotalAmount += item.rawAmount || 0;
            dateTotalAmount += item.rawAmount || 0;
          });
  
          // NC Type Total Row (dotted bottom line)
          const shortType = ncType.split(' ')[0].toUpperCase();
          tableRows.push([
            { 
              content: `${shortType} Total :`, 
              colSpan: 9,
              styles: { fontStyle: 'bold', halign: 'right', textColor: [0, 0, 0], lineWidth: { bottom: 0.15 }, lineColor: [0, 0, 0], borderStyles: 'dashed' } 
            },
            { 
              content: formatAmount(ncTypeTotalAmount), 
              styles: { fontStyle: 'bold', halign: 'right', textColor: [0, 0, 0], lineWidth: { bottom: 0.15 }, lineColor: [0, 0, 0], borderStyles: 'dashed' } 
            }
          ]);
        });
  
          // Date Total Row (dashed bottom line)
          tableRows.push([
            { 
              content: `${date} Total :`, 
              colSpan: 9,
              styles: { fontStyle: 'bold', halign: 'right', textColor: [0, 0, 0], lineWidth: { bottom: 0.15 }, lineColor: [0, 0, 0], borderStyles: 'dashed' } 
            },
            { 
              content: formatAmount(dateTotalAmount), 
              styles: { fontStyle: 'bold', halign: 'right', textColor: [0, 0, 0], lineWidth: { bottom: 0.15 }, lineColor: [0, 0, 0], borderStyles: 'dashed' } 
            }
          ]);
          
          outletTotalAmount += dateTotalAmount;
        });
  
        // Outlet Total Row (no bottom line, Grand Total will provide top line)
        tableRows.push([
          { 
            content: `${outlet.toUpperCase()} Total :`, 
            colSpan: 9,
            styles: { fontStyle: 'bold', halign: 'right', textColor: [0, 0, 0], lineWidth: 0 } 
          },
          { 
            content: formatAmount(outletTotalAmount), 
            styles: { fontStyle: 'bold', halign: 'right', textColor: [0, 0, 0], lineWidth: 0 } 
          }
        ]);
        grandTotalAmount += outletTotalAmount;
      });
  
      // Grand Total Row
      tableRows.push([
        { 
          content: `Grand Total :`, 
          colSpan: 9,
          styles: { fontStyle: 'bold', halign: 'right', textColor: [0, 0, 0], lineWidth: { bottom: 0.6, top: 0.6 }, lineColor: [0, 0, 0] } 
        },
        { 
          content: formatAmount(grandTotalAmount), 
          styles: { fontStyle: 'bold', halign: 'right', textColor: [0, 0, 0], lineWidth: { bottom: 0.6, top: 0.6 }, lineColor: [0, 0, 0] } 
        }
      ]);

  // 4. Draw Plain Table
  autoTable(doc, {
    startY: startY,
    head: [['S.No.', 'KOT /Bill No.', 'Table /Room', 'Date', 'Item', 'Remarks', 'Cust. Remarks', 'Qty.', 'Rate', 'Amount']],
    body: tableRows,
    theme: 'plain',
    styles: { font: 'ArialRupee' },
    headStyles: {
      fillColor: [226, 226, 226], // Light gray header
      textColor: [0, 0, 0],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      cellPadding: { top: 1.5, bottom: 1.5 },
      lineWidth: { top: 0, bottom: 0, left: 0, right: 0 }
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [0, 0, 0],
      valign: 'middle',
      cellPadding: { top: 1.5, bottom: 1.5 }
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },  // S.No.
      1: { cellWidth: 18, halign: 'center' },  // KOT/Bill No.
      2: { cellWidth: 18, halign: 'center' },  // Table/Room
      3: { cellWidth: 18, halign: 'center' },  // Date
      4: { cellWidth: 46, halign: 'left' },  // Item
      5: { cellWidth: 22, halign: 'left' },  // Remarks
      6: { cellWidth: 16, halign: 'left' },  // Cust. Remarks
      7: { cellWidth: 10, halign: 'center' },  // Qty.
      8: { cellWidth: 15, halign: 'right' },  // Rate
      9: { cellWidth: 17, halign: 'right' }   // Amount
    },
    margin: { left: leftMargin, right: rightMargin, top: 15, bottom: 15 },
    pageBreak: 'auto',
    didParseCell: function(data) {
      // Style column headers
      if (data.section === 'head') {
        if (data.column.index >= 4 && data.column.index <= 6) data.cell.styles.halign = 'left';
        if (data.column.index >= 8) data.cell.styles.halign = 'right';
      }
    }
  });

  // 5. Printed By Footer directly under the table
  const finalY = doc.lastAutoTable?.finalY || doc.previousAutoTable?.finalY || startY + 10;
  doc.setFont('Courier', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(0, 0, 0);
  
  const now = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dd = String(now.getDate()).padStart(2, '0');
  const mon = months[now.getMonth()];
  const yyyy = now.getFullYear();
  let hr = now.getHours();
  const min = String(now.getMinutes()).padStart(2, '0');
  const sec = String(now.getSeconds()).padStart(2, '0');
  const ampm = hr >= 12 ? 'PM' : 'AM';
  hr = hr % 12;
  hr = hr ? hr : 12;
  const hrStr = String(hr).padStart(2, '0');
  
  const printedByStr = printedOn || `Printed By : SA on ${dd}/${mon}/${yyyy} ${hrStr}:${min}:${sec} ${ampm}`;
  doc.text(printedByStr, leftMargin, finalY + 6);

  // 6. Running footers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Write Page 1 header indicator
    if (i === 1) {
      let currentY = 14;
      if (companyLogo && companyLogo.startsWith('data:image')) {
        currentY = 25;
      }
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(`Page 1 of ${pageCount}`, pageWidth - rightMargin, currentY, { align: 'right' });
    }

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(0, 0, 0);

    // running header page 2+
    if (i > 1) {
      doc.setFont('Helvetica', 'bold');
      doc.text('HOTEL SAI REGENCY   |   NC KOT Report', leftMargin, 10);
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
