import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const VehicleMasterForm = ({ isOpen, mode, initialData, onSave, onClose }) => {
  const [form, setForm] = useState({ regNo: '', type: 'Sedan', driver: '', mobile: '', model: '', status: 'Active' });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm({ regNo: '', type: 'Sedan', driver: '', mobile: '', model: '', status: 'Active' });
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.regNo.trim() || !form.driver.trim()) return;
    onSave(form);
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add Vehicle' : 'Edit Vehicle'}
    >
      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit}>
        <div className="form-grid-2">
          {/* Registration No */}
          <div className="form-field">
            <label className="form-label">
              Registration No <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="NY-AX-1234"
              value={form.regNo}
              onChange={(e) => setForm((prev) => ({ ...prev, regNo: e.target.value }))}
              required
              className="form-input"
            />
          </div>

          {/* Vehicle Type */}
          <div className="form-field">
            <label className="form-label">Vehicle Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              className="form-select"
            >
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Mini Van">Mini Van</option>
              <option value="Bus">Bus</option>
            </select>
          </div>

          {/* Driver Name */}
          <div className="form-field">
            <label className="form-label">
              Driver Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter driver name"
              value={form.driver}
              onChange={(e) => setForm((prev) => ({ ...prev, driver: e.target.value }))}
              required
              className="form-input"
            />
          </div>

          {/* Mobile */}
          <div className="form-field">
            <label className="form-label">Mobile</label>
            <input
              type="text"
              placeholder="+1 555-0000"
              value={form.mobile}
              onChange={(e) => setForm((prev) => ({ ...prev, mobile: e.target.value }))}
              className="form-input"
            />
          </div>

          {/* Model */}
          <div className="form-field">
            <label className="form-label">Model</label>
            <input
              type="text"
              placeholder="Enter model"
              value={form.model}
              onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
              className="form-input"
            />
          </div>

          {/* Status */}
          <div className="form-field">
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

export default VehicleMasterForm;
