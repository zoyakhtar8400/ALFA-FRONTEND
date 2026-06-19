import React, { useState, useEffect } from 'react';
import BackButton from '../../../../components/common/BackButton';

const RoomCategoryForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    shortName: '',
    noOfRoom: '',
    applicableDate: '',
    acName: '',
    taxStructure: '',
    active: 'Yes',
    singleRate: '',
    doubleRate: '',
    extraAdult: '',
    tripleRate: '',
    quadrantRate: '',
    extraChild: ''
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm({
      name: '',
      shortName: '',
      noOfRoom: '',
      applicableDate: '',
      acName: '',
      taxStructure: '',
      active: 'Yes',
      singleRate: '',
      doubleRate: '',
      extraAdult: '',
      tripleRate: '',
      quadrantRate: '',
      extraChild: ''
    });
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.shortName.trim()) return;
    onSave(form);
  };

  return (
    <div className="dashboard-panel" style={{ gap: '24px' }}>
      <BackButton onClick={onCancel} />
      
      <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
        <h3 className="panel-title" style={{ fontSize: '1.35rem' }}>
          {mode === 'add' ? 'Add Room Category' : 'Edit Room Category'}
        </h3>
        <p className="text-secondary" style={{ fontSize: '0.85rem', marginTop: '4px' }}>
          Add Information
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Name</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Enter name" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem' }} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Short Name</label>
            <input type="text" value={form.shortName} onChange={e => setForm(f => ({ ...f, shortName: e.target.value }))} placeholder="Enter short name" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem' }} required />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>No. of Room</label>
            <input type="number" value={form.noOfRoom} onChange={e => setForm(f => ({ ...f, noOfRoom: e.target.value }))} placeholder="Enter number" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Applicable Date</label>
            <input type="date" value={form.applicableDate} onChange={e => setForm(f => ({ ...f, applicableDate: e.target.value }))} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>A/c Name</label>
            <select value={form.acName} onChange={e => setForm(f => ({ ...f, acName: e.target.value }))} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', backgroundColor: '#fff' }}>
              <option value="">Select</option>
              <option>Room Revenue</option>
              <option>Suite Revenue</option>
              <option>Standard Revenue</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Tax Structure</label>
            <select value={form.taxStructure} onChange={e => setForm(f => ({ ...f, taxStructure: e.target.value }))} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', backgroundColor: '#fff' }}>
              <option value="">Select</option>
              <option>NO TAX</option>
              <option>TAX @5%</option>
              <option>TAX @12%</option>
              <option>TAX @18%</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Active</label>
            <select value={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.value }))} style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', backgroundColor: '#fff' }}>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
        </div>

        <div style={{ backgroundColor: '#f0f9ff', border: '2px solid #3b82f6', borderRadius: '12px', padding: '20px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--dark)', marginBottom: '16px' }}>Rate Structure</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Single Rate</label>
              <input type="number" step="0.01" value={form.singleRate} onChange={e => setForm(f => ({ ...f, singleRate: e.target.value }))} placeholder="0.00" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', backgroundColor: '#fff' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Double Rate</label>
              <input type="number" step="0.01" value={form.doubleRate} onChange={e => setForm(f => ({ ...f, doubleRate: e.target.value }))} placeholder="0.00" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', backgroundColor: '#fff' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Extra Adult</label>
              <input type="number" step="0.01" value={form.extraAdult} onChange={e => setForm(f => ({ ...f, extraAdult: e.target.value }))} placeholder="0.00" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', backgroundColor: '#fff' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Triple Rate</label>
              <input type="number" step="0.01" value={form.tripleRate} onChange={e => setForm(f => ({ ...f, tripleRate: e.target.value }))} placeholder="0.00" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', backgroundColor: '#fff' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Quadrant Rate</label>
              <input type="number" step="0.01" value={form.quadrantRate} onChange={e => setForm(f => ({ ...f, quadrantRate: e.target.value }))} placeholder="0.00" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', backgroundColor: '#fff' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--dark)' }}>Extra Child</label>
              <input type="number" step="0.01" value={form.extraChild} onChange={e => setForm(f => ({ ...f, extraChild: e.target.value }))} placeholder="0.00" style={{ border: '1px solid var(--border)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.9rem', backgroundColor: '#fff' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-start' }}>
          <button type="submit" style={{ backgroundColor: 'var(--primary)', color: '#ffffff', border: 'none', padding: '12px 28px', borderRadius: '24px', fontWeight: 'bold', cursor: 'pointer' }}>
            Save
          </button>
          <button type="button" onClick={onCancel} style={{ backgroundColor: '#ffffff', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '12px 28px', borderRadius: '24px', fontWeight: 'bold', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomCategoryForm;
