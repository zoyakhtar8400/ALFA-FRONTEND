import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../../components/common/PageHeader';
import { useRestaurant } from '../../../../context/RestaurantContext';
import { menuService } from '../../../../services/menuService';
import { FaStore, FaSearch, FaSave, FaCheck, FaBan, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const ItemOutletPricingPage = ({ showToast }) => {
  const navigate = useNavigate();
  const { allOutlets, activeOutletId, selectOutlet } = useRestaurant();
  const [selectedOutlet, setSelectedOutlet] = useState(activeOutletId || 1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  // Load menu items
  useEffect(() => {
    setLoading(true);
    menuService.getMenu()
      .then(res => {
        const rawItems = res?.data || res?.items || (Array.isArray(res) ? res : []);
        const mapped = (rawItems || []).map(item => ({
          id: item.id || item.item_id,
          name: item.item_name || item.name || 'Dish',
          code: item.item_code || `ITM-${item.id}`,
          category: item.category_name || item.category || 'Main Course',
          basePrice: Number(item.price || item.rate || 0),
          overridePrice: Number(item.price || item.rate || 0),
          isAvailable: true,
          zomatoActive: true,
          swiggyActive: true
        }));

        // Check if override stored in localStorage
        try {
          const savedOverrides = localStorage.getItem(`alfa_outlet_item_pricing_${selectedOutlet}`);
          if (savedOverrides) {
            const parsed = JSON.parse(savedOverrides);
            const merged = mapped.map(it => parsed[it.id] ? { ...it, ...parsed[it.id] } : it);
            setItems(merged);
            return;
          }
        } catch (e) { }

        setItems(mapped);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [selectedOutlet]);

  const handlePriceChange = (id, newPrice) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, overridePrice: Number(newPrice) } : item));
  };

  const handleToggleAvailability = (id) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, isAvailable: !item.isAvailable } : item));
  };

  const handleTogglePlatform = (id, platform) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [platform]: !item[platform] } : item));
  };

  const handleSaveAll = () => {
    setSaving(true);
    try {
      const overridesMap = {};
      items.forEach(it => {
        overridesMap[it.id] = {
          overridePrice: it.overridePrice,
          isAvailable: it.isAvailable,
          zomatoActive: it.zomatoActive,
          swiggyActive: it.swiggyActive
        };
      });
      localStorage.setItem(`alfa_outlet_item_pricing_${selectedOutlet}`, JSON.stringify(overridesMap));
      setTimeout(() => {
        setSaving(false);
        const msg = 'Outlet item pricing & availability saved successfully.';
        if (showToast) showToast(msg, 'success');
        else if (window.showToast) window.showToast(msg, 'success');
      }, 300);
    } catch (e) {
      setSaving(false);
    }
  };

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return items;
    const q = searchTerm.toLowerCase();
    return items.filter(it => it.name.toLowerCase().includes(q) || it.code.toLowerCase().includes(q) || it.category.toLowerCase().includes(q));
  }, [items, searchTerm]);

  return (
    <div style={{ padding: '16px 24px 40px', background: '#f8fafc', minHeight: 'calc(100vh - 80px)', fontFamily: 'var(--font-family, system-ui)' }}>
      <PageHeader
        title="Item Outlet Config & Pricing"
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Item Outlet Config & Pricing']}
        onBack={() => navigate('/pos/master')}
        style={{ marginBottom: '14px' }}
      />

      {/* Top Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '16px', background: '#ffffff', padding: '12px 18px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaStore style={{ color: '#0d9488', fontSize: '15px' }} />
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#475569' }}>Outlet:</span>
            <select
              value={selectedOutlet}
              onChange={(e) => {
                const newId = Number(e.target.value);
                setSelectedOutlet(newId);
                selectOutlet(newId);
              }}
              style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '5px 10px', background: '#ffffff', outline: 'none', cursor: 'pointer' }}
            >
              {(allOutlets || []).map(o => (
                <option key={o.id} value={o.id}>
                  {o.store_name || o.name || `Outlet ${o.id}`}
                </option>
              ))}
            </select>
          </div>

          <div style={{ position: 'relative', width: '260px' }}>
            <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '12px' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search items..."
              style={{ width: '100%', padding: '6px 10px 6px 30px', fontSize: '12.5px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
            />
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#0d9488', color: '#ffffff', border: 'none', padding: '8px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 6px rgba(13,148,136,0.2)' }}
        >
          <FaSave />
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      {/* Pricing Table */}
      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <th style={{ padding: '12px 16px' }}>Item Name</th>
              <th style={{ padding: '12px 16px' }}>Category</th>
              <th style={{ padding: '12px 16px' }}>Base Price (₹)</th>
              <th style={{ padding: '12px 16px' }}>Outlet Rate (₹)</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>In-Stock / Availability</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Zomato</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Swiggy</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, idx) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fcfdfd', opacity: item.isAvailable ? 1 : 0.65 }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.name}</div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'monospace' }}>{item.code}</div>
                </td>
                <td style={{ padding: '12px 16px', color: '#0d9488', fontWeight: 600 }}>{item.category}</td>
                <td style={{ padding: '12px 16px', color: '#64748b' }}>₹{item.basePrice.toFixed(2)}</td>
                <td style={{ padding: '12px 16px' }}>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={item.overridePrice}
                    onChange={e => handlePriceChange(item.id, e.target.value)}
                    style={{ width: '90px', padding: '4px 8px', fontSize: '12.5px', fontWeight: 700, border: '1px solid #cbd5e1', borderRadius: '5px', textAlign: 'right' }}
                  />
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleToggleAvailability(item.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      background: item.isAvailable ? '#f0fdf4' : '#fef2f2',
                      color: item.isAvailable ? '#16a34a' : '#dc2626',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {item.isAvailable ? <FaCheck /> : <FaBan />}
                    <span>{item.isAvailable ? 'In Stock' : 'Sold Out'}</span>
                  </button>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleTogglePlatform(item.id, 'zomatoActive')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.zomatoActive ? '#e23744' : '#cbd5e1', fontSize: '18px' }}
                    title={item.zomatoActive ? 'Active on Zomato' : 'Disabled on Zomato'}
                  >
                    {item.zomatoActive ? <FaToggleOn /> : <FaToggleOff />}
                  </button>
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <button
                    onClick={() => handleTogglePlatform(item.id, 'swiggyActive')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.swiggyActive ? '#fc8019' : '#cbd5e1', fontSize: '18px' }}
                    title={item.swiggyActive ? 'Active on Swiggy' : 'Disabled on Swiggy'}
                  >
                    {item.swiggyActive ? <FaToggleOn /> : <FaToggleOff />}
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

export default ItemOutletPricingPage;
