import React, { useState } from 'react';
import CommonModal from './CommonModal';
import { FaExclamationTriangle } from 'react-icons/fa';

/**
 * DeleteConfirmationModal component that provides a beautiful, red-themed warning and confirm/cancel options.
 * Uses CommonModal underneath to ensure identical layout, padding and blur effects.
 * Optimized with simulated loading and dynamic button states.
 */
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName = 'this item', message }) => {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleConfirmClick = (e) => {
    setDeleteLoading(true);
    if (window.showToast) {
      window.showToast("Deleting...");
    }
    setTimeout(() => {
      onConfirm(e);
      setDeleteLoading(false);
      if (window.showToast) {
        window.showToast("Deleted Successfully");
      }
    }, 500);
  };

  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title="Confirm Delete" maxWidth="440px">
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500">
          <FaExclamationTriangle size={24} />
        </div>
        <div className="flex flex-col gap-1.5">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Delete Permanently?</h4>
          <p className="text-sm text-slate-500 leading-relaxed px-2">
            {message || `Are you sure you want to delete "${itemName}"? This action cannot be undone.`}
          </p>
        </div>
        
        <div className="flex justify-center gap-3 w-full mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteLoading}
            className="flex-1 cursor-pointer rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={deleteLoading}
            className="flex-1 cursor-pointer rounded-full bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {deleteLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            <span>{deleteLoading ? "Deleting..." : "Delete"}</span>
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default DeleteConfirmationModal;
