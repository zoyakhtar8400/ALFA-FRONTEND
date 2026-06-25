import React, { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import { FaBed, FaCoins, FaCheckSquare } from 'react-icons/fa';

const MultiRoomCheckout = ({ showToast }) => {
  const [checkoutDate, setCheckoutDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('UPI');

  // Currently occupied rooms that can be checked out directly from this checkbox list
  const [rooms, setRooms] = useState([
    { id: 1, roomNo: '101', grcNo: 'GRC-1001', guestName: 'Rajan Mehta', checkinDate: '2026-06-18', checkoutDate: '2026-06-22', balance: 12000, selected: false },
    { id: 2, roomNo: '102', grcNo: 'GRC-1004', guestName: 'Rajan Mehta', checkinDate: '2026-06-18', checkoutDate: '2026-06-22', balance: 16400, selected: false },
    { id: 3, roomNo: '310', grcNo: 'GRC-1003', guestName: 'Amit Patel', checkinDate: '2026-06-20', checkoutDate: '2026-06-22', balance: 8900, selected: false },
    { id: 4, roomNo: '311', grcNo: 'GRC-1005', guestName: 'Amit Patel', checkinDate: '2026-06-20', checkoutDate: '2026-06-22', balance: 10000, selected: false },
  ]);

  const handleToggleRoom = (id) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r));
  };

  const handleToggleAll = (e) => {
    const isChecked = e.target.checked;
    setRooms(prev => prev.map(r => ({ ...r, selected: isChecked })));
  };

  const selectedRooms = rooms.filter(r => r.selected);
  const totalBalance = selectedRooms.reduce((acc, curr) => acc + curr.balance, 0);

  const handleGroupCheckout = () => {
    if (selectedRooms.length === 0) {
      showToast('Please select at least one room to checkout.');
      return;
    }
    const roomNos = selectedRooms.map(r => r.roomNo).join(', ');
    showToast(`Checked out rooms: ${roomNos} successfully via ${paymentMode}!`);
    // Remove the checked out rooms from active state to simulate checkout
    setRooms(prev => prev.filter(r => !r.selected));
  };

  const sectionTitle = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0 4px', borderBottom: '2px solid var(--primary)', marginBottom: '8px' }}>
      <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary)' }}>{title}</span>
    </div>
  );

  return (
    <div className="animate-in duration-200" style={{ padding: '0 8px' }}>
      <style dangerouslySetInnerHTML={{__html: `
        ::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
        }
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />

      <PageHeader
        title="Multi Room Checkout"
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Multi Room Checkout']}
        style={{ marginBottom: '8px' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '3.5fr 6.5fr', gap: '10px', alignItems: 'start', marginBottom: '10px' }}>
        
        {/* Left Column: Settlement & Actions */}
        <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
          {sectionTitle(<FaCoins />, 'Settlement Settings')}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
            <div className="form-field">
              <label className="form-label" style={{ marginBottom: '2px' }}>Checkout Date</label>
              <input
                className="form-input"
                type="date"
                value={checkoutDate}
                onChange={e => setCheckoutDate(e.target.value)}
                style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }}
              />
            </div>

            <div className="form-field">
              <label className="form-label" style={{ marginBottom: '2px' }}>Payment Mode</label>
              <select
                className="form-select"
                value={paymentMode}
                onChange={e => setPaymentMode(e.target.value)}
                style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }}
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          {/* Highlighted Sum Card */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)',
            borderRadius: '6px',
            padding: '10px 14px',
            boxShadow: '0 4px 10px rgba(109, 40, 217, 0.25)',
            color: '#fff',
            marginBottom: '12px'
          }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'rgba(255, 255, 255, 0.9)' }}>
              Selected Rooms Total Balance
            </label>
            <div style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              ₹ {totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.8)' }}>
              {selectedRooms.length} room(s) selected
            </div>
          </div>

          <button
            type="button"
            onClick={handleGroupCheckout}
            disabled={selectedRooms.length === 0}
            className="btn-primary"
            style={{
              width: '100%',
              height: '38px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: selectedRooms.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: selectedRooms.length > 0 ? '0 4px 10px rgba(79, 70, 229, 0.3)' : 'none',
              background: selectedRooms.length === 0 ? '#cbd5e1' : 'var(--primary)',
              borderColor: selectedRooms.length === 0 ? '#cbd5e1' : 'var(--primary)',
              color: selectedRooms.length === 0 ? '#64748b' : '#fff'
            }}
          >
            Checkout Selected Rooms
          </button>
        </div>

        {/* Right Column: Checkbox Grid Table */}
        <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
          {sectionTitle(<FaBed />, 'Active Occupied Rooms')}
          
          <div style={{ overflowX: 'auto', width: '100%', border: '1px solid var(--border)', borderRadius: '6px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid var(--border)' }}>
              <thead>
                <tr style={{ background: 'var(--primary-light)' }}>
                  <th style={{ padding: '8px 10px', textAlign: 'center', width: '8%', border: '1px solid var(--border)' }}>
                    <input
                      type="checkbox"
                      onChange={handleToggleAll}
                      checked={rooms.length > 0 && rooms.every(r => r.selected)}
                      style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                    />
                  </th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', width: '15%', border: '1px solid var(--border)' }}>Room No</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', width: '20%', border: '1px solid var(--border)' }}>GRC No</th>
                  <th style={{ padding: '8px 10px', textAlign: 'left', width: '25%', border: '1px solid var(--border)' }}>Guest Name</th>
                  <th style={{ padding: '8px 10px', textAlign: 'center', width: '16%', border: '1px solid var(--border)' }}>Check-In</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right', width: '16%', border: '1px solid var(--border)' }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {rooms.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No active occupied rooms found.
                    </td>
                  </tr>
                ) : (
                  rooms.map((row) => (
                    <tr key={row.id} style={{ background: row.selected ? 'rgba(109, 40, 217, 0.04)' : 'transparent' }}>
                      <td style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid var(--border)' }}>
                        <input
                          type="checkbox"
                          checked={row.selected}
                          onChange={() => handleToggleRoom(row.id)}
                          style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                        />
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid var(--border)', fontWeight: 700 }}>{row.roomNo}</td>
                      <td style={{ padding: '8px 10px', border: '1px solid var(--border)' }}>{row.grcNo}</td>
                      <td style={{ padding: '8px 10px', border: '1px solid var(--border)', fontWeight: 500 }}>{row.guestName}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid var(--border)' }}>{row.checkinDate}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid var(--border)', fontWeight: 600 }}>₹{row.balance.toLocaleString('en-IN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MultiRoomCheckout;
