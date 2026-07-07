import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import { useState } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';

const MarketSegmentForm = ({ isOpen, mode, initialData, onSave, onClose, existingRecords = [] }) => {
  const [form, setForm] = useState(() => ({
    name: initialData?.name || '',
    status: initialData?.status || 'Active'
  }));

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['name'],
    currentId: initialData?.id,
    mode
  });

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
      title={mode === 'add' ? 'Add Market Segment' : 'Edit Market Segment'}
    >
      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit}>
        <div className="form-grid-2">
          {/* Segment Name */}
          <div className="form-field form-span-2">
            <label className="form-label">
              Segment Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter segment name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="form-input"
            />
          </div>

          {/* Status */}
          <div className="form-field form-span-2">
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
          saveDisabled={isDuplicate}
        />
        <DuplicateModal />
      </form>
    </CommonModal>
  );
};

export default MarketSegmentForm;
