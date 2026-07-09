import React from 'react';
import { MOCK_WAITERS, MOCK_CAPTAINS } from '../../constants/mockData';

const StatusStaffTab = ({
  fromTableId,
  tables,
  selectedGuests,
  setSelectedGuests,
  selectedWaiter,
  setSelectedWaiter,
  selectedCaptain,
  setSelectedCaptain,
  updateTableField,
  updateTableStatus,
  toggleHoldOrder,
  cancelCompleteOrder,
}) => {
  const srcTable = tables.find(t => String(t.id) === fromTableId);
  if (!fromTableId || !srcTable) return <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Select a From Table to manage.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>TABLE STATUS</label>
          <select
            value={srcTable.status || 'Running'}
            onChange={(e) => updateTableStatus(parseInt(fromTableId), e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#fff' }}
          >
            {['Blank','Reserved','Running','KOT Generated','Food Served','Bill Generated','Payment Pending','Paid','Cleaning'].map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>GUESTS (PAX)</label>
          <input
            type="number" min="1" max="20" value={selectedGuests}
            onChange={(e) => {
              const val = Math.max(1, parseInt(e.target.value) || 1);
              setSelectedGuests(val);
              updateTableField(parseInt(fromTableId), 'seats', val);
            }}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>WAITER</label>
          <select
            value={selectedWaiter}
            onChange={(e) => { setSelectedWaiter(e.target.value); updateTableField(parseInt(fromTableId), 'waiter', e.target.value || null); }}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#fff' }}
          >
            <option value="">Unassigned</option>
            {MOCK_WAITERS.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#475569', marginBottom: '4px' }}>CAPTAIN</label>
          <select
            value={selectedCaptain}
            onChange={(e) => { setSelectedCaptain(e.target.value); updateTableField(parseInt(fromTableId), 'captain', e.target.value || null); }}
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem', background: '#fff' }}
          >
            <option value="">Unassigned</option>
            {MOCK_CAPTAINS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <button
            onClick={() => toggleHoldOrder(parseInt(fromTableId))}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', background: srcTable.isHold ? '#10b981' : '#f59e0b', color: '#fff', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            {srcTable.isHold ? 'Resume Order' : 'Hold Order'}
          </button>
          <button
            onClick={() => cancelCompleteOrder(parseInt(fromTableId))}
            style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Cancel Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusStaffTab;
