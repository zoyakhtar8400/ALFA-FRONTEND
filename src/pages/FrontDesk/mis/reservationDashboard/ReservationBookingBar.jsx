import React from 'react';

const STATUS_COLORS = {
  'Checked-In':  { bg: 'var(--success)',  text: '#fff' },
  'Confirmed':   { bg: 'var(--info)',     text: '#fff' },
  'Reserved':    { bg: 'var(--warning)',  text: '#fff' },
  'Checked-Out': { bg: '#94a3b8',         text: '#fff' },
  'Cancelled':   { bg: 'var(--danger)',   text: '#fff' },
  'Tentative':   { bg: 'var(--warning)',  text: '#fff' },
};

const ReservationBookingBar = ({ booking, visibleSpan, onClick }) => {
  const nights = Math.max(1, Math.round((new Date(booking.end) - new Date(booking.start)) / 86400000));
  const col = STATUS_COLORS[booking.status] || STATUS_COLORS['Confirmed'];
  const bookingId = `#BOOK-${String(booking.id).padStart(4, '0')}`;

  return (
    <td colSpan={visibleSpan} style={{ padding: '6px 4px', verticalAlign: 'middle', position: 'relative' }} className="group">
      <div
        onClick={onClick}
        style={{
          background: col.bg, color: col.text,
          borderRadius: '8px', padding: '6px 10px',
          fontSize: '0.78rem', fontWeight: 700,
          cursor: 'pointer', userSelect: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '6px', height: '40px', overflow: 'hidden',
          boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
          transition: 'filter 0.15s, transform 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(0.92)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {booking.isVip && <span>👑</span>}
          <span>{booking.guestName}</span>
        </span>
        <span style={{ fontSize: '0.68rem', opacity: 0.8, whiteSpace: 'nowrap', flexShrink: 0 }}>{bookingId}</span>
      </div>

      {/* Tooltip */}
      <div style={{
        position: 'absolute', bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
        zIndex: 50, background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '12px', padding: '14px 16px', boxShadow: 'var(--shadow-lg)',
        width: '220px', opacity: 0, pointerEvents: 'none', transition: 'opacity 0.15s',
      }}
        className="booking-tooltip"
      >
        <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--dark)', marginBottom: '6px' }}>
          {booking.isVip && '👑 '}{booking.guestName}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span>Room {booking.roomNo} &nbsp;|&nbsp; {nights} night{nights !== 1 ? 's' : ''}</span>
          <span>{booking.start} → {booking.end}</span>
          {booking.phone && <span>📞 {booking.phone}</span>}
          {booking.bookingSource && <span>🌐 {booking.bookingSource}</span>}
        </div>
        <div style={{ marginTop: '8px' }}>
          <span style={{
            display: 'inline-block', fontSize: '0.7rem', fontWeight: 700, padding: '2px 10px',
            borderRadius: '20px', background: col.bg, color: col.text,
          }}>{booking.status}</span>
        </div>
      </div>

      <style>{`.group:hover .booking-tooltip { opacity: 1 !important; pointer-events: auto !important; }`}</style>
    </td>
  );
};

export default ReservationBookingBar;
