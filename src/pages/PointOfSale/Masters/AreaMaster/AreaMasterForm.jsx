import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';

const AreaMasterForm = ({ isOpen, onClose, onSave, initialData = {}, isEdit }) => {
  const [fields, setFields] = useState({
    name: '',
    description: '',
    active: 'Yes',
    isActive: true
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData && Object.keys(initialData).length > 0) {
        setFields({
          name: initialData.name || '',
          description: initialData.description || '',
          active: initialData.active || (initialData.isActive !== false ? 'Yes' : 'No'),
          isActive: initialData.active !== 'No' && initialData.isActive !== false,
          ...initialData
        });
      } else {
        setFields({
          name: '',
          description: '',
          active: 'Yes',
          isActive: true
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fields.name.trim()) return;
    onSave({
      ...fields,
      active: fields.isActive ? 'Yes' : 'No'
    });
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Area' : 'Add Area'}
    >
      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit}>
        <FormCard>
          <div className="form-grid-2">
            {/* Area Name */}
            <div className="form-field">
              <label className="form-label">
                Area Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Main Dining Hall, AC Hall, Garden, Balcony"
                value={fields.name || ''}
                onChange={(e) => setFields((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="form-input"
                autoFocus
              />
            </div>

            {/* Active Status */}
            <div className="form-field">
              <label className="form-label">Active</label>
              <select
                value={fields.active || (fields.isActive ? 'Yes' : 'No')}
                onChange={(e) => {
                  const val = e.target.value;
                  setFields((prev) => ({
                    ...prev,
                    active: val,
                    isActive: val === 'Yes'
                  }));
                }}
                className="form-select"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Description */}
            <div className="form-field form-span-2">
              <label className="form-label">Description</label>
              <textarea
                rows={2}
                placeholder="Optional notes or details about this area"
                value={fields.description || ''}
                onChange={(e) => setFields((prev) => ({ ...prev, description: e.target.value }))}
                className="form-input"
                style={{ resize: 'vertical' }}
              />
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

export default AreaMasterForm;
