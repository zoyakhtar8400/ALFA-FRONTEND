import React, { useCallback } from 'react';
import { FaTimes, FaPlus, FaSearch } from 'react-icons/fa';

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
  deliveryBoy,
  setDeliveryBoy,
  ncType,
  setNcType,
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
  setShowQuickPaymentModal,
  discountLines,
  setDiscountLines,
  updateDiscountLine,
  removeDiscountLine,
  addDiscountLine,
  totalDiscountAmt,
  totalBill,
  netBill,
  totalTax,
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
  searchInputRef,
  searchItem,
  setSearchItem,
  isSettling,
  showKotPrintModal,
  setShowKotPrintModal,
  kotGroups,
  kotPayloads,
  kotSuccessCallbackRef,
  toast,
  isViewMode = false
}) => {
  const [isFooterCollapsed, setIsFooterCollapsed] = React.useState(false);
  const [showSearchResults, setShowSearchResults] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    if (showSearchResults && dropdownRef.current) {
      const activeEl = dropdownRef.current.querySelector(`[data-suggestion-idx="${highlightedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, showSearchResults]);

  const matchingSearchItems = React.useMemo(() => {
    if (!searchItem || !searchItem.trim()) return [];
    const q = searchItem.toLowerCase().trim();
    return (allMenuItems || []).filter(item => {
      if (item.active === 'No') return false;
      const matchesName = (item.name || item.title || '').toLowerCase().includes(q);
      const matchesCode = String(item.shortCode || item.id || '').toLowerCase().includes(q);
      const matchesCat = (item.category || '').toLowerCase().includes(q);
      return matchesName || matchesCode || matchesCat;
    });
  }, [searchItem, allMenuItems]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      if (showSearchResults && matchingSearchItems.length > 0) {
        e.preventDefault();
        setHighlightedIndex(prev => Math.min(matchingSearchItems.length - 1, prev + 1));
      } else {
        // Move focus directly to first table row
        e.preventDefault();
        const firstCell = document.querySelector('[data-row="0"][data-col="1"]') || document.querySelector('[data-row="0"][data-col="3"]');
        if (firstCell) {
          firstCell.focus();
          if (firstCell.select) firstCell.select();
        }
      }
    } else if (e.key === 'ArrowUp') {
      if (showSearchResults && matchingSearchItems.length > 0) {
        e.preventDefault();
        setHighlightedIndex(prev => Math.max(0, prev - 1));
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (matchingSearchItems.length > 0) {
        const targetIdx = highlightedIndex >= 0 && highlightedIndex < matchingSearchItems.length ? highlightedIndex : 0;
        const selected = matchingSearchItems[targetIdx];
        if (addOrUpdateItemRow) {
          addOrUpdateItemRow(selected);
        }
        if (setSearchItem) setSearchItem('');
        setShowSearchResults(false);
        if (searchInputRef?.current) searchInputRef.current.focus();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      if (setSearchItem) setSearchItem('');
      setShowSearchResults(false);
      if (searchInputRef?.current) searchInputRef.current.focus();
    }
  };

  const containerStyle = isBillingDesk
    ? {
        width: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100%',
        background: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }
    : {
        width: '100%',
        maxWidth: '100%',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100%',
        background: '#fff',
        boxShadow: '-4px 0 15px rgba(0,0,0,0.03)',
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden'
      };

  const currentAssignedTable = tablesList.find(t =>
    String(t.id) === String(assignedTableId) ||
    String(t.no) === String(assignedTableId) ||
    (t.no && assignedTableId && String(assignedTableId).replace(/[^0-9]/g, '') === String(t.no).replace(/[^0-9]/g, ''))
  ) || routedTable;
  const resolvedAssignedTableNo = currentAssignedTable?.table_name || currentAssignedTable?.no || assignedTableId || routedTable?.table_name || routedTable?.no || '';

  return (
    <div className="pos-billing-section" style={containerStyle}>
      <POSHeader
        isBillingDesk={isBillingDesk}
        serviceType={serviceType}
        setServiceType={setServiceType}
        assignedTableNo={resolvedAssignedTableNo}
        customerName={customerName}
        mobileNumber={mobileNumber}
        paxCount={paxCount}
        hasRemarks={!!remarks}
        waiter={waiter}
        onWaiterChange={useCallback((val) => setWaiter && setWaiter(val), [setWaiter])}
        deliveryBoy={deliveryBoy}
        onDeliveryBoyChange={useCallback((val) => setDeliveryBoy && setDeliveryBoy(val), [setDeliveryBoy])}
        ncType={ncType}
        onNcTypeChange={useCallback((val) => setNcType && setNcType(val), [setNcType])}
        isPaid={isPaid}
        onTableClick={useCallback(() => setIsTableModalOpen(true), [setIsTableModalOpen])}
        onCustomerClick={useCallback(() => setIsCustomerDrawerOpen(true), [setIsCustomerDrawerOpen])}
        onPaxClick={useCallback(() => setIsPaxModalOpen(true), [setIsPaxModalOpen])}
        onRemarksClick={useCallback(() => setIsRemarksModalOpen(true), [setIsRemarksModalOpen])}
      />

      {/* Menu Item Search Bar — RENDERED STRICTLY ONLY FOR BILLING DESK (isBillingDesk === true) */}
      {isBillingDesk && (
        <div style={{ padding: '10px 12px 6px 12px', background: '#fff', position: 'relative', zIndex: 30 }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              border: '2px solid #0e7490', borderRadius: '8px',
              padding: '0 14px', background: '#f0fdfa',
              height: '44px', minHeight: '44px',
              boxSizing: 'border-box',
              boxShadow: '0 1px 3px rgba(14, 116, 144, 0.08)',
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#0891b2';
              e.currentTarget.style.boxShadow = '0 3px 10px rgba(14, 116, 144, 0.18)';
              e.currentTarget.style.background = '#ffffff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#0e7490';
              e.currentTarget.style.boxShadow = '0 1px 3px rgba(14, 116, 144, 0.08)';
              e.currentTarget.style.background = '#f0fdfa';
            }}
          >
            <FaSearch size={15} color="#0e7490" style={{ flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="SEARCH MENU ITEM / CODE / CATEGORY (PRESS ENTER TO ADD)"
              value={searchItem || ''}
              onChange={e => {
                if (setSearchItem) setSearchItem(e.target.value);
                setShowSearchResults(true);
                setHighlightedIndex(0);
              }}
              onFocus={() => setShowSearchResults(true)}
              onKeyDown={handleSearchKeyDown}
              style={{
                flex: 1, height: '100%', border: 'none', background: 'transparent',
                fontSize: '0.85rem', fontWeight: 700, outline: 'none', color: '#0f172a'
              }}
            />
            {searchItem && (
              <button
                type="button"
                onClick={() => {
                  if (setSearchItem) setSearchItem('');
                  setShowSearchResults(false);
                  if (searchInputRef?.current) searchInputRef.current.focus();
                }}
                style={{
                  border: 'none', background: 'none', color: '#64748b', cursor: 'pointer',
                  padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#fee2e2';
                  e.currentTarget.style.color = '#ef4444';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.color = '#64748b';
                }}
              >
                <FaTimes size={14} />
              </button>
            )}
          </div>

          {/* Dropdown Overlay Results */}
          {showSearchResults && searchItem && searchItem.trim() !== '' && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute', top: '100%', left: '12px', right: '12px', zIndex: 100,
                background: '#ffffff', border: '1.5px solid #0e7490', borderRadius: '0 0 8px 8px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)', maxHeight: '250px', overflowY: 'auto'
              }}
            >
              {matchingSearchItems.length === 0 ? (
                <div style={{ padding: '14px 16px', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700, textAlign: 'center' }}>
                  No records found
                </div>
              ) : (
                matchingSearchItems.map((item, idx) => (
                  <div
                    key={item.id ? `${item.id}-${idx}` : idx}
                    data-suggestion-idx={idx}
                    onClick={() => {
                      if (addOrUpdateItemRow) addOrUpdateItemRow(item);
                      if (setSearchItem) setSearchItem('');
                      setShowSearchResults(false);
                      if (searchInputRef?.current) searchInputRef.current.focus();
                    }}
                    style={{
                      padding: '10px 14px',
                      borderBottom: '1px solid #f1f5f9',
                      borderLeft: idx === highlightedIndex ? '4px solid #0e7490' : '4px solid transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: idx === highlightedIndex ? '#ecfeff' : '#ffffff',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: idx === highlightedIndex ? '#0e7490' : '#0f172a' }}>
                        {item.name}
                      </span>
                      {item.shortCode && (
                        <span style={{ fontSize: '0.68rem', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          #{item.shortCode}
                        </span>
                      )}
                      {item.category && (
                        <span style={{ fontSize: '0.65rem', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 7px', borderRadius: '4px', fontWeight: 800 }}>
                          {item.category}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 800, color: '#0e7490',
                        background: '#cffafe', padding: '2px 8px', borderRadius: '4px',
                        opacity: idx === highlightedIndex ? 1 : 0, transition: 'opacity 0.15s ease'
                      }}>
                        + Add (↵)
                      </span>
                      <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#047857' }}>
                        ₹{Number(item.price || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Scrollable Middle Cart Area */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
        {/* Interactive billing item rows ledger */}
        <div style={{ padding: '12px 16px', flex: '1 0 auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Order Cart ({rows.filter(r => r.name || r.itemName).length} items)
            </span>
            {rows.length > 0 && (
              <button 
                type="button" 
                onClick={() => {
                  if (setIsClearModalOpen) {
                    setIsClearModalOpen(true);
                  } else {
                    setRows([]);
                    if (toast) toast('Draft cart cleared.');
                  }
                }}
                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: '700', cursor: 'pointer' }}
                title="Discard Draft Cart (Alt+D)"
              >
                Clear Cart
              </button>
            )}
          </div>

          {rows.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #e2e8f0' }}>
              <div style={{ fontSize: '1.6rem', marginBottom: '8px' }}>🛒</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#334155' }}>Your cart is empty</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>Select items from the menu to start order</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', background: '#f8fafc' }}>
                  <th style={{ padding: '10px 8px', color: '#64748b', fontWeight: '800', width: '38%' }}>Item</th>
                  <th style={{ padding: '10px 8px', color: '#64748b', fontWeight: '800', width: '22%' }}>Note</th>
                  <th style={{ padding: '10px 8px', color: '#64748b', fontWeight: '800', width: '20%', textAlign: 'center' }}>Qty</th>
                  <th style={{ padding: '10px 8px', color: '#64748b', fontWeight: '800', width: '15%', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '10px 8px', color: '#64748b', fontWeight: '800', width: '5%', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const matchItem = allMenuItems.find(f =>
                    (f.id && row.itemId && String(f.id) === String(row.itemId)) ||
                    (f.name && (row.itemName || row.name || row.title) && String(f.name).toLowerCase() === String(row.itemName || row.name || row.title).toLowerCase())
                  );
                  return (
                    <tr key={row.lineId || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* Column 1: Item Name & Veg Dot & Variant */}
                      <td style={{ padding: '10px 8px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ 
                            width: '6px', height: '6px', borderRadius: '50%', 
                            background: matchItem?.isVeg ? '#10b981' : '#ef4444',
                            flexShrink: 0
                          }} />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.8rem' }}>
                              {row.itemName || row.name}
                            </span>
                            {row.variantName && (
                              <span style={{ fontSize: '9.5px', color: '#2563eb', fontWeight: '700', marginTop: '1px' }}>
                                {row.variantName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Remarks Input */}
                      <td style={{ padding: '10px 8px' }}>
                        <input
                          type="text"
                          value={row.remark || ''}
                          onChange={e => updateRowField(index, 'remark', e.target.value)}
                          placeholder="Note..."
                          style={{
                            width: '100%', padding: '4px 6px', borderRadius: '5px', border: '1px solid #e2e8f0',
                            fontSize: '0.74rem', outline: 'none', fontWeight: 600, color: '#475569',
                            background: '#f8fafc'
                          }}
                          onFocus={e => e.currentTarget.style.borderColor = '#2563eb'}
                          onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
                        />
                      </td>

                      {/* Column 3: Qty Input */}
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <input
                          type="number"
                          min="1"
                          data-row={index}
                          data-col={3}
                          value={row.qty}
                          onChange={e => updateRowField(index, 'qty', parseInt(e.target.value) || 1)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (searchInputRef && searchInputRef.current) {
                                searchInputRef.current.focus();
                                searchInputRef.current.select();
                              }
                            } else {
                              handleGridKeyDown(e, index, 3);
                            }
                          }}
                          style={{
                            width: '45px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #e2e8f0',
                            fontSize: '0.8rem', outline: 'none', fontWeight: 800, textAlign: 'center',
                            background: '#f8fafc',
                            transition: 'all 0.15s ease'
                          }}
                          onFocus={e => {
                            e.currentTarget.style.borderColor = '#2563eb';
                            e.currentTarget.style.background = '#ffffff';
                            e.currentTarget.select?.();
                          }}
                          onBlur={e => {
                            e.currentTarget.style.borderColor = '#e2e8f0';
                            e.currentTarget.style.background = '#f8fafc';
                          }}
                        />
                      </td>

                      {/* Column 4: Amount */}
                      <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '800', color: '#0f172a' }}>
                        ₹{Math.round(row.qty * (row.unitPrice || row.price || 0))}
                      </td>

                      {/* Column 5: Actions */}
                      <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(index)}
                          title="Remove / Cancel Item (Alt+X / Delete)"
                          aria-label="Remove item"
                          style={{
                            background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer',
                            padding: '4px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                          }}
                          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                        >
                          <FaTimes size={11} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── ALWAYS FIXED PINNED BOTTOM DOCK (Payment Options, Discounts, Split Bill, Total Amount, Action Buttons F5-F10) ── */}
      <div style={{
        flexShrink: 0,
        marginTop: 'auto',
        position: 'sticky',
        bottom: 0,
        zIndex: 25,
        background: '#ffffff',
        borderTop: '1px solid #cbd5e1',
        boxShadow: '0 -4px 14px rgba(0, 0, 0, 0.08)'
      }}>
        {/* ── Quick Payment & Discount Trigger ── */}
        {isBillingDesk && (
          <div style={{ background: '#fff' }}>
            <div
              onClick={() => setShowQuickPaymentModal(true)}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 14px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                cursor: 'pointer', fontSize: '0.74rem', fontWeight: 800,
                color: '#475569',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                💳 Payment & Discount Options
              </span>
              <span style={{
                fontSize: '0.68rem', fontWeight: 800,
                background: '#e2e8f0',
                color: '#334155',
                padding: '2px 8px', borderRadius: '4px'
              }}>
                Payment Option
              </span>
            </div>
          </div>
        )}

        {/* ── Discount UI Panel ── */}
        <div style={{ padding: '8px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#334155' }}>Discount</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', background: '#e2e8f0', borderRadius: '6px', padding: '2px' }}>
              <button
                type="button"
                onClick={() => updateDiscountLine(discountLines[0]?.id || 1, 'type', 'Percentage')}
                style={{
                  border: 'none', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '4px', cursor: 'pointer',
                  background: discountLines[0]?.type === 'Percentage' ? '#fff' : 'transparent',
                  color: discountLines[0]?.type === 'Percentage' ? '#0f172a' : '#64748b',
                  boxShadow: discountLines[0]?.type === 'Percentage' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >%</button>
              <button
                type="button"
                onClick={() => updateDiscountLine(discountLines[0]?.id || 1, 'type', 'Amount')}
                style={{
                  border: 'none', padding: '4px 12px', fontSize: '0.75rem', fontWeight: 700, borderRadius: '4px', cursor: 'pointer',
                  background: discountLines[0]?.type === 'Amount' ? '#fff' : 'transparent',
                  color: discountLines[0]?.type === 'Amount' ? '#0f172a' : '#64748b',
                  boxShadow: discountLines[0]?.type === 'Amount' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                }}
              >₹</button>
            </div>
            <input
              type="number"
              min="0"
              placeholder={discountLines[0]?.type === 'Percentage' ? '0.0 %' : '0.00'}
              value={discountLines[0]?.value || ''}
              onChange={e => updateDiscountLine(discountLines[0]?.id || 1, 'value', e.target.value)}
              style={{
                width: '70px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1',
                outline: 'none', fontSize: '0.8rem', fontWeight: 700, textAlign: 'right'
              }}
            />
            <input
              type="text"
              placeholder="Reason"
              value={discountLines[0]?.reason || ''}
              onChange={e => updateDiscountLine(discountLines[0]?.id || 1, 'reason', e.target.value)}
              style={{
                width: '90px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1',
                outline: 'none', fontSize: '0.8rem', fontWeight: 700
              }}
            />
          </div>
        </div>

        {/* ── Summary Bar (Total & Split) ── */}
        <POSSummaryBar
          totalBill={netBill}
          discountAmt={totalDiscountAmt}
          taxAmt={totalTax}
          originalBill={totalBill}
          showSplitButton={isBillingDesk}
          onSplitClick={() => { if (toast) toast('Bill split modal triggered'); }}
        />

        {/* ── Action Buttons ── */}
        <POSActionButtons
          onSave={() => handleDirectComplete(false)}
          onBilling={() => handleDirectComplete(true)}
          onKOT={handleAddKOT}
          onKOTAndPrint={handleSaveAndPrint}
          onPay={() => setShowQuickPaymentModal(true)}
          isNC={!!(ncType && ncType.trim())}
          isViewMode={isViewMode}
          isBillingDesk={isBillingDesk}
        />

        {/* ── Footer Status ── */}
        <POSFooterStatus
          billNo={generatedKotNo ? `BILL-${generatedKotNo.split('-')[1] || '000123'}` : 'BILL-000123'}
          cashierName={captain || 'Admin'}
          outletName="Main Restaurant"
        />
      </div>

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

      {/* Table Selection Modal */}
      <TableSelector
        isOpen={isTableModalOpen}
        onClose={() => setIsTableModalOpen(false)}
        tablesList={tablesList}
        currentTableId={assignedTableId}
        onSelectTable={(t) => {
          if (typeof setAssignedTableId === 'function') {
            setAssignedTableId(t.id);
          }
        }}
      />

      {/* KOT Print Modal — Multi-printer routing */}
      <KOTPrintModal
        isOpen={showKotPrintModal}
        onClose={() => {
          setShowKotPrintModal(false);
        }}
        kotGroups={kotGroups}
        payloads={kotPayloads}
        kotNo={generatedKotNo}
        tableNo={routedTable?.no || assignedTableId || '?'}
        onKOTSuccess={() => {
          setShowKotPrintModal(false);
          if (kotSuccessCallbackRef.current) kotSuccessCallbackRef.current();
        }}
      />
    </div>
  );
};

export default React.memo(BillingPanel);
