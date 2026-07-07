import { useState } from 'react';
import CommonModal from './CommonModal';
import { FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

/**
 * Generic ConfirmationDialog for all operational confirmations (e.g., checkout, delete, night audit, cancel reservation).
 * Maps colors and icons semantically to support Yes/No or Confirm/Cancel patterns.
 */
const ConfirmationDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Are you sure?', 
  message = 'Please confirm this action.', 
  confirmText = 'Yes', 
  cancelText = 'No',
  type = 'warning', // 'warning', 'danger', 'info'
  isLoadingText = 'Processing...'
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (e) => {
    setLoading(true);
    try {
      await onConfirm(e);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const colorStyles = {
    danger: {
      bg: 'bg-red-50 text-red-500',
      btn: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-500'
    },
    warning: {
      bg: 'bg-amber-50 text-amber-500',
      btn: 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500'
    },
    info: {
      bg: 'bg-cyan-50 text-[#418a8b]',
      btn: 'bg-[#418a8b] hover:bg-[#357273] text-white focus:ring-[#418a8b]'
    }
  };

  const style = colorStyles[type] || colorStyles.warning;

  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title={title} maxWidth="440px">
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center ${style.bg}`}>
          {type === 'info' ? <FaInfoCircle size={24} /> : <FaExclamationTriangle size={24} />}
        </div>
        
        <div className="flex flex-col gap-1.5">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">{title}</h4>
          <p className="text-sm text-slate-500 leading-relaxed px-2">
            {message}
          </p>
        </div>

        <div className="flex justify-center gap-3 w-full mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 cursor-pointer rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${style.btn}`}
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            )}
            <span>{loading ? isLoadingText : confirmText}</span>
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default ConfirmationDialog;
