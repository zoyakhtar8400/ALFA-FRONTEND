import React, { useState, useEffect } from 'react';
import CommonModal from '../../../components/common/CommonModal';

const F = ({ label, type = 'text', placeholder, required, disabled, children, value, onChange, style, inputStyle }) => (
  <div className="form-field" style={{ marginBottom: '6px', ...style }}>
    <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '2px', color: '#334155' }}>
      {label}{required && <span className="text-red-500"> *</span>}
    </label>
    {children || (
      <input
        className={`form-input${disabled ? ' bg-slate-50 cursor-not-allowed' : ''}`}
        type={type}
        value={value ?? ''}
        onChange={disabled ? undefined : onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        style={{ fontSize: '0.88rem', padding: '4px 10px', height: '34px', minHeight: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', ...inputStyle }}
      />
    )}
  </div>
);

const QuickAddMenuModal = ({ isOpen, onClose, onSave, categories = ['FOOD', 'BEVERAGE', 'BANQUET', 'OTHERS'] }) => {
  const [form, setForm] = useState({
    name: '',
    category: 'FOOD',
    foodType: 'Veg',
    kitchen: 'Main Kitchen',
    price: '',
    unit: 'Portion',
    active: 'Yes'
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    if (!form.name.trim()) {
      setError('Item Name is required');
      return false;
    }
    if (!form.category) {
      setError('Category is required');
      return false;
    }
    if (!form.kitchen.trim()) {
      setError('Department is required');
      return false;
    }
    if (form.price === '' || isNaN(form.price) || Number(form.price) < 0) {
      setError('Valid Base Price is required');
      return false;
    }
    setError('');
    return true;
  };

  const handleFormSubmit = (e, addNew = false) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...form,
      price: Number(form.price).toFixed(2),
      shortCode: String(Math.floor(100 + Math.random() * 900)),
      taxStructure: 'TAX @5%',
      areaPrices: {
        'Restaurant Dining': Number(form.price).toFixed(2)
      }
    };

    onSave(payload);

    if (addNew) {
      setForm({
        name: '',
        category: form.category,
        foodType: 'Veg',
        kitchen: form.kitchen,
        price: '',
        unit: 'Portion',
        active: 'Yes'
      });
      setError('');
    } else {
      onClose();
    }
  };

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Add Menu Item"
      maxWidth="600px"
    >
      <form onSubmit={(e) => handleFormSubmit(e, false)} style={{ padding: '4px 2px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {error && (
          <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, color: '#dc2626' }}>
            {error}
          </div>
        )}

        {/* Item Name */}
        <F label="Item Name" required value={form.name} onChange={setField('name')} placeholder="e.g. Paneer Butter Masala" />

        {/* Category & Department */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <F label="Category" required>
            <select
              value={form.category}
              onChange={setField('category')}
              style={{ fontSize: '0.88rem', padding: '4px 10px', height: '34px', minHeight: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', outline: 'none' }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </F>

          <F label="Department" required value={form.kitchen} onChange={setField('kitchen')} placeholder="e.g. Main Kitchen" />
        </div>

        {/* Food Type */}
        <div className="form-field" style={{ marginBottom: '6px' }}>
          <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '2px', color: '#334155' }}>
            Food Type
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '6px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
            {['Veg', 'Non-Veg', 'Egg'].map((type) => (
              <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="foodType"
                  value={type}
                  checked={form.foodType === type}
                  onChange={setField('foodType')}
                  style={{ accentColor: '#0e7490', width: '15px', height: '15px', cursor: 'pointer' }}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Base Price & Unit */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <F label="Base Price (₹)" required type="number" value={form.price} onChange={setField('price')} placeholder="0.00" inputStyle={{ fontWeight: 700, color: '#0e7490' }} />

          <F label="Unit">
            <select
              value={form.unit}
              onChange={setField('unit')}
              style={{ fontSize: '0.88rem', padding: '4px 10px', height: '34px', minHeight: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', outline: 'none' }}
            >
              <option value="Portion">Portion</option>
              <option value="Plate">Plate</option>
              <option value="Pcs">Pcs</option>
              <option value="Half/Full">Half/Full</option>
              <option value="Bottle">Bottle</option>
              <option value="Glass">Glass</option>
            </select>
          </F>
        </div>

        {/* Status */}
        <div className="form-field" style={{ marginBottom: '6px' }}>
          <label className="form-label" style={{ fontSize: '0.78rem', fontWeight: 700, marginBottom: '2px', color: '#334155' }}>
            Status
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '6px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
            {['Yes', 'No'].map((status) => (
              <label key={status} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="status"
                  value={status}
                  checked={form.active === status}
                  onChange={setField('active')}
                  style={{ accentColor: '#0e7490', width: '15px', height: '15px', cursor: 'pointer' }}
                />
                <span>{status === 'Yes' ? 'Active' : 'Inactive'}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', paddingTop: '12px', marginTop: '6px', borderTop: '1px solid #e2e8f0' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '6px 14px', height: '34px', background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#475569', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleFormSubmit(e, true)}
            style={{ padding: '6px 14px', height: '34px', background: '#f0fdfa', border: '1px solid #ccfbf1', color: '#0e7490', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Save & Add New
          </button>
          <button
            type="submit"
            style={{ padding: '6px 18px', height: '34px', background: '#0e7490', border: 'none', color: '#ffffff', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
          >
            Save Item
          </button>
        </div>
      </form>
    </CommonModal>
  );
};

export default QuickAddMenuModal;
