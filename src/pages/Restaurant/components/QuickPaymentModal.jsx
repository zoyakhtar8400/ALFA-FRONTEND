import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import {
  FaTimes,
  FaMoneyBillWave,
  FaQrcode,
  FaCreditCard,
  FaCheck,
  FaWallet,
  FaBed,
  FaMoneyCheckAlt,
  FaUserClock,
  FaGlobe,
  FaGift
} from 'react-icons/fa';
import paymentModeService from '../../../services/paymentModeService';
import { printTaxInvoice } from '../utils/printInvoice';
import { orderService } from '../../../services/orderService';
import { restaurantApi } from '../../../api/restaurantApi';
import { useRestaurant } from '../../../context/RestaurantContext';
import posApi from '../../../api/posApi';
import { formatTableNo } from '../../../utils/tableFormat';

// Icon resolver for dynamic payment master modes
const getPaymentModeIcon = (name = '', type = '') => {
  const n = String(name).toLowerCase();
  const t = String(type).toUpperCase();
  if (t === 'CASH' || n.includes('cash')) return FaMoneyBillWave;
  if (t === 'UPI' || n.includes('upi') || n.includes('qr') || n.includes('gpay') || n.includes('phonepe') || n.includes('paytm')) return FaQrcode;
  if (t === 'CARD' || n.includes('card') || n.includes('pos') || n.includes('visa') || n.includes('master')) return FaCreditCard;
  if (n.includes('complimentary') || n.includes('free') || n.includes('gift') || n.includes('nc')) return FaGift;
  if (t === 'WALLET' || n.includes('wallet')) return FaWallet;
  if (n.includes('room') || n.includes('bed')) return FaBed;
  if (n.includes('cheque')) return FaMoneyCheckAlt;
  if (t === 'CREDIT' || n.includes('due') || n.includes('credit')) return FaUserClock;
  if (t === 'ONLINE' || n.includes('online') || n.includes('net') || n.includes('web') || n.includes('gateway')) return FaGlobe;
  return FaCreditCard;
};

const DEFAULT_FALLBACK_MODES = [
  { id: 'Cash', name: 'Cash', label: 'Cash', type: 'CASH' },
  { id: 'UPI', name: 'UPI', label: 'UPI / QR', type: 'UPI' },
  { id: 'Card', name: 'Card', label: 'Card / POS', type: 'CARD' },
  { id: 'Complimentary', name: 'Complimentary', label: 'Complimentary', type: 'OTHER' }
];

const QuickPaymentModal = ({
  isOpen,
  onClose,
  table,
  items = [],
  onTableUpdated,
  showToast,
  providedNetBill,
  providedTaxAmt,
  providedDiscountAmt,
  previousPaidAmount = 0,
  updatedGrandTotal = 0,
  additionalItemsAmount = 0
}) => {
  const navigate = useNavigate();
  const { setTables, activeStoreId, allOutlets } = useRestaurant();

  // Resolve Auto Settlement setting from current outlet
  const targetStoreId = table?.store_id || activeStoreId || localStorage.getItem('activeOutletId') || 'STORE_1';
  const currentOutlet = useMemo(() => {
    let list = Array.isArray(allOutlets) && allOutlets.length > 0 ? allOutlets : [];
    if (list.length === 0) {
      try {
        list = JSON.parse(localStorage.getItem('alfa_outlets') || '[]');
      } catch (e) {
        list = [];
      }
    }
    return list.find(o => String(o.store_id || `STORE_${o.id}`) === String(targetStoreId) || String(o.id) === String(targetStoreId)) || list[0] || null;
  }, [allOutlets, targetStoreId]);

  const isAutoSettlementEnabled = useMemo(() => {
    const rawVal = currentOutlet?.settings?.autoSettlement || currentOutlet?.autoSettlement || 'No';
    return String(rawVal).trim().toLowerCase() === 'yes';
  }, [currentOutlet]);

  // Mode Selection: 'single' | 'multi'
  const [payModeType, setPayModeType] = useState('single');

  // Enforce single mode when Auto Settlement is YES
  useEffect(() => {
    if (isAutoSettlementEnabled) {
      setPayModeType('single');
    }
  }, [isAutoSettlementEnabled]);

  // Dynamic Payment Master Modes
  const [dbPaymentModes, setDbPaymentModes] = useState(DEFAULT_FALLBACK_MODES);
  const [selectedMethod, setSelectedMethod] = useState('Cash'); // in single mode
  const [multiSelectedMethods, setMultiSelectedMethods] = useState(['Cash']); // in multi mode
  const [splitAmounts, setSplitAmounts] = useState({});
  const [cashTendered, setCashTendered] = useState('');
  const [modeReference, setModeReference] = useState('');
  const [compReason, setCompReason] = useState('Manager Courtesy');

  const [isSettling, setIsSettling] = useState(false);
  const [showPaymentSuccessModal, setShowPaymentSuccessModal] = useState(false);
  const [taxLines, setTaxLines] = useState([]);

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
  const totalDiscountAmt = providedDiscountAmt !== undefined
    ? Number(providedDiscountAmt)
    : Number(table?.discount_amount || table?.discountAmount || 0);

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

  let netBill = 0;
  if (providedNetBill !== undefined) {
    netBill = Number(providedNetBill);
  } else if (fallbackNet > 0) {
    netBill = fallbackNet;
  } else {
    netBill = Number(table?.total_amount || table?.totalAmount || table?.net_amount || 0);
  }

  // Fetch payment modes from Payment Master & ensure Complimentary is present
  const loadPaymentModes = useCallback(async () => {
    try {
      const res = await paymentModeService.getPaymentModes();
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.paymentModes)) list = res.paymentModes;
      else if (Array.isArray(res?.payment_modes)) list = res.payment_modes;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;

      let activeList = [];
      if (list && list.length > 0) {
        activeList = list
          .filter(p => p.active !== 'No' && p.isActive !== false)
          .map(p => {
            const rawName = p.name || p.payment_mode_name || 'Cash';
            const rawType = (p.type || 'CASH').toUpperCase();
            let label = p.alternative_title || rawName;
            if (rawType === 'UPI' && !label.includes('QR')) label = `${label} / QR`;
            if (rawType === 'CARD' && !label.includes('POS')) label = `${label} / POS`;
            return {
              id: p.id || rawName,
              name: rawName,
              label,
              type: rawType,
              charge_percent: Number(p.charge_percent || 0),
              is_quick_pay: p.is_quick_pay !== false
            };
          });
      }

      // Ensure 'Complimentary' is available as a choice only when Auto Settlement is NO
      if (!isAutoSettlementEnabled) {
        const hasComp = activeList.some(m => m.name.toLowerCase().includes('complimentary') || m.label.toLowerCase().includes('complimentary'));
        if (!hasComp) {
          activeList.push({
            id: 'Complimentary',
            name: 'Complimentary',
            label: 'Complimentary',
            type: 'OTHER',
            charge_percent: 0,
            is_quick_pay: true
          });
        }
      }

      let finalModes = activeList.length > 0 ? activeList : DEFAULT_FALLBACK_MODES;

      // ── AUTO SETTLEMENT: YES / NO ENFORCEMENT ───────────────────────
      // When Auto Settlement = YES: show only the Cash payment option.
      // Do not display other payment modes from Payment Master.
      // When Auto Settlement = NO: display all active and applicable payment modes.
      if (isAutoSettlementEnabled) {
        const cashOnly = finalModes.filter(m => m.type === 'CASH' || m.name.toLowerCase().trim() === 'cash' || m.label.toLowerCase().trim() === 'cash');
        finalModes = cashOnly.length > 0 ? cashOnly : [{ id: 'Cash', name: 'Cash', label: 'Cash', type: 'CASH', charge_percent: 0, is_quick_pay: true }];
      }

      setDbPaymentModes(finalModes);

      // Default selected mode
      const defaultMode = finalModes.find(m => m.type === 'CASH' || m.name.toLowerCase().includes('cash')) || finalModes[0];
      setSelectedMethod(defaultMode.name);
      setMultiSelectedMethods([defaultMode.name]);

      const initSplit = {};
      finalModes.forEach(m => {
        initSplit[m.name] = (m.name === defaultMode.name && netBill > 0) ? String(netBill) : '';
      });
      setSplitAmounts(initSplit);
    } catch (e) {
      console.warn('Failed to load dynamic payment modes from backend:', e?.message || e);
      if (isAutoSettlementEnabled) {
        const cashFallback = [{ id: 'Cash', name: 'Cash', label: 'Cash', type: 'CASH', charge_percent: 0, is_quick_pay: true }];
        setDbPaymentModes(cashFallback);
        setSelectedMethod('Cash');
        setMultiSelectedMethods(['Cash']);
        setSplitAmounts({ Cash: String(netBill) });
      } else {
        setDbPaymentModes(DEFAULT_FALLBACK_MODES);
        setSelectedMethod('Cash');
        setMultiSelectedMethods(['Cash']);
        setSplitAmounts({ Cash: String(netBill), Complimentary: '', UPI: '', Card: '' });
      }
    }
  }, [netBill, isAutoSettlementEnabled]);

  // Load payment modes and tax categories on open
  useEffect(() => {
    if (!isOpen) return;

    loadPaymentModes();

    const handleRefresh = () => loadPaymentModes();
    window.addEventListener('paymentMasterRefreshed', handleRefresh);
    window.addEventListener('paymentModesRefreshed', handleRefresh);

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

    return () => {
      window.removeEventListener('paymentMasterRefreshed', handleRefresh);
      window.removeEventListener('paymentModesRefreshed', handleRefresh);
    };
  }, [isOpen, loadPaymentModes]);

  // Reset tender and refs when open or netBill changes
  useEffect(() => {
    if (isOpen && netBill > 0) {
      setCashTendered(String(Math.round(netBill)));
      setPayModeType('single');
      setModeReference('');
      setCompReason('Manager Courtesy');
    }
  }, [isOpen, netBill]);

  const toast = (msg, type = 'success') => {
    if (typeof showToast === 'function') {
      showToast(msg);
    } else if (window.showToast) {
      window.showToast(msg, type);
    }
  };

  const targetTableId = table?.id || table?.table_id;
  const rawTableNo = table?.table_name || table?.no || table?.table_no || String(targetTableId || '');
  const targetTableNo = formatTableNo(rawTableNo, table?.prefix);
  const orderIndex = table?.current_order_id || table?.order_id || 1;

  // Single mode active object
  const activeModeObj = useMemo(() => {
    return dbPaymentModes.find(m => m.name === selectedMethod) || dbPaymentModes[0] || { name: 'Cash', type: 'CASH', label: 'Cash' };
  }, [dbPaymentModes, selectedMethod]);

  const isSingleComp = payModeType === 'single' && (activeModeObj.name.toLowerCase().includes('complimentary') || activeModeObj.label.toLowerCase().includes('complimentary'));
  const isCashMode = payModeType === 'single' && (activeModeObj.type === 'CASH' || activeModeObj.name.toLowerCase().includes('cash'));
  const isUpiMode = payModeType === 'single' && (activeModeObj.type === 'UPI' || activeModeObj.name.toLowerCase().includes('upi') || activeModeObj.name.toLowerCase().includes('qr'));
  const isCardMode = payModeType === 'single' && (activeModeObj.type === 'CARD' || activeModeObj.name.toLowerCase().includes('card') || activeModeObj.name.toLowerCase().includes('pos'));

  // Multi-option calculations
  const totalAllocatedMulti = useMemo(() => {
    if (payModeType !== 'multi') return netBill;
    return multiSelectedMethods.reduce((sum, modeName) => {
      const val = Number(splitAmounts[modeName]) || 0;
      return sum + val;
    }, 0);
  }, [payModeType, multiSelectedMethods, splitAmounts, netBill]);

  const remainingBalanceMulti = Math.max(0, netBill - totalAllocatedMulti);
  const overAllocatedMulti = Math.max(0, totalAllocatedMulti - netBill);

  const hasCompInMulti = useMemo(() => {
    return payModeType === 'multi' && multiSelectedMethods.some(m => m.toLowerCase().includes('complimentary'));
  }, [payModeType, multiSelectedMethods]);

  // Quick cash note buttons
  const quickNotes = useMemo(() => {
    const exact = Math.round(netBill);
    const defaults = [100, 500, 2000];
    const filteredDefaults = defaults.filter(d => d > exact);
    const list = [exact, ...filteredDefaults];
    if (list.length < 4 && exact > 100) {
      const nextRound = Math.ceil(exact / 100) * 100;
      if (!list.includes(nextRound)) list.splice(1, 0, nextRound);
    }
    return Array.from(new Set(list)).slice(0, 4);
  }, [netBill]);

  const numericCashTendered = Number(cashTendered) || 0;
  const cashReturn = numericCashTendered > netBill ? (numericCashTendered - netBill).toFixed(2) : '0.00';
  const cashDue = numericCashTendered < netBill ? (netBill - numericCashTendered).toFixed(2) : '0.00';

  // Toggle mode in Multi-Option
  const handleToggleMultiMode = (modeName) => {
    setMultiSelectedMethods(prev => {
      let updated;
      if (prev.includes(modeName)) {
        if (prev.length === 1) return prev; // keep at least 1
        updated = prev.filter(m => m !== modeName);
      } else {
        updated = [...prev, modeName];
      }

      // If adding a mode and there is remaining balance, auto-fill it!
      const currentAlloc = updated.reduce((s, m) => s + (Number(splitAmounts[m]) || 0), 0);
      const diff = Math.max(0, netBill - currentAlloc);
      if (diff > 0 && !prev.includes(modeName)) {
        setSplitAmounts(old => ({ ...old, [modeName]: String(diff) }));
      }
      return updated;
    });
  };

  // Settlement & Save
  const handleSettle = async () => {
    if (isSettling) return;
    setIsSettling(true);
    try {
      const cleanMobile = (table?.mobile && table?.mobile !== '—') ? table.mobile : '';

      let paymentsArray = [];
      let mainMode = selectedMethod;
      let isComplimentaryOrder = false;

      if (payModeType === 'multi') {
        paymentsArray = multiSelectedMethods
          .filter(mode => Number(splitAmounts[mode]) > 0)
          .map(mode => ({ method: mode, amount: Number(splitAmounts[mode]) }));

        if (paymentsArray.length === 0) {
          paymentsArray = [{ method: multiSelectedMethods[0] || 'Cash', amount: netBill }];
        }
        mainMode = paymentsArray[0].method;

        // Check if fully complimentary
        const compItem = paymentsArray.find(p => p.method.toLowerCase().includes('complimentary'));
        if (compItem && compItem.amount >= netBill) {
          isComplimentaryOrder = true;
        }
      } else {
        if (isSingleComp) {
          paymentsArray = [{ method: 'Complimentary', amount: netBill }];
          mainMode = 'Complimentary';
          isComplimentaryOrder = true;
        } else {
          paymentsArray = [{ method: selectedMethod, amount: netBill }];
          mainMode = selectedMethod;
        }
      }

      const isExistingBill = Boolean(table?.current_order_id && String(table.current_order_id).startsWith('ORD-')) ||
                            Boolean(table?.order_id && String(table.order_id).startsWith('ORD-'));
      let createdOrderId = isExistingBill ? (table?.current_order_id || table?.order_id) : null;
      const associatedKotId = table?.kot_id || (!isExistingBill ? (table?.current_order_id || table?.order_id || table?.id) : null);

      const isOrderTakeaway = table?.serviceType === 'Takeaway' || table?.order_type === 'TAKEAWAY' || table?.isTakeaway || String(table?.tableName || table?.table_name || '').startsWith('TK') || String(rawTableNo).startsWith('TK');
      const isOrderDelivery = table?.serviceType === 'Delivery' || table?.order_type === 'DELIVERY' || table?.isDelivery || String(table?.tableName || table?.table_name || '').startsWith('DL') || String(rawTableNo).startsWith('DL');
      const isPhysicalDineIn = !isOrderTakeaway && !isOrderDelivery && Number(targetTableId) > 0;

      const orderPayload = {
        ...(createdOrderId && { id: createdOrderId, order_id: createdOrderId, current_order_id: createdOrderId }),
        ...(associatedKotId && { kot_id: associatedKotId }),
        tableId: isPhysicalDineIn ? (Number(targetTableId) || 1) : 0,
        tableNo: String(rawTableNo),
        order_type: isOrderDelivery ? 'DELIVERY' : (isOrderTakeaway ? 'TAKEAWAY' : 'DINE_IN'),
        billing_type: isOrderDelivery ? 3 : (isOrderTakeaway ? 2 : 1),
        customerName: table?.customer || table?.customer_name || 'Walk-in',
        mobileNo: cleanMobile,
        customer_address: table?.customer_address || table?.address || '',
        waiter: table?.waiter || 'Staff',
        status: 'completed',
        payment_status: 'Paid',
        paymentMode: mainMode,
        payments: paymentsArray,
        items: activeRows.length > 0 ? activeRows : [{ name: 'Order Items', qty: 1, unitPrice: netBill }],
        discount: totalDiscountAmt,
        tax: isComplimentaryOrder ? 0 : totalTax,
        cgst: isComplimentaryOrder ? 0 : cgstAmt,
        sgst: isComplimentaryOrder ? 0 : sgstAmt,
        grand_total: netBill,
        total_amount: netBill,
        store_id: activeStoreId,
        is_complimentary: isComplimentaryOrder ? 1 : 0,
        complimentary_reason: (isComplimentaryOrder || hasCompInMulti) ? compReason : ''
      };

      if (createdOrderId) {
        if (Number(previousPaidAmount) > 0) {
          // Bill has existing payments: settle ONLY the delta amount, preserving original bill total & previous payments
          await orderService.settleOrder(createdOrderId, {
            amount: netBill,
            paymentMode: mainMode,
            paymentMethod: mainMode
          }).catch(err => console.warn('Settling additional delta payment warning:', err));
        } else {
          await orderService.updateOrder(createdOrderId, orderPayload).catch(err => console.warn('Order update warning in quick pay:', err));
          await orderService.processPayment({
            orderId: createdOrderId,
            payments: paymentsArray,
            paymentMethod: mainMode,
            amount: netBill
          }).catch(() => { });
        }
      } else {
        const orderRes = await orderService.createOrder(orderPayload).catch(err => {
          console.warn('Order creation warning in quick pay:', err);
          return null;
        });
        createdOrderId = orderRes?.order?.id || orderRes?.data?.id || orderRes?.order?.order_id || orderRes?.data?.order_id;
        if (createdOrderId) {
          await orderService.processPayment({
            orderId: createdOrderId,
            payments: paymentsArray,
            paymentMethod: mainMode,
            amount: netBill
          }).catch(() => { });
        }
      }

      // Patch table status to Blank in PostgreSQL STRICTLY for Dine-In only!
      if (isPhysicalDineIn && targetTableId) {
        await restaurantApi.patchTableStatus(targetTableId, {
          status: 'Blank',
          amount: 0,
          payment_status: 'PAID',
          customer: '',
          waiter: null,
          remaining_seconds: 0
        }).catch(() => { });
      }

      if (setTables && isPhysicalDineIn) {
        setTables(prev => prev.map(t => {
          if (String(t.id) === String(targetTableId) || String(t.no) === String(rawTableNo)) {
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

      // Payment complete - do not call print API per user requirement
      const successLabel = isComplimentaryOrder ? 'settled as Complimentary' : `paid via ${mainMode}`;
      toast(`Table ${targetTableNo} ${successLabel}!`);

      // Once billing is successfully completed, mark used temporary items as billed
      const billedTempIds = activeRows
        .filter(it => it.is_open_item === 1 || it.is_open_item === '1' || it.is_open_item === true)
        .map(it => it.itemId || it.id)
        .filter(Boolean);

      if (billedTempIds.length > 0) {
        try {
          const stored = JSON.parse(localStorage.getItem('alfa_billed_temp_items') || '[]');
          const merged = Array.from(new Set([...stored, ...billedTempIds]));
          localStorage.setItem('alfa_billed_temp_items', JSON.stringify(merged));
        } catch (e) { }

        billedTempIds.forEach(tId => {
          posApi.markItemBilled(tId).catch(() => {});
        });
      }

      setShowPaymentSuccessModal(true);
      setTimeout(() => {
        if (typeof onTableUpdated === 'function') onTableUpdated();
        onClose();
        setShowPaymentSuccessModal(false);
        setIsSettling(false);
      }, 1000);
    } catch (err) {
      toast(err.message || 'Failed to settle bill', 'error');
      setIsSettling(false);
    }
  };

  // Keyboard shortcut listener (Enter = Settle, Esc = Close)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSettle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, netBill, selectedMethod, cashTendered, payModeType, multiSelectedMethods, splitAmounts, isSettling, isSingleComp]);

  if (!isOpen || !table) return null;

  return typeof document !== 'undefined' ? createPortal(
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
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
          borderRadius: '16px',
          width: '100%',
          maxWidth: '490px',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.18)',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          animation: 'modalScaleIn 0.15s ease-out',
          boxSizing: 'border-box'
        }}
        onClick={e => e.stopPropagation()}
      >
        <style>{`
          @keyframes modalScaleIn {
            from { transform: scale(0.96); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                background: isSingleComp ? '#fef3c7' : '#ecfdf5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isSingleComp ? '#d97706' : '#0d9488',
                fontSize: '1.25rem',
                flexShrink: 0,
                border: isSingleComp ? '1px solid #fde68a' : '1px solid #ccfbf1'
              }}
            >
              {isSingleComp ? <FaGift /> : <FaCreditCard />}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                  Collect Payment
                </span>
                <span
                  style={{
                    background: '#0f766e',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    padding: '2px 7px',
                    borderRadius: '5px'
                  }}
                >
                  {targetTableNo}
                </span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                  #{orderIndex}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                {isSingleComp
                  ? 'Mark entire table settlement as 100% Complimentary'
                  : payModeType === 'multi'
                    ? 'Split payment across multiple options including Complimentary'
                    : 'Select payment method & complete settlement'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px',
              borderRadius: '6px',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#334155'}
            onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
          >
            <FaTimes />
          </button>
        </div>

        {/* Payment Breakdown Card (Shows when editing an existing bill with prior payments) */}
        {Number(previousPaidAmount) > 0 ? (
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '12px',
              padding: '14px 18px',
              marginTop: '16px',
              border: '1.5px solid #cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
              <span>Updated Grand Total:</span>
              <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>
                ₹{Number(updatedGrandTotal || (Number(previousPaidAmount) + netBill)).toFixed(2)}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
              <span>Previously Paid Amount (Preserved):</span>
              <strong style={{ color: '#047857', fontSize: '0.92rem' }}>
                ₹{Number(previousPaidAmount).toFixed(2)}
              </strong>
            </div>

            {Number(additionalItemsAmount) > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
                <span>Additional Items Amount:</span>
                <strong style={{ color: '#0d9488', fontSize: '0.92rem' }}>
                  ₹{Number(additionalItemsAmount).toFixed(2)}
                </strong>
              </div>
            )}

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              borderTop: '1.5px dashed #cbd5e1',
              paddingTop: '8px',
              marginTop: '2px'
            }}>
              <div>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Remaining Balance to Collect:
                </span>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                  (Outstanding amount only, prior payments are NOT recharged)
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 900, color: '#dc2626', letterSpacing: '-0.5px' }}>
                ₹{netBill.toFixed(2)}
              </div>
            </div>
          </div>
        ) : (
          /* Standard Total Amount Card */
          <div
            style={{
              background: isSingleComp ? '#fffbeb' : '#f1f5f9',
              borderRadius: '12px',
              padding: '14px 18px',
              marginTop: '16px',
              border: isSingleComp ? '1px solid #fef3c7' : '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: isSingleComp ? '#b45309' : '#64748b',
                  letterSpacing: '0.8px',
                  textTransform: 'uppercase'
                }}
              >
                {isSingleComp ? 'Complimentary Waiver' : 'Total Amount to Collect'}
              </div>
              <div
                style={{
                  fontSize: '1.85rem',
                  fontWeight: 900,
                  color: isSingleComp ? '#92400e' : '#0f172a',
                  marginTop: '4px',
                  letterSpacing: '-0.5px'
                }}
              >
                ₹{netBill.toFixed(2)}
              </div>
            </div>
            {isSingleComp && (
              <span
                style={{
                  background: '#f59e0b',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '6px',
                  letterSpacing: '0.5px'
                }}
              >
                100% COMPLIMENTARY
              </span>
            )}
          </div>
        )}

        {/* Selection Type Segmented Switcher (Single vs Multi-Option) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            marginBottom: '10px'
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#475569',
              textTransform: 'uppercase',
              letterSpacing: '0.6px'
            }}
          >
            Payment Mode {payModeType === 'multi' ? '(Multi-Select Active)' : ''}
          </div>

          {/* Single / Multi Option Toggle Pill (Only available when Auto Settlement is NO) */}
          {!isAutoSettlementEnabled && (
            <div
              style={{
                display: 'flex',
                background: '#f1f5f9',
                borderRadius: '8px',
                padding: '2px',
                border: '1px solid #e2e8f0'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setPayModeType('single');
                  const def = dbPaymentModes.find(m => m.name.toLowerCase().includes('cash')) || dbPaymentModes[0];
                  setSelectedMethod(def.name);
                }}
                style={{
                  background: payModeType === 'single' ? '#ffffff' : 'transparent',
                  color: payModeType === 'single' ? '#0f172a' : '#64748b',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: payModeType === 'single' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Single Mode
              </button>
              <button
                type="button"
                onClick={() => {
                  setPayModeType('multi');
                  if (multiSelectedMethods.length === 0) {
                    setMultiSelectedMethods(['Cash']);
                  }
                }}
                style={{
                  background: payModeType === 'multi' ? '#0d9488' : 'transparent',
                  color: payModeType === 'multi' ? '#ffffff' : '#64748b',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: payModeType === 'multi' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                Multi-Option / Split
              </button>
            </div>
          )}
        </div>

        {/* Payment Modes Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: dbPaymentModes.length <= 4 ? `repeat(${dbPaymentModes.length}, 1fr)` : 'repeat(auto-fill, minmax(105px, 1fr))',
            gap: '8px'
          }}
        >
          {dbPaymentModes.map((mode) => {
            const IconComp = getPaymentModeIcon(mode.name, mode.type);
            const isCompMode = mode.name.toLowerCase().includes('complimentary');

            let isSelected = false;
            if (payModeType === 'single') {
              isSelected = selectedMethod === mode.name;
            } else {
              isSelected = multiSelectedMethods.includes(mode.name);
            }

            // Custom active styling (Teal for regular, Amber for Complimentary)
            const activeBg = isCompMode ? '#f59e0b' : '#0d9488';
            const activeBorder = isCompMode ? '1.5px solid #d97706' : '1.5px solid #0d9488';
            const activeShadow = isCompMode ? '0 4px 12px rgba(245, 158, 11, 0.25)' : '0 4px 12px rgba(13, 148, 136, 0.25)';

            return (
              <button
                key={mode.id || mode.name}
                type="button"
                onClick={() => {
                  if (payModeType === 'single') {
                    setSelectedMethod(mode.name);
                  } else {
                    handleToggleMultiMode(mode.name);
                  }
                }}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '12px 6px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  transition: 'all 0.15s ease',
                  border: isSelected ? activeBorder : '1px solid #e2e8f0',
                  background: isSelected ? activeBg : '#ffffff',
                  color: isSelected ? '#ffffff' : '#334155',
                  boxShadow: isSelected ? activeShadow : 'none'
                }}
              >
                {/* Multi-mode check badge */}
                {payModeType === 'multi' && isSelected && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px'
                    }}
                  >
                    <FaCheck />
                  </div>
                )}
                <IconComp style={{ fontSize: '1.2rem' }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                  {mode.label || mode.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* SINGLE MODE DETAILS */}
        {payModeType === 'single' && (
          <div style={{ marginTop: '16px' }}>
            {isCashMode ? (
              <>
                {/* Cash Given Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                    Cash Given by Customer:
                  </span>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: '8px', fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      placeholder="0"
                      style={{
                        width: '105px',
                        padding: '6px 8px 6px 20px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        textAlign: 'right',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        outline: 'none',
                        color: '#0f172a'
                      }}
                      onFocus={(e) => e.target.select()}
                    />
                  </div>
                </div>

                {/* Quick Note Presets */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '12px',
                    flexWrap: 'wrap'
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                    Quick Note:
                  </span>
                  {quickNotes.map((note) => (
                    <button
                      key={note}
                      type="button"
                      onClick={() => setCashTendered(String(note))}
                      style={{
                        background: Number(cashTendered) === note ? '#e2e8f0' : '#f8fafc',
                        border: Number(cashTendered) === note ? '1px solid #94a3b8' : '1px solid #e2e8f0',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#334155',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      ₹{note}
                    </button>
                  ))}
                </div>

                {/* Change or Balance indicators */}
                {numericCashTendered > netBill && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      color: '#065f46',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>Change to Return:</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 900 }}>₹{cashReturn}</span>
                  </div>
                )}
                {numericCashTendered < netBill && numericCashTendered > 0 && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#fff7ed',
                      border: '1px solid #fed7aa',
                      color: '#9a3412',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>Remaining Balance:</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 900 }}>₹{cashDue}</span>
                  </div>
                )}
              </>
            ) : isSingleComp ? (
              /* Complimentary Reason & Details */
              <div
                style={{
                  background: '#fffbeb',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  border: '1px solid #fef3c7',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#92400e' }}>
                    Complimentary Reason:
                  </span>
                  <select
                    value={compReason}
                    onChange={e => setCompReason(e.target.value)}
                    style={{
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1px solid #fde68a',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#78350f',
                      outline: 'none',
                      background: '#ffffff'
                    }}
                  >
                    <option value="Manager Courtesy">Manager Courtesy</option>
                    <option value="VIP Guest">VIP Guest</option>
                    <option value="Staff / Owner Meal">Staff / Owner Meal</option>
                    <option value="Food Quality Issue">Food Quality Issue</option>
                    <option value="Promotion / Tasting">Promotion / Tasting</option>
                  </select>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#b45309' }}>
                  ℹ Entire bill of ₹{netBill.toFixed(2)} will be settled as Non-Chargeable (Complimentary).
                </div>
              </div>
            ) : isUpiMode ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  UPI Ref / UTR No:
                </span>
                <input
                  type="text"
                  placeholder="Optional reference"
                  value={modeReference}
                  onChange={(e) => setModeReference(e.target.value)}
                  style={{
                    width: '180px',
                    padding: '6px 10px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    color: '#0f172a'
                  }}
                />
              </div>
            ) : isCardMode ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  Card Auth / Ref No:
                </span>
                <input
                  type="text"
                  placeholder="Optional card ref"
                  value={modeReference}
                  onChange={(e) => setModeReference(e.target.value)}
                  style={{
                    width: '180px',
                    padding: '6px 10px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    color: '#0f172a'
                  }}
                />
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                  {activeModeObj.name} Ref / Notes:
                </span>
                <input
                  type="text"
                  placeholder="Optional reference"
                  value={modeReference}
                  onChange={(e) => setModeReference(e.target.value)}
                  style={{
                    width: '180px',
                    padding: '6px 10px',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    outline: 'none',
                    color: '#0f172a'
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* MULTI-OPTION DETAILS (SPLIT ACROSS MULTIPLE MODES INCLUDING COMPLIMENTARY) */}
        {payModeType === 'multi' && (
          <div
            style={{
              marginTop: '16px',
              padding: '12px 14px',
              background: '#f8fafc',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                Allocate Amount Per Selected Option:
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: remainingBalanceMulti === 0 ? '#059669' : '#dc2626',
                  background: remainingBalanceMulti === 0 ? '#ecfdf5' : '#fee2e2',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}
              >
                {remainingBalanceMulti === 0 ? '✓ Exact Match' : `Remaining: ₹${remainingBalanceMulti.toFixed(2)}`}
              </span>
            </div>

            {/* List of active multi-selected options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '150px', overflowY: 'auto' }}>
              {multiSelectedMethods.map(modeName => {
                const isThisComp = modeName.toLowerCase().includes('complimentary');
                return (
                  <div key={modeName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isThisComp ? '#d97706' : '#334155' }}>
                        {modeName}:
                      </span>
                      {isThisComp && (
                        <span style={{ background: '#fef3c7', color: '#b45309', fontSize: '0.65rem', fontWeight: 800, padding: '1px 5px', borderRadius: '4px' }}>
                          NC
                        </span>
                      )}
                    </div>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '8px', fontSize: '0.78rem', fontWeight: 700, color: '#64748b' }}>₹</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={splitAmounts[modeName] || ''}
                        onChange={(e) => setSplitAmounts(prev => ({ ...prev, [modeName]: e.target.value }))}
                        style={{
                          width: '105px',
                          padding: '5px 8px 5px 20px',
                          fontSize: '0.82rem',
                          fontWeight: 700,
                          textAlign: 'right',
                          borderRadius: '6px',
                          border: isThisComp ? '1px solid #fde68a' : '1px solid #cbd5e1',
                          outline: 'none',
                          background: isThisComp ? '#fffbeb' : '#ffffff'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Balance Button if remaining > 0 */}
            {remainingBalanceMulti > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
                {multiSelectedMethods.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      const cur = Number(splitAmounts[m]) || 0;
                      setSplitAmounts(prev => ({ ...prev, [m]: String((cur + remainingBalanceMulti).toFixed(2)) }));
                    }}
                    style={{
                      background: '#e2e8f0',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '3px 8px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      color: '#334155',
                      cursor: 'pointer'
                    }}
                  >
                    + Add ₹{remainingBalanceMulti.toFixed(2)} to {m}
                  </button>
                ))}
              </div>
            )}

            {/* Complimentary Reason in Multi-mode */}
            {hasCompInMulti && (
              <div style={{ borderTop: '1px dashed #cbd5e1', paddingTop: '8px', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#b45309' }}>
                    Complimentary Reason:
                  </span>
                  <select
                    value={compReason}
                    onChange={e => setCompReason(e.target.value)}
                    style={{
                      padding: '3px 6px',
                      borderRadius: '5px',
                      border: '1px solid #fde68a',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#78350f',
                      background: '#fffbeb'
                    }}
                  >
                    <option value="Manager Courtesy">Manager Courtesy</option>
                    <option value="VIP Guest">VIP Guest</option>
                    <option value="Staff Meal">Staff Meal</option>
                    <option value="Food Quality Issue">Food Quality Issue</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '22px',
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: '6px',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
            onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
          >
            Cancel (Esc)
          </button>

          <button
            type="button"
            onClick={handleSettle}
            disabled={isSettling}
            style={{
              background: isSingleComp ? '#d97706' : '#0d9488',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 18px',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: isSettling ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: isSingleComp ? '0 4px 12px rgba(217, 119, 6, 0.25)' : '0 4px 12px rgba(13, 148, 136, 0.25)',
              transition: 'all 0.15s ease',
              opacity: isSettling ? 0.7 : 1
            }}
            onMouseEnter={e => {
              if (!isSettling) {
                e.currentTarget.style.background = isSingleComp ? '#b45309' : '#0f766e';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }
            }}
            onMouseLeave={e => {
              if (!isSettling) {
                e.currentTarget.style.background = isSingleComp ? '#d97706' : '#0d9488';
                e.currentTarget.style.transform = 'translateY(0)';
              }
            }}
          >
            <span>
              {isSingleComp
                ? `Settle as Complimentary • ₹${netBill.toFixed(2)}`
                : `Settle Bill • ₹${netBill.toFixed(2)}`}
            </span>
            <span
              style={{
                background: 'rgba(255,255,255,0.22)',
                borderRadius: '4px',
                padding: '2px 6px',
                fontSize: '0.7rem',
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              ↵ Enter
            </span>
          </button>
        </div>

        {/* Payment Completed Modal Popup */}
        {showPaymentSuccessModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 1000000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '36px 32px',
                textAlign: 'center',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                width: '340px',
                animation: 'modalScaleIn 0.15s ease-out'
              }}
            >
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  fontSize: '1.75rem'
                }}
              >
                <FaCheck />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
                Payment Completed
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0, fontWeight: 500 }}>
                {isSingleComp ? 'Settled as Complimentary (Non-Chargeable)' : 'Transaction Settled Successfully'}
              </p>
              <span style={{ fontSize: '0.72rem', color: '#9ca3af', display: 'block', marginTop: '14px' }}>
                Updating table registers...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  ) : null;
};

export default QuickPaymentModal;
