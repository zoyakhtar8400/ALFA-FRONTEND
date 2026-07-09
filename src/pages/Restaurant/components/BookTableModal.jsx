import React, { useState } from 'react';
import { FaTimes, FaCalendarAlt, FaUser, FaUsers, FaUserTie } from 'react-icons/fa';
import { MOCK_WAITERS, MOCK_CAPTAINS } from '../constants/mockData';

const BookTableModal = ({ isOpen, onClose, tables, onBook }) => {
  const [selectedTableId, setSelectedTableId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [guestsCount, setGuestsCount] = useState(4);
  const [selectedWaiter, setSelectedWaiter] = useState('');
  const [selectedCaptain, setSelectedCaptain] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedTableId) {
      alert("Please select a table.");
      return;
    }
    if (!customerName.trim()) {
      alert("Please enter customer name.");
      return;
    }

    const tableId = parseInt(selectedTableId);
    const table = tables.find(t => t.id === tableId);
    
    if (table && (table.status === 'Running' || table.status === 'Paid')) {
      const confirmBook = window.confirm(`Table T${table.no} is currently '${table.status}'. Are you sure you want to book this table?`);
      if (!confirmBook) return;
    }

    onBook({
      tableId,
      customerName: customerName.trim(),
      guestsCount,
      waiter: selectedWaiter || null,
      captain: selectedCaptain || null,
    });

    // Reset states
    setSelectedTableId('');
    setCustomerName('');
    setGuestsCount(4);
    setSelectedWaiter('');
    setSelectedCaptain('');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.15)', backdropFilter: 'blur(1.5px)', zIndex: 999 }} />

      {/* Modal box */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '480px', maxWidth: '95%', padding: '24px', zIndex: 1000, fontFamily: 'system-ui', color: '#0f172a' }}>

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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Table Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Select Table</label>
            <select
              value={selectedTableId}
              onChange={(e) => {
                setSelectedTableId(e.target.value);
                const tbl = tables.find(t => String(t.id) === e.target.value);
                if (tbl) {
                  setGuestsCount(tbl.seats || 4);
                }
              }}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff', outline: 'none' }}
              required
            >
              <option value="">Choose a table...</option>
              {tables.filter(t => t.status === 'Blank').map(t => (
                <option key={t.id} value={t.id}>
                  Table T{t.no} ({t.status}) - {t.seats} Pax
                </option>
              ))}
            </select>
          </div>

          {/* Customer Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Customer Name</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <FaUser style={{ position: 'absolute', left: '12px', color: '#94a3b8', fontSize: '0.85rem' }} />
              <input
                type="text"
                placeholder="Enter customer name..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* Guests PAX */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Guests (PAX)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <FaUsers style={{ position: 'absolute', left: '12px', color: '#94a3b8', fontSize: '0.9rem' }} />
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                  required
                />
              </div>
            </div>

            {/* Waiter */}
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Waiter</label>
              <select
                value={selectedWaiter}
                onChange={(e) => setSelectedWaiter(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff', outline: 'none' }}
              >
                <option value="">Unassigned</option>
                {MOCK_WAITERS.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Captain */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '6px', textTransform: 'uppercase' }}>Captain</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <FaUserTie style={{ position: 'absolute', left: '12px', color: '#94a3b8', fontSize: '0.85rem' }} />
              <select
                value={selectedCaptain}
                onChange={(e) => setSelectedCaptain(e.target.value)}
                style={{ width: '100%', padding: '10px 10px 10px 34px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#fff', outline: 'none' }}
              >
                <option value="">Unassigned</option>
                {MOCK_CAPTAINS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
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
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#0e7490', color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'background-color 150ms' }}
              onMouseEnter={e => e.currentTarget.style.background = '#0c5a70'}
              onMouseLeave={e => e.currentTarget.style.background = '#0e7490'}
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
