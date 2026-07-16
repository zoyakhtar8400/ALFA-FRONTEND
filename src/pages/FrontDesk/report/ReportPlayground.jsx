import React, { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import BackButton from '../../../components/common/BackButton';
import { PrintHeader, PrintFooter } from '../../../components/common/PrintComponent';

import ReportFilterPanel from '../../../components/common/report/ReportFilterPanel';
import DateFilter from '../../../components/common/report/DateFilter';
import DateRangeFilter from '../../../components/common/report/DateRangeFilter';
import GRCFilter from '../../../components/common/report/GRCFilter';
import GuestFilter from '../../../components/common/report/GuestFilter';
import CompanyFilter from '../../../components/common/report/CompanyFilter';
import RoomCategoryFilter from '../../../components/common/report/RoomCategoryFilter';
import PaymentModeFilter from '../../../components/common/report/PaymentModeFilter';
import BusinessSourceFilter from '../../../components/common/report/BusinessSourceFilter';
import MarketSegmentFilter from '../../../components/common/report/MarketSegmentFilter';
import UserFilter from '../../../components/common/report/UserFilter';
import ReceiptFilter from '../../../components/common/report/ReceiptFilter';
import StatusFilter from '../../../components/common/report/StatusFilter';
import ReportTypeFilter from '../../../components/common/report/ReportTypeFilter';
import ExpenseCategoryFilter from '../../../components/common/report/ExpenseCategoryFilter';
import VendorFilter from '../../../components/common/report/VendorFilter';
import ApprovedByFilter from '../../../components/common/report/ApprovedByFilter';
import TaxTypeFilter from '../../../components/common/report/TaxTypeFilter';
import ShiftFilter from '../../../components/common/report/ShiftFilter';
import RoomTypeFilter from '../../../components/common/report/RoomTypeFilter';
import ServiceChargeTypeFilter from '../../../components/common/report/ServiceChargeTypeFilter';
import LocationFilter from '../../../components/common/report/LocationFilter';
import ComplimentaryFilter from '../../../components/common/report/ComplimentaryFilter';
import PlanNameFilter from '../../../components/common/report/PlanNameFilter';
import RoomNoFilter from '../../../components/common/report/RoomNoFilter';
import HealthStatusFilter from '../../../components/common/report/HealthStatusFilter';
import MonthFilter from '../../../components/common/report/MonthFilter';
import YearFilter from '../../../components/common/report/YearFilter';
import ActionButtons from '../../../components/common/report/ActionButtons';
import { exportExcel } from '../../../utils/exportExcel';
import { exportPDF } from '../../../utils/exportPDF';

const DEFAULT_FILTERS = {
  startDate: '2023-04-01',
  endDate: '2026-07-03',
  date: '2026-07-03',
  grcNo: '',
  guestName: '',
  roomNo: '',
  roomCategory: 'All',
  complimentary: 'All',
  companyName: '',
  country: 'All',
  state: 'All',
  city: 'All',
  marketSegment: 'All',
  businessSource: 'All',
  planName: 'All',
  healthStatus: 'All',
  paymentMode: 'All',
  user: 'All',
  receiptNo: '',
  status: 'All',
  taxType: 'All',
  shift: 'All',
  roomType: 'All',
  reportType: 'Summary',
  serviceChargeType: 'All',
  expenseCategory: 'All',
  vendorName: '',
  approvedBy: '',
  month: 'Select',
  year: 'Select'
};

const REPORT_FILTERS = {
  // Arrival & Departure
  'check-in-guest-detail': ['date', 'grcNo', 'guestName'],
  'check-in-register': ['startDate', 'endDate', 'guestName', 'grcNo', 'complimentary', 'companyName'],
  'room-check-out-report': ['startDate', 'endDate', 'grcNo', 'guestName', 'roomNo', 'roomCategory'],
  'state-city-wise-check-in': ['startDate', 'endDate', 'country', 'state', 'city', 'guestName'],
  'check-out-register': ['startDate', 'endDate', 'grcNo', 'guestName', 'companyName', 'roomCategory', 'marketSegment', 'businessSource', 'planName'],
  'business-source-report': ['startDate', 'endDate', 'businessSource', 'companyName', 'marketSegment', 'grcNo'],
  'guest-health-checkup': ['startDate', 'endDate', 'guestName', 'grcNo', 'roomNo', 'healthStatus'],

  // Finance & Revenue
  'collection-register': ['startDate', 'endDate', 'paymentMode', 'user', 'companyName'],
  'settlement-report': ['startDate', 'endDate', 'paymentMode', 'receiptNo', 'user', 'companyName', 'status'],
  'bill-to-company-report': ['startDate', 'endDate', 'companyName', 'guestName', 'grcNo', 'status'],
  'tax-register': ['startDate', 'endDate', 'taxType', 'companyName', 'grcNo'],
  'user-wise-collection': ['startDate', 'endDate', 'user', 'paymentMode', 'shift'],
  'day-collection-report': ['date', 'user', 'paymentMode', 'shift'],
  'cumulative-collection': ['startDate', 'endDate', 'paymentMode', 'user', 'companyName'],
  'date-wise-room-revenue': ['startDate', 'endDate', 'roomCategory', 'roomType', 'companyName', 'marketSegment'],
  'service-charge-report': ['startDate', 'endDate', 'reportType', 'serviceChargeType', 'grcNo', 'guestName', 'companyName'],
  'expense-report': ['startDate', 'endDate', 'expenseCategory', 'vendorName', 'approvedBy', 'paymentMode'],
  'advance-refund-report': ['startDate', 'endDate'],

  // Occupancy Analysis
  'occupancy-report-monthly': ['startDate', 'endDate'],
  'occupancy-report': ['date'],
  'night-audit-report': ['date'],
  'day-room-wise-occupancy': ['month', 'year'],
  'day-room-category-occupancy': ['month', 'year'],
  'company-wise-guest-analysis': ['startDate', 'endDate'],
  'room-status-report': ['startDate', 'endDate'],
  'guest-analysis-report': ['startDate', 'endDate'],

  // GST Filing
  'gstr-1': ['month', 'year', 'companyName'],
  'gst-3b': ['month', 'companyName'],
  'gst-b2b': ['month', 'year'],

  // Log Reports
  'change-guest-profile': ['startDate', 'endDate'],
  'room-change-entry-report': ['startDate', 'endDate']
};

const ReportPlayground = ({ selectedReport, onBack }) => {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTablePreview, setShowTablePreview] = useState(true);
  const [tableSearch, setTableSearch] = useState('');

  useEffect(() => {
    const defaults = { ...DEFAULT_FILTERS };

    if (['change-guest-profile', 'room-change-entry-report'].includes(selectedReport.id)) {
      defaults.startDate = '2024-04-01';
      defaults.endDate = '2026-07-03';
    } else if (['advance-refund-report', 'company-wise-guest-analysis', 'room-status-report', 'guest-analysis-report'].includes(selectedReport.id)) {
      defaults.startDate = '2023-04-01';
      defaults.endDate = '2026-07-03';
    } else if (['occupancy-report-monthly', 'occupancy-report', 'night-audit-report'].includes(selectedReport.id)) {
      defaults.startDate = '2026-07-03';
      defaults.endDate = '2026-07-03';
      defaults.date = '2026-07-03';
    }

    setFilters(defaults);
  }, [selectedReport]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    if (window.showToast) window.showToast('Filters reset to default values.');
  };

  const handlePreview = () => {
    setIsGenerating(true);
    if (window.showToast) window.showToast('Compiling hotel ledger data...');
    setTimeout(() => {
      setIsGenerating(false);
      setShowTablePreview(true);
      if (window.showToast) window.showToast('Report compiled successfully.');
    }, 600);
  };

  const handlePDF = () => {
    if (window.showToast) window.showToast(`Exporting PDF for ${selectedReport.name}...`);
    exportPDF(
      selectedReport.name,
      selectedReport.columns,
      filteredTableData,
      getActiveFilters(selectedReport.id),
      printedOnStr
    );
  };

  const handleExcel = () => {
    if (window.showToast) window.showToast(`Exporting Excel sheet for ${selectedReport.name}...`);
    exportExcel(
      selectedReport.name,
      selectedReport.columns,
      filteredTableData,
      getActiveFilters(selectedReport.id),
      printedOnStr
    );
  };

  const formatDateDDMMYYYY = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  };

  const printedOnStr = useMemo(() => {
    const now = new Date();
    const datePart = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const timePart = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return `${datePart} ${timePart}`;
  }, []);

  const getActiveFilters = (reportId) => {
    const list = {};
    const activeFilters = REPORT_FILTERS[reportId] || [];

    activeFilters.forEach(filterKey => {
      switch (filterKey) {
        case 'startDate':
        case 'endDate':
          break;
        case 'date':
          list[reportId === 'check-in-guest-detail' ? 'Check In Date' : 'Date'] = formatDateDDMMYYYY(filters.date);
          break;
        case 'grcNo':
          list['GRC No.'] = filters.grcNo || 'All';
          break;
        case 'guestName':
          list['Guest Name'] = filters.guestName || 'All';
          break;
        case 'companyName':
          list['Company'] = filters.companyName || 'All';
          break;
        case 'roomCategory':
          list['Room Category'] = filters.roomCategory || 'All';
          break;
        case 'complimentary':
          list['Complimentary'] = filters.complimentary || 'All';
          break;
        case 'paymentMode':
          list['Payment Mode'] = filters.paymentMode || 'All';
          break;
        case 'businessSource':
          list['Business Source'] = filters.businessSource || 'All';
          break;
        case 'marketSegment':
          list['Market Segment'] = filters.marketSegment || 'All';
          break;
        case 'user':
          list['User'] = filters.user || 'All';
          break;
        case 'receiptNo':
          list[reportId === 'settlement-report' ? 'Receipt ID' : 'Receipt No'] = filters.receiptNo || 'All';
          break;
        case 'status':
          list[reportId === 'bill-to-company-report' ? 'Bill Status' : 'Settlement Status'] = filters.status || 'All';
          break;
        case 'taxType':
          list['Tax Type'] = filters.taxType || 'All';
          break;
        case 'shift':
          list['Shift'] = filters.shift || 'All';
          break;
        case 'roomType':
          list['Room Type'] = filters.roomType || 'All';
          break;
        case 'reportType':
          list['Report Type'] = filters.reportType || 'All';
          break;
        case 'serviceChargeType':
          list['Service Charge'] = filters.serviceChargeType || 'All';
          break;
        case 'expenseCategory':
          list['Expense Category'] = filters.expenseCategory || 'All';
          break;
        case 'vendorName':
          list['Vendor'] = filters.vendorName || 'All';
          break;
        case 'approvedBy':
          list['Approved By'] = filters.approvedBy || 'All';
          break;
        case 'planName':
          list['Plan Name'] = filters.planName || 'All';
          break;
        case 'month':
          list[reportId === 'gstr-1' ? 'From Date' : 'Month'] = filters.month;
          break;
        case 'year':
          list['Year'] = filters.year;
          break;
        case 'roomNo':
          list['Room No.'] = filters.roomNo || 'All';
          break;
        case 'healthStatus':
          list['Health Status'] = filters.healthStatus || 'All';
          break;
        case 'country':
          list['Country'] = filters.country || 'All';
          break;
        case 'state':
          list['State'] = filters.state || 'All';
          break;
        case 'city':
          list['City'] = filters.city || 'All';
          break;
        default:
          break;
      }
    });
    return list;
  };

  const renderFilters = (reportId) => {
    const activeFilters = REPORT_FILTERS[reportId] || [];
    if (activeFilters.length === 0) return null;

    const hasStartDate = activeFilters.includes('startDate');
    const hasEndDate = activeFilters.includes('endDate');

    return (
      <>
        {hasStartDate && hasEndDate && (
          <DateRangeFilter
            startDate={filters.startDate}
            onStartDateChange={val => updateFilter('startDate', val)}
            endDate={filters.endDate}
            onEndDateChange={val => updateFilter('endDate', val)}
          />
        )}
        {activeFilters.map(filterKey => {
          if (filterKey === 'startDate' || filterKey === 'endDate') return null;

          switch (filterKey) {
            case 'date':
              const dateLabel = reportId === 'check-in-guest-detail' ? "Check In Date" : "Date";
              return <DateFilter key={filterKey} value={filters.date} onChange={val => updateFilter('date', val)} label={dateLabel} />;
            case 'grcNo':
              return <GRCFilter key={filterKey} value={filters.grcNo} onChange={val => updateFilter('grcNo', val)} />;
            case 'guestName':
              return <GuestFilter key={filterKey} value={filters.guestName} onChange={val => updateFilter('guestName', val)} />;
            case 'companyName':
              return <CompanyFilter key={filterKey} value={filters.companyName} onChange={val => updateFilter('companyName', val)} />;
            case 'roomCategory':
              return <RoomCategoryFilter key={filterKey} value={filters.roomCategory} onChange={val => updateFilter('roomCategory', val)} />;
            case 'complimentary':
              return <ComplimentaryFilter key={filterKey} value={filters.complimentary} onChange={val => updateFilter('complimentary', val)} />;
            case 'paymentMode':
              return <PaymentModeFilter key={filterKey} value={filters.paymentMode} onChange={val => updateFilter('paymentMode', val)} />;
            case 'businessSource':
              return <BusinessSourceFilter key={filterKey} value={filters.businessSource} onChange={val => updateFilter('businessSource', val)} />;
            case 'marketSegment':
              return <MarketSegmentFilter key={filterKey} value={filters.marketSegment} onChange={val => updateFilter('marketSegment', val)} />;
            case 'user':
              return <UserFilter key={filterKey} value={filters.user} onChange={val => updateFilter('user', val)} />;
            case 'receiptNo':
              const receiptLabel = reportId === 'settlement-report' ? "Receipt ID (Rec Id)" : "Receipt No.";
              return <ReceiptFilter key={filterKey} value={filters.receiptNo} onChange={val => updateFilter('receiptNo', val)} label={receiptLabel} />;
            case 'status':
              const statusLabel = reportId === 'bill-to-company-report' ? "Bill Status" : "Settlement Status";
              return <StatusFilter key={filterKey} value={filters.status} onChange={val => updateFilter('status', val)} label={statusLabel} />;
            case 'taxType':
              return <TaxTypeFilter key={filterKey} value={filters.taxType} onChange={val => updateFilter('taxType', val)} />;
            case 'shift':
              return <ShiftFilter key={filterKey} value={filters.shift} onChange={val => updateFilter('shift', val)} />;
            case 'roomType':
              return <RoomTypeFilter key={filterKey} value={filters.roomType} onChange={val => updateFilter('roomType', val)} />;
            case 'reportType':
              return <ReportTypeFilter key={filterKey} value={filters.reportType} onChange={val => updateFilter('reportType', val)} />;
            case 'serviceChargeType':
              return <ServiceChargeTypeFilter key={filterKey} value={filters.serviceChargeType} onChange={val => updateFilter('serviceChargeType', val)} />;
            case 'expenseCategory':
              return <ExpenseCategoryFilter key={filterKey} value={filters.expenseCategory} onChange={val => updateFilter('expenseCategory', val)} />;
            case 'vendorName':
              return <VendorFilter key={filterKey} value={filters.vendorName} onChange={val => updateFilter('vendorName', val)} />;
            case 'approvedBy':
              return <ApprovedByFilter key={filterKey} value={filters.approvedBy} onChange={val => updateFilter('approvedBy', val)} />;
            case 'planName':
              return <PlanNameFilter key={filterKey} value={filters.planName} onChange={val => updateFilter('planName', val)} />;
            case 'month':
              const monthLabel = reportId === 'gstr-1' ? "From Date" : "Month";
              return <MonthFilter key={filterKey} value={filters.month} onChange={val => updateFilter('month', val)} label={monthLabel} />;
            case 'year':
              return <YearFilter key={filterKey} value={filters.year} onChange={val => updateFilter('year', val)} />;
            case 'roomNo':
              return <RoomNoFilter key={filterKey} value={filters.roomNo} onChange={val => updateFilter('roomNo', val)} />;
            case 'healthStatus':
              return <HealthStatusFilter key={filterKey} value={filters.healthStatus} onChange={val => updateFilter('healthStatus', val)} />;
            case 'country':
            case 'state':
            case 'city':
              if (filterKey === 'country') {
                return (
                  <LocationFilter
                    key={filterKey}
                    country={filters.country}
                    onCountryChange={val => updateFilter('country', val)}
                    state={filters.state}
                    onStateChange={val => updateFilter('state', val)}
                    city={filters.city}
                    onCityChange={val => updateFilter('city', val)}
                  />
                );
              }
              return null;
            default:
              return null;
          }
        })}
      </>
    );
  };

  const filteredTableData = useMemo(() => {
    if (!tableSearch) return selectedReport.data;
    return selectedReport.data.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(tableSearch.toLowerCase())
      )
    );
  }, [selectedReport.data, tableSearch]);

  const renderCell = (colName, val) => {
    const colUpper = colName.toUpperCase();
    const valStr = String(val);

    if (colUpper.includes('STATUS') || colUpper.includes('STATE') && !colUpper.includes('CITY')) {
      let bg = 'rgba(148, 163, 184, 0.08)';
      let color = '#64748B';

      if (['OCCUPIED', 'FULLY PAID', 'OK', 'CLOSED', '100% CLEAR', 'SETTLED VIA', 'CLEAN', 'ACTIVE CHECKED IN', 'ADVANCE HELD'].some(s => valStr.toUpperCase().includes(s))) {
        bg = 'rgba(16, 185, 129, 0.08)';
        color = '#10B981';
      } else if (['PARTIALLY PAID', 'PARTIALLY REFUNDED'].some(s => valStr.toUpperCase().includes(s))) {
        bg = 'rgba(245, 158, 11, 0.08)';
        color = '#D97706';
      } else if (['DIRTY', 'UNSETTLED LEDGER', 'ERRORS LOGGED', 'DEPARTURE FLAG', 'CANCELLED', 'OUT OF ORDER'].some(s => valStr.toUpperCase().includes(s))) {
        bg = 'rgba(239, 68, 68, 0.08)';
        color = '#EF4444';
      }

      return (
        <span style={{
          display: 'inline-block',
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '0.72rem',
          fontWeight: 800,
          background: bg,
          color: color,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {val}
        </span>
      );
    }

    if (colUpper === 'ROOM' || colUpper === 'ROOM #' || colUpper === 'OLD ROOM #' || colUpper === 'NEW ROOM #') {
      return (
        <span style={{
          background: 'rgba(65, 138, 139, 0.08)',
          color: 'var(--primary)',
          padding: '4px 10px',
          borderRadius: '8px',
          fontWeight: 800,
          fontSize: '0.76rem',
          fontFamily: 'monospace'
        }}>
          Room {val}
        </span>
      );
    }

    if (valStr.startsWith('₹') || colUpper.includes('REVENUE') || colUpper.includes('AMOUNT') || colUpper.includes('BILL') || colUpper.includes('INVOICED') || colUpper.includes('TAX') || colUpper.includes('RENT') || colUpper.includes('VAL') || colUpper.includes('COLLECTED') || colUpper.includes('PAID')) {
      return (
        <span style={{
          fontWeight: 800,
          color: selectedReport.color
        }}>
          {val}
        </span>
      );
    }

    if (colUpper.includes('SOURCE') || colUpper.includes('OTA') || colUpper.includes('SEGMENT') || colUpper.includes('SETTLED VIA') || colUpper.includes('PAYMENT MODE')) {
      let bg = 'rgba(59, 130, 246, 0.08)';
      let color = '#3B82F6';

      if (valStr.toUpperCase() === 'SELF' || valStr.toUpperCase() === 'DIRECT' || valStr.toUpperCase() === 'CASH') {
        bg = 'rgba(16, 185, 129, 0.08)';
        color = '#10B981';
      } else if (valStr.toUpperCase().includes('CORP') || valStr.toUpperCase().includes('PO-')) {
        bg = 'rgba(124, 58, 237, 0.08)';
        color = '#7C3AED';
      }

      return (
        <span style={{
          display: 'inline-block',
          padding: '4px 8px',
          borderRadius: '8px',
          fontSize: '0.74rem',
          fontWeight: 700,
          background: bg,
          color: color
        }}>
          {val}
        </span>
      );
    }

    return val;
  };

  return (
    <div className="reports-layout" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      <PrintHeader title={selectedReport.name} />

      <div className="panel-premium slide-up-item" style={{
        padding: '18px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Back Link & Report Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <BackButton onClick={onBack} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--dark)' }}>
                {selectedReport.name}
              </h3>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: selectedReport.color, background: selectedReport.bgLight, padding: '2px 8px', borderRadius: '10px' }}>
                {selectedReport.category}
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
              Live PMS Report Builder Mode
            </span>
          </div>
        </div>
      </div>

      {/* Workspace Content */}
      <div className="reports-workspace" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>

        {/* Full-width Filter Panel */}
        <ReportFilterPanel>
          {renderFilters(selectedReport.id)}
          <ActionButtons
            onPrint={() => window.print()}
            onPDF={handlePDF}
            onExcel={handleExcel}
          />
        </ReportFilterPanel>

        {/* Live Preview Area */}
        <div className="reports-preview-area" style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          {showTablePreview && (
            <>
              {(() => {
                const activeFiltersList = Object.entries(getActiveFilters(selectedReport.id))
                  .filter(([_, val]) => val !== 'All' && val !== '' && val !== 'Select');
                const isAdvanceRefund = selectedReport.id === 'advance-refund-report';

                if (activeFiltersList.length === 0 && !isAdvanceRefund) return null;

                return (
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #f1f5f9',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '20px',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    color: '#334155',
                    boxShadow: 'var(--shadow-premium)',
                  }}>
                    {activeFiltersList.length > 0 && (
                      <div>
                        <div style={{ fontWeight: 700, textTransform: 'uppercase', color: '#64748b', fontSize: '0.75rem', marginBottom: '6px' }}>Filters Applied</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                          {activeFiltersList.map(([key, val]) => (
                            <div key={key} style={{ fontSize: '0.78rem' }}>
                              <span style={{ color: '#64748b', fontWeight: 600 }}>{key}:</span> <span style={{ color: '#0f172a', fontWeight: 700 }}>{val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {isAdvanceRefund && (
                      <div style={{
                        borderTop: activeFiltersList.length > 0 ? '1px dashed #cbd5e1' : 'none',
                        paddingTop: activeFiltersList.length > 0 ? '12px' : '0px',
                        marginTop: activeFiltersList.length > 0 ? '12px' : '0px',
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        color: '#1e293b',
                        lineHeight: '1.6'
                      }}>
                        <div><strong>Total Advance :</strong> ₹50,000</div>
                        <div><strong>Total Refund  :</strong> ₹5,000</div>
                        <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '6px', marginTop: '6px', fontWeight: 800 }}>
                          <strong>Net Advance   :</strong> ₹45,000
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="custom-table-container slide-up-item">
                {/* Table Header Controls */}
                <div className="no-print" style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      PMS Database Records Preview
                    </span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                      Compiled output data matching date filters
                    </span>
                  </div>

                  {/* Local search within table records */}
                  <div style={{ position: 'relative', width: '220px' }}>
                    <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', fontSize: '11px' }} />
                    <input
                      type="text"
                      placeholder="Search inside preview..."
                      value={tableSearch}
                      onChange={e => setTableSearch(e.target.value)}
                      className="custom-form-input"
                      style={{ paddingLeft: '28px', height: '32px', fontSize: '0.76rem', borderRadius: '8px' }}
                    />
                    {tableSearch && (
                      <FaTimes
                        onClick={() => setTableSearch('')}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '10px' }}
                      />
                    )}
                  </div>
                </div>

                {/* Table Grid */}
                <div className="custom-scrollbar" style={{ overflowX: 'auto', width: '100%' }}>
                  <table className="custom-table-element" style={{ margin: 0 }}>
                    <thead>
                      <tr>
                        {selectedReport.columns?.map((colName, idx) => (
                          <th key={idx}>
                            {colName}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTableData?.map((row, rowIdx) => (
                        <tr key={rowIdx}>
                          {selectedReport.columns?.map((col, colIdx) => {
                            const valKey = `c${colIdx + 1}`;
                            return (
                              <td key={colIdx}>
                                {renderCell(col, row[valKey])}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      {filteredTableData.length === 0 && (
                        <tr>
                          <td colSpan={selectedReport.columns?.length || 1} style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>
                            No records match your search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Fake Pagination Footer */}
                <div className="no-print" style={{ padding: '14px 24px', borderTop: '1px solid #F1F5F9', background: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  <span>Showing 1 to {filteredTableData.length} of {filteredTableData.length} records</span>
                  <span style={{ fontWeight: 800 }}>Page 1 of 1</span>
                </div>
              </div>

              {/* Report Footer */}
              <div style={{
                marginTop: '20px',
                borderTop: '2px solid #f1f5f9',
                paddingTop: '16px',
                fontFamily: 'monospace',
                fontSize: '0.82rem',
                color: '#475569',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div><strong>Total Records :</strong> {filteredTableData.length}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <div><strong>Printed By :</strong> Admin</div>
                  <div><strong>Printed On :</strong> {printedOnStr}</div>
                </div>
              </div>
            </>
          )}
        </div>

      </div>

      <PrintFooter title={selectedReport.name} />
    </div>
  );
};

export default ReportPlayground;
