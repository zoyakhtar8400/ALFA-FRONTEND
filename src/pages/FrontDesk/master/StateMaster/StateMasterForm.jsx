import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const StateMasterForm = ({ isOpen, mode, initialData, onSave, onClose }) => {
  const [form, setForm] = useState({ name: '', country: '', gstCode: '' });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm({ name: '', country: '', gstCode: '' });
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.country.trim()) return;
    onSave(form);
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add State' : 'Edit State'}
    >
      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit}>
        <div className="form-grid-2">
          {/* State Name */}
          <div className="form-field form-span-2">
            <label className="form-label">
              State Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter state name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="form-input"
            />
          </div>

          {/* Country */}
          <div className="form-field">
            <label className="form-label">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter country"
              value={form.country}
              onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
              required
              className="form-input"
            />
          </div>

          {/* GST State Code */}
          <div className="form-field">
            <label className="form-label">GST State Code</label>
            <input
              type="text"
              placeholder="Enter GST code"
              value={form.gstCode}
              onChange={(e) => setForm((prev) => ({ ...prev, gstCode: e.target.value }))}
              className="form-input"
            />
          </div>
        </div>

        <CommonActionButtons
          onCancel={onClose}
          saveText={mode === 'add' ? 'Save' : 'Update'}
        />
      </form>
    </CommonModal>
  );
};

export default StateMasterForm;
