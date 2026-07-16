import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../../components/common/CommonModal';
import FormCard from '../../../../../components/common/FormCard';
import CommonActionButtons from '../../../../../components/common/CommonActionButtons';

const MainGroupForm = ({ isOpen, onClose, onSave, initialData = {}, isEdit }) => {
  const [fields, setFields] = useState({ name: '' });

  useEffect(() => {
    if (isOpen) {
      setFields(isEdit ? { ...initialData } : { name: '' });
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
      title={isEdit ? 'Edit Main Group' : 'Add Main Group'}
    >
      <form onSubmit={handleSubmit}>
        <FormCard>
          <div className="form-grid-1">
            <div className="form-field">
              <label className="form-label">Main Group Name *</label>
              <input
                type="text"
                placeholder="e.g. Food, Banquet Food"
                value={fields.name || ''}
                onChange={(e) => setFields(p => ({ ...p, name: e.target.value }))}
                className="form-input"
                required
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

export default MainGroupForm;
