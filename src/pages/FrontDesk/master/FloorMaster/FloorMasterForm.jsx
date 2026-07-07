import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';

const FloorMasterForm = ({ isOpen, mode, initialData, onSave, onClose, existingRecords = [] }) => {
  const [form, setForm] = useState({ name: '', active: 'Yes' });

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['name'],
    currentId: initialData?.id,
    mode
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({ name: '', active: 'Yes' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!checkBeforeSave()) return;
    onSave(form);
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add Floor' : 'Edit Floor'}
    >
      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit}>
        <div className="form-grid-2">
          {/* Floor Name */}
          <div className="form-field">
            <label className="form-label">
              Floor Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter floor name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="form-input"
            />
          </div>

          {/* Active */}
          <div className="form-field">
            <label className="form-label">Active</label>
            <select
              value={form.active}
              onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.value }))}
              className="form-select"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>

        <CommonActionButtons
          onCancel={onClose}
          saveText={mode === 'add' ? 'Save' : 'Update'}
          saveDisabled={isDuplicate}
        />
        <DuplicateModal />
      </form>
    </CommonModal>
  );
};

export default FloorMasterForm;
