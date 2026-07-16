import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const DeliveryMasterForm = ({ isOpen, onClose, onSave, initialData = {}, isEdit }) => {
  const [fields, setFields] = useState({ partner: '', name: '', phone: '', status: 'Active' });

  useEffect(() => {
    if (isOpen) {
      setFields(isEdit ? { ...initialData } : { partner: '', name: '', phone: '', status: 'Active' });
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
      title={isEdit ? 'Edit Delivery Partner' : 'Add Delivery Partner'}
    >
      <form onSubmit={handleSubmit}>
        <FormCard>
          <div className="form-grid-2">
            {/* <div className="form-field">
              <label className="form-label">Partner Name *</label>
              <input
                type="text"
                placeholder="e.g. Zomato, Swiggy, Direct"
                value={fields.partner || ''}
                onChange={(e) => setFields(p => ({ ...p, partner: e.target.value }))}
                className="form-input"
                required
              />
            </div> */}

            <div className="form-field">
              <label className="form-label">Name *</label>
              <input
                type="text"
                placeholder="Enter name"
                value={fields.name || ''}
                onChange={(e) => setFields(p => ({ ...p, name: e.target.value }))}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label">Phone Number *</label>
              <input
                type="text"
                placeholder="Enter 10-digit number"
                value={fields.phone || ''}
                maxLength={10}
                onChange={(e) => setFields(p => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
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

export default DeliveryMasterForm;
