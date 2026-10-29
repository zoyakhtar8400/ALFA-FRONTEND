import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FaMoon,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaStore,
  FaRupeeSign,
  FaPrint,
  FaSyncAlt,
  FaClock,
  FaFileInvoice,
  FaCreditCard,
  FaMoneyBillWave,
  FaQrcode,
  FaBed,
  FaGift,
  FaHistory,
  FaArrowRight,
  FaTimes,
  FaShieldAlt,
  FaCheck,
  FaSpinner,
  FaExclamationCircle,
  FaCalculator
} from 'react-icons/fa';
import posApi from '../../../../api/posApi';
import nightAuditService from '../../../../services/nightAuditService';
import { useFrontDesk } from '../../../../context/FrontDeskContext';
import printNightAudit from '../../../Restaurant/utils/printNightAudit';

export const NightAuditDashboard = ({ showToast, isModal = false, onClose }) => {
  const frontDeskContext = useFrontDesk();
  const updateNightAuditDate = frontDeskContext?.updateNightAuditDate;

  // Active business date state
  const [currentDate, setCurrentDate] = useState(() => {
    return localStorage.getItem('alfa_night_audit_date') || '2026-10-26';
  });

  const [operatingSession, setOperatingSession] = useState(null);
  const [closingCutoff, setClosingCutoff] = useState('02:00:00');
  const [dbOutlets, setDbOutlets] = useState([]);
  const [selectedOutlet, setSelectedOutlet] = useState(() => {
    return localStorage.getItem('active_outlet_name') || 'Main Restaurant Outlet';
  });

  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Live Backend Reconciliation State
  const [reconcileData, setReconcileData] = useState(null);
  const [blockers, setBlockers] = useState([]);
  const [blockerBreakdown, setBlockerBreakdown] = useState({
    activeTables: [],
    pendingKOTs: [],
    unpaidBills: []
  });

  // Cash Drawer Reconciliation State
  const [actualCashCounted, setActualCashCounted] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);

  // Audit Execution State
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditStep, setAuditStep] = useState(0); // 0 to 5
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'history'

  // Audit Logs in DB
  const [auditLogs, setAuditLogs] = useState([]);

  const toast = (msg, type = 'success') => {
    if (typeof showToast === 'function') {
      showToast(msg, type);
    } else if (window.showToast) {
      window.showToast(msg, type);
    }
  };

  // 1. Load Status & History from Backend DB
  const fetchStatusAndHistory = useCallback(async () => {
    try {
      const statusRes = await nightAuditService.getStatus();
      const sData = statusRes?.data || statusRes;
      const bizDate = sData?.businessDate || sData?.business_date;
      if (bizDate) {
        setCurrentDate(bizDate);
        setOperatingSession(sData.activeSession || sData.session);
        if (sData.closingCutoff || sData.cutoff_time) {
          setClosingCutoff(sData.closingCutoff || sData.cutoff_time);
        }
        try {
          localStorage.setItem('alfa_night_audit_date', bizDate);
          if (updateNightAuditDate) updateNightAuditDate(bizDate);
        } catch (e) {}
      }

      const histRes = await nightAuditService.getHistory();
      const hData = histRes?.data || histRes;
      if (Array.isArray(hData?.history)) {
        setAuditLogs(hData.history);
      } else if (Array.isArray(hData)) {
        setAuditLogs(hData);
      }
    } catch (e) {
      console.warn('Night audit status/history fetch error:', e.message);
    }
  }, [updateNightAuditDate]);

  // 2. Load Live Financial & Blocker Reconciliation from Backend DB
  const fetchReconciliationData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await nightAuditService.getReconciliation(currentDate);
      const rData = res?.data || res;
      if (rData) {
        setReconcileData(rData);
        setBlockers(rData.blockers || []);
        setBlockerBreakdown(rData.blocker_breakdown || rData.blockerBreakdown || {
          activeTables: [],
          pendingKOTs: [],
          unpaidBills: []
        });
      }
    } catch (err) {
      console.warn('Reconciliation data fetch error:', err.message);
      toast('Failed to load live reconciliation data from backend', 'error');
    } finally {
      setLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchStatusAndHistory();
  }, [fetchStatusAndHistory]);

  useEffect(() => {
    fetchReconciliationData();
  }, [fetchReconciliationData, refreshTrigger]);

  // Load Outlets on Mount
  useEffect(() => {
    posApi.getOutlets()
      .then(res => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        if (list.length > 0) {
          setDbOutlets(list);
          const activeStoreId = localStorage.getItem('activeOutletId');
          const matched = list.find(o => String(o.store_id || `STORE_${o.id}`) === String(activeStoreId));
          if (matched) {
            setSelectedOutlet(matched.store_name || matched.name || 'Main Restaurant Outlet');
          }
        }
      })
      .catch(() => {});
  }, []);

  // Financial Figures derived directly from DB reconciliation response
  const financials = useMemo(() => {
    const s = reconcileData?.financialSummary || reconcileData?.summary;
    if (s) {
      const tender = s.paymentModeBreakdown || reconcileData?.payment_breakdown || {};
      const expectedCash = Number(s.expected_cash || tender.cash || 0);
      const counted = actualCashCounted === '' ? expectedCash : Number(actualCashCounted || 0);
      const cashVariance = counted - expectedCash;

      return {
        grossSales: Number(s.grossSales ?? s.gross_sales ?? 0),
        discounts: Number(s.discounts || 0),
        taxableSales: Number(s.taxableSales ?? s.taxable_sales ?? (Number(s.grossSales || 0) - Number(s.discounts || 0))),
        taxCollected: Number(s.taxTotals ?? s.tax_collected ?? 0),
        netGrandTotal: Number(s.netSales ?? s.net_sales ?? 0),
        refunds: Number(s.refunds ?? s.refunds_and_cancellations ?? 0),
        totalCollected: Number(s.totalCollected ?? s.total_collected ?? 0),
        outstandingBalance: Number(s.unpaidBillsTotal ?? s.unpaid_balance ?? 0),
        billCount: Number(s.totalBillsCount ?? s.bill_count ?? 0),
        unpaidCount: Number(s.unpaidBillsCount ?? s.unpaid_bills_count ?? 0),
        expectedCash,
        actualCashCounted: counted,
        cashVariance,
        tenderBreakdown: {
          cash: Number(tender.cash || 0),
          card: Number(tender.card || 0),
          upi: Number(tender.upi || 0),
          room: Number(tender.room || 0),
          complimentary: Number(tender.complimentary || 0),
          other: Number(tender.other || 0)
        }
      };
    }

    return {
      grossSales: 0,
      discounts: 0,
      taxableSales: 0,
      taxCollected: 0,
      netGrandTotal: 0,
      refunds: 0,
      totalCollected: 0,
      outstandingBalance: 0,
      billCount: 0,
      unpaidCount: 0,
      expectedCash: 0,
      actualCashCounted: 0,
      cashVariance: 0,
      tenderBreakdown: { cash: 0, card: 0, upi: 0, room: 0, complimentary: 0, other: 0 }
    };
  }, [reconcileData, actualCashCounted]);

  // Readiness Verdict from live backend blockers
  const hasBlockers = blockers.length > 0;
  const hasExceptions = hasBlockers || financials.cashVariance !== 0;
  const auditStatus = reconcileData?.auditStatus || reconcileData?.audit_status || (hasBlockers ? 'ACTION_REQUIRED' : 'READY_TO_CLOSE');

  // Last Audit Record
  const lastAudit = auditLogs[0] || null;

  // Format Date for Display (e.g. "26 Oct 2026")
  const formatAuditDate = (dateStr) => {
    if (!dateStr) return 'Not Set';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Run Real Night Audit via Backend API
  const executeNightAudit = async (overrideConfirmed = false) => {
    // If blockers exist and override was not yet confirmed, open override confirmation
    if (hasBlockers && !overrideConfirmed) {
      setShowConfirmModal(false);
      setShowOverrideConfirm(true);
      return;
    }

    setShowConfirmModal(false);
    setShowOverrideConfirm(false);
    setIsAuditing(true);
    setAuditStep(1);

    try {
      setAuditStep(2); // Validating backend invariants
      const payload = {
        business_date: currentDate,
        allow_override: Boolean(overrideConfirmed || hasBlockers),
        override_reason: overrideReason || (hasBlockers ? 'Manager authorized override for active blockers' : 'Normal Night Audit Close'),
        actual_cash_counted: financials.actualCashCounted
      };

      setAuditStep(3); // Performing atomic database closure
      const closeRes = await nightAuditService.closeBusinessDay(payload);

      const isSuccess = closeRes?.success || closeRes?.status === 200;
      if (!isSuccess) {
        throw new Error(closeRes?.message || 'Day-end closure rejected by server');
      }

      setAuditStep(4); // Archiving reports & snapshots
      await new Promise(r => setTimeout(r, 600));

      setAuditStep(5); // Advancing business calendar
      const nextDate = closeRes.data?.nextBusinessDate || closeRes.next_business_date || closeRes.nextBusinessDate;

      if (nextDate) {
        try {
          localStorage.setItem('alfa_night_audit_date', nextDate);
          if (updateNightAuditDate) updateNightAuditDate(nextDate);
          window.dispatchEvent(new CustomEvent('nightAuditDateUpdated', { detail: nextDate }));
        } catch (e) {}

        setCurrentDate(nextDate);
      }
      toast(`✅ Night Audit completed successfully! Business date advanced to ${formatAuditDate(nextDate)}.`);

      // Refresh status, history and reconciliation for new date
      await fetchStatusAndHistory();
      setRefreshTrigger(p => p + 1);
      setOverrideReason('');
    } catch (err) {
      console.error('Night audit closure failed:', err);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Operation failed';
      // If server rejected with 400 because blockers require override, prompt user with override modal
      if (serverMsg.includes('blockers found') || serverMsg.includes('override with reason is required')) {
        setShowOverrideConfirm(true);
      } else {
        toast(`Error completing night audit: ${serverMsg}`, 'error');
      }
    } finally {
      setIsAuditing(false);
      setAuditStep(0);
    }
  };

  // Change business date manually
  const handleDateChange = (newDate) => {
    if (!newDate) return;
    setCurrentDate(newDate);
    try {
      localStorage.setItem('alfa_night_audit_date', newDate);
      if (updateNightAuditDate) updateNightAuditDate(newDate);
      window.dispatchEvent(new CustomEvent('nightAuditDateUpdated', { detail: newDate }));
    } catch (e) {}
    toast(`Business date updated to ${formatAuditDate(newDate)}.`);
  };

  // Print Report Handler
  const handlePrintAuditReport = async () => {
    await printNightAudit({
      currentDate,
      formattedDate: formatAuditDate(currentDate),
      selectedOutlet,
      closingCutoff,
      financials,
      hasBlockers,
      blockerBreakdown,
      overrideReason,
      toast
    });
  };


  return (
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: isModal ? '10px 0' : '20px 24px',
      color: '#0f172a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* ─── HEADER / BANNER ────────────────────────────────────────────── */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        marginBottom: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#e0f2fe',
              color: '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>
              <FaMoon />
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              Night Audit & Day-End Settlement
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Review and reconcile daily operational transactions for the selected outlet and close the business day.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => { setRefreshTrigger(p => p + 1); toast('Reconciliation refreshed.'); }}
            title="Refresh Data"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#334155',
              transition: 'all 0.15s ease'
            }}
          >
            <FaSyncAlt className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handlePrintAuditReport}
            title="Print Audit Summary Sheet"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#334155'
            }}
          >
            <FaPrint />
            <span>Print Report</span>
          </button>

          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={isAuditing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '8px',
              border: 'none',
              background: hasExceptions ? '#ea580c' : '#0d9488',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: isAuditing ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)',
              transition: 'all 0.15s ease'
            }}
          >
            <FaShieldAlt />
            <span>{isAuditing ? 'Auditing...' : 'Run Night Audit'}</span>
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              title="Close Modal"
              style={{
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '8px',
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>

      {/* ─── TAB NAVIGATION (AUDIT vs HISTORY) ─────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 700,
            border: activeTab === 'audit' ? '1.5px solid #0d9488' : '1px solid #e2e8f0',
            background: activeTab === 'audit' ? '#f0fdfa' : '#ffffff',
            color: activeTab === 'audit' ? '#0d9488' : '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FaMoon />
          <span>Active Day Reconciliation</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 700,
            border: activeTab === 'history' ? '1.5px solid #0d9488' : '1px solid #e2e8f0',
            background: activeTab === 'history' ? '#f0fdfa' : '#ffffff',
            color: activeTab === 'history' ? '#0d9488' : '#64748b',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <FaHistory />
          <span>Audit History & Log ({auditLogs.length})</span>
        </button>
      </div>

      {activeTab === 'audit' ? (
        <>
          {/* ─── 4 TOP KPI CARDS ────────────────────────────────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {/* Card 1: Software Date */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              position: 'relative'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  CURRENT SOFTWARE DATE
                </div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#0d9488', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Change Date</span>
                  <input
                    type="date"
                    value={currentDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    style={{ position: 'absolute', opacity: 0, width: '1px', height: '1px', pointerEvents: 'none' }}
                    id="night-audit-date-picker"
                  />
                </label>
              </div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', cursor: 'pointer' }}
                onClick={() => {
                  const el = document.getElementById('night-audit-date-picker');
                  if (el?.showPicker) el.showPicker();
                  else el?.click();
                }}
                title="Click to change software business date"
              >
                <FaCalendarAlt style={{ color: '#0d9488', fontSize: '1.1rem' }} />
                <span>{formatAuditDate(currentDate)}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                <span>Authoritative Business Date</span>
              </div>
            </div>

            {/* Card 2: Outlet Scope */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
                OUTLET SCOPE
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                <FaStore style={{ color: '#6366f1', fontSize: '1.1rem' }} />
                <select
                  value={selectedOutlet}
                  onChange={(e) => setSelectedOutlet(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    cursor: 'pointer',
                    outline: 'none',
                    maxWidth: '180px'
                  }}
                >
                  {dbOutlets.length > 0 ? (
                    dbOutlets.map(o => (
                      <option key={o.id} value={o.store_name || o.name}>
                        {o.store_name || o.name}
                      </option>
                    ))
                  ) : (
                    <option value={selectedOutlet}>{selectedOutlet}</option>
                  )}
                </select>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Code: {selectedOutlet.toUpperCase().replace(/\s+/g, '_').slice(0, 16)}
              </div>
            </div>

            {/* Card 3: Audit Status */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
                AUDIT READINESS STATUS
              </div>
              <div>
                <span style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: 800,
                  background: hasExceptions ? '#fef3c7' : '#dcfce7',
                  color: hasExceptions ? '#b45309' : '#15803d',
                  border: hasExceptions ? '1px solid #fde68a' : '1px solid #bbf7d0'
                }}>
                  {hasExceptions ? 'ACTION REQUIRED' : 'READY TO CLOSE'}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                {hasExceptions ? 'Blocking items require clearance' : 'All pre-close checks passed'}
              </div>
            </div>

            {/* Card 4: Last Night Audit */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '16px 20px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
            }}>
              <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '6px' }}>
                LAST NIGHT AUDIT
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>
                <FaClock style={{ color: '#8b5cf6', fontSize: '1rem' }} />
                <span>{lastAudit ? lastAudit.closedAt : 'First Run'}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                {lastAudit ? `Audited by: ${lastAudit.auditor}` : 'No prior audits on file'}
              </div>
            </div>
          </div>

          {/* ─── AUDIT EXCEPTIONS & VERIFICATION CHECKLIST ────────────────── */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px 24px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #f1f5f9',
              paddingBottom: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaShieldAlt style={{ color: '#0d9488', fontSize: '16px' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>
                  Audit Pre-Closing Verification & Blockers
                </h3>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 700,
                background: hasBlockers ? '#fff7ed' : '#f0fdf4',
                color: hasBlockers ? '#c2410c' : '#16a34a',
                border: hasBlockers ? '1px solid #ffedd5' : '1px solid #dcfce7'
              }}>
                {hasBlockers ? <FaExclamationTriangle /> : <FaCheck />}
                <span>{hasBlockers ? `${blockers.length} Blockers Detected` : 'All Pre-Close Verification Checks Passed'}</span>
              </div>
            </div>

            {/* Verification Status Alert Banner */}
            <div style={{
              background: hasBlockers ? '#fef2f2' : '#f0fdf4',
              border: hasBlockers ? '1px solid #fecaca' : '1px solid #bbf7d0',
              color: hasBlockers ? '#991b1b' : '#166534',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '12.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '16px'
            }}>
              {hasBlockers ? (
                <FaExclamationTriangle style={{ fontSize: '16px', color: '#dc2626', flexShrink: 0 }} />
              ) : (
                <FaCheckCircle style={{ fontSize: '16px', color: '#16a34a', flexShrink: 0 }} />
              )}
              <span>
                {hasBlockers
                  ? `Warning: Found ${blockerBreakdown.activeTables.length} active tables, ${blockerBreakdown.pendingKOTs.length} open KOTs, and ${blockerBreakdown.unpaidBills.length} unpaid bills. Day close requires settlement or manager override.`
                  : 'All operational checks clear. No active dining tables, un-bumped KOTs, or unpaid bills for this session.'}
              </span>
            </div>

            {/* Checklist items grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Active Dining Tables</div>
                <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px', color: blockerBreakdown.activeTables.length > 0 ? '#ea580c' : '#16a34a' }}>
                  {blockerBreakdown.activeTables.length === 0 ? '✓ 0 Active' : `⚠️ ${blockerBreakdown.activeTables.length} Active`}
                </div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Pending Kitchen KOTs</div>
                <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px', color: blockerBreakdown.pendingKOTs.length > 0 ? '#ea580c' : '#16a34a' }}>
                  {blockerBreakdown.pendingKOTs.length === 0 ? '✓ 0 Pending' : `⚠️ ${blockerBreakdown.pendingKOTs.length} Active`}
                </div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Unpaid Bills Requiring Settlement</div>
                <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px', color: blockerBreakdown.unpaidBills.length > 0 ? '#ea580c' : '#16a34a' }}>
                  {blockerBreakdown.unpaidBills.length === 0 ? '✓ 0 Unpaid' : `⚠️ ${blockerBreakdown.unpaidBills.length} Bills (₹${financials.outstandingBalance.toFixed(2)})`}
                </div>
              </div>

              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748b' }}>Operating Cutoff Time</div>
                <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '2px', color: '#0f172a' }}>
                  {closingCutoff} (Configurable)
                </div>
              </div>
            </div>

            {/* Detailed Blocker List if present */}
            {hasBlockers && (
              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '12px 14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', marginBottom: '8px' }}>
                  Identified Operational Blockers:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {blockers.map((b, idx) => (
                    <div key={idx} style={{ fontSize: '12px', color: '#78350f', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#d97706' }}>•</span>
                      <span><strong>[{b.type}]</strong> {b.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── SALES RECONCILED & PAYMENT METHODS GRID ───────────────────── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '20px',
            marginBottom: '20px'
          }}>
            {/* Sales Reconciled Panel */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '12px',
                marginBottom: '16px'
              }}>
                <FaFileInvoice style={{ color: '#0d9488', fontSize: '16px' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>
                  Sales Reconciled (DB Source of Truth)
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f8fafc', fontSize: '13px' }}>
                  <span style={{ color: '#475569' }}>Gross Sales ({financials.billCount} bills)</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>₹{financials.grossSales.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f8fafc', fontSize: '13px' }}>
                  <span style={{ color: '#475569' }}>Discounts (Item + Bill)</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#64748b' }}>-₹{financials.discounts.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f8fafc', fontSize: '13px' }}>
                  <span style={{ color: '#475569' }}>Taxable Sales</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>₹{financials.taxableSales.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f8fafc', fontSize: '13px' }}>
                  <span style={{ color: '#475569' }}>Tax Collected (CGST / SGST)</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>₹{financials.taxCollected.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f8fafc', fontSize: '13px' }}>
                  <span style={{ color: '#475569' }}>Net Sales (Gross - Disc + Tax)</span>
                  <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>₹{financials.netGrandTotal.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f8fafc', fontSize: '13px' }}>
                  <span style={{ color: '#475569' }}>Refunds / Cancelled Bills</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace', color: '#ef4444' }}>-₹{financials.refunds.toFixed(2)}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: '#f0fdf4',
                  borderRadius: '6px',
                  border: '1px solid #dcfce7',
                  fontSize: '13.5px',
                  marginTop: '4px'
                }}>
                  <span style={{ fontWeight: 800, color: '#166534' }}>Total Payments Collected</span>
                  <span style={{ fontWeight: 900, fontFamily: 'monospace', color: '#15803d', fontSize: '14px' }}>
                    ₹{financials.totalCollected.toFixed(2)}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: financials.outstandingBalance > 0 ? '#fff7ed' : '#f8fafc',
                  borderRadius: '6px',
                  border: financials.outstandingBalance > 0 ? '1px solid #ffedd5' : '1px solid #e2e8f0',
                  fontSize: '13px'
                }}>
                  <span style={{ fontWeight: 700, color: financials.outstandingBalance > 0 ? '#c2410c' : '#64748b' }}>
                    Outstanding / Unpaid Bills ({financials.unpaidCount})
                  </span>
                  <span style={{ fontWeight: 800, fontFamily: 'monospace', color: financials.outstandingBalance > 0 ? '#ea580c' : '#64748b' }}>
                    ₹{financials.outstandingBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Methods Breakdown Panel */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '12px',
                marginBottom: '16px'
              }}>
                <FaCreditCard style={{ color: '#0d9488', fontSize: '16px' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>
                  Payment Methods Breakdown
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaMoneyBillWave style={{ color: '#16a34a' }} />
                    <span style={{ fontWeight: 600 }}>Cash</span>
                  </div>
                  <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>₹{financials.tenderBreakdown.cash.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaCreditCard style={{ color: '#0284c7' }} />
                    <span style={{ fontWeight: 600 }}>Card (EDC / Swipe)</span>
                  </div>
                  <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>₹{financials.tenderBreakdown.card.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaQrcode style={{ color: '#8b5cf6' }} />
                    <span style={{ fontWeight: 600 }}>UPI / QR Pay</span>
                  </div>
                  <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>₹{financials.tenderBreakdown.upi.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaBed style={{ color: '#ea580c' }} />
                    <span style={{ fontWeight: 600 }}>Room Ledger (Folio)</span>
                  </div>
                  <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>₹{financials.tenderBreakdown.room.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaGift style={{ color: '#a855f7' }} />
                    <span style={{ fontWeight: 600 }}>Complimentary / NC</span>
                  </div>
                  <span style={{ fontWeight: 800, fontFamily: 'monospace' }}>₹{financials.tenderBreakdown.complimentary.toFixed(2)}</span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: '#f1f5f9',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  marginTop: '8px'
                }}>
                  <span style={{ fontWeight: 800, color: '#0f172a' }}>Total Tender Settled</span>
                  <span style={{ fontWeight: 900, fontFamily: 'monospace', color: '#0f172a', fontSize: '14px' }}>
                    ₹{financials.totalCollected.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Cash Drawer Reconciliation Panel */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '20px 24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                borderBottom: '1px solid #f1f5f9',
                paddingBottom: '12px',
                marginBottom: '16px'
              }}>
                <FaCalculator style={{ color: '#0d9488', fontSize: '16px' }} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>
                  Cash Drawer Reconciliation
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: '#475569' }}>Expected Cash (System Recorded)</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>₹{financials.expectedCash.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                    Actual Cash Counted (Physical Drawer)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748b' }}>₹</span>
                    <input
                      type="number"
                      placeholder={financials.expectedCash.toString()}
                      value={actualCashCounted}
                      onChange={(e) => setActualCashCounted(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: 700,
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: financials.cashVariance === 0 ? '#f0fdf4' : '#fef2f2',
                  borderRadius: '6px',
                  border: financials.cashVariance === 0 ? '1px solid #dcfce7' : '1px solid #fecaca',
                  fontSize: '13px',
                  marginTop: '10px'
                }}>
                  <span style={{ fontWeight: 700, color: financials.cashVariance === 0 ? '#166534' : '#991b1b' }}>
                    Cash Variance ({financials.cashVariance >= 0 ? 'Over' : 'Short'})
                  </span>
                  <span style={{
                    fontWeight: 900,
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    color: financials.cashVariance === 0 ? '#15803d' : '#dc2626'
                  }}>
                    {financials.cashVariance >= 0 ? '+' : ''}₹{financials.cashVariance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ─── AUDIT HISTORY LOG TABLE ─────────────────────────────────── */
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #f1f5f9',
            paddingBottom: '12px',
            marginBottom: '16px'
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px', margin: 0 }}>
              Night Audit Historical Log (PostgreSQL `mpos_startday_endday`)
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              Showing {auditLogs.length} archived business closings
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 700 }}>Audit Date</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 700 }}>Closed At</th>
                  <th style={{ textAlign: 'left', padding: '10px 12px', color: '#64748b', fontWeight: 700 }}>Auditor</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', color: '#64748b', fontWeight: 700 }}>Gross Sales</th>
                  <th style={{ textAlign: 'right', padding: '10px 12px', color: '#64748b', fontWeight: 700 }}>Collected</th>
                  <th style={{ textAlign: 'center', padding: '10px 12px', color: '#64748b', fontWeight: 700 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#94a3b8' }}>
                      No archived audits found in database.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800 }}>{formatAuditDate(log.auditDate)}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{log.closedAt}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{log.auditor}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 700 }}>₹{Number(log.grossSales || 0).toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: 'monospace', fontWeight: 800, color: '#16a34a' }}>₹{Number(log.totalCollected || 0).toFixed(2)}</td>
                      <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: '#dcfce7',
                          color: '#15803d'
                        }}>
                          {log.status || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── CONFIRMATION MODAL ──────────────────────────────── */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#0f172a',
              color: '#ffffff',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 800 }}>
                <FaMoon style={{ color: '#38bdf8' }} />
                <span>Confirm Day-End Night Audit</span>
              </div>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <p style={{ margin: '0 0 14px 0', fontSize: '13.5px', color: '#334155', lineHeight: 1.5 }}>
                You are about to close business operations for <strong>{selectedOutlet}</strong> on <strong>{formatAuditDate(currentDate)}</strong>.
              </p>

              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '12.5px',
                color: '#475569',
                marginBottom: '16px'
              }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>Automated Actions:</div>
                <div>• All daily revenue, cash, and tax totals will be locked in PostgreSQL.</div>
                <div>• Current operating session will be marked closed.</div>
                <div>• Business date will safely advance to next operating day.</div>
              </div>

              {hasBlockers && (
                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  color: '#92400e',
                  borderRadius: '6px',
                  padding: '12px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  marginBottom: '16px'
                }}>
                  <div style={{ fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaExclamationTriangle />
                    <span>Authorized Override Required:</span>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    The system detected {blockers.length} operational blockers ({blockerBreakdown.activeTables.length} active tables, {blockerBreakdown.pendingKOTs.length} open KOTs, {blockerBreakdown.unpaidBills.length} unpaid bills).
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#78350f', marginBottom: '4px' }}>
                      Manager Override Reason / Note:
                    </label>
                    <input
                      type="text"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="e.g., Kitchen closed; remaining items cleared by duty manager"
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #d97706',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  onClick={() => setShowConfirmModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => executeNightAudit(hasBlockers)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: hasBlockers ? '#b45309' : '#0d9488',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FaCheck />
                  <span>{hasBlockers ? 'Confirm Override & Close Day' : 'Execute Night Audit'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── AUTHORIZED OVERRIDE MODAL ──────────────────────── */}
      {showOverrideConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '520px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#b45309',
              color: '#ffffff',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', fontWeight: 800 }}>
                <FaExclamationTriangle />
                <span>Authorized Manager Override Required</span>
              </div>
              <button
                onClick={() => setShowOverrideConfirm(false)}
                style={{ background: 'none', border: 'none', color: '#fed7aa', cursor: 'pointer', fontSize: '16px' }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              <p style={{ margin: '0 0 12px 0', fontSize: '13.5px', color: '#334155', lineHeight: 1.5 }}>
                The system detected the following operational blockers preventing standard closure:
              </p>

              <div style={{
                maxHeight: '140px',
                overflowY: 'auto',
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: '6px',
                padding: '10px 14px',
                marginBottom: '16px',
                fontSize: '12px',
                color: '#78350f'
              }}>
                {blockers.map((b, idx) => (
                  <div key={idx} style={{ marginBottom: '4px' }}>• {b.message}</div>
                ))}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>
                  Override Justification / Reason:
                </label>
                <textarea
                  rows={2}
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g., Unpaid bills verified with night manager; to be collected tomorrow morning."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  onClick={() => setShowOverrideConfirm(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#475569',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => executeNightAudit(true)}
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#b45309',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FaShieldAlt />
                  <span>Confirm Override & Close Day</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── AUDIT STEP PROGRESS OVERLAY ──────────────────────────────────── */}
      {isAuditing && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '440px',
            padding: '28px 24px',
            textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: '#f0fdfa',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              margin: '0 auto 16px auto'
            }}>
              <FaSpinner className="animate-spin" />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 6px 0', color: '#0f172a' }}>
              Executing Night Audit...
            </h3>
            <p style={{ margin: '0 0 20px 0', fontSize: '12.5px', color: '#64748b' }}>
              Finalizing daily reconciliations and advancing business calendar
            </p>

            <div style={{
              background: '#f8fafc',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '12px',
              color: '#0d9488',
              fontWeight: 700,
              border: '1px solid #ccfbf1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <span>Step {auditStep} of 5:</span>
              <span>
                {auditStep === 1 && 'Auditing active tables and settling open checks...'}
                {auditStep === 2 && 'Verifying kitchen order tickets and routing logs...'}
                {auditStep === 3 && 'Reconciling payment tenders and cashier drawer balance...'}
                {auditStep === 4 && 'Archiving daily sales ledger and tax snapshots...'}
                {auditStep === 5 && 'Advancing authoritative software business date...'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NightAuditDashboard;
