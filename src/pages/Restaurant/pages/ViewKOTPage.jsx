import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LuEye, LuPencil, LuTrash2, LuCheck, LuChefHat, LuPrinter, LuRefreshCw } from 'react-icons/lu';

import PageHeader from '../../../components/common/PageHeader';
import CommonModal from '../../../components/common/CommonModal';
import CancelKOTModal from '../components/CancelKOTModal';
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
  return String(tableVal).trim();
};

const ViewKOTPage = () => {
  const navigate = useNavigate();
  const { outletId } = useParams();
  const { tables, setTables, activeStoreId, setOrderItemsMap, refreshTables } = useRestaurant();

  const [selected, setSelected]         = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [areaFilter, setAreaFilter]     = useState('All Areas');
  const [orderTypeFilter, setOrderTypeFilter] = useState('All Orders');
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
        const activeOutletId = localStorage.getItem('activeOutletId') || 'STORE_1';
        const [catRes, printRes, menuRes] = await Promise.allSettled([
          apiClient.get('/production-categories', { params: { store_id: activeOutletId } }),
          apiClient.get('/printers', { params: { store_id: activeOutletId } }),
          apiClient.get('/menu-items', { params: { store_id: activeOutletId } })
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

  // ── Apply kitchen-status and area filter on top of active/inactive ──────────────────
  const availableAreas = useMemo(() => {
    const areaSet = new Set(['All Areas']);
    tables.forEach(t => {
      const a = t.area_name || t.area;
      if (a && String(a).trim()) areaSet.add(String(a).trim());
    });
    return Array.from(areaSet);
  }, [tables]);

  const kots = useMemo(() => {
    let rows = [...dbKots];
    if (statusFilter !== 'All') rows = rows.filter(k => k.status === statusFilter);
    if (areaFilter !== 'All Areas') {
      rows = rows.filter(k => {
        const matchingTable = tables.find(t => String(t.id) === String(k.table_id) || t.no === k.tableId);
        return matchingTable && (matchingTable.area_name === areaFilter || matchingTable.area === areaFilter);
      });
    }
    if (orderTypeFilter !== 'All Orders') {
      rows = rows.filter(k => {
        const extra = typeof k.extra_details === 'string' ? JSON.parse(k.extra_details || '{}') : (k.extra_details || {});
        const kotOrderType = extra.order_type || k.order_type || (String(k.tableId).startsWith('TK-') ? 'Takeaway' : String(k.tableId).startsWith('DL-') ? 'Delivery' : 'Dine In');
        
        if (orderTypeFilter === 'Dine In') return kotOrderType === 'Dine In' || kotOrderType === 'DINE_IN';
        if (orderTypeFilter === 'Takeaway') return kotOrderType === 'Takeaway' || kotOrderType === 'TAKEAWAY';
        if (orderTypeFilter === 'Delivery') return kotOrderType === 'Delivery' || kotOrderType === 'DELIVERY';
        return true;
      });
    }
    return rows;
  }, [dbKots, statusFilter, areaFilter, orderTypeFilter, tables]);

  const counts = useMemo(() => ({
    All: dbKots.filter(k => areaFilter === 'All Areas' || (tables.find(t => String(t.id) === String(k.table_id) || t.no === k.tableId)?.area_name === areaFilter || tables.find(t => String(t.id) === String(k.table_id) || t.no === k.tableId)?.area === areaFilter)).length,
    ...Object.fromEntries(KITCHEN_STATUSES.map(s => [s, dbKots.filter(k => k.status === s && (areaFilter === 'All Areas' || (tables.find(t => String(t.id) === String(k.table_id) || t.no === k.tableId)?.area_name === areaFilter || tables.find(t => String(t.id) === String(k.table_id) || t.no === k.tableId)?.area === areaFilter))).length])),
  }), [dbKots, areaFilter, tables]);

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
      
      const extra = typeof kot.extra_details === 'string' ? JSON.parse(kot.extra_details || '{}') : (kot.extra_details || {});
      const isNC = extra.isNC || kot.isNC || kot.ncType || String(kot.remarks || '').toUpperCase().includes('NC');
      const cleanServerNo = String(kot.id).replace(/[^0-9]/g, '');
      const formattedKotNo = isNC ? `KOT-FREE-${cleanServerNo}` : `KOT-${cleanServerNo}`;

      const payloads = groups.map(g => generateKOTPayload({
        tableNo: kot.tableId,
        tableId: kot.tableId,
        kotNo: formattedKotNo,
        group: g,
        waiter: kot.waiter || 'Staff',
        remarks: kot.remark || kot.remarks || kot.note || extra.remarks || '',
        isReprint
      }));
      printAllStationKOTs(payloads);
    }
  };

  const handleViewInPOS = (kot) => {
    const kotIdVal = kot.kotId || kot.id;
    const activeItems = (kot.items || []).filter(item => item.status !== 'Cancelled' && String(item.status) !== '5' && item.is_active !== 0 && item.status !== 'Deleted');
    const basePath = outletId ? `/pos/master/outlet/${outletId}/pos-billing` : '/restaurant/pos-billing';
    navigate(`${basePath}?kotId=${kotIdVal}`, {
      state: { kotId: kotIdVal, isKotView: true, kot, rows: activeItems }
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

        {/* Status filter pills removed as requested */}

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

          <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap', marginLeft: '4px' }}>Area:</label>
          <select
            value={areaFilter}
            onChange={e => setAreaFilter(e.target.value)}
            style={{
              padding: '7px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
              border: '1.5px solid #e2e8f0', background: '#fff', color: '#1e293b',
              cursor: 'pointer', outline: 'none', minWidth: '140px',
            }}
          >
            {availableAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>

          <label style={{ fontSize: '13px', fontWeight: '600', color: '#475569', whiteSpace: 'nowrap', marginLeft: '4px' }}>Type:</label>
          <select
            value={orderTypeFilter}
            onChange={e => setOrderTypeFilter(e.target.value)}
            style={{
              padding: '7px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
              border: '1.5px solid #e2e8f0', background: '#fff', color: '#1e293b',
              cursor: 'pointer', outline: 'none', minWidth: '140px',
            }}
          >
            <option value="All Orders">All Orders</option>
            <option value="Dine In">Dine In</option>
            <option value="Takeaway">Takeaway</option>
            <option value="Delivery">Delivery</option>
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
              {['Table', 'Area', 'KOT No.', 'Date', 'Time', 'Items', 'Waiter', 'State', 'Actions'].map(h => (
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
                    {(() => {
                      const matchingTable = tables.find(t => String(t.id) === String(kot.table_id) || t.no === kot.tableId);
                      const displayTableName = matchingTable 
                        ? (matchingTable.table_name || `T${parseInt(matchingTable.no || matchingTable.table_no || '1', 10)}`)
                        : (kot.tableName || formatTableNoDisplay(kot.tableId));
                      
                      return (
                        <div style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          height: '32px', padding: '0 10px', borderRadius: '9px',
                          background: closed ? '#f1f5f9' : '#f0fdfa',
                          border: `1.5px solid ${closed ? '#e2e8f0' : '#99f6e4'}`,
                          fontWeight: '800', fontSize: '13px',
                          color: closed ? '#94a3b8' : '#0f766e', whiteSpace: 'nowrap',
                        }}>
                          {(() => {
                            const extra = typeof kot.extra_details === 'string' ? JSON.parse(kot.extra_details || '{}') : (kot.extra_details || {});
                            if (extra.takeaway_no) return extra.takeaway_no;
                            if (extra.delivery_no) return extra.delivery_no;
                            if (String(kot.tableId).startsWith('TK-') || String(kot.tableId).startsWith('DL-')) return kot.tableId;
                            return displayTableName;
                          })()}
                        </div>
                      );
                    })()}
                  </td>

                  {/* Area */}
                  <td style={{ padding: '12px 14px', fontSize: '13px', fontWeight: '700', color: '#334155', textTransform: 'uppercase' }}>
                    {(() => {
                      const matchingTable = tables.find(t => String(t.id) === String(kot.table_id) || t.no === kot.tableId);
                      return matchingTable?.area || matchingTable?.area_name || '—';
                    })()}
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
                        </>
                      )}

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
            {(() => {
              const extra = typeof selected.extra_details === 'string' ? JSON.parse(selected.extra_details || '{}') : (selected.extra_details || {});
              if (extra.takeaway_no) return extra.takeaway_no;
              if (extra.delivery_no) return extra.delivery_no;
              return formatTableNoDisplay(selected.tableId);
            })()} &nbsp;·&nbsp; {selected.date} &nbsp;·&nbsp; {selected.time} &nbsp;·&nbsp; {selected.waiter}
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
      <CancelKOTModal
        isOpen={!!kotToCancel}
        onClose={() => setKotToCancel(null)}
        kots={kotToCancel ? [kotToCancel] : []}
        onCancelSuccess={() => {
          const targetTableId = kotToCancel?.tableId || kotToCancel?.table_id;
          const targetTableNo = kotToCancel?.tableNo || kotToCancel?.table_no || kotToCancel?.table_name;
          if (targetTableId) {
            try { sessionStorage.removeItem(`alfa_draft_rows_${targetTableId}`); } catch(e){}
            try { sessionStorage.removeItem('alfa_selected_pos_table'); } catch(e){}
            if (typeof setOrderItemsMap === 'function') {
              setOrderItemsMap(prev => {
                const newMap = { ...prev };
                delete newMap[targetTableId];
                if (targetTableNo) delete newMap[targetTableNo];
                return newMap;
              });
            }
          }
          setKotToCancel(null);
          loadKots(activeFilter); // re-fetch to ensure KOT list is updated
          if (typeof refreshTables === 'function') refreshTables(); // re-fetch tables to update currentTable.kots
        }}
      />
    </div>
  );
};

export default ViewKOTPage;
