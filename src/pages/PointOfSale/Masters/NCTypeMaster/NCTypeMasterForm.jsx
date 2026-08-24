import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import posApi from '../../../../api/posApi';

const NCTypeMasterForm = ({ isOpen, onClose, onSave, initialData = {}, isEdit }) => {
  const [fields, setFields] = useState({ name: '', store_id: 'STORE_1', status: 'Active' });
  const [outlets, setOutlets] = useState([]);

  useEffect(() => {
    posApi.getOutlets().then(res => {
      const list = res?.data || res?.stores || [];
      setOutlets(list);
    }).catch(err => console.warn('Failed to fetch outlets in NCTypeMasterForm', err));
  }, []);

  useEffect(() => {
    const activeOutlet = localStorage.getItem('activeOutletId') || 'STORE_1';
    if (isOpen) {
      setFields(isEdit ? {
        store_id: activeOutlet,
        ...initialData
      } : {
        name: '',
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
      title={isEdit ? 'Edit NC Type' : 'Add NC Type'}
    >
      <form onSubmit={handleSubmit}>
        <FormCard>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label">NC Type *</label>
              <input
                type="text"
                placeholder="e.g. VIP Guest Relations"
                value={fields.name || ''}
                onChange={(e) => setFields(p => ({ ...p, name: e.target.value }))}
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
              <label className="form-label">Active *</label>
              <select
                value={fields.status || 'Active'}
                onChange={(e) => setFields(p => ({ ...p, status: e.target.value }))}
                className="form-select"
                required
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

export default NCTypeMasterForm;
export { NCTypeMasterForm };
