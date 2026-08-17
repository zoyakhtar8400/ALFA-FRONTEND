import React from 'react';
import { FaPrint, FaEye } from 'react-icons/fa';

const COLOR_MAP = {
  white: { bg: '#ffffff', text: '#6b7280', border: '1px solid #d1d5db' },
  yellow: { bg: '#f5c842', text: '#1e293b', border: '1px solid #d4a800' }, // Running Table (Yellow)
  orange: { bg: '#f97316', text: '#ffffff', border: '1px solid #ea580c' }, // Reserved Table (Orange)
  green: { bg: '#22c55e', text: '#ffffff', border: '1px solid #16a34a' },   // Paid / Cleaning (Green)
  blue: { bg: '#2563eb', text: '#ffffff', border: '1px solid #1d4ed8' },   // Unpaid Bill (Blue)
  red: { bg: '#ef4444', text: '#ffffff', border: '1px solid #b91c1c' },    // Error / Override (Red)
  purple: { bg: '#c084fc', text: '#1e293b', border: '1px solid #a855f7' }  // NC / Blocked Table (Purple)
};

const TableCard = React.memo(({ table, onClick, onSave, onView, onDelete, isSelected }) => {
  // Determine color theme strictly and instantly from backend/frontend status attributes
  const statusUpper = (table.status || table.order_state || '').toUpperCase();
  const isBlank = table.status === 'Blank' || statusUpper === 'BLANK' || statusUpper === 'AVAILABLE' || table.color === 'white';
  const isNCBlocked = !isBlank && (statusUpper === 'NC_BLOCKED' || table.color === 'purple');
  const isReserved = !isBlank && !isNCBlocked && (statusUpper === 'RESERVED' || table.status === 'Reserved' || table.color === 'orange');
  const isPaidOrCleaning = !isBlank && !isReserved && !isNCBlocked && ['PAYMENT_COMPLETED', 'CLEANUP_RUNNING', 'PAID', 'CLEANING', 'BILL GENERATED'].includes(statusUpper);
  const isUnpaidBill = !isBlank && !isReserved && !isPaidOrCleaning && !isNCBlocked && (statusUpper === 'UNPAID_BILL' || statusUpper === 'UNPAID' || table.color === 'blue' || table.color === 'red');
  const isRunning = !isBlank && !isReserved && !isPaidOrCleaning && !isUnpaidBill && !isNCBlocked && (['KOT_CUT', 'ORDERED', 'RUNNING', 'KOT GENERATED', 'OCCUPIED'].includes(statusUpper) || (Number(table.amount || 0) > 0));

  const colorKey = isNCBlocked
    ? 'purple'
    : isPaidOrCleaning
    ? 'green'
    : isReserved
    ? 'orange'
    : isUnpaidBill
    ? 'blue'
    : isRunning
    ? 'yellow'
    : 'white';

  const cfg = COLOR_MAP[colorKey] || COLOR_MAP.white;
  const isAvailable = isBlank || (!isReserved && !isRunning && !isPaidOrCleaning && !isUnpaidBill && !isNCBlocked);
  const isPaymentCompleted = isPaidOrCleaning;

  // Action icons:
  // Green table (Paid) -> ['print_kot']
  // Yellow/Red table (Running / KOT Cut / Unpaid) -> ['print_kot', 'view_kot'] (two icons)
  // White/Reserved table -> []
  const actions = isNCBlocked
    ? []
    : (Array.isArray(table.available_actions) && table.available_actions.length > 0)
    ? table.available_actions
    : (isPaymentCompleted ? ['print_kot'] : (colorKey === 'yellow' || colorKey === 'red' || isRunning || isUnpaidBill || (!isAvailable && !isReserved)) ? ['print_kot', 'view_kot'] : []);

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
      {!isAvailable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(table);
          }}
          title="Reset Table"
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#ef4444',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'background 0.1s, transform 0.1s',
            padding: 0
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#fca5a5';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#fee2e2';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="11" width="11" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
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

      {/* ── Status label ── */}
      <div style={{
        fontSize: '0.62rem',
        fontWeight: 700,
        marginTop: '3px',
        lineHeight: 1,
        letterSpacing: '0.6px',
        textTransform: 'uppercase',
        opacity: 0.85,
      }}>
        {isNCBlocked ? 'NC Blocked'
          : isPaymentCompleted ? 'Paid'
          : isUnpaidBill ? 'Unpaid'
          : isReserved ? 'Reserved'
          : isRunning ? 'Running'
          : 'Available'}
      </div>

      {/* ── Amount (for running / unpaid tables) ── */}
      {!isAvailable && !isPaymentCompleted && !isReserved && table.amount > 0 && (
        <div style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '3px', lineHeight: 1 }}>
          ₹{table.amount.toLocaleString('en-IN')}
        </div>
      )}

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
