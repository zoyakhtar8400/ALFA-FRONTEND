import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FaFileExport, FaEdit, FaTrash, FaSync, FaEye } from 'react-icons/fa';
import PageHeader from './PageHeader';
import CommonSearch from './CommonSearch';
import CommonPagination from './CommonPagination';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';
import { PrintHeader } from './PrintComponent';
import CommonActionToolbar from './CommonActionToolbar';

/**
 * TableRow component memoized using React.memo to prevent unnecessary row re-renders.
 */
const TableRow = React.memo(({ row, index, indexOfFirstEntry, columns, actions }) => {
  return (
    <tr
      tabIndex={0}
      className="focusable-row outline-none transition-colors hover:bg-slate-50/80"
      style={{ borderBottom: '1px solid #f8fafc' }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          if (actions && actions.length > 0) {
            actions[0].onClick(row);
          }
        }
      }}
    >
      <td style={{ textAlign: 'center', fontWeight: 700, padding: '14px 18px', fontSize: '13px', color: '#64748b' }}>
        {indexOfFirstEntry + index + 1}
      </td>

      {columns.map((col) => {
        if (col.key === 'action') {
          return (
            <td key={col.key} className="action-column" style={{ padding: '14px 18px' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                {actions && actions.map((act, actIdx) => {
                  const isDelete = act.isDanger || act.label.toLowerCase() === 'delete';
                  const IconComponent = act.icon || (isDelete ? <FaTrash size={14} /> : <FaEdit size={14} />);
                  return (
                    <button
                      key={actIdx}
                      onClick={(e) => { e.stopPropagation(); act.onClick(row); }}
                      className={`table-action-icon-btn ${isDelete ? 'delete' : 'edit'}`}
                      title={act.label}
                    >
                      {IconComponent}
                    </button>
                  );
                })}
              </div>
            </td>
          );
        }

        // Apply StatusBadge if renderStatus is true
        if (col.renderStatus) {
          return (
            <td key={col.key} style={{ padding: '14px 18px' }}>
              <StatusBadge value={row[col.key]} activeValue={col.activeValue} />
            </td>
          );
        }

        return (
          <td key={col.key} style={{ padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
            {col.render ? col.render(row[col.key], row) : row[col.key]}
          </td>
        );
      })}
    </tr>
  );
});

/**
 * CommonTable component to manage master registrations with search, sorting, pagination,
 * dynamic status badges, custom renderers, printing headers/footers, and styling actions.
 */
const CommonTable = ({
  title = '',
  columns = [],
  data = [],
  actions = [], // list of { label: 'Edit', onClick: (row) => {}, isDanger: false }
  onAddEntry = null,
  addEntryLabel = '+ Add Entry',
  searchPlaceholder = 'Search...',
  defaultEntriesPerPage = 10,
  showToast = () => { },
  breadcrumbs = [],
  statusFilterKey = 'active',
  isLoading = false,
  onlyTable = false,
  emptyMessage = 'No matching records found',
  extraButtons = [],
  showBack = false,
  onBack = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(defaultEntriesPerPage);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [refreshKey, setRefreshKey] = useState(0);

  const [localLoading, setLocalLoading] = useState(false);

  // Automatically append Action column if actions are provided but no 'action' key exists in columns
  const effectiveColumns = useMemo(() => {
    const hasAction = columns.some(c => c.key === 'action');
    if (!hasAction && actions && actions.length > 0) {
      return [...columns, { key: 'action', label: 'Action', sortable: false }];
    }
    return columns;
  }, [columns, actions]);

  // Filter, Sort, and Paginate Data
  const processedData = useMemo(() => {
    let result = [...data];

    // Status Filtering
    if (statusFilter !== 'All') {
      result = result.filter(item => {
        const val = item[statusFilterKey];
        if (!val) return false;
        return String(val).toLowerCase() === statusFilter.toLowerCase();
      });
    }

    // Search Term Filtering across all values
    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase().trim();
      result = result.filter(item => {
        return Object.values(item).some(val => {
          if (val === null || val === undefined) return false;
          if (typeof val === 'object') return JSON.stringify(val).toLowerCase().includes(lowerSearch);
          return String(val).toLowerCase().includes(lowerSearch);
        });
      });
    }

    // Sorting
    if (sortColumn) {
      result.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();

        if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, statusFilter, sortColumn, sortDirection, statusFilterKey]);

  // Simulated loading simulation for 400ms on interaction changes
  useEffect(() => {
    setLocalLoading(true);
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, currentPage, entriesPerPage, sortColumn, sortDirection, refreshKey]);

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, entriesPerPage, refreshKey]);

  // Handle Export to Excel (.xls formatted XML/HTML with centered colored headers)
  const handleExportExcel = useCallback(() => {
    if (data.length === 0) {
      showToast('No data to export.');
      return;
    }
    const exportColumns = columns.filter(col => col.key !== 'action');
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN') + ' ' + now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const totalCols = exportColumns.length + 1;

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]>
        <xml>
          <x:ExcelWorkbook>
            <x:ExcelWorksheets>
              <x:ExcelWorksheet>
                <x:Name>${(title || 'Export').substring(0, 31)}</x:Name>
                <x:WorksheetOptions>
                  <x:DisplayGridlines/>
                </x:WorksheetOptions>
              </x:ExcelWorksheet>
            </x:ExcelWorksheets>
          </x:ExcelWorkbook>
        </xml>
        <![endif]-->
        <style>
          body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; margin: 0; padding: 0; }
          .title-header { text-align: center; font-size: 16pt; font-weight: bold; color: #0e7490; padding: 4px 0; }
          .subtitle-header { text-align: center; font-size: 12pt; font-weight: bold; color: #334155; padding: 2px 0; }
          .meta-header { text-align: center; font-size: 9pt; color: #64748b; padding: 2px 0; }
          table { border-collapse: collapse; width: 100%; margin: 0; padding: 0; }
          th { background-color: #0e7490; color: #ffffff; font-weight: bold; text-align: center; padding: 6px 10px; border: 1px solid #0891b2; font-size: 10.5pt; }
          td { padding: 5px 8px; border: 1px solid #cbd5e1; font-size: 10pt; color: #1e293b; vertical-align: middle; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
        </style>
      </head>
      <body style="margin:0; padding:0;">
        <table border="0" style="margin:0; padding:0; border-collapse:collapse;">
          <tr>
            <td colspan="${totalCols}" align="center" style="border:none; text-align:center; font-size:16pt; font-weight:bold; color:#0e7490; padding:4px 0;">
              ALFA HMS - Hotel & Restaurant Management System
            </td>
          </tr>
          <tr>
            <td colspan="${totalCols}" align="center" style="border:none; text-align:center; font-size:12pt; font-weight:bold; color:#334155; padding:2px 0;">
              ${title || 'Export Report'}
            </td>
          </tr>
          <tr>
            <td colspan="${totalCols}" align="center" style="border:none; text-align:center; font-size:9pt; color:#64748b; padding:2px 0 8px 0;">
              Generated Date: ${formattedDate} | Total Records: ${processedData.length}
            </td>
          </tr>
        </table>

        <table border="1" style="margin:0; padding:0; border-collapse:collapse; width:100%;">
          <thead>
            <tr>
              <th style="background-color:#0e7490; color:#ffffff; font-weight:bold; text-align:center; border:1px solid #0891b2;">#</th>
              ${exportColumns.map(col => `<th style="background-color:#0e7490; color:#ffffff; font-weight:bold; text-align:center; border:1px solid #0891b2;">${col.label}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${processedData.map((row, idx) => `
              <tr style="${idx % 2 === 1 ? 'background-color: #f8fafc;' : 'background-color: #ffffff;'}">
                <td style="text-align: center; font-weight: bold; border: 1px solid #cbd5e1;">${idx + 1}</td>
                ${exportColumns.map(col => {
      let val = row[col.key];
      let valStr = '';
      let alignClass = 'text-left';

      if (val === undefined || val === null) {
        valStr = '';
      } else if (typeof val === 'object') {
        valStr = Object.entries(val)
          .filter(([, p]) => p !== '' && p !== undefined && p !== null)
          .map(([k, p]) => `${k}: ₹${p}`)
          .join(' | ');
      } else {
        valStr = String(val);
        if (col.key === 'price' || col.key === 'amount' || col.key === 'rate') {
          alignClass = 'text-right';
        } else if (col.key === 'active' || col.key === 'status' || col.key === 'shortCode' || col.key === 'roomNo') {
          alignClass = 'text-center';
        }
      }

      return `<td style="border: 1px solid #cbd5e1;" class="${alignClass}">${valStr}</td>`;
    }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\uFEFF' + htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `alfa_hms_${(title || 'report').toLowerCase().replace(/\s+/g, '_')}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Exported ALFA HMS Excel Report successfully!');
  }, [data, columns, title, showToast, processedData]);

  // Handle Print
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Handle Refresh
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    showToast('Data refreshed.');
  }, [showToast]);

  // Handle Sorting
  const handleSort = useCallback((key, sortable) => {
    if (!sortable) return;
    setSortColumn(prevCol => {
      if (prevCol === key) {
        setSortDirection(prevDir => (prevDir === 'asc' ? 'desc' : 'asc'));
        return key;
      }
      setSortDirection('asc');
      return key;
    });
  }, []);

  // Pagination Slice
  const totalEntries = processedData.length;
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = processedData.slice(indexOfFirstEntry, indexOfLastEntry);

  const isTableLoading = isLoading || localLoading;

  return (
    <div className="w-full flex flex-col">
      {/* Print-Only Header */}
      <PrintHeader title={title} />

      {/* Page Header */}
      {!onlyTable && (
        <PageHeader
          title={title}
          breadcrumbs={breadcrumbs.length > 0 ? breadcrumbs : ['Dashboard', 'Front Desk', title]}
          showPrint
          onPrint={handlePrint}
          showBack={showBack}
          onBack={onBack}
        />
      )}

      {/* Controls Bar */}
      <div className="no-print table-header-controls flex flex-wrap justify-between items-center gap-4">
        {/* Left Filter Actions */}
        <div className="table-left-controls flex flex-wrap gap-4 items-center">
          <CommonSearch
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
          />

          {!onlyTable && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="entries-select"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          )}
        </div>

        {/* Right Action buttons */}
        {!onlyTable && (
          <div className="table-right-controls flex items-center gap-3">
            <CommonActionToolbar
              onAdd={onAddEntry}
              addLabel={addEntryLabel.replace(/^\+\s*/, '')}
              onExcel={handleExportExcel}
              onRefresh={handleRefresh}
              customActions={extraButtons}
            />
          </div>
        )}
      </div>

      {/* Table Container styled identical to View KOT list */}
      <div style={{ position: 'relative', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflowX: 'auto', overflowY: 'visible', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginTop: '12px', minHeight: '180px', WebkitOverflowScrolling: 'touch' }}>
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes commonTableSpin {
              to { transform: rotate(360deg); }
            }
          `
        }} />

        {isTableLoading && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.75)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20,
            backdropFilter: 'blur(1.5px)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px', height: '36px', border: '3.5px solid #e2e8f0',
                borderTopColor: '#0e7490', borderRadius: '50%',
                animation: 'commonTableSpin 0.8s linear infinite'
              }} />
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                Loading Data...
              </span>
            </div>
          </div>
        )}

        {processedData.length === 0 && !isTableLoading ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                <th style={{ width: '50px', textAlign: 'center', padding: '13px 18px', fontSize: '12px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>#</th>
                {effectiveColumns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key, col.sortable !== false)}
                    className={col.sortable !== false ? 'cursor-pointer select-none' : ''}
                    style={{ padding: '13px 18px', fontSize: '12px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      {col.sortable !== false && sortColumn === col.key && (
                        <span className="text-xs text-slate-500">
                          {sortDirection === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentEntries.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  row={row}
                  index={index}
                  indexOfFirstEntry={indexOfFirstEntry}
                  columns={effectiveColumns}
                  actions={actions}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {!onlyTable && (
        <CommonPagination
          currentPage={currentPage}
          totalItems={totalEntries ?? processedData.length}
          itemsPerPage={entriesPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setEntriesPerPage}
        />
      )}
    </div>
  );
};

export default CommonTable;
