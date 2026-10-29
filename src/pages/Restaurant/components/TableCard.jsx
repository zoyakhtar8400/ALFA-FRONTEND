import React from 'react';
import { FaPrint, FaEye, FaRupeeSign } from 'react-icons/fa';

const COLOR_MAP = {
  white: {
    bg: '#ffffff',
    text: '#1e293b',
    border: '1px solid #e2e8f0',
    dot: '#94a3b8',
    subText: '#94a3b8'
  },
  yellow: { // Running / Occupied
    bg: '#fef08a', // vibrant light pastel yellow as in screenshot
    text: '#0f172a',
    border: '1px solid #fde047',
    dot: '#eab308',
    subText: '#713f12'
  },
  blue: { // Unpaid / Billed
    bg: '#bae6fd', // light sky blue as in AC7 in screenshot
    text: '#0f172a',
    border: '1px solid #7dd3fc',
    dot: '#0284c7',
    subText: '#0369a1'
  },
  orange: { // Reserved
    bg: '#fed7aa',
    text: '#7c2d12',
    border: '1px solid #fdba74',
    dot: '#f97316',
    subText: '#9a3412'
  },
  purple: { // NC Blocked
    bg: '#ede9fe',
    text: '#4c1d95',
    border: '1px solid #ddd6fe',
    dot: '#8b5cf6',
    subText: '#6d28d9'
  },
  green: { // Paid
    bg: '#bbf7d0',
    text: '#064e3b',
    border: '1px solid #86efac',
    dot: '#10b981',
    subText: '#065f46'
  },
  gray: { // Cleaning
    bg: '#f1f5f9',
    text: '#475569',
    border: '1px solid #cbd5e1',
    dot: '#94a3b8',
    subText: '#64748b'
  }
};

const TableCard = React.memo(({ table, onClick, onSave, onView, onDelete, isSelected, globalTaxRate = 0 }) => {
  const statusUpper = (table.status || table.order_state || '').toUpperCase();
  const isUnpaidBill = (statusUpper === 'UNPAID_BILL' || statusUpper === 'UNPAID' || statusUpper === 'BILL GENERATED' || statusUpper === 'BILLED' || statusUpper === 'BILL_GENERATED' || table.color === 'blue' || table.color === 'red');
  const isBlank = !isUnpaidBill && (table.status === 'Blank' || statusUpper === 'BLANK' || statusUpper === 'AVAILABLE' || ['PAYMENT_COMPLETED', 'PAID', 'CLEANING', 'CLEANUP_RUNNING'].includes(statusUpper) || table.color === 'white');
  const isNCBlocked = !isUnpaidBill && !isBlank && (statusUpper === 'NC_BLOCKED' || table.color === 'purple');
  const isReserved = !isUnpaidBill && !isBlank && !isNCBlocked && (statusUpper === 'RESERVED' || table.status === 'Reserved' || table.color === 'orange');
  const kotCount = table.kotCount || (Array.isArray(table.kots) ? table.kots.length : 0);
  const hasActualItems = (Number(table.amount || 0) > 0) || kotCount > 0 || (Array.isArray(table.items) && table.items.length > 0);

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
  const isAvailable = isBlank || (!isReserved && !isRunning && !isUnpaidBill && !isNCBlocked);

  // Format table name to match screenshot (e.g. AC4, NA1, T1)
  const getTableTitle = () => {
    let raw = String(table.table_name || table.name || table.no || table.table_no || '1').trim();
    if (raw.startsWith('TK-') || raw.startsWith('DL-')) return raw;

    // Strip generic "Table " prefix if present (e.g. "Table 1" -> "1")
    let clean = raw.replace(/^Table\s*/i, '').trim();

    // If it already starts with area code like AC4, NA1, or custom prefix
    if (/^[A-Za-z]{1,4}\d+$/i.test(clean)) {
      return clean.toUpperCase();
    }

    // Strip leading T if table has specific area or prefix
    const cleanNum = clean.replace(/^T/i, '');

    const prefix = (table.table_prefix || table.prefix || '').trim();
    if (prefix) return `${prefix}${cleanNum}`;

    const area = (table.area || '').toLowerCase();
    if (area.includes('non') || area.includes('na')) return `NA${cleanNum}`;
    if (area.includes('ac')) return `AC${cleanNum}`;
    return `T${cleanNum}`;
  };

  const calculatedTaxAmt = Number(table.amount || 0) * (globalTaxRate / 100);
  const fallbackTotalAmt = Number(table.amount || 0) + calculatedTaxAmt;
  const displayAmount = table.total_amount || table.totalAmount || table.net_amount || fallbackTotalAmt;

  // Calculate elapsed time in minutes for running/occupied tables
  const getElapsedMinutes = () => {
    if (isAvailable) return null;
    
    // Find earliest candidate time from table properties or attached KOTs
    let candidateTimes = [];
    if (table.openedAt) candidateTimes.push(table.openedAt);
    if (table.opened_at) candidateTimes.push(table.opened_at);
    if (table.order_time) candidateTimes.push(table.order_time);
    if (table.created_at) candidateTimes.push(table.created_at);
    if (table.time) candidateTimes.push(table.time);
    if (table.checkIn) candidateTimes.push(table.checkIn);
    if (table.updatedAt) candidateTimes.push(table.updatedAt);

    if (Array.isArray(table.kots)) {
      table.kots.forEach(k => {
        if (k.time && k.time !== 'Now') candidateTimes.push(k.time);
        if (k.in_time && k.in_time !== 'Now') candidateTimes.push(k.in_time);
        if (k.created_at) candidateTimes.push(k.created_at);
      });
    }

    let earliestMs = null;

    for (const timeVal of candidateTimes) {
      if (!timeVal) continue;
      let ms = null;
      if (typeof timeVal === 'number') {
        ms = timeVal > 1e11 ? timeVal : timeVal * 1000;
      } else if (typeof timeVal === 'string') {
        const parsed = Date.parse(timeVal);
        if (!isNaN(parsed)) {
          ms = parsed;
        } else if (/^\d{1,2}:\d{2}/.test(timeVal.trim())) {
          // Format like "14:30" or "02:30:15" or "02:30 PM"
          const trimmed = timeVal.trim();
          const parts = trimmed.split(' ');
          const timeParts = parts[0].split(':').map(Number);
          let hours = timeParts[0];
          let minutes = timeParts[1] || 0;
          const modifier = parts[1] ? parts[1].toUpperCase() : null;
          if (modifier === 'PM' && hours < 12) hours += 12;
          if (modifier === 'AM' && hours === 12) hours = 0;
          const d = new Date();
          d.setHours(hours, minutes, 0, 0);
          ms = d.getTime();
          // If the parsed time was from earlier in a previous shift/day
          if (ms > Date.now()) {
            ms -= 24 * 60 * 60 * 1000;
          }
        }
      }
      if (ms && !isNaN(ms) && ms <= Date.now()) {
        if (earliestMs === null || ms < earliestMs) {
          earliestMs = ms;
        }
      }
    }

    if (!earliestMs) {
      return null;
    }

    const diffMs = Date.now() - earliestMs;
    if (diffMs < 0) return 0;
    const mins = Math.floor(diffMs / 60000);
    return mins;
  };

  const elapsedMins = getElapsedMinutes();

  return (
    <div
      onClick={onClick}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onClick?.(); }}
      style={{
        background: cfg.bg,
        color: cfg.text,
        border: isSelected ? '2px solid #0d9488' : cfg.border,
        borderRadius: '10px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        height: '92px',
        width: '100%',
        boxSizing: 'border-box',
        padding: '12px 6px 14px 6px',
        userSelect: 'none',
        boxShadow: isSelected ? '0 0 0 2px rgba(13, 148, 136, 0.2)' : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        overflow: 'visible'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = isSelected ? '0 0 0 2px rgba(13, 148, 136, 0.2)' : '0 1px 3px rgba(0,0,0,0.04)';
      }}
    >
      {/* Overlapping top border: Elapsed time in minutes badge */}
      {elapsedMins !== null && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '0.65rem',
          fontWeight: '800',
          color: '#1e293b',
          lineHeight: 1,
          letterSpacing: '-0.2px',
          background: '#ffffff',
          padding: '2px 7px',
          borderRadius: '12px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.12)',
          border: '1px solid #cbd5e1',
          zIndex: 5,
          whiteSpace: 'nowrap'
        }}>
          {elapsedMins} min
        </div>
      )}

      {/* Top right subtle close/reset 'x' icon when running */}
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
            background: 'transparent',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '2px',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 0.6
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '1'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.6'; }}
        >
          <svg stroke="currentColor" fill="none" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="12" width="12">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}

      {/* Main Table Title (e.g. T1, T2, T3) */}
      <div style={{
        fontSize: '1.05rem',
        fontWeight: '500',
        color: '#0f172a',
        letterSpacing: '0px',
        lineHeight: 1.15,
        marginBottom: isAvailable ? '0px' : '3px'
      }}>
        {getTableTitle()}
      </div>

      {/* When occupied/running/unpaid: Amount */}
      {!isAvailable && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1.15
        }}>
          <div style={{
            fontSize: '0.98rem',
            fontWeight: '900',
            color: '#0f172a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            ₹{Math.round(displayAmount || 0)}
          </div>
        </div>
      )}

      {/* Action pill buttons overlapping bottom border */}
      {!isAvailable && (
        <div style={{
          position: 'absolute',
          bottom: '-13px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5
        }}>
          {isUnpaidBill ? (
            <button
              title="Quick Pay"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.(e, 'quick_pay');
              }}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                padding: 0
              }}
            >
              <FaRupeeSign size={13} />
            </button>
          ) : (
            <>
              <button
                title="Print Bill"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave?.(e);
                }}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                  padding: 0
                }}
              >
                <FaPrint size={12} />
              </button>
              <button
                title="View / POS"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(e);
                }}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#475569',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.12)',
                  padding: 0
                }}
              >
                <FaEye size={13} />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
});

TableCard.displayName = 'TableCard';

export default TableCard;

