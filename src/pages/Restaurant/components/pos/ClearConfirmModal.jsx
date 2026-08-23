import React, { useEffect } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ClearConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose?.();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm?.();
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-family, system-ui)'
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '24px', width: '360px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', textAlign: 'center'
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '1.5rem'
        }}>
          <FaExclamationTriangle />
        </div>

        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>
          Discard Draft Order?
        </h3>
        <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0 0 20px 0', lineHeight: '1.4' }}>
          This will clear all items in the current billing rows. This action is permanent and cannot be undone.
        </p>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>
            No, Keep Draft (Esc)
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: '8px 16px', borderRadius: '6px', background: '#ef4444', color: '#fff',
              border: 'none', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer'
            }}
          >
            Yes, Discard (↵)
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ClearConfirmModal);
