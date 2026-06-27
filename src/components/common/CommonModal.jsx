import React from 'react';
import { FaTimes } from 'react-icons/fa';

/**
 * CommonModal component for consistent popup/dialog behavior.
 * Uses a backdrop blur effect and animated entrance.
 */
const CommonModal = ({ isOpen, onClose, title, children, maxWidth = '640px', lessPadding = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
         className={`modal-container ${lessPadding ? 'less-padding' : ''}`}
        style={{ maxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">
            {title}
          </h3>
          <button onClick={onClose} className="modal-close-btn">
            <FaTimes size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body overflow-y-auto max-h-[70vh] pr-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CommonModal;
