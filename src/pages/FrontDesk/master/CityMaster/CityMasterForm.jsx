import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const CityMasterForm = ({ isOpen, mode, initialData, onSave, onClose }) => {
  const [form, setForm] = useState({ name: '', state: '', country: '' });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm({ name: '', state: '', country: '' });
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.state.trim() || !form.country.trim()) return;
    onSave(form);
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add City' : 'Edit City'}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-grid-2">
          {/* City Name */}
          <div className="form-field form-span-2">
            <label className="form-label">
              City Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter city name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="form-input"
            />
          </div>

          {/* State */}
          <div className="form-field">
            <label className="form-label">
              State <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter state"
              value={form.state}
              onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
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
        </div>

        <CommonActionButtons
          onCancel={onClose}
          saveText={mode === 'add' ? 'Save' : 'Update'}
        />
      </form>
    </CommonModal>
  );
};

export default CityMasterForm;
