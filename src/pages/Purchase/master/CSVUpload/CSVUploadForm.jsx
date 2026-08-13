import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import { FaCloudUploadAlt, FaDownload, FaCheckCircle, FaExclamationTriangle, FaFileExcel } from 'react-icons/fa';
import { parseExcelOrCsvFile, downloadSampleTemplate, getRowFieldValue } from '../../../../utils/excelImportUtils';
import { usePurchase } from '../../hooks/usePurchase';

const CSVUploadForm = ({ isOpen, onClose, onImport, showToast }) => {
  const { items, itemGroups, units } = usePurchase();
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [parseError, setParseError] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setParsedRows([]);
      setFileName('');
      setDragActive(false);
      setParseError('');
      setIsParsing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toast = (msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  };

  // Generate dynamic sample rows containing 100% of Purchase Item fields in the software
  const getDynamicSampleData = () => {
    if (items && items.length > 0) {
      return items.slice(0, 5).map((item) => ({
        ItemName: item.name || '',
        Unit: item.unitName || units?.[0]?.name || 'K.G.',
        Active: item.active || 'Yes',
        ItemCategory: item.itemCategory || 'PURCHASE 0%',
        ItemGroup: item.itemGroupName || itemGroups?.[0]?.name || 'RAW MATERIAL',
        StoreDepartment: item.storeDepartment || 'PURCHASE',
        LotNoApplicable: item.lotBatchNo || 'Yes',
        ConvUnit: item.conversionUnit || item.unitName || 'K.G.',
        PurchaseRate: Number(item.purchaseRate || 0),
        SalesRate: Number(item.sellingRate || item.purchaseRate || 0),
        MinLevel: Number(item.reOrderLevel || item.minLevel || 0),
        OpeningStock: Number(item.currentStock || 0)
      }));
    }

    const defaultGroup = itemGroups?.[0]?.name || 'RAW MATERIAL';
    const defaultUnit = units?.[0]?.name || 'K.G.';

    return [
      {
        ItemName: 'Sample Raw Flour',
        Unit: defaultUnit,
        Active: 'Yes',
        ItemCategory: 'PURCHASE 0%',
        ItemGroup: defaultGroup,
        StoreDepartment: 'PURCHASE',
        LotNoApplicable: 'Yes',
        ConvUnit: defaultUnit,
        PurchaseRate: 45,
        SalesRate: 50,
        MinLevel: 10,
        OpeningStock: 100
      },
      {
        ItemName: 'Sample Potatoes 5KG',
        Unit: defaultUnit,
        Active: 'Yes',
        ItemCategory: 'PURCHASE 0%',
        ItemGroup: itemGroups?.[1]?.name || defaultGroup,
        StoreDepartment: 'PURCHASE',
        LotNoApplicable: 'Yes',
        ConvUnit: defaultUnit,
        PurchaseRate: 25,
        SalesRate: 30,
        MinLevel: 20,
        OpeningStock: 150
      }
    ];
  };

  const handleDownloadSampleFormat = (format) => {
    const sampleData = getDynamicSampleData();
    downloadSampleTemplate(sampleData, 'ALFA_Purchase_Item_Entry_Full_Fields_Template', format);
    toast(`Downloaded Complete Sample ${format.toUpperCase()} Template (All 12 Purchase Software Fields)`);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.csv') && !lowerName.endsWith('.xlsx') && !lowerName.endsWith('.xls')) {
      toast('Please select a valid .xlsx, .xls, or .csv file');
      setParseError('Unsupported file format. Please upload .xlsx, .xls, or .csv');
      return;
    }

    setFileName(file.name);
    setParseError('');
    setIsParsing(true);

    try {
      const result = await parseExcelOrCsvFile(
        file,
        [['ItemName', 'Name', 'item_name', 'Item Name', 'Title', 'title']], // Candidate headers for ItemName
        (row, index, seenKeys) => {
          const rawName = String(getRowFieldValue(row, ['ItemName', 'Name', 'item_name', 'Item Name', 'Title', 'title'])).trim();
          if (!rawName) {
            return { isValid: false, errorReason: 'Missing ItemName' };
          }
          const itemKey = rawName.toLowerCase();
          if (seenKeys.has(itemKey)) {
            return { isValid: false, errorReason: 'Duplicate ItemName in file' };
          }
          seenKeys.add(itemKey);

          // Populate resolved fields for complete software field mapping
          row.ItemName = rawName;
          row.Unit = getRowFieldValue(row, ['Unit', 'unit', 'unitName', 'unit_name']) || units?.[0]?.name || 'K.G.';
          row.Active = getRowFieldValue(row, ['Active', 'active', 'Status', 'status']) || 'Yes';
          row.ItemCategory = getRowFieldValue(row, ['ItemCategory', 'itemcategory', 'item_category', 'Category', 'category']) || 'PURCHASE 0%';
          row.ItemGroup = getRowFieldValue(row, ['ItemGroup', 'itemgroup', 'item_group', 'Group', 'group']) || itemGroups?.[0]?.name || 'RAW MATERIAL';
          row.StoreDepartment = getRowFieldValue(row, ['StoreDepartment', 'storedepartment', 'store_department', 'Department', 'department']) || 'PURCHASE';
          row.LotNoApplicable = getRowFieldValue(row, ['LotNoApplicable', 'lotnoapplicable', 'lot_no_applicable', 'LotNo', 'lot_no']) || 'Yes';
          row.ConvUnit = getRowFieldValue(row, ['ConvUnit', 'convunit', 'conv_unit', 'ConversionUnit']) || row.Unit;
          row.PurchaseRate = Number(getRowFieldValue(row, ['PurchaseRate', 'purchaserate', 'purchase_rate', 'PurchasePrice', 'purchase_price']) || 0);
          row.SalesRate = Number(getRowFieldValue(row, ['SalesRate', 'salesrate', 'sales_rate', 'SellingPrice', 'selling_price']) || row.PurchaseRate || 0);
          row.MinLevel = Number(getRowFieldValue(row, ['MinLevel', 'minlevel', 'min_level', 'ReOrderLevel', 'minimum_stock']) || 0);
          row.OpeningStock = Number(getRowFieldValue(row, ['OpeningStock', 'openingstock', 'opening_stock', 'CurrentStock', 'current_stock']) || 0);

          return { isValid: true, errorReason: 'Valid' };
        }
      );

      setParsedRows(result.allRows);
      toast(`Successfully parsed ${result.fileName}: ${result.validCount} valid, ${result.invalidCount} invalid rows.`);
    } catch (err) {
      console.error('File parse error:', err);
      setParseError(err.message);
      toast(`Import Error: ${err.message}`);
      setParsedRows([]);
    } finally {
      setIsParsing(false);
    }
  };

  const validCount = parsedRows.filter((r) => r.__isValid !== false).length;
  const invalidCount = parsedRows.length - validCount;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const validRows = parsedRows.filter((r) => r.__isValid !== false);
    if (validRows.length === 0) return;
    onImport(validRows);
    onClose();
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Purchase Item Bulk Import (Complete Field Mapping)"
      maxWidth="720px"
    >
      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit} className="py-1">
        <div className="form-grid-2">

          {/* Sample Download Bar */}
          <div className="form-field form-span-2">
            <div className="flex justify-between items-center bg-amber-50/80 p-3 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <FaFileExcel className="text-emerald-700 text-base" />
                <span className="font-bold text-slate-800 text-xs">Download Complete Sample Template (All 12 Software Fields)</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadSampleFormat('xlsx')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <FaDownload size={11} /> Sample Excel (.xlsx)
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadSampleFormat('csv')}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <FaDownload size={11} /> Sample CSV (.csv)
                </button>
              </div>
            </div>
          </div>

          {/* File Upload Field */}
          <div className="form-field form-span-2">
            <label className="form-label">
              Upload Excel or CSV File <span className="text-red-500">*</span>
            </label>
            
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
              onClick={() => document.getElementById('itemExcelFileInputModal').click()}
              className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                dragActive ? 'border-teal-600 bg-teal-50/50' : 'border-slate-300 hover:border-teal-600 bg-slate-50/50'
              }`}
            >
              <input
                id="itemExcelFileInputModal"
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }}
              />
              <FaCloudUploadAlt className="text-3xl text-[#418A8B]" />
              <p className="font-bold text-slate-700 text-xs text-center">
                {fileName ? `Selected File: ${fileName}` : 'Drag & Drop .XLSX, .XLS, or .CSV file here or click to browse'}
              </p>
              <span className="text-[10px] text-slate-400">Supported formats: Excel Worksheets (.xlsx, .xls) and CSV (.csv)</span>
            </div>
          </div>

          {/* Error Banner */}
          {parseError && (
            <div className="form-field form-span-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs font-bold flex items-center gap-2">
              <FaExclamationTriangle className="text-red-500 text-base" />
              <span>❌ {parseError}</span>
            </div>
          )}

          {/* Parsed Preview Section */}
          {parsedRows.length > 0 && (
            <div className="form-field form-span-2">
              <div className="flex justify-between items-center bg-slate-100/70 p-2.5 rounded-lg border border-slate-200 text-xs font-bold mb-2">
                <span className="text-slate-700">Parsed Data ({parsedRows.length} Total Rows)</span>
                <div className="flex gap-3">
                  <span className="text-emerald-700 flex items-center gap-1"><FaCheckCircle /> {validCount} Valid</span>
                  {invalidCount > 0 && <span className="text-red-600 flex items-center gap-1"><FaExclamationTriangle /> {invalidCount} Invalid</span>}
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 font-bold border-b border-slate-200 text-slate-600 sticky top-0">
                    <tr>
                      <th className="p-2 text-center w-8">Status</th>
                      <th className="p-2">Row</th>
                      <th className="p-2">Item Name</th>
                      <th className="p-2">Unit</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Group</th>
                      <th className="p-2">Dept</th>
                      <th className="p-2">Validation Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((r, idx) => (
                      <tr key={idx} className={r.__isValid ? 'bg-white' : 'bg-red-50/70'}>
                        <td className="p-2 text-center">
                          {r.__isValid ? (
                            <FaCheckCircle className="text-emerald-600 inline" />
                          ) : (
                            <FaExclamationTriangle className="text-red-500 inline" />
                          )}
                        </td>
                        <td className="p-2 font-mono text-slate-500">#{r.__rowIndex || idx + 2}</td>
                        <td className="p-2 font-bold text-slate-800">{r.ItemName || '—'}</td>
                        <td className="p-2 text-slate-600">{r.Unit || '—'}</td>
                        <td className="p-2 text-slate-600">{r.ItemCategory || '—'}</td>
                        <td className="p-2 text-slate-600">{r.ItemGroup || '—'}</td>
                        <td className="p-2 text-slate-600">{r.StoreDepartment || '—'}</td>
                        <td className="p-2 font-semibold" style={{ color: r.__isValid ? '#16a34a' : '#dc2626' }}>
                          {r.__errorReason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        <CommonActionButtons
          onCancel={onClose}
          saveText={isParsing ? 'Parsing...' : validCount > 0 ? `Import ${validCount} Items to Database` : 'Import Items'}
          saveDisabled={validCount === 0 || isParsing}
        />
      </form>
    </CommonModal>
  );
};

export default CSVUploadForm;
