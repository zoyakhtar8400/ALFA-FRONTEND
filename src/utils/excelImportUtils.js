import * as XLSX from 'xlsx';

/**
 * Flexible case-insensitive value finder for row objects
 */
export const getRowFieldValue = (row, candidateKeys = []) => {
  if (!row || typeof row !== 'object') return '';
  const rowKeys = Object.keys(row);
  for (const candidate of candidateKeys) {
    const cleanCand = candidate.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const matchedKey = rowKeys.find((rk) => {
      const cleanRk = rk.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      return cleanRk === cleanCand;
    });
    if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null && String(row[matchedKey]).trim() !== '') {
      return row[matchedKey];
    }
  }
  return '';
};

// Common alias mappings for auto-header resolution
const ALIAS_MAP = {
  itemname: ['itemname', 'name', 'item_name', 'item name', 'title', 'item'],
  name: ['itemname', 'name', 'item_name', 'item name', 'title', 'item'],
  price: ['price', 'salerate', 'sale_rate', 'rate', 'cost', 'amount', 'purchaserate', 'purchase_rate'],
  salerate: ['price', 'salerate', 'sale_rate', 'rate', 'cost', 'amount', 'purchaserate', 'purchase_rate']
};

/**
 * Universal Excel (.xlsx, .xls) and CSV (.csv) parsing helper using XLSX library
 */
export const parseExcelOrCsvFile = async (file, expectedRequiredHeaders = [], validateRowFn = null, preprocessRowsFn = null) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true, raw: false });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          reject(new Error('The uploaded spreadsheet contains no worksheets.'));
          return;
        }

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert worksheet to raw 2D grid first to detect true header row
        const rawGrid = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (!rawGrid || rawGrid.length === 0) {
          reject(new Error('The uploaded file is empty or contains no data rows.'));
          return;
        }

        // Smart Header Row Detection: Find the row that best matches known menu/item column headers
        const headerKeywords = [
          'item', 'name', 'itemname', 'item name', 'menu item', 'title', 'particulars', 'dish', 'product', 'description',
          'rate', 'price', 'salerate', 'sale rate', 'sale_rate', 'mrp', 'amount', 'cost',
          'half', 'full', '4pc', '8pc', '4 pc', '8 pc', 'small', 'medium', 'large',
          'category', 'group', 'itemgroup', 'foodtype', 'type', 'unit', 'serving', 'remarks'
        ];

        let bestHeaderIdx = 0;
        let maxScore = -1;
        const searchLimit = Math.min(rawGrid.length, 12);

        for (let r = 0; r < searchLimit; r++) {
          const rowCells = rawGrid[r];
          if (!Array.isArray(rowCells) || rowCells.length === 0) continue;
          let score = 0;
          rowCells.forEach((cell) => {
            const str = String(cell || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!str) return;
            if (headerKeywords.some((kw) => str.includes(kw.replace(/[^a-z0-9]/g, '')))) {
              score += 2;
            }
          });
          if (score > maxScore && score >= 2) {
            maxScore = score;
            bestHeaderIdx = r;
          }
        }

        let rawJsonRows = [];
        if (maxScore >= 2 && bestHeaderIdx > 0) {
          // Use detected header row
          const headerRow = rawGrid[bestHeaderIdx].map((c, i) => String(c || '').trim() || `Col_${i}`);
          for (let r = bestHeaderIdx + 1; r < rawGrid.length; r++) {
            const dataRow = rawGrid[r];
            if (!dataRow || !dataRow.some((val) => val !== '' && val !== null && val !== undefined)) continue;
            const obj = {};
            headerRow.forEach((colName, cIdx) => {
              obj[colName] = dataRow[cIdx] !== undefined ? dataRow[cIdx] : '';
            });
            rawJsonRows.push(obj);
          }
        } else {
          rawJsonRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        }

        if (rawJsonRows.length === 0) {
          reject(new Error('The uploaded file contains no data rows after header analysis.'));
          return;
        }

        const rowsToProcess = typeof preprocessRowsFn === 'function' ? preprocessRowsFn(rawJsonRows) : rawJsonRows;

        // Collect all file headers present in any row
        const fileHeaderSet = new Set();
        rowsToProcess.forEach((row) => {
          Object.keys(row || {}).forEach((k) => fileHeaderSet.add(k.trim().toLowerCase().replace(/[^a-z0-9]/g, '')));
        });
        const fileHeaders = Array.from(fileHeaderSet);

        // 1. Smart Template Header Validation with Auto-Aliases
        const missingHeaders = expectedRequiredHeaders.filter((reqGroup) => {
          let candidates = [];
          if (Array.isArray(reqGroup)) {
            candidates = reqGroup;
          } else {
            const cleanReq = reqGroup.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            candidates = ALIAS_MAP[cleanReq] || [cleanReq];
          }

          return !candidates.some((cand) => {
            const cleanCand = cand.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            return fileHeaders.includes(cleanCand);
          });
        });

        if (missingHeaders.length > 0) {
          const displayMissing = missingHeaders.map((m) => (Array.isArray(m) ? m[0] : m)).join(', ');
          reject(
            new Error(
              `Invalid import template. Missing required column(s): ${displayMissing}`
            )
          );
          return;
        }

        // 2. Row Validation & Sanitization
        const seenKeys = new Set();
        const processedRows = rowsToProcess.map((row, index) => {
          const sanitizedRow = {};
          Object.keys(row).forEach((key) => {
            const cleanKey = key.trim();
            const val = row[key];
            sanitizedRow[cleanKey] = typeof val === 'string' ? val.trim() : val;
          });

          let isValid = true;
          let errorReason = 'Valid';

          if (validateRowFn) {
            const customValidation = validateRowFn(sanitizedRow, index, seenKeys);
            if (customValidation && !customValidation.isValid) {
              isValid = false;
              errorReason = customValidation.errorReason || 'Invalid data row';
            }
          }

          return {
            ...sanitizedRow,
            __rowIndex: index + 2, // 1-indexed row number accounting for header
            __isValid: isValid,
            __errorReason: errorReason,
          };
        });

        const validRows = processedRows.filter((r) => r.__isValid);
        const invalidRows = processedRows.filter((r) => !r.__isValid);

        resolve({
          fileName: file.name,
          totalRows: processedRows.length,
          validCount: validRows.length,
          invalidCount: invalidRows.length,
          allRows: processedRows,
          validRows,
          invalidRows,
        });
      } catch (err) {
        reject(new Error(`Failed to parse file with XLSX parser: ${err.message}`));
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file from disk'));
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Generate and trigger download for Sample Excel (.xlsx) or CSV (.csv) template
 */
export const downloadSampleTemplate = (sampleData, baseFilename, format = 'xlsx') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample_Template');

    if (format === 'csv') {
      const csvContent = XLSX.utils.sheet_to_csv(worksheet);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${baseFilename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${baseFilename}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  } catch (err) {
    console.error('Error generating sample template:', err);
    if (window.showToast) window.showToast(`Error generating sample file: ${err.message}`, 'error');
  }
};
