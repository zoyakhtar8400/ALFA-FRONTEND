import React, { useState, useEffect, useMemo } from 'react';
import CommonModal from '../../../../../components/common/CommonModal';
import {
  FaUtensils,
  FaTags,
  FaBarcode,
  FaStore,
  FaPlus,
  FaTrash,
  FaCheck,
  FaTimes,
  FaSyncAlt,
  FaSlidersH,
  FaLayerGroup,
  FaCommentAlt,
  FaWineGlassAlt,
  FaConciergeBell,
  FaBoxOpen,
  FaArrowRight,
  FaArrowLeft
} from 'react-icons/fa';

const ITEM_TYPES = [
  { value: 'PRODUCT', label: 'PRODUCT (Prepared Dish / Food Item)' },
  { value: 'BEVERAGE', label: 'BEVERAGE (Drink / Soft Drink)' },
  { value: 'SERVICE', label: 'SERVICE (Service / Cover Charge)' },
  { value: 'PACKAGED', label: 'PACKAGED (Retail Goods / MRP)' }
];

const BASE_UOMS = [
  'pcs (pcs)',
  'Plate',
  'Portion',
  'Bowl',
  'Cup',
  'Glass',
  'Bottle',
  'Kg',
  'Gram',
  'Ltr',
  'Ml'
];

const FOOD_TYPES = [
  { value: 'Veg', label: 'VEG', dot: '#22c55e', color: '#15803d' },
  { value: 'Non-Veg', label: 'NON-VEG', dot: '#ef4444', color: '#b91c1c' },
  { value: 'Egg', label: 'EGG', dot: '#f59e0b', color: '#b45309' }
];

const WIZARD_STEPS = [
  { id: 1, label: '1. Basic Info' },
  { id: 2, label: '2. Tax' },
  { id: 3, label: '3. Outlets' },
  { id: 4, label: '4. Pricing' }
];

const TAX_PROFILES_PRESET = [
  { name: 'Exempt / No Tax', desc: 'Item is non-taxable', rate: 0, code: 'EXEMPT' },
  { name: 'GST 0% Exempt', desc: 'GST_0', rate: 0, code: 'GST_0' },
  { name: 'GST 5% (CGST 2.5% + SGST 2.5%)', desc: 'GST_5', rate: 5, code: 'GST_5' },
  { name: 'GST 12% (CGST 6% + SGST 6%)', desc: 'GST_12', rate: 12, code: 'GST_12' },
  { name: 'GST 18% (CGST 9% + SGST 9%)', desc: 'GST_18', rate: 18, code: 'GST_18' }
];

const MenuItemForm = ({
  isOpen,
  onClose,
  onSave,
  initialData = {},
  isEdit = false,
  itemGroups = [],
  mainGroups = [],
  outlets = [],
  taxCategories = []
}) => {
  const groupOptions = useMemo(() => itemGroups.map(g => g.name || g), [itemGroups]);

  // Form Mode: 'wizard' (Step-by-Step) by default, or 'all-in-one'
  const [viewMode, setViewMode] = useState('wizard');
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [form, setForm] = useState({
    name: '',
    dispCode: '',
    shortName: '',
    itemType: 'PRODUCT',
    category: 'Veg',
    itemGroup: '',
    unitType: 'pcs (pcs)',
    taxCategory: 'GST 5% (CGST 2.5% + SGST 2.5%)',
    hsnCode: '',
    barcode: '',
    price: '',
    description: '',
    rateEdit: 'No',
    discApp: 'Yes',
    status: 'Active',
    portions: [],
    outletPricing: {}
  });

  // Initial State Setup
  useEffect(() => {
    if (!isOpen) return;

    setCurrentStep(1);
    const defaultGroup = groupOptions[0] || '';
    const defaultTax = 'GST 5% (CGST 2.5% + SGST 2.5%)';

    // Build outlet pricing map for all outlets
    const initialOutletPricing = {};
    outlets.forEach((o, idx) => {
      const storeKey = o.store_id || o.id || `STORE_${idx + 1}`;
      initialOutletPricing[storeKey] = {
        enabled: true,
        price: initialData?.price !== undefined ? initialData.price : '',
        name: o.name || `Outlet ${idx + 1}`,
        store_id: storeKey,
        code: o.code || storeKey
      };
    });

    if (initialData?.id) {
      outlets.forEach(o => {
        const storeKey = o.store_id || o.id;
        try {
          const raw = localStorage.getItem(`alfa_outlet_item_pricing_${o.id || storeKey}`);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed[initialData.id]) {
              initialOutletPricing[storeKey] = {
                ...initialOutletPricing[storeKey],
                price: parsed[initialData.id].overridePrice !== undefined ? parsed[initialData.id].overridePrice : initialData.price,
                enabled: parsed[initialData.id].isAvailable !== undefined ? parsed[initialData.id].isAvailable : true
              };
            }
          }
        } catch (e) { }
      });
    }

    if (isEdit && initialData) {
      const existingPortions = Array.isArray(initialData.portions) ? initialData.portions : [];
      setForm({
        name: initialData.name || '',
        dispCode: initialData.dispCode || initialData.code || String(initialData.id || ''),
        shortName: initialData.shortName || initialData.short_name || '',
        itemType: initialData.itemType || 'PRODUCT',
        category: initialData.category || initialData.foodType || 'Veg',
        itemGroup: initialData.itemGroup || defaultGroup,
        unitType: initialData.unitType || initialData.baseUom || 'pcs (pcs)',
        taxCategory: initialData.taxCategory || defaultTax,
        hsnCode: initialData.hsnCode || initialData.hsn || '',
        barcode: initialData.barcode || initialData.ean || '',
        price: initialData.price !== undefined && initialData.price !== null ? String(initialData.price) : '',
        description: initialData.description || initialData.remark || '',
        rateEdit: initialData.rateEdit || 'No',
        discApp: initialData.discApp || 'Yes',
        status: initialData.status || 'Active',
        portions: existingPortions.map(p => ({
          id: p.id || `p_${Date.now()}_${Math.random()}`,
          name: p.name || '',
          code: p.code || '',
          serving: p.serving || p.description || '',
          price: p.price !== undefined ? p.price : '',
          active: p.active !== false
        })),
        outletPricing: initialData.outletPricing || initialOutletPricing
      });
    } else {
      const randomCode = `ITEM-${Math.floor(100 + Math.random() * 900)}`;
      setForm({
        name: '',
        dispCode: randomCode,
        shortName: '',
        itemType: 'PRODUCT',
        category: 'Veg',
        itemGroup: defaultGroup,
        unitType: 'pcs (pcs)',
        taxCategory: defaultTax,
        hsnCode: '996331',
        barcode: '',
        price: '',
        description: '',
        rateEdit: 'No',
        discApp: 'Yes',
        status: 'Active',
        portions: [],
        outletPricing: initialOutletPricing
      });
    }

    setErrorMsg('');
  }, [isOpen, isEdit, initialData, outlets, groupOptions]);

  // Field Updater
  const updateField = (key, value) => {
    setForm(prev => {
      const updated = { ...prev, [key]: value };

      if (key === 'price') {
        const syncOutlets = { ...prev.outletPricing };
        Object.keys(syncOutlets).forEach(k => {
          if (!syncOutlets[k].price || syncOutlets[k].price === '') {
            syncOutlets[k].price = value;
          }
        });
        updated.outletPricing = syncOutlets;
      }
      return updated;
    });
  };

  // Sync outlet prices
  const handleSyncOutletPrices = () => {
    const stdPrice = Number(form.price) || (form.portions[0] ? Number(form.portions[0].price) : 0);
    setForm(prev => {
      const updated = { ...prev.outletPricing };
      Object.keys(updated).forEach(k => {
        updated[k] = { ...updated[k], price: stdPrice };
      });
      return { ...prev, outletPricing: updated };
    });
  };

  // Portions Handlers
  const handleAddHalfFull = () => {
    const base = Number(form.price) || 0;
    const halfRate = base ? Math.round(base * 0.6) : '';
    const fullRate = base ? base : '';
    setForm(prev => ({
      ...prev,
      portions: [
        { id: `p_half_${Date.now()}`, name: 'Half', code: 'HALF', serving: '4 PC', price: halfRate, active: true },
        { id: `p_full_${Date.now() + 1}`, name: 'Full', code: 'FULL', serving: '8 PC', price: fullRate, active: true }
      ]
    }));
  };

  const handleAddSmallMedLarge = () => {
    setForm(prev => ({
      ...prev,
      portions: [
        { id: `p_sml_${Date.now()}`, name: 'Small', code: 'SML', serving: 'Regular', price: '', active: true },
        { id: `p_med_${Date.now() + 1}`, name: 'Medium', code: 'MED', serving: 'Medium', price: '', active: true },
        { id: `p_lrg_${Date.now() + 2}`, name: 'Large', code: 'LRG', serving: 'Large', price: '', active: true }
      ]
    }));
  };

  const handleAddPortionRow = () => {
    const pNum = (form.portions || []).length + 1;
    setForm(prev => ({
      ...prev,
      portions: [
        ...(prev.portions || []),
        { id: `p_${Date.now()}`, name: '', code: `P${pNum}`, serving: '', price: '', active: true }
      ]
    }));
  };

  const updatePortion = (idx, field, value) => {
    setForm(prev => {
      const list = [...(prev.portions || [])];
      list[idx] = { ...list[idx], [field]: value };
      return { ...prev, portions: list };
    });
  };

  const removePortion = (idx) => {
    setForm(prev => ({
      ...prev,
      portions: (prev.portions || []).filter((_, i) => i !== idx)
    }));
  };

  // Outlet Row Updater
  const updateOutletPricing = (storeKey, field, val) => {
    setForm(prev => ({
      ...prev,
      outletPricing: {
        ...prev.outletPricing,
        [storeKey]: {
          ...prev.outletPricing[storeKey],
          [field]: val
        }
      }
    }));
  };

  // Step Validation & Navigation
  const validateStep = (stepNumber) => {
    if (stepNumber === 1) {
      if (!form.name || form.name.trim().length < 2) {
        setErrorMsg('Item Name is required (minimum 2 characters).');
        return false;
      }
    }
    setErrorMsg('');
    return true;
  };

  const handleNextStep = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 4) {
      setCurrentStep(s => s + 1);
    }
  };

  const handlePrevStep = () => {
    setErrorMsg('');
    if (currentStep > 1) {
      setCurrentStep(s => s - 1);
    }
  };

  // Submit Handler
  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (!form.name || form.name.trim().length < 2) {
      setErrorMsg('Item Name is required and must be at least 2 characters.');
      if (viewMode === 'wizard') setCurrentStep(1);
      return;
    }

    const basePriceNum = Number(form.price) || 0;
    const finalPortions = (form.portions || []).map(p => ({
      id: p.id,
      name: p.name || 'Portion',
      code: p.code || 'PRT',
      serving: p.serving || p.description || '',
      price: Number(p.price) || 0,
      active: p.active !== false
    }));

    let effectivePrice = basePriceNum;
    if (!effectivePrice && finalPortions.length > 0) {
      effectivePrice = finalPortions[0].price;
    }

    if (effectivePrice <= 0 && finalPortions.length === 0) {
      setErrorMsg('Please enter a valid Standard Price or configure Portions.');
      if (viewMode === 'wizard') setCurrentStep(4);
      return;
    }

    // Persist outlet pricing overrides into localStorage
    if (form.outletPricing && outlets.length > 0) {
      outlets.forEach(o => {
        const storeKey = o.store_id || o.id;
        const entry = form.outletPricing[storeKey];
        if (entry) {
          try {
            const currentMapStr = localStorage.getItem(`alfa_outlet_item_pricing_${o.id || storeKey}`) || '{}';
            const parsedMap = JSON.parse(currentMapStr);
            const itemId = initialData?.id || form.dispCode || Date.now();
            parsedMap[itemId] = {
              overridePrice: Number(entry.price || effectivePrice),
              isAvailable: !!entry.enabled,
              zomatoActive: true,
              swiggyActive: true
            };
            localStorage.setItem(`alfa_outlet_item_pricing_${o.id || storeKey}`, JSON.stringify(parsedMap));
          } catch (err) { }
        }
      });
    }

    const finalPayload = {
      ...form,
      price: effectivePrice,
      sale_price: effectivePrice,
      portions: finalPortions
    };

    setErrorMsg('');
    onSave(finalPayload);
  };

  if (!isOpen) return null;

  // --- SUB-SECTIONS ---

  // Basic Information Fields
  const renderBasicInformation = () => (
    <div>
      <div style={{
        fontSize: '11px',
        fontWeight: 800,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '12px'
      }}>
        Basic Information
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '14px' }}>
        {/* Item Name */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Item Name <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="e.g. Paneer Butter Masala"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            required
            style={{
              width: '100%',
              fontSize: '13px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              outline: 'none',
              fontWeight: 500
            }}
          />
        </div>

        {/* Item Code */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Item Code <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <input
            type="text"
            placeholder="E.G. ITEM-PBM-01"
            value={form.dispCode}
            onChange={(e) => updateField('dispCode', e.target.value)}
            required
            style={{
              width: '100%',
              fontSize: '13px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              outline: 'none',
              fontWeight: 500
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        {/* Short Name */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Short Name (KOT / Receipt)
          </label>
          <input
            type="text"
            placeholder="e.g. Paneer Btr Mas"
            value={form.shortName}
            onChange={(e) => updateField('shortName', e.target.value)}
            style={{
              width: '100%',
              fontSize: '13px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              outline: 'none'
            }}
          />
        </div>

        {/* Item Type */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Item Type
          </label>
          <select
            value={form.itemType}
            onChange={(e) => updateField('itemType', e.target.value)}
            style={{
              width: '100%',
              fontSize: '12.5px',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              outline: 'none',
              fontWeight: 500
            }}
          >
            {ITEM_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  // Classification & Measurement Fields
  const renderClassification = () => (
    <div style={{ marginTop: '16px' }}>
      <div style={{
        fontSize: '11px',
        fontWeight: 800,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '12px'
      }}>
        Classification & Measurement
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '14px' }}>
        {/* Food Type */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Food Type <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            value={form.category}
            onChange={(e) => updateField('category', e.target.value)}
            style={{
              width: '100%',
              fontSize: '12.5px',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              outline: 'none',
              fontWeight: 600
            }}
          >
            {FOOD_TYPES.map(f => (
              <option key={f.value} value={f.value}>
                {f.label === 'VEG' ? '🟢 VEG' : f.label === 'NON-VEG' ? '🔴 NON-VEG' : '🟡 EGG'}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Category
          </label>
          <select
            value={form.itemGroup}
            onChange={(e) => updateField('itemGroup', e.target.value)}
            style={{
              width: '100%',
              fontSize: '12.5px',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              outline: 'none',
              fontWeight: 500
            }}
          >
            <option value="">-- Select Category --</option>
            {groupOptions.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Base Unit (UOM) */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Base Unit (UOM) <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <select
            value={form.unitType}
            onChange={(e) => updateField('unitType', e.target.value)}
            style={{
              width: '100%',
              fontSize: '12.5px',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              outline: 'none',
              fontWeight: 500
            }}
          >
            {BASE_UOMS.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '14px' }}>
        {/* Barcode / EAN */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Barcode / EAN (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. 8901234567890"
            value={form.barcode}
            onChange={(e) => updateField('barcode', e.target.value)}
            style={{
              width: '100%',
              fontSize: '13px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              outline: 'none'
            }}
          />
        </div>

        {/* HSN / SAC Code */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            HSN / SAC Code (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. 996331"
            value={form.hsnCode}
            onChange={(e) => updateField('hsnCode', e.target.value)}
            style={{
              width: '100%',
              fontSize: '13px',
              padding: '8px 12px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        {/* Standard Price */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
              Standard Price (₹)
            </label>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Base selling price</span>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '11px', top: '8px', color: '#64748b', fontWeight: 600 }}>₹</span>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => updateField('price', e.target.value)}
              style={{
                width: '100%',
                fontSize: '13px',
                fontWeight: 600,
                padding: '8px 12px 8px 26px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                outline: 'none'
              }}
            />
          </div>
        </div>

        {/* Tax Profile */}
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
            Tax Profile (GST)
          </label>
          <select
            value={form.taxCategory}
            onChange={(e) => updateField('taxCategory', e.target.value)}
            style={{
              width: '100%',
              fontSize: '12.5px',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              outline: 'none',
              fontWeight: 500
            }}
          >
            <option value="">-- Select GST Profile (Optional) --</option>
            {TAX_PROFILES_PRESET.map(t => (
              <option key={t.code} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );

  // Portions & Variants Section (Screenshot 1 format)
  const renderPortionsSection = () => (
    <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            3. Item Portions & Variants (Optional)
          </div>
          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
            Define sellable portions like Half / Full or Small / Medium / Large with specific prices.
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            type="button"
            onClick={handleAddHalfFull}
            style={{
              padding: '5px 10px',
              background: '#ffffff',
              border: '1px solid #0d9488',
              borderRadius: '6px',
              color: '#0d9488',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            + Half / Full
          </button>
          <button
            type="button"
            onClick={handleAddSmallMedLarge}
            style={{
              padding: '5px 10px',
              background: '#ffffff',
              border: '1px solid #0d9488',
              borderRadius: '6px',
              color: '#0d9488',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            + Small / Med / Large
          </button>
          <button
            type="button"
            onClick={handleAddPortionRow}
            style={{
              padding: '5px 12px',
              background: '#0d9488',
              border: 'none',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FaPlus size={10} /> Add Portion
          </button>
        </div>
      </div>

      {/* Portions Table */}
      {form.portions && form.portions.length > 0 ? (
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <tr>
                <th style={{ padding: '8px 12px' }}>PORTION / VARIANT</th>
                <th style={{ padding: '8px 12px', width: '130px' }}>SERVING / QTY</th>
                <th style={{ padding: '8px 12px', width: '110px' }}>CODE</th>
                <th style={{ padding: '8px 12px', width: '140px' }}>PRICE (₹)</th>
                <th style={{ padding: '8px 12px', width: '90px', textAlign: 'center' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {form.portions.map((p, idx) => (
                <tr key={p.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '6px 12px' }}>
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => updatePortion(idx, 'name', e.target.value)}
                      placeholder="e.g. Half"
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        fontSize: '12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '5px',
                        fontWeight: 500
                      }}
                    />
                  </td>
                  <td style={{ padding: '6px 12px' }}>
                    <input
                      type="text"
                      value={p.serving || ''}
                      onChange={(e) => updatePortion(idx, 'serving', e.target.value)}
                      placeholder="e.g. 4 PC"
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        fontSize: '12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '5px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '6px 12px' }}>
                    <input
                      type="text"
                      value={p.code}
                      onChange={(e) => updatePortion(idx, 'code', e.target.value)}
                      placeholder="HALF"
                      style={{
                        width: '100%',
                        padding: '6px 10px',
                        fontSize: '12px',
                        border: '1px solid #cbd5e1',
                        borderRadius: '5px'
                      }}
                    />
                  </td>
                  <td style={{ padding: '6px 12px' }}>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '8px', top: '6px', color: '#64748b', fontWeight: 600 }}>₹</span>
                      <input
                        type="number"
                        step="0.01"
                        value={p.price}
                        onChange={(e) => updatePortion(idx, 'price', e.target.value)}
                        placeholder="140.00"
                        style={{
                          width: '100%',
                          padding: '6px 10px 6px 22px',
                          fontSize: '12px',
                          fontWeight: 700,
                          border: '1px solid #cbd5e1',
                          borderRadius: '5px'
                        }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: '6px 12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => updatePortion(idx, 'active', !p.active)}
                        style={{
                          padding: '3px 7px',
                          borderRadius: '4px',
                          border: 'none',
                          fontSize: '10px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: p.active !== false ? '#dcfce7' : '#f1f5f9',
                          color: p.active !== false ? '#15803d' : '#64748b'
                        }}
                      >
                        ACT
                      </button>
                      <button
                        type="button"
                        onClick={() => removePortion(idx)}
                        style={{
                          border: 'none',
                          background: '#fee2e2',
                          color: '#ef4444',
                          borderRadius: '4px',
                          padding: '4px 6px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{
          padding: '12px',
          background: '#f8fafc',
          border: '1px dashed #cbd5e1',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '11.5px',
          color: '#64748b'
        }}>
          No portions configured. Click <b>+ Half / Full</b>, <b>+ Small / Med / Large</b>, or <b>+ Add Portion</b> to define sellable portion sizes.
        </div>
      )}
    </div>
  );

  // Multi-Outlet Pricing Section (Screenshot 4 format)
  const renderMultiOutletSection = () => (
    <div style={{ marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Set Outlet-wise Selling Price
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            Configure base or custom selling price per branch.
          </div>
        </div>

        <button
          type="button"
          onClick={handleSyncOutletPrices}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            color: '#334155',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <FaSyncAlt size={10} style={{ color: '#0d9488' }} /> Sync Standard Price
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {outlets.map((o, idx) => {
          const storeKey = o.store_id || o.id || `STORE_${idx + 1}`;
          const currentRate = form.price || '';
          const outletConfig = form.outletPricing[storeKey] || {
            enabled: true,
            price: currentRate,
            name: o.name || `Outlet ${idx + 1}`
          };

          return (
            <div
              key={storeKey}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: outletConfig.enabled ? '#ffffff' : '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  checked={!!outletConfig.enabled}
                  onChange={(e) => updateOutletPricing(storeKey, 'enabled', e.target.checked)}
                  style={{ width: '15px', height: '15px', accentColor: '#0d9488', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                    {o.name || `Outlet ${idx + 1}`}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
                    {storeKey}
                  </div>
                </div>
              </div>

              <div style={{ width: '120px', position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '7px', fontSize: '13px', fontWeight: 600, color: '#64748b' }}>
                  ₹
                </span>
                <input
                  type="number"
                  step="0.01"
                  disabled={!outletConfig.enabled}
                  value={outletConfig.price !== undefined ? outletConfig.price : currentRate}
                  onChange={(e) => updateOutletPricing(storeKey, 'price', e.target.value)}
                  placeholder={String(currentRate || '0.00')}
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 24px',
                    fontSize: '13px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: outletConfig.enabled ? '#ffffff' : '#f1f5f9',
                    color: '#0f172a',
                    outline: 'none',
                    textAlign: 'right'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Description / Remarks Section
  const renderRemarksSection = () => (
    <div style={{ marginTop: '16px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
        Description & Preparation Remarks (Optional)
      </label>
      <textarea
        rows="2"
        placeholder="Enter item description, allergen details, or preparation notes for KOT..."
        value={form.description || ''}
        onChange={(e) => updateField('description', e.target.value)}
        style={{
          width: '100%',
          fontSize: '12.5px',
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid #cbd5e1',
          outline: 'none',
          fontFamily: 'inherit',
          color: '#334155',
          resize: 'vertical'
        }}
      />
    </div>
  );

  // Wizard Step 2: Tax Cards (Screenshot 3 format)
  const renderWizardStep2Tax = () => (
    <div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '14px' }}>
        Select Applicable Tax Profile
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {TAX_PROFILES_PRESET.map(t => {
          const isSelected = form.taxCategory === t.name;
          return (
            <div
              key={t.code}
              onClick={() => updateField('taxCategory', t.name)}
              style={{
                padding: '14px 16px',
                borderRadius: '8px',
                border: isSelected ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                background: isSelected ? '#f0fdfa' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 700, color: isSelected ? '#0d9488' : '#1e293b' }}>
                {t.name}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                {t.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Wizard Step 3: Outlets Selection
  const renderWizardStep3Outlets = () => (
    <div>
      <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
        Select Outlets
      </div>
      <div style={{ fontSize: '11.5px', color: '#64748b', marginBottom: '14px' }}>
        Choose the outlet branches where this item will be available for sale.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {outlets.map((o, idx) => {
          const storeKey = o.store_id || o.id || `STORE_${idx + 1}`;
          const outletConfig = form.outletPricing[storeKey] || { enabled: true };

          return (
            <div
              key={storeKey}
              onClick={() => updateOutletPricing(storeKey, 'enabled', !outletConfig.enabled)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: outletConfig.enabled ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                background: outletConfig.enabled ? '#f0fdfa' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input
                  type="checkbox"
                  checked={!!outletConfig.enabled}
                  onChange={(e) => {
                    e.stopPropagation();
                    updateOutletPricing(storeKey, 'enabled', e.target.checked);
                  }}
                  style={{ width: '16px', height: '16px', accentColor: '#0d9488', cursor: 'pointer' }}
                />
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                    {o.name || `Outlet ${idx + 1}`}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>
                    {storeKey}
                  </div>
                </div>
              </div>

              <div style={{
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 700,
                background: outletConfig.enabled ? '#dcfce7' : '#f1f5f9',
                color: outletConfig.enabled ? '#15803d' : '#64748b'
              }}>
                {outletConfig.enabled ? 'ENABLED' : 'DISABLED'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="800px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>

        {/* MODAL HEADER: EXACT MATCH TO SCREENSHOTS */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: '16px',
          borderBottom: '1px solid #f1f5f9',
          paddingBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {viewMode === 'wizard' ? (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: '2px solid #0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0d9488'
              }}>
                <FaPlus size={14} />
              </div>
            ) : (
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#ccfbf1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0d9488'
              }}>
                <FaUtensils size={16} />
              </div>
            )}

            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#1e293b' }}>
                {viewMode === 'wizard'
                  ? 'Add Item (Multi-Outlet Pricing Wizard)'
                  : 'Create Catalog Item'}
              </h3>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                {viewMode === 'wizard'
                  ? `Step ${currentStep} of 4`
                  : 'Register new food item, drink, or service item.'}
              </div>
            </div>
          </div>

          {/* TWO OPTIONS SWITCH AT TOP */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0'
          }}>
            <button
              type="button"
              onClick={() => setViewMode('wizard')}
              style={{
                padding: '4px 12px',
                borderRadius: '5px',
                border: 'none',
                background: viewMode === 'wizard' ? '#0d9488' : 'transparent',
                color: viewMode === 'wizard' ? '#ffffff' : '#64748b',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Step Wizard
            </button>
            <button
              type="button"
              onClick={() => setViewMode('all-in-one')}
              style={{
                padding: '4px 12px',
                borderRadius: '5px',
                border: 'none',
                background: viewMode === 'all-in-one' ? '#0d9488' : 'transparent',
                color: viewMode === 'all-in-one' ? '#ffffff' : '#64748b',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              All-in-One Form
            </button>
          </div>
        </div>

        {/* STEP BUTTONS BAR (WHEN IN WIZARD MODE) */}
        {viewMode === 'wizard' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
            marginBottom: '20px'
          }}>
            {WIZARD_STEPS.map((s) => {
              const isActive = currentStep === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (s.id > currentStep && !validateStep(currentStep)) return;
                    setErrorMsg('');
                    setCurrentStep(s.id);
                  }}
                  style={{
                    padding: '8px',
                    borderRadius: '6px',
                    border: isActive ? '1px solid #0d9488' : '1px solid #e2e8f0',
                    background: isActive ? '#f0fdfa' : '#ffffff',
                    color: isActive ? '#0d9488' : '#64748b',
                    fontSize: '12px',
                    fontWeight: isActive ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {errorMsg && (
          <div style={{
            padding: '8px 12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#dc2626',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '14px'
          }}>
            {errorMsg}
          </div>
        )}

        {/* MAIN BODY CONTENT */}
        {viewMode === 'wizard' ? (
          <div style={{ minHeight: '340px' }}>
            {currentStep === 1 && (
              <div>
                {renderBasicInformation()}
                {renderClassification()}
                {renderPortionsSection()}
              </div>
            )}
            {currentStep === 2 && renderWizardStep2Tax()}
            {currentStep === 3 && renderWizardStep3Outlets()}
            {currentStep === 4 && (
              <div>
                {renderPortionsSection()}
                {renderMultiOutletSection()}
                {renderRemarksSection()}
              </div>
            )}
          </div>
        ) : (
          /* ALL-IN-ONE FORM VIEW (Screenshot 1) */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {renderBasicInformation()}
            {renderClassification()}
            {renderPortionsSection()}
            {renderMultiOutletSection()}
            {renderRemarksSection()}
          </div>
        )}

        {/* FOOTER ACTIONS */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: '22px',
          paddingTop: '14px',
          borderTop: '1px solid #e2e8f0'
        }}>
          <div>
            {viewMode === 'wizard' && currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                style={{
                  padding: '7px 18px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Previous
              </button>
            )}
            {viewMode === 'all-in-one' && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '7px 18px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#64748b',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {viewMode === 'wizard' && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '7px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#64748b',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            )}

            {viewMode === 'wizard' && currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                style={{
                  padding: '7px 22px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#0d9488',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                style={{
                  padding: '7px 22px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#0d9488',
                  color: '#ffffff',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {isEdit ? 'Update Item' : 'Create & Save Item'}
              </button>
            )}
          </div>
        </div>

      </form>
    </CommonModal>
  );
};

export default MenuItemForm;
