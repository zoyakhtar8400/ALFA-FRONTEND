import ExcelJS from 'exceljs/dist/exceljs.min.js';
import { saveAs } from 'file-saver';

export const exportExcel = async (reportName, columns, data, activeFilters, printedOn) => {
  let Lib = ExcelJS;
  if (ExcelJS && ExcelJS.default) {
    Lib = ExcelJS.default;
  }
  const WorkbookClass = Lib.Workbook || ExcelJS.Workbook;
  const workbook = new WorkbookClass();
  const worksheet = workbook.addWorksheet('Report');

  // 1. Add Company Title
  const titleRow = worksheet.addRow(['ALFA HOTEL MANAGEMENT SYSTEM']);
  titleRow.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FFFFFF' } };
  titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
  worksheet.mergeCells(1, 1, 1, columns.length || 5);
  titleRow.height = 40;
  
  const titleCell = titleRow.getCell(1);
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '1E293B' }
  };

  // 2. Add Report Title
  const reportRow = worksheet.addRow([reportName.toUpperCase()]);
  reportRow.font = { name: 'Arial', size: 11, bold: true, color: { argb: '1E293B' } };
  reportRow.alignment = { horizontal: 'center' };
  worksheet.mergeCells(2, 1, 2, columns.length || 5);
  reportRow.height = 24;

  worksheet.addRow([]); // Blank spacer

  // 4. Add Main Table Headers
  const headerRow = worksheet.addRow(columns);
  headerRow.height = 26;
  headerRow.font = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFF' } };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };

  for (let i = 1; i <= columns.length; i++) {
    const cell = headerRow.getCell(i);
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '334155' }
    };
    cell.border = {
      top: { style: 'thin', color: { argb: '94A3B8' } },
      bottom: { style: 'medium', color: { argb: '475569' } },
      left: { style: 'thin', color: { argb: '94A3B8' } },
      right: { style: 'thin', color: { argb: '94A3B8' } }
    };
  }

  // 5. Add Data Rows
  data.forEach((rowObj) => {
    const rowValues = columns.map((_, colIdx) => rowObj[`c${colIdx + 1}`] || '');
    const dataRow = worksheet.addRow(rowValues);
    dataRow.height = 20;
    dataRow.font = { name: 'Arial', size: 9 };
    
    for (let i = 1; i <= columns.length; i++) {
      const cell = dataRow.getCell(i);
      cell.alignment = { vertical: 'middle' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'F1F5F9' } },
        bottom: { style: 'thin', color: { argb: 'F1F5F9' } },
        left: { style: 'thin', color: { argb: 'F1F5F9' } },
        right: { style: 'thin', color: { argb: 'F1F5F9' } }
      };

      const valStr = String(cell.value || '');
      if (valStr.startsWith('₹') || valStr.match(/^\d+(\.\d+)?$/)) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.font = { name: 'Arial', size: 9, bold: true };
      }
    }
  });

  worksheet.addRow([]); // Blank spacer

  // 7. Auto Column Widths
  worksheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? String(cell.value).length : 0;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = maxLength + 4;
  });

  // 8. Trigger File Save
  const buffer = await workbook.xlsx.writeBuffer();
  const fileBlob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(fileBlob, `${reportName.toLowerCase().replace(/\s+/g, '_')}_report.xlsx`);
};
