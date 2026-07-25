import React, { useState, useMemo } from 'react';
import PageHeader from '../../../components/common/PageHeader';
import CommonSearch from '../../../components/common/CommonSearch';
import CommonActionToolbar from '../../../components/common/CommonActionToolbar';
import CommonTable from '../../../components/common/CommonTable';
import { exportExcel } from '../../../utils/exportExcel';
import { exportPurchasePDF } from './pdf';
import { handlePrint } from '../../../utils/printUtil';
import { PrintHeader, PrintFooter } from '../../../components/common/PrintComponent';
import { FaChartBar } from 'react-icons/fa';
import '../../FrontDesk/report/reports.css';

const PurchaseReportPlayground = ({ selectedReport, onBack, showToast }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('2026-06-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeframe, setTimeframe] = useState('weekly'); // 'weekly' | 'monthly' | 'yearly'

  const toast = (msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  };

  const chartData = useMemo(() => {
    if (timeframe === 'monthly') {
      return [
        { label: 'Wk 1', val: '₹1.85L', pct: 55 },
        { label: 'Wk 2', val: '₹2.40L', pct: 72 },
        { label: 'Wk 3', val: '₹2.10L', pct: 64 },
        { label: 'Wk 4', val: '₹3.15L', pct: 95 }
      ];
    }
    if (timeframe === 'yearly') {
      return [
        { label: 'Q1', val: '₹7.20L', pct: 65 },
        { label: 'Q2', val: '₹9.40L', pct: 82 },
        { label: 'Q3', val: '₹8.10L', pct: 74 },
        { label: 'Q4', val: '₹11.5L', pct: 100 }
      ];
    }
    return [
      { label: '18 Jul', val: '₹42.5K', pct: 45 },
      { label: '19 Jul', val: '₹58.0K', pct: 60 },
      { label: '20 Jul', val: '₹64.2K', pct: 68 },
      { label: '21 Jul', val: '₹48.9K', pct: 52 },
      { label: '22 Jul', val: '₹76.5K', pct: 80 },
      { label: '23 Jul', val: '₹89.0K', pct: 92 },
      { label: '24 Jul', val: '₹94.2K', pct: 100 }
    ];
  }, [timeframe]);

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

  // Filter data by search query and date range
  const filteredData = useMemo(() => {
    let rows = selectedReport?.data || [];

    // Filter by date range
    if (startDate || endDate) {
      const fromDate = startDate ? new Date(startDate) : null;
      if (fromDate) fromDate.setHours(0, 0, 0, 0);
      const toDate = endDate ? new Date(endDate) : null;
      if (toDate) toDate.setHours(23, 59, 59, 999);

      rows = rows.filter(row => {
        const dateColIdx = selectedReport?.columns?.findIndex(col => col.toLowerCase().includes('date'));
        if (dateColIdx !== undefined && dateColIdx !== -1) {
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
        Object.values(row).some(val => String(val).toLowerCase().includes(q))
      );
    }

    return rows;
  }, [selectedReport, searchQuery, startDate, endDate]);

  const tableColumns = useMemo(() => {
    if (!selectedReport?.columns) return [];
    return selectedReport.columns.map((colName, idx) => ({
      key: `c${idx + 1}`,
      label: colName,
      sortable: true
    }));
  }, [selectedReport]);

  const printedOnStr = useMemo(() => {
    const now = new Date();
    const datePart = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const timePart = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${datePart} ${timePart}`;
  }, []);

  const handlePrintClick = () => {
    handlePrint();
    toast('Report sent to print!');
  };

  const handleExportPDF = () => {
    exportPurchasePDF(
      selectedReport?.name || 'Purchase Report',
      selectedReport?.columns || [],
      filteredData,
      { startDate, endDate, category: selectedReport?.category },
      printedOnStr
    );
    toast(`Exported ${selectedReport?.name} to PDF!`);
  };

  const handleExportExcel = () => {
    exportExcel(
      selectedReport?.name || 'Purchase Report',
      selectedReport?.columns || [],
      filteredData,
      { startDate, endDate, category: selectedReport?.category },
      printedOnStr
    );
    toast(`Exported ${selectedReport?.name} to Excel!`);
  };

  if (!selectedReport) return null;

  return (
    <div className="reports-layout" style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: 'var(--font-family, system-ui)' }}>
      {/* Header - Hidden during A4 Print */}
      <div className="no-print">
        <PageHeader
          title={selectedReport.name}
          breadcrumbs={['Dashboard', 'Purchase', 'Reports', selectedReport.name]}
          showBack
          onBack={onBack}
          style={{ marginBottom: '4px' }}
        />
        <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
          {selectedReport.desc}
        </div>
      </div>

      {/* 1. First: Show 3 KPI Cards */}
      {selectedReport.kpis && selectedReport.kpis.length > 0 && (
        <div className="no-print" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {selectedReport.kpis.slice(0, 3).map((kpi, idx) => (
            <div key={idx} style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px 20px',
              boxShadow: '0 2px 8px -3px rgba(0,0,0,0.05)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{kpi.label}</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>{kpi.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Second: Show Form (Filter & Action Toolbar Card) */}
      <div className="no-print" style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '12px 18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 2px 8px -3px rgba(0,0,0,0.05)'
      }}>
        {/* Left Side: From / To Date Pickers + Weekly/Monthly/Yearly Filter */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>From:</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.76rem', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>To:</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              style={{ padding: '5px 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.76rem', outline: 'none' }}
            />
          </div>

          {/* Timeframe Segment Control Pill Buttons */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '3px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0'
          }}>
            {['weekly', 'monthly', 'yearly'].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: timeframe === tf ? 800 : 600,
                  color: timeframe === tf ? '#ffffff' : '#64748b',
                  background: timeframe === tf ? '#2563eb' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.2s ease shadow'
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Search & Action Toolbar */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '220px' }}>
            <CommonSearch
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search register..."
            />
          </div>
          <CommonActionToolbar
            onPrint={handlePrintClick}
            onPDF={handleExportPDF}
            onExcel={handleExportExcel}
          />
        </div>
      </div>

      {/* 3. Third: Divide into Two Columns (Big: List Table, Small: Graph) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) 320px',
        gap: '16px',
        alignItems: 'start',
        width: '100%'
      }}>
        {/* BIG COLUMN: Data Table List */}
        <div id="printable-report-area" className="slide-up-item" style={{ minWidth: 0 }}>
          {selectedReport?.id === 'consume-register' ? (
            <div className="print-only" style={{ marginBottom: '14px', fontFamily: 'Courier, monospace' }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase', color: '#000' }}>
                ALFA
              </div>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem', margin: '3px 0 10px', color: '#000' }}>
                Consume Register From {startDate} To {endDate}
              </div>

              <div style={{ fontSize: '0.78rem', lineHeight: '1.45', color: '#1e293b', marginBottom: '10px' }}>
                <div>From Date       : {startDate}</div>
                <div>To Date         : {endDate}</div>
                <div>Category Name   : All</div>
                <div>Group Name      : All</div>
                <div>Item            : All</div>
                <div>In Department   : All</div>
                <div>Site Name       : HO</div>
                <div>Item Type       : All</div>
                <div>Type            : Detailed</div>
              </div>
            </div>
          ) : selectedReport?.id === 'current-stock-register' ? (
            <div className="print-only" style={{ marginBottom: '14px', fontFamily: 'Courier, monospace' }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase', color: '#000' }}>
                ALFA
              </div>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem', margin: '3px 0 10px', color: '#000' }}>
                Current Stock Register
              </div>

              <div style={{ fontSize: '0.78rem', lineHeight: '1.45', color: '#1e293b', marginBottom: '10px' }}>
                <div>Category Name : All</div>
                <div>Group Name    : All</div>
                <div>Item          : All</div>
                <div>Department    : All</div>
                <div>Type          : Departmentwise</div>
              </div>
            </div>
          ) : selectedReport?.id === 'department-issue-register' ? (
            <div className="print-only" style={{ marginBottom: '14px', fontFamily: 'Courier, monospace' }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase', color: '#000' }}>
                ALFA
              </div>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem', margin: '3px 0 10px', color: '#000' }}>
                Department Issue Register (Detailed) From {startDate} To {endDate}
              </div>

              <div style={{ fontSize: '0.78rem', lineHeight: '1.45', color: '#1e293b', marginBottom: '10px' }}>
                <div>Item          : All</div>
                <div>Category Name : All</div>
                <div>Group Name    : All</div>
                <div>From Department: All</div>
                <div>To Department : All</div>
                <div>Site Name     : HO</div>
                <div>Print Type    : Detail</div>
                <div>Item Type     : All</div>
                <div>Pattern       : A4 size paper</div>
                <div>Item Wise     : Yes</div>
              </div>
            </div>
          ) : selectedReport?.id === 'fb-cost-statement-report' ? (
            <div className="print-only" style={{ marginBottom: '14px', fontFamily: 'Courier, monospace' }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase', color: '#000' }}>
                ALFA
              </div>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem', margin: '3px 0 10px', color: '#000' }}>
                F&D Cost Statement From {startDate} To {endDate}
              </div>
            </div>
          ) : selectedReport?.id === 'grn-register' ? (
            <div className="print-only" style={{ marginBottom: '14px', fontFamily: 'Courier, monospace' }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase', color: '#000' }}>
                ALFA
              </div>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem', margin: '3px 0 10px', color: '#000' }}>
                GRN Register From {startDate} To {endDate}
              </div>

              <div style={{ fontSize: '0.78rem', lineHeight: '1.45', color: '#1e293b', marginBottom: '10px' }}>
                <div>Party         : All</div>
                <div>Voucher Type  : All</div>
                <div>Site Name     : HO</div>
                <div>Filter        : All</div>
              </div>
            </div>
          ) : selectedReport?.id === 'partywise-itemwise-avg-rate' ? (
            <div className="print-only" style={{ marginBottom: '14px', fontFamily: 'Courier, monospace' }}>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase', color: '#000' }}>
                ALFA
              </div>
              <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '0.95rem', margin: '3px 0 10px', color: '#000' }}>
                Partywise Itemwise Average Rate From {startDate} To {endDate}
              </div>

              <div style={{ fontSize: '0.78rem', lineHeight: '1.45', color: '#1e293b', marginBottom: '10px' }}>
                <div>Site Name      : HO</div>
                <div>Type           : Partywise</div>
                <div>Behalf Of Rate : Most</div>
              </div>
            </div>
          ) : (
            <PrintHeader title={selectedReport.name} />
          )}

          <CommonTable
            title={`${selectedReport.name} Ledger Details`}
            columns={tableColumns}
            data={filteredData}
            searchPlaceholder={`Search in ${selectedReport.name}...`}
            showToast={toast}
            onlyTable
            emptyMessage="No matching data entries found for current filters."
          />

          <PrintFooter />
        </div>

        {/* SMALL COLUMN: Visual Analytics Bar Chart */}
        <div className="no-print slide-up-item delay-1" style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 2px 8px -3px rgba(0,0,0,0.05)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          position: 'sticky',
          top: '20px'
        }}>
          {/* Chart Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: '#eff6ff', padding: '6px 8px', borderRadius: '6px', color: '#2563eb' }}>
                <FaChartBar size={13} />
              </div>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a', textTransform: 'capitalize' }}>
                  {timeframe} Trend
                </div>
                <div style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  Register volume breakdown
                </div>
              </div>
            </div>
            <span style={{ fontSize: '0.66rem', fontWeight: 800, color: '#10b981', background: '#ecfdf5', padding: '3px 8px', borderRadius: '10px' }}>
              +14.8% ↑
            </span>
          </div>

          {/* Vertical Bar Chart */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            height: '180px',
            paddingTop: '16px',
            paddingBottom: '6px',
            borderBottom: '1px solid #e2e8f0',
            gap: '8px'
          }}>
            {chartData.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                height: '100%',
                justifyContent: 'flex-end',
                gap: '4px'
              }}>
                {/* Value Tag Above Bar */}
                <span style={{ fontSize: '0.58rem', fontWeight: 800, color: '#334155' }}>
                  {item.val}
                </span>
                {/* Colored Bar */}
                <div style={{
                  width: '100%',
                  maxWidth: '28px',
                  height: `${item.pct}%`,
                  background: idx === chartData.length - 1
                    ? 'linear-gradient(180deg, #2563EB 0%, #3B82F6 100%)'
                    : 'linear-gradient(180deg, #94A3B8 0%, #CBD5E1 100%)',
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s ease'
                }} />
                {/* X-Axis Label */}
                <span style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', marginTop: '2px' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '0.7rem', color: '#64748b', textAlign: 'center', fontWeight: 600 }}>
            Filtered mode: <strong style={{ color: '#2563eb', textTransform: 'uppercase' }}>{timeframe}</strong> analytics view
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseReportPlayground;


