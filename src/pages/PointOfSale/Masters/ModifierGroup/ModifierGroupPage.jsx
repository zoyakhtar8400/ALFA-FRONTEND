import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../../components/common/PageHeader';
import CommonTable from '../../../../components/common/CommonTable';
import { FaPlus, FaEdit, FaTrash, FaLayerGroup, FaTimes, FaSave } from 'react-icons/fa';

const DEFAULT_MODIFIER_GROUPS = [
  { id: 1, name: 'Spice Level', code: 'MOD_SPICE', minSelection: 1, maxSelection: 1, isMandatory: 'Yes', status: 'Active', assignedItems: 'All Curry, Biryani' },
  { id: 2, name: 'Choice of Bread', code: 'MOD_BREAD', minSelection: 1, maxSelection: 2, isMandatory: 'No', status: 'Active', assignedItems: 'Thali, Combo Meals' },
  { id: 3, name: 'Cooking Temperature', code: 'MOD_TEMP', minSelection: 1, maxSelection: 1, isMandatory: 'Yes', status: 'Active', assignedItems: 'Steaks, Sizzlers' },
  { id: 4, name: 'Extra Toppings', code: 'MOD_TOPPING', minSelection: 0, maxSelection: 5, isMandatory: 'No', status: 'Active', assignedItems: 'Pizzas, Pasta, Burgers' },
  { id: 5, name: 'Choice of Sauce', code: 'MOD_SAUCE', minSelection: 0, maxSelection: 2, isMandatory: 'No', status: 'Active', assignedItems: 'Starters, Fries' },
];

const ModifierGroupPage = ({ showToast }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_modifier_groups');
      return saved ? JSON.parse(saved) : DEFAULT_MODIFIER_GROUPS;
    } catch {
      return DEFAULT_MODIFIER_GROUPS;
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState({ open: false, isEdit: false, item: null });
  const [fields, setFields] = useState({ name: '', code: '', minSelection: 0, maxSelection: 1, isMandatory: 'No', status: 'Active', assignedItems: '' });

  useEffect(() => {
    try {
      localStorage.setItem('alfa_modifier_groups', JSON.stringify(data));
    } catch (e) { }
  }, [data]);

  const handleOpenAdd = () => {
    setFields({ name: '', code: `MOD_${Date.now().toString().slice(-4)}`, minSelection: 0, maxSelection: 1, isMandatory: 'No', status: 'Active', assignedItems: '' });
    setModal({ open: true, isEdit: false, item: null });
  };

  const handleOpenEdit = (item) => {
    setFields({ ...item });
    setModal({ open: true, isEdit: true, item });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this modifier group?')) {
      setData(prev => prev.filter(item => item.id !== id));
      if (showToast) showToast('Modifier group deleted.', 'info');
      else if (window.showToast) window.showToast('Modifier group deleted.', 'info');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!fields.name.trim()) {
      if (showToast) showToast('Modifier group name is required.', 'warning');
      else if (window.showToast) window.showToast('Modifier group name is required.', 'warning');
      return;
    }

    if (modal.isEdit) {
      setData(prev => prev.map(item => item.id === modal.item.id ? { ...fields, id: item.id } : item));
      if (showToast) showToast('Modifier group updated.', 'success');
      else if (window.showToast) window.showToast('Modifier group updated.', 'success');
    } else {
      const newItem = { ...fields, id: Date.now() };
      setData(prev => [...prev, newItem]);
      if (showToast) showToast('Modifier group created.', 'success');
      else if (window.showToast) window.showToast('Modifier group created.', 'success');
    }
    setModal({ open: false, isEdit: false, item: null });
  };

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const q = searchTerm.toLowerCase();
    return data.filter(d => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q));
  }, [data, searchTerm]);

  return (
    <div style={{ padding: '16px 24px 40px', background: '#f8fafc', minHeight: 'calc(100vh - 80px)', fontFamily: 'var(--font-family, system-ui)' }}>
      <PageHeader
        title="Modifier Group Master"
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Modifier Group']}
        onBack={() => navigate('/pos/master')}
        style={{ marginBottom: '14px' }}
      />

      {/* Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px', background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search modifier group..."
          style={{ width: '280px', padding: '6px 12px', fontSize: '12.5px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
        />

        <button
          onClick={handleOpenAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0d9488', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(13,148,136,0.2)' }}
        >
          <FaPlus style={{ fontSize: '11px' }} />
          <span>Add Modifier Group</span>
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <th style={{ padding: '12px 16px' }}>Group Name</th>
              <th style={{ padding: '12px 16px' }}>Code</th>
              <th style={{ padding: '12px 16px' }}>Min Selection</th>
              <th style={{ padding: '12px 16px' }}>Max Selection</th>
              <th style={{ padding: '12px 16px' }}>Mandatory</th>
              <th style={{ padding: '12px 16px' }}>Assigned Items</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, idx) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fcfdfd' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{row.name}</td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontFamily: 'monospace' }}>{row.code}</td>
                <td style={{ padding: '12px 16px', color: '#334155' }}>{row.minSelection}</td>
                <td style={{ padding: '12px 16px', color: '#334155' }}>{row.maxSelection}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: row.isMandatory === 'Yes' ? '#fef3c7' : '#f1f5f9', color: row.isMandatory === 'Yes' ? '#92400e' : '#475569' }}>
                    {row.isMandatory}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>{row.assignedItems || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, background: row.status === 'Active' ? '#e6f7f4' : '#fee2e2', color: row.status === 'Active' ? '#0d9488' : '#b91c1c' }}>
                    {row.status}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleOpenEdit(row)}
                    style={{ background: 'none', border: 'none', color: '#0d9488', cursor: 'pointer', padding: '4px 6px', marginRight: '6px' }}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(row.id)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px 6px' }}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {modal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(2px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#ffffff', borderRadius: '10px', width: '440px', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaLayerGroup style={{ color: '#0d9488' }} />
                <span>{modal.isEdit ? 'Edit Modifier Group' : 'Add Modifier Group'}</span>
              </h3>
              <button onClick={() => setModal({ open: false, isEdit: false, item: null })} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Group Name *</label>
                  <input
                    type="text"
                    required
                    value={fields.name}
                    onChange={e => setFields(p => ({ ...p, name: e.target.value }))}
                    style={{ width: '100%', padding: '6px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    placeholder="e.g. Spice Level, Extra Toppings"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Min Selection</label>
                    <input
                      type="number"
                      min="0"
                      value={fields.minSelection}
                      onChange={e => setFields(p => ({ ...p, minSelection: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '6px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Max Selection</label>
                    <input
                      type="number"
                      min="1"
                      value={fields.maxSelection}
                      onChange={e => setFields(p => ({ ...p, maxSelection: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '6px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Is Mandatory?</label>
                    <select
                      value={fields.isMandatory}
                      onChange={e => setFields(p => ({ ...p, isMandatory: e.target.value }))}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    >
                      <option value="No">No (Optional)</option>
                      <option value="Yes">Yes (Required before KOT)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Status</label>
                    <select
                      value={fields.status}
                      onChange={e => setFields(p => ({ ...p, status: e.target.value }))}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Assigned Categories / Items</label>
                  <input
                    type="text"
                    value={fields.assignedItems}
                    onChange={e => setFields(p => ({ ...p, assignedItems: e.target.value }))}
                    style={{ width: '100%', padding: '6px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    placeholder="e.g. Starters, Biryani, Pizzas"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setModal({ open: false, isEdit: false, item: null })}
                  style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '6px 18px', fontSize: '12px', borderRadius: '6px', border: 'none', background: '#0d9488', color: '#ffffff', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModifierGroupPage;
