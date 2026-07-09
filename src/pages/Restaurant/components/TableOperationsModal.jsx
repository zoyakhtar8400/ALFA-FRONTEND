import React from 'react';
import { FaTimes } from 'react-icons/fa';

import StatusStaffTab from './tabs/StatusStaffTab';
import MoveKOTTab from './tabs/MoveKOTTab';
import MoveItemsTab from './tabs/MoveItemsTab';
import SettlePaymentTab from './tabs/SettlePaymentTab';

const TABS = [
  { id: 'status', label: 'Status & Staff' },
  { id: 'Move', label: 'Move / Merge' },
  { id: 'MoveKOT', label: 'Move KOT' },
  { id: 'MoveItems', label: 'Move Items' },
  { id: 'Split', label: 'Split Bill' },
  { id: 'settle', label: 'Settle Payment' },
];

const TableOperationsModal = (props) => {
  const {
    isOpen, onClose,
    tables,
    modalTab, setModalTab,
    fromTableId, setFromTableId,
    toTableId, setToTableId,
    transferOp, setTransferOp,
    selectedTransferItems, setSelectedTransferItems,
    selectedTransferKots, setSelectedTransferKots,
    equalSplitCount, setEqualSplitCount,
    splitPercentSource, setSplitPercentSource,
    discountPercent, setDiscountPercent,
    paymentMethod, setPaymentMethod,
    splitCash, setSplitCash,
    splitCard, setSplitCard,
    splitUPI, setSplitUPI,
    newItemName, setNewItemName,
    newItemQty, setNewItemQty,
    newItemRemarks, setNewItemRemarks,
    selectedGuests, setSelectedGuests,
    selectedWaiter, setSelectedWaiter,
    selectedCaptain, setSelectedCaptain,
    activeSourceItems,
    showSettleSuccess,
    updateTableField, updateTableStatus,
    toggleHoldOrder, cancelCompleteOrder,
    handleAddItemToOps, handleUpdateItemQty,
    handleToggleItemComplimentary, handleDeleteItem,
    handleCreateKOT, handleCancelKOT,
    executePaymentSettlement, getBillingSummary,
    handleModalOkClick,
  } = props;

  if (!isOpen) return null;

  const bill = getBillingSummary();
  const toast = (msg) => {
    const el = document.createElement('div');
    el.innerText = msg;
    Object.assign(el.style, { position: 'fixed', bottom: '20px', right: '20px', backgroundColor: '#0e7490', color: '#fff', padding: '12px 24px', borderRadius: '8px', zIndex: '9999', fontSize: '0.85rem', fontWeight: '700' });
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  };

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.15)', backdropFilter: 'blur(1.5px)', zIndex: 999 }} />

      {/* Modal box */}
      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '650px', maxWidth: '95%', padding: '24px', zIndex: 1000, fontFamily: 'system-ui', color: '#0f172a' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Table Operations</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>
            <FaTimes />
          </button>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '16px' }}>
          {TABS.map(tab => {
            const active = modalTab === tab.id;
            return (
              <button key={tab.id}
                onClick={() => { setModalTab(tab.id); setSelectedTransferItems({}); setSelectedTransferKots({}); }}
                style={{ padding: '5px 10px', borderRadius: '6px', fontSize: '0.73rem', fontWeight: 700, border: 'none', cursor: 'pointer', background: active ? '#0f172a' : '#f1f5f9', color: active ? '#fff' : '#64748b', transition: 'all 120ms', whiteSpace: 'nowrap' }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Table Wise capsules */}
        <div style={{ textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '8px' }}>Table Wise</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
          {tables.map(t => {
            const active = t.status !== 'Blank';
            const isFrom = fromTableId === String(t.id);
            const isTo = toTableId === String(t.id);
            return (
              <div key={t.id}
                onClick={() => { if (active) { setFromTableId(String(t.id)); setSelectedGuests(t.seats || 4); setSelectedWaiter(t.waiter || ''); setSelectedCaptain(t.captain || ''); } else { setToTableId(String(t.id)); } }}
                style={{ border: isFrom ? '2px solid #3b82f6' : isTo ? '2px solid #db2777' : active ? '1px solid #eab308' : '1px dashed #cbd5e1', background: active ? '#ffff00' : '#fff', color: active ? '#0f172a' : '#475569', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', userSelect: 'none', transition: 'all 120ms' }}
              >
                T{parseInt(t.no)}
              </div>
            );
          })}
        </div>

        {/* From / To selects + OK / CLOSE */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '16px', fontSize: '0.82rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontWeight: 'bold' }}>From Table:-</span>
            <select value={fromTableId} onChange={(e) => { setFromTableId(e.target.value); setSelectedTransferItems({}); setSelectedTransferKots({}); const tObj = tables.find(t => String(t.id) === e.target.value); if (tObj) { setSelectedGuests(tObj.seats || 4); setSelectedWaiter(tObj.waiter || ''); setSelectedCaptain(tObj.captain || ''); } }}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.8rem' }}>
              <option value="">Select...</option>
              {tables.filter(t => t.status !== 'Blank').map(t => <option key={t.id} value={t.id}>T{parseInt(t.no)} (₹{t.amount.toLocaleString('en-IN')})</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ fontWeight: 'bold' }}>To Table:-</span>
            <select value={toTableId} onChange={(e) => setToTableId(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.8rem' }}>
              <option value="">Select...</option>
              {tables.map(t => <option key={t.id} value={t.id}>T{parseInt(t.no)} ({t.status})</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
            <button onClick={handleModalOkClick} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer' }}>OK</button>
            <button onClick={onClose} style={{ background: '#db2777', color: '#fff', border: 'none', borderRadius: '6px', padding: '8px 16px', fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer' }}>CLOSE</button>
          </div>
        </div>

        {/* Tab content panel */}
        <div style={{ maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>

          {modalTab === 'status' && (
            <StatusStaffTab
              fromTableId={fromTableId} tables={tables}
              selectedGuests={selectedGuests} setSelectedGuests={setSelectedGuests}
              selectedWaiter={selectedWaiter} setSelectedWaiter={setSelectedWaiter}
              selectedCaptain={selectedCaptain} setSelectedCaptain={setSelectedCaptain}
              updateTableField={updateTableField} updateTableStatus={updateTableStatus}
              toggleHoldOrder={toggleHoldOrder} cancelCompleteOrder={cancelCompleteOrder}
            />
          )}

          {modalTab === 'Move' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>OPERATION MODE</label>
              <select value={transferOp} onChange={(e) => setTransferOp(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 700, color: '#475569', background: '#fff' }}>
                <option value="Move">Move Complete Order</option>
                <option value="Merge">Merge Orders (Into Target Table)</option>
              </select>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>* Transfers active order details, timer and seating specs to target table.</span>
            </div>
          )}

          {modalTab === 'MoveKOT' && (
            <MoveKOTTab
              fromTableId={fromTableId} tables={tables}
              selectedTransferKots={selectedTransferKots} setSelectedTransferKots={setSelectedTransferKots}
              handleCancelKOT={handleCancelKOT} handleCreateKOT={handleCreateKOT}
            />
          )}

          {modalTab === 'MoveItems' && (
            <MoveItemsTab
              fromTableId={fromTableId} activeSourceItems={activeSourceItems}
              selectedTransferItems={selectedTransferItems} setSelectedTransferItems={setSelectedTransferItems}
              newItemName={newItemName} setNewItemName={setNewItemName}
              newItemQty={newItemQty} setNewItemQty={setNewItemQty}
              handleAddItemToOps={handleAddItemToOps}
              handleToggleItemComplimentary={handleToggleItemComplimentary}
              handleDeleteItem={handleDeleteItem}
            />
          )}

          {modalTab === 'Split' && fromTableId && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                ['Equal Split Count', equalSplitCount, setEqualSplitCount, () => { const amt = Math.round(bill.grandTotal / equalSplitCount); toast(`${equalSplitCount} checks of ₹${amt.toLocaleString('en-IN')} each.`); }],
                ['Split Percentage (%)', splitPercentSource, setSplitPercentSource, () => { const a = Math.round(bill.grandTotal * (splitPercentSource / 100)); toast(`Check A: ₹${a.toLocaleString('en-IN')} / Check B: ₹${(bill.grandTotal - a).toLocaleString('en-IN')}`); }],
              ].map(([label, val, setter, preview]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{label}:</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input type="number" min="2" value={val} onChange={(e) => setter(Math.max(2, parseInt(e.target.value) || 2))}
                      style={{ width: '50px', padding: '4px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }} />
                    <button onClick={preview} style={{ padding: '4px 10px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 'bold' }}>Preview</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {modalTab === 'settle' && (
            <SettlePaymentTab
              fromTableId={fromTableId}
              discountPercent={discountPercent} setDiscountPercent={setDiscountPercent}
              paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
              splitCash={splitCash} setSplitCash={setSplitCash}
              splitCard={splitCard} setSplitCard={setSplitCard}
              splitUPI={splitUPI} setSplitUPI={setSplitUPI}
              getBillingSummary={getBillingSummary}
              executePaymentSettlement={executePaymentSettlement}
              showSettleSuccess={showSettleSuccess}
            />
          )}

        </div>
      </div>
    </>
  );
};

export default TableOperationsModal;
