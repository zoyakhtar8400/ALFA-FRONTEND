import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const FormCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md mb-6 animate-in fade-in duration-200">
    <h3 className="text-base font-bold text-[#244e5f] mb-6 pb-3 border-b border-gray-100">{title}</h3>
    {children}
  </div>
);

const CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Kolkata',
  'Chennai',
  'Hyderabad',
  'Ahmedabad',
  'Pune',
  'New York',
  'London',
  'Singapore'
];

const CompanyMasterForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    name: '',
    underGroup: 'Sundry Debtors',
    shortName: '',
    nature: 'Corporate',
    gstNumber: '',
    contractPerson: '',
    address: '',
    city: 'Mumbai',
    phone: '',
    mobile: '',
    email: '',
    active: 'Yes'
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        name: initialData.name || '',
        underGroup: initialData.underGroup || 'Sundry Debtors',
        shortName: initialData.shortName || initialData.code || '',
        nature: initialData.nature || 'Corporate',
        gstNumber: initialData.gstNumber || initialData.gstNo || '',
        contractPerson: initialData.contractPerson || '',
        address: initialData.address || '',
        city: initialData.city || 'Mumbai',
        phone: initialData.phone || '',
        mobile: initialData.mobile || '',
        email: initialData.email || '',
        active: initialData.active || initialData.status || 'Yes'
      });
    } else {
      setForm({
        name: '',
        underGroup: 'Sundry Debtors',
        shortName: '',
        nature: 'Corporate',
        gstNumber: '',
        contractPerson: '',
        address: '',
        city: 'Mumbai',
        phone: '',
        mobile: '',
        email: '',
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
        title={mode === 'add' ? 'Add Company' : 'Edit Company'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Company Master', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
      />

      <form onSubmit={handleSubmit} className="mt-6">
        {/* Card: Company Information in 4 column layout */}
        <FormCard title="Company Information">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Alfa Group Ltd"
                required
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Under Group */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Under Group</label>
              <input
                type="text"
                value={form.underGroup}
                onChange={e => setForm(f => ({ ...f, underGroup: e.target.value }))}
                placeholder="Sundry Debtors"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Short Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Short Name</label>
              <input
                type="text"
                value={form.shortName}
                onChange={e => setForm(f => ({ ...f, shortName: e.target.value }))}
                placeholder="e.g. ALFA"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Nature */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Nature</label>
              <input
                type="text"
                value={form.nature}
                onChange={e => setForm(f => ({ ...f, nature: e.target.value }))}
                placeholder="Corporate"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* GSTIN No. */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">GSTIN No.</label>
              <input
                type="text"
                value={form.gstNumber}
                onChange={e => setForm(f => ({ ...f, gstNumber: e.target.value }))}
                placeholder="e.g. 29AAAAA1111A1Z1"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Contact Person */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Contract Person</label>
              <input
                type="text"
                value={form.contractPerson}
                onChange={e => setForm(f => ({ ...f, contractPerson: e.target.value }))}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* City */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">City</label>
              <select
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
              >
                {CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="e.g. +91 22 123456"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Mobile Number */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Mobile Number</label>
              <input
                type="text"
                value={form.mobile}
                onChange={e => setForm(f => ({ ...f, mobile: e.target.value }))}
                placeholder="e.g. +91 9876543210"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="e.g. info@alfagroup.com"
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
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

            {/* Address (Spans remaining columns or full width on md/lg) */}
            <div className="md:col-span-2 lg:col-span-4 flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Address</label>
              <textarea
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Enter complete office address..."
                rows={3}
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

export default CompanyMasterForm;
