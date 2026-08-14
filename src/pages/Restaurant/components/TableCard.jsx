import React from 'react';
import { FaPrint, FaEye } from 'react-icons/fa';

const COLOR_MAP = {
  white: { bg: '#ffffff', text: '#6b7280', border: '1px solid #d1d5db' },
  yellow: { bg: '#f5c842', text: '#1e293b', border: '1px solid #d4a800' }, // Running Table (Yellow)
  orange: { bg: '#f97316', text: '#ffffff', border: '1px solid #ea580c' }, // Reserved Table (Orange)
  green: { bg: '#22c55e', text: '#ffffff', border: '1px solid #16a34a' }   // Paid / Cleaning (Green)
};

const TableCard = React.memo(({ table, onClick, onSave, onView, isSelected }) => {
  // Determine color theme strictly and instantly from backend/frontend status attributes
  const statusUpper = (table.status || table.order_state || '').toUpperCase();
  const isBlank = table.status === 'Blank' || statusUpper === 'BLANK' || statusUpper === 'AVAILABLE' || table.color === 'white';
  const isReserved = !isBlank && (statusUpper === 'RESERVED' || table.status === 'Reserved' || table.color === 'orange');
  const isPaidOrCleaning = !isBlank && !isReserved && ['PAYMENT_COMPLETED', 'CLEANUP_RUNNING', 'PAID', 'CLEANING', 'BILL GENERATED'].includes(statusUpper);
  const isRunning = !isBlank && !isReserved && !isPaidOrCleaning && (['KOT_CUT', 'ORDERED', 'RUNNING', 'KOT GENERATED', 'OCCUPIED'].includes(statusUpper) || (Number(table.amount || 0) > 0));

  const colorKey = isPaidOrCleaning
    ? 'green'
    : isReserved
    ? 'orange'
    : isRunning
    ? 'yellow'
    : 'white';

  const cfg = COLOR_MAP[colorKey] || COLOR_MAP.white;
  const isAvailable = isBlank || (!isReserved && !isRunning && !isPaidOrCleaning);
  const isPaymentCompleted = isPaidOrCleaning;

  // Action icons:
  // Green table (Paid) -> ['print_kot']
  // Yellow table (Running / KOT Cut) -> ['print_kot', 'view_kot'] (two icons)
  // White/Reserved table -> []
  const actions = (Array.isArray(table.available_actions) && table.available_actions.length > 0)
    ? table.available_actions
    : (isPaymentCompleted ? ['print_kot'] : (colorKey === 'yellow' || isRunning || (!isAvailable && !isReserved)) ? ['print_kot', 'view_kot'] : []);

  // Format remaining_seconds into 00:SS or MM:SS
  const formatTimer = (totalSec) => {
    if (totalSec === undefined || totalSec === null || totalSec <= 0) return null;
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const startTime = table.payment_completed_at || table.cleanedAt || table.paidAt || table.updatedAt;
  const computedRemaining = (table.remaining_seconds !== undefined && table.remaining_seconds > 0)
    ? table.remaining_seconds
    : (startTime ? Math.max(0, 60 - Math.floor((Date.now() - startTime) / 1000)) : 60);

  const timerText = isPaymentCompleted && computedRemaining > 0 ? formatTimer(computedRemaining) : null;
  const showActions = actions.length > 0;

  return (
    <div
      onClick={onClick}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onClick?.(); }}
      style={{
        background: cfg.bg,
        color: cfg.text,
        border: isSelected ? '2px solid #0e7490' : cfg.border,
        borderRadius: '6px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '105px',
        position: 'relative',
        textAlign: 'center',
        outline: 'none',
        userSelect: 'none',
        boxShadow: isAvailable ? 'none' : '0 1px 4px rgba(0,0,0,0.12)',
        transition: 'transform 100ms ease, box-shadow 100ms ease',
        overflow: 'visible',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.18)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = isAvailable ? 'none' : '0 1px 4px rgba(0,0,0,0.12)'; }}
    >
      {/* ── Timer badge (backend calculated remaining_seconds) ── */}
      {timerText && (
        <div style={{
          position: 'absolute',
          top: '-9px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#15803d',
          color: '#fff',
          fontSize: '0.65rem',
          fontWeight: 800,
          lineHeight: 1,
          padding: '3px 8px',
          borderRadius: '10px',
          whiteSpace: 'nowrap',
          zIndex: 5,
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
        }}>
          {timerText}
        </div>
      )}

      {/* ── Table number ── */}
      <div style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>
        T{parseInt(table.no || table.table_no || '1', 10)}
      </div>

      {/* ── Reserved label or Amount ── */}
      {isReserved ? (
        <div style={{ fontSize: '0.72rem', fontWeight: 700, marginTop: '4px', lineHeight: 1, color: '#fff', opacity: 0.95, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Reserved
        </div>
      ) : (!isAvailable && !isPaymentCompleted && table.amount > 0) ? (
        <div style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '5px', lineHeight: 1 }}>
          ₹{table.amount.toLocaleString('en-IN')}
        </div>
      ) : null}

      {/* ── Backend Driven Action Icons ── */}
      {showActions && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: '-11px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '4px',
            background: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '5px 8px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            zIndex: 5,
          }}
        >
          {actions.includes('print_kot') && (
            <Btn title="Print KOT" onClick={onSave} color="#374151">
              <FaPrint size={15} />
            </Btn>
          )}
          {actions.includes('view_kot') && (
            <Btn title="View / Edit Order" onClick={onView} color="#374151">
              <FaEye size={15} />
            </Btn>
          )}
        </div>
      )}
    </div>
  );
});

TableCard.displayName = 'TableCard';

const Btn = ({ children, color, title, onClick }) => (
  <button
    title={title}
    onClick={e => { e.stopPropagation(); onClick?.(e); }}
    onMouseEnter={e => { e.currentTarget.style.color = '#0e7490'; }}
    onMouseLeave={e => { e.currentTarget.style.color = '#374151'; }}
    style={{
      background: 'none', border: 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', color, padding: '1px',
      transition: 'color 100ms ease',
    }}
  >
    {children}
  </button>
);

export default TableCard;
