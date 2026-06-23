// src/components/common/CommonActionButtons.jsx
import React from "react";

const CommonActionButtons = ({
  onSave,
  onCancel,
  saveText = "Save",
  cancelText = "Cancel",
  loading = false,
  showSaveAndNew = false,
  onSaveAndNew,
}) => {
  return (
    <div className="form-footer">
      {/* Cancel Button */}
      <button
        type="button"
        onClick={onCancel}
        className="btn-secondary"
      >
        {cancelText}
      </button>

      {/* Save & New Button */}
      {showSaveAndNew && (
        <button
          type="button"
          onClick={onSaveAndNew}
          className="btn-secondary"
          style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
        >
          Save & New
        </button>
      )}

      {/* Save Button */}
      <button
        type="submit"
        onClick={onSave}
        disabled={loading}
        className="btn-primary"
      >
        {loading ? "Saving..." : saveText}
      </button>
    </div>
  );
};

export default CommonActionButtons;