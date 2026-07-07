// src/components/common/CommonActionButtons.jsx
import React, { useState } from "react";

const CommonActionButtons = ({
  onSave,
  onCancel,
  saveText = "Save",
  cancelText = "Cancel",
  loading = false,
  showSaveAndNew = false,
  onSaveAndNew,
  saveDisabled = false,
}) => {
  const [localLoading, setLocalLoading] = useState(false);

  const getLoadingText = () => {
    if (saveText === "Save") return "Saving...";
    if (saveText === "Update") return "Updating...";
    if (saveText === "Submit") return "Submitting...";
    if (saveText === "Print") return "Printing...";
    if (saveText === "Delete") return "Deleting...";
    return `${saveText}...`;
  };

  const handleSaveClick = (e) => {
    const button = e.currentTarget;
    const form = button.closest("form");
    
    // Check form validity before loading to prevent stuck states on validation errors
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Prevent default form submission to handle simulated delay first
    e.preventDefault();
    setLocalLoading(true);

    if (window.showToast) {
      window.showToast("Loading...");
    }

    setTimeout(() => {
      if (onSave) {
        onSave(e);
      } else if (form) {
        form.requestSubmit();
      }
      setLocalLoading(false);
      if (window.showToast) {
        const successMsg = saveText === "Save" ? "Saved Successfully" :
                           saveText === "Update" ? "Updated Successfully" :
                           saveText === "Submit" ? "Submitted Successfully" : "Completed Successfully";
        window.showToast(successMsg);
      }
    }, 500);
  };

  const isSaveLoading = loading || localLoading;

  return (
    <div className="form-footer">
      {/* Cancel Button */}
      <button
        type="button"
        onClick={onCancel}
        disabled={isSaveLoading}
        className="btn-secondary"
      >
        {cancelText}
      </button>

      {/* Save & New Button */}
      {showSaveAndNew && (
        <button
          type="button"
          onClick={onSaveAndNew}
          disabled={isSaveLoading || saveDisabled}
          className="btn-secondary"
          style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
        >
          Save & New
        </button>
      )}

      {/* Save Button */}
      <button
        type="submit"
        onClick={handleSaveClick}
        disabled={isSaveLoading || saveDisabled}
        className={`btn-primary flex items-center justify-center gap-2 ${saveDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
      >
        {isSaveLoading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        )}
        <span>{isSaveLoading ? getLoadingText() : saveText}</span>
      </button>
    </div>
  );
};

export default CommonActionButtons;