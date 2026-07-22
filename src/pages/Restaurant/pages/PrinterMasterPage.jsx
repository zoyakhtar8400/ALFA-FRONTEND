import React, { useState } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaPrint, FaNetworkWired, FaUsb, FaWindows, FaCheck } from 'react-icons/fa';
import { INITIAL_PRINTERS } from '../constants/printerData';

const PRINTER_TYPES = ['Network', 'USB', 'Windows'];

const emptyPrinter = { id: '', name: '', type: 'Network', ip: '', port: 9100, status: 'Active', isDefault: false };

const PrinterMasterPage = () => {
  const [printers, setPrinters] = useState(INITIAL_PRINTERS);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyPrinter);
  const [showForm, setShowForm] = useState(false);
  const [testResult, setTestResult] = useState({}); // id → 'testing'|'ok'|'fail'

  const handleAdd = () => {
    setForm({ ...emptyPrinter, id: `p${Date.now()}` });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEdit = (p) => {
    setForm({ ...p });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { alert('Printer Name is required.'); return; }
    if (form.type === 'Network' && !form.ip.trim()) { alert('IP Address is required for Network printers.'); return; }
    if (editingId) {
      setPrinters(prev => prev.map(p => p.id === editingId ? { ...form } : p));
    } else {
      setPrinters(prev => [...prev, { ...form }]);
    }
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this printer?')) return;
    setPrinters(prev => prev.filter(p => p.id !== id));
  };

  const handleSetDefault = (id) => {
    setPrinters(prev => prev.map(p => ({ ...p, isDefault: p.id === id })));
  };

  const handleTest = (p) => {
    setTestResult(prev => ({ ...prev, [p.id]: 'testing' }));
    setTimeout(() => {
      setTestResult(prev => ({ ...prev, [p.id]: Math.random() > 0.2 ? 'ok' : 'fail' }));
    }, 1200);
  };

  const typeIcon = (type) => {
    if (type === 'Network') return <FaNetworkWired style={{ color: '#0e7490' }} />;
    if (type === 'USB')     return <FaUsb style={{ color: '#7c3aed' }} />;
    return <FaWindows style={{ color: '#0078d4' }} />;
  };

  return (
    <div style={{ padding: '28px 32px', background: '#f8fafc', minHeight: '100%' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0e7490', margin: 0 }}>Printer Master</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Manage printer stations for KOT routing (Kitchen, Bar, Tandoor, etc.)
          </p>
        </div>
        <button onClick={handleAdd} style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '8px', border: 'none',
          background: 'linear-gradient(135deg, #0e7490, #0891b2)', color: '#fff',
          fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(14,116,144,0.3)',
        }}>
          <FaPlus size={12} /> Add Printer
        </button>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total', value: printers.length, color: '#0e7490', bg: '#e0f2fe' },
          { label: 'Active', value: printers.filter(p => p.status === 'Active').length, color: '#16a34a', bg: '#dcfce7' },
          { label: 'Network', value: printers.filter(p => p.type === 'Network').length, color: '#7c3aed', bg: '#ede9fe' },
          { label: 'USB', value: printers.filter(p => p.type === 'USB').length, color: '#d97706', bg: '#fef3c7' },
        ].map(s => (
          <div key={s.label} style={{ padding: '10px 18px', borderRadius: '10px', background: s.bg, minWidth: '80px' }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.7rem', color: s.color, fontWeight: 600, opacity: 0.8 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #e2e8f0' }}>
              {['Printer Name', 'Type', 'IP / Port', 'Status', 'Default', 'Test', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 800, color: '#374151', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {printers.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#fafafa', transition: 'background 150ms' }}>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaPrint style={{ color: '#0e7490' }} />
                    <span style={{ fontWeight: 700, color: '#0f172a' }}>{p.name}</span>
                    {p.isDefault && <span style={{ fontSize: '0.65rem', background: '#0e7490', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>DEFAULT</span>}
                  </div>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: 600 }}>
                    {typeIcon(p.type)} {p.type}
                  </span>
                </td>
                <td style={{ padding: '13px 16px', color: '#475569', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                  {p.type === 'Network' ? `${p.ip} : ${p.port}` : <span style={{ color: '#94a3b8' }}>—</span>}
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: '999px',
                    background: p.status === 'Active' ? '#dcfce7' : '#fee2e2',
                    color: p.status === 'Active' ? '#15803d' : '#dc2626',
                  }}>{p.status}</span>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <button onClick={() => handleSetDefault(p.id)} style={{
                    width: '28px', height: '28px', borderRadius: '50%', border: `2px solid ${p.isDefault ? '#0e7490' : '#cbd5e1'}`,
                    background: p.isDefault ? '#0e7490' : '#fff', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {p.isDefault && <FaCheck size={10} color="#fff" />}
                  </button>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <button onClick={() => handleTest(p)} style={{
                    padding: '4px 12px', borderRadius: '6px', border: '1.5px solid #0e7490',
                    background: testResult[p.id] === 'ok' ? '#dcfce7' : testResult[p.id] === 'fail' ? '#fee2e2' : '#fff',
                    color: testResult[p.id] === 'ok' ? '#16a34a' : testResult[p.id] === 'fail' ? '#dc2626' : '#0e7490',
                    fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                  }}>
                    {testResult[p.id] === 'testing' ? '…' : testResult[p.id] === 'ok' ? '✓ Online' : testResult[p.id] === 'fail' ? '✗ Offline' : 'Test'}
                  </button>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={() => handleEdit(p)} style={{ padding: '5px 10px', borderRadius: '6px', border: '1.5px solid #0e7490', background: '#fff', color: '#0e7490', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>
                      <FaEdit /> Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)} style={{ padding: '5px 10px', borderRadius: '6px', border: '1.5px solid #ef4444', background: '#fff', color: '#ef4444', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700 }}>
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {printers.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No printers configured. Click <b>Add Printer</b> to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9000, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '480px', boxShadow: '0 20px 50px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #0e7490, #0891b2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 800, fontSize: '1rem' }}>{editingId ? 'Edit Printer' : 'Add Printer'}</span>
              <button onClick={() => setShowForm(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '6px', width: '28px', height: '28px', cursor: 'pointer' }}><FaTimes /></button>
            </div>
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: 'Printer Name *', key: 'name', type: 'text', placeholder: 'e.g. Kitchen Printer' },
              ].map(f => (
                <label key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>
                  {f.label}
                  <input autoFocus={f.key === 'name'} type={f.type} placeholder={f.placeholder} value={form[f.key] || ''} onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    style={{ padding: '8px 12px', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem', outline: 'none' }} />
                </label>
              ))}

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>
                Printer Type *
                <select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}>
                  {PRINTER_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </label>

              {form.type === 'Network' && (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <label style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>
                    IP Address *
                    <input type="text" placeholder="192.168.1.100" value={form.ip || ''} onChange={e => setForm(prev => ({ ...prev, ip: e.target.value }))}
                      style={{ padding: '8px 12px', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }} />
                  </label>
                  <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>
                    Port
                    <input type="number" placeholder="9100" value={form.port || ''} onChange={e => setForm(prev => ({ ...prev, port: Number(e.target.value) }))}
                      style={{ padding: '8px 12px', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }} />
                  </label>
                </div>
              )}

              <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.82rem', fontWeight: 700, color: '#374151' }}>
                Status
                <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                  style={{ padding: '8px 12px', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isDefault} onChange={e => setForm(prev => ({ ...prev, isDefault: e.target.checked }))} />
                Set as Default Printer (fallback for unmapped items)
              </label>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button onClick={() => setShowForm(false)} style={{ padding: '9px 20px', borderRadius: '7px', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                <button onClick={handleSave} style={{ padding: '9px 20px', borderRadius: '7px', border: 'none', background: '#0e7490', color: '#fff', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaSave size={12} /> Save Printer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrinterMasterPage;
