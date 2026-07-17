import React from 'react';
import { FaTimes, FaUtensils } from 'react-icons/fa';

const TableSelector = ({ isOpen, onClose, tablesList, currentTableId, onSelectTable }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
      zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-family, system-ui)'
    }}>
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
            <FaUtensils /> Available POS Tables Map
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
              const isOccupied = table.status !== 'Blank' && table.status !== 'Paid';
              return (
                <button
                  key={table.id}
                  type="button"
                  autoFocus={idx === 0}
                  onClick={() => {
                    onSelectTable(table);
                    onClose();
                  }}
                  style={{
                    padding: '16px 8px',
                    borderRadius: '10px',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    border: isAssigned ? '2.5px solid #0e7490' : '1px solid #cbd5e1',
                    background: isAssigned
                      ? '#ecfeff'
                      : isOccupied
                        ? '#fee2e2'
                        : '#f8fafc',
                    color: isAssigned
                      ? '#0e7490'
                      : isOccupied
                        ? '#dc2626'
                        : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.1s',
                    textAlign: 'center',
                    boxShadow: isAssigned ? '0 0 0 2px rgba(14,116,144,0.15)' : 'none'
                  }}
                  onMouseEnter={e => {
                    if (!isAssigned) e.currentTarget.style.background = '#e2e8f0';
                  }}
                  onMouseLeave={e => {
                    if (!isAssigned) e.currentTarget.style.background = isOccupied ? '#fee2e2' : '#f8fafc';
                  }}
                >
                  <div style={{ fontSize: '1.15rem', fontWeight: 900 }}>T{parseInt(table.no)}</div>
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
          <span>Green border = Active selection</span>
          <span>Red background = Occupied table</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(TableSelector);
