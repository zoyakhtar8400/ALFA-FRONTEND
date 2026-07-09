import React, { memo } from 'react';

const HousekeepingChart = memo(({ rooms, showToast }) => {
  const counts = {
    Clean:         rooms.filter(r => r.status === 'Clean').length,
    Dirty:         rooms.filter(r => r.status === 'Dirty').length,
    Maintenance:   rooms.filter(r => r.status === 'Maintenance').length,
    'Out of Order': rooms.filter(r => r.status === 'Out of Order').length || 0,
  };

  const COLORS = { Clean: '#22c55e', Dirty: '#ef4444', Maintenance: '#f59e0b', 'Out of Order': '#94a3b8' };
  const total = rooms.length || 1;

  return (
    <div>
      <div style={{ fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
        Room Status
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.entries(counts).map(([label, count]) => {
          const pct = ((count / total) * 100).toFixed(0);
          const color = COLORS[label];
          return (
            <div key={label} style={{ cursor: 'pointer' }} onClick={() => showToast?.(`${label}: ${count} rooms`)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b' }}>{label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>{count}</span>
                  <span style={{ fontSize: '10px', color: '#475569' }}>{pct}%</span>
                </div>
              </div>
              <div style={{ height: '7px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '4px', transition: 'width 600ms ease' }} />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: '16px', padding: '12px', background: '#f8fafc', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', color: '#334155', fontWeight: '700' }}>Total Rooms</span>
        <span style={{ fontSize: '18px', fontWeight: '800', color: '#244E5F' }}>{total}</span>
      </div>
    </div>
  );
});

export default HousekeepingChart;
