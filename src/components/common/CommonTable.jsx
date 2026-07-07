import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FaFileExport, FaEdit, FaTrash, FaSync } from 'react-icons/fa';
import PageHeader from './PageHeader';
import CommonSearch from './CommonSearch';
import CommonPagination from './CommonPagination';
import StatusBadge from './StatusBadge';
import EmptyState from './EmptyState';
import { PrintHeader, PrintFooter } from './PrintComponent';

/**
 * TableRow component memoized using React.memo to prevent unnecessary row re-renders.
 */
const TableRow = React.memo(({ row, index, indexOfFirstEntry, columns, actions }) => {
  return (
    <tr 
      tabIndex={0}
      className="focusable-row focus:bg-slate-50 outline-none"
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          if (actions && actions.length > 0) {
            actions[0].onClick(row);
          }
        }
      }}
    >
      <td style={{ textAlign: 'center', fontWeight: 600 }}>
        {indexOfFirstEntry + index + 1}
      </td>

      {columns.map((col) => {
        if (col.key === 'action') {
          return (
            <td key={col.key} className="action-column" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                {actions.map((act, actIdx) => {
                  const isDelete = act.isDanger || act.label.toLowerCase() === 'delete';
                  const IconComponent = act.icon || (act.label.toLowerCase() === 'edit' ? <FaEdit size={13} /> : <FaTrash size={13} />);
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
            <td key={col.key}>
              <StatusBadge value={row[col.key]} activeValue={col.activeValue} />
            </td>
          );
        }

        return (
          <td key={col.key}>
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
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(defaultEntriesPerPage);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [refreshKey, setRefreshKey] = useState(0);
  const [localLoading, setLocalLoading] = useState(true);

  // Process data (Search, Status Filter, Sort)
  const processedData = useMemo(() => {
    let result = [...data];
    const _force = refreshKey;

    // 1. Status Filter
    if (statusFilter !== 'All') {
      result = result.filter(row => {
        const val = String(row[statusFilterKey] || row['status'] || row['active'] || '').toLowerCase();
        return val === statusFilter.toLowerCase();
      });
    }

    // 2. Search Filter
    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(row => {
        return columns.some(col => {
          if (col.key === 'action') return false;
          const val = row[col.key];
          if (val === undefined || val === null) return false;
          return String(val).toLowerCase().includes(lowerSearch);
        });
      });
    }

    // 3. Sorting
    if (sortColumn) {
      const column = columns.find(c => c.key === sortColumn);
      result.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];
        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();

        const numA = parseFloat(valA.replace(/[^\d.-]/g, ''));
        const numB = parseFloat(valB.replace(/[^\d.-]/g, ''));
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDirection === 'asc' ? numA - numB : numB - numA;
        }
        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, statusFilter, sortColumn, sortDirection, columns, refreshKey, statusFilterKey]);

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

  // Handle Export to CSV
  const handleExportCSV = useCallback(() => {
    if (data.length === 0) {
      showToast('No data to export.');
      return;
    }
    const exportColumns = columns.filter(col => col.key !== 'action');
    const headersLine = exportColumns.map(col => `"${col.label.replace(/"/g, '""')}"`).join(',');
    const rowsLines = processedData.map(row =>
      exportColumns.map(col => {
        let val = row[col.key];
        if (val === undefined || val === null) val = '';
        const valStr = typeof val === 'object' ? '' : String(val);
        return `"${valStr.replace(/"/g, '""')}"`;
      }).join(',')
    );

    const csvContent = "data:text/csv;charset=utf-8," + [headersLine, ...rowsLines].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${(title || 'report').toLowerCase().replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV file successfully!');
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
            <button
              onClick={handleRefresh}
              className="btn-secondary"
            >
              <FaSync size={11} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="btn-secondary"
            >
              <FaFileExport size={11} />
              <span>Export</span>
            </button>

            {onAddEntry && (
              <button
                onClick={onAddEntry}
                className="btn-primary"
              >
                {addEntryLabel}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Table Content */}
      <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '70px', textAlign: 'center' }}>S.No</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key, col.sortable !== false)}
                  className={col.key === 'action' ? 'action-column' : ''}
                  style={{ cursor: col.sortable !== false ? 'pointer' : 'default' }}
                >
                  <div className="flex items-center gap-1.5 justify-start">
                    <span>{col.label}</span>
                    {col.sortable !== false && sortColumn === col.key && (
                      <span className="text-[10px] opacity-70">
                        {sortDirection === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {isTableLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-0 border-none">
                  <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white w-full rounded-b-2xl" style={{ minHeight: '300px' }}>
                    <div className="spinner-container mb-4">
                      <div className="spinner-circle"></div>
                    </div>
                    <p className="text-sm font-bold text-[#244e5f]">Loading...</p>
                  </div>
                </td>
              </tr>
            ) : currentEntries.length > 0 ? (
              currentEntries.map((row, index) => (
                <TableRow
                  key={row.id || `row-${index}`}
                  row={row}
                  index={index}
                  indexOfFirstEntry={indexOfFirstEntry}
                  columns={columns}
                  actions={actions}
                />
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="p-0 border-none">
                  <EmptyState />
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalEntries > 0 && (
          <CommonPagination
            totalItems={totalEntries}
            itemsPerPage={entriesPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setEntriesPerPage}
            onlyTable={onlyTable}
          />
        )}
      </div>

      {/* Print-Only Footer */}
      <PrintFooter title={title} />
    </div>
  );
};

export default CommonTable;
