import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const STATUS_COLORS = {
  'Checked-In':  { bg: 'var(--success-light)',  color: 'var(--success)'  },
  'Confirmed':   { bg: 'var(--info-light)',      color: 'var(--info)'     },
  'Reserved':    { bg: 'var(--warning-light)',   color: 'var(--warning)'  },
  'Checked-Out': { bg: '#f1f5f9',               color: '#64748b'         },
  'Cancelled':   { bg: 'var(--danger-light)',    color: 'var(--danger)'   },
  'Tentative':   { bg: 'var(--warning-light)',   color: 'var(--warning)'  },
};

const InfoRow = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{value}</span>
  </div>
);

const ReservationDetailsModal = ({ isOpen, booking, onClose, onStatusChange, onCancel, onRoomChange, onExtendStay, onSplitStay, rooms = [] }) => {
  const [newRoom, setNewRoom] = useState('');
  const [extendNights, setExtendNights] = useState(1);
  const [splitNight, setSplitNight] = useState(1);

  if (!isOpen || !booking) return null;

  const col = STATUS_COLORS[booking.status] || STATUS_COLORS['Confirmed'];

  return (
    <div className="modal-overlay">
      <div className="modal-container" style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <span className="modal-title">Reservation Details</span>
          <button className="modal-close-btn" onClick={onClose}><FaTimes size={16} /></button>
        </div>

        {/* Status Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '-8px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '4px 14px', borderRadius: '20px', background: col.bg, color: col.color }}>
            {booking.status}
          </span>
          {booking.isVip && <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f59e0b' }}>👑 VIP Guest</span>}
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Booking #{booking.id}</span>
        </div>

        {/* Info Grid */}
        <div style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '10px', padding: '4px 14px' }}>
          <InfoRow label="Guest"      value={booking.guestName} />
          <InfoRow label="Phone"      value={booking.phone || '—'} />
          <InfoRow label="Room"       value={`Room ${booking.roomNo}`} />
          <InfoRow label="Check-In"   value={booking.start} />
          <InfoRow label="Check-Out"  value={booking.end} />
          <InfoRow label="Segment"    value={booking.segment || '—'} />
          <InfoRow label="Source"     value={booking.bookingSource || '—'} />
        </div>

        {/* Quick Actions */}
        {booking.status !== 'Cancelled' && booking.status !== 'Checked-Out' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {booking.status === 'Confirmed' && (
              <button className="btn-primary" style={{ borderRadius: '10px', padding: '8px 18px' }} onClick={() => onStatusChange(booking.id, 'Checked-In')}>
                Check In
              </button>
            )}
            {booking.status === 'Checked-In' && (
              <button className="btn-primary" style={{ borderRadius: '10px', padding: '8px 18px', background: 'var(--dark)' }} onClick={() => onStatusChange(booking.id, 'Checked-Out')}>
                Checkout
              </button>
            )}
            <button className="btn-secondary" style={{ borderRadius: '10px', padding: '8px 18px', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => onCancel(booking.id)}>
              Cancel
            </button>
          </div>
        )}

        {/* Change Room */}
        {booking.status !== 'Cancelled' && booking.status !== 'Checked-Out' && (
          <div className="form-field">
            <label className="form-label">Change Room</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select className="form-select" value={newRoom} onChange={e => setNewRoom(e.target.value)}>
                <option value="">Select room...</option>
                {rooms.filter(r => r.no !== booking.roomNo).map(r => (
                  <option key={r.no} value={r.no}>Room {r.no} — {r.type}</option>
                ))}
              </select>
              <button className="btn-primary" disabled={!newRoom} style={{ borderRadius: '10px', padding: '8px 16px', flexShrink: 0 }}
                onClick={() => { if (newRoom) { onRoomChange(booking.id, newRoom); setNewRoom(''); } }}>
                Move
              </button>
            </div>
          </div>
        )}

        {/* Extend Stay */}
        {booking.status === 'Checked-In' && (
          <div className="form-field">
            <label className="form-label">Extend Stay</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input className="form-input" type="number" min={1} value={extendNights} onChange={e => setExtendNights(Math.max(1, Number(e.target.value)))} style={{ width: '80px' }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>night(s)</span>
              <button className="btn-secondary" style={{ borderRadius: '10px' }} onClick={() => onExtendStay(booking.id, extendNights)}>Extend</button>
            </div>
          </div>
        )}

        {/* Split Stay */}
        {(booking.status === 'Confirmed' || booking.status === 'Checked-In') && (
          <div className="form-field">
            <label className="form-label">Split Stay after night</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input className="form-input" type="number" min={1} value={splitNight} onChange={e => setSplitNight(Math.max(1, Number(e.target.value)))} style={{ width: '80px' }} />
              <button className="btn-secondary" style={{ borderRadius: '10px' }} onClick={() => onSplitStay(booking.id, splitNight)}>Split</button>
            </div>
          </div>
        )}

        <div className="form-footer" style={{ paddingTop: '12px' }}>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailsModal;
