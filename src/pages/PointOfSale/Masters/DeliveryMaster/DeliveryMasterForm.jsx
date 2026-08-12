import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const DeliveryMasterForm = ({ isOpen, onClose, onSave, initialData = {}, isEdit }) => {
  const [fields, setFields] = useState({ partner: 'Direct Delivery', name: '', phone: '', status: 'Active' });

  useEffect(() => {
    if (isOpen) {
      setFields(isEdit ? {
        partner: 'Direct Delivery',
        ...initialData
      } : {
        partner: 'Direct Delivery',
        name: '',
        phone: '',
        status: 'Active'
      });
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
            <div className="form-field">
              <label className="form-label">Partner / Aggregator *</label>
              <select
                value={fields.partner || 'Direct Delivery'}
                onChange={(e) => setFields(p => ({ ...p, partner: e.target.value }))}
                className="form-select"
                required
              >
                <option value="Direct Delivery">Direct Delivery</option>
                <option value="Swiggy">Swiggy</option>
                <option value="Zomato">Zomato</option>
                <option value="UberEats">UberEats</option>
                <option value="Dunzo">Dunzo</option>
                <option value="Other Aggregator">Other Aggregator</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Delivery Staff Name *</label>
              <input
                type="text"
                placeholder="Enter staff name"
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
