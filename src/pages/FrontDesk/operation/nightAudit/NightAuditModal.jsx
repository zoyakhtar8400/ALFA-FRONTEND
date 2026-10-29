import React from 'react';
import NightAuditDashboard from './NightAuditDashboard';

export const NightAuditModal = ({ isOpen, onClose, showToast }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        style={{
          backgroundColor: '#f8fafc',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '1240px',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #cbd5e1',
          overflow: 'hidden'
        }}
      >
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          <NightAuditDashboard
            isModal={true}
            onClose={onClose}
            showToast={showToast}
          />
        </div>
      </div>
    </div>
  );
};

export default NightAuditModal;
