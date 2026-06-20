import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const FormCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md mb-6 animate-in fade-in duration-200">
    <h3 className="text-base font-bold text-[#244e5f] mb-6 pb-3 border-b border-gray-100">{title}</h3>
    {children}
  </div>
);

const RoomCategoryForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    shortName: '',
    noOfRoom: '',
    applicableDate: '',
    acName: 'Room Revenue',
    taxStructure: 'NO TAX',
    active: 'Yes',
    singleRate: '',
    doubleRate: '',
    extraAdult: '',
    tripleRate: '',
    quadrantRate: '',
    extraChild: ''
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({
        name: '',
        shortName: '',
        noOfRoom: '',
        applicableDate: '',
        acName: 'Room Revenue',
        taxStructure: 'NO TAX',
        active: 'Yes',
        singleRate: '',
        doubleRate: '',
        extraAdult: '',
        tripleRate: '',
        quadrantRate: '',
        extraChild: ''
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.shortName.trim()) return;
    onSave(form);
  };

  return (
    <div className="p-6 md:p-8 animate-in fade-in duration-200">
      <PageHeader
        title={mode === 'add' ? 'Add Room Category' : 'Edit Room Category'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Room Category', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
      />

      <form onSubmit={handleSubmit} className="mt-6">
        {/* Card 1: Category Information */}
        <FormCard title="Category Information">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Enter name"
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Short Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">
                Short Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.shortName}
                onChange={e => setForm(f => ({ ...f, shortName: e.target.value }))}
                placeholder="Enter short name"
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* No. of Room */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">No. of Room</label>
              <input
                type="number"
                value={form.noOfRoom}
                onChange={e => setForm(f => ({ ...f, noOfRoom: e.target.value }))}
                placeholder="Enter number"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
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

            {/* A/c Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">A/c Name</label>
              <select
                value={form.acName}
                onChange={e => setForm(f => ({ ...f, acName: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
              >
                <option value="Room Revenue">Room Revenue</option>
                <option value="Suite Revenue">Suite Revenue</option>
                <option value="Standard Revenue">Standard Revenue</option>
              </select>
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

        {/* Card 2: Rate Structure */}
        <FormCard title="Rate Structure">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            {/* Single Rate */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Single Rate</label>
              <input
                type="number"
                value={form.singleRate}
                onChange={e => setForm(f => ({ ...f, singleRate: e.target.value }))}
                placeholder="0.00"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Double Rate */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Double Rate</label>
              <input
                type="number"
                value={form.doubleRate}
                onChange={e => setForm(f => ({ ...f, doubleRate: e.target.value }))}
                placeholder="0.00"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Extra Adult */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Extra Adult</label>
              <input
                type="number"
                value={form.extraAdult}
                onChange={e => setForm(f => ({ ...f, extraAdult: e.target.value }))}
                placeholder="0.00"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Triple Rate */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Triple Rate</label>
              <input
                type="number"
                value={form.tripleRate}
                onChange={e => setForm(f => ({ ...f, tripleRate: e.target.value }))}
                placeholder="0.00"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Quadrant Rate */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Quadrant Rate</label>
              <input
                type="number"
                value={form.quadrantRate}
                onChange={e => setForm(f => ({ ...f, quadrantRate: e.target.value }))}
                placeholder="0.00"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Extra Child */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Extra Child</label>
              <input
                type="number"
                value={form.extraChild}
                onChange={e => setForm(f => ({ ...f, extraChild: e.target.value }))}
                placeholder="0.00"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
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

export default RoomCategoryForm;
