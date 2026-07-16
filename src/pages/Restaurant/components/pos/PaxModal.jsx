import React, { useState, useEffect } from 'react';
import { FaTimes, FaUsers } from 'react-icons/fa';

const PaxModal = ({ isOpen, onClose, adults = 1, children = 0, onSavePax }) => {
  const [adultsCount, setAdultsCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setAdultsCount(parseInt(adults) || 1);
      setChildrenCount(parseInt(children) || 0);
    }
  }, [isOpen, adults, children]);

  const handleConfirm = () => {
    onSavePax(adultsCount, childrenCount);
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
        background: '#fff', borderRadius: '12px', padding: '24px', width: '380px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0e7490', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaUsers /> PAX Configurator
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.1rem' }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Body Counter Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Adults</label>
            <input
              type="number"
              value={adultsCount}
              onChange={e => setAdultsCount(Math.max(0, parseInt(e.target.value) || 0))}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}
              min="0"
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>Children</label>
            <input
              type="number"
              value={childrenCount}
              onChange={e => setChildrenCount(Math.max(0, parseInt(e.target.value) || 0))}
              style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700 }}
              min="0"
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '6px' }}>
            Cancel
          </button>
          <button onClick={handleConfirm} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '6px' }}>
            Save PAX
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PaxModal);
