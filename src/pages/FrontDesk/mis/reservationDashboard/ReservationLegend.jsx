import React from 'react';

const ITEMS = [
  { color: 'var(--success)',  label: 'Checked In'   },
  { color: 'var(--info)',     label: 'Confirmed'    },
  { color: 'var(--warning)',  label: 'Reserved'     },
  { color: '#94a3b8',         label: 'Checked Out'  },
  { color: 'var(--danger)',   label: 'Cancelled'    },
  { color: '#374151',         label: 'Out of Order' },
  { color: '#8b5cf6',         label: 'VIP'          },
  { color: '#06b6d4',         label: 'Housekeeping' },
];

const ReservationLegend = () => (
  <div style={{
    display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '20px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: '12px', padding: '12px 20px', boxShadow: 'var(--shadow-sm)',
  }}>
    {ITEMS.map(item => (
      <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color, flexShrink: 0 }} />
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{item.label}</span>
      </div>
    ))}
  </div>
);

export default ReservationLegend;
