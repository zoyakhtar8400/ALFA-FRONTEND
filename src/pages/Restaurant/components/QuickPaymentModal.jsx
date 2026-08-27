import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaUtensils, FaArrowRight } from 'react-icons/fa';
import POSPaymentBar from './pos/POSPaymentBar';
import POSSummaryBar from './pos/POSSummaryBar';
import POSActionButtons from './pos/POSActionButtons';
import paymentModeService from '../../../services/paymentModeService';
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
  showToast,
  providedNetBill,
  providedTaxAmt,
  providedDiscountAmt
}) => {
  const navigate = useNavigate();
  const { setTables, activeStoreId } = useRestaurant();

  const [isFooterCollapsed, setIsFooterCollapsed] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);

  const [dbPaymentModes, setDbPaymentModes] = useState([]);
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [tipAmount, setTipAmount] = useState('');
  const [taxLines, setTaxLines] = useState([]); // [{name, rate, amount}]

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

  const totalDiscountAmt = providedDiscountAmt !== undefined ? Number(providedDiscountAmt) : Number(table?.discount_amount || table?.discountAmount || 0);
  const taxableAmount = Math.max(0, subTotal - totalDiscountAmt);

  const calculatedLocalTax = useMemo(() => {
    return taxLines.reduce((sum, t) => {
      const rate = Number(t.rate || 0);
      return sum + (taxableAmount * rate / 100);
    }, 0);
  }, [taxLines, taxableAmount]);

  const totalTax = providedTaxAmt !== undefined
    ? Number(providedTaxAmt)
    : (Number(table?.tax_amount || table?.taxAmount || table?.tax || 0) || calculatedLocalTax);

  const cgstAmt = Number((totalTax / 2).toFixed(2));
  const sgstAmt = Number((totalTax / 2).toFixed(2));

  const fallbackNet = Math.round(taxableAmount + totalTax);

  // Prioritize exact provided net bill. 
  // If not provided, prioritize live items calculation (fallbackNet) over stale database amounts (table.total_amount).
  let netBill = 0;
  if (providedNetBill !== undefined) {
    netBill = Number(providedNetBill);
  } else if (fallbackNet > 0) {
    netBill = fallbackNet;
  } else {
    netBill = Number(table?.total_amount || table?.totalAmount || table?.net_amount || 0);
  }

  const totalPaid = useMemo(() => {
    return Object.values(paymentAmounts).reduce((sum, val) => sum + (Number(val) || 0), 0);
  }, [paymentAmounts]);

  const balanceDue = Math.max(0, netBill - totalPaid).toFixed(2);
  const dueCredit = Math.max(0, totalPaid - netBill).toFixed(2);
  const cashReturn = totalPaid > netBill ? dueCredit : '0.00';

  const toast = (msg, type = 'success') => {
    if (typeof showToast === 'function') {
      showToast(msg);
    } else if (window.showToast) {
      window.showToast(msg, type);
    }
  };

  // Load ALL active taxes from backend Tax master on open
  useEffect(() => {
    if (!isOpen) return;
    posApi.getItemTaxCategories().then(res => {
      const taxes = Array.isArray(res?.data) ? res.data : [];
      if (taxes.length === 0) {
        setTaxLines([{ name: 'GST', rate: 5 }]);
      } else {
        setTaxLines(taxes.map(t => ({
          name: t.name || t.tax_name || 'Tax',
          rate: Number(t.tax_percentage || t.percentage || 0)
        })));
      }
    }).catch(() => setTaxLines([{ name: 'CGST', rate: 2.5 }, { name: 'SGST', rate: 2.5 }]));

    paymentModeService.getPaymentModes().then(res => {
      let list = Array.isArray(res) ? res : (res?.data || res?.paymentModes || res?.payment_modes || []);
      const activeList = list
        .filter(p => p.active !== 'No' && p.isActive !== false)
        .map(p => ({
          id: p.name || p.payment_mode_name,
          name: p.name || p.payment_mode_name,
          label: p.name || p.payment_mode_name,
          type: p.type || 'CASH'
        }));
      const finalModes = activeList.length > 0 ? activeList : [{ id: 'Cash', name: 'Cash', label: 'Cash', type: 'CASH' }];
      setDbPaymentModes(finalModes);
      if (finalModes.length > 0) {
        setPaymentAmounts({ [finalModes[0].id]: netBill });
      }
    }).catch(() => {
      setDbPaymentModes([{ id: 'Cash', name: 'Cash', label: 'Cash', type: 'CASH' }]);
      setPaymentAmounts({ 'Cash': netBill });
    });
  }, [isOpen, netBill]);



  // Keyboard shortcut listener (F5 - F10)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'F8' || e.key === 'F7' || e.key === 'F9' || e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      } else if (e.key === 'F4') {
        e.preventDefault();
        handleKOT();
      } else if (e.key === 'F10') {
        e.preventDefault();
        handleHold();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, table, netBill, activeRows, paymentAmounts]);

  if (!isOpen || !table) return null;

  const targetTableId = table.id || table.table_id;
  const targetTableNo = table.no || table.table_no || String(targetTableId);

  // Settlement & Save
  const handleSave = async () => {
    try {
      const cleanMobile = (table.mobile && table.mobile !== '—') ? table.mobile : '';

      const paymentsArray = Object.entries(paymentAmounts)
        .filter(([mode, amt]) => Number(amt) > 0)
        .map(([mode, amt]) => ({ method: mode, amount: Number(amt) }));

      const mainMode = paymentsArray.length > 0 ? paymentsArray.sort((a, b) => b.amount - a.amount)[0].method : 'Cash';

      let createdOrderId = table.current_order_id || table.order_id;

      if (createdOrderId) {
        // Update existing order
        await orderService.updateOrder(createdOrderId, {
          status: 'completed',
          payment_status: Number(balanceDue) > 0 ? 'Partial' : 'Paid',
          paymentMode: mainMode,
          payments: paymentsArray,
          discount: totalDiscountAmt,
          tax: totalTax,
          cgst: cgstAmt,
          sgst: sgstAmt,
          grand_total: netBill,
          total_amount: netBill
        }).catch(err => console.warn('Order update warning in quick pay:', err));
      } else {
        // 1. Create completed Order record in PostgreSQL
        const orderRes = await orderService.createOrder({
          tableId: Number(targetTableId) || 1,
          tableNo: String(targetTableNo),
          customerName: table.customer || 'Walk-in',
          mobileNo: cleanMobile,
          waiter: table.waiter || 'Staff',
          status: 'completed',
          payment_status: Number(balanceDue) > 0 ? 'Partial' : 'Paid',
          paymentMode: mainMode,
          payments: paymentsArray,
          items: activeRows.length > 0 ? activeRows : [{ name: 'Order Items', qty: 1, unitPrice: netBill }],
          discount: totalDiscountAmt,
          tax: totalTax,
          cgst: cgstAmt,
          sgst: sgstAmt,
          grand_total: netBill,
          total_amount: netBill,
          store_id: activeStoreId
        }).catch(err => {
          console.warn('Order creation warning in quick pay:', err);
          return null;
        });
        createdOrderId = orderRes?.order?.id || orderRes?.data?.id || orderRes?.order?.order_id || orderRes?.data?.order_id;
      }
      if (createdOrderId) {
        await orderService.processPayment({
          orderId: createdOrderId,
          payments: paymentsArray,
          paymentMethod: mainMode,
          amount: netBill
        }).catch(() => { });
      }

      // 3. Patch table status to Blank in PostgreSQL if fully paid
      if (Number(balanceDue) <= 0) {
        if (targetTableId) {
          await restaurantApi.patchTableStatus(targetTableId, {
            status: 'Blank',
            amount: 0,
            payment_status: 'PAID',
            customer: '',
            waiter: null,
            remaining_seconds: 0
          }).catch(() => { });
        }

        if (setTables) {
          setTables(prev => prev.map(t => {
            if (String(t.id) === String(targetTableId) || String(t.no) === String(targetTableNo)) {
              return {
                ...t,
                status: 'Blank',
                color: 'white',
                amount: 0,
                paidAt: null,
                payment_completed_at: null,
                remaining_seconds: 0,
                cleanup_after_seconds: 0,
                available_actions: [],
                updatedAt: Date.now()
              };
            }
            return t;
          }));
        }
      } else {
        if (setTables) {
          setTables(prev => prev.map(t => {
            if (String(t.id) === String(targetTableId) || String(t.no) === String(targetTableNo)) {
              return {
                ...t,
                payment_status: 'PARTIAL',
                updatedAt: Date.now()
              };
            }
            return t;
          }));
        }
      }

      toast(`Payment of ₹${totalPaid.toFixed(2)} completed! Table T${targetTableNo} is now ${Number(balanceDue) > 0 ? 'Partial' : 'Paid'}.`);
      setShowPaymentSuccessModal(true);
      setTimeout(() => {
        if (typeof onTableUpdated === 'function') onTableUpdated();
        onClose();
        setShowPaymentSuccessModal(false);
      }, 1200);
    } catch (err) {
      toast(err.message || 'Failed to save payment', 'error');
    }
  };

  const handleSaveAndPrint = async () => {
    try {
      const cleanMobile = (table.mobile && table.mobile !== '—') ? table.mobile : '';

      const paymentsArray = Object.entries(paymentAmounts)
        .filter(([mode, amt]) => Number(amt) > 0)
        .map(([mode, amt]) => ({ method: mode, amount: Number(amt) }));

      const mainMode = paymentsArray.length > 0 ? paymentsArray.sort((a, b) => b.amount - a.amount)[0].method : 'Cash';

      let createdOrderId = table.current_order_id || table.order_id;

      if (createdOrderId) {
        await orderService.updateOrder(createdOrderId, {
          status: 'completed',
          payment_status: 'Paid',
          paymentMode: mainMode,
          payments: paymentsArray,
          discount: totalDiscountAmt,
          tax: totalTax,
          grand_total: netBill,
          total_amount: netBill
        }).catch(err => console.warn('Order update warning in quick pay:', err));
      } else {
        // 1. Create completed Order record in PostgreSQL
        const orderRes = await orderService.createOrder({
          tableId: Number(targetTableId) || 1,
          tableNo: String(targetTableNo),
          customerName: table.customer || 'Walk-in',
          mobileNo: cleanMobile,
          waiter: table.waiter || 'Staff',
          status: 'completed',
          payment_status: 'Paid',
          paymentMode: mainMode,
          payments: paymentsArray,
          items: activeRows.length > 0 ? activeRows : [{ name: 'Order Items', qty: 1, unitPrice: netBill }],
          discount: totalDiscountAmt,
          tax: totalTax,
          grand_total: netBill,
          total_amount: netBill,
          store_id: activeStoreId
        }).catch(err => {
          console.warn('Order creation warning in quick pay:', err);
          return null;
        });
        createdOrderId = orderRes?.order?.id || orderRes?.data?.id || orderRes?.order?.order_id || orderRes?.data?.order_id;
      }
      if (createdOrderId) {
        await orderService.processPayment({
          orderId: createdOrderId,
          payments: paymentsArray,
          paymentMethod: mainMode,
          amount: netBill
        }).catch(() => { });
      }

      // 3. Patch table status to Blank in PostgreSQL
      if (targetTableId) {
        await restaurantApi.patchTableStatus(targetTableId, {
          status: 'Blank',
          amount: 0,
          payment_status: 'PAID',
          customer: '',
          waiter: null,
          remaining_seconds: 0
        }).catch(() => { });
      }

      if (setTables) {
        setTables(prev => prev.map(t => {
          if (String(t.id) === String(targetTableId) || String(t.no) === String(targetTableNo)) {
            return {
              ...t,
              status: 'Blank',
              color: 'white',
              amount: 0,
              paidAt: null,
              payment_completed_at: null,
              remaining_seconds: 0,
              cleanup_after_seconds: 0,
              available_actions: [],
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
        paymentMode: mainMode
      });

      toast(`Payment saved & Tax Invoice printed for Table T${targetTableNo}!`);
      setShowPaymentSuccessModal(true);
      setTimeout(() => {
        if (typeof onTableUpdated === 'function') onTableUpdated();
        onClose();
        setShowPaymentSuccessModal(false);
      }, 1200);
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
      }).catch(() => { });

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
          padding: '16px 24px',
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          color: '#ffffff',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff',
              fontWeight: 900,
              fontSize: '0.9rem',
              padding: '6px 14px',
              borderRadius: '8px',
              boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
            }}>
              Table T{targetTableNo}
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, letterSpacing: '0.3px' }}>Payment & Discount Options</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                Guest: <span style={{ color: '#cbd5e1' }}>{table.customer || 'Walk-in'}</span> &nbsp;·&nbsp; Waiter: <span style={{ color: '#cbd5e1' }}>{table.waiter || 'Staff'}</span>
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
              {isFooterCollapsed ? '💳 Payment Method (Cash, Card, Due)' : '💳 Payment Options'}
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
            <div style={{ padding: '16px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px dashed #cbd5e1' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Bill</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>₹{netBill.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Total Paid</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>₹{totalPaid.toFixed(2)}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
                {dbPaymentModes.map(mode => (
                  <div key={mode.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mode.label}</label>
                    <input
                      type="number"
                      placeholder="0"
                      min="0"
                      value={paymentAmounts[mode.id] || ''}
                      onChange={(e) => setPaymentAmounts(prev => ({ ...prev, [mode.id]: e.target.value }))}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.8rem', fontWeight: 700 }}
                    />
                  </div>
                ))}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f59e0b' }}>Tip Amount</label>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '6px', borderRadius: '6px', border: '1px solid #fcd34d', outline: 'none', fontSize: '0.8rem', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <div style={{ flex: 1, background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '1.5px solid #fca5a5', borderRadius: '10px', padding: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.05)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Balance Due</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#991b1b', marginTop: '2px' }}>₹{balanceDue}</div>
                </div>
                <div style={{ flex: 1, background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1.5px solid #86efac', borderRadius: '10px', padding: '12px', textAlign: 'center', boxShadow: '0 4px 6px rgba(34, 197, 94, 0.05)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cash Return</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#14532d', marginTop: '2px' }}>₹{cashReturn}</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons: Single Save Button labeled as Save & Print */}
          <div style={{ padding: '16px 20px', background: '#fff', borderTop: '1px solid #e2e8f0', borderBottomLeftRadius: '14px', borderBottomRightRadius: '14px' }}>
            <button
              type="button"
              onClick={handleSave}
              style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#ffffff',
                fontWeight: 900, fontSize: '0.95rem', border: 'none',
                cursor: 'pointer', transition: 'all 0.2s',
                width: '100%',
                boxShadow: '0 8px 16px rgba(16, 185, 129, 0.25)'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 20px rgba(16, 185, 129, 0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(16, 185, 129, 0.25)'; }}
            >
              <span>Save</span>
              <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '1px 6px', fontSize: '10px', color: '#ffffff' }}>F7</span>
            </button>
          </div>

          {/* Payment Completed Modal Popup */}
          {showPaymentSuccessModal && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 10001,
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
                  Updating table registers...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalJSX, document.body) : modalJSX;
};

export default QuickPaymentModal;
