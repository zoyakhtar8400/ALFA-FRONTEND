import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import FormCard from '../../../../components/common/FormCard';

const ServiceChargeForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    acName: 'Service Charge Revenue',
    nature: 'Fixed',
    adultRate: '',
    childRate: '',
    applicableDate: '',
    taxStructure: 'NO TAX',
    sacCode: '',
    discountAllowed: 'Yes',
    backDateAllow: 'No',
    active: 'Yes'
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        name: initialData.name || '',
        acName: initialData.acName || 'Service Charge Revenue',
        nature: initialData.nature || initialData.chargeType || 'Fixed',
        adultRate: initialData.adultRate || initialData.amount || '',
        childRate: initialData.childRate || '',
        applicableDate: initialData.applicableDate || '',
        taxStructure: initialData.taxStructure || 'NO TAX',
        sacCode: initialData.sacCode || '',
        discountAllowed: initialData.discountAllowed || 'Yes',
        backDateAllow: initialData.backDateAllow || 'No',
        active: initialData.active || initialData.status || 'Yes'
      });
    } else {
      setForm({
        name: '',
        acName: 'Service Charge Revenue',
        nature: 'Fixed',
        adultRate: '',
        childRate: '',
        applicableDate: '',
        taxStructure: 'NO TAX',
        sacCode: '',
        discountAllowed: 'Yes',
        backDateAllow: 'No',
        active: 'Yes'
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <div className="animate-in duration-200">
      <PageHeader
        title={mode === 'add' ? 'Add Service Charge' : 'Edit Service Charge'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Service Charge Master', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
      />

      <form onSubmit={handleSubmit} className="m-6 p-4">
        {/* Card: Service Charge Information - arranged in 2-column layout */}
        <FormCard title="Service Charge Information">
          <div className="form-grid-2">
            {/* Name */}
            <div className="form-field">
              <label className="form-label">
                Service Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Laundry Service"
                required
                className="form-input"
              />
            </div>

            {/* A/c Name */}
            <div className="form-field">
              <label className="form-label">A/c Name</label>
              <select
                value={form.acName}
                onChange={e => setForm(f => ({ ...f, acName: e.target.value }))}
                className="form-select"
              >
                <option value="Service Charge Revenue">Service Charge Revenue</option>
                <option value="Food Revenue">Food Revenue</option>
                <option value="Beverage Revenue">Beverage Revenue</option>
                <option value="Laundry Revenue">Laundry Revenue</option>
              </select>
            </div>

            {/* Nature */}
            <div className="form-field">
              <label className="form-label">Nature</label>
              <select
                value={form.nature}
                onChange={e => setForm(f => ({ ...f, nature: e.target.value }))}
                className="form-select"
              >
                <option value="Fixed">Fixed</option>
                <option value="Percentage">Percentage</option>
                <option value="Per Session">Per Session</option>
                <option value="Per Day">Per Day</option>
              </select>
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

            {/* Adult Rate */}
            <div className="form-field">
              <label className="form-label">Adult Rate</label>
              <input
                type="number"
                value={form.adultRate}
                onChange={e => setForm(f => ({ ...f, adultRate: e.target.value }))}
                placeholder="e.g. 50.00"
                className="form-input"
              />
            </div>

            {/* Child Rate */}
            <div className="form-field">
              <label className="form-label">Child Rate</label>
              <input
                type="number"
                value={form.childRate}
                onChange={e => setForm(f => ({ ...f, childRate: e.target.value }))}
                placeholder="e.g. 25.00"
                className="form-input"
              />
            </div>

            {/* Tax Structure */}
            <div className="form-field">
              <label className="form-label">Tax Structure</label>
              <select
                value={form.taxStructure}
                onChange={e => setForm(f => ({ ...f, taxStructure: e.target.value }))}
                className="form-select"
              >
                <option value="NO TAX">NO TAX</option>
                <option value="TAX @5%">TAX @5%</option>
                <option value="TAX @12%">TAX @12%</option>
                <option value="TAX @18%">TAX @18%</option>
              </select>
            </div>

            {/* SAC Code */}
            <div className="form-field">
              <label className="form-label">SAC Code</label>
              <input
                type="text"
                value={form.sacCode}
                onChange={e => setForm(f => ({ ...f, sacCode: e.target.value }))}
                placeholder="e.g. 996311"
                className="form-input"
              />
            </div>

            {/* Discount Allowed */}
            <div className="form-field">
              <label className="form-label">Discount Allowed</label>
              <select
                value={form.discountAllowed}
                onChange={e => setForm(f => ({ ...f, discountAllowed: e.target.value }))}
                className="form-select"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Back Date Allow */}
            <div className="form-field">
              <label className="form-label">Back Date Allow</label>
              <select
                value={form.backDateAllow}
                onChange={e => setForm(f => ({ ...f, backDateAllow: e.target.value }))}
                className="form-select"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Active */}
            <div className="form-field form-span-2">
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

export default ServiceChargeForm;
