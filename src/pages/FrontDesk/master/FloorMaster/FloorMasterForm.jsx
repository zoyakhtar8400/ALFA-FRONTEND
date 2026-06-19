import React, { useState, useEffect } from 'react';

const FloorMasterForm = ({ isOpen, mode, initialData, onSave, onClose }) => {
  const [form, setForm] = useState({ name: '', active: 'Yes' });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({ name: '', active: 'Yes' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.45)' }}>
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '420px', boxShadow: 'var(--shadow)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--dark)' }}>
            {mode === 'add' ? 'Add Floor' : 'Edit Floor'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark)' }}>Floor Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Enter floor name"
                style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem' }}
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--dark)' }}>Active</label>
              <select
                value={form.active}
                onChange={e => setForm(f => ({ ...f, active: e.target.value }))}
                style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '9px 12px', fontSize: '0.88rem', backgroundColor: '#fff' }}
              >
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 22px', borderRadius: '30px', border: '1px solid var(--border)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', backgroundColor: '#fff', color: 'var(--text-secondary)' }}>
              Cancel
            </button>
            <button type="submit" style={{ padding: '9px 22px', borderRadius: '30px', border: 'none', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', backgroundColor: 'var(--primary)', color: '#fff' }}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FloorMasterForm;
