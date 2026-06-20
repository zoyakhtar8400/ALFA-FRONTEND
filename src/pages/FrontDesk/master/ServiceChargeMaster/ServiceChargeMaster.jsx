import React, { useState, useEffect } from 'react';
import CustomTable from '../components/CustomTable';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import PageHeader from '../../../../components/common/PageHeader';

const FormCard = ({ title, children }) => (
  <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-md mb-8 mx-2 animate-in fade-in duration-200">
    <h3 className="text-lg font-bold text-[#244e5f] mb-6 pb-3 border-b border-gray-100">{title}</h3>
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
        {/* Single Information Card in 2 column layout */}
        <FormCard title="Service Charge Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
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
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* A/c Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">A/c Name</label>
              <select
                value={form.acName}
                onChange={e => setForm(f => ({ ...f, acName: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
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
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
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
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-[#F8FAFC] text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
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
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
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
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Tax Structure */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Tax Structure</label>
              <select
                value={form.taxStructure}
                onChange={e => setForm(f => ({ ...f, taxStructure: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
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
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-[#F8FAFC] text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all"
              />
            </div>

            {/* Discount Allowed */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#244e5f]">Discount Allowed</label>
              <select
                value={form.discountAllowed}
                onChange={e => setForm(f => ({ ...f, discountAllowed: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
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
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Active */}
            <div className="flex flex-col gap-2 col-span-2">
              <label className="text-xs font-semibold text-[#244e5f]">Active</label>
              <select
                value={form.active}
                onChange={e => setForm(f => ({ ...f, active: e.target.value }))}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-[#418a8b] focus:ring-2 focus:ring-[#418a8b]/20 transition-all cursor-pointer"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </FormCard>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200 px-2">
          <button
            type="submit"
            className="px-6 py-2.5 text-sm font-bold bg-[#418a8b] hover:bg-[#357273] text-white rounded-full transition-all cursor-pointer shadow-sm hover:shadow-md"
          >
            Save
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 text-sm font-bold border border-gray-300 text-gray-600 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const ServiceChargeMaster = ({ showToast }) => {
  const [data, setData] = useState([
    { id: 1, name: 'Laundry Service', acName: 'Laundry Revenue', nature: 'Fixed', adultRate: '50.00', childRate: '25.00', applicableDate: '2026-04-01', taxStructure: 'NO TAX', sacCode: '996311', discountAllowed: 'Yes', backDateAllow: 'No', active: 'Yes' },
    { id: 2, name: 'Spa & Wellness', acName: 'Service Charge Revenue', nature: 'Per Session', adultRate: '120.00', childRate: '60.00', applicableDate: '2026-04-01', taxStructure: 'TAX @18%', sacCode: '996312', discountAllowed: 'No', backDateAllow: 'No', active: 'Yes' },
    { id: 3, name: 'Valet Car Parking', acName: 'Service Charge Revenue', nature: 'Per Day', adultRate: '20.00', childRate: '10.00', applicableDate: '2026-04-01', taxStructure: 'NO TAX', sacCode: '996313', discountAllowed: 'Yes', backDateAllow: 'Yes', active: 'Yes' },
    { id: 4, name: 'Airport Transfer', acName: 'Service Charge Revenue', nature: 'Fixed', adultRate: '80.00', childRate: '40.00', applicableDate: '2026-04-01', taxStructure: 'TAX @12%', sacCode: '996314', discountAllowed: 'Yes', backDateAllow: 'No', active: 'Yes' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const columns = [
    { key: 'name', label: 'Service Name' },
    { key: 'acName', label: 'A/c Name' },
    { key: 'nature', label: 'Nature' },
    { key: 'adultRate', label: 'Adult Rate' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Service Charge added successfully!');
    } else {
      setData(prev => prev.map(s => s.id === editMode.row.id ? { ...formData, id: s.id } : s));
      showToast('Service Charge updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(s => s.id !== deleteModal.row.id));
    showToast('Service Charge deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (showForm) {
    return (
      <ServiceChargeForm
        mode={editMode.mode}
        initialData={editMode.row}
        onSave={handleSave}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  return (
    <>
      <CustomTable
        title="Service Charge Master"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Add Service Charge"
        searchPlaceholder="Search service charges..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Service Charge Master']}
      />

      <ConfirmModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        message={`Delete service charge "${deleteModal.row?.name}"? This cannot be undone.`}
      />
    </>
  );
};

export default ServiceChargeMaster;

