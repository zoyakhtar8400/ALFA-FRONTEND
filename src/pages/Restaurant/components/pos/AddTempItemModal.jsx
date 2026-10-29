import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaUtensils } from 'react-icons/fa';

/**
 * AddTempItemModal
 * Creates or edits a temporary item during POS billing with exactly 5 fields:
 * 1. Name – Item name
 * 2. Item Group – Select the appropriate existing item group (Category)
 * 3. Unit – Select or enter the unit using existing unit options
 * 4. Rate – Item selling rate (non-negative number)
 * 5. Tax – Select the applicable tax from existing options
 */
const DEFAULT_UNITS = [
  'Plate',
  'Pieces',
  'Kg',
  'Portion',
  'Glass',
  'Cup',
  'Bowl',
  'Bottle',
  'Half',
  'Full',
  'Can'
];

const DEFAULT_TAXES = [
  { id: 'tax-5', name: 'GST 5%', percentage: 5 },
  { id: 'tax-12', name: 'GST 12%', percentage: 12 },
  { id: 'tax-18', name: 'GST 18%', percentage: 18 },
  { id: 'tax-0', name: 'Tax Free (0%)', percentage: 0 }
];

const AddTempItemModal = ({
  isOpen,
  onClose,
  onSave,
  editItem = null,
  itemGroups = [],
  taxCategories = [],
  existingUnits = DEFAULT_UNITS
}) => {
  const [name, setName] = useState('');
  const [itemGroup, setItemGroup] = useState('');
  const [unit, setUnit] = useState('Plate');
  const [rate, setRate] = useState('');
  const [taxName, setTaxName] = useState('');
  const [taxPercent, setTaxPercent] = useState(5);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available taxes merged with standard fallback options
  const resolvedTaxes = taxCategories && taxCategories.length > 0 ? taxCategories : DEFAULT_TAXES;

  // Available groups
  const resolvedGroups = itemGroups && itemGroups.length > 0
    ? itemGroups
    : [{ id: 1, name: 'FOOD' }, { id: 2, name: 'BEVERAGE' }, { id: 3, name: 'BANQUET' }, { id: 4, name: 'OTHERS' }];

  // Populate form on open or edit
  useEffect(() => {
    if (!isOpen) return;

    setError('');
    setIsSubmitting(false);

    if (editItem) {
      setName(editItem.name || editItem.title || '');
      setItemGroup(editItem.category || (resolvedGroups[0]?.name || 'FOOD'));
      setUnit(editItem.unit || editItem.unitName || 'Plate');
      setRate(editItem.price !== undefined ? String(editItem.price) : '');
      const currentTaxName = editItem.tax_name || (resolvedTaxes[0]?.name || 'GST 5%');
      setTaxName(currentTaxName);
      setTaxPercent(editItem.tax_per !== undefined ? Number(editItem.tax_per) : 5);
    } else {
      setName('');
      setItemGroup(resolvedGroups[0]?.name || 'FOOD');
      setUnit(DEFAULT_UNITS[0]);
      setRate('');
      const defaultTax = resolvedTaxes[0] || { name: 'GST 5%', percentage: 5 };
      setTaxName(defaultTax.name);
      setTaxPercent(Number(defaultTax.percentage || 5));
    }
  }, [isOpen, editItem]);

  if (!isOpen) return null;

  const handleTaxChange = (e) => {
    const selectedName = e.target.value;
    setTaxName(selectedName);
    const matched = resolvedTaxes.find(t => t.name === selectedName);
    if (matched) {
      setTaxPercent(Number(matched.percentage || 0));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Item Name is required');
      return;
    }

    if (!itemGroup) {
      setError('Item Group is required');
      return;
    }

    if (!unit.trim()) {
      setError('Unit is required');
      return;
    }

    const numRate = Number(rate);
    if (rate === '' || isNaN(numRate) || numRate < 0) {
      setError('Rate must be a valid non-negative number (0 or greater)');
      return;
    }

    if (!taxName) {
      setError('Tax must be selected');
      return;
    }

    const matchedGroup = resolvedGroups.find(g => (g.name || g.category_name || '').toUpperCase() === itemGroup.toUpperCase());
    const itemGroupId = matchedGroup ? (matchedGroup.id || matchedGroup.category_refid || 1) : 1;

    const payload = {
      id: editItem ? (editItem.id || editItem.item_id) : undefined,
      name: trimmedName,
      title: trimmedName,
      itemGroup,
      category: itemGroup,
      itemGroupId,
      category_ref_ids: itemGroupId,
      unit: unit.trim(),
      unitName: unit.trim(),
      alternative_title: unit.trim(),
      price: numRate,
      sale_price: numRate,
      rate: numRate,
      taxName,
      tax_name: taxName,
      taxPercent,
      tax_per: taxPercent,
      is_open_item: 1, // Marks as temporary item during billing
      isVeg: !trimmedName.toLowerCase().includes('chicken') && !trimmedName.toLowerCase().includes('mutton') && !trimmedName.toLowerCase().includes('fish') && !trimmedName.toLowerCase().includes('egg')
    };

    try {
      setIsSubmitting(true);
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error('Failed to save temporary item:', err);
      setError(err?.message || 'Failed to save item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: '460px',
        borderRadius: '12px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        animation: 'modalSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 18px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: '#f0fdfa',
              color: '#0d9488',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}>
              <FaUtensils />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 900, color: '#0f172a' }}>
                {editItem ? 'Edit Temporary Item' : '+ Add Item (Temporary)'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                Create a temporary item for immediate billing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{
            margin: '14px 18px 0',
            padding: '8px 12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#b91c1c',
            fontSize: '0.8rem',
            fontWeight: 700
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Form Body - Exactly 5 fields */}
        <form onSubmit={handleSubmit} style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* 1. Item Name */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
              1. Item Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Special Dessert / Chef Special"
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#1e293b',
                outline: 'none',
                background: '#ffffff',
                boxSizing: 'border-box'
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#0d9488'}
              onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
            />
          </div>

          {/* 2. Item Group */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
              2. Item Group (Category) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={itemGroup}
              onChange={e => setItemGroup(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#1e293b',
                outline: 'none',
                background: '#ffffff',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#0d9488'}
              onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
            >
              {resolvedGroups.map((g, idx) => {
                const gName = g.name || g.category_name || `Group ${idx + 1}`;
                return (
                  <option key={g.id || idx} value={gName}>
                    {gName}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Two Columns: 3. Unit and 4. Rate */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {/* 3. Unit */}
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                3. Unit <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                list="pos-unit-options"
                type="text"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="e.g. Plate, Pieces, Kg"
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  outline: 'none',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#0d9488'}
                onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
              />
              <datalist id="pos-unit-options">
                {existingUnits.map(u => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </div>

            {/* 4. Rate */}
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
                4. Rate (₹) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={rate}
                onChange={e => setRate(e.target.value)}
                placeholder="0.00"
                required
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  outline: 'none',
                  background: '#ffffff',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.currentTarget.style.borderColor = '#0d9488'}
                onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
              />
            </div>
          </div>

          {/* 5. Tax */}
          <div>
            <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: '#334155', marginBottom: '4px', textTransform: 'uppercase' }}>
              5. Applicable Tax <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={taxName}
              onChange={handleTaxChange}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: '1.5px solid #cbd5e1',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: '#1e293b',
                outline: 'none',
                background: '#ffffff',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#0d9488'}
              onBlur={e => e.currentTarget.style.borderColor = '#cbd5e1'}
            >
              {resolvedTaxes.map((t, idx) => (
                <option key={t.id || idx} value={t.name}>
                  {t.name} ({t.percentage !== undefined ? `${t.percentage}%` : '5%'})
                </option>
              ))}
            </select>
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '8px',
            paddingTop: '12px',
            borderTop: '1px solid #f1f5f9'
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                border: 'none',
                background: isSubmitting ? '#94a3b8' : '#0d9488',
                color: '#ffffff',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(13, 148, 136, 0.2)'
              }}
            >
              <FaSave size={12} />
              {isSubmitting ? 'Saving...' : (editItem ? 'Update Item' : 'Save & Add Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(AddTempItemModal);
