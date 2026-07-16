import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const TableMasterForm = ({ isOpen, onClose, onSave, initialData = {}, isEdit }) => {
  const [fields, setFields] = useState({
    department: '',
    name: '',
    pax: '4',
    floor: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    if (isOpen) {
      setFields(isEdit ? {
        department: '',
        name: '',
        pax: '4',
        floor: '',
        description: '',
        isActive: true,
        ...initialData
      } : {
        department: '',
        name: '',
        pax: '4',
        floor: '',
        description: '',
        isActive: true
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
      title={isEdit ? 'Edit Table' : 'Add Table'}
    >
      <form onSubmit={handleSubmit}>
        <FormCard>
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label">Department *</label>
              <select
                value={fields.department || ''}
                onChange={(e) => setFields(p => ({ ...p, department: e.target.value }))}
                className="form-select"
                required
              >
                <option value="">--Select Department--</option>
                <option value="Restaurant">Restaurant</option>
                <option value="Bar">Bar</option>
                <option value="Room Service">Room Service</option>
                <option value="Banquets">Banquets</option>
                <option value="Cafe">Cafe</option>
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Table Name *</label>
              <input
                type="text"
                placeholder="e.g. Table 01, T10A"
                value={fields.name || ''}
                onChange={(e) => setFields(p => ({ ...p, name: e.target.value }))}
                className="form-input"
                required
              />
            </div>
            
            <div className="form-field">
              <label className="form-label">PAX *</label>
              <input
                type="number"
                placeholder="Enter seating capacity"
                value={fields.pax !== undefined ? fields.pax : ''}
                onChange={(e) => setFields(p => ({ ...p, pax: e.target.value }))}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label">Floor Name</label>
              <select
                value={fields.floor || ''}
                onChange={(e) => setFields(p => ({ ...p, floor: e.target.value }))}
                className="form-select"
              >
                <option value="">--Floor Name--</option>
                <option value="Ground Floor">Ground Floor</option>
                <option value="First Floor">First Floor</option>
                <option value="Second Floor">Second Floor</option>
                <option value="Balcony">Balcony</option>
                <option value="Garden">Garden</option>
              </select>
            </div>

            <div className="form-field form-span-2">
              <label className="form-label">Description</label>
              <input
                type="text"
                placeholder="Enter table description"
                value={fields.description || ''}
                onChange={(e) => setFields(p => ({ ...p, description: e.target.value }))}
                className="form-input"
              />
            </div>

            <div className="form-field form-span-2 flex flex-row items-center gap-2 mt-2">
              <input
                type="checkbox"
                id="isActive"
                checked={fields.isActive === true}
                onChange={(e) => setFields(p => ({ ...p, isActive: e.target.checked }))}
                className="w-4 h-4 text-[#418a8b] border-slate-300 rounded focus:ring-[#418a8b]"
              />
              <label htmlFor="isActive" className="form-label cursor-pointer select-none mb-0 pt-0.5">
                Active (YES)
              </label>
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

export default TableMasterForm;
