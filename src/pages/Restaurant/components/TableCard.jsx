import React from 'react';
import { FaPrint, FaEye } from 'react-icons/fa';

const COLOR_MAP = {
  white: { bg: '#ffffff', text: '#6b7280', border: '1px solid #d1d5db' },
  orange: { bg: '#f5c518', text: '#1a0f00', border: '1px solid #d4a800' },
  green: { bg: '#22c55e', text: '#ffffff', border: '1px solid #16a34a' }
};

const TableCard = React.memo(({ table, onClick, onSave, onView, isSelected }) => {
  // Determine color theme strictly from backend attributes
  const colorKey = (
    table.color ||
    (table.status === 'PAYMENT_COMPLETED' || table.status === 'CLEANUP_RUNNING' ? 'green' :
     table.status === 'KOT_CUT' || table.status === 'ORDERED' || table.status === 'Running' ? 'orange' : 'white')
  ).toLowerCase();

  const cfg = COLOR_MAP[colorKey] || COLOR_MAP.white;
  const isAvailable = colorKey === 'white' || table.status === 'AVAILABLE' || table.status === 'Blank';
  const isPaymentCompleted = colorKey === 'green' || table.status === 'PAYMENT_COMPLETED' || table.status === 'CLEANUP_RUNNING';

  // Backend controls available actions:
  // Green table -> ['print_kot'] (View KOT is REMOVED!)
  // Orange table -> ['print_kot', 'view_kot']
  // White table -> []
  const actions = Array.isArray(table.available_actions)
    ? table.available_actions
    : (isPaymentCompleted ? ['print_kot'] : !isAvailable ? ['print_kot', 'view_kot'] : []);

  // Format backend remaining_seconds into 00:SS or MM:SS
  const formatTimer = (totalSec) => {
    if (totalSec === undefined || totalSec === null || totalSec <= 0) return null;
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const timerText = isPaymentCompleted ? formatTimer(table.remaining_seconds) : null;
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

      {/* ── Amount ── */}
      {!isAvailable && !isPaymentCompleted && table.amount > 0 && (
        <div style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '5px', lineHeight: 1 }}>
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
