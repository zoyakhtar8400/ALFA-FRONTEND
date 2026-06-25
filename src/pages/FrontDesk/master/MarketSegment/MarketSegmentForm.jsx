import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const MarketSegmentForm = ({ isOpen, mode, initialData, onSave, onClose }) => {
  const [form, setForm] = useState({ name: '', status: 'Active' });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({ name: '', status: 'Active' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add Market Segment' : 'Edit Market Segment'}
    >
      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit}>
        <div className="form-grid-2">
          {/* Segment Name */}
          <div className="form-field form-span-2">
            <label className="form-label">
              Segment Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter segment name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="form-input"
            />
          </div>

          {/* Status */}
          <div className="form-field form-span-2">
            <label className="form-label">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              className="form-select"
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
    </CommonModal>
  );
};

export default MarketSegmentForm;
