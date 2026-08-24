import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import posApi from '../../../../api/posApi';

const DeliveryMasterForm = ({ isOpen, onClose, onSave, initialData = {}, isEdit }) => {
  const [fields, setFields] = useState({ partner: 'Direct Delivery', name: '', phone: '', store_id: 'STORE_1', status: 'Active' });
  const [outlets, setOutlets] = useState([]);

  useEffect(() => {
    posApi.getOutlets().then(res => {
      const list = res?.data || res?.stores || [];
      setOutlets(list);
    }).catch(err => console.warn('Failed to fetch outlets in DeliveryMasterForm', err));
  }, []);

  useEffect(() => {
    const activeOutlet = localStorage.getItem('activeOutletId') || 'STORE_1';
    if (isOpen) {
      setFields(isEdit ? {
        partner: 'Direct Delivery',
        store_id: activeOutlet,
        ...initialData
      } : {
        partner: 'Direct Delivery',
        name: '',
        phone: '',
        store_id: activeOutlet,
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
              <label className="form-label">Outlet *</label>
              <select
                value={fields.store_id}
                onChange={(e) => setFields(p => ({ ...p, store_id: e.target.value }))}
                className="form-select"
                required
              >
                {outlets.length === 0 && <option value="STORE_1">Main Restaurant</option>}
                {outlets.map(o => (
                  <option key={o.store_id || o.id} value={o.store_id || o.id}>
                    {o.store_name || o.name || `Outlet ${o.id}`}
                  </option>
                ))}
              </select>
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
export { DeliveryMasterForm };
