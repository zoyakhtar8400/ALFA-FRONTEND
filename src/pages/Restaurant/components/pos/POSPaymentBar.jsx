import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import paymentModeService from '../../../../services/paymentModeService';

const getPaymentIcon = (name = '', type = '') => {
  const n = String(name).toLowerCase();
  const t = String(type).toUpperCase();

  if (t === 'CASH' || n.includes('cash')) return FaMoneyBill;
  if (t === 'CARD' || n.includes('card') || n.includes('visa') || n.includes('master')) return FaCreditCard;
  if (t === 'UPI' || n.includes('upi') || n.includes('gpay') || n.includes('phonepe') || n.includes('paytm') || n.includes('qr')) return FaQrcode;
  if (n.includes('room')) return FaBed;
  if (n.includes('cheque')) return FaMoneyCheckAlt;
  if (n.includes('complimentary') || n.includes('free')) return FaGift;
  if (t === 'CREDIT' || n.includes('due') || n.includes('credit')) return FaUserClock;
  if (t === 'ONLINE' || n.includes('online') || n.includes('gateway') || n.includes('web')) return FaGlobe;
  if (t === 'WALLET' || n.includes('wallet')) return FaWallet;
  return FaWallet;
};

const DEFAULT_MODES = [
  { id: 'Cash', name: 'Cash', label: 'Cash', type: 'CASH', is_quick_pay: true, active: 'Yes' },
  { id: 'Card', name: 'Card', label: 'Card', type: 'CARD', is_quick_pay: true, active: 'Yes' },
  { id: 'UPI', name: 'UPI', label: 'UPI', type: 'UPI', is_quick_pay: true, active: 'Yes' },
  { id: 'Other', name: 'Other', label: 'Other', type: 'OTHER', is_quick_pay: true, active: 'Yes' },
  { id: 'Due', name: 'Due', label: 'Due / Credit', type: 'CREDIT', is_quick_pay: false, active: 'Yes' },
  { id: 'Complimentary', name: 'Complimentary', label: 'Complimentary', type: 'OTHER', is_quick_pay: false, active: 'Yes' },
  { id: 'Cheque', name: 'Cheque', label: 'Cheque', type: 'OTHER', is_quick_pay: false, active: 'Yes' },
  { id: 'Online', name: 'Online', label: 'Online / Gateway', type: 'ONLINE', is_quick_pay: false, active: 'Yes' },
  { id: 'Room Post', name: 'Room Post', label: 'Post to Room', type: 'CREDIT', is_quick_pay: false, active: 'Yes' }
];

const POSPaymentBar = ({ activeMode, onSelectMode, isPaid, onChangeIsPaid }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [dbPaymentModes, setDbPaymentModes] = useState([]);

  // Fetch payment modes from backend / Payment Master
  const loadPaymentModes = useCallback(async () => {
    try {
      const res = await paymentModeService.getPaymentModes();
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.paymentModes)) list = res.paymentModes;
      else if (Array.isArray(res?.payment_modes)) list = res.payment_modes;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;

      if (list && list.length > 0) {
        const activeList = list
          .filter(p => p.active !== 'No' && p.isActive !== false)
          .map(p => ({
            id: p.name || p.payment_mode_name,
            name: p.name || p.payment_mode_name,
            label: p.name || p.payment_mode_name,
            type: p.type || 'CASH',
            is_quick_pay: p.is_quick_pay !== false,
            charge_percent: Number(p.charge_percent || 0),
            active: p.active || 'Yes'
          }));
        setDbPaymentModes(activeList);
      } else {
        setDbPaymentModes(DEFAULT_MODES);
      }
    } catch (e) {
      console.warn('Failed to load dynamic payment modes from backend, using defaults:', e.message);
      setDbPaymentModes(DEFAULT_MODES);
    }
  }, []);

  useEffect(() => {
    loadPaymentModes();

    const handleRefresh = () => loadPaymentModes();
    window.addEventListener('paymentMasterRefreshed', handleRefresh);
    window.addEventListener('paymentModesRefreshed', handleRefresh);
    return () => {
      window.removeEventListener('paymentMasterRefreshed', handleRefresh);
      window.removeEventListener('paymentModesRefreshed', handleRefresh);
    };
  }, [loadPaymentModes]);

  const allModes = dbPaymentModes.length > 0 ? dbPaymentModes : DEFAULT_MODES;

  // Partition into Primary (Quick Pay) vs More
  const { primaryModes, moreModes } = useMemo(() => {
    const quick = allModes.filter(m => m.is_quick_pay !== false);
    const extra = allModes.filter(m => m.is_quick_pay === false);

    // If quick modes > 4, keep first 4 in primary and rest in extra
    let finalPrimary = quick.length > 0 ? quick.slice(0, 4) : allModes.slice(0, 4);
    let finalMore = [
      ...quick.slice(4),
      ...extra
    ];

    // Ensure unique IDs in more list
    const primaryIds = new Set(finalPrimary.map(m => m.id));
    finalMore = finalMore.filter(m => !primaryIds.has(m.id));

    return { primaryModes: finalPrimary, moreModes: finalMore };
  }, [allModes]);

  const isMoreActive = moreModes.some(m => m.id === activeMode) || activeMode === 'More';
  const selectedMoreItem = moreModes.find(m => m.id === activeMode);

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
      {/* Top Row: Primary Payment Buttons + More + Paid Pill */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: '100%'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${primaryModes.length + (moreModes.length > 0 ? 1 : 0)}, 1fr)`,
          gap: '6px',
          flex: 1
        }}>
          {primaryModes.map(mode => {
            const isSelected = activeMode === mode.id;
            const Icon = getPaymentIcon(mode.name, mode.type);
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
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
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
                title={mode.label}
              >
                <Icon size={14} style={{ color: isSelected ? '#15803D' : '#64748b', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{mode.label}</span>
              </button>
            );
          })}

          {/* More Options Button */}
          {moreModes.length > 0 && (
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
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
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
              <FaEllipsisH size={14} style={{ flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedMoreItem ? selectedMoreItem.label : (showMoreMenu ? '▲ Close' : '▼ More')}
              </span>
            </button>
          )}
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
      {showMoreMenu && moreModes.length > 0 && (
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
              More Payment Options (Configured in Payment Master)
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '6px'
          }}>
            {moreModes.map(item => {
              const isSelected = activeMode === item.id;
              const Icon = getPaymentIcon(item.name, item.type);
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
                  <Icon size={12} style={{ color: isSelected ? '#15803D' : '#64748b', flexShrink: 0 }} />
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
