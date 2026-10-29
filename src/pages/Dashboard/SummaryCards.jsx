import React, { memo, useMemo } from 'react';
import {
  LuCalendarCheck,
  LuTrendingUp, LuClock,
  LuArrowUpRight, LuArrowDownRight,
  // LuBed, LuUsers, // Room stats — disabled
} from 'react-icons/lu';

const SummaryCards = memo(({ rooms = [], tables = [], stats, showToast }) => {
  // Room stats — disabled (uncomment to re-enable)
  // const clean = useMemo(() => rooms.filter(r => r.status === 'Clean').length, [rooms]);
  // const occupied = useMemo(() => rooms.filter(r => r.status !== 'Clean').length, [rooms]);

  const availableTables = useMemo(() => tables.filter(t => t.status === 'Blank' || !t.status).length, [tables]);
  const activeTables = useMemo(() => tables.filter(t => t.status === 'Running' || t.status === 'KOT Generated' || t.status === 'Paid' || t.status === 'Reserved' || t.status === 'KOT_CUT' || t.status === 'UNPAID_BILL').length, [tables]);

  // Use backend-calculated live dining sales (reads extra_details.amount correctly)
  const liveDiningSalesFromStats = Number(stats?.liveDiningSales || 0);
  const liveDiningSalesLocal = useMemo(() => tables.reduce((acc, t) => acc + Number(t.amount || 0), 0), [tables]);
  const totalTableSales = liveDiningSalesFromStats > 0 ? liveDiningSalesFromStats : liveDiningSalesLocal;

  // Use backend active table count if available (more accurate)
  const activeTablesDisplay = stats?.activeTablesCount !== undefined ? stats.activeTablesCount : activeTables;
  const totalTablesDisplay = stats?.totalTablesCount !== undefined ? stats.totalTablesCount : (tables.length || 12);

  const cards = [
    { label: "Active Dining Tables", value: `${activeTablesDisplay}/${totalTablesDisplay}`, trend: `${availableTables} available`, up: true, icon: LuTrendingUp, accent: '#1b7a6d', sub: 'running tables' },
    { label: "Live Dining Revenue",  value: `₹${totalTableSales.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, trend: `${activeTablesDisplay} active orders`, up: true, icon: LuTrendingUp, accent: '#16a34a', sub: 'live orders' },
    { label: "Menu Catalog Items",   value: `${stats?.totalMenuItems || 258}`, trend: 'PostgreSQL Catalog', up: true, icon: LuClock, accent: '#112936', sub: 'live active items' },
    { label: "Recorded Orders",      value: `${(stats?.totalOrdersCount || 0) + activeTablesDisplay}`, trend: 'Settled & Active', up: true, icon: LuCalendarCheck, accent: '#c92534', sub: 'total bills' },
    { label: "Cash Collection",      value: `₹${Number(stats?.cashCollection || 0).toLocaleString('en-IN')}`, trend: 'Physical drawer', up: true, icon: LuTrendingUp, accent: '#d97706', sub: 'cash drawer' },
    { label: "UPI / Digital Sales",  value: `₹${Number(stats?.upiCollection || 0).toLocaleString('en-IN')}`, trend: 'Digital QR / UPI', up: true, icon: LuTrendingUp, accent: '#0284c7', sub: 'UPI payments' },
  ];

  return (
    <div className="dash-summary-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div key={i}
            onClick={() => showToast?.(`${c.label}: ${c.value}`)}
            style={{
              background: '#ffffff',
              backgroundImage: `radial-gradient(circle at 100% 0%, ${c.accent}15 0%, transparent 50%), radial-gradient(circle, rgba(15, 23, 42, 0.02) 1px, transparent 1px)`,
              backgroundSize: '100% 100%, 14px 14px',
              borderRadius: '16px',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              padding: '20px',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              minWidth: 0,
              width: '100%',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = `0 12px 20px -8px ${c.accent}33, 0 4px 12px -5px ${c.accent}22`;
              e.currentTarget.style.borderColor = c.accent;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -1px rgba(0,0,0,0.01)';
              e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
            }}
          >
            {/* Top border accent line with a subtle fade-out gradient */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${c.accent} 0%, ${c.accent}55 100%)` }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px', lineHeight: 1.3 }}>
                {c.label}
              </span>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: `linear-gradient(135deg, ${c.accent}18 0%, ${c.accent}08 100%)`,
                border: `1px solid ${c.accent}25`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={18} color={c.accent} />
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.75px', lineHeight: 1.1 }}>{c.value}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '500', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '4px', position: 'relative', zIndex: 2 }}>
              <span style={{
                color: c.up ? '#10b981' : '#f43f5e',
                background: c.up ? '#ecfdf5' : '#fff1f2',
                padding: '2px 8px',
                borderRadius: '12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
                fontWeight: '700',
                fontSize: '11px',
                border: `1px solid ${c.up ? '#a7f3d0' : '#fecdd3'}`
              }}>
                {c.up ? <LuArrowUpRight size={12} /> : <LuArrowDownRight size={12} />}
                {c.trend}
              </span>
              <span style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600' }}>{c.sub}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default SummaryCards;
