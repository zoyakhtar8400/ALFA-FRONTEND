import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';

export const exportPDF = (reportName, columns, data, activeFilters, printedOn) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // 1. Clean Title Block (No heavy color background blocks, elegant typography)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text('ALFA HOTEL MANAGEMENT SYSTEM', 105, 15, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(71, 85, 105); // Slate-600
  doc.text(reportName.toUpperCase(), 105, 22, { align: 'center' });

  // 2. Printed Metadata Info
  doc.setFontSize(7.5);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate-400
  doc.text(`Printed By: Admin | Printed On: ${printedOn}`, 15, 30);

  // Subtle separator line
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.setLineWidth(0.5);
  doc.line(15, 32, 195, 32);

  const yOffset = 36;

  // 3. Table Rows Mapping
  const tableHeaders = columns;
  const tableRows = data.map((rowObj) => 
    columns.map((_, colIdx) => {
      const rawVal = rowObj[`c${colIdx + 1}`] || '';
      // Strip currency symbol completely and trim whitespace
      return String(rawVal).replace(/₹/g, '').trim();
    })
  );

  // 4. AutoTable Configuration
  autoTable(doc, {
    startY: yOffset,
    head: [tableHeaders],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Dark Navy/Slate header (#1E293B)
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [15, 23, 42],
      valign: 'middle'
    },
    columnStyles: {
      // Right-align currency / numeric values automatically
      ...columns.reduce((acc, colName, idx) => {
        const isNumeric = colName.toUpperCase().includes('AMOUNT') || 
                          colName.toUpperCase().includes('REVENUE') || 
                          colName.toUpperCase().includes('TAX') || 
                          colName.toUpperCase().includes('BILL') || 
                          colName.toUpperCase().includes('PAID') || 
                          colName.toUpperCase().includes('TOTAL') ||
                          colName.toUpperCase().includes('VAL');
        if (isNumeric) {
          acc[idx] = { halign: 'right', fontStyle: 'bold' };
        }
        return acc;
      }, {})
    },
    styles: {
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.2
    },
    didDrawPage: () => {
      const totalPages = doc.internal.getNumberOfPages();
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${totalPages}`,
        105,
        287,
        { align: 'center' }
      );
    }
  });

  // Open the PDF in a new browser tab/window instead of downloading it directly
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, '_blank');
};
