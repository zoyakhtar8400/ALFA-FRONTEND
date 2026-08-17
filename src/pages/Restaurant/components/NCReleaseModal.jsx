import React from 'react';
import CommonModal from '../../../components/common/CommonModal';

const NCReleaseModal = ({ isOpen, onClose, table, onConfirm }) => {
  if (!table) return null;

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Clear NC Table"
      maxWidth="420px"
    >
      <div style={{ padding: '8px 4px', display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: 'system-ui' }}>
        <h4 style={{ margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: 800 }}>
          This table has a Non-Chargeable (NC) order. Do you want to clear it and make the table free?
        </h4>
        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, lineHeight: 1.4 }}>
          This will close the KOT. No bill or payment will be made.
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '6px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#475569',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            No, Keep Blocked
          </button>
          <button
            type="button"
            onClick={onConfirm}
            style={{
              padding: '8px 18px',
              borderRadius: '6px',
              border: 'none',
              background: '#a855f7',
              color: '#fff',
              fontSize: '12px',
              fontWeight: '800',
              cursor: 'pointer'
            }}
          >
            Yes, Clear Table
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default React.memo(NCReleaseModal);
