import React, { useState, useEffect, useMemo } from 'react';
import { FaPrint, FaEye } from 'react-icons/fa';

const STATUS_CONFIG = {
  Running: { bg: '#f5c518', text: '#1a0f00', border: '1px solid #d4a800' },
  Reserved: { bg: '#fb923c', text: '#fff', border: '1px solid #ea7c1e' },
  Paid: { bg: '#22c55e', text: '#fff', border: '1px solid #16a34a' },
  Cleaning: { bg: '#f1f5f9', text: '#334155', border: '1px solid #cbd5e1' },
  'KOT Generated': { bg: '#f5c518', text: '#1a0f00', border: '1px solid #d4a800' },
  'Food Served': { bg: '#4ade80', text: '#14532d', border: '1px solid #22c55e' },
  'Bill Generated': { bg: '#22c55e', text: '#fff', border: '1px solid #16a34a' },
  Blank: { bg: '#ffffff', text: '#6b7280', border: '1px solid #d1d5db' },
};

const TableCard = React.memo(({ table, onClick, onSave, onView, onOpenOps, isSelected }) => {
  const cfg = STATUS_CONFIG[table.status] || STATUS_CONFIG.Blank;
  const isBlank = table.status === 'Blank';
  const isCleaning = table.status === 'Cleaning';
  const isPaid = table.status === 'Paid' || table.status === 'Bill Generated';
  const isRunning = !isBlank && !isCleaning && !isPaid;

  // Stable fallback timestamp if no table timestamp exists
  const fallbackStartTime = useMemo(() => {
    return Date.now() - (table.initialElapsed || (parseInt(table.no || '1', 10) * 45) || 120) * 1000;
  }, [table.no, table.initialElapsed]);

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (isBlank) {
      setElapsed(0);
      return;
    }

    const baseTime = table.cleanedAt || table.paidAt || table.openedAt || table.updatedAt || fallbackStartTime;

    const tick = () => {
      const diff = Math.max(0, Math.floor((Date.now() - baseTime) / 1000));
      setElapsed(diff);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [table.status, table.openedAt, table.paidAt, table.cleanedAt, table.updatedAt, isBlank, fallbackStartTime]);

  // Compute display timer badge text without emojis
  const getTimerLabel = () => {
    if (isBlank) return null;

    if (isCleaning) {
      const cleanDuration = 45; // 45 seconds clean window
      const remaining = Math.max(0, cleanDuration - (elapsed % cleanDuration));
      return `Clears in ${remaining}s`;
    }

    if (isPaid) {
      const remaining = Math.max(0, 30 - (elapsed % 30));
      return `Clears in ${remaining}s`;
    }

    // Running table timer: NO SECONDS, ONLY MINUTES / HOURS
    const mins = Math.floor(elapsed / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0 ? `${hrs}h ${remMins}m ago` : `${hrs}h ago`;
  };

  const relativeTime = getTimerLabel();
  const showActions = !isBlank;

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
        position: 'relative',      /* anchor for absolute children */
        textAlign: 'center',
        outline: 'none',
        userSelect: 'none',
        boxShadow: isBlank ? 'none' : '0 1px 4px rgba(0,0,0,0.12)',
        transition: 'transform 100ms ease, box-shadow 100ms ease',
        overflow: 'visible',       /* let badges bleed outside */
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.18)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = isBlank ? 'none' : '0 1px 4px rgba(0,0,0,0.12)'; }}
    >
      {/* ── Timer badge — overlaps top-left corner ── */}
      {relativeTime && (
        <div style={{
          position: 'absolute',
          top: '-9px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: isCleaning ? '#0284c7' : isPaid ? '#16a34a' : elapsed > 3600 ? '#dc2626' : 'rgba(15, 23, 42, 0.85)',
          color: '#fff',
          fontSize: '0.6rem',
          fontWeight: 800,
          lineHeight: 1,
          padding: '3px 8px',
          borderRadius: '10px',
          whiteSpace: 'nowrap',
          zIndex: 5,
          boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
        }}>
          {relativeTime}
        </div>
      )}

      {/* ── Table number ── */}
      <div style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>
        T{parseInt(table.no, 10)}
      </div>

      {/* ── Amount ── */}
      {!isBlank && table.amount > 0 && (
        <div style={{ fontSize: '0.78rem', fontWeight: 700, marginTop: '5px', lineHeight: 1 }}>
          ₹{table.amount.toLocaleString('en-IN')}
        </div>
      )}

      {/* ── Icons — overlaps bottom edge ── */}
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
          {isPaid ? (
            <Btn title="Print Bill" onClick={onSave} color="#374151">
              <FaPrint size={15} />
            </Btn>
          ) : (
            <>
              {isRunning && (
                <Btn title="Print KOT" onClick={onSave} color="#374151">
                  <FaPrint size={15} />
                </Btn>
              )}
              <Btn title="View / Edit Order" onClick={onView} color="#374151">
                <FaEye size={15} />
              </Btn>
            </>
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
