import React, { useState } from 'react';
import { FaTimes, FaCheck, FaExchangeAlt, FaUserPlus, FaMoneyBillWave, FaBed } from 'react-icons/fa';

const FrontOfficeActionModal = ({ isOpen, type, item = {}, onClose, onConfirm }) => {
  const [targetRoom, setTargetRoom] = useState('105');
  const [newStatus, setNewStatus] = useState('Clean');
  const [paymentAmount, setPaymentAmount] = useState('1200');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [newCheckOutDate, setNewCheckOutDate] = useState('');
  const [newCheckOutTime, setNewCheckOutTime] = useState('');

  if (!isOpen || !item) return null;

  const getTitle = () => {
    switch (type) {
      case 'checkIn': return `Confirm Check-In: ${item.guestName}`;
      case 'checkout': return `Confirm Checkout: Room ${item.roomNo || '104'}`;
      case 'roomChange': return `Change Room for ${item.guestName}`;
      case 'assignRoom': return `Assign Room for ${item.guestName}`;
      case 'changeStatus': return `Update Room ${item.roomNo} Status`;
      case 'receivePayment': return `Receive Payment from ${item.guestName}`;
      case 'extendStay': return `Extend Stay for ${item.guestName}`;
      case 'amendStay': return `Amend Stay: Room ${item.roomNo || '102'}`;
      default: return 'Confirm Action';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(type, item, { targetRoom, newStatus, paymentAmount, paymentMode, newCheckOutDate, newCheckOutTime });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(3px)', padding: '16px' }}>
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#fff',
          borderRadius: '20px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>{getTitle()}</h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <FaTimes size={15} />
          </button>
        </div>

        {/* Modal Body depending on action type */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem' }}>
          {type === 'checkIn' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Complete check-in for <strong>{item.guestName}</strong> into <strong>Room {item.roomNo || '104'}</strong>?</p>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', fontSize: '0.8rem' }}>
                <div><strong>Category:</strong> {item.category || 'Deluxe Room'}</div>
                <div><strong>Arrival:</strong> {item.arrival || 'Today 07:05 AM'}</div>
              </div>
            </div>
          )}

          {type === 'checkout' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Process checkout for <strong>{item.guestName}</strong> from <strong>Room {item.roomNo || '104'}</strong>?</p>
              <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '10px', border: '1px solid #fca5a5', fontSize: '0.8rem', color: '#991b1b' }}>
                <div><strong>Pending Balance:</strong> {item.pending || '₹0'}</div>
                <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>Checking out will mark Room {item.roomNo} status to Dirty.</div>
              </div>
            </div>
          )}

          {type === 'roomChange' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Select a vacant target room for <strong>{item.guestName}</strong> (Current: Room {item.roomNo}):</p>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>TARGET ROOM</label>
                <select value={targetRoom} onChange={(e) => setTargetRoom(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <option value="102">Room 102 (Deluxe - Clean)</option>
                  <option value="105">Room 105 (Standard - Clean)</option>
                  <option value="204">Room 204 (Executive - Clean)</option>
                </select>
              </div>
            </div>
          )}

          {type === 'assignRoom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Assign room for booking <strong>#{item.bookingNo || '551'}</strong> ({item.guestName}):</p>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>SELECT AVAILABLE ROOM</label>
                <select value={targetRoom} onChange={(e) => setTargetRoom(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <option value="102">Room 102 (Deluxe)</option>
                  <option value="105">Room 105 (Deluxe)</option>
                  <option value="201">Room 201 (Deluxe)</option>
                </select>
              </div>
            </div>
          )}

          {type === 'changeStatus' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Update housekeeping status for <strong>Room {item.roomNo}</strong>:</p>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>NEW STATUS</label>
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <option value="Clean">🟢 Clean (Vacant)</option>
                  <option value="Dirty">🟡 Dirty (Requires Cleaning)</option>
                  <option value="Housekeeping">🔵 Housekeeping In-Progress</option>
                  <option value="Out Of Order">🔴 Out Of Order</option>
                </select>
              </div>
            </div>
          )}

          {type === 'receivePayment' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Receive pending bill payment for Bill <strong>#{item.billNo || '220'}</strong> ({item.guestName}):</p>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>PAYMENT AMOUNT (₹)</label>
                <input type="text" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', fontWeight: 700 }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>PAYMENT MODE</label>
                <select value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card / Debit Card</option>
                  <option value="UPI / QR">UPI / GooglePay / PhonePe</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT)</option>
                </select>
              </div>
            </div>
          )}

          {type === 'extendStay' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Extend departure date for <strong>{item.guestName}</strong> (Room {item.roomNo}):</p>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>EXTEND BY NIGHTS</label>
                <select style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)' }}>
                  <option value="1">1 Night (New Departure: Tomorrow)</option>
                  <option value="2">2 Nights</option>
                  <option value="3">3 Nights</option>
                </select>
              </div>
            </div>
          )}

          {type === 'amendStay' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '4px' }}>Room No</label>
                  <input type="text" value={item.roomNo || '102'} disabled style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #f1f5f9', background: '#f8fafc', color: '#475569', fontSize: '0.8rem', fontWeight: 600 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '4px' }}>GRC No.</label>
                  <input type="text" value={item.grcNo || '127'} disabled style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #f1f5f9', background: '#f8fafc', color: '#475569', fontSize: '0.8rem', fontWeight: 600 }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '4px' }}>Name</label>
                <input type="text" value={item.guestName || 'Sarah Wilson'} disabled style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #f1f5f9', background: '#f8fafc', color: '#475569', fontSize: '0.8rem', fontWeight: 600 }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '4px' }}>Company Name</label>
                <input type="text" value={item.companyName || item.company || 'SONY INDIA PVT. LTD'} disabled style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #f1f5f9', background: '#f8fafc', color: '#475569', fontSize: '0.8rem', fontWeight: 600 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '4px' }}>Exp CheckOut Date</label>
                  <input type="text" value={item.departure || '03-07-2026'} disabled style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #f1f5f9', background: '#f8fafc', color: '#475569', fontSize: '0.8rem', fontWeight: 600 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', marginBottom: '4px' }}>Time</label>
                  <input type="text" value={item.checkoutTime || '12:00 PM'} disabled style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid #f1f5f9', background: '#f8fafc', color: '#475569', fontSize: '0.8rem', fontWeight: 600 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingTop: '10px', borderTop: '1px dashed #f1f5f9', marginTop: '4px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>New CheckOut Date</label>
                  <input type="date" value={newCheckOutDate} onChange={(e) => setNewCheckOutDate(e.target.value)} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--primary)', fontSize: '0.82rem', fontWeight: 600 }} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>New Time</label>
                  <input type="time" value={newCheckOutTime} onChange={(e) => setNewCheckOutTime(e.target.value)} style={{ width: '100%', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--primary)', fontSize: '0.82rem', fontWeight: 600 }} required />
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: 'var(--surface)' }}>
          <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.82rem', borderRadius: '10px' }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.82rem', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <FaCheck /> Confirm Action
          </button>
        </div>
      </form>
    </div>
  );
};

export default FrontOfficeActionModal;
