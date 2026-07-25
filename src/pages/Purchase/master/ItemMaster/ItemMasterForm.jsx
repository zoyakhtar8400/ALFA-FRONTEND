import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import F from '../../../../components/common/F';
import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';
import { FaBoxes, FaSlidersH, FaExchangeAlt, FaFileAlt } from 'react-icons/fa';

const DEPARTMENTS = [
  'PURCHASE',
  'PURCHASE STORE',
  'MAIN KITCHEN',
  'DISPENSE BAR',
  'GARDENIA ROOFTOP',
  'HOUSEKEEPING',
  'FRONT OFFICE',
  'MAINTENANCE'
];

const CATEGORIES = [
  'PURCHASE 0%',
  'PURCHASE 5%',
  'PURCHASE 12%',
  'PURCHASE 18%',
  'PURCHASE 28%',
  'Food',
  'Beverage',
  'HouseKeeping',
  'Engineering',
  'Linen',
  'Stationery',
  'Other'
];

const EMPTY_FORM = {
  name: '',
  itemCategory: 'PURCHASE 0%',
  itemGroupName: '',
  storeDepartment: 'PURCHASE',
  unitName: '',
  active: 'Yes',
  maxLevel: '',
  minLevel: '',
  reOrderLevel: '',
  lotBatchNo: 'Yes',
  poMandatory: 'Yes',
  conversionUnit: '',
  convRatio: '1',
  moq: '',
  description: '',
  hsnSacCode: ''
};

const ItemMasterForm = ({
  mode = 'add',
  initialData,
  onSave,
  onCancel,
  itemGroups = [],
  units = [],
  existingRecords = []
}) => {
  const [form, setForm] = useState(EMPTY_FORM);

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['name'],
    currentId: initialData?.id,
    mode
  });

  useEffect(() => {
    if (initialData) {
      setForm({ ...EMPTY_FORM, ...initialData });
    } else {
      setForm({
        ...EMPTY_FORM,
        itemGroupName: itemGroups[0]?.name || 'RAW MATERIAL',
        unitName: units[0]?.name || 'K.G.',
        conversionUnit: units[0]?.name || 'K.G.'
      });
    }
  }, [initialData, itemGroups, units]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!form.name.trim()) return;
    if (!checkBeforeSave()) return;
    onSave(form);
  };

  const sectionTitle = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0 6px', borderBottom: '2px solid var(--primary, #418a8b)', marginBottom: '12px' }}>
      <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', color: 'var(--primary, #418a8b)' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary, #418a8b)' }}>{title}</span>
    </div>
  );

  const selectStyle = { fontSize: '0.88rem', height: '34px', padding: '4px 8px' };

  return (
    <div className="animate-in duration-200" style={{ padding: '0 8px' }}>
      {/* Scrollbar reset styling */}
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
        title={mode === 'add' ? 'Add Item Master' : 'Edit Item Master'}
        breadcrumbs={['Dashboard', 'Purchase', 'Master', 'Item Master', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
        style={{ marginBottom: '8px', paddingBottom: '2px' }}
      />

      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit} style={{ padding: '0 4px 12px' }}>
        
        {/* Main Grid: 2 Equal Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'start', marginBottom: '12px' }}>
          
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Card 1: Basic Item Information */}
            <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px', padding: '12px 16px' }}>
              {sectionTitle(<FaBoxes />, 'Basic Item Information')}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                
                {/* Item Name (Full width in card) */}
                <div style={{ gridColumn: 'span 2' }}>
                  <F
                    label="Item Name"
                    required
                    value={form.name}
                    onChange={set('name')}
                    placeholder="e.g. AATA"
                  />
                </div>

                {/* Active */}
                <F label="Active">
                  <select className="form-select" value={form.active} onChange={set('active')} style={selectStyle}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </F>

                {/* Item Category */}
                <F label="Item Category">
                  <select className="form-select" value={form.itemCategory} onChange={set('itemCategory')} style={selectStyle}>
                    <option value="">Select Category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </F>

                {/* Item Group */}
                <F label="Item Group">
                  <select className="form-select" value={form.itemGroupName} onChange={set('itemGroupName')} style={selectStyle}>
                    <option value="">Select Group</option>
                    {itemGroups.map((ig) => (
                      <option key={ig.id || ig.name} value={ig.name}>{ig.name}</option>
                    ))}
                  </select>
                </F>

                {/* Store Department */}
                <F label="Store Department">
                  <select className="form-select" value={form.storeDepartment} onChange={set('storeDepartment')} style={selectStyle}>
                    <option value="">Select Department</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </F>

                {/* Stock Unit (SKU) */}
                <F label="Stock Unit (SKU)" required>
                  <select className="form-select" value={form.unitName} onChange={set('unitName')} style={selectStyle} required>
                    <option value="">Select Stock Unit</option>
                    {units.map((u) => (
                      <option key={u.id || u.name} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </F>

                {/* HSN / SAC Code */}
                <F
                  label="HSN / SAC Code"
                  value={form.hsnSacCode}
                  onChange={set('hsnSacCode')}
                  placeholder="e.g. 1006"
                />

              </div>
            </div>

            {/* Card 2: Stock & Inventory Control */}
            <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px', padding: '12px 16px' }}>
              {sectionTitle(<FaSlidersH />, 'Inventory Control & Levels')}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 12px' }}>
                <F label="Max Level" type="number" value={form.maxLevel} onChange={set('maxLevel')} placeholder="0" />
                <F label="Min Level" type="number" value={form.minLevel} onChange={set('minLevel')} placeholder="0" />
                <F label="Re Order Level" type="number" value={form.reOrderLevel} onChange={set('reOrderLevel')} placeholder="0" />

                <F label="MOQ" type="number" value={form.moq} onChange={set('moq')} placeholder="0" />

                <F label="Lot No Applicable">
                  <select className="form-select" value={form.lotBatchNo} onChange={set('lotBatchNo')} style={selectStyle}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </F>

                <F label="PO Mandatory">
                  <select className="form-select" value={form.poMandatory} onChange={set('poMandatory')} style={selectStyle}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </F>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {/* Card 3: Conversion Unit Details */}
            <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px', padding: '12px 16px' }}>
              {sectionTitle(<FaExchangeAlt />, 'Conversion Unit Configuration')}
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                <F label="Conversion Unit">
                  <select className="form-select" value={form.conversionUnit} onChange={set('conversionUnit')} style={selectStyle}>
                    <option value="">Select Conversion Unit</option>
                    {units.map((u) => (
                      <option key={u.id || u.name} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </F>

                <F
                  label="Conv. Ratio (CR)"
                  type="number"
                  value={form.convRatio}
                  onChange={set('convRatio')}
                  placeholder="1"
                />
              </div>
            </div>

            {/* Card 4: Specification & Notes */}
            <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '6px', padding: '12px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {sectionTitle(<FaFileAlt />, 'Item Description & Notes')}
              
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <label className="form-label" style={{ marginBottom: '4px' }}>Description / Remarks</label>
                <textarea
                  className="form-input"
                  value={form.description}
                  onChange={set('description')}
                  rows={6}
                  placeholder="Type item specifications, storage instructions, or vendor remarks..."
                  style={{ width: '100%', padding: '8px 10px', fontSize: '0.88rem', resize: 'vertical', minHeight: '130px', flex: 1 }}
                />
              </div>
            </div>

          </div>

        </div>

        {/* Footer Actions Bar */}
        <CommonActionButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText={mode === 'add' ? 'Save' : 'Update'}
          saveDisabled={isDuplicate}
        />

        <DuplicateModal />
      </form>
    </div>
  );
};

export default ItemMasterForm;
