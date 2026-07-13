import React, { useState, useEffect } from 'react';
import { FaPrint, FaEye, FaTrash, FaDownload } from 'react-icons/fa';

const TableCard = React.memo(({ table, onClick, onView, onDelete, onSave, onDownload, onOpenOps }) => {
  let cardBg = '#ffffff';
  let textColor = '#0f172a';
  let borderStyle = '1px solid #cbd5e1';

  if (table.status === 'Running') {
    cardBg = '#5fcb83'; // Vibrant green from screenshot
    textColor = '#0f172a';
    borderStyle = '1px solid #cbd5e1';
  } else if (table.status === 'Paid') {
    cardBg = '#475569';
    textColor = '#ffffff';
    borderStyle = '1px solid #cbd5e1';
  } else if (table.status === 'Reserved') {
    cardBg = '#ffe8cc';
    textColor = '#d9480f';
    borderStyle = '2px solid #fd7e14';
  } else if (table.status === 'Cleaning') {
    cardBg = '#e0f2fe';
    textColor = '#0c4a6e';
    borderStyle = '1px solid #cbd5e1';
  } else if (table.status === 'Blank') {
    borderStyle = '1px dashed #cbd5e1';
  } else if (table.status === 'KOT Generated') {
    cardBg = '#fef9c3';
    textColor = '#713f12';
    borderStyle = '1px solid #fef08a';
  } else if (table.status === 'Food Served') {
    cardBg = '#dcfce7';
    textColor = '#14532d';
    borderStyle = '1px solid #bbf7d0';
  } else if (table.status === 'Bill Generated') {
    cardBg = '#fce7f3';
    textColor = '#9d174d';
    borderStyle = '1px solid #fbcfe8';
  } else if (table.status === 'Payment Pending') {
    cardBg = '#475569';
    textColor = '#ffffff';
    borderStyle = '1px solid #cbd5e1';
  }

  // Booking time display state (static hh:mm format) and running minutes count
  const [elapsed, setElapsed] = useState('');
  const [minutesCount, setMinutesCount] = useState(0);

  useEffect(() => {
    const isTimerActive = table.openedAt && 
      (table.status !== 'Blank' && table.status !== 'Paid' && table.status !== 'Cleaning');

    if (isTimerActive) {
      const updateTimer = () => {
        try {
          const dateObj = new Date(table.openedAt);
          const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const diffMs = Date.now() - dateObj.getTime();
          const diffMins = Math.max(0, Math.floor(diffMs / 60000));
          setElapsed(timeStr);
          setMinutesCount(diffMins);
        } catch (err) {
          setElapsed('');
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 30000);
      return () => clearInterval(interval);
    } else {
      setElapsed('');
      setMinutesCount(0);
    }
  }, [table.status, table.openedAt]);

  return (
    <div
      onClick={onClick}
      style={{
        background: cardBg,
        color: textColor,
        border: borderStyle,
        borderRadius: '8px',
        padding: '16px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '120px',
        boxShadow: table.status === 'Reserved' ? '0 0 10px rgba(253, 126, 20, 0.4)' : '0 1px 3px rgba(0,0,0,0.05)',
        transition: 'transform 150ms ease-in-out, box-shadow 150ms ease-in-out',
        position: 'relative',
        textAlign: 'center'
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = table.status === 'Reserved' 
          ? '0 0 16px rgba(253, 126, 20, 0.6)' 
          : '0 10px 15px -3px rgba(0,0,0,0.05)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'none';
        e.currentTarget.style.boxShadow = table.status === 'Reserved' 
          ? '0 0 10px rgba(253, 126, 20, 0.4)' 
          : '0 1px 3px rgba(0,0,0,0.05)';
      }}
    >
      {/* Time Badge (Pill badge at the top-right corner showing booking time and running duration) */}
      {elapsed && (
        <div style={{
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          background: '#0d9488',
          color: '#ffffff',
          borderRadius: '12px',
          padding: '4px 10px',
          fontSize: '0.62rem',
          fontWeight: 800,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          lineHeight: '1',
          zIndex: 5
        }}>
          {elapsed} ({minutesCount}m)
        </div>
      )}

      {/* Table No Label */}
      <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>
        T{parseInt(table.no)}
      </div>

      {/* Order Amount */}
      {table.status !== 'Blank' && table.amount > 0 && (
        <div style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: '4px' }}>
          ₹{table.amount.toLocaleString('en-IN')}
        </div>
      )}

      {/* Customer Name / Pax info for Reserved Tables */}
      {table.status === 'Reserved' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '4px' }}>
          <div style={{
            background: '#fd7e14',
            color: '#ffffff',
            borderRadius: '4px',
            padding: '2px 8px',
            fontSize: '0.62rem',
            fontWeight: 800,
            marginTop: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            Reserved
          </div>
        </div>
      )}

      {/* Floating Bottom action row with original design, plus operations trigger */}
      {table.status !== 'Blank' && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            bottom: '-16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '14px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            padding: '6px 12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            whiteSpace: 'nowrap'
          }}
        >
          <button
            onClick={onSave}
            title="Save / Print KOT"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569'
            }}
          >
            <FaPrint size={18} />
          </button>
          <button
            onClick={onOpenOps}
            title="View Order / Table Operations"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569'
            }}
          >
            <FaEye size={18} />
          </button>
          <button
            onClick={onDelete}
            title="Clear Table / Reset"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#dc2626'
            }}
          >
            <FaTrash size={18} />
          </button>
          <button
            onClick={onDownload}
            title="Download Receipt"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569'
            }}
          >
            <FaDownload size={18} />
          </button>
        </div>
      )}
    </div>
  );
});

export default TableCard;
