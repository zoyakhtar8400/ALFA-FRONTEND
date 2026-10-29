import React, { memo } from 'react';
import { LuUtensils, LuArrowRight } from 'react-icons/lu';
import { RECENT_ORDERS } from './dashboardData';
import { useNavigate } from 'react-router-dom';
import { formatTableLabel, formatTableNo } from '../../utils/tableFormat';

const STATUS_STYLE = {
  Served:    { bg: '#dcfce7', color: '#15803d' },
  Preparing: { bg: '#fffbeb', color: '#b45309' },
  Pending:   { bg: '#fee2e2', color: '#b91c1c' },
};

const RecentOrders = memo(({ stats, tables = [], showToast }) => {
  const navigate = useNavigate();

  // 1. Extract live orders from tables that are Running or Paid
  const liveTableRows = (tables || [])
    .filter(t => (t.status === 'Running' || t.status === 'Paid' || t.status === 'KOT Generated') && Number(t.amount || 0) > 0)
    .map(t => ({
      table: formatTableLabel(t.table_name || t.no),
      kot: (t.kots && t.kots[0]?.kotNo) || (t.kotNo) || `KOT-${formatTableNo(t.table_name || t.no, t.prefix)}`,
      item: (t.customer && t.customer !== 'Walk-in') ? `${t.customer}'s Order` : `${formatTableLabel(t.table_name || t.no)} Order`,
      time: t.openedAt || 'Active',
      status: t.status === 'Paid' ? 'Served' : 'Preparing',
      steward: t.waiter || t.captain || 'Assigned',
      amt: `₹${Number(t.amount || 0).toLocaleString('en-IN')}`
    }));

  // 2. Extract database settled bills
  const dbRows = (stats?.recentOrders || []).map(o => ({
    table: o.table || `Table #${o.id}`,
    kot: o.billNo || `BILL-${o.id}`,
    item: o.customer ? `${o.customer} (${o.paymentType})` : `Order #${o.id}`,
    time: o.createdAt || 'Settled',
    status: o.status || 'Paid',
    steward: o.paymentType || 'Cashier',
    amt: o.amount
  }));

  const combined = [...liveTableRows, ...dbRows];
  const rows = combined.length > 0 ? combined.slice(0, 6) : [];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <LuUtensils size={14} color="#d97706" />
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Recent Restaurant Orders</span>
        </div>
        <button onClick={() => { try { navigate('/restaurant'); } catch { showToast?.('View restaurant orders'); } }}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', fontSize: '11px', fontWeight: '700', color: 'var(--primary)', cursor: 'pointer' }}>
          View All <LuArrowRight size={12} />
        </button>
      </div>

      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px' }}>
          <LuUtensils size={28} style={{ marginBottom: '8px', opacity: 0.4 }} />
          <div>No records available</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rows.map((o, i) => {
            const s = STATUS_STYLE[o.status] || STATUS_STYLE.Pending;
            return (
              <div key={i}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < rows.length - 1 ? '1px solid #f8fafc' : 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => showToast?.(`${o.kot} — ${o.item}`)}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <LuUtensils size={16} color="#d97706" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.item}</div>
                  <div style={{ fontSize: '10px', color: '#475569' }}>{o.table} · {o.kot} · {o.time}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>{o.amt}</div>
                  <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 7px', borderRadius: '10px', background: s.bg, color: s.color }}>{o.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default RecentOrders;
