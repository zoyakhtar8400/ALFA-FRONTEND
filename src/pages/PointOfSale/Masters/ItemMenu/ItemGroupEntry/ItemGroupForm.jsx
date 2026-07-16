import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../../components/common/CommonModal';
import FormCard from '../../../../../components/common/FormCard';
import CommonActionButtons from '../../../../../components/common/CommonActionButtons';

const ItemGroupForm = ({ isOpen, onClose, onSave, initialData = {}, isEdit, mainGroups = [] }) => {
  const [fields, setFields] = useState({ name: '', mainGroup: '', code: '' });

  // Use mainGroups dynamically, or fallback to the standard ones
  const groupsList = mainGroups.length > 0 ? mainGroups : [{ name: 'Food' }, { name: 'Banquet Food' }];

  useEffect(() => {
    if (isOpen) {
      setFields(isEdit ? {
        name: '',
        mainGroup: '',
        code: '',
        ...initialData
      } : {
        name: '',
        mainGroup: groupsList[0]?.name || '',
        code: ''
      });
    }
  }, [isOpen, isEdit, initialData, mainGroups]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(fields);
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Item Group' : 'Add Item Group'}
    >
      <form onSubmit={handleSubmit}>
        <FormCard>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label">Main Group *</label>
              <select
                value={fields.mainGroup || ''}
                onChange={(e) => setFields(p => ({ ...p, mainGroup: e.target.value }))}
                className="form-select"
                required
              >
                {groupsList.map((g, idx) => (
                  <option key={idx} value={g.name}>{g.name}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Item Group *</label>
              <input
                type="text"
                placeholder="e.g. Indian Starter"
                value={fields.name || ''}
                onChange={(e) => setFields(p => ({ ...p, name: e.target.value }))}
                className="form-input"
                required
              />
            </div>

            <div className="form-field form-span-2">
              <label className="form-label">HSN/SAC Code *</label>
              <input
                type="text"
                placeholder="e.g. 2106"
                value={fields.code || ''}
                onChange={(e) => setFields(p => ({ ...p, code: e.target.value }))}
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

export default ItemGroupForm;
