import React, { useState, useEffect } from 'react';
import CommonModal from '../../../components/common/CommonModal';
import { kotService } from '../../../services/kotService';
import { LuCheck, LuX } from 'react-icons/lu';
import { FaExclamationTriangle } from 'react-icons/fa';

const CancelKOTModal = ({ isOpen, onClose, kots: initialKots, tableId, onCancelSuccess }) => {
  const [kots, setKots] = useState(initialKots || []);
  const [selectedItems, setSelectedItems] = useState({}); // { kotId: [itemId1, itemId2] }
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedItems({});
      setReason('');
      setError('');
      const filterNC = (kotList) => {
        return (Array.isArray(kotList) ? kotList : []).filter(kot => {
          const extra = typeof kot.extra_details === 'string' ? JSON.parse(kot.extra_details || '{}') : (kot.extra_details || {});
          const isNC = extra.isNC || kot.isNC || kot.ncType || String(kot.remarks || '').toUpperCase().includes('NC') || String(kot.custom_bill_number || '').toUpperCase().includes('NC') || String(kot.id || '').toUpperCase().includes('NC');
          return !isNC;
        });
      };

      if (tableId && !initialKots) {
        setFetching(true);
        kotService.getKOTList({ tableId, table_id: tableId, active: '1' })
          .then(res => {
            const fetchedKots = res?.kots || res?.data || [];
            // Ensure each KOT has items
            setKots(filterNC(fetchedKots));
          })
          .catch(err => {
            console.error('Error fetching KOTs for cancellation:', err);
            setError('Failed to fetch KOTs for this table.');
          })
          .finally(() => setFetching(false));
      } else {
        setKots(filterNC(initialKots));
      }
    }
  }, [isOpen, initialKots, tableId]);

  const hasSelection = Object.values(selectedItems).some(items => Array.isArray(items) && items.length > 0);

  const handleToggleItem = (kotId, itemId) => {
    setSelectedItems(prev => {
      const currentKotItems = prev[kotId] || [];
      if (currentKotItems.includes(itemId)) {
        return { ...prev, [kotId]: currentKotItems.filter(id => id !== itemId) };
      } else {
        return { ...prev, [kotId]: [...currentKotItems, itemId] };
      }
    });
  };

  const handleToggleWholeKot = (kotId, allItemIds) => {
    setSelectedItems(prev => {
      const currentKotItems = prev[kotId] || [];
      if (currentKotItems.length === allItemIds.length) {
        return { ...prev, [kotId]: [] }; // deselect all
      } else {
        return { ...prev, [kotId]: allItemIds }; // select all
      }
    });
  };

  const eligibleKots = (kots || []).filter(kot => {
    const extra = typeof kot.extra_details === 'string' ? JSON.parse(kot.extra_details || '{}') : (kot.extra_details || {});
    const isNC = extra.isNC || kot.isNC || kot.ncType || String(kot.remarks || '').toUpperCase().includes('NC') || String(kot.custom_bill_number || '').startsWith('NC-KOT');
    return !isNC;
  });

  const totalActiveItems = eligibleKots.reduce((acc, kot) => {
    const items = kot.items || kot.sync_kot_item_list || [];
    return acc + items.filter(i => String(i.status) !== '5').length;
  }, 0);

  const totalSelectedItems = Object.values(selectedItems).reduce((acc, list) => acc + (list || []).length, 0);

  const isGlobalAllSelected = totalActiveItems > 0 && totalSelectedItems === totalActiveItems;
  const isGlobalIndeterminate = totalSelectedItems > 0 && totalSelectedItems < totalActiveItems;

  const handleToggleAllGlobal = () => {
    if (isGlobalAllSelected) {
      setSelectedItems({});
    } else {
      const next = {};
      eligibleKots.forEach(kot => {
        const kotId = kot.kot_id || kot.kotId || kot.id;
        const items = kot.items || kot.sync_kot_item_list || [];
        const activeItems = items.filter(i => String(i.status) !== '5');
        next[kotId] = activeItems.map((i, index) => i.id || `item_${index}`);
      });
      setSelectedItems(next);
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for cancellation.');
      return;
    }

    const kotsToProcess = Object.keys(selectedItems).filter(kotId => (selectedItems[kotId] || []).length > 0);
    
    if (kotsToProcess.length === 0) {
      setError('Please select at least one item or KOT to cancel.');
      return;
    }

    try {
      setLoading(true);
      const cancelledItemsList = [];
      
      for (const kotId of kotsToProcess) {
        const itemIds = selectedItems[kotId];
        const kot = kots.find(k => String(k.kot_id) === String(kotId) || String(k.id) === String(kotId) || String(k.kotId) === String(kotId));
        const kotDisplayNo = kot?.custom_bill_number || kot?.id || `KOT-${kotId}`;
        
        const allItems = kot?.items || kot?.sync_kot_item_list || [];
        const activeItems = allItems.filter(i => String(i.status) !== '5');
        const activeItemCount = activeItems.length;
        const isFullCancel = itemIds.length === activeItemCount;

        activeItems.forEach((i, idx) => {
          const id = i.id || `item_${idx}`;
          if (itemIds.includes(id)) {
            cancelledItemsList.push({ ...i, kotNo: kotDisplayNo });
          }
        });

        await kotService.deleteKOT(kotId, {
          reason: reason,
          itemIds: isFullCancel ? undefined : itemIds // send undefined for full cancellation
        });
      }

      if (cancelledItemsList.length > 0) {
        try {
          const { printCancelKOT } = await import('../utils/printCancelKOT');
          const firstKotNo = cancelledItemsList[0]?.kotNo || (kotsToProcess.length > 0 ? kotsToProcess[0] : '');
          printCancelKOT({
            tableLabel: String(tableId).replace('T', ''),
            items: cancelledItemsList,
            reason: reason,
            kotNo: firstKotNo,
            kotId: firstKotNo
          });
        } catch (e) {
          console.error('Print cancel kot error:', e);
        }
      }

      window.showToast?.('Successfully cancelled selected items/KOTs', 'success');
      onCancelSuccess?.();
      onClose?.();
    } catch (err) {
      console.error('Error cancelling KOT:', err);
      setError('Failed to cancel KOTs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitRef = React.useRef({ handleSubmit, onClose, loading, hasSelection });
  useEffect(() => {
    submitRef.current = { handleSubmit, onClose, loading, hasSelection };
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        submitRef.current.onClose?.();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!submitRef.current.loading && submitRef.current.hasSelection) {
          submitRef.current.handleSubmit?.();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cancel KOT / Items"
      maxWidth="550px"
    >
      <div style={{ padding: '8px 4px', display: 'flex', flexDirection: 'column', gap: '14px', fontFamily: 'var(--font-family, system-ui)' }}>
        <h4 style={{ margin: 0, fontSize: '0.92rem', color: '#1e293b', fontWeight: 800 }}>
          Select the items or KOTs you want to cancel:
        </h4>

        {totalActiveItems > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '8px 12px',
            borderRadius: '8px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 800, color: '#1e293b' }}>
              <input
                type="checkbox"
                checked={isGlobalAllSelected}
                ref={input => { if (input) input.indeterminate = isGlobalIndeterminate; }}
                onChange={handleToggleAllGlobal}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#ef4444' }}
              />
              Select All ({totalActiveItems} items across all KOTs)
            </label>
            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: totalSelectedItems > 0 ? '#b91c1c' : '#64748b' }}>
              {totalSelectedItems} of {totalActiveItems} selected
            </span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '40vh', overflowY: 'auto', WebkitOverflowScrolling: 'touch', paddingRight: '8px', paddingBottom: '10px' }}>
          {eligibleKots.map(kot => {
            const kotId = kot.kot_id || kot.kotId || kot.id;
            const items = kot.items || kot.sync_kot_item_list || [];
            const activeItems = items.filter(i => String(i.status) !== '5'); // Exclude already cancelled
            const allItemIds = activeItems.map((i, index) => i.id || `item_${index}`);
            const selectedItemIds = selectedItems[kotId] || [];
            const isAllSelected = allItemIds.length > 0 && selectedItemIds.length === allItemIds.length;
            const isIndeterminate = selectedItemIds.length > 0 && selectedItemIds.length < allItemIds.length;

            if (activeItems.length === 0) return null;

            return (
              <div key={kotId} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                {/* KOT Header */}
                <div 
                  tabIndex={0}
                  style={{ background: '#f8fafc', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: '1px solid #e2e8f0', outline: 'none' }}
                  onClick={() => handleToggleWholeKot(kotId, allItemIds)}
                  onKeyDown={e => {
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      handleToggleWholeKot(kotId, allItemIds);
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="checkbox" 
                      checked={isAllSelected}
                      ref={input => { if (input) input.indeterminate = isIndeterminate; }}
                      onChange={(e) => { e.stopPropagation(); handleToggleWholeKot(kotId, allItemIds); }}
                      style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#ef4444' }}
                    />
                    <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>
                      {kot.custom_bill_number || kot.id || `KOT-${kotId}`}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', background: '#e2e8f0', padding: '2px 8px', borderRadius: '12px' }}>
                    {activeItems.length} items
                  </span>
                </div>

                {/* KOT Items */}
                <div style={{ padding: '4px 0', background: '#fff' }}>
                  {activeItems.map((item, index) => {
                    // Fix missing IDs if they don't have item.id
                    const itemKey = item.id || `item_${index}`;
                    const itemName = item.itemName || item.name || 'Unknown Item';
                    const variantName = item.variantName || item.variation_name || '';
                    const qty = item.qty || item.quantity || 1;
                    const price = item.unitPrice || item.price || item.item_price || 0;
                    const amount = item.total || item.amount || (qty * price) || 0;
                    
                    return (
                    <div 
                      key={itemKey}
                      tabIndex={0}
                      onClick={() => handleToggleItem(kotId, itemKey)}
                      onKeyDown={e => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          handleToggleItem(kotId, itemKey);
                        }
                      }}
                      style={{ 
                        padding: '8px 14px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        cursor: 'pointer',
                        background: selectedItemIds.includes(itemKey) ? '#fef2f2' : 'transparent',
                        borderBottom: '1px solid #f1f5f9',
                        outline: 'none'
                      }}
                    >
                      <input 
                        type="checkbox"
                        checked={selectedItemIds.includes(itemKey)}
                        onChange={() => {}} // handled by parent div onClick
                        style={{ width: '14px', height: '14px', cursor: 'pointer', accentColor: '#ef4444' }}
                      />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                          {itemName}
                        </span>
                        {variantName && (
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{variantName}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
                        Qty: {qty}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', width: '60px', textAlign: 'right' }}>
                        ₹{amount}
                      </div>
                    </div>
                  )})}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>Reason for cancellation:</span>
          <textarea
            placeholder="Enter cancellation reason..."
            rows={2}
            value={reason}
            onChange={e => {
              setReason(e.target.value);
              if (e.target.value.trim()) setError('');
            }}
            onKeyDown={e => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              border: error ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
              fontSize: '0.85rem',
              fontWeight: '700',
              outline: 'none',
              background: '#f8fafc',
              color: '#0f172a',
              resize: 'none',
              fontFamily: 'inherit'
            }}
          />
          {error && (
            <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FaExclamationTriangle size={14} /> {error}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              background: '#fff',
              color: '#475569',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            Close (Esc)
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !hasSelection}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: (!hasSelection || loading) ? '#fca5a5' : '#ef4444',
              color: '#fff',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: (!hasSelection || loading) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {loading ? 'Processing...' : <><LuX size={16} /> Confirm Cancellation (Ctrl+↵)</>}
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default CancelKOTModal;
