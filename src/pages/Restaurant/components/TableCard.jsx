import React from 'react';
import { FaPrint, FaEye, FaWallet, FaRupeeSign } from 'react-icons/fa';

const COLOR_MAP = {
  white: { bg: '#ffffff', text: '#475569', border: '1.5px solid #cbd5e1', dot: '#94a3b8' },
  yellow: { bg: '#f59e0b', text: '#ffffff', border: '1.5px solid #d97706', dot: '#ffffff', glow: '0 4px 12px rgba(245, 158, 11, 0.2)' },  // Running / Occupied (Orange-Yellow)
  blue: { bg: '#2563eb', text: '#ffffff', border: '1.5px solid #1d4ed8', dot: '#ffffff', glow: '0 4px 12px rgba(37, 99, 235, 0.2)' },     // Unpaid (Blue)
  orange: { bg: '#f97316', text: '#ffffff', border: '1.5px solid #ea580c', dot: '#ffffff', glow: '0 4px 12px rgba(249, 115, 22, 0.2)' },   // Reserved (Orange)
  purple: { bg: '#8b5cf6', text: '#ffffff', border: '1.5px solid #6d28d9', dot: '#ffffff', glow: '0 4px 12px rgba(139, 92, 246, 0.2)' },   // NC Blocked (Purple)
  green: { bg: '#10b981', text: '#ffffff', border: '1.5px solid #047857', dot: '#ffffff', glow: '0 4px 12px rgba(16, 185, 129, 0.2)' },    // Paid (Green)
  gray: { bg: '#94a3b8', text: '#ffffff', border: '1.5px solid #64748b', dot: '#ffffff', glow: '0 4px 12px rgba(148, 163, 184, 0.2)' }     // Cleaning (Gray)
};

const AREA_BORDER_COLORS = [
  '#6366f1', // Indigo
  '#0ea5e9', // Sky
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#84cc16'  // Lime
];

const getAreaBorder = (areaStr) => {
  if (!areaStr || areaStr === 'Unassigned Area') return '#e2e8f0';
  let hash = 0;
  for (let i = 0; i < areaStr.length; i++) {
    hash = areaStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AREA_BORDER_COLORS.length;
  return AREA_BORDER_COLORS[index];
};

const TableCard = React.memo(({ table, onClick, onSave, onView, onDelete, isSelected, globalTaxRate = 0 }) => {
  // Determine color theme strictly and instantly from backend/frontend status attributes
  const statusUpper = (table.status || table.order_state || '').toUpperCase();
  const isBlank = table.status === 'Blank' || statusUpper === 'BLANK' || statusUpper === 'AVAILABLE' || ['PAYMENT_COMPLETED', 'PAID', 'CLEANING', 'CLEANUP_RUNNING', 'BILL GENERATED'].includes(statusUpper) || table.color === 'white';
  const isNCBlocked = !isBlank && (statusUpper === 'NC_BLOCKED' || table.color === 'purple');
  const isReserved = !isBlank && !isNCBlocked && (statusUpper === 'RESERVED' || table.status === 'Reserved' || table.color === 'orange');
  const isUnpaidBill = !isBlank && !isReserved && !isNCBlocked && (statusUpper === 'UNPAID_BILL' || statusUpper === 'UNPAID' || table.color === 'blue' || table.color === 'red');
  const kotCount = table.kotCount || (Array.isArray(table.kots) ? table.kots.length : 0);
  const hasActualItems = (Number(table.amount || 0) > 0) || kotCount > 0 || (Array.isArray(table.items) && table.items.length > 0);

  // STRICT RULE: Only consider it running if it ACTUALLY has items/amount/KOTs. 
  const isRunning = !isBlank && !isReserved && !isUnpaidBill && !isNCBlocked && (hasActualItems);

  const colorKey = isNCBlocked
    ? 'purple'
    : isReserved
      ? 'orange'
      : isUnpaidBill
        ? 'blue'
        : isRunning
          ? 'yellow'
          : 'white';

  const cfg = COLOR_MAP[colorKey] || COLOR_MAP.white;
  // If it doesn't have actual items and isn't reserved/blocked, it's available (blank).
  const isAvailable = isBlank || (!isReserved && !isRunning && !isUnpaidBill && !isNCBlocked);

  // Action icons:
  const actions = isNCBlocked
    ? []
    : isUnpaidBill ? ['quick_pay'] : (Array.isArray(table.available_actions) && table.available_actions.length > 0 && hasActualItems)
      ? table.available_actions
      : ((colorKey === 'yellow' || isRunning) && !isAvailable && !isReserved) ? ['print_kot', 'view_kot'] : [];

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

  const timerText = null;
  const showActions = actions.length > 0;

  // Calculate tax-included amount if total_amount is missing
  const calculatedTaxAmt = Number(table.amount || 0) * (globalTaxRate / 100);
  const fallbackTotalAmt = Number(table.amount || 0) + calculatedTaxAmt;
  const displayAmount = table.total_amount || table.totalAmount || table.net_amount || fallbackTotalAmt;

  return (
    <div
      onClick={onClick}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onClick?.(); }}
      style={{
        background: cfg.bg,
        color: cfg.text,
        border: isSelected ? '2.5px solid var(--primary)' : cfg.border,
        borderRadius: '12px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '8px 10px',
        height: '75px',
        position: 'relative',
        outline: 'none',
        userSelect: 'none',
        boxShadow: cfg.glow || '0 1px 3px rgba(0,0,0,0.02)',
        transition: 'all 0.2s ease-in-out',
        overflow: 'hidden'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = cfg.glow ? `0 6px 16px -4px ${cfg.dot}55` : '0 6px 12px rgba(0,0,0,0.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = cfg.glow || '0 1px 3px rgba(0,0,0,0.02)';
      }}
    >
      {/* Reset button (visible when occupied, but NOT when unpaid) */}
      {!isAvailable && !isUnpaidBill && (
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
            background: 'rgba(255,255,255,0.25)',
            border: 'none',
            color: '#fff',
            borderRadius: '50%',
            width: '15px',
            height: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            padding: 0
          }}
        >
          <svg stroke="currentColor" fill="none" strokeWidth="3" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="8" width="8" xmlns="http://www.w3.org/2000/svg">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}

      {/* Row 1: Table Number & Pax Capacity */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ fontSize: '0.95rem', fontWeight: '800', letterSpacing: '-0.3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          {(() => {
            if (table.table_name && table.table_name.trim() !== '') return table.table_name;
            const noStr = String(table.no || table.table_no || '1').trim();
            if (noStr.startsWith('TK-') || noStr.startsWith('DL-')) return noStr;
            return `T${parseInt(noStr, 10) || noStr}`;
          })()}
        </div>
      </div>

      {/* Row 2: Status / Waiter / Amount & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
        <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
          {!isAvailable && (table.amount > 0 || table.total_amount > 0 || table.totalAmount > 0 || table.net_amount > 0) ? (
            <div style={{ fontSize: '0.85rem', fontWeight: '900', lineHeight: 1.1 }}>
              ₹{Math.round(displayAmount || 0)}
            </div>
          ) : (
            <div style={{ fontSize: '10px', fontWeight: '700', opacity: 0.85, lineHeight: 1.1 }}>
              {isAvailable ? 'Vacant' : (isReserved ? 'Booked' : (isNCBlocked ? 'NC Block' : 'Active'))}
            </div>
          )}

          {table.waiter && !isAvailable && (
            <div style={{ fontSize: '8px', fontWeight: '600', opacity: 0.9, marginTop: '2px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '65px' }}>
              {table.waiter.split(' ')[0]}
            </div>
          )}
        </div>

        {/* Inline Actions */}
        {showActions && (
          <div style={{
            display: 'flex',
            gap: '3px',
            background: isAvailable ? '#f1f5f9' : 'rgba(255,255,255,0.2)',
            padding: '2px 4px',
            borderRadius: '5px',
            alignItems: 'center'
          }}>
            {actions.includes('quick_pay') && (
              <Btn title="Quick Pay" onClick={(e) => onClick?.(e, 'quick_pay')} color={isAvailable ? '#16a34a' : '#ffffff'}>
                <FaRupeeSign size={10} />
              </Btn>
            )}
            {actions.includes('print_kot') && (
              <Btn title="Print Bill" onClick={onSave} color={isAvailable ? '#475569' : '#ffffff'}>
                <FaPrint size={10} />
              </Btn>
            )}
            {actions.includes('view_kot') && (
              <Btn title="Open POS" onClick={onView} color={isAvailable ? '#475569' : '#ffffff'}>
                <FaEye size={10} />
              </Btn>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

TableCard.displayName = 'TableCard';

const Btn = ({ children, color, title, onClick }) => (
  <button
    title={title}
    onClick={e => { e.stopPropagation(); onClick?.(e); }}
    style={{
      background: 'none',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color,
      padding: '2px',
      transition: 'opacity 120ms ease',
    }}
    onMouseEnter={e => { e.currentTarget.style.opacity = '0.7'; }}
    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
  >
    {children}
  </button>
);

export default TableCard;
