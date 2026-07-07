import { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import FormCard from '../../../../components/common/FormCard';
import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';

// Room Category Rates seed for auto-population
const CATEGORY_RATES = {
  'Standard Comfort Room': {
    singleRate: 100.00,
    doubleRate: 120.00,
    extraAdult: 30.00,
    tripleRate: 150.00,
    quadrantRate: 180.00,
    extraChild: 20.00
  },
  'Premium Deluxe King Room': {
    singleRate: 200.00,
    doubleRate: 220.00,
    extraAdult: 50.00,
    tripleRate: 280.00,
    quadrantRate: 340.00,
    extraChild: 40.00
  },
  'Presidential Penthouse Suite': {
    singleRate: 400.00,
    doubleRate: 450.00,
    extraAdult: 100.00,
    tripleRate: 550.00,
    quadrantRate: 650.00,
    extraChild: 80.00
  }
};

/* ── Field wrapper — defined OUTSIDE parent to prevent remount on every keystroke ── */
const F = ({ label, type = 'text', placeholder, required, disabled, children, value, onChange, style, inputStyle, inputClassName, error }) => (
  <div className="form-field" style={{ marginBottom: '4px', ...style }}>
    <label className="form-label" style={{ marginBottom: '2px' }}>
      {label}{required && <span className="text-red-500"> *</span>}
    </label>
    {children || (
      <input
        className={`form-input${disabled ? ' bg-slate-50 cursor-not-allowed' : ''} ${error ? 'border-red-500' : ''} ${inputClassName || ''}`}
        type={type}
        value={value ?? ''}
        onChange={disabled ? undefined : onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px', minHeight: '34px', ...inputStyle }}
      />
    )}
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const RoomRateMasterForm = ({ mode, initialData, onSave, onCancel, existingRecords = [] }) => {
  const [form, setForm] = useState(() => {
    if (initialData) {
      return {
        ...initialData,
        name: initialData.name || initialData.code || '',
        shortName: initialData.shortName || initialData.code?.split('-')[2] || '',
        applicableDate: initialData.applicableDate || '',
        category: initialData.category || 'Standard Comfort Room',
        planType: initialData.planType || 'American Plan',
        mealType: initialData.mealType || 'Veg',
        active: initialData.active || initialData.status || 'Yes',

        roomSingle: parseFloat(initialData.roomSingle || initialData.rate?.replace(/[^\d.-]/g, '') || 100.00).toFixed(2),
        roomDouble: parseFloat(initialData.roomDouble || 120.00).toFixed(2),
        roomExtraAdult: parseFloat(initialData.roomExtraAdult || 30.00).toFixed(2),
        roomTriple: parseFloat(initialData.roomTriple || 150.00).toFixed(2),
        roomQuadrant: parseFloat(initialData.roomQuadrant || 180.00).toFixed(2),
        roomExtraChild: parseFloat(initialData.roomExtraChild || 20.00).toFixed(2),

        mealSingle: parseFloat(initialData.mealSingle || 0.00).toFixed(2),
        mealDouble: parseFloat(initialData.mealDouble || 0.00).toFixed(2),
        mealExtraAdult: parseFloat(initialData.mealExtraAdult || 0.00).toFixed(2),
        mealTriple: parseFloat(initialData.mealTriple || 0.00).toFixed(2),
        mealQuadrant: parseFloat(initialData.mealQuadrant || 0.00).toFixed(2),
        mealExtraChild: parseFloat(initialData.mealExtraChild || 0.00).toFixed(2)
      };
    }

    const rates = CATEGORY_RATES['Standard Comfort Room'];
    return {
      name: '',
      shortName: '',
      applicableDate: '',
      category: 'Standard Comfort Room',
      planType: 'American Plan',
      mealType: 'Veg',
      active: 'Yes',

      // Room rates
      roomSingle: rates.singleRate.toFixed(2),
      roomDouble: rates.doubleRate.toFixed(2),
      roomExtraAdult: rates.extraAdult.toFixed(2),
      roomTriple: rates.tripleRate.toFixed(2),
      roomQuadrant: rates.quadrantRate.toFixed(2),
      roomExtraChild: rates.extraChild.toFixed(2),

      // Meal rates (defaults to 0)
      mealSingle: '0.00',
      mealDouble: '0.00',
      mealExtraAdult: '0.00',
      mealTriple: '0.00',
      mealQuadrant: '0.00',
      mealExtraChild: '0.00'
    };
  });

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['name'],
    currentId: initialData?.id,
    mode
  });

  // Fetch rates when room category is changed
  const handleCategoryChange = (catName) => {
    const rates = CATEGORY_RATES[catName];
    if (rates) {
      setForm(prev => ({
        ...prev,
        category: catName,
        roomSingle: rates.singleRate.toFixed(2),
        roomDouble: rates.doubleRate.toFixed(2),
        roomExtraAdult: rates.extraAdult.toFixed(2),
        roomTriple: rates.tripleRate.toFixed(2),
        roomQuadrant: rates.quadrantRate.toFixed(2),
        roomExtraChild: rates.extraChild.toFixed(2)
      }));
    } else {
      setForm(prev => ({ ...prev, category: catName }));
    }
  };

  // Real-time calculation helpers
  const getNetSingle = () => (parseFloat(form.roomSingle || 0) + parseFloat(form.mealSingle || 0)).toFixed(2);
  const getNetDouble = () => (parseFloat(form.roomDouble || 0) + parseFloat(form.mealDouble || 0)).toFixed(2);
  const getNetTriple = () => (parseFloat(form.roomTriple || 0) + parseFloat(form.mealTriple || 0)).toFixed(2);
  const getNetQuadrant = () => (parseFloat(form.roomQuadrant || 0) + parseFloat(form.mealQuadrant || 0)).toFixed(2);
  const getNetExtraAdult = () => (parseFloat(form.roomExtraAdult || 0) + parseFloat(form.mealExtraAdult || 0)).toFixed(2);
  const getNetExtraChild = () => (parseFloat(form.roomExtraChild || 0) + parseFloat(form.mealExtraChild || 0)).toFixed(2);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!checkBeforeSave()) return;

    const payload = {
      ...form,
      netSingle: getNetSingle(),
      netDouble: getNetDouble(),
      netTriple: getNetTriple(),
      netQuadrant: getNetQuadrant(),
      netExtraAdult: getNetExtraAdult(),
      netExtraChild: getNetExtraChild()
    };
    onSave(payload);
  };

  return (
    <div className="animate-in duration-200" style={{ padding: '0 8px' }}>
      {/* Hide ALL scrollbars globally for a premium desktop app feel */}
      <style dangerouslySetInnerHTML={{__html: `
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
        title={mode === 'add' ? 'Add Room Rate Plan' : 'Edit Room Rate Plan'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Room Rate Master', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
        style={{ marginBottom: '4px', paddingBottom: '2px' }}
      />

      <form onSubmit={handleSubmit} onKeyDown={handleEnterNavigation} className="p-4 flex flex-col gap-4">
        {/* Card 1: Basic Information */}
        <FormCard title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            {/* Name */}
            <F
              label="Rate Plan Name"
              required
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Peak Season Rate"
            />

            {/* Short Name */}
            <F
              label="Short Name"
              required
              value={form.shortName}
              onChange={e => setForm(f => ({ ...f, shortName: e.target.value }))}
              placeholder="e.g. PEAK"
            />

            {/* Applicable Date */}
            <F
              label="Applicable Date"
              type="date"
              value={form.applicableDate}
              onChange={e => setForm(f => ({ ...f, applicableDate: e.target.value }))}
            />

            {/* Room Category */}
            <F label="Room Category">
              <select
                value={form.category}
                onChange={e => handleCategoryChange(e.target.value)}
                className="form-select"
                style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px', minHeight: '34px', width: '100%' }}
              >
                <option value="Standard Comfort Room">Standard Comfort Room</option>
                <option value="Premium Deluxe King Room">Premium Deluxe King Room</option>
                <option value="Presidential Penthouse Suite">Presidential Penthouse Suite</option>
              </select>
            </F>

            {/* Plan Type */}
            <F label="Plan Type">
              <select
                value={form.planType}
                onChange={e => setForm(f => ({ ...f, planType: e.target.value }))}
                className="form-select"
                style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px', minHeight: '34px', width: '100%' }}
              >
                <option value="American Plan">American Plan</option>
                <option value="MAP">Modified American Plan (MAP)</option>
                <option value="EP">European Plan (EP)</option>
                <option value="CP">Continental Plan (CP)</option>
              </select>
            </F>

            {/* Meal Type */}
            <F label="Meal Type">
              <select
                value={form.mealType}
                onChange={e => setForm(f => ({ ...f, mealType: e.target.value }))}
                className="form-select"
                style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px', minHeight: '34px', width: '100%' }}
              >
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Mixed">Mixed</option>
              </select>
            </F>

            {/* Active */}
            <F label="Active" style={{ gridColumn: 'span 2' }}>
              <select
                value={form.active}
                onChange={e => setForm(f => ({ ...f, active: e.target.value }))}
                className="form-select"
                style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px', minHeight: '34px', width: '100%' }}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </F>
          </div>
        </FormCard>

        {/* 3-Column Rates Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card 2: Room Charges */}
          <FormCard title="Room Charges" className="mb-0">
            <div className="form-grid-2">
              {[
                { label: 'Single Rate', key: 'roomSingle' },
                { label: 'Double Rate', key: 'roomDouble' },
                { label: 'Triple Rate', key: 'roomTriple' },
                { label: 'Quadrant Rate', key: 'roomQuadrant' },
                { label: 'Extra Adult', key: 'roomExtraAdult' },
                { label: 'Extra Child', key: 'roomExtraChild' }
              ].map(({ label, key }) => (
                <F
                  key={key}
                  label={label}
                  type="number"
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder="0.00"
                />
              ))}
            </div>
          </FormCard>

          {/* Card 3: Meal Charges */}
          <FormCard title="Meal Charges" className="mb-0">
            <div className="form-grid-2">
              {[
                { label: 'Single Rate', key: 'mealSingle' },
                { label: 'Double Rate', key: 'mealDouble' },
                { label: 'Triple Rate', key: 'mealTriple' },
                { label: 'Quadrant Rate', key: 'mealQuadrant' },
                { label: 'Extra Adult', key: 'mealExtraAdult' },
                { label: 'Extra Child', key: 'mealExtraChild' }
              ].map(({ label, key }) => (
                <F
                  key={key}
                  label={label}
                  type="number"
                  value={form[key]}
                  onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder="0.00"
                />
              ))}
            </div>
          </FormCard>

          {/* Card 4: Net Charges (Room + Meal) */}
          <FormCard title="Net Charges (Room + Meal)" className="mb-0">
            <div className="form-grid-2">
              {[
                { label: 'Single Net', value: getNetSingle() },
                { label: 'Double Net', value: getNetDouble() },
                { label: 'Triple Net', value: getNetTriple() },
                { label: 'Quadrant Net', value: getNetQuadrant() },
                { label: 'Extra Adult Net', value: getNetExtraAdult() },
                { label: 'Extra Child Net', value: getNetExtraChild() }
              ].map(({ label, value }) => (
                <F key={label} label={label}>
                  <div style={{
                    width: '100%',
                    padding: '0 12px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    border: '1.5px dashed #10b981',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(16, 185, 129, 0.06)',
                    color: '#047857',
                    display: 'flex',
                    alignItems: 'center',
                    height: '34px',
                  }}>
                    Rs. {value}
                  </div>
                </F>
              ))}
            </div>
          </FormCard>
        </div>

        <div className="mt-2 border-t border-slate-100 pt-4">
          <CommonActionButtons
            onCancel={onCancel}
            saveText={mode === 'add' ? 'Save' : 'Update'}
            saveDisabled={isDuplicate}
          />
        </div>
        <DuplicateModal />
      </form>
    </div>
  );
};

export default RoomRateMasterForm;
