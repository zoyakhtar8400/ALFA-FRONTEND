import React from 'react';
import CommonModal from './CommonModal';
import { FaExclamationTriangle } from 'react-icons/fa';

const DuplicateConfirmationModal = ({ isOpen, onClose, onEditExisting, itemName }) => {
  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Duplicate Entry Alert"
      maxWidth="480px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px', padding: '10px 0' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(245, 158, 11, 0.1)',
          color: '#D97706',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px'
        }}>
          <FaExclamationTriangle />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--dark)' }}>
            Record Already Exists
          </h4>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            You saved the entry <strong>"{itemName}"</strong> previously. Would you like to edit the existing entry or cancel to choose a different name?
          </p>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          width: '100%',
          marginTop: '12px',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '16px'
        }}>
          <button
            type="button"
            onClick={onEditExisting}
            className="btn-primary"
            style={{
              flex: 1,
              height: '38px',
              fontSize: '0.78rem',
              fontWeight: 800,
              background: '#D97706',
              border: 'none',
              borderRadius: '8px',
              color: '#ffffff',
              cursor: 'pointer'
            }}
          >
            Edit the Same Entry
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              height: '38px',
              fontSize: '0.78rem',
              fontWeight: 800,
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default DuplicateConfirmationModal;
