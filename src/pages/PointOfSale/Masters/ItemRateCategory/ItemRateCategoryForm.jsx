import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const ItemRateCategoryForm = ({ isOpen, onClose, onSave, initialData = {}, isEdit }) => {
  const [fields, setFields] = useState({ name: '', activeDays: 'All Days', multiplier: '1.0', status: 'Active' });

  useEffect(() => {
    if (isOpen) {
      setFields(isEdit ? { ...initialData } : { name: '', activeDays: 'All Days', multiplier: '1.0', status: 'Active' });
    }
  }, [isOpen, isEdit, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(fields);
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Rate Category' : 'Add Rate Category'}
    >
      <form onSubmit={handleSubmit}>
        <FormCard>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label">Rate Category Name *</label>
              <input
                type="text"
                placeholder="e.g. Happy Hours (20% Off)"
                value={fields.name || ''}
                onChange={(e) => setFields(p => ({ ...p, name: e.target.value }))}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-field">
              <label className="form-label">Active Days / Hours *</label>
              <input
                type="text"
                placeholder="e.g. Mon-Thu (4pm-8pm)"
                value={fields.activeDays || ''}
                onChange={(e) => setFields(p => ({ ...p, activeDays: e.target.value }))}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label">Rate Multiplier *</label>
              <input
                type="text"
                placeholder="e.g. 1.0 or 0.8"
                value={fields.multiplier || ''}
                onChange={(e) => setFields(p => ({ ...p, multiplier: e.target.value }))}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label">Status</label>
              <select
                value={fields.status || 'Active'}
                onChange={(e) => setFields(p => ({ ...p, status: e.target.value }))}
                className="form-select"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </FormCard>

        <div className="mt-4">
          <CommonActionButtons
            onCancel={onClose}
            saveText={isEdit ? 'Update' : 'Save'}
          />
        </div>
      </form>
    </CommonModal>
  );
};

export default ItemRateCategoryForm;
