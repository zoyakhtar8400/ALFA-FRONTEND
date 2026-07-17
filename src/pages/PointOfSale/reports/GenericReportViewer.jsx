import React, { useState, useMemo } from 'react';
import PageHeader from '../../../components/common/PageHeader';
import { FaFilePdf, FaFileExcel, FaPrint, FaArrowLeft, FaFilter, FaSync } from 'react-icons/fa';
import CommonSearch from '../../../components/common/CommonSearch';
import { exportPDF } from '../../../utils/exportPDF';
import { exportExcel } from '../../../utils/exportExcel';
import { handlePrint } from '../../../utils/printUtil';
import { PrintHeader } from '../../../components/common/PrintComponent';

const formatIndianCurrency = (num) => {
  const parsed = parseFloat(num);
  if (isNaN(parsed)) return '₹ 0.00';
  const parts = parsed.toFixed(2).split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherParts = parts[0].substring(0, parts[0].length - 3);
  if (otherParts !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInt = otherParts.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  return `₹ ${formattedInt}.${parts[1]}`;
};

const GenericReportViewer = ({ report, onBack, showToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState(
    (report.id === 'sales-register' || report.id === 'itemwise-sale' || report.id === 'itemwise-outletwise-sale' || report.id === 'itemwise-categorywise-sale' || report.id === 'tablewise-sale' || report.id === 'cover-analysis' || report.id === 'kitchen-time-gap' || report.id === 'stewardwise-sale' || report.id === 'tax-datawise-summary' || report.id === 'taxwise-summary' || report.id === 'kot-register' || report.id === 'nc-kot' || report.id === 'pending-kot-report' || report.id === 'cashier-settlement-summarized' || report.id === 'userwise-collection-report') ? '2026-04-01' : ''
  );
  const [dateTo, setDateTo] = useState(
    report.id === 'sales-register' ? '2026-04-10' :
    (report.id === 'itemwise-sale' || report.id === 'itemwise-outletwise-sale' || report.id === 'itemwise-categorywise-sale' || report.id === 'tablewise-sale' || report.id === 'cover-analysis' || report.id === 'kitchen-time-gap' || report.id === 'stewardwise-sale' || report.id === 'tax-datawise-summary' || report.id === 'taxwise-summary' || report.id === 'kot-register' || report.id === 'nc-kot' || report.id === 'pending-kot-report' || report.id === 'cashier-settlement-summarized' || report.id === 'userwise-collection-report') ? '2026-04-15' : ''
  );

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const parseRowDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const months = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
      const m = months[parts[1]];
      if (m !== undefined) {
        return new Date(parseInt(parts[2]), m, parseInt(parts[0]));
      }
    }
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const filteredData = useMemo(() => {
    let rows = report.data || [];
    
    // Filter by date range
    if (dateFrom || dateTo) {
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      if (fromDate) fromDate.setHours(0,0,0,0);
      const toDate = dateTo ? new Date(dateTo) : null;
      if (toDate) toDate.setHours(23,59,59,999);
      
      rows = rows.filter(row => {
        const dateColIdx = report.columns.findIndex(col => col.toLowerCase().includes('date'));
        if (dateColIdx !== -1) {
          const rawDateStr = row[`c${dateColIdx + 1}`];
          const rowDate = parseRowDate(rawDateStr);
          if (rowDate) {
            if (fromDate && rowDate < fromDate) return false;
            if (toDate && rowDate > toDate) return false;
          }
        }
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(row => 
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(q)
        )
      );
    }
    return rows;
  }, [report.data, searchQuery, dateFrom, dateTo, report.columns]);

  const printedOnStr = useMemo(() => {
    const now = new Date();
    const datePart = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const timePart = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${datePart} ${timePart}`;
  }, []);

  const handlePrintClick = () => {
    handlePrint();
    if (showToast) showToast('Report sent to print!', 'success');
  };

  const handlePDF = () => {
    const formatDateObj = (dStr) => {
      if (!dStr) return '';
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return dStr;
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
    };

    const filters = {
      dateFrom: formatDateObj(dateFrom) || ((report.id === 'sales-register' || report.id === 'itemwise-sale' || report.id === 'itemwise-outletwise-sale' || report.id === 'itemwise-categorywise-sale' || report.id === 'tablewise-sale' || report.id === 'cover-analysis' || report.id === 'kitchen-time-gap' || report.id === 'stewardwise-sale' || report.id === 'tax-datawise-summary' || report.id === 'taxwise-summary' || report.id === 'kot-register' || report.id === 'nc-kot' || report.id === 'pending-kot-report' || report.id === 'cashier-settlement-summarized' || report.id === 'userwise-collection-report') ? '01-Apr-2026' : ''),
      dateTo: formatDateObj(dateTo) || (report.id === 'sales-register' ? '10-Apr-2026' : (report.id === 'itemwise-sale' || report.id === 'itemwise-outletwise-sale' || report.id === 'itemwise-categorywise-sale' || report.id === 'tablewise-sale' || report.id === 'cover-analysis' || report.id === 'kitchen-time-gap' || report.id === 'stewardwise-sale' || report.id === 'tax-datawise-summary' || report.id === 'taxwise-summary' || report.id === 'kot-register' || report.id === 'nc-kot' || report.id === 'pending-kot-report' || report.id === 'cashier-settlement-summarized' || report.id === 'userwise-collection-report') ? '15-Apr-2026' : ''),
      outlet: 'All Outlets',
      user: 'Admin'
    };
    exportPDF(report.name, report.columns, filteredData, filters, printedOnStr);
    if (showToast) showToast('Exporting PDF...', 'info');
  };

  const handleExcel = () => {
    const filters = {
      startDate: dateFrom,
      endDate: dateTo,
      outlet: 'All Outlets',
      user: 'Admin'
    };
    exportExcel(report.name, report.columns, filteredData, filters, printedOnStr);
    if (showToast) showToast('Exporting Excel...', 'info');
  };

  const getColAlign = (colName) => {
    const name = colName.toLowerCase();
    if (name === 'date' || name === 'time' || name === 'sr no') return 'center';
    if (name.includes('amount') || name.includes('sale') || name.includes('tax') || name.includes('discount') || name.includes('net') || name.includes('subtotal')) return 'right';
    return 'left';
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
        <style>{`
          .custom-table-element td, .custom-table-element th {
            white-space: nowrap !important;
          }
        `}</style>
        <table className="custom-table-element" style={{ margin: 0 }}>
          <thead>
            <tr>
              {report.columns.map((col, idx) => (
                <th key={idx} style={{ textAlign: getColAlign(col) }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report.id === 'userwise-collection-report' ? (
              // Grouped table layout for User Wise Collection Report(Summary)
              (() => {
                const grouped = {};
                filteredData.forEach(row => {
                  const outlet = row.outlet || 'JAZZ BAR';
                  if (!grouped[outlet]) grouped[outlet] = [];
                  grouped[outlet].push(row);
                });

                const outlets = Object.keys(grouped).sort();
                if (outlets.length === 0) {
                  return (
                    <tr>
                      <td colSpan={report.columns.length} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        No records matching the filter query.
                      </td>
                    </tr>
                  );
                }

                let grandBill = 0;
                let grandCash = 0;
                let grandRoom = 0;
                let grandNet = 0;

                const outletBlocks = outlets.flatMap((outlet) => {
                  const rows = grouped[outlet];
                  let totBill = 0;
                  let totCash = 0;
                  let totRoom = 0;
                  let totNet = 0;

                  const detailRows = rows.map((row, idx) => {
                    totBill += row.rawBill || 0;
                    totCash += row.rawCash || 0;
                    totRoom += row.rawRoom || 0;
                    totNet += row.rawNet || 0;

                    grandBill += row.rawBill || 0;
                    grandCash += row.rawCash || 0;
                    grandRoom += row.rawRoom || 0;
                    grandNet += row.rawNet || 0;

                    return (
                      <tr key={`userw-row-${outlet}-${idx}`}>
                        <td style={{ paddingLeft: '12px' }}>{row.c1}</td>
                        <td style={{ textAlign: 'right' }}>{row.c2}</td>
                        <td style={{ textAlign: 'right' }}>{row.c3}</td>
                        <td style={{ textAlign: 'right' }}>{row.c4}</td>
                        <td style={{ textAlign: 'right' }}>{row.c5}</td>
                      </tr>
                    );
                  });

                  return [
                    <tr key={`userw-outlet-${outlet}`} style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                      <td colSpan={5} style={{ textAlign: 'left', padding: '8px 12px', color: '#1e293b' }}>Outlet : {outlet}</td>
                    </tr>,
                    ...detailRows,
                    <tr key={`userw-total-${outlet}`} style={{ fontWeight: 'bold', background: '#ffffff', borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1' }}>
                      <td style={{ textAlign: 'right', paddingRight: '12px', color: '#64748b' }}>Total :</td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}>{formatIndianCurrency(totBill)}</td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}>{totCash > 0 ? formatIndianCurrency(totCash) : ''}</td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}>{totRoom > 0 ? formatIndianCurrency(totRoom) : ''}</td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}>{totNet > 0 ? formatIndianCurrency(totNet) : ''}</td>
                    </tr>
                  ];
                });

                return [
                  ...outletBlocks,
                  <tr key={`userw-grand`} style={{ fontWeight: 'bold', background: '#e2e8f0', borderTop: '2px solid #475569', borderBottom: '2px solid #475569' }}>
                    <td style={{ textAlign: 'right', paddingRight: '12px', color: '#0f172a' }}>Grand Total :</td>
                    <td style={{ textAlign: 'right', color: '#0f172a' }}>{formatIndianCurrency(grandBill)}</td>
                    <td style={{ textAlign: 'right', color: '#0f172a' }}>{formatIndianCurrency(grandCash)}</td>
                    <td style={{ textAlign: 'right', color: '#0f172a' }}>{formatIndianCurrency(grandRoom)}</td>
                    <td style={{ textAlign: 'right', color: '#0f172a' }}>{formatIndianCurrency(grandNet)}</td>
                  </tr>
                ];
              })()
            ) : report.id === 'cashier-settlement-summarized' ? (
              // Grouped table layout for Cashier Settlement Report(Detailed)
              (() => {
                const grouped = {};
                filteredData.forEach(row => {
                  const outlet = row.outlet || 'JAZZ BAR';
                  if (!grouped[outlet]) grouped[outlet] = [];
                  grouped[outlet].push(row);
                });

                const outlets = Object.keys(grouped).sort();
                if (outlets.length === 0) {
                  return (
                    <tr>
                      <td colSpan={report.columns.length} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        No records matching the filter query.
                      </td>
                    </tr>
                  );
                }

                return outlets.flatMap((outlet) => {
                  const rows = grouped[outlet];
                  return [
                    <tr key={`cash-outlet-${outlet}`} style={{ background: '#cbd5e1', fontWeight: 'bold' }}>
                      <td colSpan={10} style={{ textAlign: 'left', padding: '8px 12px', color: '#1e293b' }}>Outlet : {outlet}</td>
                    </tr>,
                    ...rows.map((row, idx) => (
                      <tr key={`cash-row-${outlet}-${idx}`}>
                        <td style={{ textAlign: 'center' }}>{row.c1}</td>
                        <td style={{ textAlign: 'center' }}>{row.c2}</td>
                        <td style={{ textAlign: 'center' }}>{row.c3}</td>
                        <td style={{ textAlign: 'right' }}>{row.c4}</td>
                        <td style={{ textAlign: 'center' }}>{row.c5}</td>
                        <td style={{ paddingLeft: '12px' }}>{row.c6}</td>
                        <td style={{ textAlign: 'center' }}>{row.c7}</td>
                        <td style={{ paddingLeft: '12px' }}>{row.c8}</td>
                        <td style={{ textAlign: 'right' }}>{row.c9}</td>
                        <td style={{ paddingLeft: '12px' }}>{row.c10}</td>
                      </tr>
                    ))
                  ];
                });
              })()
            ) : report.id === 'pending-kot-report' ? (
              // Grouped table layout for Pending KOT
              (() => {
                const grouped = {};
                filteredData.forEach(row => {
                  const outlet = row.outlet || 'JAZZ BAR';
                  if (!grouped[outlet]) grouped[outlet] = [];
                  grouped[outlet].push(row);
                });

                const outlets = Object.keys(grouped).sort();
                if (outlets.length === 0) {
                  return (
                    <tr>
                      <td colSpan={report.columns.length} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        No records matching the filter query.
                      </td>
                    </tr>
                  );
                }

                let grandTotal = 0;

                const outletBlocks = outlets.flatMap((outlet) => {
                  const rows = grouped[outlet];
                  let totAmount = 0;

                  const detailRows = rows.map((row, idx) => {
                    totAmount += row.rawAmount || 0;
                    grandTotal += row.rawAmount || 0;

                    return (
                      <tr key={`pend-row-${outlet}-${idx}`}>
                        <td style={{ textAlign: 'center' }}>{row.c1}</td>
                        <td style={{ textAlign: 'center' }}>{row.c2}</td>
                        <td style={{ textAlign: 'center' }}>{row.c3}</td>
                        <td style={{ paddingLeft: '12px' }}>{row.c4}</td>
                        <td style={{ textAlign: 'center' }}>{row.c5}</td>
                        <td style={{ paddingLeft: '12px' }}>{row.c6}</td>
                        <td style={{ textAlign: 'center' }}>{row.c7}</td>
                        <td style={{ textAlign: 'right' }}>{row.c8}</td>
                        <td style={{ textAlign: 'right' }}>{row.c9}</td>
                        <td style={{ paddingLeft: '12px' }}>{row.c10}</td>
                      </tr>
                    );
                  });

                  return [
                    <tr key={`pend-outlet-${outlet}`} style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                      <td colSpan={10} style={{ textAlign: 'left', padding: '8px 12px', color: '#1e293b' }}>{outlet}</td>
                    </tr>,
                    ...detailRows,
                    <tr key={`pend-total-${outlet}`} style={{ fontWeight: 'bold', background: '#ffffff', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}>
                      <td colSpan={8} style={{ textAlign: 'right', paddingRight: '12px', color: '#64748b' }}>{outlet} Total :</td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}>{formatIndianCurrency(totAmount)}</td>
                      <td></td>
                    </tr>
                  ];
                });

                return [
                  ...outletBlocks,
                  <tr key={`pend-grand`} style={{ fontWeight: 'bold', background: '#e2e8f0', borderTop: '2px solid #475569', borderBottom: '2px solid #475569' }}>
                    <td colSpan={8} style={{ textAlign: 'right', paddingRight: '12px', color: '#0f172a' }}>Grand Total :</td>
                    <td style={{ textAlign: 'right', color: '#0f172a' }}>{formatIndianCurrency(grandTotal)}</td>
                    <td></td>
                  </tr>
                ];
              })()
            ) : report.id === 'nc-kot' ? (
              // Grouped table layout for NC KOT(Bill Report)(Detailed)
              (() => {
                const grouped = {};
                filteredData.forEach(row => {
                  const outlet = row.outlet || '1978 THE FAMILY RESTAURANT';
                  const date = row.c4 || '03/Apr/2026';
                  const ncType = row.ncType || 'Complementry (0.00%)';
                  
                  if (!grouped[outlet]) grouped[outlet] = {};
                  if (!grouped[outlet][date]) grouped[outlet][date] = {};
                  if (!grouped[outlet][date][ncType]) grouped[outlet][date][ncType] = [];
                  
                  grouped[outlet][date][ncType].push(row);
                });

                const outlets = Object.keys(grouped).sort();
                if (outlets.length === 0) {
                  return (
                    <tr>
                      <td colSpan={report.columns.length} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        No records matching the filter query.
                      </td>
                    </tr>
                  );
                }

                return outlets.flatMap((outlet) => {
                  const dates = Object.keys(grouped[outlet]).sort();
                  const dateBlocks = dates.flatMap((date) => {
                    const ncTypes = Object.keys(grouped[outlet][date]).sort();
                    let dateTotal = 0;

                    const ncTypeBlocks = ncTypes.flatMap((ncType) => {
                      const rows = grouped[outlet][date][ncType];
                      let ncTypeTotal = 0;

                      const detailRows = rows.map((row, idx) => {
                        ncTypeTotal += row.rawAmount || 0;
                        dateTotal += row.rawAmount || 0;

                        return (
                          <tr key={`nc-row-${outlet}-${date}-${ncType}-${idx}`}>
                            <td style={{ textAlign: 'center' }}>{row.c1}</td>
                            <td style={{ textAlign: 'center' }}>{row.c2}</td>
                            <td style={{ textAlign: 'center' }}>{row.c3}</td>
                            <td style={{ textAlign: 'center' }}>{row.c4}</td>
                            <td style={{ paddingLeft: '12px' }}>{row.c5}</td>
                            <td style={{ paddingLeft: '12px' }}>{row.c6}</td>
                            <td style={{ paddingLeft: '12px' }}>{row.c7}</td>
                            <td style={{ textAlign: 'center' }}>{row.c8}</td>
                            <td style={{ textAlign: 'right' }}>{row.c9}</td>
                            <td style={{ textAlign: 'right' }}>{row.c10}</td>
                          </tr>
                        );
                      });

                      const shortType = ncType.split(' ')[0];

                      return [
                        <tr key={`nc-type-header-${outlet}-${date}-${ncType}`} style={{ background: '#f8fafc', fontWeight: 'bold' }}>
                          <td colSpan={10} style={{ textAlign: 'left', padding: '4px 20px', color: '#64748b', fontSize: '0.85em' }}>NC Type : {ncType}</td>
                        </tr>,
                        ...detailRows,
                        <tr key={`nc-type-total-${outlet}-${date}-${ncType}`} style={{ fontWeight: 'bold', background: '#ffffff', borderBottom: '1px dotted #cbd5e1' }}>
                          <td colSpan={9} style={{ textAlign: 'right', paddingRight: '12px', color: '#64748b' }}>{shortType} Total :</td>
                          <td style={{ textAlign: 'right', color: '#0f172a' }}>{formatIndianCurrency(ncTypeTotal)}</td>
                        </tr>
                      ];
                    });

                    return [
                      <tr key={`nc-date-header-${outlet}-${date}`} style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                        <td colSpan={10} style={{ textAlign: 'left', padding: '6px 16px', color: '#475569' }}>Date : {date}</td>
                      </tr>,
                      ...ncTypeBlocks,
                      <tr key={`nc-date-total-${outlet}-${date}`} style={{ fontWeight: 'bold', background: '#e2e8f0', borderBottom: '1px solid #94a3b8' }}>
                        <td colSpan={9} style={{ textAlign: 'right', paddingRight: '12px', color: '#1e293b' }}>{date} Total :</td>
                        <td style={{ textAlign: 'right', color: '#0f172a' }}>{formatIndianCurrency(dateTotal)}</td>
                      </tr>
                    ];
                  });

                  return [
                    <tr key={`nc-outlet-${outlet}`} style={{ background: '#cbd5e1', fontWeight: 'bold' }}>
                      <td colSpan={10} style={{ textAlign: 'left', padding: '8px 12px', color: '#1e293b' }}>Outlet : {outlet}</td>
                    </tr>,
                    ...dateBlocks
                  ];
                });
              })()
            ) : report.id === 'kot-register' ? (
              // Grouped table layout for KOT Register
              (() => {
                const grouped = {};
                filteredData.forEach(row => {
                  const outlet = row.outlet || '1978 THE FAMILY RESTAURANT';
                  if (!grouped[outlet]) grouped[outlet] = [];
                  grouped[outlet].push(row);
                });

                const outlets = Object.keys(grouped).sort();
                if (outlets.length === 0) {
                  return (
                    <tr>
                      <td colSpan={report.columns.length} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        No records matching the filter query.
                      </td>
                    </tr>
                  );
                }

                return outlets.flatMap((outlet) => {
                  const rows = grouped[outlet];
                  let totAmount = 0;

                  const detailRows = rows.map((row, idx) => {
                    totAmount += row.rawAmount || 0;

                    return (
                      <tr key={`kot-row-${outlet}-${idx}`}>
                        <td style={{ textAlign: 'center' }}>{row.c1}</td>
                        <td style={{ textAlign: 'center' }}>{row.c2}</td>
                        <td style={{ textAlign: 'center' }}>{row.c3}</td>
                        <td style={{ textAlign: 'center' }}>{row.c4}</td>
                        <td style={{ paddingLeft: '12px' }}>{row.c5}</td>
                        <td style={{ textAlign: 'center' }}>{row.c6}</td>
                        <td style={{ paddingLeft: '12px' }}>{row.c7}</td>
                        <td style={{ textAlign: 'center' }}>{row.c8}</td>
                        <td style={{ textAlign: 'right' }}>{row.c9}</td>
                        <td style={{ textAlign: 'right' }}>{row.c10}</td>
                        <td style={{ textAlign: 'center' }}>{row.c11}</td>
                        <td style={{ paddingLeft: '12px' }}>{row.c12}</td>
                        <td style={{ textAlign: 'center' }}>{row.c13}</td>
                        <td style={{ paddingLeft: '12px' }}>{row.c14}</td>
                        <td style={{ paddingLeft: '12px' }}>{row.c15}</td>
                      </tr>
                    );
                  });

                  return [
                    <tr key={`kot-outlet-${outlet}`} style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                      <td colSpan={15} style={{ textAlign: 'left', padding: '8px 12px', color: '#1e293b' }}>{outlet}</td>
                    </tr>,
                    ...detailRows,
                    <tr key={`kot-total-${outlet}`} style={{ fontWeight: 'bold', background: '#ffffff', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}>
                      <td colSpan={9} style={{ textAlign: 'right', paddingRight: '12px', color: '#64748b' }}>{outlet} Total :</td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}>{formatIndianCurrency(totAmount)}</td>
                      <td colSpan={5}></td>
                    </tr>
                  ];
                });
              })()
            ) : report.id === 'taxwise-summary' ? (
              // Grouped table layout for Tax Summary Datewise
              (() => {
                const grouped = {};
                filteredData.forEach(row => {
                  const outlet = row.outlet || 'JAZZ BAR';
                  if (!grouped[outlet]) grouped[outlet] = [];
                  grouped[outlet].push(row);
                });

                const outlets = Object.keys(grouped).sort();
                if (outlets.length === 0) {
                  return (
                    <tr>
                      <td colSpan={report.columns.length} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        No records matching the filter query.
                      </td>
                    </tr>
                  );
                }

                return outlets.flatMap((outlet) => {
                  const rows = grouped[outlet];
                  let totGross = 0;
                  let totTaxable = 0;
                  let totNonTaxable = 0;
                  let totDiscount = 0;
                  let totSgst = 0;
                  let totCgst = 0;
                  let totRound = 0;
                  let totNet = 0;

                  const detailRows = rows.map((row, idx) => {
                    totGross += row.rawGross || 0;
                    totTaxable += row.rawTaxable || 0;
                    totNonTaxable += row.rawNonTaxable || 0;
                    totDiscount += row.rawDiscount || 0;
                    totSgst += row.rawSgst || 0;
                    totCgst += row.rawCgst || 0;
                    totRound += row.rawRoundOff || 0;
                    totNet += row.rawNet || 0;

                    return (
                      <tr key={`taxw-row-${outlet}-${idx}`}>
                        <td style={{ textAlign: 'center' }}>{row.c1}</td>
                        <td style={{ textAlign: 'center' }}>{row.c2}</td>
                        <td style={{ textAlign: 'right' }}>{row.c3}</td>
                        <td style={{ textAlign: 'right' }}>{row.c4}</td>
                        <td style={{ textAlign: 'right' }}>{row.c5}</td>
                        <td style={{ textAlign: 'right' }}>{row.c6}</td>
                        <td style={{ textAlign: 'right' }}>{row.c7}</td>
                        <td style={{ textAlign: 'right' }}>{row.c8}</td>
                        <td style={{ textAlign: 'right' }}>{row.c9}</td>
                        <td style={{ textAlign: 'right' }}>{row.c10}</td>
                        <td style={{ textAlign: 'right' }}>{row.c11}</td>
                        <td style={{ textAlign: 'right' }}>{row.c12}</td>
                        <td style={{ textAlign: 'right' }}>{row.c13}</td>
                        <td style={{ textAlign: 'right' }}>{row.c14}</td>
                        <td style={{ textAlign: 'right' }}>{row.c15}</td>
                        <td style={{ textAlign: 'right' }}>{row.c16}</td>
                      </tr>
                    );
                  });

                  return [
                    <tr key={`taxw-outlet-${outlet}`} style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                      <td colSpan={16} style={{ textAlign: 'left', padding: '8px 12px', color: '#1e293b' }}>{outlet}</td>
                    </tr>,
                    ...detailRows,
                    <tr key={`taxw-total-${outlet}`} style={{ fontWeight: 'bold', background: '#ffffff', borderTop: '1px dashed #cbd5e1', borderBottom: '1px dashed #cbd5e1' }}>
                      <td colSpan={2} style={{ textAlign: 'right', paddingRight: '12px', color: '#64748b' }}>{outlet} Total :</td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}>{totGross > 0 ? formatIndianCurrency(totGross) : ''}</td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}>{totTaxable > 0 ? formatIndianCurrency(totTaxable) : ''}</td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}>{totNonTaxable > 0 ? formatIndianCurrency(totNonTaxable) : ''}</td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}>{totDiscount > 0 ? formatIndianCurrency(totDiscount) : ''}</td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}>{totSgst > 0 ? formatIndianCurrency(totSgst) : ''}</td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}>{totCgst > 0 ? formatIndianCurrency(totCgst) : ''}</td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}></td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}></td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}></td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}></td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}></td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}></td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}>{totRound !== 0 ? totRound.toFixed(2) : ''}</td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}>{totNet > 0 ? formatIndianCurrency(totNet) : ''}</td>
                    </tr>
                  ];
                });
              })()
            ) : report.id === 'tax-datawise-summary' ? (
              // Grouped table layout for Tax Register (Detailed)
              (() => {
                const grouped = {};
                filteredData.forEach(row => {
                  const outlet = row.outlet || 'JAZZ BAR';
                  if (!grouped[outlet]) grouped[outlet] = [];
                  grouped[outlet].push(row);
                });

                const outlets = Object.keys(grouped).sort();
                if (outlets.length === 0) {
                  return (
                    <tr>
                      <td colSpan={report.columns.length} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        No records matching the filter query.
                      </td>
                    </tr>
                  );
                }

                return outlets.flatMap((outlet) => {
                  const rows = grouped[outlet];
                  return [
                    <tr key={`tax-outlet-${outlet}`} style={{ background: '#cbd5e1', fontWeight: 'bold' }}>
                      <td colSpan={21} style={{ textAlign: 'left', padding: '8px 12px', color: '#1e293b' }}>Outlet : {outlet}</td>
                    </tr>,
                    ...rows.map((row, idx) => (
                      <tr key={`tax-row-${outlet}-${idx}`}>
                        <td style={{ textAlign: 'center' }}>{row.c1}</td>
                        <td style={{ textAlign: 'center' }}>{row.c2}</td>
                        <td style={{ textAlign: 'right' }}>{row.c3}</td>
                        <td style={{ textAlign: 'right' }}>{row.c4}</td>
                        <td style={{ textAlign: 'right' }}>{row.c5}</td>
                        <td style={{ textAlign: 'right' }}>{row.c6}</td>
                        <td style={{ textAlign: 'right' }}>{row.c7}</td>
                        <td style={{ textAlign: 'right' }}>{row.c8}</td>
                        <td style={{ textAlign: 'right' }}>{row.c9}</td>
                        <td style={{ textAlign: 'right' }}>{row.c10}</td>
                        <td style={{ textAlign: 'right' }}>{row.c11}</td>
                        <td style={{ textAlign: 'right' }}>{row.c12}</td>
                        <td style={{ textAlign: 'right' }}>{row.c13}</td>
                        <td style={{ textAlign: 'right' }}>{row.c14}</td>
                        <td style={{ textAlign: 'right' }}>{row.c15}</td>
                        <td style={{ textAlign: 'right' }}>{row.c16}</td>
                        <td style={{ textAlign: 'right' }}>{row.c17}</td>
                        <td style={{ textAlign: 'right' }}>{row.c18}</td>
                        <td style={{ textAlign: 'right' }}>{row.c19}</td>
                        <td style={{ textAlign: 'right' }}>{row.c20}</td>
                        <td style={{ textAlign: 'right' }}>{row.c21}</td>
                      </tr>
                    ))
                  ];
                });
              })()
            ) : report.id === 'kitchen-time-gap' ? (
              // Grouped table layout for Kitchen Time Gap
              (() => {
                const grouped = {};
                filteredData.forEach(row => {
                  const outlet = row.outlet || 'JAZZ BAR';
                  const type = row.type || 'Bill';
                  if (!grouped[outlet]) grouped[outlet] = {};
                  if (!grouped[outlet][type]) grouped[outlet][type] = [];
                  grouped[outlet][type].push(row);
                });

                const outlets = Object.keys(grouped).sort();
                if (outlets.length === 0) {
                  return (
                    <tr>
                      <td colSpan={report.columns.length} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        No records matching the filter query.
                      </td>
                    </tr>
                  );
                }

                return outlets.flatMap((outlet) => {
                  const types = Object.keys(grouped[outlet]).sort();
                  return [
                    <tr key={`ktg-outlet-${outlet}`} style={{ background: '#cbd5e1', fontWeight: 'bold' }}>
                      <td colSpan={12} style={{ textAlign: 'left', padding: '8px 12px', color: '#1e293b' }}>Outlet : {outlet}</td>
                    </tr>,
                    ...types.flatMap((type) => {
                      const rows = grouped[outlet][type];
                      return [
                        <tr key={`ktg-type-${outlet}-${type}`} style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                          <td colSpan={12} style={{ textAlign: 'left', padding: '6px 16px', color: '#334155' }}>Type : {type}</td>
                        </tr>,
                        ...rows.map((row, idx) => (
                          <tr key={`ktg-row-${outlet}-${type}-${idx}`}>
                            <td style={{ textAlign: 'center' }}>{row.c1}</td>
                            <td style={{ textAlign: 'center' }}>{row.c2}</td>
                            <td style={{ textAlign: 'center' }}>{row.c3}</td>
                            <td style={{ paddingLeft: '12px' }}>{row.c4}</td>
                            <td style={{ textAlign: 'center' }}>{row.c5}</td>
                            <td style={{ textAlign: 'center' }}>{row.c6}</td>
                            <td style={{ textAlign: 'center' }}>{row.c7}</td>
                            <td style={{ textAlign: 'center' }}>{row.c8}</td>
                            <td style={{ textAlign: 'center' }}>{row.c9}</td>
                            <td style={{ textAlign: 'center' }}>{row.c10}</td>
                            <td style={{ textAlign: 'center' }}>{row.c11}</td>
                            <td style={{ textAlign: 'center' }}>{row.c12}</td>
                          </tr>
                        ))
                      ];
                    })
                  ];
                });
              })()
            ) : report.id === 'stewardwise-sale' ? (
              // Grouped table layout for Stewardwise Item Sale
              (() => {
                const grouped = {};
                filteredData.forEach(row => {
                  const steward = row.steward || 'B.M PATEL';
                  if (!grouped[steward]) grouped[steward] = [];
                  grouped[steward].push(row);
                });

                const stewards = Object.keys(grouped).sort();
                if (stewards.length === 0) {
                  return (
                    <tr>
                      <td colSpan={report.columns.length} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        No records matching the filter query.
                      </td>
                    </tr>
                  );
                }

                return stewards.flatMap((steward) => {
                  const rows = grouped[steward];
                  let stewardQty = 0;
                  let stewardAmount = 0;

                  const detailRows = rows.map((row, idx) => {
                    stewardQty += row.rawQty || 0;
                    stewardAmount += row.rawAmount || 0;

                    return (
                      <tr key={`stew-row-${steward}-${idx}`}>
                        <td style={{ textAlign: 'center' }}>{row.c1}</td>
                        <td style={{ paddingLeft: '12px' }}>{row.c2}</td>
                        <td style={{ textAlign: 'center' }}>{row.c3}</td>
                        <td style={{ textAlign: 'center' }}>{row.c4}</td>
                        <td style={{ textAlign: 'center' }}>{row.c5}</td>
                        <td style={{ textAlign: 'right' }}>{row.c6}</td>
                        <td style={{ textAlign: 'center' }}>{row.c7}</td>
                        <td style={{ textAlign: 'right' }}>{row.c8}</td>
                      </tr>
                    );
                  });

                  return [
                    <tr key={`stew-header-${steward}`} style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                      <td colSpan={8} style={{ textAlign: 'left', padding: '8px 12px', color: '#1e293b' }}>Steward : {steward}</td>
                    </tr>,
                    ...detailRows,
                    <tr key={`stew-total-${steward}`} style={{ fontWeight: 'bold', background: '#ffffff', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}>
                      <td colSpan={4} style={{ textAlign: 'right', paddingRight: '12px', color: '#64748b' }}>Steward Total :</td>
                      <td style={{ textAlign: 'center', color: '#0f172a' }}>{stewardQty.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}>{formatIndianCurrency(stewardAmount)}</td>
                      <td style={{ textAlign: 'center', color: '#0f172a' }}>0</td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}>0.00</td>
                    </tr>
                  ];
                });
              })()
            ) : report.id === 'cover-analysis' ? (
              // Grouped table layout for Cover Analysis
              (() => {
                const grouped = {};
                filteredData.forEach(row => {
                  const outlet = row.outlet || 'JAZZ BAR';
                  const waiter = row.waiter || 'B.M PATEL';
                  
                  if (!grouped[outlet]) grouped[outlet] = {};
                  if (!grouped[outlet][waiter]) grouped[outlet][waiter] = [];
                  
                  grouped[outlet][waiter].push(row);
                });

                const outlets = Object.keys(grouped).sort();
                if (outlets.length === 0) {
                  return (
                    <tr>
                      <td colSpan={report.columns.length} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        No records matching the filter query.
                      </td>
                    </tr>
                  );
                }

                return outlets.flatMap((outlet) => {
                  const waiters = Object.keys(grouped[outlet]).sort();
                  return [
                    <tr key={`cov-outlet-${outlet}`} style={{ background: '#cbd5e1', fontWeight: 'bold' }}>
                      <td colSpan={9} style={{ textAlign: 'left', padding: '8px 12px', color: '#1e293b' }}>Outlet : {outlet}</td>
                    </tr>,
                    ...waiters.flatMap((waiter) => {
                      const rows = grouped[outlet][waiter];
                      return [
                        <tr key={`cov-waiter-${outlet}-${waiter}`} style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                          <td colSpan={9} style={{ textAlign: 'left', padding: '6px 16px', color: '#334155' }}>Steward : {waiter}</td>
                        </tr>,
                        ...rows.map((row, idx) => (
                          <tr key={`cov-row-${outlet}-${waiter}-${idx}`}>
                            <td style={{ textAlign: 'center' }}>{row.c1}</td>
                            <td style={{ textAlign: 'center' }}>{row.c2}</td>
                            <td style={{ textAlign: 'center' }}>{row.c3}</td>
                            <td style={{ textAlign: 'center' }}>{row.c4}</td>
                            <td style={{ textAlign: 'center' }}>{row.c5}</td>
                            <td style={{ textAlign: 'right' }}>{row.c6}</td>
                            <td style={{ textAlign: 'right' }}>{row.c7}</td>
                            <td style={{ textAlign: 'center' }}>{row.c8}</td>
                            <td style={{ textAlign: 'center' }}>{row.c9}</td>
                          </tr>
                        ))
                      ];
                    })
                  ];
                });
              })()
            ) : report.id === 'tablewise-sale' ? (
              // Grouped table layout for Tablewise Itemwise Sale
              (() => {
                const grouped = {};
                filteredData.forEach(row => {
                  const outlet = row.outlet || 'JAZZ BAR';
                  if (!grouped[outlet]) grouped[outlet] = [];
                  grouped[outlet].push(row);
                });

                const outlets = Object.keys(grouped).sort();
                if (outlets.length === 0) {
                  return (
                    <tr>
                      <td colSpan={report.columns.length} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        No records matching the filter query.
                      </td>
                    </tr>
                  );
                }

                return outlets.flatMap((outlet) => {
                  const rows = grouped[outlet];
                  return [
                    <tr key={`tbl-outlet-${outlet}`} style={{ background: '#cbd5e1', fontWeight: 'bold' }}>
                      <td colSpan={7} style={{ textAlign: 'left', padding: '8px 12px', color: '#1e293b' }}>Outlet : {outlet}</td>
                    </tr>,
                    ...rows.map((row, idx) => (
                      <tr key={`tbl-row-${outlet}-${idx}`}>
                        <td style={{ textAlign: 'center' }}>{row.c1}</td>
                        <td style={{ textAlign: 'center' }}>{row.c2}</td>
                        <td style={{ textAlign: 'center' }}>{row.c3}</td>
                        <td style={{ textAlign: 'center' }}>{row.c4}</td>
                        <td style={{ textAlign: 'right' }}>{row.c5}</td>
                        <td style={{ paddingLeft: '12px' }}>{row.c6}</td>
                        <td style={{ textAlign: 'center' }}>{row.c7}</td>
                      </tr>
                    ))
                  ];
                });
              })()
            ) : report.id === 'itemwise-categorywise-sale' ? (
              // Grouped table layout for Itemwise Categorywise Sale
              (() => {
                const grouped = {};
                filteredData.forEach(row => {
                  const cat = row.category || 'GST 0 %';
                  const main = row.mainGrp || 'FOOD';
                  const grp = row.grp || 'BEVERAGE';
                  
                  if (!grouped[cat]) grouped[cat] = {};
                  if (!grouped[cat][main]) grouped[cat][main] = {};
                  if (!grouped[cat][main][grp]) grouped[cat][main][grp] = [];
                  
                  grouped[cat][main][grp].push(row);
                });

                const categories = Object.keys(grouped).sort();
                if (categories.length === 0) {
                  return (
                    <tr>
                      <td colSpan={report.columns.length} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        No records matching the filter query.
                      </td>
                    </tr>
                  );
                }

                return categories.flatMap((cat) => {
                  let catValue = 0;
                  const mainGroups = Object.keys(grouped[cat]).sort();

                  const mainGroupsList = mainGroups.flatMap((main) => {
                    let mainValue = 0;
                    const groups = Object.keys(grouped[cat][main]).sort();

                    const groupsList = groups.flatMap((grp) => {
                      const items = grouped[cat][main][grp];
                      let grpValue = 0;

                      const detailRows = items.map((row, idx) => {
                        grpValue += row.rawValue || 0;
                        mainValue += row.rawValue || 0;
                        catValue += row.rawValue || 0;

                        return (
                          <tr key={`cat-item-${cat}-${main}-${grp}-${idx}`}>
                            <td style={{ paddingLeft: '24px' }}>{row.c1}</td>
                            <td style={{ textAlign: 'center' }}>{row.c2}</td>
                            <td style={{ textAlign: 'center' }}>{row.c3}</td>
                            <td style={{ textAlign: 'right' }}>{row.c4}</td>
                          </tr>
                        );
                      });

                      return [
                        <tr key={`cat-grp-${cat}-${main}-${grp}`} style={{ background: '#fafafa', fontWeight: 'bold' }}>
                          <td colSpan={4} style={{ textAlign: 'left', padding: '6px 20px', color: '#475569', fontSize: '0.82rem' }}>Grp: {grp}</td>
                        </tr>,
                        ...detailRows,
                        <tr key={`cat-grptotal-${cat}-${main}-${grp}`} style={{ fontWeight: 'bold', background: '#ffffff', borderTop: '1px solid #cbd5e1', borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ textAlign: 'right', paddingRight: '12px', color: '#64748b' }}>{grp} Total :</td>
                          <td></td>
                          <td></td>
                          <td style={{ textAlign: 'right', color: '#0f172a' }}>{formatIndianCurrency(grpValue)}</td>
                        </tr>
                      ];
                    });

                    return [
                      <tr key={`cat-main-${cat}-${main}`} style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                        <td colSpan={4} style={{ textAlign: 'left', padding: '6px 16px', color: '#334155' }}>Main Grp: {main}</td>
                      </tr>,
                      ...groupsList,
                      <tr key={`cat-maintotal-${cat}-${main}`} style={{ fontWeight: 'bold', background: '#ffffff', borderBottom: '2px double #94a3b8' }}>
                        <td style={{ textAlign: 'right', paddingRight: '12px', color: '#475569' }}>{main} Total :</td>
                        <td></td>
                        <td></td>
                        <td style={{ textAlign: 'right', color: '#0f172a' }}>{formatIndianCurrency(mainValue)}</td>
                      </tr>
                    ];
                  });

                  return [
                    <tr key={`cat-header-${cat}`} style={{ background: '#cbd5e1', fontWeight: 'bold' }}>
                      <td colSpan={4} style={{ textAlign: 'left', padding: '8px 12px', color: '#1e293b' }}>Category: {cat}</td>
                    </tr>,
                    ...mainGroupsList,
                    <tr key={`cat-cattotal-${cat}`} style={{ fontWeight: 'bold', background: '#e2e8f0', borderBottom: '2px solid #475569' }}>
                      <td style={{ textAlign: 'right', paddingRight: '12px', color: '#1e293b' }}>{cat} Total :</td>
                      <td></td>
                      <td></td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}>{formatIndianCurrency(catValue)}</td>
                    </tr>
                  ];
                });
              })()
            ) : (report.id === 'itemwise-sale' || report.id === 'itemwise-outletwise-sale') ? (
              // Grouped table layout for Itemwise Sale / Itemwise Outletwise Sale
              (() => {
                const grouped = {};
                filteredData.forEach(row => {
                  const outlet = row.outlet || 'All Outlets';
                  const mainGrp = row.mainGrp || 'General';
                  const grp = row.grp || 'General';
                  
                  if (!grouped[outlet]) grouped[outlet] = {};
                  if (!grouped[outlet][mainGrp]) grouped[outlet][mainGrp] = {};
                  if (!grouped[outlet][mainGrp][grp]) grouped[outlet][mainGrp][grp] = [];
                  
                  grouped[outlet][mainGrp][grp].push(row);
                });

                const outlets = Object.keys(grouped).sort();
                if (outlets.length === 0) {
                  return (
                    <tr>
                      <td colSpan={report.columns.length} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        No records matching the filter query.
                      </td>
                    </tr>
                  );
                }

                return outlets.flatMap((outlet) => {
                  const mainGroups = Object.keys(grouped[outlet]).sort();
                  
                  const outletSection = [
                    <tr key={`outlet-${outlet}`} style={{ background: '#cbd5e1', fontWeight: 'bold' }}>
                      <td colSpan={5} style={{ textAlign: 'left', padding: '8px 12px', color: '#1e293b' }}>Outlet : {outlet}</td>
                    </tr>
                  ];

                  const mainGroupsList = mainGroups.flatMap((mainGrp) => {
                    const groups = Object.keys(grouped[outlet][mainGrp]).sort();
                    
                    const mainGrpSection = [
                      <tr key={`maingrp-${outlet}-${mainGrp}`} style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                        <td colSpan={5} style={{ textAlign: 'left', padding: '6px 16px', color: '#334155' }}>Main Grp: {mainGrp}</td>
                      </tr>
                    ];

                    const groupsList = groups.flatMap((grp) => {
                      const items = grouped[outlet][mainGrp][grp];
                      let grpQty = 0;
                      let grpValue = 0;

                      const detailRows = items.map((row, idx) => {
                        grpQty += row.rawQty || 0;
                        grpValue += row.rawValue || 0;
                        
                        return (
                          <tr key={`item-${outlet}-${mainGrp}-${grp}-${idx}`}>
                            <td style={{ paddingLeft: '24px' }}>{row.c1}</td>
                            <td style={{ textAlign: 'center' }}>{row.c2}</td>
                            <td style={{ textAlign: 'center' }}>{row.c3}</td>
                            <td style={{ textAlign: 'center' }}>{row.c4}</td>
                            <td style={{ textAlign: 'right' }}>{row.c5}</td>
                          </tr>
                        );
                      });

                      return [
                        <tr key={`grp-${outlet}-${mainGrp}-${grp}`} style={{ background: '#fafafa', fontWeight: 'bold' }}>
                          <td colSpan={5} style={{ textAlign: 'left', padding: '6px 20px', color: '#475569', fontSize: '0.82rem' }}>Grp: {grp}</td>
                        </tr>,
                        ...detailRows,
                        <tr key={`grptotal-${outlet}-${mainGrp}-${grp}`} style={{ fontWeight: 'bold', background: '#ffffff', borderBottom: '1px double #cbd5e1' }}>
                          <td colSpan={3} style={{ textAlign: 'right', paddingRight: '12px', color: '#64748b' }}>{grp} Total:</td>
                          <td style={{ textAlign: 'center', color: '#0f172a' }}>{grpQty}</td>
                          <td style={{ textAlign: 'right', color: '#0f172a' }}>{formatIndianCurrency(grpValue)}</td>
                        </tr>
                      ];
                    });

                    return [...mainGrpSection, ...groupsList];
                  });

                  return [...outletSection, ...mainGroupsList];
                });
              })()
            ) : report.id === 'sales-register' ? (
              // Grouped table layout for Sales Register
              (() => {
                const grouped = {};
                filteredData.forEach(row => {
                  const d = row.c2;
                  if (!grouped[d]) grouped[d] = [];
                  grouped[d].push(row);
                });

                const sortedDates = Object.keys(grouped).sort((a, b) => {
                  const parseDate = (dStr) => {
                    const parts = dStr.split('-');
                    const months = { 'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11 };
                    return new Date(parseInt(parts[2]), months[parts[1]], parseInt(parts[0]));
                  };
                  return parseDate(a) - parseDate(b);
                });

                if (sortedDates.length === 0) {
                  return (
                    <tr>
                      <td colSpan={report.columns.length} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                        No records matching the filter query.
                      </td>
                    </tr>
                  );
                }

                return sortedDates.flatMap((date) => {
                  const bills = grouped[date];
                  let dailyGross = 0;
                  let dailyDiscount = 0;
                  let dailyTax = 0;
                  let dailyNet = 0;

                  const rowsList = bills.map((row, idx) => {
                    dailyGross += row.rawGross || 0;
                    dailyDiscount += row.rawDiscount || 0;
                    dailyTax += row.rawTax || 0;
                    dailyNet += row.rawNet || 0;

                    return (
                      <tr key={`${date}-row-${idx}`}>
                        <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                        <td style={{ textAlign: 'center' }}>{row.c2}</td>
                        <td style={{ textAlign: 'center' }}>{row.c3}</td>
                        <td>{row.c4}</td>
                        <td>{row.c5}</td>
                        <td>{row.c6}</td>
                        <td>{row.c7}</td>
                        <td style={{ textAlign: 'right' }}>{row.c8}</td>
                        <td style={{ textAlign: 'right' }}>{row.c9}</td>
                        <td style={{ textAlign: 'right' }}>{row.c10}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }}>{row.c11}</td>
                      </tr>
                    );
                  });

                  return [
                    <tr key={`${date}-header`} style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                      <td colSpan={11} style={{ textAlign: 'left', padding: '8px 12px', color: '#334155' }}>{date}</td>
                    </tr>,
                    ...rowsList,
                    <tr key={`${date}-footer`} style={{ background: '#fafafa', fontWeight: 'bold' }}>
                      <td colSpan={7} style={{ textAlign: 'right', color: '#475569' }}>Daily Total</td>
                      <td style={{ textAlign: 'right' }}>{formatIndianCurrency(dailyGross)}</td>
                      <td style={{ textAlign: 'right' }}>{formatIndianCurrency(dailyDiscount)}</td>
                      <td style={{ textAlign: 'right' }}>{formatIndianCurrency(dailyTax)}</td>
                      <td style={{ textAlign: 'right', color: '#0f172a' }}>{formatIndianCurrency(dailyNet)}</td>
                    </tr>
                  ];
                });
              })()
            ) : (
              // Default view for other reports
              filteredData.length > 0 ? (
                filteredData.map((row, idx) => (
                  <tr key={idx}>
                    {Object.keys(row).filter(key => /^c\d+$/.test(key)).map((key, colIdx) => {
                      const colName = report.columns[colIdx] || '';
                      return (
                        <td key={colIdx} style={{ textAlign: getColAlign(colName) }}>
                          {row[key]}
                        </td>
                      );
                    })}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={report.columns.length} style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                    No records matching the filter query.
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(GenericReportViewer);
