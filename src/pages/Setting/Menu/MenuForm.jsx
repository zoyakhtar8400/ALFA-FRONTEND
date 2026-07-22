import React, { useState, useEffect } from 'react';
import PageHeader from '../../../components/common/PageHeader';
import CommonActionButtons from '../../../components/common/CommonActionButtons';
import useDuplicateValidation from '../../../hooks/useDuplicateValidation';
import { handleEnterNavigation } from '../../../utils/keyboardNavigation';
import { FaUtensils, FaTags, FaPlus, FaTrash, FaEdit } from 'react-icons/fa';

const DEFAULT_SERVICE_AREAS = [
  'Restaurant Dining',
  'Rooftop',
  'Pool Side',
  'Room Service',
  'Banquet',
  'Garden Restaurant',
  'Lounge / Bar',
  'Takeaway / Delivery'
];

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

const MenuForm = ({ mode, initialData, onSave, onCancel, existingRecords = [] }) => {
  const [form, setForm] = useState({
    name: '',
    shortCode: '',
    category: 'FOOD',
    foodType: 'Veg',
    price: '',
    taxStructure: 'TAX @5%',
    hsnCode: '2106',
    kitchen: 'Main Kitchen',
    active: 'Yes',
    ignoreDiscount: 'No',
    ignoreTax: 'No',
    printerMapping: 'Default Printer',
    description: '',
    areaPrices: {}
  });

  const [customAreas, setCustomAreas] = useState([]);
  const [newAreaInput, setNewAreaInput] = useState('');

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['name'],
    currentId: initialData?.id,
    mode
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        shortCode: initialData.shortCode || '',
        category: initialData.category || 'FOOD',
        foodType: initialData.foodType || 'Veg',
        price: initialData.price || '',
        taxStructure: initialData.taxStructure || 'TAX @5%',
        hsnCode: initialData.hsnCode || '2106',
        kitchen: initialData.kitchen || 'Main Kitchen',
        active: initialData.active || 'Yes',
        ignoreDiscount: initialData.ignoreDiscount || 'No',
        ignoreTax: initialData.ignoreTax || 'No',
        printerMapping: initialData.printerMapping || 'Default Printer',
        description: initialData.description || '',
        areaPrices: initialData.areaPrices || {}
      });

      if (initialData.areaPrices) {
        const extra = Object.keys(initialData.areaPrices).filter(
          (area) => !DEFAULT_SERVICE_AREAS.includes(area)
        );
        setCustomAreas(extra);
      }
    } else {
      setForm((f) => ({
        ...f,
        shortCode: String(Math.floor(100 + Math.random() * 900))
      }));
    }
  }, [initialData]);

  const handleAreaPriceChange = (area, value) => {
    setForm((prev) => ({
      ...prev,
      areaPrices: {
        ...prev.areaPrices,
        [area]: value
      }
    }));
  };

  const handleAddCustomArea = () => {
    if (!newAreaInput.trim()) return;
    const name = newAreaInput.trim();
    if (!DEFAULT_SERVICE_AREAS.includes(name) && !customAreas.includes(name)) {
      setCustomAreas((prev) => [...prev, name]);
    }
    setNewAreaInput('');
  };

  const handleRemoveCustomArea = (areaName) => {
    setCustomAreas((prev) => prev.filter((a) => a !== areaName));
    setForm((prev) => {
      const copy = { ...prev.areaPrices };
      delete copy[areaName];
      return { ...prev, areaPrices: copy };
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key.toLowerCase() === 's') || e.key === 'F10') {
        e.preventDefault();
        handleSubmit();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [form, onCancel]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!form.name.trim()) return;
    if (!checkBeforeSave()) return;
    onSave(form);
  };

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const sectionTitle = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0 4px', borderBottom: '2px solid #0e7490', marginBottom: '8px' }}>
      <span style={{ fontSize: '0.95rem', display: 'flex', alignItems: 'center', color: '#0e7490' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0e7490' }}>{title}</span>
    </div>
  );

  const allAreas = [...DEFAULT_SERVICE_AREAS, ...customAreas];

  return (
    <div className="animate-in duration-200" style={{ padding: '0 8px' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        ::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
        }
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />

      <PageHeader
        title={mode === 'add' ? 'Add Menu Item Configuration' : 'Edit Menu Item'}
        breadcrumbs={['Dashboard', 'System Settings', 'Menu Catalog Master', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
        style={{ marginBottom: '6px', paddingBottom: '2px' }}
      />

      {/* Top Control Bar: Key Item Badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px 8px', marginBottom: '8px', gap: '8px', borderBottom: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Item Code Badge */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '2px',
            background: 'linear-gradient(135deg, #0e7490 0%, #0891b2 100%)',
            borderRadius: '6px', padding: '5px 12px',
            boxShadow: '0 2px 6px rgba(14, 116, 144, 0.2)',
            minWidth: '110px'
          }}>
            <label style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Item Code
            </label>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
              {form.shortCode || 'NEW'}
            </span>
          </div>

          {/* Category Badge */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '2px',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            borderRadius: '6px', padding: '5px 12px',
            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.2)',
            minWidth: '110px'
          }}>
            <label style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Category
            </label>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
              {form.category}
            </span>
          </div>
        </div>

        {/* Right Badge: Status Indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: form.active === 'Yes' ? '#f0fdf4' : '#fef2f2',
          border: form.active === 'Yes' ? '1px solid #bbf7d0' : '1px solid #fecaca',
          color: form.active === 'Yes' ? '#15803d' : '#b91c1c',
          padding: '5px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 800
        }}>
          <span>Status: {form.active === 'Yes' ? 'Active' : 'Inactive'}</span>
        </div>
      </div>

      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit} style={{ padding: '0 4px 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'start', marginBottom: '10px' }}>
          {/* Card 1: Main Item Information */}
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 14px' }}>
            {sectionTitle(<FaUtensils />, 'Menu Item Details')}
            <div className="form-grid-2" style={{ rowGap: '6px', columnGap: '10px' }}>
              <F label="Item Name" required value={form.name} onChange={setField('name')} placeholder="Enter item name" style={{ gridColumn: 'span 2' }} />
              <F label="Short Code / HSN" value={form.shortCode} onChange={setField('shortCode')} placeholder="e.g. 101" />
              <F label="Category">
                <select
                  value={form.category}
                  onChange={setField('category')}
                  style={{ fontSize: '0.88rem', padding: '4px 10px', height: '34px', minHeight: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', outline: 'none' }}
                >
                  <option value="FOOD">FOOD</option>
                  <option value="BEVERAGE">BEVERAGE</option>
                  <option value="BANQUET">BANQUET</option>
                  <option value="OTHERS">OTHERS</option>
                </select>
              </F>
              <F label="Food Type">
                <select
                  value={form.foodType}
                  onChange={setField('foodType')}
                  style={{ fontSize: '0.88rem', padding: '4px 10px', height: '34px', minHeight: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', outline: 'none' }}
                >
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                  <option value="Egg">Egg</option>
                </select>
              </F>
              <F label="Base Price (₹)" required type="number" value={form.price} onChange={setField('price')} placeholder="0.00" inputStyle={{ fontWeight: 700, color: '#0e7490' }} />
              <F label="Tax Structure">
                <select
                  value={form.taxStructure}
                  onChange={setField('taxStructure')}
                  style={{ fontSize: '0.88rem', padding: '4px 10px', height: '34px', minHeight: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', outline: 'none' }}
                >
                  <option value="NO TAX">NO TAX</option>
                  <option value="TAX @5%">TAX @5%</option>
                  <option value="TAX @12%">TAX @12%</option>
                  <option value="TAX @18%">TAX @18%</option>
                </select>
              </F>
              <F label="Kitchen Station" value={form.kitchen} onChange={setField('kitchen')} placeholder="Main Kitchen, Bar, etc." />
              <F label="Active">
                <select
                  value={form.active}
                  onChange={setField('active')}
                  style={{ fontSize: '0.88rem', padding: '4px 10px', height: '34px', minHeight: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', outline: 'none' }}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </F>
              <F label="Ignore Discount">
                <select
                  value={form.ignoreDiscount}
                  onChange={setField('ignoreDiscount')}
                  style={{ fontSize: '0.88rem', padding: '4px 10px', height: '34px', minHeight: '34px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '100%', outline: 'none' }}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </F>
              <F label="Printer Mapping" value={form.printerMapping} onChange={setField('printerMapping')} placeholder="Receipt / KOT Printer" />
            </div>
          </div>

          {/* Card 2: Area Wise Pricing Configuration */}
          <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 14px' }}>
            {sectionTitle(<FaTags />, 'Area Wise Pricing Rates')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ padding: '6px 10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.74rem', color: '#475569', fontWeight: 600 }}>
                Base Price (₹{form.price || '0.00'}) is automatically used if an area price is left blank.
              </div>

              {/* Area Pricing Table */}
              <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', textAlign: 'left', fontSize: '0.78rem', borderCollapse: 'collapse' }}>
                  <thead style={{ background: '#f1f5f9', color: '#334155', fontWeight: 700, borderBottom: '1px solid #cbd5e1', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                    <tr>
                      <th style={{ padding: '6px 10px' }}>Service Area</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right' }}>Price (₹)</th>
                      <th style={{ padding: '6px 10px', textAlign: 'center', width: '50px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAreas.map((area) => {
                      const isCustom = customAreas.includes(area);
                      const currentVal = form.areaPrices[area] !== undefined ? form.areaPrices[area] : '';
                      return (
                        <tr key={area} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '6px 10px', fontWeight: 600, color: '#334155' }}>
                            {area}
                            {isCustom && (
                              <span style={{ marginLeft: '6px', padding: '1px 5px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.65rem', fontWeight: 700, borderRadius: '4px' }}>
                                Custom
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '4px 10px', textAlign: 'right' }}>
                            <input
                              id={`area-price-${area}`}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder={`Base (₹${form.price || '0'})`}
                              value={currentVal}
                              onChange={(e) => handleAreaPriceChange(area, e.target.value)}
                              style={{
                                width: '110px', padding: '3px 8px', height: '30px', fontSize: '0.82rem',
                                fontWeight: 700, textAlign: 'right', borderRadius: '5px',
                                border: '1px solid #cbd5e1', background: '#fff', outline: 'none'
                              }}
                            />
                          </td>
                          <td style={{ padding: '4px 10px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  const el = document.getElementById(`area-price-${area}`);
                                  if (el) { el.focus(); el.select(); }
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#0e7490',
                                  cursor: 'pointer',
                                  padding: '3px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Edit Area Price"
                              >
                                <FaEdit size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (isCustom) {
                                    handleRemoveCustomArea(area);
                                  } else {
                                    handleAreaPriceChange(area, '');
                                  }
                                }}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#ef4444',
                                  cursor: 'pointer',
                                  padding: '3px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title={isCustom ? "Delete Custom Area" : "Clear Area Price"}
                              >
                                <FaTrash size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add Custom Area */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', paddingTop: '4px' }}>
                <input
                  type="text"
                  placeholder="Enter new area (e.g. VIP Lounge)"
                  value={newAreaInput}
                  onChange={(e) => setNewAreaInput(e.target.value)}
                  style={{ flex: 1, padding: '4px 10px', height: '32px', fontSize: '0.82rem', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomArea}
                  style={{ padding: '5px 12px', height: '32px', background: '#f0fdfa', color: '#0e7490', border: '1px solid #ccfbf1', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <FaPlus size={10} /> Add Area
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <CommonActionButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText={mode === 'add' ? 'Save Item' : 'Update Item'}
          saveDisabled={isDuplicate}
        />

        <DuplicateModal />
      </form>
    </div>
  );
};

export default MenuForm;
