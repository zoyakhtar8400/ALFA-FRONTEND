import React, { useState, useEffect } from 'react';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const CityMasterForm = ({ isOpen, mode, initialData, onSave, onClose }) => {
  const [form, setForm] = useState({ name: '', state: '', country: '' });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm({ name: '', state: '', country: '' });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.state.trim() || !form.country.trim()) return;
    onSave(form);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.18)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
    >
      <div className="w-full max-w-[640px] rounded-2xl border border-gray-100 bg-white p-10 shadow-2xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
          <h3 className="text-base font-bold text-[#244e5f]">
            {mode === 'add' ? 'Add City' : 'Edit City'}
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
            {/* City Name */}
            <div className="col-span-2 flex flex-col gap-2">
              <label className="block text-xs font-semibold text-[#244e5f]">
                City Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter city name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="w-full rounded-xl border border-gray-300 bg-[#F8FAFC] px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-[#418a8b] focus:outline-none focus:ring-2 focus:ring-[#418a8b]/20"
              />
            </div>

            {/* State */}
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-semibold text-[#244e5f]">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter state"
                value={form.state}
                onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                required
                className="w-full rounded-xl border border-gray-300 bg-[#F8FAFC] px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-[#418a8b] focus:outline-none focus:ring-2 focus:ring-[#418a8b]/20"
              />
            </div>

            {/* Country */}
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-semibold text-[#244e5f]">
                Country <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter country"
                value={form.country}
                onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                required
                className="w-full rounded-xl border border-gray-300 bg-[#F8FAFC] px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-[#418a8b] focus:outline-none focus:ring-2 focus:ring-[#418a8b]/20"
              />
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

export default CityMasterForm;
