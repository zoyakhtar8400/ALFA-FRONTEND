import React, { useState, useCallback, useMemo } from 'react';
import { LuSearch, LuRefreshCw, LuCheck } from 'react-icons/lu';
import PageHeader from '../../../../components/common/PageHeader';

const INITIAL_ITEMS = [
  { id: 'IRU1', name: 'Plate Charge',                  outlet: 'Banquet',       itemGroup: 'Banquet',   price: 1000, unit: 'PCS', hsnCode: '996344' },
  { id: 'IRU2', name: 'DJT',                           outlet: 'Banquet',       itemGroup: 'Banquet',   price: 5000, unit: 'PCS', hsnCode: '996344' },
  { id: 'IRU3', name: 'Tamatar Or Dhaniya Ka Shorba',  outlet: 'Room Service',  itemGroup: 'Breakfast', price: 49,   unit: 'PCS', hsnCode: '996311' },
  { id: 'IRU4', name: 'Vegetable Manchurian Gravy',    outlet: 'Room Service',  itemGroup: 'Food',      price: 149,  unit: 'PCS', hsnCode: '996331' },
  { id: 'IRU5', name: 'Vegetable Hot And Sour Gravy',  outlet: 'Room Service',  itemGroup: 'Food',      price: 149,  unit: 'PCS', hsnCode: '996331' },
  { id: 'IRU6', name: 'Tomato Soup',                   outlet: 'Room',          itemGroup: 'Food',      price: 149,  unit: 'PCS', hsnCode: '996331' },
  { id: 'IRU7', name: 'French Fries',                  outlet: 'Room',          itemGroup: 'Food',      price: 149,  unit: 'PCS', hsnCode: '996331' },
];

const OUTLETS = ['All', 'Banquet', 'Room Service', 'Room'];

const ItemRateUpdatePage = () => {
  const toast = (msg, type = 'success') => window.showToast?.(msg, type);

  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('hms_pos_rate_update_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const save = (list) => localStorage.setItem('hms_pos_rate_update_items', JSON.stringify(list));

  const [searchName, setSearchName]         = useState('');
  const [selectedOutlet, setSelectedOutlet] = useState('All');
  const [direction, setDirection]           = useState('increase');
  const [mode, setMode]                     = useState('percentage');
  const [value, setValue]                   = useState('');

  const filtered = useMemo(() => items.filter(item => {
    const matchName   = item.name.toLowerCase().includes(searchName.toLowerCase());
    const matchOutlet = selectedOutlet === 'All' || item.outlet === selectedOutlet;
    return matchName && matchOutlet;
  }), [items, searchName, selectedOutlet]);

  const handleNameChange = (id, val) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, name: val } : i));
  };

  const handlePriceChange = (id, val) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, price: val } : i));
  };

  const handleRowUpdate = (item) => {
    const p = parseFloat(item.price);
    if (isNaN(p) || p < 0) { toast('Enter a valid price.', 'error'); return; }
    const updated = items.map(i => i.id === item.id ? { ...i, price: p } : i);
    setItems(updated); save(updated);
    toast(`"${item.name}" rate updated.`);
  };

  const handleUpdateAll = () => {
    const v = parseFloat(value);
    if (isNaN(v) || v <= 0) { toast('Enter a valid adjustment value.', 'error'); return; }
    const filteredIds = new Set(filtered.map(f => f.id));
    const updated = items.map(item => {
      if (!filteredIds.has(item.id)) return item;
      const diff = mode === 'percentage' ? (item.price * v) / 100 : v;
      const newPrice = direction === 'increase' ? item.price + diff : Math.max(0, item.price - diff);
      return { ...item, price: Math.round(newPrice) };
    });
    setItems(updated); save(updated); setValue('');
    toast(`Rates ${direction}d for ${filtered.length} items.`);
  };

  const handleReset = () => {
    setItems(INITIAL_ITEMS); save(INITIAL_ITEMS);
    toast('Rates reset to original.', 'info');
  };

  const inputStyle = {
    height: '38px', padding: '0 12px', borderRadius: '8px',
    border: '1.5px solid #e2e8f0', fontSize: '13px', color: '#0f172a',
    outline: 'none', background: '#fff', width: '100%',
    fontFamily: 'var(--font-family)',
  };

  const labelStyle = { fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px', display: 'block' };

  return (
    <div style={{ padding: '24px', fontFamily: 'var(--font-family)', backgroundColor: 'var(--background)', minHeight: '100%' }}>
      <PageHeader
        title="Item Rate Update"
        breadcrumbs={['Point Of Sale', 'Masters', 'Item Rate Update']}
      />

      {/* Adjustment Panel */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px 24px', marginTop: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid #f1f5f9' }}>
          Rate Adjustment
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Search Item</label>
            <div style={{ position: 'relative' }}>
              <LuSearch size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="text" placeholder="Item name..." value={searchName}
                onChange={e => setSearchName(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '32px' }} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Outlet</label>
            <select value={selectedOutlet} onChange={e => setSelectedOutlet(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {OUTLETS.map(o => <option key={o} value={o}>{o === 'All' ? 'All Outlets' : o}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Adjust Type</label>
            <select value={direction} onChange={e => setDirection(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="increase">Increase</option>
              <option value="decrease">Decrease</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Mode</label>
            <select value={mode} onChange={e => setMode(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="percentage">Percentage (%)</option>
              <option value="amount">Amount (₹)</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Value ({mode === 'percentage' ? '%' : '₹'})</label>
            <input type="number" placeholder="e.g. 10" value={value}
              onChange={e => setValue(e.target.value)} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleUpdateAll}
            style={{ padding: '0 20px', height: '38px', borderRadius: '8px', border: 'none', background: '#418A8B', color: '#fff', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LuCheck size={14} /> Update All
          </button>
          <button onClick={handleReset}
            style={{ padding: '0 20px', height: '38px', borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontWeight: '700', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <LuRefreshCw size={14} /> Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', marginTop: '16px' }}>
        <div style={{ padding: '16px 20px', borderBottom: '2px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>Item Rates</span>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>{filtered.length} items</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
              {['#', 'Item Name', 'Outlet', 'Group', 'Rate (₹)', 'Unit', 'HSN Code', 'Action'].map((h, i) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: i === 0 || i === 7 ? 'center' : 'left', fontSize: '11px', fontWeight: '700', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '48px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>No items found.</td>
              </tr>
            ) : filtered.map((item, idx) => (
              <tr key={item.id}
                style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #f8fafc' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: '13px', color: '#64748b', fontWeight: '600' }}>{idx + 1}</td>
                <td style={{ padding: '12px 16px' }}>
                  <input type="text" value={item.name}
                    onChange={e => handleNameChange(item.id, e.target.value)}
                    style={{ ...inputStyle, width: '200px', fontWeight: '700', color: '#0f172a' }}
                  />
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: '#f0fdfa', color: '#0f766e', border: '1px solid #99f6e4' }}>{item.outlet}</span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>{item.itemGroup}</td>
                <td style={{ padding: '12px 16px' }}>
                  <input type="number" value={item.price}
                    onChange={e => handlePriceChange(item.id, e.target.value)}
                    style={{ ...inputStyle, width: '100px', textAlign: 'right', fontWeight: '700', color: '#244E5F' }}
                  />
                </td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>{item.unit}</td>
                <td style={{ padding: '12px 16px', fontSize: '13px', color: '#475569', fontWeight: '600' }}>{item.hsnCode}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <button onClick={() => handleRowUpdate(item)}
                    style={{ padding: '0 14px', height: '30px', borderRadius: '8px', border: 'none', background: '#418A8B', color: '#fff', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#244E5F'}
                    onMouseLeave={e => e.currentTarget.style.background = '#418A8B'}
                  >
                    Update
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ItemRateUpdatePage;
export { ItemRateUpdatePage };
