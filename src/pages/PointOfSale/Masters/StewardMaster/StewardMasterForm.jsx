import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';
import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';

const StewardMasterForm = ({
  isOpen,
  mode,
  initialData,
  onSave,
  onClose,
  existingRecords = []
}) => {
  const [form, setForm] = useState({ name: '', active: 'Yes' });

  // HMS Duplicate validation helper
  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['name'],
    currentId: initialData?.id,
    mode
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        active: initialData.active || 'Yes'
      });
    } else {
      setForm({ name: '', active: 'Yes' });
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!checkBeforeSave()) return;
    
    // Pass updated form data back to page action
    onSave(form);
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Add Steward Master' : 'Edit Steward Master'}
    >
      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit}>
        <FormCard>
          <div className="form-grid-2">
            {/* Steward Name Input */}
            <div className="form-field">
              <label className="form-label">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter steward name"
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                required
                minLength={2}
                maxLength={50}
                className="form-input"
              />
            </div>

            {/* Active Status Select */}
            <div className="form-field">
              <label className="form-label">Active Status</label>
              <select
                value={form.active}
                onChange={(e) => setForm(prev => ({ ...prev, active: e.target.value }))}
                className="form-select"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </FormCard>

        {/* Footer Actions */}
        <div className="mt-4">
          <CommonActionButtons
            onCancel={onClose}
            saveText={mode === 'add' ? 'Save' : 'Update'}
            saveDisabled={isDuplicate}
          />
        </div>
        <DuplicateModal />
      </form>
    </CommonModal>
  );
};

export default StewardMasterForm;
