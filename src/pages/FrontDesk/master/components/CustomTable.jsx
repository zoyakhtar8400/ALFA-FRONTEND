import React, { useState, useMemo } from 'react';
import { Box, Button, Checkbox, TextField, Select, MenuItem, Typography, IconButton, Paper, TableContainer, Table as MuiTable, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { FaFileExport, FaPrint, FaSearch, FaEdit, FaTrash, FaSync } from 'react-icons/fa';
import PageHeader from '../../../../components/common/PageHeader';
import Pagination from './Pagination';

const CustomTable = ({
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
  statusFilterKey = 'active', // default key to filter active/inactive
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(defaultEntriesPerPage);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [refreshKey, setRefreshKey] = useState(0); // Dummy state to simulate refresh

  // Reset page when search or filters change
  React.useEffect(() => {
    setCurrentPage(1);
    setSelectedRows(new Set());
  }, [searchTerm, statusFilter, entriesPerPage, refreshKey]);

  // Handle Export to CSV
  const handleExportCSV = () => {
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
  };

  // Handle Print
  const handlePrint = () => {
    window.print();
  };

  // Handle Refresh
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    showToast('Data refreshed.');
  };

  // Handle Sorting
  const handleSort = (key, sortable) => {
    if (!sortable) return;
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(key);
      setSortDirection('asc');
    }
  };

  // Handle Selection
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const pageRowIds = currentEntries.map(r => r.id);
      setSelectedRows(new Set([...selectedRows, ...pageRowIds]));
    } else {
      const pageRowIds = currentEntries.map(r => r.id);
      const newSelection = new Set(selectedRows);
      pageRowIds.forEach(id => newSelection.delete(id));
      setSelectedRows(newSelection);
    }
  };

  const handleSelectRow = (id) => {
    const newSelection = new Set(selectedRows);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedRows(newSelection);
  };

  // Process data (Search, Status Filter, Sort)
  const processedData = useMemo(() => {
    let result = [...data];

    // 1. Status Filter
    if (statusFilter !== 'All') {
      result = result.filter(row => {
        const val = String(row[statusFilterKey] || row['status'] || row['active'] || '').toLowerCase();
        if (statusFilter === 'Active') {
          return val === 'yes' || val === 'active';
        } else {
          return val === 'no' || val === 'inactive';
        }
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

  // Pagination Slice
  const totalEntries = processedData.length;
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = processedData.slice(indexOfFirstEntry, indexOfLastEntry);

  const isAllPageRowsSelected = currentEntries.length > 0 && currentEntries.every(r => selectedRows.has(r.id));

  return (
    <Box sx={{ width: '100%' }}>
      {/* Print-Only Header (Hidden on screen, visible on print) */}
      <Box className="print-only print-header-container">
        <img src="/logo/hotel-logo.png" alt="Company Logo" className="print-logo" />
        <h1 className="print-company-name">ALFA HOTEL MANAGEMENT SYSTEM</h1>
        <h2 className="print-report-title">{title}</h2>
        <div className="print-date-time">
          Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </div>
      </Box>

      {/* Page Header (with Breadcrumbs, Title, Back and Print Buttons) */}
      <PageHeader
        title={title}
        breadcrumbs={breadcrumbs.length > 0 ? breadcrumbs : ['Dashboard', 'Front Desk', title]}
        showPrint
        onPrint={handlePrint}
      />

      {/* Filters and Actions Toolbar */}
      <Box
        className="no-print"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          padding: '18px 24px',
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderBottom: 'none',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Left Filter Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          {/* Search box */}
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: <FaSearch size={12} style={{ color: 'var(--text-secondary)', marginRight: 8 }} />
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                backgroundColor: 'var(--background)',
                fontSize: '0.85rem',
                width: '220px',
                transition: 'var(--transition)',
                '&:hover fieldset': { borderColor: 'var(--primary)' },
                '&.Mui-focused fieldset': { borderColor: 'var(--primary)' },
                '&.Mui-focused': { width: '280px', backgroundColor: '#ffffff' }
              }
            }}
          />

          {/* Status Filter */}
          <Select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{
              borderRadius: '20px',
              backgroundColor: 'var(--background)',
              fontSize: '0.85rem',
              fontWeight: 600,
              minWidth: '120px',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--border)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--primary)' }
            }}
          >
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select>
        </Box>

        {/* Right Action buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={handleRefresh}
            startIcon={<FaSync size={12} />}
            sx={{
              borderRadius: '20px',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              '&:hover': {
                borderColor: 'var(--primary)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)'
              }
            }}
          >
            Refresh
          </Button>

          <Button
            variant="outlined"
            onClick={handleExportCSV}
            startIcon={<FaFileExport size={12} />}
            sx={{
              borderRadius: '20px',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              '&:hover': {
                borderColor: 'var(--primary)',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)'
              }
            }}
          >
            Export
          </Button>

          {onAddEntry && (
            <Button
              variant="contained"
              disableElevation
              onClick={onAddEntry}
              sx={{
                borderRadius: '20px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                padding: '8px 20px',
                '&:hover': {
                  backgroundColor: 'var(--primary-hover)'
                }
              }}
            >
              {addEntryLabel}
            </Button>
          )}
        </Box>
      </Box>

      {/* Main Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 0,
          border: '1px solid var(--border)',
          borderBottomLeftRadius: totalEntries <= entriesPerPage ? '16px' : 0,
          borderBottomRightRadius: totalEntries <= entriesPerPage ? '16px' : 0,
          boxShadow: 'var(--shadow-md)',
          backgroundColor: 'var(--surface)',
        }}
      >
        <MuiTable className="custom-table" size="medium">
          <TableHead>
            <TableRow>
              {/* Checkbox column */}
              {/* <TableCell className="no-print" padding="checkbox" sx={{ width: '50px' }}>
                <Checkbox
                  checked={isAllPageRowsSelected}
                  onChange={handleSelectAll}
                  size="small"
                  sx={{
                    color: 'var(--border)',
                    '&.Mui-checked': { color: 'var(--primary)' }
                  }}
                />
              </TableCell> */}

              <TableCell style={{ width: '70px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--dark)' }}>S.No</TableCell>

              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  onClick={() => handleSort(col.key, col.sortable !== false)}
                  className={col.key === 'action' ? 'action-column' : ''}
                  style={{
                    cursor: col.sortable !== false ? 'pointer' : 'default',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--dark)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {col.label}
                    {col.sortable !== false && sortColumn === col.key && (
                      <span style={{ fontSize: '10px', opacity: 0.7 }}>
                        {sortDirection === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {currentEntries.length > 0 ? (
              currentEntries.map((row, index) => {
                const isSelected = selectedRows.has(row.id);
                return (
                  <TableRow
                    key={row.id}
                    hover
                    selected={isSelected}
                    onClick={() => handleSelectRow(row.id)}
                    sx={{ cursor: 'pointer' }}
                  >
                    {/* Checkbox column */}
                    {/* <TableCell className="no-print" padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectRow(row.id)}
                        onClick={(e) => e.stopPropagation()}
                        size="small"
                        sx={{
                          color: 'var(--border)',
                          '&.Mui-checked': { color: 'var(--primary)' }
                        }}
                      />
                    </TableCell> */}

                    <TableCell style={{ fontWeight: 600 }}>{indexOfFirstEntry + index + 1}</TableCell>

                    {columns.map((col) => {
                      if (col.key === 'action') {
                        return (
                          <TableCell key={col.key} className="action-column" onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {actions.map((act, actIdx) => {
                                const isDelete = act.isDanger || act.label.toLowerCase() === 'delete';
                                const IconComponent = act.icon || (act.label.toLowerCase() === 'edit' ? <FaEdit size={13} /> : <FaTrash size={13} />);
                                return (
                                  <IconButton
                                    key={actIdx}
                                    onClick={(e) => { e.stopPropagation(); act.onClick(row); }}
                                    sx={{
                                      width: '32px',
                                      height: '32px',
                                      color: isDelete ? 'var(--danger)' : 'var(--primary)',
                                      backgroundColor: isDelete ? 'var(--danger-light)' : 'var(--primary-light)',
                                      '&:hover': {
                                        color: '#ffffff',
                                        backgroundColor: isDelete ? 'var(--danger)' : 'var(--primary)',
                                        transform: 'scale(1.05)'
                                      },
                                      transition: 'var(--transition)'
                                    }}
                                    title={act.label}
                                  >
                                    {IconComponent}
                                  </IconButton>
                                );
                              })}
                            </div>
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell key={col.key}>
                          {col.render ? col.render(row[col.key], row) : row[col.key]}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 2} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  No matching records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>

      {/* Pagination Footer */}
      {totalEntries > 0 && (
        <Pagination
          totalItems={totalEntries}
          itemsPerPage={entriesPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setEntriesPerPage}
        />
      )}

      {/* Print-Only Footer (Hidden on screen, visible on print) */}
      <Box className="print-only print-footer-container">
        Generated by ALFA Hotel Management System
      </Box>
    </Box>
  );
};

export default CustomTable;
