import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const FormCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md mb-6 animate-in fade-in duration-200">
    <h3 className="text-base font-bold text-[#244e5f] mb-6 pb-3 border-b border-gray-100">{title}</h3>
    {children}
  </div>
);

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
    <div className="p-6 md:p-8 animate-in fade-in duration-200">
      <PageHeader
        title={mode === 'add' ? 'Add Service Charge' : 'Edit Service Charge'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Service Charge Master', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
      />

      <form onSubmit={handleSubmit} className="mt-6">
        {/* Single Information Card in 4 column layout */}
        <FormCard title="Service Charge Information">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">
                Service Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Laundry Service"
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* A/c Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">A/c Name</label>
              <select
                value={form.acName}
                onChange={e => setForm(f => ({ ...f, acName: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
              >
                <option value="Service Charge Revenue">Service Charge Revenue</option>
                <option value="Food Revenue">Food Revenue</option>
                <option value="Beverage Revenue">Beverage Revenue</option>
                <option value="Laundry Revenue">Laundry Revenue</option>
              </select>
            </div>

            {/* Nature */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Nature</label>
              <select
                value={form.nature}
                onChange={e => setForm(f => ({ ...f, nature: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
              >
                <option value="Fixed">Fixed</option>
                <option value="Percentage">Percentage</option>
                <option value="Per Session">Per Session</option>
                <option value="Per Day">Per Day</option>
              </select>
            </div>

            {/* Applicable Date */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Applicable Date</label>
              <input
                type="date"
                value={form.applicableDate}
                onChange={e => setForm(f => ({ ...f, applicableDate: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Adult Rate */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Adult Rate</label>
              <input
                type="number"
                value={form.adultRate}
                onChange={e => setForm(f => ({ ...f, adultRate: e.target.value }))}
                placeholder="e.g. 50.00"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Child Rate */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Child Rate</label>
              <input
                type="number"
                value={form.childRate}
                onChange={e => setForm(f => ({ ...f, childRate: e.target.value }))}
                placeholder="e.g. 25.00"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Tax Structure */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Tax Structure</label>
              <select
                value={form.taxStructure}
                onChange={e => setForm(f => ({ ...f, taxStructure: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
              >
                <option value="NO TAX">NO TAX</option>
                <option value="TAX @5%">TAX @5%</option>
                <option value="TAX @12%">TAX @12%</option>
                <option value="TAX @18%">TAX @18%</option>
              </select>
            </div>

            {/* SAC Code */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">SAC Code</label>
              <input
                type="text"
                value={form.sacCode}
                onChange={e => setForm(f => ({ ...f, sacCode: e.target.value }))}
                placeholder="e.g. 996311"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Discount Allowed */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Discount Allowed</label>
              <select
                value={form.discountAllowed}
                onChange={e => setForm(f => ({ ...f, discountAllowed: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Back Date Allow */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Back Date Allow</label>
              <select
                value={form.backDateAllow}
                onChange={e => setForm(f => ({ ...f, backDateAllow: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Active */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Active</label>
              <select
                value={form.active}
                onChange={e => setForm(f => ({ ...f, active: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </FormCard>

        <CommonActionButtons
          onCancel={onCancel}
          saveText={mode === 'add' ? 'Save' : 'Update'}
        />
      </form>
    </div>
  );
};

export default ServiceChargeForm;
