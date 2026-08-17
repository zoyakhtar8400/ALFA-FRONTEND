import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuEye, LuPencil, LuTrash2, LuCheck, LuChefHat, LuPrinter, LuRefreshCw } from 'react-icons/lu';

import PageHeader from '../../../components/common/PageHeader';
import CommonModal from '../../../components/common/CommonModal';
import { useRestaurant } from '../../../context/RestaurantContext';
import { printKitchenKOT, printTaxInvoice, printStationKOT } from '../utils/printInvoice';
import { kotService } from '../../../services/kotService';
import { groupItemsByPrinter, generateKOTPayload, printAllStationKOTs } from '../services/kotEngine';
import apiClient from '../../../services/apiClient';

const STATUS_CONFIG = {
  'Sent to Kitchen': { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  'Cooking':         { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  'Ready':           { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  'Served':          { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
  'Closed':          { bg: '#f1f5f9', color: '#94a3b8', border: '#e2e8f0' },
  'Cancelled':       { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

const KITCHEN_STATUSES = ['Sent to Kitchen', 'Cooking', 'Ready', 'Served'];

const formatTableNoDisplay = (tableVal) => {
  if (!tableVal) return 'T--';
  const str = String(tableVal).trim();
  const numMatches = str.match(/\d+/);
  if (numMatches) return `T${numMatches[0].padStart(2, '0')}`;
  return str.startsWith('T') ? str : `T${str}`;
};

const ViewKOTPage = () => {
  const navigate = useNavigate();
  const { setTables, activeStoreId } = useRestaurant();

  const [selected, setSelected]         = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [activeFilter, setActiveFilter] = useState('active'); // 'active' | 'inactive' | 'all'
  const [loadingKots, setLoadingKots]   = useState(false);
  const [dbKots, setDbKots]             = useState([]);
  const [kotToCancel, setKotToCancel]   = useState(null);
  const [kotCancelReason, setKotCancelReason] = useState('');
  const [kotCancelError, setKotCancelError]   = useState('');
  const [categories, setCategories]     = useState([]);
  const [printers, setPrinters]         = useState([]);
  const [menuItems, setMenuItems]       = useState([]);

  // Load masters for station routing
  useEffect(() => {
    async function loadMasters() {
      try {
        const [catRes, printRes, menuRes] = await Promise.allSettled([
          apiClient.get('/production-categories'),
          apiClient.get('/printers'),
          apiClient.get('/menu-items')
        ]);
        if (catRes.status === 'fulfilled' && catRes.value) {
          setCategories(catRes.value.data || catRes.value || []);
        }
        if (printRes.status === 'fulfilled' && printRes.value) {
          setPrinters(printRes.value.data || printRes.value || []);
        }
        if (menuRes.status === 'fulfilled' && menuRes.value) {
          setMenuItems(menuRes.value.data || menuRes.value || []);
        }
      } catch (e) {
        console.warn('Error loading masters in ViewKOTPage:', e);
      }
    }
    loadMasters();
  }, []);

  // ── Fetch from backend with active/inactive/all param ──────────────────────
  const loadKots = async (filterVal) => {
    try {
      setLoadingKots(true);
      const activeParam = (filterVal === 'active') ? '1' : (filterVal === 'inactive') ? '0' : 'all';
      const res = await kotService.getKOTList({ active: activeParam, store_id: activeStoreId });
      let rawKots = res?.kots || res?.data || [];
      if (Array.isArray(rawKots)) {
        if (filterVal === 'cancelled') {
          rawKots = rawKots.filter(k => k.status === 'Cancelled');
        } else if (filterVal === 'nc') {
          rawKots = rawKots.filter(k => {
            const extra = typeof k.extra_details === 'string' ? JSON.parse(k.extra_details || '{}') : k.extra_details;
            return (
              extra?.isNC || k.isNC || k.ncType ||
              String(k.remarks || k.comment || '').toUpperCase().includes('NC') ||
              String(k.customer_name || '').toUpperCase().includes('NC') ||
              (k.items && k.items.some(item => String(item.itemName || '').toUpperCase().includes('NC') || Number(item.unitPrice || item.price || 0) === 0))
            );
          });
        }
        setDbKots(rawKots);
      }
    } catch (err) {
      console.warn('Error loading KOTs:', err);
    } finally {
      setLoadingKots(false);
    }
  };

  useEffect(() => { loadKots(activeFilter); }, [activeFilter, activeStoreId]);

  // inject spinner keyframes once
  useEffect(() => {
    if (!document.getElementById('view-kot-spinner')) {
      const s = document.createElement('style');
      s.id = 'view-kot-spinner';
      s.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
      document.head.appendChild(s);
    }
  }, []);

  // ── Apply kitchen-status filter on top of active/inactive ──────────────────
  const kots = useMemo(() => {
    let rows = [...dbKots];
    if (statusFilter !== 'All') rows = rows.filter(k => k.status === statusFilter);
    return rows;
  }, [dbKots, statusFilter]);

  const counts = useMemo(() => ({
    All: dbKots.length,
    ...Object.fromEntries(KITCHEN_STATUSES.map(s => [s, dbKots.filter(k => k.status === s).length])),
  }), [dbKots]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleStatusChange = async (kotId, nextStatus) => {
    try {
      setLoadingKots(true);
      await kotService.updateKOTStatus(kotId, { status: nextStatus });
      setDbKots(prev => prev.map(k => k.kotId === kotId ? { ...k, status: nextStatus } : k));
      setTables(prev => prev.map(t => ({
        ...t,
        kots: (t.kots || []).map(k => k.kotId === kotId ? { ...k, status: nextStatus } : k),
      })));
      window.showToast?.(`KOT updated to ${nextStatus}`, 'success');
    } catch (err) {
      window.showToast?.('Failed to update KOT status', 'error');
    } finally {
      setLoadingKots(false);
    }
  };

  const handleDelete = (kot) => {
    if (!kot) return;
    setKotToCancel(kot);
    setKotCancelReason('');
    setKotCancelError('');
  };

  const confirmDelete = async () => {
    if (!kotCancelReason.trim()) {
      setKotCancelError('Cancellation reason is required');
      return;
    }

    try {
      setLoadingKots(true);
      await kotService.deleteKOT(kotToCancel.kotId, { reason: kotCancelReason });
      setDbKots(prev => prev.filter(k => k.kotId !== kotToCancel.kotId));
      setTables(prev => prev.map(t => ({ ...t, kots: (t.kots || []).filter(k => k.kotId !== kotToCancel.kotId) })));
      window.showToast?.(`KOT ${kotToCancel.id} cancelled successfully`, 'info');
      if (selected?.kotId === kotToCancel.kotId) setSelected(null);
      setKotToCancel(null);
    } catch (err) {
      window.showToast?.('Failed to cancel KOT', 'error');
    } finally {
      setLoadingKots(false);
    }
  };

  const handlePrint = (kot) => {
    const closed = kot.is_active === 0 || kot.status === 'Closed' || kot.status === 'Served';
    if (closed) {
      printTaxInvoice({ tableNo: kot.tableId, kotId: kot.id, items: kot.items || [], time: kot.time, status: kot.status });
    } else {
      const groups = groupItemsByPrinter(kot.items || [], menuItems, categories, printers);
      const isReprint = !!(kot.print_count && kot.print_count > 0);
      const payloads = groups.map(g => generateKOTPayload({
        tableNo: kot.tableId,
        tableId: kot.tableId,
        kotNo: kot.id,
        group: g,
        waiter: kot.waiter || 'Staff',
        isReprint
      }));
      printAllStationKOTs(payloads);
    }
  };

  const handleViewInPOS = (kot) => {
    const kotIdVal = kot.kotId || kot.id;
    navigate(`/restaurant/pos-billing?kotId=${kotIdVal}`, {
      state: { kotId: kotIdVal, isKotView: true, kot, rows: kot.items }
    });
  };

  const isClosed = (kot) => kot.is_active === 0 || kot.status === 'Closed';

  // ── Styles ─────────────────────────────────────────────────────────────────
  const iconBtn = (borderColor, bg, color, hoverBg) => ({
    base: { width: '30px', height: '30px', borderRadius: '7px', border: `1px solid ${borderColor}`, background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 140ms' },
    hover: { background: hoverBg, color: '#fff', borderColor: hoverBg },
  });

  return (
    <div style={{ padding: '24px', fontFamily: 'var(--font-family)', backgroundColor: 'var(--background)', minHeight: '100%' }}>
      <PageHeader title="Kitchen Order Tickets" breadcrumbs={['Restaurant', 'View KOT']} showBack={false} />

      {/* ── Controls row ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '12px', margin: '20px 0 16px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Status filter pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['All', ...KITCHEN_STATUSES].map(s => {
            const cfg = STATUS_CONFIG[s] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
            const active = statusFilter === s;
            return (
              <button key={s} onClick={() => setStatusFilter(s)} style={{
                padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700',
                cursor: 'pointer', transition: 'all 150ms',
                border: `1.5px solid ${active ? cfg.color : '#e2e8f0'}`,
                background: active ? cfg.bg : '#fff',
                color: active ? cfg.color : '#475569',
              }}>
                {s} <span style={{ marginLeft: '4px', fontSize: '11px', opacity: 0.7 }}>({counts[s] ?? 0})</span>
              </button>
            );
          })}
        </div>

        {/* Right-side controls: dropdown + refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap' }}>Show:</label>
          <select
            value={activeFilter}
            onChange={e => { setActiveFilter(e.target.value); setStatusFilter('All'); }}
            style={{
              padding: '7px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
              border: '1.5px solid #e2e8f0', background: '#fff', color: '#1e293b',
              cursor: 'pointer', outline: 'none', minWidth: '160px',
            }}
          >
            <option value="active">🟢 Active KOTs</option>
            <option value="inactive">🔴 Closed KOTs</option>
            <option value="cancelled">❌ Cancelled KOTs</option>
            <option value="nc">🍽️ NC (Non-Chargeable) KOTs</option>
            <option value="all">📋 All KOTs</option>
          </select>

          <button
            onClick={() => loadKots(activeFilter)}
            title="Refresh"
            style={{ padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', cursor: 'pointer', transition: 'all 150ms', display: 'flex', alignItems: 'center', gap: '6px' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#0e7490'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#475569'; }}
          >
            <LuRefreshCw size={13} /> Refresh
          </button>
        </div>
      </div>

      {/* ── KOT Table ─────────────────────────────────────────────────────── */}
      <div style={{ position: 'relative', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loadingKots && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, backdropFilter: 'blur(1px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '30px', height: '30px', border: '3px solid #e2e8f0', borderTopColor: '#418A8B', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Loading...</span>
            </div>
          </div>
        )}

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
              {['Table', 'KOT No.', 'Date', 'Time', 'Items', 'Waiter', 'State', 'Kitchen Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 14px', textAlign: h === 'Actions' ? 'center' : 'left', fontSize: '11.5px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kots.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '56px 24px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  <LuChefHat size={34} style={{ opacity: 0.25, display: 'block', margin: '0 auto 12px' }} />
                  {activeFilter === 'active'
                    ? 'No active KOTs. Cut a KOT from the Display Table to see it here.'
                    : activeFilter === 'inactive'
                    ? 'No closed KOTs found.'
                    : 'No KOTs found.'}
                </td>
              </tr>
            ) : kots.map((kot, i) => {
              const closed = isClosed(kot);
              const cfg = STATUS_CONFIG[kot.status] || STATUS_CONFIG['Cooking'];
              return (
                <tr
                  key={kot.kotId}
                  style={{ borderBottom: i < kots.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 140ms', opacity: closed ? 0.75 : 1 }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Table badge */}
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      height: '32px', padding: '0 10px', borderRadius: '9px',
                      background: closed ? '#f1f5f9' : '#f0fdfa',
                      border: `1.5px solid ${closed ? '#e2e8f0' : '#99f6e4'}`,
                      fontWeight: '800', fontSize: '13px',
                      color: closed ? '#94a3b8' : '#0f766e', whiteSpace: 'nowrap',
                    }}>
                      {formatTableNoDisplay(kot.tableId)}
                    </div>
                  </td>

                  {/* KOT No */}
                  <td style={{ padding: '12px 14px', fontSize: '14px', fontWeight: '800', color: closed ? '#94a3b8' : '#244E5F' }}>
                    <div>{kot.id}</div>
                    {(() => {
                      const extra = typeof kot.extra_details === 'string' ? JSON.parse(kot.extra_details || '{}') : kot.extra_details;
                      const isNC = extra?.isNC || kot.isNC || kot.ncType;
                      const typeText = extra?.ncType || kot.ncType || 'Complimentary';
                      if (isNC) {
                        return (
                          <span style={{
                            display: 'inline-block',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: '800',
                            backgroundColor: '#fee2e2',
                            color: '#ef4444',
                            border: '1px solid #fca5a5',
                            marginTop: '2px',
                            whiteSpace: 'nowrap'
                          }}>
                            NC: {typeText}
                          </span>
                        );
                      }
                      return null;
                    })()}
                  </td>

                  {/* Date */}
                  <td style={{ padding: '12px 14px', fontSize: '12.5px', color: '#64748b', fontWeight: '600' }}>
                    {kot.date || '—'}
                  </td>

                  {/* Time */}
                  <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                    {kot.time}
                  </td>

                  {/* Items count */}
                  <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                    {kot.items.length} {kot.items.length === 1 ? 'item' : 'items'}
                  </td>

                  {/* Waiter */}
                  <td style={{ padding: '12px 14px', fontSize: '13px', color: '#64748b' }}>
                    {kot.waiter || '—'}
                  </td>

                  {/* Active / Closed state badge */}
                  <td style={{ padding: '12px 14px' }}>
                    {kot.status === 'Cancelled' ? (
                      <span style={{ fontSize: '12.5px', color: '#dc2626', fontWeight: '700', fontStyle: 'italic' }}>
                        {kot.cancel_reason || 'Cancelled'}
                      </span>
                    ) : (
                      <span style={{
                        padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                        background: closed ? '#fee2e2' : '#dcfce7',
                        color: closed ? '#dc2626' : '#15803d',
                        border: `1px solid ${closed ? '#fecaca' : '#bbf7d0'}`,
                      }}>
                        {closed ? '● Closed' : '● Active'}
                      </span>
                    )}
                  </td>

                  {/* Kitchen status dropdown (active only) or static badge (closed) */}
                  <td style={{ padding: '12px 14px' }}>
                    {closed ? (
                      <span style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}` }}>
                        {kot.status}
                      </span>
                    ) : (
                      <select
                        value={kot.status}
                        onChange={e => handleStatusChange(kot.kotId, e.target.value)}
                        style={{ padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', border: `1.5px solid ${cfg.border}`, background: cfg.bg, color: cfg.color, cursor: 'pointer', outline: 'none' }}
                      >
                        {KITCHEN_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      {/* View & Edit — only for active KOTs */}
                      {!closed && (
                        <>
                          <button
                            onClick={() => handleViewInPOS(kot)}
                            title="View in POS Billing"
                            style={{ width: '30px', height: '30px', borderRadius: '7px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 140ms' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#1d4ed8'; }}
                          >
                            <LuEye size={13} />
                          </button>
                          <button
                            onClick={() => handleViewInPOS(kot)}
                            title="Edit in POS Billing"
                            style={{ width: '30px', height: '30px', borderRadius: '7px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 140ms' }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#15803d'; e.currentTarget.style.color = '#fff'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#15803d'; }}
                          >
                            <LuPencil size={13} />
                          </button>
                        </>
                      )}

                      {/* Print — always available */}
                      <button
                        onClick={() => handlePrint(kot)}
                        title="Print KOT"
                        style={{ width: '30px', height: '30px', borderRadius: '7px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 140ms' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#0e7490'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#0e7490'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                      >
                        <LuPrinter size={13} />
                      </button>

                      {/* Details modal */}
                      <button
                        onClick={() => setSelected(kot)}
                        title="View Details"
                        style={{ width: '30px', height: '30px', borderRadius: '7px', border: '1px solid #e0f2fe', background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 140ms' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#0284c7'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f0f9ff'; e.currentTarget.style.color = '#0284c7'; }}
                      >
                        <LuChefHat size={13} />
                      </button>

                      {/* Delete */}
                      {kot.status !== 'Cancelled' && kot.is_active !== 0 && kot.status !== 'Closed' && (
                        <button
                          onClick={() => handleDelete(kot)}
                          title="Cancel KOT"
                          style={{ width: '30px', height: '30px', borderRadius: '7px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 140ms' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                        >
                          <LuTrash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── KOT Detail Modal ──────────────────────────────────────────────── */}
      {selected && (
        <CommonModal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={`KOT Details — ${selected.id}`}
          maxWidth="480px"
        >
           <div style={{ fontSize: '13px', color: '#64748b', marginTop: '-6px', marginBottom: '16px' }}>
            {formatTableNoDisplay(selected.tableId)} &nbsp;·&nbsp; {selected.date} &nbsp;·&nbsp; {selected.time} &nbsp;·&nbsp; {selected.waiter}
          </div>

          {selected.cancel_reason && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', color: '#dc2626', fontSize: '13px', fontWeight: '700', marginBottom: '16px' }}>
              <strong>Cancellation Reason:</strong> {selected.cancel_reason}
            </div>
          )}

          <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
            Order Items ({selected.items.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {selected.items.map((item, i) => {
              const name = (item.itemName || item.name) + (item.variantName ? ` (${item.variantName})` : '');
              const total = item.total || (item.qty * (item.unitPrice || item.price || 0));
              return (
                <div key={i} style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <LuChefHat size={14} color="#418A8B" />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{name}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#244E5F', background: '#e0f2fe', padding: '2px 10px', borderRadius: '20px' }}>×{item.qty}</span>
                  </div>
                  {total > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', paddingLeft: '22px', marginTop: '4px' }}>
                      <span>₹{item.unitPrice || item.price || 0} each</span>
                      <span style={{ fontWeight: '700' }}>₹{total}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {selected.status !== 'Cancelled' && selected.is_active !== 0 && selected.status !== 'Closed' && (
              <button
                onClick={() => { handleDelete(selected); }}
                style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1.5px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <LuTrash2 size={14} /> Cancel KOT
              </button>
            )}
            <button
              onClick={() => handlePrint(selected)}
              style={{ flex: 1.2, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <LuPrinter size={14} /> Print KOT
            </button>
            <button
              onClick={() => setSelected(null)}
              style={{ flex: 1.5, padding: '10px', borderRadius: '8px', border: 'none', background: '#418A8B', color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <LuCheck size={14} /> Close
            </button>
          </div>
        </CommonModal>
      )}

      {/* Custom Reason Modal for KOT cancellation */}
      {kotToCancel && (
        <CommonModal
          isOpen={!!kotToCancel}
          onClose={() => setKotToCancel(null)}
          title={`Cancel KOT — ${kotToCancel.id}`}
          maxWidth="440px"
        >
          <div style={{ padding: '8px 4px', display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: 'system-ui' }}>
            <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#1e293b', fontWeight: 800 }}>
              why do you want to cancel the KOT {kotToCancel.id}?
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <textarea
                placeholder="Enter cancellation reason..."
                rows={3}
                value={kotCancelReason}
                onChange={e => {
                  setKotCancelReason(e.target.value);
                  if (e.target.value.trim()) setKotCancelError('');
                }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: kotCancelError ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: '700',
                  outline: 'none',
                  background: '#f8fafc',
                  color: '#0f172a',
                  resize: 'none',
                  fontFamily: 'inherit'
                }}
                autoFocus
              />
              {kotCancelError && (
                <span style={{ fontSize: '0.72rem', color: '#ef4444', fontWeight: 700 }}>
                  {kotCancelError}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '6px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setKotToCancel(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#475569',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: '800',
                  cursor: 'pointer'
                }}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </CommonModal>
      )}
    </div>
  );
};

export default ViewKOTPage;
