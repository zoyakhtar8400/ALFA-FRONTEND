import React from 'react';

const POSSummaryBar = ({ totalBill, discountAmt = 0, originalBill, onSplitClick }) => {
  const hasDiscount = discountAmt > 0;

  return (
    <div style={{
      background: '#ffffff',
      borderTop: '2px solid #cbd5e1',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.03)',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Discount breakdown row — shown only when discount is active */}
      {hasDiscount && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 20px',
          background: '#f0fdf4',
          borderBottom: '1px dashed #bbf7d0'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#15803d' }}>
            Subtotal
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Original amount crossed-out */}
            <span style={{
              fontSize: '0.78rem',
              fontWeight: 700,
              color: '#94a3b8',
              textDecoration: 'line-through'
            }}>
              ₹{(originalBill || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            {/* Discount badge */}
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#16a34a',
              background: '#dcfce7',
              border: '1px solid #86efac',
              borderRadius: '20px',
              padding: '2px 8px'
            }}>
              − ₹{discountAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      )}

      {/* Main total row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '14px 20px',
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

        {/* Right: Net Total Amount */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{
            fontSize: '0.85rem', fontWeight: 700,
            color: hasDiscount ? '#16a34a' : '#64748b',
            textTransform: 'uppercase'
          }}>
            {hasDiscount ? 'Net Total' : 'Total Amount'}
          </span>
          <strong style={{
            fontSize: '1.6rem', fontWeight: 900,
            color: hasDiscount ? '#15803d' : '#0f172a',
            letterSpacing: '-0.5px'
          }}>
            ₹{(totalBill || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default React.memo(POSSummaryBar);
