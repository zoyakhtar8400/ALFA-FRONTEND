import React, { useState } from 'react';
import {
  FaMoneyBill,
  FaCreditCard,
  FaQrcode,
  FaWallet,
  FaEllipsisH,
  FaUserClock,
  FaGift,
  FaMoneyCheckAlt,
  FaGlobe,
  FaBed
} from 'react-icons/fa';

const PRIMARY_PAYMENT_MODES = [
  { id: 'Cash', label: 'Cash', icon: FaMoneyBill },
  { id: 'Card', label: 'Card', icon: FaCreditCard },
  { id: 'UPI', label: 'UPI', icon: FaQrcode },
  { id: 'Other', label: 'Other', icon: FaWallet }
];

const MORE_PAYMENT_MODES = [
  { id: 'Due', label: 'Due / Credit', icon: FaUserClock },
  { id: 'Complimentary', label: 'Complimentary', icon: FaGift },
  { id: 'Cheque', label: 'Cheque', icon: FaMoneyCheckAlt },
  { id: 'Online', label: 'Online / Gateway', icon: FaGlobe },
  { id: 'Room Post', label: 'Post to Room', icon: FaBed }
];

const POSPaymentBar = ({ activeMode, onSelectMode, isPaid, onChangeIsPaid }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const isMoreActive = MORE_PAYMENT_MODES.some(m => m.id === activeMode) || activeMode === 'More';
  const selectedMoreItem = MORE_PAYMENT_MODES.find(m => m.id === activeMode);

  const handleSelectMore = (id) => {
    onSelectMode(id);
    setShowMoreMenu(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      padding: '8px 12px',
      background: '#f8fafc',
      borderTop: '1px solid #e2e8f0',
      position: 'relative'
    }}>
      {/* Top Row: Primary Payment Buttons (Cash, Card, UPI, Other, More) + Paid Pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '6px',
          flex: 1
        }}>
          {PRIMARY_PAYMENT_MODES.map(mode => {
            const isSelected = activeMode === mode.id;
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  setShowMoreMenu(false);
                  onSelectMode(mode.id);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '6px 8px',
                  height: '38px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: isSelected ? '#DCFCE7' : '#FFFFFF',
                  border: isSelected ? '1.5px solid #22C55E' : '1px solid #CBD5E1',
                  color: isSelected ? '#15803D' : '#334155',
                  boxShadow: isSelected ? '0 2px 6px rgba(34, 197, 94, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.04)',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.borderColor = '#94a3b8';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#CBD5E1';
                  }
                }}
              >
                <Icon size={14} style={{ color: isSelected ? '#15803D' : '#64748b' }} />
                <span>{mode.label}</span>
              </button>
            );
          })}

          {/* More Options Button */}
          <button
            type="button"
            onClick={() => setShowMoreMenu(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '6px 8px',
              height: '38px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: isMoreActive ? '#DCFCE7' : (showMoreMenu ? '#e2e8f0' : '#FFFFFF'),
              border: isMoreActive ? '1.5px solid #22C55E' : '1.5px dashed #94a3b8',
              color: isMoreActive ? '#15803D' : '#334155',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={e => {
              if (!isMoreActive && !showMoreMenu) {
                e.currentTarget.style.background = '#f1f5f9';
              }
            }}
            onMouseLeave={e => {
              if (!isMoreActive && !showMoreMenu) {
                e.currentTarget.style.background = '#FFFFFF';
              }
            }}
          >
            <FaEllipsisH size={14} />
            <span>{selectedMoreItem ? selectedMoreItem.id : (showMoreMenu ? '▲' : '▼ More')}</span>
          </button>
        </div>

        {/* Roomier "Paid" Toggle Pill */}
        <label style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '7px',
          cursor: 'pointer',
          padding: '6px 12px',
          height: '38px',
          borderRadius: '8px',
          background: isPaid ? '#DCFCE7' : '#FFFFFF',
          border: isPaid ? '1.5px solid #22C55E' : '1px solid #CBD5E1',
          color: isPaid ? '#15803D' : '#475569',
          fontWeight: 800,
          fontSize: '0.82rem',
          boxShadow: isPaid ? '0 2px 6px rgba(34, 197, 94, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.04)',
          userSelect: 'none',
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}>
          <input
            type="checkbox"
            checked={isPaid}
            onChange={e => onChangeIsPaid(e.target.checked)}
            style={{
              width: '16px',
              height: '16px',
              cursor: 'pointer',
              accentColor: '#22C55E'
            }}
          />
          <span>Paid</span>
        </label>
      </div>

      {/* Expandable More Payment Options Panel */}
      {showMoreMenu && (
        <div style={{
          background: '#ffffff',
          border: '1.5px solid #cbd5e1',
          borderRadius: '8px',
          padding: '8px 10px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
            paddingBottom: '3px',
            borderBottom: '1px dashed #e2e8f0'
          }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              More Payment Options
            </span>
            <button
              type="button"
              onClick={() => setShowMoreMenu(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.7rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ✕ Close
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
            gap: '6px'
          }}>
            {MORE_PAYMENT_MODES.map(item => {
              const isSelected = activeMode === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectMore(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.12s',
                    background: isSelected ? '#DCFCE7' : '#f8fafc',
                    border: isSelected ? '1.5px solid #22C55E' : '1px solid #cbd5e1',
                    color: isSelected ? '#15803D' : '#334155'
                  }}
                  onMouseEnter={e => {
                    if (!isSelected) e.currentTarget.style.background = '#f1f5f9';
                  }}
                  onMouseLeave={e => {
                    if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                  }}
                >
                  <Icon size={12} style={{ color: isSelected ? '#15803D' : '#64748b' }} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(POSPaymentBar);
