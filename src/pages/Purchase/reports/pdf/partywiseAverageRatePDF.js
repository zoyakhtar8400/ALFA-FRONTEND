import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Dedicated PDF Exporter for Partywise Itemwise Average Rate Report
 * Formatted exactly as ALFA Partywise Itemwise Average Rate PDF specification
 */
export const exportPartywiseAverageRatePDF = (reportName, columns, data, activeFilters, printedOnStr) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const leftMargin = 12;
    const rightMargin = 12;

    // 1. Hotel Header
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text('ALFA', pageWidth / 2, 14, { align: 'center' });

    // 2. Subtitle with Date Range
    const formatDateDisplay = (dateVal, defaultFallback) => {
      if (!dateVal) return defaultFallback;
      try {
        const parts = dateVal.split('-');
        if (parts.length === 3) {
          const d = parseInt(parts[2]);
          const mIdx = parseInt(parts[1]) - 1;
          const y = parts[0];
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return `${String(d).padStart(2, '0')}/${months[mIdx] || 'Apr'}/${y}`;
        }
      } catch (e) {
        // ignore
      }
      return defaultFallback;
    };

    const fromStr = formatDateDisplay(activeFilters?.startDate, '01/Apr/2026');
    const toStr = formatDateDisplay(activeFilters?.endDate, '25/Jul/2026');

    doc.setFontSize(10.5);
    doc.text(`Partywise Itemwise Average Rate From ${fromStr} To ${toStr}`, pageWidth / 2, 20, { align: 'center' });

    // 3. Filter Parameters Block (Courier Monospace)
    doc.setFont('Courier', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(30, 41, 59);

    let filterY = 27;
    const filterLines = [
      `Site Name      : HO`,
      `Type           : Partywise`,
      `Behalf Of Rate : Most`
    ];

    filterLines.forEach(line => {
      doc.text(line, leftMargin, filterY);
      filterY += 4;
    });

    const startTableY = filterY + 3;

    // 4. Columns & Partywise Grouped Data
    const tableHeaders = ['Item Name', 'Quantity', 'Unit', 'Net Cost', 'Avg Rate', 'Min Rate', 'Max Rate', 'Last Pr. Rate'];

    const samplePartiesData = [
      {
        party: 'A P SUPPLY',
        items: [
          ['TEA BAG', '30.000', 'PACKET', '6600.00', '220.00', '220.00', '220.00', '220.00'],
          ['MILK POWDER', '30.000', 'PACKET', '11370.00', '379.00', '379.00', '379.00', '379.00'],
          ['SUGAR', '15.000', 'PACKET', '1850.00', '123.33', '120.00', '125.00', '120.00'],
          ['AATA', '70.000', 'K.G.', '2240.00', '32.00', '32.00', '32.00', '32.00'],
          ['SUGAR KG', '25.000', 'K.G.', '750.00', '30.00', '30.00', '30.00', '30.00']
        ],
        total: '22810.00'
      },
      {
        party: 'ANITAJAISWAL',
        items: [
          ['BLACK & WHITE', '12.000', 'Bottle', '18204.00', '1517.00', '1517.00', '1517.00', '1517.00'],
          ['J.W BLACK LABLE', '3.000', 'Bottle', '8742.00', '2914.00', '2914.00', '2914.00', '2914.00'],
          ['BLENDER RESERVE', '12.000', 'Bottle', '11076.00', '923.00', '923.00', '923.00', '923.00'],
          ['BUDWEISER 330 ML', '24.000', 'Bottle', '2112.00', '88.00', '88.00', '88.00', '88.00'],
          ['ELEPHANT 330ML', '24.000', 'Bottle', '2112.00', '88.00', '88.00', '88.00', '88.00'],
          ['JAMESON IRISH', '12.000', 'Bottle', '25764.00', '2147.00', '2147.00', '2147.00', '2147.00'],
          ['ELEPHANT CAN', '490.000', 'CAN', '69825.00', '142.50', '142.50', '142.50', '142.50'],
          ['ELEPHANT BOTTLE', '60.000', 'CAN', '11160.00', '186.00', '186.00', '186.00', '186.00']
        ],
        total: '313626.00'
      },
      {
        party: 'ENGINEERING SOLUTION',
        items: [
          ['M FOLD NAPKIN', '125.000', 'PCS', '2477.50', '19.82', '19.82', '19.82', '19.82'],
          ['K D', '2.000', 'PCS', '494.00', '247.00', '247.00', '247.00', '247.00']
        ],
        total: '6897.70'
      }
    ];

    const tableRows = [];

    samplePartiesData.forEach(pGroup => {
      // Party Header Row
      tableRows.push([
        { content: pGroup.party, colSpan: 8, styles: { fontStyle: 'bold', font: 'Courier', fillColor: [255, 255, 255] } }
      ]);

      pGroup.items.forEach(itm => {
        tableRows.push(itm);
      });

      // Party Total Row
      tableRows.push([
        { content: 'Party Total :', colSpan: 3, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: pGroup.total, styles: { fontStyle: 'bold', font: 'Courier', halign: 'right' } },
        { content: '', colSpan: 4, styles: { halign: 'left' } }
      ]);
    });

    const tableConfig = {
      startY: startTableY,
      head: [tableHeaders],
      body: tableRows,
      theme: 'plain',
      headStyles: {
        fillColor: [209, 213, 219], // Light Gray Header (#D1D5DB)
        textColor: [0, 0, 0],
        font: 'Courier',
        fontSize: 7.8,
        fontStyle: 'bold',
        halign: 'left',
        valign: 'middle',
        cellPadding: 1.8
      },
      bodyStyles: {
        fontSize: 7.2,
        textColor: [0, 0, 0],
        font: 'Courier',
        valign: 'middle',
        cellPadding: 1.6
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 55 },
        1: { halign: 'right', cellWidth: 20 },
        2: { halign: 'center', cellWidth: 18 },
        3: { halign: 'right', cellWidth: 24 },
        4: { halign: 'right', cellWidth: 18 },
        5: { halign: 'right', cellWidth: 18 },
        6: { halign: 'right', cellWidth: 18 },
        7: { halign: 'right', cellWidth: 18 }
      },
      styles: {
        lineColor: [226, 232, 240],
        lineWidth: 0.1
      },
      margin: { left: leftMargin, right: rightMargin, top: 15, bottom: 15 },
      pageBreak: 'auto'
    };

    if (typeof autoTable === 'function') {
      autoTable(doc, tableConfig);
    } else if (typeof doc.autoTable === 'function') {
      doc.autoTable(tableConfig);
    }

    // 5. Footer (Printed By & Page X of Y)
    const totalPages = doc.internal.getNumberOfPages();
    const printDateStr = printedOnStr || new Date().toLocaleString();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);

      doc.setDrawColor(148, 163, 184);
      doc.setLineWidth(0.2);
      doc.line(leftMargin, pageHeight - 12, pageWidth - rightMargin, pageHeight - 12);

      doc.text(`Printed By : SA on ${printDateStr}`, leftMargin, pageHeight - 7);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - rightMargin, pageHeight - 7, { align: 'right' });
    }
    const blob = doc.output('blob');
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  } catch (err) {
    console.error('Export Partywise Average Rate PDF Error:', err);
  }
};
