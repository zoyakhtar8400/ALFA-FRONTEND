import React from 'react';
import { FaMoneyBill, FaCreditCard, FaUserClock, FaWallet, FaEllipsisH } from 'react-icons/fa';

const PAYMENT_MODES = [
  { id: 'Cash', label: 'Cash', icon: FaMoneyBill },
  { id: 'Card', label: 'Card', icon: FaCreditCard },
  { id: 'Due', label: 'Due', icon: FaUserClock },
  { id: 'Other', label: 'Other', icon: FaWallet },
  { id: 'More', label: 'More', icon: FaEllipsisH }
];

const POSPaymentBar = ({ activeMode, onSelectMode, isPaid, onChangeIsPaid }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      padding: '12px 16px',
      background: '#f8fafc',
      borderTop: '1px solid #e2e8f0'
    }}>
      {/* Equal-Width Touch-friendly Payment Cards */}
      <div style={{
        display: 'flex',
        gap: '8px',
        width: '100%',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: '4px'
      }}>
        {PAYMENT_MODES.map(mode => {
          const isSelected = activeMode === mode.id;
          const Icon = mode.icon;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSelectMode(mode.id)}
              style={{
                flex: '1 0 auto',
                minWidth: '55px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 6px',
                borderRadius: '8px',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.12s',
                background: isSelected ? '#DCFCE7' : '#FFFFFF',
                border: isSelected ? '1.5px solid #22C55E' : '1px solid #E5E7EB',
                color: isSelected ? '#15803D' : '#475569'
              }}
            >
              <Icon size={16} />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Large-Click-Area It's Paid Checkbox */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '4px 0'
      }}>
        <label style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          padding: '10px 24px',
          borderRadius: '20px',
          background: isPaid ? '#DCFCE7' : '#f1f5f9',
          border: isPaid ? '1px solid #22C55E' : '1px solid #cbd5e1',
          color: isPaid ? '#15803D' : '#475569',
          fontWeight: 800,
          fontSize: '0.85rem',
          userSelect: 'none',
          transition: 'all 0.15s'
        }}>
          <input
            type="checkbox"
            checked={isPaid}
            onChange={e => onChangeIsPaid(e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer',
              accentColor: '#22C55E'
            }}
          />
          <span>☑ It's Paid</span>
        </label>
      </div>
    </div>
  );
};

export default React.memo(POSPaymentBar);
