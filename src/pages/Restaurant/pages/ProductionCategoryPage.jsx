import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaArrowRight } from 'react-icons/fa';
import { INITIAL_PRODUCTION_CATEGORIES, INITIAL_PRINTERS } from '../constants/printerData';

const COLOR_OPTIONS = ['#ef4444','#f97316','#eab308','#16a34a','#0e7490','#7c3aed','#ec4899','#06b6d4','#8b5cf6','#10b981'];

const empty = { id: '', name: '', color: '#0e7490', printerId: '', status: 'Active' };

const ProductionCategoryPage = () => {
  const [categories, setCategories] = useState(INITIAL_PRODUCTION_CATEGORIES);
  const [printers] = useState(INITIAL_PRINTERS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);

  const handleAdd = () => {
    setForm({ ...empty, id: `pc${Date.now()}` });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (c) => { setForm({ ...c }); setEditingId(c.id); setShowForm(true); };
  const handleDelete = (id) => { if (!window.confirm('Delete this category?')) return; setCategories(prev => prev.filter(c => c.id !== id)); };

  const handleSave = () => {
    if (!form.name.trim()) { alert('Category Name is required.'); return; }
    if (editingId) {
      setCategories(prev => prev.map(c => c.id === editingId ? { ...form } : c));
    } else {
      setCategories(prev => [...prev, { ...form }]);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const getPrinterName = (pid) => printers.find(p => p.id === pid)?.name || '—';

  return (
    <div style={{ padding: '28px 32px', background: '#f8fafc', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0e7490', margin: 0 }}>Production Category Master</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Define kitchen stations — each category maps to a printer for KOT routing
          </p>
        </div>
        <button onClick={handleAdd} style={{
          display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
          borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0e7490, #0891b2)',
          color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(14,116,144,0.3)',
        }}>
          <FaPlus size={12} /> Add Category
        </button>
      </div>

      {/* Flow diagram */}
      <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '14px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '0.8rem', color: '#64748b' }}>
        <span style={{ fontWeight: 700, color: '#0e7490' }}>KOT Flow:</span>
        {['Menu Item', 'Production Category', 'Printer Mapping', 'KOT Engine', 'Printer Station'].map((step, i, arr) => (
          <React.Fragment key={step}>
            <span style={{ padding: '3px 10px', borderRadius: '999px', background: '#f1f5f9', fontWeight: 600 }}>{step}</span>
            {i < arr.length - 1 && <FaArrowRight size={10} />}
          </React.Fragment>
        ))}
      </div>

      {/* Cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        {categories.map(cat => (
          <div key={cat.id} style={{
            background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0',
            overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            borderLeft: `5px solid ${cat.color}`,
            transition: 'box-shadow 150ms',
          }}>
            <div style={{ padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>{cat.name}</span>
                </div>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px',
                  background: cat.status === 'Active' ? '#dcfce7' : '#fee2e2',
                  color: cat.status === 'Active' ? '#15803d' : '#dc2626',
                }}>{cat.status}</span>
              </div>
              <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 600 }}>→ Printer:</span>
                <span style={{ fontWeight: 700, color: '#0e7490' }}>{getPrinterName(cat.printerId)}</span>
              </div>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', padding: '9px 16px', display: 'flex', gap: '8px', background: '#fafafa' }}>
              <button onClick={() => handleEdit(cat)} style={{ flex: 1, padding: '5px', borderRadius: '6px', border: '1.5px solid #0e7490', background: '#fff', color: '#0e7490', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>
                <FaEdit /> Edit
              </button>
              <button onClick={() => handleDelete(cat.id)} style={{ padding: '5px 10px', borderRadius: '6px', border: '1.5px solid #ef4444', background: '#fff', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer' }}>
                <FaTrash />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '440px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #0e7490, #0891b2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>{editingId ? 'Edit Category' : 'Add Production Category'}</span>
              <button onClick={() => setShowForm(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer' }}><FaTimes /></button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>
                Category Name *
                <input autoFocus type="text" placeholder="e.g. Tandoor, Main Course…" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }} />
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>
                Assigned Printer
                <select value={form.printerId} onChange={e => setForm(p => ({ ...p, printerId: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}>
                  <option value="">— Select Printer —</option>
                  {printers.filter(p => p.status === 'Active').map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>
                Color Tag
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {COLOR_OPTIONS.map(c => (
                    <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                      style={{ width: '26px', height: '26px', borderRadius: '50%', background: c, border: form.color === c ? '3px solid #0f172a' : '2px solid transparent', cursor: 'pointer' }} />
                  ))}
                </div>
              </label>

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>
                Status
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}>
                  <option>Active</option><option>Inactive</option>
                </select>
              </label>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button onClick={() => setShowForm(false)} style={{ padding: '9px 20px', borderRadius: '7px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '9px 20px', borderRadius: '7px', border: 'none', background: '#0e7490', color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaSave size={12} /> Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionCategoryPage;
