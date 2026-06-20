import React, { useState, useEffect } from 'react';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const VehicleMasterForm = ({ isOpen, mode, initialData, onSave, onClose }) => {
  const [form, setForm] = useState({ regNo: '', type: 'Sedan', driver: '', mobile: '', model: '', status: 'Active' });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm({ regNo: '', type: 'Sedan', driver: '', mobile: '', model: '', status: 'Active' });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.regNo.trim() || !form.driver.trim()) return;
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.18)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div className="w-full max-w-[640px] rounded-2xl border border-gray-100 bg-white p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="text-base font-bold text-[#244e5f]">
            {mode === 'add' ? 'Add Vehicle' : 'Edit Vehicle'}
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer text-xl font-bold text-gray-400 transition-colors hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-x-6 gap-y-5">
            {/* Registration No */}
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-semibold text-[#244e5f]">
                Registration No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="NY-AX-1234"
                value={form.regNo}
                onChange={(e) => setForm((prev) => ({ ...prev, regNo: e.target.value }))}
                required
                className="w-full rounded-xl border border-gray-300 bg-[#F8FAFC] px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-[#418a8b] focus:outline-none focus:ring-2 focus:ring-[#418a8b]/20"
              />
            </div>

            {/* Vehicle Type */}
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-semibold text-[#244e5f]">Vehicle Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 transition-all focus:border-[#418a8b] focus:outline-none focus:ring-2 focus:ring-[#418a8b]/20"
              >
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Mini Van">Mini Van</option>
                <option value="Bus">Bus</option>
              </select>
            </div>

            {/* Driver Name */}
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-semibold text-[#244e5f]">
                Driver Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter driver name"
                value={form.driver}
                onChange={(e) => setForm((prev) => ({ ...prev, driver: e.target.value }))}
                required
                className="w-full rounded-xl border border-gray-300 bg-[#F8FAFC] px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-[#418a8b] focus:outline-none focus:ring-2 focus:ring-[#418a8b]/20"
              />
            </div>

            {/* Mobile */}
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-semibold text-[#244e5f]">Mobile</label>
              <input
                type="text"
                placeholder="+1 555-0000"
                value={form.mobile}
                onChange={(e) => setForm((prev) => ({ ...prev, mobile: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-[#F8FAFC] px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-[#418a8b] focus:outline-none focus:ring-2 focus:ring-[#418a8b]/20"
              />
            </div>

            {/* Model */}
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-semibold text-[#244e5f]">Model</label>
              <input
                type="text"
                placeholder="Enter model"
                value={form.model}
                onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 bg-[#F8FAFC] px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-[#418a8b] focus:outline-none focus:ring-2 focus:ring-[#418a8b]/20"
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-semibold text-[#244e5f]">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 transition-all focus:border-[#418a8b] focus:outline-none focus:ring-2 focus:ring-[#418a8b]/20"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <CommonActionButtons
            onCancel={onClose}
            saveText={mode === 'add' ? 'Save' : 'Update'}
          />
        </form>
      </div>
    </div>
  );
};

export default VehicleMasterForm;
