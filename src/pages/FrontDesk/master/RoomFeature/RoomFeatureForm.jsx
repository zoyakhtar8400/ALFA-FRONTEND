import React, { useState, useEffect } from 'react';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const RoomFeatureForm = ({ isOpen, mode, initialData, onSave, onClose }) => {
  const [form, setForm] = useState({ name: '', active: 'Yes' });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({ name: '', active: 'Yes' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
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
            {mode === 'add' ? 'Add Room Feature' : 'Edit Room Feature'}
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
          <div className="flex flex-col gap-5">
            {/* Feature Name */}
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-semibold text-[#244e5f]">
                Feature Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter feature name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="w-full rounded-xl border border-gray-300 bg-[#F8FAFC] px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition-all focus:border-[#418a8b] focus:outline-none focus:ring-2 focus:ring-[#418a8b]/20"
              />
            </div>

            {/* Active */}
            <div className="flex flex-col gap-2">
              <label className="block text-xs font-semibold text-[#244e5f]">Active</label>
              <select
                value={form.active}
                onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.value }))}
                className="w-full cursor-pointer rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 transition-all focus:border-[#418a8b] focus:outline-none focus:ring-2 focus:ring-[#418a8b]/20"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
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

export default RoomFeatureForm;
