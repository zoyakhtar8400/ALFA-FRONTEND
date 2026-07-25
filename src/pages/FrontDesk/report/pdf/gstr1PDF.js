import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportGSTR1PDF = (reportName, columns, data, activeFilters, printedOnStr) => {
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = 210, pageHeight = 297, leftMargin = 12, rightMargin = 12;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(0, 0, 0);
    doc.text('ALFA', pageWidth / 2, 14, { align: 'center' });

    const fromStr = activeFilters?.startDate || '01/Apr/2026';
    const toStr = activeFilters?.endDate || '25/Jul/2026';

    doc.setFontSize(10.5);
    doc.text(`GSTR-1 Return Report From ${fromStr} To ${toStr}`, pageWidth / 2, 20, { align: 'center' });

    doc.setFont('Courier', 'normal');
    doc.setFontSize(8.2);
    doc.setTextColor(30, 41, 59);

    let filterY = 27;
    const filterLines = [
      `From Date       : ${fromStr}`,
      `To Date         : ${toStr}`,
      `GSTIN Filter    : ${activeFilters?.gstin || 'All Outward Invoices'}`,
      `Site Name       : HO`,
      `Report Type     : GSTR-1 Format`
    ];

    filterLines.forEach(line => { doc.text(line, leftMargin, filterY); filterY += 4; });
    const startTableY = filterY + 3;

    const tableHeaders = columns;
    const tableRows = (data || []).map(rowObj => columns.map((_, idx) => String(rowObj[`c${idx + 1}`] || '').replace(/₹/g, 'Rs. ')));

    autoTable(doc, {
      startY: startTableY,
      head: [tableHeaders],
      body: tableRows,
      theme: 'plain',
      headStyles: { fillColor: [209, 213, 219], textColor: [0, 0, 0], fontSize: 8, fontStyle: 'bold', halign: 'left', cellPadding: 2 },
      bodyStyles: { fontSize: 7.5, textColor: [0, 0, 0], font: 'Courier', cellPadding: 2 },
      columnStyles: { 0: { halign: 'center' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' }, 6: { halign: 'right' } },
      styles: { lineColor: [226, 232, 240], lineWidth: 0.1 },
      margin: { left: leftMargin, right: rightMargin, top: 15, bottom: 15 }
    });

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
    window.open(URL.createObjectURL(blob), '_blank');
  } catch (err) {
    console.error('Export GSTR-1 PDF Error:', err);
  }
};
