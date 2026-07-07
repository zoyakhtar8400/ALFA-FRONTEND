import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';

const BusinessMasterForm = ({ isOpen, mode, initialData, onSave, onClose, existingRecords = [] }) => {
  const [form, setForm] = useState({ code: '', name: '', type: 'Digital' });

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['name'],
    currentId: initialData?.id,
    mode
  });

  useEffect(() => {
    if (initialData) setForm(initialData);
    else setForm({ code: '', name: '', type: 'Digital' });
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) return;
    if (!checkBeforeSave()) return;
    onSave(form);
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add Business Source' : 'Edit Business Source'}
    >
      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit}>
        <div className="form-grid-2">
          {/* Business Code */}
          <div className="form-field">
            <label className="form-label">
              Business Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter code"
              value={form.code}
              onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
              required
              className="form-input"
            />
          </div>

          {/* Type */}
          <div className="form-field">
            <label className="form-label">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              className="form-select"
            >
              <option value="Digital">Digital</option>
              <option value="Direct">Direct</option>
              <option value="B2B">B2B</option>
              <option value="Commission">Commission</option>
            </select>
          </div>

          {/* Business Name */}
          <div className="form-field form-span-2">
            <label className="form-label">
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="form-input"
            />
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

export default BusinessMasterForm;
