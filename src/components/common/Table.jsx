import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
   FaFileExport, 
   FaPrint, 
   FaSearch, 
   FaChevronLeft, 
   FaChevronRight,
   FaEdit,
   FaTrash
} from 'react-icons/fa';
import PrintStyles from './PrintStyles';
import { handlePrint } from '../../utils/printUtil';
import LoadingState from './LoadingState';

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
      <td style={{ textAlign: 'center', fontWeight: 600 }}>{indexOfFirstEntry + index + 1}</td>
      {columns.map((col) => {
        if (col.key === 'action') {
          return (
            <td key={col.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {actions.map((act, actIdx) => {
                  const isDelete = act.isDanger || act.label.toLowerCase() === 'delete';
                  const IconComponent = act.icon || (act.label.toLowerCase() === 'edit' ? <FaEdit size={14} /> : <FaTrash size={14} />);
                  return (
                    <button
                      key={actIdx}
                      className={`table-action-icon-btn ${isDelete ? 'delete' : 'edit'}`}
                      onClick={(e) => { e.stopPropagation(); act.onClick(row); }}
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
        return (
          <td key={col.key}>
            {col.render ? col.render(row[col.key], row) : row[col.key]}
          </td>
        );
      })}
    </tr>
  );
});

const Table = ({ 
  title = '', 
  columns = [], 
  data = [], 
  actions = [], // list of { label: 'Edit', onClick: (row) => {}, isDanger: false }
  onAddEntry = null, 
  addEntryLabel = 'Add Entry',
  searchPlaceholder = 'Search...',
  defaultEntriesPerPage = 10,
  showToast = () => {}
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(defaultEntriesPerPage);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [localLoading, setLocalLoading] = useState(true);

  // Process data (Search & Sort)
  const processedData = useMemo(() => {
    let result = [...data];

    // 1. Search Filter
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

    // 2. Sorting
    if (sortColumn) {
      const column = columns.find(c => c.key === sortColumn);
      result.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];
        
        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';
        
        // Convert to string for general comparison
        valA = String(valA).toLowerCase();
        valB = String(valB).toLowerCase();

        // Handle numeric sorting if applicable
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
  }, [data, searchTerm, sortColumn, sortDirection, columns]);

  // Simulated loading simulation for 400ms on interaction changes
  useEffect(() => {
    setLocalLoading(true);
    const timer = setTimeout(() => {
      setLocalLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, entriesPerPage, sortColumn, sortDirection]);

  // Reset page when search or entries count change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, entriesPerPage]);

  // Handle Export to CSV
  const handleExportCSV = useCallback(() => {
    if (data.length === 0) {
      showToast('No data to export.');
      return;
    }
    
    // Header row (exclude 'action' column)
    const exportColumns = columns.filter(col => col.key !== 'action');
    const headersLine = exportColumns.map(col => `"${col.label.replace(/"/g, '""')}"`).join(',');
    
    // Data rows
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
    link.setAttribute("download", `${(title || 'table').toLowerCase().replace(/\s+/g, '_')}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported CSV file successfully!');
  }, [data, columns, title, showToast, processedData]);

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
  const totalPages = Math.ceil(totalEntries / entriesPerPage);
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = processedData.slice(indexOfFirstEntry, indexOfLastEntry);

  const startEntryNum = totalEntries === 0 ? 0 : indexOfFirstEntry + 1;
  const endEntryNum = Math.min(indexOfLastEntry, totalEntries);

  return (
    <div className="dashboard-panel" style={{ gap: 0, padding: 0 }}>
      <PrintStyles />
      
      {/* Print Header - Hidden on screen, visible on print */}
      <div className="print-header" style={{ display: 'none' }}>
        <img src="/logo/alfa-logo.png" alt="Hotel Logo" className="print-logo-img" />
        <div className="print-title">{title}</div>
      </div>

      {/* Top Header */}
      <div className="table-header-controls">
        <div>
          <h3 className="panel-title">{title}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage and review your register entries.
          </p>
        </div>
        {onAddEntry && (
          <button
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              backgroundColor: 'var(--primary)', color: '#fff',
              padding: '10px 22px', borderRadius: '30px', border: 'none',
              fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(65,138,139,0.25)', transition: 'var(--transition)'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--primary)'}
            onClick={onAddEntry}
          >
            {addEntryLabel}
          </button>
        )}
      </div>

      {/* Controls Bar */}
      <div className="table-header-controls" style={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', backgroundColor: 'var(--background)' }}>
        <div className="table-left-controls">
          <div className="table-search-wrapper">
            <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Search:</span>
            <input
              type="text"
              className="table-search-input"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="entries-select-wrapper">
            <span>Show</span>
            <select className="entries-select" value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>
        </div>
        <div className="table-btn-group">
          <button className="table-btn-action" onClick={handleExportCSV}>
            <FaFileExport size={13} /><span>Export</span>
          </button>
          <button className="table-btn-action" onClick={handlePrint}>
            <FaPrint size={13} /><span>Print</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="custom-table-container" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none' }}>
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>S.No</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key, col.sortable !== false)}
                  style={{ cursor: col.sortable !== false ? 'pointer' : 'default' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {col.label}
                    {col.sortable !== false && sortColumn === col.key && (
                      <span style={{ fontSize: '10px', opacity: 0.7 }}>
                        {sortDirection === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {localLoading ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ padding: 0, border: 'none' }}>
                  <LoadingState message="Loading records..." />
                </td>
              </tr>
            ) : currentEntries.length > 0 ? (
              currentEntries.map((row, index) => (
                <TableRow
                  key={`table-row-${indexOfFirstEntry + index}`}
                  row={row}
                  index={index}
                  indexOfFirstEntry={indexOfFirstEntry}
                  columns={columns}
                  actions={actions}
                />
              ))
            ) : (
              <tr>
                <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  No matching records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="table-footer-controls">
        <div>
          Showing {startEntryNum} to {endEntryNum} of {totalEntries} entries
          {totalEntries < data.length && ` (filtered from ${data.length} total entries)`}
        </div>
        {totalPages > 1 && (
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <FaChevronLeft size={10} style={{ marginRight: '4px' }} /> Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                onClick={() => setCurrentPage(pageNum)}
              >
                {pageNum}
              </button>
            ))}
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next <FaChevronRight size={10} style={{ marginLeft: '4px' }} />
            </button>
          </div>
        )}
      </div>

      {/* Print Footer - Hidden on screen, visible on print */}
      <div className="print-footer" style={{ display: 'none' }}>
        Printed By: Admin on {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
      </div>

    </div>
  );
};

export default Table;
