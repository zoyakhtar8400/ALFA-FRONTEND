import React, { useState } from 'react';

const RoomCheckoutEntryForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    voucherNo: initialData?.voucherNo || `RCO-${Math.floor(1000 + Math.random() * 9000)}`,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    grcNo: initialData?.grcNo || '',
    roomNo: initialData?.roomNo || '',
    guestName: initialData?.guestName || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    checkoutDate: initialData?.checkoutDate || new Date().toISOString().split('T')[0],
    checkoutTime: initialData?.checkoutTime || '',
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="form-grid-2">
        <div className="form-field">
          <label className="form-label">Voucher No</label>
          <input className="form-input bg-slate-50 cursor-not-allowed" type="text" value={form.voucherNo} disabled />
        </div>
        <div className="form-field">
          <label className="form-label">Date</label>
          <input className="form-input" type="date" value={form.date} onChange={set('date')} />
        </div>
        <div className="form-field">
          <label className="form-label">GRC No</label>
          <input className="form-input" type="text" value={form.grcNo} onChange={set('grcNo')} placeholder="GRC number" />
        </div>
        <div className="form-field">
          <label className="form-label">Room No</label>
          <input className="form-input" type="text" value={form.roomNo} onChange={set('roomNo')} placeholder="Room number" />
        </div>
        <div className="form-field form-span-2">
          <label className="form-label">Guest Name</label>
          <input className="form-input" type="text" value={form.guestName} onChange={set('guestName')} placeholder="Guest name" />
        </div>
        <div className="form-field form-span-2">
          <label className="form-label">Address</label>
          <input className="form-input" type="text" value={form.address} onChange={set('address')} placeholder="Full address" />
        </div>
        <div className="form-field">
          <label className="form-label">City</label>
          <input className="form-input" type="text" value={form.city} onChange={set('city')} placeholder="City" />
        </div>
        <div className="form-field">
          <label className="form-label">Checkout Date</label>
          <input className="form-input" type="date" value={form.checkoutDate} onChange={set('checkoutDate')} required />
        </div>
        <div className="form-field form-span-2">
          <label className="form-label">Checkout Time</label>
          <input className="form-input" type="time" value={form.checkoutTime} onChange={set('checkoutTime')} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
        <button type="button" onClick={onCancel} className="btn-secondary" style={{ cursor: 'pointer' }}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" style={{ cursor: 'pointer' }}>
          {mode === 'add' ? 'Save' : 'Update'}
        </button>
      </div>
    </form>
  );
};

export default RoomCheckoutEntryForm;
