import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import { FaCloudUploadAlt, FaDownload, FaCheckCircle, FaExclamationTriangle, FaFileCsv } from 'react-icons/fa';

const SAMPLE_CSV = `ItemName,Unit,Active,ItemCategory,ItemGroup,StoreDepartment,LotNoApplicable,ConvUnit
AATA,K.G.,Yes,PURCHASE 0%,RAW MATERIAL,PURCHASE,Yes,K.G.
PATATO 5KG,K.G.,Yes,PURCHASE 0%,PATATO 5KG,PURCHASE,Yes,K.G.
TOMATO 1KG,K.G.,Yes,PURCHASE 0%,TOMATO 1KG,PURCHASE,Yes,K.G.`;

const CSVUploadForm = ({ isOpen, onClose, onImport, showToast }) => {
  const [parsedRows, setParsedRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setParsedRows([]);
      setFileName('');
      setDragActive(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toast = (msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ALFA_Item_Entry_Sample_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Downloaded Sample CSV Template');
  };

  const handleFileUpload = (file) => {
    if (!file || !file.name.endsWith('.csv')) {
      toast('Please select a valid .csv file');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        toast('CSV file is empty or missing headers');
        return;
      }
      const headers = lines[0].split(',').map((h) => h.trim());
      const rows = [];

      for (let i = 1; i < lines.length; i++) {
        const currentline = lines[i].split(',');
        if (currentline.length < headers.length) continue;
        const obj = {};
        let isValid = true;
        let errorReason = '';

        headers.forEach((header, colIdx) => {
          obj[header] = currentline[colIdx] ? currentline[colIdx].trim() : '';
        });

        if (!obj.ItemName) {
          isValid = false;
          errorReason = 'Missing ItemName';
        }

        obj.__isValid = isValid;
        obj.__errorReason = errorReason || 'Valid';
        rows.push(obj);
      }
      setParsedRows(rows);
    };
    reader.readAsText(file);
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
      title="Purchase Item Entry CSV Upload"
      maxWidth="680px"
    >
      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit} className="py-1">
        <div className="form-grid-2">

          {/* Sample Download Bar */}
          <div className="form-field form-span-2">
            <div className="flex justify-between items-center bg-amber-50/80 p-3 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <FaFileCsv className="text-amber-700 text-base" />
                <span className="font-bold text-slate-800 text-xs">Bulk Item Entry CSV Spreadsheet</span>
              </div>
              <button
                type="button"
                onClick={handleDownloadSample}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <FaDownload size={11} /> Download Sample Template
              </button>
            </div>
          </div>

          {/* File Upload Field */}
          <div className="form-field form-span-2">
            <label className="form-label">
              Upload CSV File <span className="text-red-500">*</span>
            </label>
            
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
              onClick={() => document.getElementById('itemCsvFileInputModal').click()}
              className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                dragActive ? 'border-teal-600 bg-teal-50/50' : 'border-slate-300 hover:border-teal-600 bg-slate-50/50'
              }`}
            >
              <input
                id="itemCsvFileInputModal"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) handleFileUpload(e.target.files[0]); }}
              />
              <FaCloudUploadAlt className="text-3xl text-[#418A8B]" />
              <p className="font-bold text-slate-700 text-xs text-center">
                {fileName ? `Selected File: ${fileName}` : 'Drag & Drop .CSV file here or click to browse'}
              </p>
              <span className="text-[10px] text-slate-400">Supported format: Comma Separated (.CSV)</span>
            </div>
          </div>

          {/* Parsed Preview Section */}
          {parsedRows.length > 0 && (
            <div className="form-field form-span-2">
              <div className="flex justify-between items-center bg-slate-100/70 p-2.5 rounded-lg border border-slate-200 text-xs font-bold mb-2">
                <span className="text-slate-700">Parsed Data ({parsedRows.length} Rows)</span>
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
                      <th className="p-2">Item Name</th>
                      <th className="p-2">Unit</th>
                      <th className="p-2">Category</th>
                      <th className="p-2">Group</th>
                      <th className="p-2">Remarks</th>
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
                        <td className="p-2 font-bold text-slate-800">{r.ItemName || '—'}</td>
                        <td className="p-2 text-slate-600">{r.Unit || '—'}</td>
                        <td className="p-2 text-slate-600">{r.ItemCategory || '—'}</td>
                        <td className="p-2 text-slate-600">{r.ItemGroup || '—'}</td>
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
          saveText={validCount > 0 ? `Import ${validCount} Items` : 'Import Items'}
          saveDisabled={validCount === 0}
        />
      </form>
    </CommonModal>
  );
};

export default CSVUploadForm;
