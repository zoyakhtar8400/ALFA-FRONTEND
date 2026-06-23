import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave(form);
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add Room Feature' : 'Edit Room Feature'}
    >
      <form onSubmit={handleSubmit}>
        <div className="form-grid-2">
          {/* Feature Name */}
          <div className="form-field">
            <label className="form-label">
              Feature Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter feature name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="form-input"
            />
          </div>

          {/* Active */}
          <div className="form-field">
            <label className="form-label">Active</label>
            <select
              value={form.active}
              onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.value }))}
              className="form-select"
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
    </CommonModal>
  );
};

export default RoomFeatureForm;
