import React, { memo, useMemo } from 'react';
import {
  LuCalendarCheck, LuLogIn, LuLogOut, LuCalendarX,
  LuBed, LuUsers, LuTrendingUp, LuClock,
  LuArrowUpRight, LuArrowDownRight,
} from 'react-icons/lu';

const SummaryCards = memo(({ rooms, showToast }) => {
  const clean = useMemo(() => rooms.filter(r => r.status === 'Clean').length, [rooms]);
  const occupied = useMemo(() => rooms.filter(r => r.status !== 'Clean').length, [rooms]);

  const cards = [
    { label: "Today's Bookings",    value: '12',      trend: '+8.5%',  up: true,  icon: LuCalendarCheck, accent: '#418A8B', sub: 'vs yesterday' },
    { label: "Today's Check-In",    value: '8',       trend: '+12.3%', up: true,  icon: LuLogIn,         accent: '#16a34a', sub: 'vs yesterday' },
    { label: "Today's Check-Out",   value: '6',       trend: '-2.4%',  up: false, icon: LuLogOut,        accent: '#dc2626', sub: 'vs yesterday' },
    { label: 'Expected Departure',  value: '4',       trend: 'Today',  up: true,  icon: LuCalendarX,     accent: '#d97706', sub: 'remaining' },
    { label: 'Available Rooms',     value: String(clean),    trend: `${rooms.length} total`, up: true, icon: LuBed,    accent: '#0369a1', sub: 'rooms' },
    { label: 'Occupied Rooms',      value: String(occupied), trend: `${((occupied/rooms.length)*100).toFixed(0)}% occ.`, up: occupied > 4, icon: LuUsers, accent: '#7c3aed', sub: 'rooms' },
    { label: 'Revenue Today',       value: '₹42,350', trend: '+18.2%', up: true,  icon: LuTrendingUp,    accent: '#15803d', sub: 'vs yesterday' },
    { label: 'Pending Payments',    value: '₹12,450', trend: '6 bills', up: false, icon: LuClock,        accent: '#b91c1c', sub: 'outstanding' },
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
