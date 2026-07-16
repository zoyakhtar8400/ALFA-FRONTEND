import React, { useState, useEffect } from 'react';
import { FaPrint, FaEye, FaTrash, FaFileInvoiceDollar } from 'react-icons/fa';

const STATUS_STYLE = {
  Running: { bg: '#5fcb83', text: '#0f172a', border: '1px solid #4ade80' },
  Reserved: { bg: '#ffe8cc', text: '#d9480f', border: '2px solid #fd7e14' },
  Paid: { bg: '#475569', text: '#ffffff', border: '1px solid #64748b' },
  Cleaning: { bg: '#e0f2fe', text: '#0c4a6e', border: '1px solid #7dd3fc' },
  'KOT Generated': { bg: '#fef9c3', text: '#713f12', border: '1px solid #fef08a' },
  'Food Served': { bg: '#dcfce7', text: '#14532d', border: '1px solid #bbf7d0' },
  'Bill Generated': { bg: '#fce7f3', text: '#9d174d', border: '1px solid #fbcfe8' },
  Blank: { bg: '#ffffff', text: '#94a3b8', border: '1px dashed #cbd5e1' },
};

const TableCard = React.memo(({ table, onClick, onDelete, onSave, onDownload, onOpenOps, isSelected }) => {
  const style = STATUS_STYLE[table.status] || STATUS_STYLE.Blank;

  const [minutesCount, setMinutesCount] = useState(0);

  useEffect(() => {
    const active = table.openedAt && table.status !== 'Blank' && table.status !== 'Paid' && table.status !== 'Cleaning';
    if (!active) { setMinutesCount(0); return; }
    const update = () => setMinutesCount(Math.max(0, Math.floor((Date.now() - table.openedAt) / 60000)));
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, [table.status, table.openedAt]);

  const isActive = table.status !== 'Blank';
  const kotCount = (table.kots || []).length;

  return (
    <div
      onClick={onClick}
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') onClick?.(); }}
      style={{
        background: style.bg,
        color: style.text,
        border: isSelected ? '3px solid #0e7490' : style.border,
        borderRadius: '10px',
        padding: '14px 12px 12px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '120px',
        boxShadow: isSelected
          ? '0 0 0 3px rgba(14,116,144,0.25)'
          : table.status === 'Reserved'
            ? '0 0 10px rgba(253,126,20,0.4)'
            : '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'all 150ms ease-in-out',
        position: 'relative',
        textAlign: 'center',
        outline: 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
    >
      {/* Timer badge */}
      {minutesCount > 0 && (
        <div style={{
          position: 'absolute', top: '-10px', right: '-10px',
          background: minutesCount > 60 ? '#dc2626' : '#0d9488',
          color: '#fff', borderRadius: '12px', padding: '3px 8px',
          fontSize: '0.6rem', fontWeight: 800, zIndex: 5, lineHeight: 1,
        }}>
          {minutesCount}m
        </div>
      )}

      {/* Table number */}
      <div style={{ fontSize: '1.3rem', fontWeight: 900, letterSpacing: '-0.5px' }}>
        T{parseInt(table.no)}
      </div>

      {/* Status label */}
      <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.75, marginTop: '2px' }}>
        {table.status}
      </div>

      {/* Amount */}
      {isActive && table.amount > 0 && (
        <div style={{ fontSize: '0.88rem', fontWeight: 800, marginTop: '4px' }}>
          ₹{table.amount.toLocaleString('en-IN')}
        </div>
      )}

      {/* KOT count */}
      {isActive && kotCount > 0 && (
        <div style={{ fontSize: '0.65rem', fontWeight: 700, marginTop: '3px', opacity: 0.8 }}>
          {kotCount} KOT
        </div>
      )}

      {/* Action bar — only for active tables */}
      {isActive && (
        <div
          onClick={e => e.stopPropagation()}
          style={{
            position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '10px', background: '#fff', border: '1px solid #e2e8f0',
            borderRadius: '6px', padding: '5px 10px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
            alignItems: 'center', zIndex: 10, whiteSpace: 'nowrap',
          }}
        >
          <button onClick={onSave} title="Print KOT (F4)" style={btnStyle('#475569')}><FaPrint size={14} /></button>
          <button onClick={onOpenOps} title="Order Details (Enter)" style={btnStyle('#0e7490')}><FaEye size={14} /></button>
          <button onClick={onDownload} title="Quick Bill (F10)" style={btnStyle('#16a34a')}><FaFileInvoiceDollar size={14} /></button>
          <button onClick={onDelete} title="Reset Table" style={btnStyle('#dc2626')}><FaTrash size={14} /></button>
        </div>
      )}
    </div>
  );
});

const btnStyle = (color) => ({
  background: 'none', border: 'none', cursor: 'pointer',
  padding: 0, display: 'flex', alignItems: 'center', color,
});

export default TableCard;
