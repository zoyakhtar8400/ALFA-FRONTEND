import React, { useState } from 'react';
import { FaTimes, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import MoveKOTTab from './tabs/MoveKOTTab';

const TableOperationsModal = (props) => {
  const [isTablesCollapsed, setIsTablesCollapsed] = useState(true);
  const {
    isOpen, onClose,
    tables,
    fromTableId, setFromTableId,
    toTableId, setToTableId,
    selectedTransferKots, setSelectedTransferKots,
    selectedGuests, setSelectedGuests,
    selectedWaiter, setSelectedWaiter,
    selectedCaptain, setSelectedCaptain,
    handleCreateKOT, handleCancelKOT,
    handleModalOkClick,
  } = props;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.2)', backdropFilter: 'blur(2px)', zIndex: 999 }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        background: '#fff', borderRadius: '14px',
        boxShadow: '0 20px 40px -8px rgba(0,0,0,0.18)',
        width: '620px', maxWidth: '95vw', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        zIndex: 1000, fontFamily: 'system-ui', color: '#0f172a',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900 }}>Move KOT</h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.72rem', color: '#64748b' }}>Move by table (whole KOT) or by individual items</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.1rem', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
            <FaTimes />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Collapsible Table Capsules Section */}
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
            <div
              onClick={() => setIsTablesCollapsed(prev => !prev)}
              style={{
                padding: '10px 14px',
                background: '#f8fafc',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                userSelect: 'none',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
            >
              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Select Tables (Occupied = From, Target = To)</span>
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#0e7490', fontWeight: 700 }}>
                {isTablesCollapsed ? 'Show Table Map' : 'Hide Table Map'}
                {isTablesCollapsed ? <FaChevronRight size={10} /> : <FaChevronDown size={10} />}
              </span>
            </div>

            {!isTablesCollapsed && (
              <div style={{ padding: '12px 14px', borderTop: '1px solid #e2e8f0', background: '#fff' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {tables.map(t => {
                    const st = String(t.status || '').toLowerCase().trim();
                    const isOccupied = Number(t.amount || 0) > 0 || (st !== 'blank' && st !== 'available' && st !== 'white' && st !== 'cleaning' && st !== 'paid');
                    const isFrom = fromTableId === String(t.id);
                    const isTo = toTableId === String(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => {
                          if (isOccupied) {
                            setFromTableId(String(t.id));
                            setSelectedGuests(t.seats || 4);
                            setSelectedWaiter(t.waiter || '');
                            setSelectedCaptain(t.captain || '');
                            setSelectedTransferKots({});
                          } else {
                            setToTableId(String(t.id));
                          }
                        }}
                        style={{
                          border: isFrom ? '2px solid #3b82f6' : isTo ? '2px solid #db2777' : isOccupied ? '1.5px solid #eab308' : '1px dashed #cbd5e1',
                          background: isFrom ? '#eff6ff' : isTo ? '#fdf2f8' : isOccupied ? '#fefce8' : '#fff',
                          color: isFrom ? '#1d4ed8' : isTo ? '#be185d' : isOccupied ? '#713f12' : '#94a3b8',
                          borderRadius: '6px', padding: '5px 12px',
                          fontSize: '0.78rem', fontWeight: 800,
                          cursor: 'pointer', userSelect: 'none', transition: 'all 100ms',
                        }}
                      >
                        T{parseInt(t.no)}
                        {isFrom && <span style={{ fontSize: '0.6rem', marginLeft: '4px', opacity: 0.8 }}>FROM</span>}
                        {isTo && <span style={{ fontSize: '0.6rem', marginLeft: '4px', opacity: 0.8 }}>TO</span>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '0.68rem', color: '#94a3b8' }}>
                  <span><span style={{ color: '#1d4ed8', fontWeight: 700 }}>Blue border</span> = From table (occupied)</span>
                  <span><span style={{ color: '#be185d', fontWeight: 700 }}>Pink border</span> = To table (target)</span>
                </div>
              </div>
            )}
          </div>

          {/* From / To dropdowns */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '200px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', whiteSpace: 'nowrap' }}>From </span>
              <select
                value={fromTableId}
                onChange={e => {
                  setFromTableId(e.target.value);
                  setSelectedTransferKots({});
                  const tObj = tables.find(t => String(t.id) === e.target.value);
                  if (tObj) { setSelectedGuests(tObj.seats || 4); setSelectedWaiter(tObj.waiter || ''); setSelectedCaptain(tObj.captain || ''); }
                }}
                style={{ flex: 1, padding: '7px 10px', borderRadius: '7px', border: '1.5px solid #3b82f6', background: '#eff6ff', fontSize: '0.8rem', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
              >
                <option value="">Select occupied table...</option>
                {tables.filter(t => {
                  const st = String(t.status || '').toLowerCase().trim();
                  return Number(t.amount || 0) > 0 || (st !== 'blank' && st !== 'available' && st !== 'white' && st !== 'cleaning' && st !== 'paid');
                }).map(t => (
                  <option key={t.id} value={t.id}>T{parseInt(t.no)} ({t.status || 'Occupied'}) — ₹{Number(t.amount || 0).toLocaleString('en-IN')}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '200px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#475569', whiteSpace: 'nowrap' }}>To:</span>
              <select
                value={toTableId}
                onChange={e => setToTableId(e.target.value)}
                style={{ flex: 1, padding: '7px 10px', borderRadius: '7px', border: '1.5px solid #db2777', background: '#fdf2f8', fontSize: '0.8rem', fontWeight: 700, outline: 'none', cursor: 'pointer' }}
              >
                <option value="">Select target table...</option>
                {tables.filter(t => String(t.id) !== fromTableId).map(t => (
                  <option key={t.id} value={t.id}>T{parseInt(t.no)} ({t.status})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Move KOT content */}
          <MoveKOTTab
            fromTableId={fromTableId}
            toTableId={toTableId}
            tables={tables}
            selectedTransferKots={selectedTransferKots}
            setSelectedTransferKots={setSelectedTransferKots}
            handleCancelKOT={handleCancelKOT}
            handleCreateKOT={handleCreateKOT}
          />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '14px 22px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <button
            onClick={onClose}
            style={{ padding: '8px 18px', borderRadius: '7px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            Cancel
          </button>
          <button
            onClick={handleModalOkClick}
            style={{ padding: '8px 22px', borderRadius: '7px', border: 'none', background: '#0e7490', color: '#fff', fontSize: '0.82rem', fontWeight: 800, cursor: 'pointer' }}
            onMouseEnter={e => e.currentTarget.style.background = '#0c6280'}
            onMouseLeave={e => e.currentTarget.style.background = '#0e7490'}
          >
            Move KOT
          </button>
        </div>
      </div>
    </>
  );
};

export default TableOperationsModal;
