import React, { useCallback } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';

import POSHeader from './POSHeader';
import CustomerDrawer from './CustomerDrawer';
import TableSelector from './TableSelector';
import PaxModal from './PaxModal';
import RemarksModal from './RemarksModal';
import GSTModal from './GSTModal';
import CustomerSettingsModal from './CustomerSettingsModal';
import POSPaymentBar from './POSPaymentBar';
import POSSummaryBar from './POSSummaryBar';
import POSActionButtons from './POSActionButtons';
import POSFooterStatus from './POSFooterStatus';
import ClearConfirmModal from './ClearConfirmModal';
import KOTPrintModal from './KOTPrintModal';

const BillingPanel = ({
  isBillingDesk = false,
  isFullWidth = false,
  serviceType,
  setServiceType,
  assignedTableId,
  setAssignedTableId,
  tablesList,
  routedTable,
  customerName,
  setCustomerName,
  mobileNumber,
  setMobileNumber,
  paxCount,
  setPaxCount,
  paxAdults,
  setPaxAdults,
  paxChildren,
  setPaxChildren,
  remarks,
  setRemarks,
  waiter,
  setWaiter,
  captain,
  isPaid,
  setIsPaid,
  paymentMode,
  setPaymentMode,
  rows,
  setRows,
  allMenuItems,
  handleGridKeyDown,
  handleRemoveRow,
  updateRowField,
  handleVariantChange,
  handleAddEmptyRow,
  INITIAL_ROWS,
  showDiscountPanel,
  setShowDiscountPanel,
  discountLines,
  setDiscountLines,
  updateDiscountLine,
  removeDiscountLine,
  addDiscountLine,
  totalDiscountAmt,
  totalBill,
  netBill,
  handleConfirmBooking,
  handleSaveAndPrint,
  handleDirectComplete,
  handleAddKOT,
  generatedKotNo,
  gstin,
  setGstin,
  customerSettings,
  setCustomerSettings,
  isTableModalOpen,
  setIsTableModalOpen,
  isCustomerDrawerOpen,
  setIsCustomerDrawerOpen,
  isPaxModalOpen,
  setIsPaxModalOpen,
  isRemarksModalOpen,
  setIsRemarksModalOpen,
  isGstModalOpen,
  setIsGstModalOpen,
  isSettingsModalOpen,
  setIsSettingsModalOpen,
  isClearModalOpen,
  setIsClearModalOpen,
  showVariantModal,
  setShowVariantModal,
  variantModalItem,
  addOrUpdateItemRow,
  isSettling,
  showKotPrintModal,
  setShowKotPrintModal,
  kotGroups,
  kotPayloads,
  kotSuccessCallbackRef,
  toast
}) => {
  const [isFooterCollapsed, setIsFooterCollapsed] = React.useState(false);

  const containerStyle = isFullWidth
    ? {
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        background: '#fff',
        position: 'relative',
        overflowY: 'auto'
      }
    : {
        width: '420px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        background: '#fff',
        boxShadow: '-4px 0 15px rgba(0,0,0,0.03)',
        position: 'relative',
        zIndex: 10,
        overflowY: 'auto'
      };

  const currentAssignedTable = tablesList.find(t =>
    String(t.id) === String(assignedTableId) ||
    String(t.no) === String(assignedTableId) ||
    (t.no && assignedTableId && String(assignedTableId).replace(/[^0-9]/g, '') === String(t.no).replace(/[^0-9]/g, ''))
  ) || routedTable;
  const resolvedAssignedTableNo = currentAssignedTable?.no || assignedTableId || routedTable?.no || '';

  return (
    <div className="pos-billing-section" style={containerStyle}>
      <POSHeader
        isBillingDesk={isBillingDesk}
        serviceType={serviceType}
        setServiceType={setServiceType}
        assignedTableNo={resolvedAssignedTableNo}
        customerName={customerName}
        paxCount={paxCount}
        hasRemarks={!!remarks}
        waiter={waiter}
        onWaiterChange={useCallback((val) => setWaiter(val), [setWaiter])}
        isPaid={isPaid}
        onTableClick={useCallback(() => setIsTableModalOpen(true), [setIsTableModalOpen])}
        onCustomerClick={useCallback(() => setIsCustomerDrawerOpen(true), [setIsCustomerDrawerOpen])}
        onPaxClick={useCallback(() => setIsPaxModalOpen(true), [setIsPaxModalOpen])}
        onRemarksClick={useCallback(() => setIsRemarksModalOpen(true), [setIsRemarksModalOpen])}
      />

      {/* Interactive billing item rows ledger */}
      <div style={{ padding: '8px', flex: '1 0 auto', minHeight: '220px', overflowX: 'hidden', overflowY: 'visible', maxWidth: '100%' }}>
        <table className="custom-table-element" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0e7490', color: '#fff', fontSize: '0.72rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '6px 2px', textAlign: 'center', width: '24px' }}></th>
              <th style={{ padding: '6px 4px', textAlign: 'left', width: '38%' }}>Items</th>
              <th style={{ padding: '6px 4px', textAlign: 'left', width: '22%' }}>Remark</th>
              <th style={{ padding: '6px 2px', textAlign: 'center', width: '12%' }}>Qty</th>
              <th style={{ padding: '6px 2px', textAlign: 'center', width: '14%' }}>Price</th>
              <th style={{ padding: '6px 4px', textAlign: 'right', width: '14%' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>🛒</div>
                  <div>No Active Order</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>Select menu items on the left to start billing</div>
                </td>
              </tr>
            ) : (
              rows.map((row, index) => {
              const matchItem = allMenuItems.find(f =>
                (f.id && row.itemId && String(f.id) === String(row.itemId)) ||
                (f.name && (row.itemName || row.name || row.title) && String(f.name).toLowerCase() === String(row.itemName || row.name || row.title).toLowerCase())
              );
              return (
                <tr key={row.lineId || index} style={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
                  <td style={{ padding: '4px 2px', textAlign: 'center' }}>
                    <button
                      type="button"
                      data-row={index}
                      data-col={0}
                      onKeyDown={e => handleGridKeyDown(e, index, 0)}
                      onClick={() => handleRemoveRow(index)}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}
                    >
                      <FaTimes size={12} />
                    </button>
                  </td>
                  <td style={{ padding: '4px 2px' }}>
                    {(() => {
                      const rawName = row.itemName || row.name || row.title || row.item_name || '';
                      let selectedVal = '';
                      if (rawName) {
                        const exactMatch = allMenuItems.find(i => i.name === rawName);
                        if (exactMatch) {
                          selectedVal = exactMatch.name;
                        } else {
                          const ciMatch = allMenuItems.find(i => (i.name || '').toLowerCase() === rawName.toLowerCase());
                          selectedVal = ciMatch ? ciMatch.name : rawName;
                        }
                      }
                      const hasSelectedInOptions = allMenuItems.some(i => i.name === selectedVal);

                      return (
                        <select
                          data-row={index}
                          data-col={1}
                          onKeyDown={e => handleGridKeyDown(e, index, 1)}
                          value={selectedVal}
                          onChange={e => updateRowField(index, 'itemName', e.target.value)}
                          style={{ width: '100%', boxSizing: 'border-box', padding: '4px 2px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.72rem', fontWeight: 600 }}
                        >
                          <option value="">SELECT ITEM...</option>
                          {selectedVal && !hasSelectedInOptions && (
                            <option value={selectedVal}>{selectedVal}</option>
                          )}
                          {allMenuItems.filter(item => item.active !== 'No').map((item, idx) => (
                            <option key={item.id ? `${item.id}-${item.name}-${idx}` : item.name || idx} value={item.name}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      );
                    })()}

                    {matchItem?.variants && matchItem.variants.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '2px', fontSize: '0.65rem', flexWrap: 'wrap' }}>
                        {matchItem.variants.map(variant => (
                          <label key={variant.id} style={{ display: 'flex', alignItems: 'center', gap: '2px', cursor: 'pointer', fontWeight: '700' }}>
                            <input
                              type="radio"
                              name={`variant-${index}-${row.lineId || index}`}
                              checked={row.variantId === variant.id}
                              onChange={() => handleVariantChange(index, variant.id)}
                            /> {variant.name}
                          </label>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '4px 2px' }}>
                    <input
                      type="text"
                      data-row={index}
                      data-col={2}
                      onKeyDown={e => handleGridKeyDown(e, index, 2)}
                      value={row.remark || ''}
                      onChange={e => updateRowField(index, 'remark', e.target.value)}
                      placeholder="REMARKS"
                      style={{ width: '100%', boxSizing: 'border-box', padding: '4px 4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.72rem' }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', textAlign: 'center' }}>
                    <input
                      type="number"
                      min="1"
                      data-row={index}
                      data-col={3}
                      onKeyDown={e => handleGridKeyDown(e, index, 3)}
                      value={row.qty}
                      onChange={e => updateRowField(index, 'qty', parseInt(e.target.value) || 1)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '4px 2px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.72rem', textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ padding: '4px 2px', textAlign: 'center' }}>
                    <input
                      type="number"
                      min="0"
                      data-row={index}
                      data-col={4}
                      onKeyDown={e => handleGridKeyDown(e, index, 4)}
                      value={row.unitPrice || row.price || 0}
                      onChange={e => updateRowField(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '4px 2px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.72rem', textAlign: 'center' }}
                    />
                  </td>
                  <td style={{ padding: '4px 4px', textAlign: 'right', fontSize: '0.74rem', fontWeight: 700 }}>
                    {(row.qty * (row.unitPrice || row.price || 0)).toFixed(2)}
                  </td>
                </tr>
              );
            }))}
          </tbody>
        </table>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
          <button type="button" onClick={handleAddEmptyRow}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px dashed #0e7490', background: 'transparent', color: '#0e7490', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FaPlus size={10} /> Add Item Row
          </button>
          <button type="button" onClick={useCallback(() => setIsClearModalOpen(true), [setIsClearModalOpen])}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'transparent', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Clear Cart
          </button>
          <button type="button" onClick={useCallback(() => setIsGstModalOpen(true), [setIsGstModalOpen])}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'transparent', color: '#0e7490', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
          >
            GSTIN
          </button>
          <button type="button" onClick={useCallback(() => setIsSettingsModalOpen(true), [setIsSettingsModalOpen])}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'transparent', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Account settings
          </button>
        </div>
      </div>

      {/* ── Collapsible Payment Options & Discount Dock (Only hides Discount & Payment Mode Pills) ── */}
      <div style={{ background: '#fff', borderTop: '1px solid #cbd5e1' }}>
        {/* Header Toggle Handle Bar */}
        <div
          onClick={() => setIsFooterCollapsed(!isFooterCollapsed)}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '6px 14px',
            background: isFooterCollapsed ? '#fff7ed' : '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            cursor: 'pointer', fontSize: '0.74rem', fontWeight: 800,
            color: isFooterCollapsed ? '#c2410c' : '#475569',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = isFooterCollapsed ? '#ffedd5' : '#f1f5f9'}
          onMouseLeave={e => e.currentTarget.style.background = isFooterCollapsed ? '#fff7ed' : '#f8fafc'}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {isFooterCollapsed ? '💳 + Add Discount & Payment Method (Cash, Card, Due)' : '💳 Payment & Discount Options'}
          </span>
          <span style={{
            fontSize: '0.68rem', fontWeight: 800,
            background: isFooterCollapsed ? '#ffedd5' : '#e2e8f0',
            color: isFooterCollapsed ? '#9a3412' : '#334155',
            padding: '2px 8px', borderRadius: '4px'
          }}>
            {isFooterCollapsed ? '▲ Expand' : '▼ Collapse'}
          </span>
        </div>

        {!isFooterCollapsed && (
          <>
            {/* ── Discount Panel ───────────────────────────────────────── */}
            <div style={{ padding: '6px 8px 6px' }}>
              {!showDiscountPanel ? (
                <button
                  type="button"
                  onClick={() => setShowDiscountPanel(true)}
                  style={{
                    padding: '6px 14px', borderRadius: '6px',
                    border: '1.5px dashed #f97316', background: 'transparent',
                    color: '#f97316', fontSize: '0.75rem', fontWeight: 800,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fff7ed'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  🏷️ Add Discount
                </button>
              ) : (
                <div style={{
                  background: '#fffbf5', border: '1.5px solid #fed7aa',
                  borderRadius: '10px', padding: '10px 12px'
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      🏷️ Discount Options
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDiscountPanel(false)}
                      style={{
                        background: '#ffedd5', border: '1px solid #fdba74', borderRadius: '4px',
                        padding: '3px 8px', color: '#c2410c', fontSize: '0.72rem', fontWeight: 800,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      ▲ Collapse Discount
                    </button>
                  </div>

                  {/* Discount lines */}
                  {discountLines.map((line) => (
                    <div key={line.id} style={{
                      display: 'grid',
                      gridTemplateColumns: '100px 80px 1fr auto',
                      gap: '6px', alignItems: 'center', marginBottom: '8px'
                    }}>
                      {/* Type toggle */}
                      <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid #fdba74' }}>
                        {['Percentage', 'Fixed'].map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => updateDiscountLine(line.id, 'type', t)}
                            style={{
                              flex: 1, padding: '5px 0', fontSize: '0.68rem', fontWeight: 800, border: 'none',
                              background: line.type === t ? '#f97316' : '#fff',
                              color: line.type === t ? '#fff' : '#9a3412',
                              cursor: 'pointer', transition: 'all 0.15s'
                            }}
                          >
                            {t === 'Percentage' ? '%' : '₹'}
                          </button>
                        ))}
                      </div>

                      {/* Value input */}
                      <input
                        type="number"
                        min="0"
                        max={line.type === 'Percentage' ? 100 : undefined}
                        step="0.01"
                        placeholder={line.type === 'Percentage' ? '0%' : '0.00'}
                        value={line.value}
                        onChange={e => updateDiscountLine(line.id, 'value', e.target.value)}
                        style={{
                          padding: '6px 8px', borderRadius: '6px', border: '1px solid #fdba74',
                          fontSize: '0.78rem', fontWeight: 700, textAlign: 'right', outline: 'none',
                          background: '#fff', color: '#1e293b'
                        }}
                      />

                      {/* Reason input */}
                      <input
                        type="text"
                        placeholder="Reason / Note"
                        value={line.reason}
                        onChange={e => updateDiscountLine(line.id, 'reason', e.target.value)}
                        style={{
                          padding: '6px 8px', borderRadius: '6px', border: '1px solid #fdba74',
                          fontSize: '0.75rem', outline: 'none', background: '#fff', color: '#475569'
                        }}
                      />

                      {/* Remove line */}
                      <button
                        type="button"
                        onClick={() => removeDiscountLine(line.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem', padding: '2px 4px' }}
                      >✕</button>
                    </div>
                  ))}

                  {/* Add more discount + computed total */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '8px', borderTop: '1px dashed #fed7aa' }}>
                    <button
                      type="button"
                      onClick={addDiscountLine}
                      style={{
                        padding: '4px 10px', borderRadius: '5px',
                        border: '1px dashed #f97316', background: 'transparent',
                        color: '#f97316', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer'
                      }}
                    >
                      + Add More Discount
                    </button>
                    {totalDiscountAmt > 0 && (
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#16a34a' }}>
                        Saving ₹{totalDiscountAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Modes */}
            <POSPaymentBar
              activeMode={paymentMode}
              onSelectMode={setPaymentMode}
              isPaid={isPaid}
              onChangeIsPaid={setIsPaid}
            />
          </>
        )}
      </div>

      {/* ALWAYS VISIBLE: Summary Bar (Total & Split), Action Buttons (Save F5 - Hold Draft F10), Footer Status */}
      <POSSummaryBar
        totalBill={netBill}
        discountAmt={totalDiscountAmt}
        originalBill={totalBill}
        onSplitClick={() => { if (toast) toast('Bill split modal triggered'); }}
      />

      <POSActionButtons
        onSave={handleConfirmBooking}
        onSaveAndPrint={handleSaveAndPrint}
        onSaveAndEBill={handleDirectComplete}
        onKOT={handleAddKOT}
        onKOTAndPrint={handleSaveAndPrint}
        onHold={handleConfirmBooking}
      />

      <POSFooterStatus
        billNo={generatedKotNo ? `BILL-${generatedKotNo.split('-')[1] || '000123'}` : 'BILL-000123'}
        cashierName={captain || 'Admin'}
        outletName="Main Restaurant"
      />

      {/* Dynamic Overlay Dialogs & Sidebar Drawers */}
      <TableSelector
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        tablesList={tablesList}
        currentTableId={assignedTableId}
        onSelectTable={(table) => {
          setAssignedTableId(table.id);
          if (toast) toast(`Assigned to Table ${table.no}`);
        }}
      />

      <CustomerDrawer
        isOpen={isCustomerDrawerOpen}
        onClose={() => setIsCustomerDrawerOpen(false)}
        currentCustomer={{ phone: mobileNumber, name: customerName }}
        onSaveCustomer={(cust) => {
          setCustomerName(cust.name);
          setMobileNumber(cust.phone);
          if (toast) toast(`Linked customer: ${cust.name}`);
        }}
      />

      <PaxModal
        isOpen={isPaxModalOpen}
        onClose={() => setIsPaxModalOpen(false)}
        adults={paxAdults}
        children={paxChildren}
        onSavePax={(a, c) => {
          setPaxAdults(a);
          setPaxChildren(c);
          setPaxCount(a + c);
          if (toast) toast(`Covers set: ${a} Adults, ${c} Children`);
        }}
      />

      <RemarksModal
        isOpen={isRemarksModalOpen}
        onClose={() => setIsRemarksModalOpen(false)}
        remarks={remarks}
        onSaveRemarks={(text) => {
          setRemarks(text);
          if (toast) toast('Kitchen instructions saved.');
        }}
      />

      <GSTModal
        isOpen={isGstModalOpen}
        onClose={() => setIsGstModalOpen(false)}
        gstin={gstin}
        onSaveGSTIN={(val) => {
          setGstin(val);
          if (toast) toast(`GSTIN set to: ${val}`);
        }}
      />

      <CustomerSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={customerSettings}
        onSaveSettings={(settingsObj) => {
          setCustomerSettings(settingsObj);
          if (toast) toast('Customer accounts configuration saved.');
        }}
      />

      <ClearConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={() => {
          setRows(INITIAL_ROWS);
          if (toast) toast('Draft cart cleared.');
        }}
      />

      {/* Success settlements animation */}
      {isSettling && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '40px', textAlign: 'center',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', width: '360px', fontFamily: 'system-ui'
          }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', fontSize: '2rem'
            }}>
              ✓
            </div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: '0 0 8px 0' }}>
              Payment Completed
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, fontWeight: 500 }}>
              Transaction Settled Successfully
            </p>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block', marginTop: '16px' }}>
              Resetting checkout registers...
            </span>
          </div>
        </div>
      )}

      {/* Variant Selection Modal */}
      {showVariantModal && variantModalItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-family, system-ui)'
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '24px', width: '360px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0e7490', margin: 0 }}>
                Select Variant
              </h3>
              <button
                onClick={() => setShowVariantModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                <FaTimes />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {variantModalItem.variants.map((v, idx) => (
                <button
                  key={v.id}
                  type="button"
                  autoFocus={idx === 0}
                  className="variant-select-btn"
                  data-idx={idx}
                  onClick={() => {
                    addOrUpdateItemRow(variantModalItem, v);
                    setShowVariantModal(false);
                    if (toast) toast(`Added: ${variantModalItem.name} (${v.name})`);
                  }}
                  onKeyDown={e => {
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      const next = document.querySelector(`.variant-select-btn[data-idx="${Math.min(variantModalItem.variants.length - 1, idx + 1)}"]`);
                      if (next) next.focus();
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      const prev = document.querySelector(`.variant-select-btn[data-idx="${Math.max(0, idx - 1)}"]`);
                      if (prev) prev.focus();
                    }
                  }}
                  style={{
                    padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1',
                    background: '#f8fafc', fontWeight: 700, textAlign: 'left', cursor: 'pointer',
                    fontSize: '0.85rem', color: '#334155', display: 'flex', justifyContent: 'space-between'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
                >
                  <span>{v.name}</span>
                  <span style={{ color: '#0e7490' }}>₹ {v.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* KOT Print Modal — Multi-printer routing */}
      <KOTPrintModal
        isOpen={showKotPrintModal}
        onClose={() => {
          setShowKotPrintModal(false);
          if (kotSuccessCallbackRef.current) {
            kotSuccessCallbackRef.current();
          }
        }}
        kotGroups={kotGroups}
        payloads={kotPayloads}
        kotNo={generatedKotNo}
        tableNo={routedTable?.no || assignedTableId || '?'}
        onKOTSuccess={() => kotSuccessCallbackRef.current && kotSuccessCallbackRef.current()}
      />
    </div>
  );
};

export default React.memo(BillingPanel);
