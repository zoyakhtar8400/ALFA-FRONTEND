import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaUtensils, FaArrowRight } from 'react-icons/fa';
import POSPaymentBar from './pos/POSPaymentBar';
import POSSummaryBar from './pos/POSSummaryBar';
import POSActionButtons from './pos/POSActionButtons';
import { printTaxInvoice } from '../utils/printInvoice';
import { kotService } from '../../../services/kotService';
import { orderService } from '../../../services/orderService';
import { restaurantApi } from '../../../api/restaurantApi';
import { tableService } from '../../../services/tableService';
import { useRestaurant } from '../../../context/RestaurantContext';
import posApi from '../../../api/posApi';

const QuickPaymentModal = ({
  isOpen,
  onClose,
  table,
  items = [],
  onTableUpdated,
  showToast
}) => {
  const navigate = useNavigate();
  const { setTables, activeStoreId } = useRestaurant();

  const [isFooterCollapsed, setIsFooterCollapsed] = useState(false);
  const [showDiscountPanel, setShowDiscountPanel] = useState(false);
  const [discountLines, setDiscountLines] = useState([
    { id: 1, type: 'Percentage', value: '', reason: '' }
  ]);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [isPaid, setIsPaid] = useState(false);
  const [taxLines, setTaxLines] = useState([]); // [{name, rate, amount}]

  // Load ALL active taxes from backend Tax master on open
  useEffect(() => {
    if (!isOpen) return;
    posApi.getItemTaxCategories().then(res => {
      const taxes = Array.isArray(res?.data) ? res.data : [];
      setTaxLines(taxes.map(t => ({
        name: t.name || 'Tax',
        rate: Number(t.percentage || 0)
      })));
    }).catch(() => setTaxLines([{ name: 'CGST', rate: 2.5 }, { name: 'SGST', rate: 2.5 }]));
  }, [isOpen]);

  const toast = (msg, type = 'success') => {
    if (typeof showToast === 'function') {
      showToast(msg);
    } else if (window.showToast) {
      window.showToast(msg, type);
    }
  };

  // Calculate bill amounts
  const activeRows = useMemo(() => {
    return Array.isArray(items) && items.length > 0 ? items : (table?.items || []);
  }, [items, table]);

  const rawSubTotal = useMemo(() => {
    return activeRows.reduce((sum, item) => {
      const q = Number(item.qty || item.quantity || 1);
      const p = Number(item.unitPrice || item.price || item.rate || 0);
      return sum + (q * p);
    }, 0);
  }, [activeRows]);

  const subTotal = rawSubTotal > 0 ? rawSubTotal : Number(table?.amount || 0);
  const rawTotal = subTotal;

  const totalDiscountAmt = useMemo(() => {
    return discountLines.reduce((acc, curr) => {
      const val = parseFloat(curr.value) || 0;
      if (val <= 0) return acc;
      if (curr.type === 'Percentage') {
        return acc + (subTotal * val / 100);
      }
      return acc + val;
    }, 0);
  }, [discountLines, subTotal]);

  const taxableAmount = Math.max(0, subTotal - totalDiscountAmt);
  // Compute each tax line dynamically from master
  const computedTaxLines = taxLines.map(t => ({
    name: t.name,
    rate: t.rate,
    amount: Math.round((taxableAmount * t.rate / 100) * 100) / 100
  }));
  const totalTax = Math.round(computedTaxLines.reduce((s, t) => s + t.amount, 0) * 100) / 100;
  // legacy compat
  const cgstAmt = computedTaxLines.find(t => t.name?.toUpperCase().includes('CGST'))?.amount ?? Math.round((totalTax / 2) * 100) / 100;
  const sgstAmt = computedTaxLines.find(t => t.name?.toUpperCase().includes('SGST'))?.amount ?? Math.round((totalTax / 2) * 100) / 100;
  const netBill = Math.round((taxableAmount + totalTax) * 100) / 100;

  const addDiscountLine = () => {
    setDiscountLines(prev => [
      ...prev,
      { id: Date.now(), type: 'Percentage', value: '', reason: '' }
    ]);
  };

  const updateDiscountLine = (id, field, val) => {
    setDiscountLines(prev =>
      prev.map(line => line.id === id ? { ...line, [field]: val } : line)
    );
  };

  const removeDiscountLine = (id) => {
    if (discountLines.length === 1) {
      setDiscountLines([{ id: 1, type: 'Percentage', value: '', reason: '' }]);
      setShowDiscountPanel(false);
    } else {
      setDiscountLines(prev => prev.filter(line => line.id !== id));
    }
  };

  // Keyboard shortcut listener (F5 - F10)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'F8') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'F4') {
        e.preventDefault();
        handleKOT();
      } else if (e.key === 'F9') {
        e.preventDefault();
        handleSaveAndPrint();
      } else if (e.key === 'F10') {
        e.preventDefault();
        handleHold();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, table, netBill, activeRows, paymentMode]);

  if (!isOpen || !table) return null;

  const targetTableId = table.id || table.table_id;
  const targetTableNo = table.no || table.table_no || String(targetTableId);

  // Settlement & Save
  const handleSave = async () => {
    try {
      const cleanMobile = (table.mobile && table.mobile !== '—') ? table.mobile : '';
      
      // 1. Create completed Order record in PostgreSQL
      const orderRes = await orderService.createOrder({
        tableId: Number(targetTableId) || 1,
        tableNo: String(targetTableNo),
        customerName: table.customer || 'Walk-in',
        mobileNo: cleanMobile,
        waiter: table.waiter || 'Staff',
        status: 'completed',
        payment_status: 'Paid',
        paymentMode: paymentMode || 'Cash',
        items: activeRows,
        discount: totalDiscountAmt,
        tax: totalTax,
        cgst: cgstAmt,
        sgst: sgstAmt,
        store_id: activeStoreId
      }).catch(err => {
        console.warn('Order creation warning in quick pay:', err);
        return null;
      });

      // 2. Process payment settlement
      const createdOrderId = orderRes?.order?.id || orderRes?.data?.id || orderRes?.order?.order_id || orderRes?.data?.order_id;
      if (createdOrderId) {
        await orderService.processPayment({
          orderId: createdOrderId,
          paymentMethod: paymentMode || 'Cash',
          amount: netBill
        }).catch(() => {});
      }

      // 3. Patch table status to PAYMENT_COMPLETED in PostgreSQL
      if (targetTableId) {
        await restaurantApi.patchTableStatus(targetTableId, {
          status: 'PAYMENT_COMPLETED',
          amount: 0,
          payment_status: 'PAID',
          customer: table.customer || 'Walk-in',
          waiter: table.waiter || null,
          remaining_seconds: 60
        }).catch(() => {});
      }

      if (setTables) {
        setTables(prev => prev.map(t => {
          if (String(t.id) === String(targetTableId) || String(t.no) === String(targetTableNo)) {
            return {
              ...t,
              status: 'PAYMENT_COMPLETED',
              color: 'green',
              amount: 0,
              paidAt: Date.now(),
              payment_completed_at: Date.now(),
              remaining_seconds: 60,
              cleanup_after_seconds: 60,
              available_actions: ['print_kot'],
              updatedAt: Date.now()
            };
          }
          return t;
        }));
      }

      toast(`Payment of ₹${netBill.toFixed(2)} (${paymentMode}) completed! Table T${targetTableNo} is now Paid.`);
      if (typeof onTableUpdated === 'function') onTableUpdated();
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to save payment', 'error');
    }
  };

  const handleSaveAndPrint = async () => {
    try {
      const cleanMobile = (table.mobile && table.mobile !== '—') ? table.mobile : '';

      // 1. Create completed Order record in PostgreSQL
      const orderRes = await orderService.createOrder({
        tableId: Number(targetTableId) || 1,
        tableNo: String(targetTableNo),
        customerName: table.customer || 'Walk-in',
        mobileNo: cleanMobile,
        waiter: table.waiter || 'Staff',
        status: 'completed',
        payment_status: 'Paid',
        paymentMode: paymentMode || 'Cash',
        items: activeRows,
        discount: totalDiscountAmt,
        tax: totalTax,
        store_id: activeStoreId
      }).catch(err => {
        console.warn('Order creation warning in quick pay:', err);
        return null;
      });

      // 2. Process payment settlement
      const createdOrderId = orderRes?.order?.id || orderRes?.data?.id || orderRes?.order?.order_id || orderRes?.data?.order_id;
      if (createdOrderId) {
        await orderService.processPayment({
          orderId: createdOrderId,
          paymentMethod: paymentMode || 'Cash',
          amount: netBill
        }).catch(() => {});
      }

      // 3. Patch table status to PAYMENT_COMPLETED in PostgreSQL
      if (targetTableId) {
        await restaurantApi.patchTableStatus(targetTableId, {
          status: 'PAYMENT_COMPLETED',
          amount: 0,
          payment_status: 'PAID',
          customer: table.customer || 'Walk-in',
          waiter: table.waiter || null,
          remaining_seconds: 60
        }).catch(() => {});
      }

      if (setTables) {
        setTables(prev => prev.map(t => {
          if (String(t.id) === String(targetTableId) || String(t.no) === String(targetTableNo)) {
            return {
              ...t,
              status: 'PAYMENT_COMPLETED',
              color: 'green',
              amount: 0,
              paidAt: Date.now(),
              payment_completed_at: Date.now(),
              remaining_seconds: 60,
              cleanup_after_seconds: 60,
              available_actions: ['print_kot'],
              updatedAt: Date.now()
            };
          }
          return t;
        }));
      }

      printTaxInvoice({
        tableNo: targetTableNo,
        kotId: `INV-T${targetTableNo}-${Date.now().toString().slice(-4)}`,
        items: activeRows.length > 0 ? activeRows : [{ name: 'Order Items', qty: 1, unitPrice: netBill }],
        status: 'PAID',
        discount: totalDiscountAmt,
        total: netBill,
        paymentMode
      });

      toast(`Payment saved & Tax Invoice printed for Table T${targetTableNo}!`);
      if (typeof onTableUpdated === 'function') onTableUpdated();
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to save & print', 'error');
    }
  };

  const handleSaveAndEBill = async () => {
    await handleSave();
  };

  const handleKOT = async () => {
    try {
      const timeNo = Date.now().toString().slice(-4);
      await kotService.createKOT({
        kotNo: `KOT-${timeNo}`,
        tableId: targetTableId || 1,
        tableNo: targetTableNo || '1',
        customerName: table.customer || 'Walk-in',
        waiter: table.waiter || 'Staff',
        items: activeRows,
        store_id: activeStoreId
      }).catch(() => {});

      toast(`KOT generated for Table T${targetTableNo}!`);
      if (typeof onTableUpdated === 'function') onTableUpdated();
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to generate KOT', 'error');
    }
  };

  const handleHold = async () => {
    toast(`Draft held for Table T${targetTableNo}.`);
    onClose();
  };

  const handleOpenFullPOS = () => {
    onClose();
    navigate('/restaurant/pos-billing', {
      state: {
        table,
        tableId: table.id,
        tableNumber: `T${table.no}`,
        rows: activeRows
      }
    });
  };

  if (!isOpen) return null;

  const modalJSX = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '560px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'scaleIn 0.15s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0.96); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>

        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          background: '#0f172a',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              background: '#f5c842',
              color: '#1e293b',
              fontWeight: 900,
              fontSize: '0.85rem',
              padding: '3px 10px',
              borderRadius: '6px'
            }}>
              Table T{targetTableNo}
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800 }}>Payment & Discount Options</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Guest: {table.customer || 'Walk-in'} &nbsp;·&nbsp; Waiter: {table.waiter || 'Staff'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleOpenFullPOS}
              title="Open full POS billing screen"
              style={{
                background: 'rgba(255,255,255,0.15)',
                border: 'none',
                color: '#fff',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Full POS ➔
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '1.2rem',
                lineHeight: 1
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Payment & Discount Options Section (Same as POS Billing) */}
        <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Collapsible Header */}
          <div
            onClick={() => setIsFooterCollapsed(prev => !prev)}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 16px',
              background: isFooterCollapsed ? '#fff7ed' : '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              cursor: 'pointer',
              fontSize: '0.76rem',
              fontWeight: 800,
              color: isFooterCollapsed ? '#c2410c' : '#475569',
              transition: 'all 0.15s'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isFooterCollapsed ? '💳 + Add Discount & Payment Method (Cash, Card, Due)' : '💳 Payment & Discount Options'}
            </span>
            <span style={{
              fontSize: '0.68rem',
              fontWeight: 800,
              background: isFooterCollapsed ? '#ffedd5' : '#e2e8f0',
              color: isFooterCollapsed ? '#9a3412' : '#334155',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              {isFooterCollapsed ? '▲ Expand' : '▼ Collapse'}
            </span>
          </div>

          {!isFooterCollapsed && (
            <>
              {/* Discount Panel */}
              <div style={{ padding: '8px 16px' }}>
                {!showDiscountPanel ? (
                  <button
                    type="button"
                    onClick={() => setShowDiscountPanel(true)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '6px',
                      border: '1.5px dashed #f97316',
                      background: 'transparent',
                      color: '#f97316',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    🏷️ Add Discount
                  </button>
                ) : (
                  <div style={{
                    background: '#fffbf5',
                    border: '1.5px solid #fed7aa',
                    borderRadius: '10px',
                    padding: '10px 12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase' }}>
                        🏷️ Discount Options
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowDiscountPanel(false)}
                        style={{
                          background: '#ffedd5',
                          border: '1px solid #fdba74',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          color: '#c2410c',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        ▲ Collapse Discount
                      </button>
                    </div>

                    {discountLines.map(line => (
                      <div key={line.id} style={{
                        display: 'grid',
                        gridTemplateColumns: '100px 80px 1fr auto',
                        gap: '6px',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <div style={{ display: 'flex', borderRadius: '6px', overflow: 'hidden', border: '1px solid #fdba74' }}>
                          {['Percentage', 'Fixed'].map(t => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => updateDiscountLine(line.id, 'type', t)}
                              style={{
                                flex: 1,
                                padding: '5px 0',
                                fontSize: '0.68rem',
                                fontWeight: 800,
                                border: 'none',
                                background: line.type === t ? '#f97316' : '#fff',
                                color: line.type === t ? '#fff' : '#9a3412',
                                cursor: 'pointer'
                              }}
                            >
                              {t === 'Percentage' ? '%' : '₹'}
                            </button>
                          ))}
                        </div>

                        <input
                          type="number"
                          min="0"
                          max={line.type === 'Percentage' ? 100 : undefined}
                          step="0.01"
                          placeholder={line.type === 'Percentage' ? '0%' : '0.00'}
                          value={line.value}
                          onChange={e => updateDiscountLine(line.id, 'value', e.target.value)}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid #fdba74',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            textAlign: 'right',
                            outline: 'none',
                            background: '#fff'
                          }}
                        />

                        <input
                          type="text"
                          placeholder="Reason / Note"
                          value={line.reason}
                          onChange={e => updateDiscountLine(line.id, 'reason', e.target.value)}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '6px',
                            border: '1px solid #fdba74',
                            fontSize: '0.75rem',
                            outline: 'none',
                            background: '#fff'
                          }}
                        />

                        <button
                          type="button"
                          onClick={() => removeDiscountLine(line.id)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}
                        >✕</button>
                      </div>
                    ))}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '8px', borderTop: '1px dashed #fed7aa' }}>
                      <button
                        type="button"
                        onClick={addDiscountLine}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '5px',
                          border: '1px dashed #f97316',
                          background: 'transparent',
                          color: '#f97316',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer'
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

              {/* Payment Modes (Cash, Card, Due, Other, More) */}
              <POSPaymentBar
                activeMode={paymentMode}
                onSelectMode={setPaymentMode}
                isPaid={isPaid}
                onChangeIsPaid={setIsPaid}
              />
            </>
          )}

          {/* Total Amount & Split Bill Summary Bar */}
          <POSSummaryBar
            totalBill={netBill}
            discountAmt={totalDiscountAmt}
            originalBill={rawTotal}
            onSplitClick={() => toast('Split bill activated')}
          />

          {/* Action Buttons: Save (F5) to Hold Draft (F10) */}
          <POSActionButtons
            onSave={handleSave}
            onSaveAndPrint={handleSaveAndPrint}
            onSaveAndEBill={handleSaveAndEBill}
            onKOT={handleKOT}
            onKOTAndPrint={handleSaveAndPrint}
            onHold={handleHold}
          />
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : modalJSX;
};

export default QuickPaymentModal;
