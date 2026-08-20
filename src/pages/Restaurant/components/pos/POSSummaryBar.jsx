import React from 'react';

const POSSummaryBar = ({ totalBill, discountAmt = 0, taxAmt = 0, originalBill, onSplitClick, showSplitButton = true }) => {
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
              {(() => {
                let percStr = '';
                if (originalBill > 0) {
                  const perc = (discountAmt / originalBill) * 100;
                  percStr = `(${perc % 1 === 0 ? perc.toFixed(0) : perc.toFixed(1)}%) `;
                }
                return `${percStr}− ₹${discountAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
              })()}
            </span>
          </div>
        </div>
      )}

      {/* Tax breakdown row — shown only when tax is active */}
      {(taxAmt > 0) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 20px',
          background: '#f8fafc',
          borderBottom: '1px dashed #cbd5e1'
        }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>
            GST / Taxes
          </span>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            color: '#0f172a'
          }}>
            + ₹{taxAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {/* Main total row */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '8px 14px',
      }}>
        {/* Right: Net Total Amount */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{
            fontSize: '0.75rem', fontWeight: 700,
            color: hasDiscount ? '#16a34a' : '#64748b',
            textTransform: 'uppercase'
          }}>
            {hasDiscount ? 'Net Total' : 'Total Amount'}
          </span>
          <strong style={{
            fontSize: '1.35rem', fontWeight: 900,
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
