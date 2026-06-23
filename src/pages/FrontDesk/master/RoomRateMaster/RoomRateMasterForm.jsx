import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import FormCard from '../../../../components/common/FormCard';

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

const RoomRateMasterForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    shortName: '',
    applicableDate: '',
    category: 'Standard Comfort Room',
    planType: 'American Plan',
    mealType: 'Veg',
    active: 'Yes',

    // Room rates
    roomSingle: '100.00',
    roomDouble: '120.00',
    roomExtraAdult: '30.00',
    roomTriple: '150.00',
    roomQuadrant: '180.00',
    roomExtraChild: '20.00',

    // Meal rates (defaults to 0)
    mealSingle: '0.00',
    mealDouble: '0.00',
    mealExtraAdult: '0.00',
    mealTriple: '0.00',
    mealQuadrant: '0.00',
    mealExtraChild: '0.00'
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

  useEffect(() => {
    if (initialData) {
      setForm({
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
      });
    } else {
      handleCategoryChange('Standard Comfort Room');
    }
  }, [initialData]);

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
    <div className="animate-in duration-200">
      <PageHeader
        title={mode === 'add' ? 'Add Room Rate Plan' : 'Edit Room Rate Plan'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Room Rate Master', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
      />

      <form onSubmit={handleSubmit} className="m-6 p-4 flex flex-col gap-4">
        {/* Card 1: Basic Information */}
        <FormCard title="Basic Information">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            {/* Name */}
            <div className="form-field">
              <label className="form-label">
                Rate Plan Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Peak Season Rate"
                required
                className="form-input"
              />
            </div>

            {/* Short Name */}
            <div className="form-field">
              <label className="form-label">
                Short Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.shortName}
                onChange={e => setForm(f => ({ ...f, shortName: e.target.value }))}
                placeholder="e.g. PEAK"
                required
                className="form-input"
              />
            </div>

            {/* Applicable Date */}
            <div className="form-field">
              <label className="form-label">Applicable Date</label>
              <input
                type="date"
                value={form.applicableDate}
                onChange={e => setForm(f => ({ ...f, applicableDate: e.target.value }))}
                className="form-input"
              />
            </div>

            {/* Room Category */}
            <div className="form-field">
              <label className="form-label">Room Category</label>
              <select
                value={form.category}
                onChange={e => handleCategoryChange(e.target.value)}
                className="form-select"
              >
                <option value="Standard Comfort Room">Standard Comfort Room</option>
                <option value="Premium Deluxe King Room">Premium Deluxe King Room</option>
                <option value="Presidential Penthouse Suite">Presidential Penthouse Suite</option>
              </select>
            </div>

            {/* Plan Type */}
            <div className="form-field">
              <label className="form-label">Plan Type</label>
              <select
                value={form.planType}
                onChange={e => setForm(f => ({ ...f, planType: e.target.value }))}
                className="form-select"
              >
                <option value="American Plan">American Plan</option>
                <option value="MAP">Modified American Plan (MAP)</option>
                <option value="EP">European Plan (EP)</option>
                <option value="CP">Continental Plan (CP)</option>
              </select>
            </div>

            {/* Meal Type */}
            <div className="form-field">
              <label className="form-label">Meal Type</label>
              <select
                value={form.mealType}
                onChange={e => setForm(f => ({ ...f, mealType: e.target.value }))}
                className="form-select"
              >
                <option value="Veg">Veg</option>
                <option value="Non-Veg">Non-Veg</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>

            {/* Active */}
            <div className="form-field md:col-span-2">
              <label className="form-label">Active</label>
              <select
                value={form.active}
                onChange={e => setForm(f => ({ ...f, active: e.target.value }))}
                className="form-select"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
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
                <div key={key} className="form-field">
                  <label className="form-label">{label}</label>
                  <input
                    type="number"
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder="0.00"
                    className="form-input"
                  />
                </div>
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
                <div key={key} className="form-field">
                  <label className="form-label">{label}</label>
                  <input
                    type="number"
                    value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder="0.00"
                    className="form-input"
                  />
                </div>
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
                <div key={label} className="form-field">
                  <label className="form-label">{label}</label>
                  <div className="w-full px-4 py-2.5 text-sm font-bold border border-emerald-100 rounded-xl bg-emerald-50/30 text-emerald-800 select-none text-center truncate">
                    Rs. {value}
                  </div>
                </div>
              ))}
            </div>
          </FormCard>
        </div>

        <div className="mt-2 border-t border-slate-100 pt-4">
          <CommonActionButtons
            onCancel={onCancel}
            saveText={mode === 'add' ? 'Save' : 'Update'}
          />
        </div>
      </form>
    </div>
  );
};

export default RoomRateMasterForm;
