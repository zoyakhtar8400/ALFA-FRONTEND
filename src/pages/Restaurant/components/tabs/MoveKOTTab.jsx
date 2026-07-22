import React, { useState } from 'react';

const MoveKOTTab = ({
  fromTableId,
  toTableId,
  tables,
  selectedTransferKots,
  setSelectedTransferKots,
  handleCancelKOT,
  handleCreateKOT,
}) => {
  const [mode, setMode] = useState('table'); // 'table' | 'item'
  const [selectedItems, setSelectedItems] = useState({});

  if (!fromTableId) return (
    <div style={{ color: '#64748b', fontSize: '0.85rem', padding: '12px 0' }}>
      Select a From Table first.
    </div>
  );

  const srcTable = tables.find(t => String(t.id) === fromTableId);
  const kots = srcTable?.kots || [];

  // Flatten all items across all KOTs for item-level selection
  const allItems = kots.flatMap(k =>
    (k.items || []).map((it, idx) => ({ ...it, kotId: k.id, itemKey: `${k.id}-${idx}` }))
  );

  const toggleItem = (key) => {
    setSelectedItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectedItemCount = Object.values(selectedItems).filter(Boolean).length;
  const selectedKotCount = Object.values(selectedTransferKots).filter(Boolean).length;

  const toTableLabel = toTableId
    ? `T${parseInt(tables.find(t => String(t.id) === toTableId)?.no || toTableId)}`
    : 'No target selected';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Mode toggle */}
      <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px', gap: '3px' }}>
        {[
          { id: 'table', label: 'Move by Table (KOT)' },
          { id: 'item',  label: 'Move by Item' },
        ].map(m => (
          <button
            key={m.id}
            onClick={() => { setMode(m.id); setSelectedItems({}); setSelectedTransferKots({}); }}
            style={{
              flex: 1, padding: '7px 10px', borderRadius: '6px', border: 'none',
              fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer',
              background: mode === m.id ? '#0f172a' : 'transparent',
              color: mode === m.id ? '#fff' : '#64748b',
              transition: 'all 120ms',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* ── BY TABLE MODE ── */}
      {mode === 'table' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Select KOTs to move → {toTableLabel}
          </span>

          {kots.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', padding: '8px 0' }}>
              No active KOTs on this table.
            </div>
          ) : (
            kots.map(k => (
              <div key={k.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                background: selectedTransferKots[k.id] ? '#f0f9ff' : '#f8fafc',
                padding: '10px 12px', borderRadius: '8px',
                border: selectedTransferKots[k.id] ? '1.5px solid #0e7490' : '1px solid #e2e8f0',
                cursor: 'pointer', transition: 'all 120ms',
              }}
                onClick={() => setSelectedTransferKots(prev => ({ ...prev, [k.id]: !prev[k.id] }))}
              >
                <input
                  type="checkbox"
                  checked={!!selectedTransferKots[k.id]}
                  onChange={() => {}}
                  style={{ marginTop: '2px', accentColor: '#0e7490', cursor: 'pointer' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>{k.id}</span>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{k.time}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '3px' }}>
                    {(k.items || []).map(it => `${it.name} ×${it.qty}`).join(' · ')}
                  </div>
                </div>
              </div>
            ))
          )}

          {selectedKotCount > 0 && (
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0e7490', padding: '4px 0' }}>
              {selectedKotCount} KOT{selectedKotCount > 1 ? 's' : ''} selected to move to {toTableLabel}
            </div>
          )}
        </div>
      )}

      {/* ── BY ITEM MODE ── */}
      {mode === 'item' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Select items to move → {toTableLabel}
          </span>

          {allItems.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', padding: '8px 0' }}>
              No items found on this table.
            </div>
          ) : (
            allItems.map(it => (
              <div key={it.itemKey} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: selectedItems[it.itemKey] ? '#f0f9ff' : '#f8fafc',
                padding: '9px 12px', borderRadius: '8px',
                border: selectedItems[it.itemKey] ? '1.5px solid #0e7490' : '1px solid #e2e8f0',
                cursor: 'pointer', transition: 'all 120ms',
              }}
                onClick={() => toggleItem(it.itemKey)}
              >
                <input
                  type="checkbox"
                  checked={!!selectedItems[it.itemKey]}
                  onChange={() => {}}
                  style={{ accentColor: '#0e7490', cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a' }}>{it.name || it.itemName}</span>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '8px' }}>×{it.qty}</span>
                </div>
                <span style={{ fontSize: '0.68rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>from {it.kotId}</span>
              </div>
            ))
          )}

          {selectedItemCount > 0 && (
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0e7490', padding: '4px 0' }}>
              {selectedItemCount} item{selectedItemCount > 1 ? 's' : ''} selected to move to {toTableLabel}
            </div>
          )}
        </div>
      )}

      {/* Generate new KOT */}
      <button
        onClick={handleCreateKOT}
        style={{
          padding: '8px 14px', background: '#f1f5f9', color: '#0f172a',
          borderRadius: '6px', border: '1px dashed #cbd5e1',
          fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer',
          marginTop: '4px', textAlign: 'left',
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
        onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
      >
        + Generate New KOT from Unsaved Order
      </button>
    </div>
  );
};

export default MoveKOTTab;
