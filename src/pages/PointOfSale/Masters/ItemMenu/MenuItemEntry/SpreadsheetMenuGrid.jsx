import React, { useState } from 'react';
import {
  FaTable,
  FaPlus,
  FaTrash,
  FaCopy,
  FaSave,
  FaCheck,
  FaFileDownload,
  FaUtensils,
  FaFilter,
  FaTimes,
  FaMagic
} from 'react-icons/fa';

export const SAMPLE_MENU_ROWS = [
  // Steam Momos
  { id: 'sm_1', category: 'Steam Momos', itemName: 'Classic Momos', price: '', halfPrice: '49', fullPrice: '99', foodType: 'Veg', description: 'Fresh steamed vegetable momos' },
  { id: 'sm_2', category: 'Steam Momos', itemName: 'Jumbo Momos', price: '', halfPrice: '69', fullPrice: '129', foodType: 'Veg', description: 'Extra filled jumbo momos' },
  { id: 'sm_3', category: 'Steam Momos', itemName: 'Cheese Corn Momos', price: '', halfPrice: '89', fullPrice: '169', foodType: 'Veg', description: 'Filled with melted mozzarella & sweet corn' },
  { id: 'sm_4', category: 'Steam Momos', itemName: 'Paneer Momos', price: '', halfPrice: '89', fullPrice: '169', foodType: 'Veg', description: 'Spiced cottage cheese filling' },
  { id: 'sm_5', category: 'Steam Momos', itemName: 'Chicken Momos', price: '', halfPrice: '89', fullPrice: '169', foodType: 'Non-Veg', description: 'Juicy minced chicken momos' },

  // Toppings & Add-ons
  { id: 'top_1', category: 'Toppings', itemName: 'Fried Momo Topping', price: '', halfPrice: '29', fullPrice: '39', foodType: 'Veg', description: 'Add-on pricing: 4 Pc +₹29; 8 Pc +₹39' },
  { id: 'top_2', category: 'Toppings', itemName: 'Kurkure Crunch Topping', price: '', halfPrice: '29', fullPrice: '39', foodType: 'Veg', description: 'Add-on pricing: 4 Pc +₹29; 8 Pc +₹39' },
  { id: 'top_3', category: 'Toppings', itemName: 'Chilli Garlic Sauce', price: '', halfPrice: '29', fullPrice: '39', foodType: 'Veg', description: 'Add-on pricing: 4 Pc +₹29; 8 Pc +₹39' },
  { id: 'top_4', category: 'Toppings', itemName: 'Cheese Sauce Drizzle', price: '', halfPrice: '29', fullPrice: '39', foodType: 'Veg', description: 'Add-on pricing: 4 Pc +₹29; 8 Pc +₹39' },

  // Momo Platter
  { id: 'plt_1', category: 'Momo Platter', itemName: 'Jumbo Momo Platter', price: '189', halfPrice: '', fullPrice: '189', foodType: 'Veg', description: 'Flavours: 2 Pc Steam + 2 Pc Fried + 2 Pc Kurkure + 2 Pc Chilli Garlic (8 Pc)' },
  { id: 'plt_2', category: 'Momo Platter', itemName: 'Paneer Momo Platter', price: '189', halfPrice: '', fullPrice: '189', foodType: 'Veg', description: 'Flavours: 2 Pc Steam + 2 Pc Fried + 2 Pc Kurkure + 2 Pc Chilli Garlic (8 Pc)' },
  { id: 'plt_3', category: 'Momo Platter', itemName: 'Chicken Momo Platter', price: '189', halfPrice: '', fullPrice: '189', foodType: 'Non-Veg', description: 'Flavours: 2 Pc Steam + 2 Pc Fried + 2 Pc Kurkure + 2 Pc Chilli Garlic (8 Pc)' },

  // Pizza & Bakes
  { id: 'piz_1', category: 'Pizza & Bakes', itemName: 'Pizza Pocket', price: '79', halfPrice: '', fullPrice: '', foodType: 'Veg', description: '2 Pc. Crispy, cheesy, and loaded with pizza filling.' },
  { id: 'piz_2', category: 'Pizza & Bakes', itemName: 'Garlic Bread', price: '129', halfPrice: '', fullPrice: '', foodType: 'Veg', description: '6 Pc. Toasted bread topped with garlic butter, herbs, and melted cheese.' },
  { id: 'piz_3', category: 'Pizza & Bakes', itemName: 'Margherita Pizza', price: '139', halfPrice: '', fullPrice: '', foodType: 'Veg', description: 'Classic pizza topped with mozzarella cheese and Italian herbs.' },
  { id: 'piz_4', category: 'Pizza & Bakes', itemName: 'Cheese Corn Pizza', price: '149', halfPrice: '', fullPrice: '', foodType: 'Veg', description: 'Loaded with sweet corn and mozzarella cheese.' },
  { id: 'piz_5', category: 'Pizza & Bakes', itemName: 'Chicken Lover Pizza', price: '189', halfPrice: '', fullPrice: '', foodType: 'Non-Veg', description: 'Loaded with crispy chicken, onion, capsicum, olives and mozzarella cheese.' },

  // Beverages & Shakes
  { id: 'bev_1', category: 'Cold Coffee', itemName: 'Classic Cold Coffee', price: '139', halfPrice: '', fullPrice: '', foodType: 'Veg', description: 'Rich blended cold coffee' },
  { id: 'bev_2', category: 'Mocktails', itemName: 'Mint Mojito', price: '89', halfPrice: '', fullPrice: '', foodType: 'Veg', description: 'Fresh mint, lime and sparkling soda' },
  { id: 'bev_3', category: 'Shakes', itemName: 'Chocolate Shake', price: '139', halfPrice: '', fullPrice: '', foodType: 'Veg', description: 'Creamy rich chocolate shake' },

  // Chinese & Fast Food
  { id: 'chi_1', category: 'Chinese', itemName: 'Hakka Noodles', price: '149', halfPrice: '', fullPrice: '', foodType: 'Veg', description: 'Wok tossed noodles with crunchy veggies' },
  { id: 'chi_2', category: 'Chinese', itemName: 'Chilli Chicken (Dry / Gravy)', price: '169', halfPrice: '', fullPrice: '', foodType: 'Non-Veg', description: 'Tender chicken tossed with peppers and spicy soya' },
  { id: 'fry_1', category: 'Fries & Potato', itemName: 'Peri Peri Fries', price: '99', halfPrice: '', fullPrice: '', foodType: 'Veg', description: 'Served with Signature Dip' },
  { id: 'bur_1', category: 'Burger', itemName: 'Paneer Crispy Burger', price: '129', halfPrice: '', fullPrice: '', foodType: 'Veg', description: 'Crispy paneer patty with signature burger sauce' },
  { id: 'bur_2', category: 'Burger', itemName: 'Chicken Crispy Burger', price: '129', halfPrice: '', fullPrice: '', foodType: 'Non-Veg', description: 'Crispy chicken patty with lettuce and mayo' }
];

const CATEGORY_COLORS = {
  'Steam Momos': { header: '#fef08a', text: '#854d0e', badge: '#fef9c3' },
  'Toppings': { header: '#fed7aa', text: '#9a3412', badge: '#ffedd5' },
  'Momo Platter': { header: '#e2e8f0', text: '#334155', badge: '#f1f5f9' },
  'Pizza & Bakes': { header: '#fbcfe8', text: '#9d174d', badge: '#fce7f3' },
  'Cold Coffee': { header: '#bae6fd', text: '#0369a1', badge: '#e0f2fe' },
  'Mocktails': { header: '#bbf7d0', text: '#15803d', badge: '#dcfce7' },
  'Hot Coffee': { header: '#fed7aa', text: '#9a3412', badge: '#ffedd5' },
  'Shakes': { header: '#86efac', text: '#166534', badge: '#dcfce7' },
  'Rolls': { header: '#fde047', text: '#854d0e', badge: '#fef9c3' },
  'Pasta': { header: '#38bdf8', text: '#0369a1', badge: '#e0f2fe' },
  'Chinese': { header: '#fed7aa', text: '#9a3412', badge: '#ffedd5' },
  'Fries & Potato': { header: '#93c5fd', text: '#1d4ed8', badge: '#dbeafe' },
  'Burger': { header: '#fca5a5', text: '#991b1b', badge: '#fee2e2' }
};

const DEFAULT_CATEGORIES = [
  'Steam Momos',
  'Toppings',
  'Momo Platter',
  'Pizza & Bakes',
  'Cold Coffee',
  'Mocktails',
  'Hot Coffee',
  'Shakes',
  'Rolls',
  'Pasta',
  'Chinese',
  'Fries & Potato',
  'Burger'
];

const SpreadsheetMenuGrid = ({ onSaveRows, showToast }) => {
  const [rows, setRows] = useState(SAMPLE_MENU_ROWS.slice(0, 12));
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [saving, setSaving] = useState(false);

  // Update a single cell
  const handleCellChange = (id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  };

  // Add new blank row
  const handleAddRow = () => {
    const newRow = {
      id: `row_${Date.now()}`,
      category: filterCategory !== 'ALL' ? filterCategory : 'Steam Momos',
      itemName: '',
      price: '',
      halfPrice: '',
      fullPrice: '',
      foodType: 'Veg',
      description: ''
    };
    setRows(prev => [newRow, ...prev]);
  };

  // Clone a row
  const handleCloneRow = (row) => {
    const cloned = {
      ...row,
      id: `row_${Date.now()}`,
      itemName: `${row.itemName} (Copy)`
    };
    setRows(prev => [cloned, ...prev]);
  };

  // Delete row
  const handleDeleteRow = (id) => {
    setRows(prev => prev.filter(r => r.id !== id));
  };

  // Load complete 26-item sample menu
  const handleLoadSampleMenu = () => {
    setRows(SAMPLE_MENU_ROWS);
    if (showToast) showToast('Loaded complete sample menu spreadsheet.');
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Category', 'Item Name', 'Price (₹)', 'HALF 4PC', 'FULL 8PC', 'Food Type', 'Description / Remark'];
    const csvContent = [
      headers.join(','),
      ...rows.map(r => [
        `"${r.category || ''}"`,
        `"${r.itemName || ''}"`,
        `"${r.price || ''}"`,
        `"${r.halfPrice || ''}"`,
        `"${r.fullPrice || ''}"`,
        `"${r.foodType || ''}"`,
        `"${r.description || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Menu_Spreadsheet_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Save all rows
  const handleSaveAll = async () => {
    const validRows = rows.filter(r => r.itemName && r.itemName.trim().length > 0);
    if (validRows.length === 0) {
      if (showToast) showToast('Please enter at least one valid Item Name.');
      return;
    }

    setSaving(true);
    try {
      if (onSaveRows) {
        await onSaveRows(validRows);
      }
      if (showToast) showToast(`Successfully saved ${validRows.length} menu items from spreadsheet.`);
    } catch (err) {
      if (showToast) showToast('Failed to save spreadsheet items.');
    } finally {
      setSaving(false);
    }
  };

  // Filter rows by category
  const filteredRows = filterCategory === 'ALL'
    ? rows
    : rows.filter(r => r.category === filterCategory);

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '12px',
      border: '1px solid #cbd5e1',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      marginTop: '20px'
    }}>
      {/* Spreadsheet Control Bar */}
      <div style={{
        background: '#f8fafc',
        borderBottom: '1px solid #cbd5e1',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            background: '#0d9488',
            color: '#ffffff',
            padding: '7px 10px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px'
          }}>
            <FaTable />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              Spreadsheet Quick Entry Grid (Lower Form)
            </h4>
            <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
              Direct Excel-like data entry for Half / Full portions, pricing & remarks.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Category Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FaFilter size={10} style={{ color: '#64748b' }} />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                padding: '5px 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                outline: 'none',
                color: '#334155'
              }}
            >
              <option value="ALL">All Categories ({rows.length})</option>
              {DEFAULT_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleAddRow}
            style={{
              padding: '6px 12px',
              background: '#0d9488',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FaPlus size={10} /> Add Row
          </button>

          <button
            type="button"
            onClick={handleLoadSampleMenu}
            style={{
              padding: '6px 12px',
              background: '#f0fdfa',
              border: '1px solid #99f6e4',
              color: '#0d9488',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Load full 26-item momos, platters & pizza menu"
          >
            <FaMagic size={10} /> Load Sample Sheet
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            style={{
              padding: '6px 11px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: '#475569',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FaFileDownload size={10} /> Export CSV
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            style={{
              padding: '6px 16px',
              background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 5px rgba(13,148,136,0.25)'
            }}
          >
            <FaSave size={11} /> {saving ? 'Saving...' : 'Save All Items'}
          </button>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div style={{ overflowX: 'auto', maxHeight: '550px' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '12px',
          fontFamily: 'var(--font-family, system-ui)'
        }}>
          <thead>
            {/* Main Header row (Excel-style matching image) */}
            <tr style={{ background: '#ea580c', color: '#ffffff', textAlign: 'left', fontWeight: 800 }}>
              <th style={{ padding: '8px 10px', borderRight: '1px solid #fdba74', width: '150px' }}>
                Category ▾
              </th>
              <th style={{ padding: '8px 10px', borderRight: '1px solid #fdba74', width: '220px' }}>
                Item Name ▾
              </th>
              <th style={{ padding: '8px 10px', borderRight: '1px solid #fdba74', width: '110px' }}>
                Price (₹) ▾
              </th>
              <th style={{
                padding: '8px 10px',
                borderRight: '1px solid #fde047',
                width: '120px',
                background: '#ca8a04',
                color: '#ffffff',
                textAlign: 'center'
              }}>
                HALF 4PC
              </th>
              <th style={{
                padding: '8px 10px',
                borderRight: '1px solid #fde047',
                width: '120px',
                background: '#a16207',
                color: '#ffffff',
                textAlign: 'center'
              }}>
                FULL 8PC
              </th>
              <th style={{ padding: '8px 10px', borderRight: '1px solid #fdba74', width: '110px', textAlign: 'center' }}>
                Food Type
              </th>
              <th style={{ padding: '8px 10px', borderRight: '1px solid #fdba74' }}>
                Description / Remark
              </th>
              <th style={{ padding: '8px 10px', width: '70px', textAlign: 'center' }}>
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r, idx) => {
              const catColor = CATEGORY_COLORS[r.category] || { header: '#f1f5f9', text: '#334155', badge: '#f8fafc' };

              return (
                <tr
                  key={r.id}
                  style={{
                    background: idx % 2 === 0 ? '#ffffff' : '#fcfcfd',
                    borderBottom: '1px solid #e2e8f0',
                    transition: 'background 0.1s ease'
                  }}
                >
                  {/* Category */}
                  <td style={{
                    padding: '4px 6px',
                    borderRight: '1px solid #f1f5f9',
                    background: catColor.badge
                  }}>
                    <select
                      value={r.category}
                      onChange={(e) => handleCellChange(r.id, 'category', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px 6px',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: catColor.text,
                        border: '1px solid transparent',
                        borderRadius: '4px',
                        background: 'transparent',
                        outline: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      {DEFAULT_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </td>

                  {/* Item Name */}
                  <td style={{ padding: '4px 6px', borderRight: '1px solid #f1f5f9' }}>
                    <input
                      type="text"
                      value={r.itemName}
                      placeholder="e.g. Classic Momos"
                      onChange={(e) => handleCellChange(r.id, 'itemName', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        outline: 'none',
                        color: '#0f172a'
                      }}
                    />
                  </td>

                  {/* Standard Price */}
                  <td style={{ padding: '4px 6px', borderRight: '1px solid #f1f5f9' }}>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="₹ 0.00"
                      value={r.price}
                      onChange={(e) => handleCellChange(r.id, 'price', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        outline: 'none',
                        color: '#0d9488'
                      }}
                    />
                  </td>

                  {/* HALF 4PC */}
                  <td style={{ padding: '4px 6px', borderRight: '1px solid #f1f5f9', background: '#fefce8' }}>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="₹ Half"
                      value={r.halfPrice}
                      onChange={(e) => handleCellChange(r.id, 'halfPrice', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: 800,
                        border: '1px solid #fef08a',
                        borderRadius: '4px',
                        outline: 'none',
                        color: '#854d0e',
                        textAlign: 'center',
                        background: '#ffffff'
                      }}
                    />
                  </td>

                  {/* FULL 8PC */}
                  <td style={{ padding: '4px 6px', borderRight: '1px solid #f1f5f9', background: '#fef9c3' }}>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="₹ Full"
                      value={r.fullPrice}
                      onChange={(e) => handleCellChange(r.id, 'fullPrice', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        fontSize: '12px',
                        fontWeight: 800,
                        border: '1px solid #fef08a',
                        borderRadius: '4px',
                        outline: 'none',
                        color: '#713f12',
                        textAlign: 'center',
                        background: '#ffffff'
                      }}
                    />
                  </td>

                  {/* Food Type */}
                  <td style={{ padding: '4px 6px', borderRight: '1px solid #f1f5f9', textAlign: 'center' }}>
                    <select
                      value={r.foodType}
                      onChange={(e) => handleCellChange(r.id, 'foodType', e.target.value)}
                      style={{
                        padding: '3px 6px',
                        fontSize: '11px',
                        fontWeight: 800,
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                        cursor: 'pointer',
                        color: r.foodType === 'Veg' ? '#15803d' : '#b91c1c',
                        background: r.foodType === 'Veg' ? '#f0fdf4' : '#fef2f2'
                      }}
                    >
                      <option value="Veg">VEG 🟢</option>
                      <option value="Non-Veg">NON-VEG 🔴</option>
                      <option value="Egg">EGG 🟡</option>
                    </select>
                  </td>

                  {/* Description / Remark */}
                  <td style={{ padding: '4px 6px', borderRight: '1px solid #f1f5f9' }}>
                    <input
                      type="text"
                      value={r.description}
                      placeholder="e.g. Served with Signature Dip / Add-on pricing..."
                      onChange={(e) => handleCellChange(r.id, 'description', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '4px 8px',
                        fontSize: '11.5px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        outline: 'none',
                        color: '#475569'
                      }}
                    />
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '4px 6px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => handleCloneRow(r)}
                        style={{
                          border: 'none',
                          background: '#f1f5f9',
                          color: '#475569',
                          borderRadius: '4px',
                          padding: '4px',
                          cursor: 'pointer'
                        }}
                        title="Duplicate row"
                      >
                        <FaCopy size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRow(r.id)}
                        style={{
                          border: 'none',
                          background: '#fee2e2',
                          color: '#ef4444',
                          borderRadius: '4px',
                          padding: '4px',
                          cursor: 'pointer'
                        }}
                        title="Delete row"
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Spreadsheet Status Footer */}
      <div style={{
        padding: '10px 18px',
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11.5px',
        color: '#64748b'
      }}>
        <div>
          Showing <strong>{filteredRows.length}</strong> of <strong>{rows.length}</strong> rows. Click any cell to edit.
        </div>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
          <span>Columns: <strong>Category | Item Name | Base Price | Half 4PC | Full 8PC | Food Type | Remark</strong></span>
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetMenuGrid;
