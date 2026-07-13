import React, { useMemo, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LuEye, LuPencil, LuTrash2, LuX, LuCheck, LuChefHat, LuPrinter } from 'react-icons/lu';

import PageHeader from '../../../components/common/PageHeader';
import CommonModal from '../../../components/common/CommonModal';
import { useRestaurant } from '../../../context/RestaurantContext';

const INITIAL_KOTS = [
  { id: 'KOT-402', tableId: '02', status: 'Cooking',         time: '12:40 PM', items: [{ itemName: 'Butter Chicken', variantName: 'Full', qty: 1, unitPrice: 450, total: 450 }, { itemName: 'Garlic Naan', variantName: '', qty: 3, unitPrice: 100, total: 300 }] },
  { id: 'KOT-403', tableId: '03', status: 'Sent to Kitchen', time: '12:45 PM', items: [{ itemName: 'Chicken Biryani', variantName: '', qty: 1, unitPrice: 400, total: 400 }, { itemName: 'Cold Drink', variantName: '500 ML', qty: 2, unitPrice: 70, total: 140 }] },
  { id: 'KOT-404', tableId: '06', status: 'Ready',           time: '12:35 PM', items: [{ itemName: 'Dal Makhani', variantName: 'Half', qty: 1, unitPrice: 160, total: 160 }, { itemName: 'Jeera Rice', variantName: '', qty: 2, unitPrice: 200, total: 400 }] },
  { id: 'KOT-405', tableId: '09', status: 'Served',          time: '12:50 PM', items: [{ itemName: 'Butter Chicken', variantName: 'Full', qty: 1, unitPrice: 450, total: 450 }, { itemName: 'Tandoori Roti', variantName: '', qty: 3, unitPrice: 30, total: 90 }] },
];

const STATUS_CONFIG = {
  'Sent to Kitchen': { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  'Cooking':         { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  'Ready':           { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  'Served':          { bg: '#f8fafc', color: '#475569', border: '#e2e8f0' },
};

const STATUSES = ['Sent to Kitchen', 'Cooking', 'Ready', 'Served'];
const ViewKOTPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { tables, setTables } = useRestaurant();
  const routedTable = location.state?.table;
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [loadingKots, setLoadingKots] = useState(false);

  useEffect(() => {
    const styleId = 'spinner-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const kots = useMemo(() => {
    const list = [];
    tables.forEach(t => {
      (t.kots || []).forEach(k => {
        list.push({ id: k.id, tableId: t.no, status: k.status || 'Sent to Kitchen', time: k.time || '—', items: k.items || [] });
      });
    });
    let result = list.length === 0 ? [...INITIAL_KOTS] : list;
    
    // Sort recent KOTs at top (newest first)
    result.reverse();
    
    if (routedTable) result = result.filter(k => String(k.tableId) === String(routedTable.no));
    if (filterStatus !== 'All') result = result.filter(k => k.status === filterStatus);
    return result;
  }, [tables, routedTable, filterStatus]);

  const handleStatusChange = (kotId, nextStatus) => {
    setLoadingKots(true);
    setTimeout(() => {
      setTables(prev => prev.map(t => ({
        ...t,
        kots: (t.kots || []).map(k => k.id === kotId ? { ...k, status: nextStatus } : k),
      })));
      setLoadingKots(false);
      window.showToast?.(`KOT ${kotId} updated to ${nextStatus}`, 'success');
    }, 500);
  };

  const handleDelete = (kotId) => {
    if (window.confirm(`Are you sure you want to delete KOT ${kotId}?`)) {
      setLoadingKots(true);
      setTimeout(() => {
        setTables(prev => prev.map(t => ({ ...t, kots: (t.kots || []).filter(k => k.id !== kotId) })));
        setLoadingKots(false);
        window.showToast?.(`KOT ${kotId} deleted`, 'info');
      }, 500);
    }
  };

  const handlePrintKOT = (kot) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Print KOT - ${kot.id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; width: 300px; margin: 10px; padding: 0; font-size: 14px; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 8px; margin-bottom: 8px; }
            .title { font-size: 18px; font-weight: bold; }
            .details { margin-bottom: 8px; line-height: 1.4; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th { border-bottom: 1px solid #000; text-align: left; padding: 4px 0; }
            td { padding: 6px 0; vertical-align: top; }
            .qty { font-weight: bold; width: 40px; }
            .footer { border-top: 2px dashed #000; padding-top: 8px; margin-top: 12px; text-align: center; font-size: 11px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">KITCHEN ORDER TICKET</div>
            <div>ALFA HMS RESTAURANT</div>
          </div>
          <div class="details">
            <div><strong>KOT No:</strong> ${kot.id}</div>
            <div><strong>Table:</strong> Table ${kot.tableId}</div>
            <div><strong>Time:</strong> ${kot.time}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 40px;">Qty</th>
                <th>Item</th>
              </tr>
            </thead>
            <tbody>
              ${kot.items.map(item => {
                const displayName = (item.itemName || item.name) + (item.variantName ? ` (${item.variantName})` : '');
                return `
                  <tr>
                    <td class="qty">x${item.qty}</td>
                    <td>
                      ${displayName}
                      ${item.remarks || item.remark ? `<br/><span style="font-size: 11px; font-style: italic;">* ${item.remarks || item.remark}</span>` : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
          <div class="footer">
            <div>Sent to Kitchen - Print Copy</div>
            <div>Thank you!</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const counts = useMemo(() => {
    const all = tables.flatMap(t => t.kots || []).length || INITIAL_KOTS.length;
    return {
      All: all,
      ...Object.fromEntries(STATUSES.map(s => [s, (tables.flatMap(t => t.kots || []).filter(k => k.status === s).length || INITIAL_KOTS.filter(k => k.status === s).length)])),
    };
  }, [tables]);

  return (
    <div style={{ padding: '24px', fontFamily: 'var(--font-family)', backgroundColor: 'var(--background)', minHeight: '100%' }}>
      <PageHeader
        title={routedTable ? `KOT — Table ${routedTable.no}` : 'Kitchen Order Tickets'}
        breadcrumbs={['Restaurant', 'View KOT']}
        showBack={!!routedTable}
      />

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '8px', margin: '20px 0 16px', flexWrap: 'wrap' }}>
        {['All', ...STATUSES].map(s => {
          const cfg = STATUS_CONFIG[s] || { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
          const active = filterStatus === s;
          return (
            <button key={s} onClick={() => setFilterStatus(s)}
              style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 150ms', border: `1.5px solid ${active ? cfg.color : '#e2e8f0'}`, background: active ? cfg.bg : '#fff', color: active ? cfg.color : '#475569' }}>
              {s} <span style={{ marginLeft: '4px', fontSize: '11px', opacity: 0.7 }}>({counts[s] ?? 0})</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div style={{ position: 'relative', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loadingKots && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
            backdropFilter: 'blur(1px)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div className="spinner" style={{
                width: '32px', height: '32px', border: '3px solid #e2e8f0',
                borderTopColor: '#418A8B', borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }} />
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>Updating Kitchen Tickets...</span>
            </div>
          </div>
        )}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
              {['Table', 'KOT No.', 'Time', 'Items', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '13px 18px', textAlign: h === 'Actions' ? 'center' : 'left', fontSize: '12px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {kots.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  <LuChefHat size={32} style={{ marginBottom: '10px', opacity: 0.3, display: 'block', margin: '0 auto 10px' }} />
                  No KOTs found
                </td>
              </tr>
            ) : kots.map((kot, i) => {
              const cfg = STATUS_CONFIG[kot.status] || STATUS_CONFIG['Cooking'];
              return (
                <tr key={kot.id} style={{ borderBottom: i < kots.length - 1 ? '1px solid #f8fafc' : 'none', transition: 'background 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0fdfa', border: '1.5px solid #99f6e4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '14px', color: '#0f766e' }}>
                      {kot.tableId}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '14px', fontWeight: '800', color: '#244E5F' }}>{kot.id}</td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                      {kot.time}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                    {kot.items.length} {kot.items.length === 1 ? 'item' : 'items'}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <select
                      value={kot.status}
                      onChange={e => handleStatusChange(kot.id, e.target.value)}
                      style={{
                        padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                        border: `1.5px solid ${cfg.border}`, background: cfg.bg, color: cfg.color,
                        cursor: 'pointer', outline: 'none', appearance: 'auto',
                      }}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <button onClick={() => setSelected(kot)} title="View KOT"
                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 150ms' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.color = '#1d4ed8'; }}
                      ><LuEye size={14} /></button>
                      <button onClick={() => setSelected(kot)} title="Edit KOT"
                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 150ms' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#15803d'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; e.currentTarget.style.color = '#15803d'; }}
                      ><LuPencil size={14} /></button>
                      <button onClick={() => handleDelete(kot.id)} title="Delete KOT"
                        style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 150ms' }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#dc2626'; }}
                      ><LuTrash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selected && (
        <CommonModal
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          title={`KOT Details: ${selected.id}`}
          maxWidth="460px"
        >
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '-8px', marginBottom: '16px' }}>
            Table {selected.tableId} &nbsp;·&nbsp; {selected.time}
          </div>
          
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
            Order Items
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
            {selected.items.map((item, i) => {
              const displayName = (item.itemName || item.name) + (item.variantName ? ` (${item.variantName})` : '');
              const itemTotal = item.total || (item.qty * (item.unitPrice || item.price || 0));
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <LuChefHat size={14} color="#418A8B" />
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>{displayName}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '800', color: '#244E5F', background: '#e0f2fe', padding: '2px 10px', borderRadius: '20px' }}>&times;{item.qty}</span>
                  </div>
                  {itemTotal > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', paddingLeft: '22px' }}>
                      <span>Price: ₹{item.unitPrice || item.price || 0}</span>
                      <span style={{ fontWeight: 'bold' }}>Total: ₹{itemTotal}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => { handleDelete(selected.id); setSelected(null); }}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1.5px solid #fecaca', background: '#fef2f2', color: '#dc2626', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <LuTrash2 size={14} /> Delete
            </button>
            <button onClick={() => handlePrintKOT(selected)}
              style={{ flex: 1.2, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <LuPrinter size={14} /> Print KOT
            </button>
            <button onClick={() => setSelected(null)}
              style={{ flex: 1.5, padding: '10px', borderRadius: '8px', border: 'none', background: '#418A8B', color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <LuCheck size={14} /> Close
            </button>
          </div>
        </CommonModal>
      )}
    </div>
  );
};

export default ViewKOTPage;
