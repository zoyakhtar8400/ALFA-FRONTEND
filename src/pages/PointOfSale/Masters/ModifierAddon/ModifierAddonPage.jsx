import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../../components/common/PageHeader';
import { FaPlus, FaEdit, FaTrash, FaPlusCircle, FaTimes, FaSave } from 'react-icons/fa';

const DEFAULT_ADDONS = [
  { id: 1, name: 'Mild Spicy', groupName: 'Spice Level', price: 0, foodType: 'Veg', status: 'Active' },
  { id: 2, name: 'Medium Spicy', groupName: 'Spice Level', price: 0, foodType: 'Veg', status: 'Active' },
  { id: 3, name: 'Extra Spicy', groupName: 'Spice Level', price: 10, foodType: 'Veg', status: 'Active' },
  { id: 4, name: 'Extra Mozzarella Cheese', groupName: 'Extra Toppings', price: 50, foodType: 'Veg', status: 'Active' },
  { id: 5, name: 'Paneer Cubes', groupName: 'Extra Toppings', price: 40, foodType: 'Veg', status: 'Active' },
  { id: 6, name: 'Chicken Chunks', groupName: 'Extra Toppings', price: 60, foodType: 'Non-Veg', status: 'Active' },
  { id: 7, name: 'Garlic Butter Naan', groupName: 'Choice of Bread', price: 35, foodType: 'Veg', status: 'Active' },
  { id: 8, name: 'Tandoori Roti', groupName: 'Choice of Bread', price: 20, foodType: 'Veg', status: 'Active' },
  { id: 9, name: 'Mint Mayonnaise', groupName: 'Choice of Sauce', price: 15, foodType: 'Veg', status: 'Active' },
  { id: 10, name: 'Peri Peri Dip', groupName: 'Choice of Sauce', price: 20, foodType: 'Veg', status: 'Active' },
];

const ModifierAddonPage = ({ showToast }) => {
  const navigate = useNavigate();
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_modifier_addons');
      return saved ? JSON.parse(saved) : DEFAULT_ADDONS;
    } catch {
      return DEFAULT_ADDONS;
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [modal, setModal] = useState({ open: false, isEdit: false, item: null });
  const [fields, setFields] = useState({ name: '', groupName: 'Spice Level', price: 0, foodType: 'Veg', status: 'Active' });

  useEffect(() => {
    try {
      localStorage.setItem('alfa_modifier_addons', JSON.stringify(data));
    } catch (e) { }
  }, [data]);

  const groupsList = useMemo(() => {
    const set = new Set(data.map(d => d.groupName));
    return Array.from(set);
  }, [data]);

  const handleOpenAdd = () => {
    setFields({ name: '', groupName: groupsList[0] || 'Spice Level', price: 0, foodType: 'Veg', status: 'Active' });
    setModal({ open: true, isEdit: false, item: null });
  };

  const handleOpenEdit = (item) => {
    setFields({ ...item });
    setModal({ open: true, isEdit: true, item });
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this modifier add-on?')) {
      setData(prev => prev.filter(item => item.id !== id));
      if (showToast) showToast('Modifier add-on deleted.', 'info');
      else if (window.showToast) window.showToast('Modifier add-on deleted.', 'info');
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!fields.name.trim()) {
      if (showToast) showToast('Add-on name is required.', 'warning');
      else if (window.showToast) window.showToast('Add-on name is required.', 'warning');
      return;
    }

    if (modal.isEdit) {
      setData(prev => prev.map(item => item.id === modal.item.id ? { ...fields, id: item.id } : item));
      if (showToast) showToast('Modifier add-on updated.', 'success');
      else if (window.showToast) window.showToast('Modifier add-on updated.', 'success');
    } else {
      const newItem = { ...fields, id: Date.now() };
      setData(prev => [...prev, newItem]);
      if (showToast) showToast('Modifier add-on created.', 'success');
      else if (window.showToast) window.showToast('Modifier add-on created.', 'success');
    }
    setModal({ open: false, isEdit: false, item: null });
  };

  const filteredData = useMemo(() => {
    let result = data;
    if (selectedGroup !== 'ALL') {
      result = result.filter(d => d.groupName === selectedGroup);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(d => d.name.toLowerCase().includes(q) || d.groupName.toLowerCase().includes(q));
    }
    return result;
  }, [data, selectedGroup, searchTerm]);

  return (
    <div style={{ padding: '16px 24px 40px', background: '#f8fafc', minHeight: 'calc(100vh - 80px)', fontFamily: 'var(--font-family, system-ui)' }}>
      <PageHeader
        title="Modifier Add-ons Master"
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Modifier Add-ons']}
        onBack={() => navigate('/pos/master')}
        style={{ marginBottom: '14px' }}
      />

      {/* Top Filter & Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px', background: '#ffffff', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search add-on..."
            style={{ width: '240px', padding: '6px 12px', fontSize: '12.5px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
          />

          <select
            value={selectedGroup}
            onChange={e => setSelectedGroup(e.target.value)}
            style={{ padding: '6px 10px', fontSize: '12.5px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', background: '#ffffff', color: '#334155' }}
          >
            <option value="ALL">All Modifier Groups</option>
            {groupsList.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleOpenAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0d9488', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(13,148,136,0.2)' }}
        >
          <FaPlus style={{ fontSize: '11px' }} />
          <span>Add Modifier Add-on</span>
        </button>
      </div>

      {/* Table */}
      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <th style={{ padding: '12px 16px' }}>Add-on Name</th>
              <th style={{ padding: '12px 16px' }}>Modifier Group</th>
              <th style={{ padding: '12px 16px' }}>Extra Price (₹)</th>
              <th style={{ padding: '12px 16px' }}>Food Type</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, idx) => (
              <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fcfdfd' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>{row.name}</td>
                <td style={{ padding: '12px 16px', color: '#0d9488', fontWeight: 600 }}>{row.groupName}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                  {row.price === 0 ? (
                    <span style={{ color: '#16a34a', background: '#f0fdf4', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>Free (₹0)</span>
                  ) : (
                    `+₹${Number(row.price).toFixed(2)}`
                  )}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: row.foodType === 'Veg' ? '#f0fdf4' : '#fef2f2',
                    color: row.foodType === 'Veg' ? '#16a34a' : '#dc2626'
                  }}>
                    {row.foodType}
                  </span>
                </td>
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
          <div style={{ background: '#ffffff', borderRadius: '10px', width: '420px', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FaPlusCircle style={{ color: '#0d9488' }} />
                <span>{modal.isEdit ? 'Edit Modifier Add-on' : 'Add Modifier Add-on'}</span>
              </h3>
              <button onClick={() => setModal({ open: false, isEdit: false, item: null })} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Add-on Name *</label>
                  <input
                    type="text"
                    required
                    value={fields.name}
                    onChange={e => setFields(p => ({ ...p, name: e.target.value }))}
                    style={{ width: '100%', padding: '6px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    placeholder="e.g. Extra Cheese, Garlic Dip"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Modifier Group *</label>
                  <select
                    value={fields.groupName}
                    onChange={e => setFields(p => ({ ...p, groupName: e.target.value }))}
                    style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  >
                    {groupsList.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Extra Price (₹)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={fields.price}
                      onChange={e => setFields(p => ({ ...p, price: Number(e.target.value) }))}
                      style={{ width: '100%', padding: '6px 10px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Food Type</label>
                    <select
                      value={fields.foodType}
                      onChange={e => setFields(p => ({ ...p, foodType: e.target.value }))}
                      style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    >
                      <option value="Veg">Veg</option>
                      <option value="Non-Veg">Non-Veg</option>
                      <option value="Egg">Egg</option>
                    </select>
                  </div>
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
                  Save Add-on
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModifierAddonPage;
