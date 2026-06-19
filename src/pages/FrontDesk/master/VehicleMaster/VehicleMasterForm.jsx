import React, { useState, useEffect } from 'react';

const VehicleMasterForm = ({ isOpen, mode, initialData, onSave, onClose }) => {
  const [form, setForm] = useState({ regNo: '', type: 'Sedan', driver: '', mobile: '', model: '', status: 'Active' });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm({ regNo: '', type: 'Sedan', driver: '', mobile: '', model: '', status: 'Active' });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.regNo.trim() || !form.driver.trim()) return;
    onSave(form);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '540px', boxShadow: 'var(--shadow)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--dark)' }}>
            {mode === 'add' ? 'Add Vehicle' : 'Edit Vehicle'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark)' }}>Registration No</label>
              <input type="text" value={form.regNo} onChange={e => setForm(f => ({ ...f, regNo: e.target.value }))} placeholder="NY-AX-1234" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem' }} required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark)' }}>Vehicle Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem', backgroundColor: '#fff' }}>
                <option>Sedan</option>
                <option>SUV</option>
                <option>Mini Van</option>
                <option>Bus</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark)' }}>Driver Name</label>
              <input type="text" value={form.driver} onChange={e => setForm(f => ({ ...f, driver: e.target.value }))} placeholder="Enter driver name" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem' }} required />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark)' }}>Mobile</label>
              <input type="text" value={form.mobile} onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))} placeholder="+1 555-0000" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark)' }}>Model</label>
              <input type="text" value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="Enter model" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem' }} />
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

export default VehicleMasterForm;
