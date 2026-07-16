import React, { useState, useMemo } from 'react';
import PageHeader from '../../../components/common/PageHeader';
import { FaFilePdf, FaFileExcel, FaPrint, FaArrowLeft, FaFilter, FaSync } from 'react-icons/fa';
import CommonSearch from '../../../components/common/CommonSearch';
import { exportPDF } from '../../../utils/exportPDF';
import { exportExcel } from '../../../utils/exportExcel';
import { handlePrint } from '../../../utils/printUtil';
import { PrintHeader } from '../../../components/common/PrintComponent';

const GenericReportViewer = ({ report, onBack, showToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredData = useMemo(() => {
    let rows = report.data || [];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(q)
        )
      );
    }
    return rows;
  }, [report.data, searchQuery]);

  const handlePrintClick = () => {
    handlePrint();
    if (showToast) showToast('Report sent to print!', 'success');
  };

  const handlePDF = () => {
    exportPDF(report.name, report.columns, filteredData);
    if (showToast) showToast('Exporting PDF...', 'info');
  };

  const handleExcel = () => {
    exportExcel(report.name, report.columns, filteredData);
    if (showToast) showToast('Exporting Excel...', 'info');
  };

  return (
    <div className="reports-layout" style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: 'var(--font-family, system-ui)' }}>
      <PrintHeader title={report.name} />
      
      {/* Header - Hidden during A4 Print */}
      <div className="no-print">
        <PageHeader
          title={report.name}
          breadcrumbs={['Dashboard', 'POS', 'Reports', report.name]}
          showBack
          onBack={onBack}
          style={{ marginBottom: '4px' }}
        />
        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
          {report.desc}
        </div>
      </div>

      {/* KPIs Summary Cards - Hidden during A4 Print */}
      {report.kpis && report.kpis.length > 0 && (
        <div className="no-print" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {report.kpis.map((kpi, idx) => (
            <div key={idx} style={{
              background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px',
              padding: '12px 20px', minWidth: '150px', flex: '1 0 150px',
              boxShadow: '0 2px 8px -3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{kpi.label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{kpi.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar / Filters - Hidden during A4 Print */}
      <div className="no-print" style={{
        background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px',
        padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px', boxShadow: '0 2px 8px -3px rgba(0,0,0,0.05)'
      }}>
        {/* Left Side Filters */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>From:</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.76rem', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>To:</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ padding: '4px 8px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.76rem', outline: 'none' }} />
          </div>
          <button style={{ background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.76rem', fontWeight: 700, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <FaFilter size={10} /> Filter
          </button>
        </div>

        {/* Right Side Actions */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ width: '220px' }}>
            <CommonSearch value={searchQuery} onChange={handleSearchChange} placeholder="Search register..." />
          </div>
          <button onClick={handlePrintClick} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer' }}>
            <FaPrint /> Print
          </button>
          <button onClick={handlePDF} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer', color: '#dc2626' }}>
            <FaFilePdf /> PDF
          </button>
          <button onClick={handleExcel} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer', color: '#16a34a' }}>
            <FaFileExcel /> Excel
          </button>
        </div>
      </div>

      {/* Data Table Preview - Formatted for A4 Layout */}
      <div className="custom-table-container slide-up-item">
        <table className="custom-table-element" style={{ margin: 0 }}>
          <thead>
            <tr>
              {report.columns.map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((row, idx) => (
                <tr key={idx}>
                  {Object.keys(row).map((key, colIdx) => (
                    <td key={colIdx}>
                      {row[key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={report.columns.length} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                  No records matching the filter query.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(GenericReportViewer);
