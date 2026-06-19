import React, { useState, useEffect } from 'react';

const RoomMasterForm = ({ isOpen, mode, initialData, onSave, onClose }) => {
  const [form, setForm] = useState({ roomNo: '', floor: '', category: '', hkStatus: 'Clean', bedType: 'Single', maxOccupancy: '', status: 'Active' });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm({ roomNo: '', floor: '', category: '', hkStatus: 'Clean', bedType: 'Single', maxOccupancy: '', status: 'Active' });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.roomNo.trim() || !form.floor.trim() || !form.category.trim()) return;
    onSave(form);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '600px', boxShadow: 'var(--shadow)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--dark)' }}>
            {mode === 'add' ? 'Add Room' : 'Edit Room'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark)' }}>Room No</label>
              <input type="text" value={form.roomNo} onChange={e => setForm(f => ({ ...f, roomNo: e.target.value }))} placeholder="Room 101" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem' }} required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark)' }}>Floor</label>
              <input type="text" value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))} placeholder="First Floor" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem' }} required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark)' }}>Category</label>
              <input type="text" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Standard Comfort Room" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem' }} required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark)' }}>Housekeeping Status</label>
              <select value={form.hkStatus} onChange={e => setForm(f => ({ ...f, hkStatus: e.target.value }))} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem', backgroundColor: '#fff' }}>
                <option>Clean</option>
                <option>Dirty</option>
                <option>Maintenance</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark)' }}>Bed Type</label>
              <select value={form.bedType} onChange={e => setForm(f => ({ ...f, bedType: e.target.value }))} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem', backgroundColor: '#fff' }}>
                <option>Single</option>
                <option>Double</option>
                <option>Queen</option>
                <option>King</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark)' }}>Max Occupancy</label>
              <input type="number" value={form.maxOccupancy} onChange={e => setForm(f => ({ ...f, maxOccupancy: e.target.value }))} placeholder="2" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark)' }}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem', backgroundColor: '#fff' }}>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 22px', borderRadius: '30px', border: '1px solid var(--border)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', backgroundColor: '#fff', color: 'var(--text-secondary)' }}>Cancel</button>
            <button type="submit" style={{ padding: '9px 22px', borderRadius: '30px', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', backgroundColor: 'var(--primary)', color: '#fff' }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomMasterForm;
