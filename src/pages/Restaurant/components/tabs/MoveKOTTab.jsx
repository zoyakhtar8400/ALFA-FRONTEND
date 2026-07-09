import React from 'react';

const MoveKOTTab = ({
  fromTableId,
  tables,
  selectedTransferKots,
  setSelectedTransferKots,
  handleCancelKOT,
  handleCreateKOT,
}) => {
  if (!fromTableId) return <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Select a From Table first.</div>;

  const srcTable = tables.find(t => String(t.id) === fromTableId);
  const kots = srcTable?.kots || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>SELECT KOTs TO TRANSFER</span>

      {kots.length === 0 ? (
        <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>No active KOTs found. Generate one below.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {kots.map(k => (
            <div key={k.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={!!selectedTransferKots[k.id]}
                  onChange={(e) => setSelectedTransferKots(prev => ({ ...prev, [k.id]: e.target.checked }))}
                />
                {k.id} ({k.time})
              </label>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                {k.items.map(it => `${it.name} x${it.qty}`).join(', ')}
              </div>
              <button
                onClick={() => handleCancelKOT(k.id)}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Cancel KOT
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={handleCreateKOT}
        style={{ padding: '8px', background: '#0f172a', color: '#fff', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '0.75rem', cursor: 'pointer', marginTop: '6px' }}
      >
        + Generate New KOT from Unsaved Order
      </button>
    </div>
  );
};

export default MoveKOTTab;
