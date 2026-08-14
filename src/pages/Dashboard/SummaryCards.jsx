import React, { memo, useMemo } from 'react';
import {
  LuCalendarCheck, LuLogIn, LuLogOut, LuCalendarX,
  LuBed, LuUsers, LuTrendingUp, LuClock,
  LuArrowUpRight, LuArrowDownRight,
} from 'react-icons/lu';

const SummaryCards = memo(({ rooms = [], tables = [], stats, showToast }) => {
  const clean = useMemo(() => rooms.filter(r => r.status === 'Clean').length, [rooms]);
  const occupied = useMemo(() => rooms.filter(r => r.status !== 'Clean').length, [rooms]);

  const availableTables = useMemo(() => tables.filter(t => t.status === 'Blank' || !t.status).length, [tables]);
  const activeTables = useMemo(() => tables.filter(t => t.status === 'Running' || t.status === 'KOT Generated' || t.status === 'Paid' || t.status === 'Reserved').length, [tables]);
  const totalTableSales = useMemo(() => tables.reduce((acc, t) => acc + Number(t.amount || 0), 0), [tables]);

  const cards = [
    { label: "Active Dining Tables", value: `${activeTables}/${tables.length || 12}`, trend: `${availableTables} available`, up: true, icon: LuTrendingUp, accent: '#0e7490', sub: 'running tables' },
    { label: "Live Dining Revenue",  value: `₹${totalTableSales.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, trend: `${activeTables} active orders`, up: true, icon: LuTrendingUp, accent: '#16a34a', sub: 'live orders' },
    { label: "Menu Catalog Items",  value: `${stats?.totalMenuItems || 258}`, trend: 'PostgreSQL Catalog', up: true, icon: LuClock, accent: '#d97706', sub: 'live active items' },
    { label: "Recorded Orders",     value: `${(stats?.totalOrdersCount || 0) + activeTables}`, trend: 'Settled & Active', up: true, icon: LuCalendarCheck, accent: '#418A8B', sub: 'total bills' },
    { label: "Available Rooms",     value: String(clean),    trend: `${rooms.length} total rooms`, up: true, icon: LuBed,    accent: '#0369a1', sub: 'clean rooms' },
    { label: "Occupied Rooms",      value: String(occupied), trend: rooms.length ? `${((occupied/rooms.length)*100).toFixed(0)}% occ.` : '0%', up: occupied > 0, icon: LuUsers, accent: '#7c3aed', sub: 'in-house guests' },
    { label: "Cash Collection",     value: `₹${Number(stats?.cashCollection || 0).toLocaleString('en-IN')}`, trend: 'Physical drawer', up: true, icon: LuTrendingUp, accent: '#15803d', sub: 'cash drawer' },
    { label: "UPI / Digital Sales",  value: `₹${Number(stats?.upiCollection || 0).toLocaleString('en-IN')}`, trend: 'Digital QR / UPI', up: true, icon: LuTrendingUp, accent: '#0d9488', sub: 'UPI payments' },
  ];

  return (
    <div className="dash-summary-cards">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i}
            onClick={() => showToast?.(`${c.label}: ${c.value}`)}
            style={{
              background: '#fff', borderRadius: '12px',
              border: '1px solid #e2e8f0', borderTop: `3px solid ${c.accent}`,
              padding: '14px 16px', cursor: 'pointer',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)', transition: 'all 200ms',
              display: 'flex', flexDirection: 'column', gap: '8px',
              minWidth: 0, width: '100%', boxSizing: 'border-box',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.4px', lineHeight: 1.3, wordBreak: 'break-word' }}>
                {c.label}
              </span>
              <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: `${c.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} color={c.accent} />
              </div>
            </div>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>{c.value}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', flexWrap: 'wrap' }}>
              <span style={{ color: c.up ? '#15803d' : '#dc2626', display: 'flex', alignItems: 'center', gap: '2px', fontSize: '13px' }}>
                {c.up ? <LuArrowUpRight size={14} /> : <LuArrowDownRight size={14} />}
                {c.trend}
              </span>
              <span style={{ color: '#64748b', fontSize: '12px' }}>{c.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default SummaryCards;
