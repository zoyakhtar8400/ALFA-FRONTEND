import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import React, { useState, useEffect } from "react";
import CommonModal from "../../../../components/common/CommonModal";
import CommonActionButtons from "../../../../components/common/CommonActionButtons";
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';

const TaxStructureForm = ({ isOpen, mode, initialData, onSave, onClose, existingRecords = [] }) => {
  const [form, setForm] = useState({
    name: "",
    applicableDate: "",
    active: "Yes",
    type: "%",
  });

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
        ...initialData,
        type: initialData.type || "%",
      });
    } else {
      setForm({
        name: "",
        applicableDate: "",
        active: "Yes",
        type: "%",
      });
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
      title={mode === "add" ? "Add Tax Structure" : "Edit Tax Structure"}
    >
      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit}>
        <div className="form-grid-2">
          {/* Name */}
          <div className="form-field form-span-2">
            <label className="form-label">
              Tax Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter tax name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              className="form-input"
            />
          </div>

          {/* Applicable Date */}
          <div className="form-field">
            <label className="form-label">
              Applicable Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={form.applicableDate}
              onChange={(e) => setForm((prev) => ({ ...prev, applicableDate: e.target.value }))}
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

          {/* Type */}
          <div className="form-field form-span-2">
            <label className="form-label">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              className="form-select"
            >
              <option value="%">Percentage (%)</option>
              <option value="Slab">Slab</option>
            </select>
          </div>
        </div>

        <CommonActionButtons
          onCancel={onClose}
          saveText={mode === "add" ? "Save" : "Update"}
          saveDisabled={isDuplicate}
        />
        <DuplicateModal />
      </form>
    </CommonModal>
  );
};

export default TaxStructureForm;