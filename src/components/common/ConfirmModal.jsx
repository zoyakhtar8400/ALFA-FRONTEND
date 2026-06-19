import React from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title = 'Confirm Delete', message }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.45)'
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: '14px', padding: '28px',
        width: '100%', maxWidth: '420px', boxShadow: 'var(--shadow)'
      }}>
        <h3 style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--dark)', marginBottom: '10px' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          {message || 'Are you sure you want to delete this record? This action cannot be undone.'}
        </p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 22px', borderRadius: '30px', border: '1px solid var(--border)',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', backgroundColor: '#fff',
              color: 'var(--text-secondary)'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '9px 22px', borderRadius: '30px', border: 'none',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              backgroundColor: 'var(--danger)', color: '#fff'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
