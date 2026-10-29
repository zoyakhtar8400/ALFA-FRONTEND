import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaUser, FaUsers, FaPhone, FaGlassCheers, FaClock } from 'react-icons/fa';
import { formatTableLabel } from '../../../utils/tableFormat';

const BookTableModal = ({ isOpen, onClose, tables, onBook, initialTableId = '', initialDate = '' }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const nowTimeStr = new Date().toTimeString().slice(0, 5);

  const [selectedTableId, setSelectedTableId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [guestsCount, setGuestsCount] = useState(4);
  const [bookingDate, setBookingDate] = useState(initialDate || todayStr);
  const [bookingTime, setBookingTime] = useState(nowTimeStr);
  const [occasion, setOccasion] = useState('');

  // Filter only blank / available tables
  const blankTables = React.useMemo(() => {
    return tables.filter(t => {
      const st = String(t.status || '').toLowerCase().trim();
      const hasAmount = Number(t.amount || 0) > 0;
      return (!t.status || st === 'blank' || st === 'available' || st === 'white') && !hasAmount;
    });
  }, [tables]);

  useEffect(() => {
    if (isOpen) {
      setBookingDate(initialDate || new Date().toISOString().split('T')[0]);
      setBookingTime(new Date().toTimeString().slice(0, 5));

      if (initialTableId) {
        setSelectedTableId(String(initialTableId));
        const tbl = tables.find(t => String(t.id) === String(initialTableId));
        if (tbl) setGuestsCount(tbl.seats || 4);
      } else if (blankTables.length > 0) {
        setSelectedTableId(String(blankTables[0].id));
        setGuestsCount(blankTables[0].seats || 4);
      }
    }
  }, [isOpen, initialTableId, tables, blankTables]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTableId) {
      if (window.showToast) window.showToast('Please select a table to proceed.', 'warning');
      return;
    }
    if (!customerName.trim()) {
      if (window.showToast) window.showToast('Please enter the customer name.', 'warning');
      return;
    }

    const tableId = parseInt(selectedTableId, 10) || selectedTableId;
    const table = tables.find(t => String(t.id) === String(tableId));
    const isToday = !bookingDate || bookingDate === todayStr || new Date(bookingDate).toDateString() === new Date().toDateString();

    onBook({
      tableId,
      tableNo: table ? table.no : String(tableId),
      tableName: table ? (table.table_name || `Table ${table.no}`) : `Table ${tableId}`,
      customerName: customerName.trim(),
      phone: phone.trim() || '—',
      guestsCount: Number(guestsCount) || 4,
      persons: Number(guestsCount) || 4,
      bookingDate: bookingDate || todayStr,
      bookingTime: bookingTime || nowTimeStr,
      checkIn: `${bookingDate || todayStr}T${bookingTime || nowTimeStr}:00`,
      isToday,
      occasion: occasion.trim(),
      status: 'Reserved'
    });

    // Reset states
    setSelectedTableId('');
    setCustomerName('');
    setPhone('');
    setGuestsCount(4);
    setOccasion('');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.3)', backdropFilter: 'blur(2px)', zIndex: 999 }} />

      {/* Modal box */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', width: '480px', maxWidth: '95%', padding: '24px', zIndex: 1000, fontFamily: 'var(--font-family, system-ui)', color: '#0f172a' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCalendarAlt style={{ color: '#0e7490', fontSize: '1.2rem' }} />
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Create Table Booking</h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Date & Time Grid (First at the top) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
            {/* Booking Date */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Booking Date *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FaCalendarAlt style={{ position: 'absolute', left: '10px', color: '#94a3b8', fontSize: '0.8rem' }} />
                <input
                  type="date"
                  value={bookingDate}
                  min={todayStr}
                  onChange={(e) => setBookingDate(e.target.value)}
                  style={{ width: '100%', padding: '9px 10px 9px 30px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  required
                />
              </div>
            </div>

            {/* Booking Time */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Time *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FaClock style={{ position: 'absolute', left: '10px', color: '#94a3b8', fontSize: '0.8rem' }} />
                <input
                  type="time"
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  style={{ width: '100%', padding: '9px 10px 9px 30px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  required
                />
              </div>
            </div>
          </div>

          {/* Table Selection (Blank Only - Placed right after Date/Time) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Select Table (Blank Only) *</label>
            <select
              value={selectedTableId}
              onChange={(e) => {
                setSelectedTableId(e.target.value);
                const tbl = tables.find(t => String(t.id) === e.target.value);
                if (tbl) {
                  setGuestsCount(tbl.seats || 4);
                }
              }}
              style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff', outline: 'none' }}
              required
            >
              {blankTables.length === 0 ? (
                <option value="">No blank tables available</option>
              ) : (
                <>
                  <option value="">Choose a blank table...</option>
                  {blankTables.map(t => (
                    <option key={t.id} value={t.id}>
                      {formatTableLabel(t.table_name || t.no)} (Blank) - {t.seats} Pax {t.floor ? `· ${t.floor}` : ''}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Customer Name */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Customer Name *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FaUser style={{ position: 'absolute', left: '10px', color: '#94a3b8', fontSize: '0.8rem' }} />
                <input
                  type="text"
                  placeholder="Customer name..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={{ width: '100%', padding: '9px 10px 9px 30px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Phone Number</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FaPhone style={{ position: 'absolute', left: '10px', color: '#94a3b8', fontSize: '0.8rem' }} />
                <input
                  type="text"
                  placeholder="Mobile number..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 10px 9px 30px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Guests PAX */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Guests (PAX) *</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FaUsers style={{ position: 'absolute', left: '10px', color: '#94a3b8', fontSize: '0.85rem' }} />
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  style={{ width: '100%', padding: '9px 10px 9px 30px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  required
                />
              </div>
            </div>

            {/* Occasion */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Occasion</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FaGlassCheers style={{ position: 'absolute', left: '10px', color: '#94a3b8', fontSize: '0.85rem' }} />
                <input
                  type="text"
                  placeholder="e.g. Birthday, Dinner"
                  value={occasion}
                  onChange={(e) => setOccasion(e.target.value)}
                  style={{ width: '100%', padding: '9px 10px 9px 30px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'background-color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={blankTables.length === 0}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: blankTables.length === 0 ? '#94a3b8' : '#0e7490',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: blankTables.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'background-color 150ms'
              }}
              onMouseEnter={e => { if (blankTables.length > 0) e.currentTarget.style.background = '#0c5a70'; }}
              onMouseLeave={e => { if (blankTables.length > 0) e.currentTarget.style.background = '#0e7490'; }}
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default BookTableModal;
