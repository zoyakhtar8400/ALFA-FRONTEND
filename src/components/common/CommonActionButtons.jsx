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
    <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-5">
      {/* Cancel Button */}
      <button
        type="button"
        onClick={onCancel}
        className="min-w-[120px] cursor-pointer rounded-full border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-600 transition-all duration-200 hover:border-gray-400 hover:bg-gray-100"
      >
        {cancelText}
      </button>

      {/* Save & New Button */}
      {showSaveAndNew && (
        <button
          type="button"
          onClick={onSaveAndNew}
          className="min-w-[130px] cursor-pointer rounded-full bg-[#4a9993] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#3d8782] hover:shadow-md"
        >
          Save & New
        </button>
      )}

      {/* Save Button */}
      <button
        type="submit"
        onClick={onSave}
        disabled={loading}
        className="min-w-[120px] cursor-pointer rounded-full bg-[#418a8b] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#357273] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Saving..." : saveText}
      </button>
    </div>
  );
};

export default CommonActionButtons;