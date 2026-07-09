import React, { memo } from 'react';
import { LuCalendarDays, LuArrowRight } from 'react-icons/lu';
import { RECENT_BOOKINGS } from './dashboardData';
import { useNavigate } from 'react-router-dom';

const STATUS_STYLE = {
  Confirmed: { bg: '#dcfce7', color: '#15803d' },
  Pending:   { bg: '#fffbeb', color: '#b45309' },
  Cancelled: { bg: '#fee2e2', color: '#b91c1c' },
};

const RecentBookings = memo(({ showToast }) => {
  const navigate = useNavigate();
  const rows = RECENT_BOOKINGS.slice(0, 5);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <LuCalendarDays size={14} color="#418A8B" />
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>Recent Reservations</span>
        </div>
        <button onClick={() => { try { navigate('/front-desk/reservations'); } catch { showToast?.('View all reservations'); } }}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', fontSize: '11px', fontWeight: '700', color: '#418A8B', cursor: 'pointer' }}>
          View All <LuArrowRight size={12} />
        </button>
      </div>

      {rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px', color: '#94a3b8', fontSize: '13px' }}>
          <LuCalendarDays size={28} style={{ marginBottom: '8px', opacity: 0.4 }} />
          <div>No records available</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {rows.map((b, i) => {
            const s = STATUS_STYLE[b.status] || STATUS_STYLE.Pending;
            return (
              <div key={i}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: i < rows.length - 1 ? '1px solid #f8fafc' : 'none', cursor: 'pointer', transition: 'background 150ms' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => showToast?.(`Booking ${b.no} — ${b.name}`)}
              >
                <img src={b.avatar} alt={b.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none'; }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.name}</div>
                  <div style={{ fontSize: '10px', color: '#475569' }}>{b.no} · {b.arrDate}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: s.bg, color: s.color }}>{b.status}</span>
                  <div style={{ fontSize: '10px', color: '#475569', marginTop: '2px' }}>{b.category}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

export default RecentBookings;
