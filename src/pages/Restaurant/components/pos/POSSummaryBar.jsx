import React from 'react';

const POSSummaryBar = ({ totalBill, onSplitClick }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '14px 20px',
      background: '#ffffff',
      borderTop: '2px solid #cbd5e1',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.03)',
      position: 'sticky',
      bottom: 0,
      zIndex: 10
    }}>
      {/* Left: Split button */}
      <button
        type="button"
        onClick={onSplitClick}
        style={{
          padding: '8px 16px',
          borderRadius: '6px',
          background: '#f1f5f9',
          border: '1px solid #cbd5e1',
          color: '#475569',
          fontWeight: 800,
          fontSize: '0.78rem',
          cursor: 'pointer',
          transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
        onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
      >
        Split Bill
      </button>

      {/* Right: Total Amount */}
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '6px'
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Amount</span>
        <strong style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
          ₹{(totalBill || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </strong>
      </div>
    </div>
  );
};

export default React.memo(POSSummaryBar);
