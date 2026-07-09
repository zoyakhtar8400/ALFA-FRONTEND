import React from 'react';
import { FaTrash } from 'react-icons/fa';
import { MOCK_MENU_ITEMS } from '../../constants/mockData';

const MoveItemsTab = ({
  fromTableId,
  activeSourceItems,
  selectedTransferItems,
  setSelectedTransferItems,
  newItemName,
  setNewItemName,
  newItemQty,
  setNewItemQty,
  handleAddItemToOps,
  handleToggleItemComplimentary,
  handleDeleteItem,
}) => {
  if (!fromTableId) return <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Select a From Table first.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>SELECT ITEM QUANTITIES TO TRANSFER</span>

      {activeSourceItems.length === 0 ? (
        <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>No active order items found.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {activeSourceItems.map(item => {
            const currentQty = selectedTransferItems[item.name] || 0;
            return (
              <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem' }}>
                <span style={{ fontWeight: 600 }}>
                  {item.name}{' '}
                  {item.isComplimentary && <span style={{ color: '#10b981', fontSize: '0.68rem', fontWeight: 800 }}>(COMP)</span>}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleToggleItemComplimentary(item.name)}
                    style={{ background: 'none', border: 'none', color: item.isComplimentary ? '#64748b' : '#10b981', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}
                  >
                    {item.isComplimentary ? 'Remove Comp' : 'Comp'}
                  </button>
                  <span style={{ color: '#64748b', fontSize: '0.72rem' }}>Transfer:</span>
                  <input
                    type="number" min="0" max={item.qty} value={currentQty}
                    onChange={(e) => {
                      const val = Math.min(item.qty, Math.max(0, parseInt(e.target.value) || 0));
                      setSelectedTransferItems(prev => ({ ...prev, [item.name]: val }));
                    }}
                    style={{ width: '45px', padding: '2px 4px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }}
                  />
                  <span style={{ color: '#64748b' }}>/ {item.qty}</span>
                  <button
                    onClick={() => handleDeleteItem(item.name)}
                    style={{ background: 'none', border: 'none', color: '#ef4444', marginLeft: '4px', cursor: 'pointer' }}
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Item */}
      <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '6px' }}>
        <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>ADD NEW ITEM</span>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '8px' }}>
          <select
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem', background: '#fff' }}
          >
            {MOCK_MENU_ITEMS.map(m => (
              <option key={m.name} value={m.name}>{m.name} (₹{m.rate})</option>
            ))}
          </select>
          <input
            type="number" min="1" value={newItemQty}
            onChange={(e) => setNewItemQty(Math.max(1, parseInt(e.target.value) || 1))}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.78rem', textAlign: 'center' }}
          />
          <button
            onClick={handleAddItemToOps}
            style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.72rem', cursor: 'pointer' }}
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveItemsTab;
