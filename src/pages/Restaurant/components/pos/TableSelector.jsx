import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaUtensils } from 'react-icons/fa';

const TableSelector = ({ isOpen, onClose, tablesList = [], currentTableId, onSelectTable }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const activeIdx = tablesList.findIndex(t => t.id === currentTableId);
      setFocusedIndex(activeIdx >= 0 ? activeIdx : 0);
    }
  }, [isOpen, tablesList, currentTableId]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      const cols = 5;
      const total = tablesList.length;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % total);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + total) % total);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex(prev => Math.min(total - 1, prev + cols));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex(prev => Math.max(0, prev - cols));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (tablesList[focusedIndex]) {
          onSelectTable(tablesList[focusedIndex]);
          onClose();
        }
      } else if (/^[0-9]$/.test(e.key)) {
        // Quick select by number
        const matchIdx = tablesList.findIndex(t => {
          const numStr = String(t.no || t.id).replace(/[^0-9]/g, '');
          return numStr === e.key || String(parseInt(numStr, 10)) === e.key;
        });
        if (matchIdx !== -1) {
          setFocusedIndex(matchIdx);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, focusedIndex, tablesList, onSelectTable, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-family, system-ui)'
      }}
    >
      <div style={{
        background: '#fff', borderRadius: '16px', width: '560px',
        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)', display: 'flex',
        flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          background: '#0e7490', color: '#fff', padding: '16px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaUtensils /> Select Table (Arrows / Number / Enter)
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.1rem' }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Body Grid */}
        <div style={{ padding: '24px', maxHeight: '400px', overflowY: 'auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '10px'
          }}>
            {tablesList.map((table, idx) => {
              const isAssigned = table.id === currentTableId;
              const isFocused = idx === focusedIndex;
              const isOccupied = table.status !== 'Blank' && table.status !== 'Paid' && table.status !== 'AVAILABLE';
              return (
                <button
                  key={table.id || idx}
                  type="button"
                  onClick={() => {
                    onSelectTable(table);
                    onClose();
                  }}
                  onMouseEnter={() => setFocusedIndex(idx)}
                  style={{
                    padding: '16px 8px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    border: isFocused
                      ? '2.5px solid #0e7490'
                      : isAssigned
                        ? '2px solid #0891b2'
                        : '1px solid #cbd5e1',
                    background: isFocused
                      ? '#cffafe'
                      : isAssigned
                        ? '#ecfeff'
                        : isOccupied
                          ? '#fee2e2'
                          : '#f8fafc',
                    color: isAssigned || isFocused
                      ? '#0e7490'
                      : isOccupied
                        ? '#dc2626'
                        : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.1s',
                    textAlign: 'center',
                    transform: isFocused ? 'scale(1.04)' : 'scale(1)',
                    boxShadow: isFocused ? '0 4px 12px rgba(14,116,144,0.25)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '1.15rem', fontWeight: 900 }}>{table.table_name || `T${parseInt(table.no || table.id, 10)}`}</div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, marginTop: '2px', opacity: 0.75 }}>
                    {table.status}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div style={{ background: '#f8fafc', padding: '12px 20px', borderTop: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>
          <span>⌨️ Arrow Keys to navigate, Enter to select, Esc to close</span>
          <span>Red = Occupied</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TableSelector);
