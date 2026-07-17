import React, { useState, useEffect } from 'react';
import { FaTimes, FaCommentAlt } from 'react-icons/fa';

const COMMON_REMARKS = ['Less Spicy', 'No Onion', 'Birthday Celebration', 'VIP Guest', 'Jain Food', 'Extra Sauce'];

const RemarksModal = ({ isOpen, onClose, remarks = '', onSaveRemarks }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setText(remarks || '');
    }
  }, [isOpen, remarks]);

  const handleSelectQuick = (tag) => {
    setText(prev => {
      const items = prev.split(',').map(i => i.trim()).filter(Boolean);
      if (items.includes(tag)) {
        return items.filter(i => i !== tag).join(', ');
      } else {
        return [...items, tag].join(', ');
      }
    });
  };

  const handleConfirm = () => {
    onSaveRemarks(text);
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
        background: '#fff', borderRadius: '12px', padding: '24px', width: '400px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0e7490', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCommentAlt /> Kitchen Remarks / Notes
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.1rem' }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Text Area input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
          <textarea
            autoFocus
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Add specific instructions (e.g. Extra hot, No cheese)..."
            style={{ width: '100%', height: '80px', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.8rem', resize: 'none' }}
          />

          {/* Quick options tags */}
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>Quick Selectors</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {COMMON_REMARKS.map(tag => {
                const isSelected = text.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleSelectQuick(tag)}
                    style={{
                      padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 700,
                      cursor: 'pointer', border: '1px solid #cbd5e1',
                      background: isSelected ? '#ecfeff' : '#f8fafc',
                      color: isSelected ? '#0e7490' : '#475569',
                      transition: 'all 0.15s'
                    }}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 16px', borderRadius: '6px' }}>
            Cancel
          </button>
          <button onClick={handleConfirm} className="btn-primary" style={{ padding: '8px 16px', borderRadius: '6px' }}>
            Save Remarks
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RemarksModal);
