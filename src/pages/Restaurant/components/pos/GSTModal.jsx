import React, { useState, useEffect } from 'react';
import { FaTimes, FaFileInvoice } from 'react-icons/fa';

const GSTModal = ({ isOpen, onClose, gstin = '', onSaveGSTIN }) => {
  const [val, setVal] = useState('');

  useEffect(() => {
    if (isOpen) {
      setVal(gstin || '');
    }
  }, [isOpen, gstin]);

  const handleConfirm = () => {
    onSaveGSTIN(val.toUpperCase());
    onClose();
  };

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
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0e7490', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaFileInvoice /> GST Configuration
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.1rem' }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Customer GSTIN</label>
          <input
            type="text"
            autoFocus
            maxLength="15"
            placeholder="e.g. 07AAAAA1111A1Z1"
            value={val}
            onChange={e => setVal(e.target.value.toUpperCase())}
            style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase' }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '6px' }}>
            Cancel
          </button>
          <button onClick={handleConfirm} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '6px' }}>
            Save GST
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(GSTModal);
