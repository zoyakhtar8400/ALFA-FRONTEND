import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  LuEye,
  LuTrash2,
  LuCheck,
  LuChefHat,
  LuPrinter,
  LuRefreshCw,
  LuClock,
  LuSearch
} from 'react-icons/lu';
import { FaExclamationTriangle } from 'react-icons/fa';

import PageHeader from '../../../components/common/PageHeader';
import CommonModal from '../../../components/common/CommonModal';
import CancelKOTModal from '../components/CancelKOTModal';
import { useRestaurant } from '../../../context/RestaurantContext';
import { printTaxInvoice } from '../utils/printInvoice';
import { kotService } from '../../../services/kotService';
import { groupItemsByPrinter, generateKOTPayload, printAllStationKOTs } from '../services/kotEngine';
import apiClient from '../../../services/apiClient';
import { formatTableNo, formatTableLabel } from '../../../utils/tableFormat';

const STATUS_CONFIG = {
  'Sent to Kitchen': { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  'Cooking':         { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  'Ready':           { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  'Served':          { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
  'Closed':          { bg: '#f1f5f9', color: '#94a3b8', border: '#e2e8f0' },
  'Cancelled':       { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
};

const formatTableNoDisplay = (tableVal) => {
  if (!tableVal) return 'T--';
  return formatTableNo(tableVal);
};

const ViewKOTPage = () => {
  const navigate = useNavigate();
  const { outletId } = useParams();
  const { tables, setTables, activeStoreId, setOrderItemsMap, refreshTables } = useRestaurant();

  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [areaFilter, setAreaFilter] = useState('All Areas');
  const [orderTypeFilter, setOrderTypeFilter] = useState('All Orders');
  const [activeFilter, setActiveFilter] = useState('active'); // 'active' | 'inactive' | 'cancelled' | 'nc' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingKots, setLoadingKots] = useState(false);
  const [dbKots, setDbKots] = useState([]);
  const [kotToCancel, setKotToCancel] = useState(null);
  const [deleteAllModal, setDeleteAllModal] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const [categories, setCategories] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  // Check Admin Role
  const isUserAdmin = useMemo(() => {
    try {
      const userRaw = localStorage.getItem('alfa_user') || localStorage.getItem('user');
      if (!userRaw) return true;
      const u = JSON.parse(userRaw);
      const role = String(u.role || u.type || u.user_role || '').toUpperCase();
      return role === 'ADMIN' || role === 'SUPERADMIN' || u.username === 'admin' || u.role_id === 1;
    } catch {
      return true;
    }
  }, []);

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

  // Fetch KOTs from backend
  const loadKots = async (filterVal) => {
    try {
      setLoadingKots(true);
      const activeParam = (filterVal === 'active') ? '1' : (filterVal === 'inactive') ? '0' : 'all';
      const res = await kotService.getKOTList({ active: activeParam, store_id: activeStoreId });
      let rawKots = res?.kots || res?.data || [];
      if (Array.isArray(rawKots)) {
        const isNCKot = (k) => {
          const extra = typeof k.extra_details === 'string' ? JSON.parse(k.extra_details || '{}') : (k.extra_details || {});
          return (
            extra?.isNC || k.isNC || k.ncType ||
            String(k.remarks || k.comment || '').toUpperCase().includes('NC') ||
            String(k.customer_name || '').toUpperCase().includes('NC') ||
            (k.items && k.items.some(item => String(item.itemName || '').toUpperCase().includes('NC') || Number(item.unitPrice || item.price || 0) === 0))
          );
        };

        if (filterVal === 'nc') {
          rawKots = rawKots.filter(k => isNCKot(k));
        } else {
          rawKots = rawKots.filter(k => !isNCKot(k));
          if (filterVal === 'cancelled') {
            rawKots = rawKots.filter(k => k.status === 'Cancelled');
          }
        }
        setDbKots(rawKots);
      }
    } catch (err) {
      console.warn('Error loading KOTs:', err);
    } finally {
      setLoadingKots(false);
    }
  };

  useEffect(() => {
    loadKots(activeFilter);
  }, [activeFilter, activeStoreId]);

  const availableAreas = useMemo(() => {
    const areaSet = new Set(['All Areas']);
    tables.forEach(t => {
      const a = t.area_name || t.area;
      if (a && String(a).trim()) areaSet.add(String(a).trim());
    });
    return Array.from(areaSet);
  }, [tables]);

  // Filtered KOTs
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

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(k => {
        return (
          String(k.id).toLowerCase().includes(q) ||
          String(k.tableId).toLowerCase().includes(q) ||
          String(k.waiter).toLowerCase().includes(q) ||
          (k.items && k.items.some(i => String(i.itemName || i.name || '').toLowerCase().includes(q)))
        );
      });
    }

    return rows;
  }, [dbKots, statusFilter, areaFilter, orderTypeFilter, searchQuery, tables]);

  // Metrics
  const metrics = useMemo(() => {
    const total = dbKots.length;
    const active = dbKots.filter(k => k.is_active !== 0 && k.status !== 'Closed' && k.status !== 'Cancelled').length;
    const cooking = dbKots.filter(k => k.status === 'Cooking').length;
    const closed = dbKots.filter(k => k.is_active === 0 || k.status === 'Closed').length;
    return { total, active, cooking, closed };
  }, [dbKots]);

  const handlePrint = (kot) => {
    const closed = kot.is_active === 0 || kot.status === 'Closed' || kot.status === 'Served';
    if (closed) {
      printTaxInvoice({ tableNo: kot.tableId, kotId: kot.id, items: kot.items || [], time: kot.time, status: kot.status });
    } else {
      const groups = groupItemsByPrinter(kot.items || [], menuItems, categories, printers);
      const isReprint = true;
      const isRunningKOT = dbKots.some(k => String(k.tableId) === String(kot.tableId) && Number(k.numericKotId) < Number(kot.numericKotId));

      const extra = typeof kot.extra_details === 'string' ? JSON.parse(kot.extra_details || '{}') : (kot.extra_details || {});
      const isNC = extra.isNC || kot.isNC || kot.ncType || String(kot.remarks || '').toUpperCase().includes('NC') || String(kot.custom_bill_number || '').startsWith('NC-KOT');
      const cleanServerNo = String(kot.id).replace(/[^0-9]/g, '');
      const formattedKotNo = kot.custom_bill_number || (isNC ? `NC-KOT-${cleanServerNo.padStart(2, '0')}` : `KOT-${cleanServerNo.padStart(2, '0')}`);

      const payloads = groups.map(g => generateKOTPayload({
        tableNo: kot.tableId,
        tableId: kot.tableId,
        kotNo: formattedKotNo,
        group: g,
        waiter: kot.waiter || 'Staff',
        remarks: kot.remark || kot.remarks || kot.note || extra.remarks || '',
        isReprint,
        isRunningKOT
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

  const handleDeleteAllKots = async () => {
    setIsDeletingAll(true);
    try {
      await kotService.deleteAllKOTs();
      setDbKots([]);
      if (typeof refreshTables === 'function') refreshTables();
      window.showToast?.('All KOT history has been deleted permanently.', 'success');
    } catch (err) {
      window.showToast?.('Failed to delete all KOTs: ' + (err.message || 'Server error'), 'error');
    } finally {
      setIsDeletingAll(false);
      setDeleteAllModal(false);
    }
  };

  const isClosed = (kot) => kot.is_active === 0 || kot.status === 'Closed';

  return (
    <div style={{ padding: '24px', fontFamily: 'var(--font-family, system-ui)', backgroundColor: '#f8fafc', minHeight: '100%' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#0d9488', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
            <LuChefHat />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Kitchen Order Tickets (KOT)
            </h1>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Real-time monitoring of station orders, active preparation tickets & kitchen status
            </span>
          </div>
        </div>

        {/* Delete All KOTs (ADMIN ONLY) */}
        {isUserAdmin && (
          <button
            type="button"
            onClick={() => setDeleteAllModal(true)}
            style={{
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              color: '#dc2626',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
          >
            <LuTrash2 size={13} />
            <span>Delete All KOTs</span>
            <span style={{ background: '#fee2e2', color: '#991b1b', fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase' }}>Admin</span>
          </button>
        )}
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '14px 16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Active Kitchen KOTs</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0d9488', marginTop: '3px' }}>{metrics.active}</div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Live on kitchen stations</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '14px 16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Cooking / Preparing</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#2563eb', marginTop: '3px' }}>{metrics.cooking}</div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Under preparation</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '14px 16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Closed / Served</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#64748b', marginTop: '3px' }}>{metrics.closed}</div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Completed orders</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '14px 16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Tickets</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginTop: '3px' }}>{metrics.total}</div>
          <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>In current view</div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '14px 16px', marginBottom: '18px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <LuSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '0.85rem' }} />
            <input
              type="text"
              placeholder="Search KOT No, table, waiter, dish..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '8px 12px 8px 32px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.82rem',
                outline: 'none',
                color: '#0f172a'
              }}
            />
          </div>

          {/* Status Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Show:</span>
              <select
                value={activeFilter}
                onChange={e => { setActiveFilter(e.target.value); setStatusFilter('All'); }}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#1e293b',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="active">🟢 Active KOTs</option>
                <option value="inactive">🔴 Closed KOTs</option>
                <option value="cancelled">❌ Cancelled KOTs</option>
                <option value="nc">🍽️ NC (Complimentary) KOTs</option>
                <option value="all">📋 All KOTs</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Area:</span>
              <select
                value={areaFilter}
                onChange={e => setAreaFilter(e.target.value)}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#1e293b',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                {availableAreas.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#64748b' }}>Type:</span>
              <select
                value={orderTypeFilter}
                onChange={e => setOrderTypeFilter(e.target.value)}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#1e293b',
                  cursor: 'pointer',
                  outline: 'none'
                }}
              >
                <option value="All Orders">All Orders</option>
                <option value="Dine In">Dine In</option>
                <option value="Takeaway">Takeaway</option>
                <option value="Delivery">Delivery</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => loadKots(activeFilter)}
              title="Refresh KOTs"
              style={{
                padding: '7px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <LuRefreshCw size={13} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* KOT List Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.83rem' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '14px 16px' }}>Table / Target</th>
              <th style={{ padding: '14px 16px' }}>KOT No</th>
              <th style={{ padding: '14px 16px' }}>Area</th>
              <th style={{ padding: '14px 16px' }}>Time</th>
              <th style={{ padding: '14px 16px' }}>Items Summary</th>
              <th style={{ padding: '14px 16px' }}>Waiter</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>State</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loadingKots ? (
              <tr>
                <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
                  Loading kitchen order tickets...
                </td>
              </tr>
            ) : kots.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '56px 24px', textAlign: 'center', color: '#94a3b8' }}>
                  <LuChefHat size={32} style={{ opacity: 0.25, display: 'block', margin: '0 auto 10px' }} />
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#64748b' }}>No KOTs found</span>
                  <div style={{ fontSize: '0.76rem', marginTop: '4px' }}>
                    {dbKots.length === 0 ? 'All KOT data has been cleared from database.' : 'Try changing your filter or search.'}
                  </div>
                </td>
              </tr>
            ) : (
              kots.map((kot, idx) => {
                const closed = isClosed(kot);
                const matchingTable = tables.find(t => String(t.id) === String(kot.table_id) || t.no === kot.tableId);
                const displayTableName = matchingTable
                  ? (matchingTable.table_name || formatTableNo(matchingTable.no || matchingTable.table_no, matchingTable.prefix))
                  : formatTableNo(kot.tableName || kot.tableId, kot.prefix);

                const extra = typeof kot.extra_details === 'string' ? JSON.parse(kot.extra_details || '{}') : (kot.extra_details || {});
                const isNC = extra?.isNC || kot.isNC || kot.ncType || String(kot.remarks || '').toUpperCase().includes('NC');

                const itemsSummary = (kot.items || []).map(i => `${i.qty || 1}x ${i.itemName || i.name || 'Dish'}`).slice(0, 2).join(', ');
                const hasMoreItems = (kot.items || []).length > 2;

                return (
                  <tr
                    key={kot.kotId || kot.id || idx}
                    style={{
                      borderBottom: idx < kots.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background 0.12s ease',
                      opacity: closed ? 0.78 : 1
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                  >
                    {/* Table */}
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: closed ? '#f1f5f9' : '#f0fdfa',
                          border: `1px solid ${closed ? '#e2e8f0' : '#99f6e4'}`,
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          color: closed ? '#64748b' : '#0f766e'
                        }}
                      >
                        {isNC ? 'NC Order' : extra.takeaway_no || extra.delivery_no || displayTableName}
                      </span>
                    </td>

                    {/* KOT No */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 800, color: closed ? '#64748b' : '#0f172a' }}>
                        {kot.id}
                      </div>
                      {isNC && (
                        <span style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', fontSize: '0.65rem', fontWeight: 800, padding: '1px 5px', borderRadius: '4px' }}>
                          NC: {extra?.ncType || kot.ncType || 'Complimentary'}
                        </span>
                      )}
                    </td>

                    {/* Area */}
                    <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.78rem' }}>
                      {matchingTable?.area || matchingTable?.area_name || '—'}
                    </td>

                    {/* Time */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0f172a', fontWeight: 600 }}>
                        <LuClock size={12} color="#64748b" />
                        <span>{kot.time}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{kot.date}</div>
                    </td>

                    {/* Items */}
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {(kot.items || []).length} items
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                        {itemsSummary}{hasMoreItems ? ` +${kot.items.length - 2} more` : ''}
                      </div>
                    </td>

                    {/* Waiter */}
                    <td style={{ padding: '12px 16px', color: '#475569', fontWeight: 600 }}>
                      {kot.waiter || 'Staff'}
                    </td>

                    {/* State */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          background: closed ? '#f1f5f9' : '#ecfdf5',
                          color: closed ? '#64748b' : '#047857',
                          border: `1px solid ${closed ? '#e2e8f0' : '#a7f3d0'}`
                        }}
                      >
                        {closed ? '● Closed' : '● Active'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                        {/* View in POS */}
                        {!closed && (
                          <button
                            type="button"
                            onClick={() => handleViewInPOS(kot)}
                            title="View in POS Billing"
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid #bfdbfe',
                              background: '#eff6ff',
                              color: '#1d4ed8',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <LuEye size={12} />
                          </button>
                        )}

                        {/* Details Modal */}
                        <button
                          type="button"
                          onClick={() => setSelected(kot)}
                          title="View KOT Details"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid #e0f2fe',
                            background: '#f0f9ff',
                            color: '#0284c7',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <LuChefHat size={12} />
                        </button>

                        {/* Print */}
                        <button
                          type="button"
                          onClick={() => handlePrint(kot)}
                          title="Print KOT"
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#475569',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <LuPrinter size={12} />
                        </button>

                        {/* Delete / Cancel KOT — ADMIN ONLY */}
                        {isUserAdmin && !closed && (
                          <button
                            type="button"
                            onClick={() => setKotToCancel(kot)}
                            title="Cancel KOT (Admin Only)"
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              border: '1px solid #fecaca',
                              background: '#fef2f2',
                              color: '#dc2626',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <LuTrash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* KOT Detail Modal */}
      {selected && (
        <CommonModal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={`KOT Details — ${selected.id}`}
          maxWidth="460px"
        >
          <div style={{ padding: '10px 4px' }}>
            <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px', fontSize: '0.82rem' }}>
              <div style={{ color: '#0f172a', fontWeight: 700 }}>
                Table: {formatTableNo(selected.tableName || selected.tableId)} &nbsp;·&nbsp; {selected.date} {selected.time}
              </div>
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '3px' }}>
                Waiter: {selected.waiter || 'Staff'}
              </div>
            </div>

            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
              Dishes in this KOT ({selected.items?.length || 0})
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto', marginBottom: '16px' }}>
              {(selected.items || []).map((item, i) => {
                const name = (item.itemName || item.name) + (item.variantName ? ` (${item.variantName})` : '');
                const total = item.total || (item.qty * (item.unitPrice || item.price || 0));
                return (
                  <div key={i} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a' }}>{name}</span>
                    <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0d9488', background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px' }}>
                      ×{item.qty}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handlePrint(selected)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '7px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <LuPrinter size={13} /> Print KOT
              </button>
              <button
                type="button"
                onClick={() => setSelected(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '7px',
                  border: 'none',
                  background: '#0d9488',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </CommonModal>
      )}

      {/* Cancel Single KOT Modal */}
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
          loadKots(activeFilter);
          if (typeof refreshTables === 'function') refreshTables();
        }}
      />

      {/* Delete ALL KOTs Modal (Admin Only) */}
      {deleteAllModal && (
        <CommonModal
          isOpen={deleteAllModal}
          onClose={() => setDeleteAllModal(false)}
          title="Delete All KOT Tickets"
          maxWidth="440px"
        >
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '1.5rem' }}>
              <FaExclamationTriangle />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
              Permanently Clear All KOTs?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              This will permanently delete all Kitchen Order Tickets and active preparation items from the database. This action is restricted to Administrators.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteAllModal(false)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAllKots}
                disabled={isDeletingAll}
                style={{
                  padding: '9px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#ffffff',
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: isDeletingAll ? 'not-allowed' : 'pointer'
                }}
              >
                {isDeletingAll ? 'Deleting...' : 'Yes, Delete All KOTs'}
              </button>
            </div>
          </div>
        </CommonModal>
      )}
    </div>
  );
};

export default ViewKOTPage;
