import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { FaFileExport, FaEdit, FaTrash, FaSync, FaEye } from 'react-icons/fa';
import { handlePrint as globalHandlePrint } from '../../utils/printUtil';
import PageHeader from './PageHeader';
import CommonSearch from './CommonSearch';
import CommonPagination from './CommonPagination';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';
import { PrintHeader } from './PrintComponent';
import CommonActionToolbar from './CommonActionToolbar';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ColumnSelectionPrintModal from './ColumnSelectionPrintModal';

/**
 * TableRow component memoized using React.memo to prevent unnecessary row re-renders.
 */
const TableRow = React.memo(({
  row,
  index,
  indexOfFirstEntry,
  columns,
  actions,
  selectable,
  isSelected,
  onToggleSelect,
  rowId,
  hiddenPrintColKeys = []
}) => {
  return (
    <tr
      tabIndex={0}
      className={`focusable-row outline-none transition-colors ${isSelected ? 'bg-teal-50/70' : 'hover:bg-slate-50/80'}`}
      style={{
        borderBottom: '1px solid #f8fafc',
        backgroundColor: isSelected ? '#f0fdfa' : undefined
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          if (actions && actions.length > 0) {
            actions[0].onClick(row);
          }
        }
      }}
    >
      {selectable && (
        <td className="no-print" style={{ width: '44px', textAlign: 'center', padding: '14px 10px' }} onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={!!isSelected}
            onChange={() => onToggleSelect(rowId)}
            style={{
              width: '16px',
              height: '16px',
              cursor: 'pointer',
              accentColor: '#0d9488',
              borderRadius: '4px'
            }}
            aria-label={`Select row ${indexOfFirstEntry + index + 1}`}
          />
        </td>
      )}

      <td
        className={hiddenPrintColKeys?.includes('_sno') ? 'print-col-hide' : ''}
        style={{ textAlign: 'center', fontWeight: 700, padding: '14px 18px', fontSize: '13px', color: '#64748b' }}
      >
        {indexOfFirstEntry + index + 1}
      </td>

      {columns.map((col) => {
        if (col.key === 'action') {
          return (
            <td key={col.key} className="action-column no-print" style={{ padding: '14px 18px' }} onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                {actions && actions.map((act, actIdx) => {
                  if (typeof act.hide === 'function' && act.hide(row)) return null;
                  if (typeof act.show === 'function' && !act.show(row)) return null;
                  const isDelete = act.isDanger || act.label.toLowerCase() === 'delete';
                  const IconComponent = act.icon || (isDelete ? <FaTrash size={14} /> : <FaEdit size={14} />);
                  const href = act.getHref ? act.getHref(row) : null;
                  
                  if (href) {
                    return (
                      <a
                        key={actIdx}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`table-action-icon-btn ${isDelete ? 'delete' : 'edit'}`}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
                        title={act.label}
                      >
                        {IconComponent}
                      </a>
                    );
                  }

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

        const isHidden = hiddenPrintColKeys?.includes(col.key);

        // Apply StatusBadge if renderStatus is true
        if (col.renderStatus) {
          return (
            <td
              key={col.key}
              className={isHidden ? 'print-col-hide' : ''}
              style={{ padding: '14px 18px' }}
            >
              <StatusBadge value={row[col.key]} activeValue={col.activeValue} />
            </td>
          );
        }

        return (
          <td
            key={col.key}
            className={isHidden ? 'print-col-hide' : ''}
            style={{ padding: '14px 18px', fontSize: '13px', fontWeight: 600, color: '#334155' }}
          >
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
  showBack = true,
  onBack = null,
  outletFilter = 'All',
  setOutletFilter = null,
  outletsList = [],
  areaFilter = 'All',
  setAreaFilter = null,
  areasList = [],
  selectable = true,
  onBulkDelete = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(defaultEntriesPerPage);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [refreshKey, setRefreshKey] = useState(0);

  const [localLoading, setLocalLoading] = useState(false);

  // Selection states
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false);
  const selectAllCheckboxRef = useRef(null);

  const getRowId = useCallback((row, fallbackIndex) => {
    if (!row) return String(fallbackIndex);
    if (row.id !== undefined && row.id !== null) return String(row.id);
    if (row._id !== undefined && row._id !== null) return String(row._id);
    if (row.product_group_id !== undefined && row.product_group_id !== null) return String(row.product_group_id);
    if (row.category_refid !== undefined && row.category_refid !== null) return String(row.category_refid);
    if (row.table_id !== undefined && row.table_id !== null) return String(row.table_id);
    if (row.table_no !== undefined && row.table_no !== null) return `tbl_${row.table_no}`;
    if (row.item_id !== undefined && row.item_id !== null) return String(row.item_id);
    if (row.code !== undefined && row.code !== null) return `code_${row.code}`;
    if (row.name !== undefined && row.name !== null) return `name_${row.name}`;
    return String(fallbackIndex);
  }, []);

  // Clear selection when filters change
  useEffect(() => {
    setSelectedIds([]);
  }, [searchTerm, statusFilter, refreshKey, outletFilter, areaFilter]);

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

  // Print Column Selection state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [hiddenPrintColKeys, setHiddenPrintColKeys] = useState([]);

  const selectablePrintColumns = useMemo(() => {
    const dataCols = (effectiveColumns || columns || [])
      .filter(c => c.key !== 'action' && !c.isAction && (c.label || c.header || c.name))
      .map(c => ({
        key: c.key,
        label: c.label || c.header || c.name || c.key
      }));
    return [
      { key: '_sno', label: 'Sr. No. (#)' },
      ...dataCols
    ];
  }, [effectiveColumns, columns]);

  // Handle Print - Opens column selection modal
  const handlePrint = useCallback(() => {
    setIsPrintModalOpen(true);
  }, []);

  const handleConfirmPrint = useCallback((selectedKeys) => {
    const allKeys = selectablePrintColumns.map(c => c.key);
    const hidden = allKeys.filter(k => !selectedKeys.includes(k));
    setHiddenPrintColKeys(hidden);
    setIsPrintModalOpen(false);

    setTimeout(() => {
      globalHandlePrint();
    }, 150);
  }, [selectablePrintColumns]);

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

  const allProcessedIds = useMemo(() => {
    return processedData.map((row, idx) => getRowId(row, idx));
  }, [processedData, getRowId]);

  const isAllSelected = useMemo(() => {
    return allProcessedIds.length > 0 && selectedIds.length >= allProcessedIds.length;
  }, [allProcessedIds, selectedIds]);

  const isIndeterminate = useMemo(() => {
    return selectedIds.length > 0 && !isAllSelected;
  }, [selectedIds, isAllSelected]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleToggleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(allProcessedIds);
    }
  }, [isAllSelected, allProcessedIds]);

  const handleToggleRow = useCallback((rowId) => {
    setSelectedIds(prev =>
      prev.includes(rowId) ? prev.filter(id => id !== rowId) : [...prev, rowId]
    );
  }, []);

  const handleConfirmBulkDelete = async () => {
    const selectedRows = processedData.filter((row, idx) => selectedIds.includes(getRowId(row, idx)));
    const count = selectedIds.length;
    
    try {
      if (typeof onBulkDelete === 'function') {
        await onBulkDelete(selectedRows, selectedIds);
      } else {
        const deleteAction = actions.find(a => a.isDanger || (a.label && a.label.toLowerCase() === 'delete'));
        if (deleteAction) {
          if (typeof deleteAction.onBulkDelete === 'function') {
            await deleteAction.onBulkDelete(selectedRows, selectedIds);
          } else if (typeof deleteAction.onDelete === 'function') {
            for (const row of selectedRows) {
              await deleteAction.onDelete(row);
            }
          } else {
            console.warn('CommonTable: onBulkDelete handler not provided by parent component.');
          }
        }
      }
      showToast(`Deleted ${count} item(s) successfully.`);
    } catch (err) {
      console.error('Bulk delete error:', err);
      showToast(err?.response?.data?.message || err?.message || 'Error deleting selected items.');
    } finally {
      setSelectedIds([]);
      setBulkDeleteModalOpen(false);
    }
  };

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

          {outletsList && setOutletFilter && (
            <select
              value={outletFilter}
              onChange={(e) => setOutletFilter(e.target.value)}
              className="entries-select"
            >
              <option value="All">All Outlets</option>
              {outletsList.map(o => (
                <option key={o.store_id} value={o.store_id}>{o.store_name || o.name || o.store_id}</option>
              ))}
            </select>
          )}

          {areasList && setAreaFilter && (
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="entries-select"
            >
              <option value="All">All Areas</option>
              {areasList.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
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

      {/* Selection & Bulk Action Bar */}
      {selectable && selectedIds.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '10px',
          padding: '8px 16px',
          marginTop: '10px',
          marginBottom: '2px',
          boxShadow: '0 1px 3px rgba(239, 68, 68, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#dc2626',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '999px'
            }}>
              {selectedIds.length}
            </span>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#991b1b' }}>
              {isAllSelected
                ? `All ${selectedIds.length} records selected across all pages`
                : `${selectedIds.length} records selected`}
            </span>
            {!isAllSelected && allProcessedIds.length > selectedIds.length && (
              <button
                type="button"
                onClick={() => setSelectedIds(allProcessedIds)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#b91c1c',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  padding: '2px 6px'
                }}
                className="hover:text-red-950"
              >
                Select all {allProcessedIds.length} records across all pages
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
              className="hover:bg-slate-50"
            >
              Clear Selection
            </button>
            <button
              type="button"
              onClick={() => setBulkDeleteModalOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#dc2626',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(220, 38, 38, 0.2)'
              }}
              className="hover:bg-red-700"
            >
              <FaTrash size={11} />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

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
                {selectable && (
                  <th className="no-print" style={{ width: '44px', textAlign: 'center', padding: '13px 10px' }}>
                    <input
                      type="checkbox"
                      ref={selectAllCheckboxRef}
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        accentColor: '#0d9488',
                        borderRadius: '4px'
                      }}
                      title="Select all records across all pages"
                      aria-label="Select all records across all pages"
                    />
                  </th>
                )}
                <th
                  className={hiddenPrintColKeys.includes('_sno') ? 'print-col-hide' : ''}
                  style={{ width: '50px', textAlign: 'center', padding: '13px 18px', fontSize: '12px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                >
                  #
                </th>
                {effectiveColumns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key, col.sortable !== false)}
                    className={`${col.sortable !== false ? 'cursor-pointer select-none' : ''} ${col.key === 'action' ? 'action-column no-print' : ''} ${hiddenPrintColKeys.includes(col.key) ? 'print-col-hide' : ''}`.trim()}
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
              {currentEntries.map((row, index) => {
                const rowId = getRowId(row, indexOfFirstEntry + index);
                const isSelected = selectedIds.includes(rowId);
                return (
                  <TableRow
                    key={rowId}
                    row={row}
                    index={index}
                    indexOfFirstEntry={indexOfFirstEntry}
                    columns={effectiveColumns}
                    actions={actions}
                    selectable={selectable}
                    isSelected={isSelected}
                    onToggleSelect={handleToggleRow}
                    rowId={rowId}
                    hiddenPrintColKeys={hiddenPrintColKeys}
                  />
                );
              })}
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

      {/* Built-in Delete Confirmation Modal for Bulk Delete */}
      <DeleteConfirmationModal
        isOpen={bulkDeleteModalOpen}
        onClose={() => setBulkDeleteModalOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        itemName={`${selectedIds.length} selected record(s)`}
        message={`Are you sure you want to delete ${selectedIds.length} selected record(s)? This action cannot be undone.`}
      />

      {/* Universal Column Selection Print Modal */}
      <ColumnSelectionPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        columns={selectablePrintColumns}
        onPrint={handleConfirmPrint}
        title={`Print Columns - ${title || 'Records'}`}
      />
    </div>
  );
};

export default CommonTable;
