import React, { useState, useEffect, useMemo } from 'react';
import {
  FaReceipt,
  FaPrint,
  FaEdit,
  FaTimes,
  FaCheck,
  FaUtensils,
  FaCreditCard,
  FaSearch,
  FaPlus,
  FaMinus,
  FaTrashAlt,
  FaExternalLinkAlt,
  FaUser,
  FaCalendarAlt,
  FaConciergeBell,
  FaBuilding,
  FaSyncAlt,
  FaCheckCircle,
  FaSave,
  FaMoneyBillWave,
  FaQrcode,
  FaLayerGroup
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { printTaxInvoice, printKitchenKOT } from '../utils/printInvoice';
import { orderService } from '../../../services/orderService';
import { kotService } from '../../../services/kotService';
import apiClient from '../../../services/apiClient';
import QuickPaymentModal from './QuickPaymentModal';

export default function OrderInspectorModal({ isOpen, onClose, order, tables = [], storeId, onOrderUpdated, showToast }) {
  const navigate = useNavigate();

  // Active Tab: 'invoice', 'kot', 'payments', 'timeline'
  const [activeTab, setActiveTab] = useState('invoice');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable bill state
  const [editableItems, setEditableItems] = useState([]);
  const [billDiscountType, setBillDiscountType] = useState('flat'); // 'flat' | 'percent'
  const [billDiscountVal, setBillDiscountVal] = useState(0);
  const [billNotes, setBillNotes] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Catalog items for edit mode
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);

  // Variant selector modal state for items with variants
  const [variantModalItem, setVariantModalItem] = useState(null);

  // Feedback notification banner when item added
  const [lastAddedAlert, setLastAddedAlert] = useState(null);

  // KOTs and Payments history
  const [kots, setKots] = useState([]);
  const [payments, setPayments] = useState([]);
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [loadingExtras, setLoadingExtras] = useState(false);

  // Original snapshot of items to track delta for supplementary KOT
  // Map of "itemId_variantName" -> originalQty
  const [originalItemsSnapshot, setOriginalItemsSnapshot] = useState({});

  // Additional Payment Collection Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pendingAdditionalPay, setPendingAdditionalPay] = useState(0);
  const [livePaymentStatus, setLivePaymentStatus] = useState(null);
  const [selectedPayMode, setSelectedPayMode] = useState('Cash');
  const [payAmountInput, setPayAmountInput] = useState(0);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Helper to build unique key for item tracking
  const getItemKey = (it) => {
    const iId = String(it.itemId || it.id || it.item_id || it.name);
    const vName = String(it.variantName || it.alternative_title || it.variant || '').trim().toLowerCase();
    return `${iId}__${vName}`;
  };

  // Initialize data when order opens
  useEffect(() => {
    if (!order || !isOpen) return;

    setActiveTab('invoice');
    setIsEditing(false);
    setShowPaymentModal(false);

    // Parse items safely
    const initialItems = (Array.isArray(order.items) ? order.items : []).map((it, idx) => {
      const rate = Number(it.unitPrice || it.price || it.rate || 0);
      const qty = Number(it.qty || it.quantity || 1);
      const discount = Number(it.discount || 0);
      const taxable = Math.max(0, (rate * qty) - discount);
      return {
        id: it.itemId || it.item_id || it.id || (idx + 1),
        itemId: it.itemId || it.item_id || it.id || (idx + 1),
        name: it.itemName || it.title || it.name || 'Dish',
        variantName: it.variantName || it.alternative_title || it.variant || '',
        qty: qty,
        unitPrice: rate,
        price: rate,
        discount: discount,
        taxable: taxable,
        total: (rate * qty) - discount,
        isVeg: it.isVeg !== undefined ? it.isVeg : (it.veg === 1 || it.veg === '1' || it.food_type === 'VEG' || true),
        status: it.status || 'CHARGEABLE'
      };
    });

    setEditableItems(initialItems);

    // Build original items snapshot map
    const snapshot = {};
    initialItems.forEach(it => {
      const k = getItemKey(it);
      snapshot[k] = (snapshot[k] || 0) + Number(it.qty || 1);
    });
    setOriginalItemsSnapshot(snapshot);

    setBillDiscountVal(Number(order.discount || 0));
    setBillDiscountType('flat');
    setBillNotes(order.extra_details?.notes || order.notes || '');
    setCustomerName(order.customerName || order.cust_name || 'Walk-in Customer');
    setCustomerPhone(order.mobileNo || order.phone || '');

    // Set initial payment state
    const isOrderPaid = String(order.payment_status || 'Paid').toUpperCase() === 'PAID';
    const initialPaidAmt = isOrderPaid ? Number(order.amount || order.grand_total || order.total_amount || 0) : 0;
    setTotalPaidAmount(initialPaidAmt);

    const initialPayRecord = {
      id: 1,
      mode: order.paymentMode || order.payment_mode || 'Cash',
      amount: initialPaidAmt,
      status: isOrderPaid ? 'COMPLETED' : 'PENDING',
      date: order.billDate || new Date().toLocaleDateString('en-GB'),
      time: order.billTime || '11:30 AM',
      ref: `TXN-${order.id || order.orderNo || '001'}`
    };
    setPayments(initialPaidAmt > 0 ? [initialPayRecord] : []);

    // Fetch full order data, KOTs, and menu
    fetchOrderDetails(order.id || order.order_id);
  }, [order, isOpen]);

  const fetchOrderDetails = async (orderId) => {
    if (!orderId) return;
    setLoadingExtras(true);
    try {
      // 1. Fetch fresh order
      const res = await orderService.getOrderById(orderId);
      const freshOrder = res?.order || res?.data;
      if (freshOrder && freshOrder.items && freshOrder.items.length > 0) {
        const freshItems = freshOrder.items.map((it, idx) => {
          const rate = Number(it.unitPrice || it.price || it.rate || 0);
          const qty = Number(it.qty || it.quantity || 1);
          const discount = Number(it.discount || 0);
          return {
            id: it.itemId || it.item_id || it.id || (idx + 1),
            itemId: it.itemId || it.item_id || it.id || (idx + 1),
            name: it.itemName || it.title || it.name || 'Dish',
            variantName: it.variantName || it.alternative_title || it.variant || '',
            qty: qty,
            unitPrice: rate,
            price: rate,
            discount: discount,
            taxable: Math.max(0, (rate * qty) - discount),
            total: (rate * qty) - discount,
            isVeg: it.isVeg !== undefined ? it.isVeg : true,
            status: it.status || 'CHARGEABLE'
          };
        });

        setEditableItems(freshItems);

        // Update baseline snapshot
        const snap = {};
        freshItems.forEach(it => {
          const k = getItemKey(it);
          snap[k] = (snap[k] || 0) + Number(it.qty || 1);
        });
        setOriginalItemsSnapshot(snap);
      }

      // 2. Fetch KOT list for this table/order
      const targetTableId = order.table_id || freshOrder?.table_id;
      const targetStore = storeId || order.store_id || localStorage.getItem('activeOutletId') || 'STORE_1';
      if (targetTableId || order.id) {
        const kotRes = await kotService.getKOTList({
          table_id: targetTableId,
          active: 'all',
          store_id: targetStore
        }).catch(() => null);
        let rawKots = kotRes?.kots || kotRes?.data || [];
        if (Array.isArray(rawKots)) {
          // If we have order.id, filter to KOTs matching this order or table
          const matchedKots = rawKots.filter(k => {
            const extra = typeof k.extra_details === 'string' ? JSON.parse(k.extra_details || '{}') : (k.extra_details || {});
            if (extra.order_id && String(extra.order_id) === String(order.id)) return true;
            if (targetTableId && String(k.table_id) === String(targetTableId)) return true;
            if (order.tableNo && (k.tableId === order.tableNo || k.table_name === `Table ${order.tableNo}`)) return true;
            return false;
          });
          setKots(matchedKots.length > 0 ? matchedKots : rawKots);
        }
      }

      // 3. Payments record from backend
      if (freshOrder?.payments && Array.isArray(freshOrder.payments) && freshOrder.payments.length > 0) {
        setPayments(freshOrder.payments);
        const paidSum = freshOrder.payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
        setTotalPaidAmount(paidSum);
      } else if (freshOrder?.total_paid !== undefined) {
        setTotalPaidAmount(Number(freshOrder.total_paid || 0));
      }

    } catch (e) {
      console.warn('Error fetching detailed order info:', e);
    } finally {
      setLoadingExtras(false);
    }
  };

  // Load menu catalog for Edit mode
  useEffect(() => {
    if (!isEditing || menuItems.length > 0) return;
    setLoadingMenu(true);
    apiClient.get('/menu')
      .then(res => {
        const raw = (
          res?.data?.items ||
          res?.items ||
          res?.catalouge?.items ||
          res?.data?.catalouge?.items ||
          (Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []))
        );
        if (Array.isArray(raw)) {
          const catSet = new Set(['All']);
          const mapped = raw.map(i => {
            const cat = (i.mpos_category && i.mpos_category.category_name)
              ? String(i.mpos_category.category_name)
              : (i.category || i.category_name || 'General');
            catSet.add(cat);

            let rawVariants = i.variants || i.discounted_items || i.portions || [];
            if (typeof rawVariants === 'string') {
              try { rawVariants = JSON.parse(rawVariants); } catch (e) { rawVariants = []; }
            }
            const parsedVariants = (Array.isArray(rawVariants) ? rawVariants : [])
              .filter(v => v && (v.name || v.portion_name || v.title))
              .map(v => ({
                id: v.id || v.portion_id || `v_${v.name || v.portion_name}`,
                name: v.name || v.portion_name || v.title || '',
                price: Number(v.price || v.sale_price || v.rate || 0)
              }))
              .filter(v => v.name && v.price >= 0);

            return {
              id: i.item_id || i.id,
              itemId: i.item_id || i.id,
              name: i.title || i.item_name || i.name || 'Dish',
              price: Number(i.sale_price_1 || i.price || i.sale_price || 0),
              category: cat,
              isVeg: i.food_type === 'VEG' || i.food_type === 1 || i.is_veg === 1 || i.is_veg === true,
              variants: parsedVariants
            };
          });
          setMenuItems(mapped);
          setCategories(Array.from(catSet));
        }
      })
      .catch(err => console.warn('Failed to fetch menu for order editing:', err))
      .finally(() => setLoadingMenu(false));
  }, [isEditing, menuItems.length]);

  // Dynamic calculations: all items in the bill are chargeable
  const totals = useMemo(() => {
    let subtotal = 0;
    editableItems.forEach(it => {
      subtotal += (Number(it.qty || 1) * Number(it.unitPrice || 0));
    });

    let discountAmt = 0;
    if (billDiscountType === 'percent') {
      discountAmt = (subtotal * (Number(billDiscountVal) || 0)) / 100;
    } else {
      discountAmt = Number(billDiscountVal) || 0;
    }
    discountAmt = Math.min(subtotal, Math.max(0, discountAmt));

    const taxable = Math.max(0, subtotal - discountAmt);
    const cgst = Math.round((taxable * 0.025) * 100) / 100;
    const sgst = Math.round((taxable * 0.025) * 100) / 100;
    const taxes = cgst + sgst;
    const rawGrandTotal = taxable + taxes;
    const grandTotal = Math.round(rawGrandTotal);
    const roundOff = Math.round((grandTotal - rawGrandTotal) * 100) / 100;

    const paidAmount = Number(totalPaidAmount || 0);
    const balanceDue = Math.max(0, Math.round((grandTotal - paidAmount) * 100) / 100);
    const refundOrCreditDue = Math.max(0, Math.round((paidAmount - grandTotal) * 100) / 100);

    return {
      subtotal,
      discountAmt,
      taxable,
      cgst,
      sgst,
      taxes,
      roundOff,
      grandTotal,
      paidAmount,
      balanceDue,
      refundOrCreditDue
    };
  }, [editableItems, billDiscountType, billDiscountVal, totalPaidAmount]);

  // Edit Cart Operations: Add item with variant support & normalized ID matching
  const handleAddItemToOrder = (menuItem, selectedVariant = null) => {
    // If the item has variants and no variant was explicitly selected, prompt the variant modal
    if (!selectedVariant && Array.isArray(menuItem.variants) && menuItem.variants.length > 0) {
      setVariantModalItem(menuItem);
      return;
    }

    const mId = String(menuItem.itemId || menuItem.id);
    const vName = selectedVariant ? String(selectedVariant.name || '').trim() : '';
    const itemPrice = selectedVariant ? Number(selectedVariant.price || menuItem.price || 0) : Number(menuItem.price || 0);

    setEditableItems(prev => {
      const existingIdx = prev.findIndex(i => {
        const sameId = String(i.itemId || i.id) === mId;
        const currentV = String(i.variantName || '').trim();
        return sameId && currentV === vName;
      });

      if (existingIdx >= 0) {
        const copy = [...prev];
        const current = copy[existingIdx];
        const nextQty = Number(current.qty || 1) + 1;
        copy[existingIdx] = {
          ...current,
          qty: nextQty,
          total: nextQty * Number(current.unitPrice || itemPrice)
        };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: menuItem.id || menuItem.itemId,
            itemId: menuItem.id || menuItem.itemId,
            name: menuItem.name,
            variantName: vName,
            qty: 1,
            unitPrice: itemPrice,
            price: itemPrice,
            discount: 0,
            taxable: itemPrice,
            total: itemPrice,
            isVeg: Boolean(menuItem.isVeg),
            status: 'CHARGEABLE'
          }
        ];
      }
    });

    // Instant alert banner
    const itemDisplayName = vName ? `${menuItem.name} (${vName})` : menuItem.name;
    setLastAddedAlert(`Added "${itemDisplayName}" to bill`);
    setTimeout(() => setLastAddedAlert(null), 2500);

    // Close variant modal if open
    setVariantModalItem(null);
  };

  const handleUpdateQty = (idx, delta) => {
    setEditableItems(prev => {
      const copy = [...prev];
      const item = copy[idx];
      const nextQty = Math.max(1, Number(item.qty || 1) + delta);
      copy[idx] = {
        ...item,
        qty: nextQty,
        total: nextQty * Number(item.unitPrice || 0)
      };
      return copy;
    });
  };

  const handleDirectQtyChange = (idx, val) => {
    const num = Math.max(1, parseInt(val, 10) || 1);
    setEditableItems(prev => {
      const copy = [...prev];
      const item = copy[idx];
      copy[idx] = {
        ...item,
        qty: num,
        total: num * Number(item.unitPrice || 0)
      };
      return copy;
    });
  };

  const handleRemoveItem = (idx) => {
    if (editableItems.length <= 1) {
      if (!window.confirm('Removing this will leave the bill empty. Proceed?')) return;
    }
    setEditableItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Save changes back to database, emit supplementary KOT for delta items, and prompt payment for additional balance
  const handleSaveChanges = async () => {
    if (editableItems.length === 0) {
      if (typeof showToast === 'function') showToast('Cannot save an order with 0 items.', 'warning');
      else if (window.showToast) window.showToast('Cannot save an order with 0 items.', 'warning');
      return;
    }

    setSaving(true);
    try {
      // 1. Calculate delta items for Supplementary KOT
      // Strict rule: Only items with increased quantity or brand new items generate KOT!
      const deltaItems = [];
      editableItems.forEach(it => {
        const k = getItemKey(it);
        const originalQty = Number(originalItemsSnapshot[k] || 0);
        const currentQty = Number(it.qty || 1);

        if (currentQty > originalQty) {
          const deltaQty = currentQty - originalQty;
          deltaItems.push({
            itemId: it.id || it.itemId,
            item_id: it.id || it.itemId,
            itemName: it.name,
            name: it.name,
            title: it.name,
            variantName: it.variantName || '',
            alternative_title: it.variantName || '',
            qty: deltaQty,
            quantity: deltaQty,
            unitPrice: it.unitPrice,
            price: it.unitPrice,
            rate: it.unitPrice,
            total: deltaQty * it.unitPrice,
            status: 'CHARGEABLE',
            notes: it.notes || 'Additional item from edited bill'
          });
        }
      });

      // 2. Prepare order update payload
      const payload = {
        id: order.id,
        order_id: order.id,
        orderNo: order.orderNo,
        billNo: order.billNo,
        table_id: order.table_id,
        tableNo: order.tableNo,
        customerName: customerName,
        cust_name: customerName,
        mobileNo: customerPhone,
        phone: customerPhone,
        subtotal: totals.subtotal,
        discount: totals.discountAmt,
        tax: totals.taxes,
        taxes: totals.taxes,
        amount: totals.grandTotal,
        total_amount: totals.grandTotal,
        payment_status: totals.balanceDue > 0.05 ? 'Unpaid' : 'Paid',
        order_state: totals.balanceDue > 0.05 ? 'running' : 'completed',
        items: editableItems.map(i => ({
          itemId: i.id || i.itemId,
          item_id: i.id || i.itemId,
          name: i.name,
          title: i.name,
          variantName: i.variantName,
          alternative_title: i.variantName,
          qty: i.qty,
          quantity: i.qty,
          unitPrice: i.unitPrice,
          price: i.unitPrice,
          total: i.total,
          status: 'CHARGEABLE'
        }))
      };

      // Call backend order update
      await orderService.updateOrder(order.id, payload);

      // 3. Supplementary KOT Generation (if delta items exist)
      let kotMessage = '';
      if (deltaItems.length > 0) {
        try {
          // Resolve reliable table_id
          let resolvedTableId = order.table_id || order.tableId;
          if (!resolvedTableId && Array.isArray(tables) && order.tableNo) {
            const matchedTbl = tables.find(t => String(t.no) === String(order.tableNo) || String(t.table_no) === String(order.tableNo) || String(t.table_name) === String(order.tableNo));
            if (matchedTbl) resolvedTableId = matchedTbl.id;
          }
          if (!resolvedTableId && order.tableNo) {
            resolvedTableId = Number(String(order.tableNo).replace(/[^0-9]/g, '')) || 1;
          }

          const targetStoreId = storeId || order.store_id || localStorage.getItem('activeOutletId') || 'STORE_1';

          const kotPayload = {
            table_id: resolvedTableId,
            tableId: resolvedTableId,
            tableNo: order.tableNo,
            store_id: targetStoreId,
            waiter: order.waiter || 'Staff',
            order_type: order.order_type || order.billType || 'DINE_IN',
            order_id: order.id,
            bill_no: order.billNo,
            remarks: 'Supplementary KOT (Edited Bill)',
            is_supplementary: 1,
            items: deltaItems
          };

          const kotRes = await kotService.createKOT(kotPayload);
          const createdKotId = kotRes?.kot?.kot_id || kotRes?.kotId || kotRes?.data?.kot_id || 'SUP-KOT';

          // Trigger print for supplementary KOT
          try {
            await printKitchenKOT({
              id: createdKotId,
              tableId: order.tableNo || resolvedTableId,
              waiter: order.waiter || 'Staff',
              order_type: order.order_type || order.billType || 'DINE_IN',
              items: deltaItems,
              remarks: 'SUPPLEMENTARY KOT - NEW/ADDED ITEMS ONLY'
            });
          } catch (pErr) {
            console.warn('Supplementary KOT print dispatch notice:', pErr);
          }

          kotMessage = ` | Supplementary KOT #${createdKotId} generated for ${deltaItems.length} added item(s)`;
        } catch (kotErr) {
          console.error('Failed to generate supplementary KOT:', kotErr);
        }
      }

      // Update current snapshot baseline to edited items
      const newSnapshot = {};
      editableItems.forEach(it => {
        const k = getItemKey(it);
        newSnapshot[k] = (newSnapshot[k] || 0) + Number(it.qty || 1);
      });
      setOriginalItemsSnapshot(newSnapshot);

      // 4. Additional Payment Evaluation
      // Check if there is an additional positive balance payable
      const additionalDue = Math.max(0, Math.round((totals.grandTotal - totalPaidAmount) * 100) / 100);

      if (additionalDue > 0) {
        // Show prompt to collect ONLY the additional delta payment
        setPendingAdditionalPay(additionalDue);
        setPayAmountInput(additionalDue);
        setSelectedPayMode(order.paymentMode || 'Cash');
        setShowPaymentModal(true);
        setIsEditing(false);

        const notice = `✅ Order updated${kotMessage}. Additional balance due: ₹${additionalDue.toFixed(2)}`;
        if (typeof showToast === 'function') showToast(notice, 'info');
        else if (window.showToast) window.showToast(notice, 'info');
      } else {
        setIsEditing(false);
        const notice = `✅ Order updated successfully${kotMessage}.${totals.refundOrCreditDue > 0 ? ` Note: ₹${totals.refundOrCreditDue.toFixed(2)} refund/credit due to guest.` : ''}`;
        if (typeof showToast === 'function') showToast(notice, 'success');
        else if (window.showToast) window.showToast(notice, 'success');
      }

      // Refresh order data
      fetchOrderDetails(order.id || order.order_id);
      if (typeof onOrderUpdated === 'function') {
        onOrderUpdated();
      }
    } catch (err) {
      console.error('Error saving order updates:', err);
      const errMsg = 'Failed to save changes: ' + (err.message || 'Server error');
      if (typeof showToast === 'function') showToast(errMsg, 'error');
      else if (window.showToast) window.showToast(errMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  // Process additional payment collection
  const handleConfirmAdditionalPayment = async () => {
    const payAmt = Number(payAmountInput || pendingAdditionalPay || 0);
    if (payAmt <= 0) {
      if (typeof showToast === 'function') showToast('Payment amount must be greater than 0.', 'warning');
      else if (window.showToast) window.showToast('Payment amount must be greater than 0.', 'warning');
      return;
    }

    setIsProcessingPayment(true);
    try {
      await orderService.settleOrder(order.id, {
        amount: payAmt,
        paymentMode: selectedPayMode,
        paymentMethod: selectedPayMode
      });

      const updatedPaid = Math.round((totalPaidAmount + payAmt) * 100) / 100;
      setTotalPaidAmount(updatedPaid);

      // Add new record to local payments list
      const newPaymentRow = {
        id: payments.length + 1,
        mode: selectedPayMode,
        amount: payAmt,
        status: 'COMPLETED',
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ref: `TXN-ADD-${Date.now().toString().slice(-4)}`
      };
      setPayments(prev => [...prev, newPaymentRow]);

      setShowPaymentModal(false);
      setPendingAdditionalPay(0);

      const msg = `Additional payment of ₹${payAmt.toFixed(2)} recorded via ${selectedPayMode}`;
      if (typeof showToast === 'function') showToast(msg, 'success');
      else if (window.showToast) window.showToast(msg, 'success');

      fetchOrderDetails(order.id || order.order_id);
      if (typeof onOrderUpdated === 'function') {
        onOrderUpdated();
      }
    } catch (payErr) {
      console.error('Failed to process additional payment:', payErr);
      const errMsg = 'Failed to record additional payment: ' + (payErr.message || 'Server error');
      if (typeof showToast === 'function') showToast(errMsg, 'error');
      else if (window.showToast) window.showToast(errMsg, 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Printing handlers
  const handlePrint = (isReprint = false) => {
    const printPayload = {
      ...order,
      subtotal: totals.subtotal,
      discount: totals.discountAmt,
      grand_total: totals.grandTotal,
      amount: totals.grandTotal,
      items: editableItems,
      isReprint: isReprint,
      reprint: isReprint
    };
    printTaxInvoice(printPayload);
  };

  if (!isOpen || !order) return null;

  // Real-time payment status: if any balance is due (> 0), bill is UNPAID; otherwise PAID
  const isPaid = livePaymentStatus !== null
    ? (livePaymentStatus === 'PAID')
    : (totals.balanceDue <= 0.05 ? true : (String(order.payment_status || 'Paid').toUpperCase() === 'PAID' && totals.balanceDue <= 0));
  const filteredCatalog = menuItems.filter(item => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (vegOnly && !item.isVeg) return false;
    if (searchQuery.trim()) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        fontFamily: "'Outfit', var(--font-family), system-ui, sans-serif"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (isEditing) {
            if (window.confirm('Discard unsaved edits?')) onClose();
          } else {
            onClose();
          }
        }
      }}
    >
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          maxHeight: '94vh',
          background: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out'
        }}
      >
        {/* ========================================================= */}
        {/* TOP HEADER                                                */}
        {/* ========================================================= */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#ffffff',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* Left: Icon, Bill #, Badges, Table & Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: '#ecfdf5',
                border: '1.5px solid #a7f3d0',
                color: '#0d9488',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px'
              }}
            >
              <FaReceipt />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>
                  {order.billNo || `Bill #${order.id}`}
                </span>
                <span
                  style={{
                    background: '#dcfce7',
                    color: '#15803d',
                    border: '1px solid #86efac',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 800,
                    letterSpacing: '0.5px'
                  }}
                >
                  FINALIZED
                </span>
              </div>

              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px', fontWeight: 500 }}>
                {order.billDate} {order.billTime} &nbsp;•&nbsp; Order #{order.orderNo || order.id} &nbsp;•&nbsp; Table: <strong style={{ color: '#0f172a' }}>{order.tableNo}</strong>
              </div>
            </div>
          </div>

          {/* Right: Actions (Edit Bill, Print Bill, Reprint, Close) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  disabled={saving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    background: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: saving ? 'wait' : 'pointer',
                    boxShadow: '0 2px 4px rgba(13, 148, 136, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:bg-teal-700"
                >
                  <FaSave size={13} />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  style={{
                    padding: '8px 14px',
                    background: '#f8fafc',
                    color: '#64748b',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                  className="hover:bg-slate-100"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {totals.balanceDue > 0.01 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPendingAdditionalPay(totals.balanceDue);
                      setPayAmountInput(totals.balanceDue);
                      setSelectedPayMode(order.paymentMode || 'Cash');
                      setShowPaymentModal(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 16px',
                      background: '#16a34a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(22, 163, 74, 0.3)',
                      transition: 'all 0.15s ease'
                    }}
                    className="hover:bg-green-700"
                  >
                    <FaMoneyBillWave size={13} />
                    <span>Pay Pending Amount ₹{totals.balanceDue.toFixed(2)}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    background: '#fffbeb',
                    color: '#b45309',
                    border: '1.5px solid #fde68a',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:bg-amber-100 hover:border-amber-400"
                >
                  <FaEdit size={12} />
                  <span>Edit Bill</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePrint(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 16px',
                    background: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(13, 148, 136, 0.2)',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:bg-teal-700"
                >
                  <FaPrint size={12} />
                  <span>Print Bill</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePrint(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    background: '#f8fafc',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:bg-slate-100"
                >
                  <FaSyncAlt size={11} />
                  <span>Reprint Bill</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                border: 'none',
                background: '#f1f5f9',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                marginLeft: '4px'
              }}
              className="hover:bg-slate-200 hover:text-slate-900"
            >
              <FaTimes size={14} />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TABS HEADER BAR                                           */}
        {/* ========================================================= */}
        <div
          style={{
            padding: '0 24px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '24px' }}>
            {[
              { id: 'invoice', label: `Invoice & Items (${editableItems.length})`, icon: FaReceipt },
              { id: 'kot', label: `KOT History (${kots.length})`, icon: FaConciergeBell },
              { id: 'payments', label: `Payments (${payments.length})`, icon: FaCreditCard },
            ].map(tab => {
              const active = activeTab === tab.id;
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '14px 2px',
                    border: 'none',
                    borderBottom: active ? '2.5px solid #0d9488' : '2.5px solid transparent',
                    background: 'none',
                    color: active ? '#0d9488' : '#64748b',
                    fontSize: '13.5px',
                    fontWeight: active ? 700 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className={active ? '' : 'hover:text-slate-900'}
                >
                  <IconComp size={13} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Summary Pill: Grand Total & Balance (Clickable to Pay if balance > 0) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '8px 0', fontSize: '13.5px' }}>
            <span style={{ color: '#475569', fontWeight: 600 }}>
              Grand Total: <strong style={{ color: '#0f172a', fontSize: '15px' }}>₹{totals.grandTotal.toFixed(2)}</strong>
            </span>
            <span style={{ color: '#94a3b8' }}>|</span>
            <span
              onClick={() => {
                if (totals.balanceDue > 0) {
                  setPendingAdditionalPay(totals.balanceDue);
                  setPayAmountInput(totals.balanceDue);
                  setSelectedPayMode(order.paymentMode || 'Cash');
                  setShowPaymentModal(true);
                }
              }}
              style={{
                color: '#475569',
                fontWeight: 600,
                cursor: totals.balanceDue > 0 ? 'pointer' : 'default',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title={totals.balanceDue > 0 ? 'Click to Pay Remaining Balance' : 'Bill Paid'}
            >
              Balance: <strong style={{ color: totals.balanceDue > 0 ? '#dc2626' : '#16a34a', fontSize: '15px', textDecoration: totals.balanceDue > 0 ? 'underline' : 'none' }}>₹{totals.balanceDue.toFixed(2)}</strong>
              {totals.balanceDue > 0 && (
                <span style={{ background: '#fee2e2', color: '#b91c1c', fontSize: '10.5px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', marginLeft: '2px' }}>
                  Pay Now
                </span>
              )}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* TAB BODY (SCROLLABLE)                                     */}
        {/* ========================================================= */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            background: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          {/* TAB 1: INVOICE & ITEMS */}
          {activeTab === 'invoice' && (
            <>
              {/* TOP CONTEXT SUMMARY: Collapsed in Edit mode for maximum screen space */}
              {isEditing ? (
                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px',
                    fontSize: '12.5px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span>Order: <strong style={{ color: '#0f172a' }}>#{order.orderNo || order.id}</strong></span>
                    <span>Table: <strong style={{ color: '#0d9488' }}>{order.tableNo}</strong></span>
                    <span>Type: <strong>{order.billType || 'DINE_IN'}</strong></span>
                    <span>Customer: <strong style={{ color: '#0f172a' }}>{customerName || 'Walk-in'}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Edit Cust:</span>
                    <input
                      type="text"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      placeholder="Name"
                      style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px', width: '130px' }}
                    />
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value)}
                      placeholder="Phone"
                      style={{ padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '11.5px', width: '100px' }}
                    />
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '14px'
                  }}
                >
                  {/* 1. ORDER CONTEXT */}
                  <div
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      background: '#f8fafc'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
                      Order Context
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '12.5px' }}>
                      <div>
                        <span style={{ color: '#64748b' }}>Order No:</span> <strong style={{ color: '#0f172a' }}>{order.orderNo || order.id}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Order Type:</span> <strong style={{ color: '#0d9488' }}>{order.billType || 'DINE_IN'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Table / Section:</span> <strong style={{ color: '#0f172a' }}>{order.tableNo}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Covers / Pax:</span> <strong style={{ color: '#0f172a' }}>{order.extra_details?.pax || '4'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Steward / Server:</span> <strong style={{ color: '#0f172a' }}>{order.waiter || '—'}</strong>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Date & Time:</span> <span style={{ color: '#0f172a', fontWeight: 600 }}>{order.billDate}</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. CUSTOMER DETAILS */}
                  <div
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      background: '#f8fafc'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
                      Customer Details
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
                        {customerName || 'Walk-in Customer'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {customerPhone && customerPhone !== '—' ? customerPhone : 'Walk-in counter sale'}
                      </div>
                    </div>
                  </div>

                  {/* 3. CORPORATE / GST DETAILS */}
                  <div
                    style={{
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      background: '#f8fafc'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
                      Corporate / GST Details
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#64748b', fontStyle: 'italic' }}>
                      {order.extra_details?.gstin ? (
                        <div>
                          <strong>GSTIN:</strong> {order.extra_details.gstin}
                        </div>
                      ) : (
                        'No corporate GST details specified.'
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* INSTANT ACTION FEEDBACK BANNER */}
              {lastAddedAlert && (
                <div
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    animation: 'fadeIn 0.15s ease-out'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaCheckCircle size={14} />
                    <span>{lastAddedAlert}</span>
                  </div>
                  <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.25)', padding: '2px 8px', borderRadius: '4px' }}>
                    Added into list below
                  </span>
                </div>
              )}

              {/* SECTION: FINALIZED BILL ITEMS TABLE (SHOWN FIRST SO IT IS IMMEDIATELY VISIBLE & FULLY SCROLLABLE) */}
              <div
                style={{
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight: isEditing ? '260px' : '380px',
                  height: 'auto',
                  flexShrink: 0,
                  background: '#ffffff',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    background: '#f8fafc',
                    padding: '10px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.6px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexShrink: 0
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Order Bill Items ({editableItems.length})</span>
                    {editableItems.some(it => {
                      const k = getItemKey(it);
                      return !originalItemsSnapshot[k] || (it.qty > (originalItemsSnapshot[k] || 0));
                    }) && (
                      <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '1px 7px', borderRadius: '4px', fontSize: '10.5px', fontWeight: 800 }}>
                        + Newly Added Items in Bill
                      </span>
                    )}
                  </span>
                  {isEditing && (
                    <span style={{ color: '#0d9488', fontSize: '11px', fontWeight: 700 }}>
                      ✎ Scroll table to view all items • Add or adjust below
                    </span>
                  )}
                </div>

                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    overflowX: 'auto',
                    minHeight: '120px'
                  }}
                  className="custom-scrollbar"
                >
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f8fafc', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '10px 14px' }}>Item</th>
                        <th style={{ padding: '10px 10px', textAlign: 'center' }}>Type</th>
                        <th style={{ padding: '10px 10px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Rate</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Discount</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right' }}>Taxable</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right' }}>Amount</th>
                        {isEditing && <th style={{ padding: '10px 8px', textAlign: 'center' }}>Action</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {editableItems.length === 0 ? (
                        <tr>
                          <td colSpan={isEditing ? 8 : 7} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                            No items present in this bill.
                          </td>
                        </tr>
                      ) : (
                        editableItems.map((item, idx) => {
                          const rate = Number(item.unitPrice || item.price || 0);
                          const qty = Number(item.qty || 1);
                          const discount = Number(item.discount || 0);
                          const taxable = Math.max(0, (rate * qty) - discount);
                          const amount = taxable;

                          const k = getItemKey(item);
                          const origQty = Number(originalItemsSnapshot[k] || 0);
                          const isNewlyAdded = origQty === 0;
                          const isQtyIncreased = origQty > 0 && qty > origQty;

                          return (
                            <tr
                              key={idx}
                              style={{
                                borderBottom: '1px solid #f1f5f9',
                                background: isNewlyAdded ? '#f0fdf4' : isQtyIncreased ? '#fefce8' : 'transparent',
                                transition: 'background-color 0.15s ease'
                              }}
                            >
                              {/* Item Name */}
                              <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0f172a' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span>{item.name}</span>
                                  {isNewlyAdded && (
                                    <span style={{ background: '#10b981', color: '#ffffff', fontSize: '9.5px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px' }}>
                                      NEW
                                    </span>
                                  )}
                                  {isQtyIncreased && (
                                    <span style={{ background: '#f59e0b', color: '#ffffff', fontSize: '9.5px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px' }}>
                                      +{qty - origQty} Added
                                    </span>
                                  )}
                                </div>
                                {item.variantName && (
                                  <div style={{ fontSize: '11px', color: '#0d9488', fontWeight: 600 }}>
                                    {item.variantName}
                                  </div>
                                )}
                              </td>

                              {/* Veg / Non-veg dot */}
                              <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                                <span style={{ color: item.isVeg ? '#16a34a' : '#dc2626', fontSize: '14px' }}>
                                  ●
                                </span>
                              </td>

                              {/* Quantity */}
                              <td style={{ padding: '10px 10px', textAlign: 'center' }}>
                                {isEditing ? (
                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateQty(idx, -1)}
                                      style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '4px',
                                        border: '1px solid #cbd5e1',
                                        background: '#f8fafc',
                                        cursor: 'pointer',
                                        fontWeight: 800
                                      }}
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      value={item.qty}
                                      onChange={e => handleDirectQtyChange(idx, e.target.value)}
                                      style={{
                                        width: '36px',
                                        textAlign: 'center',
                                        padding: '2px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '4px',
                                        fontWeight: 800
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateQty(idx, 1)}
                                      style={{
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '4px',
                                        border: '1px solid #cbd5e1',
                                        background: '#f8fafc',
                                        cursor: 'pointer',
                                        fontWeight: 800
                                      }}
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <span style={{ fontWeight: 800, color: '#0f172a' }}>{item.qty}</span>
                                )}
                              </td>

                              {/* Rate */}
                              <td style={{ padding: '10px 12px', textAlign: 'right', color: '#475569' }}>
                                ₹{rate.toFixed(2)}
                              </td>

                              {/* Discount */}
                              <td style={{ padding: '10px 12px', textAlign: 'right', color: discount > 0 ? '#16a34a' : '#94a3b8' }}>
                                {discount > 0 ? `₹${discount.toFixed(2)}` : '—'}
                              </td>

                              {/* Taxable */}
                              <td style={{ padding: '10px 12px', textAlign: 'right', color: '#475569' }}>
                                ₹{taxable.toFixed(2)}
                              </td>

                              {/* Amount */}
                              <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                                ₹{amount.toFixed(2)}
                              </td>

                              {/* Action Delete */}
                              {isEditing && (
                                <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(idx)}
                                    style={{
                                      border: 'none',
                                      background: 'none',
                                      color: '#ef4444',
                                      cursor: 'pointer',
                                      padding: '4px',
                                      borderRadius: '4px'
                                    }}
                                    className="hover:bg-red-50"
                                    title="Remove item"
                                  >
                                    <FaTrashAlt size={12} />
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* INLINE POS ITEM PICKER (ONLY IN EDIT MODE - SHOWN DIRECTLY BELOW CURRENT ITEMS) */}
              {isEditing && (
                <div
                  style={{
                    border: '1.5px solid #0d9488',
                    borderRadius: '12px',
                    padding: '14px',
                    background: '#f0fdfa'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f766e', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaPlus size={11} /> Click any item below to add to this order:
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '11px', color: '#0f766e', background: '#ccfbf1', padding: '3px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        {editableItems.length} items in cart (see table above)
                      </span>
                      <input
                        type="text"
                        placeholder="Search menu items..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '12px',
                          background: '#fff',
                          minWidth: '180px'
                        }}
                      />
                      <label style={{ fontSize: '12px', fontWeight: 600, color: '#0f766e', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={vegOnly}
                          onChange={e => setVegOnly(e.target.checked)}
                        />
                        🟢 Veg
                      </label>
                    </div>
                  </div>

                  {/* Categories */}
                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '8px' }}>
                    {categories.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setSelectedCategory(c)}
                        style={{
                          padding: '4px 12px',
                          borderRadius: '14px',
                          border: selectedCategory === c ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                          background: selectedCategory === c ? '#0d9488' : '#ffffff',
                          color: selectedCategory === c ? '#ffffff' : '#475569',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>

                  {/* Overall Menu Items Grid (Scrollable, Showing All Items with Variant Badges & Cart Quantities) */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
                      gap: '8px',
                      maxHeight: '220px',
                      overflowY: 'auto',
                      paddingRight: '4px'
                    }}
                  >
                    {filteredCatalog.length === 0 ? (
                      <div style={{ gridColumn: '1 / -1', padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '12.5px' }}>
                        {loadingMenu ? 'Loading menu items...' : 'No menu items found matching search filter.'}
                      </div>
                    ) : (
                      filteredCatalog.map(m => {
                        const mId = String(m.itemId || m.id);
                        const hasVariants = Array.isArray(m.variants) && m.variants.length > 0;
                        const qtyInBill = editableItems
                          .filter(it => String(it.itemId || it.id) === mId)
                          .reduce((sum, it) => sum + Number(it.qty || 0), 0);

                        return (
                          <div
                            key={m.id}
                            onClick={() => handleAddItemToOrder(m)}
                            style={{
                              background: '#ffffff',
                              border: qtyInBill > 0 ? '1.5px solid #0d9488' : '1px solid #cbd5e1',
                              borderRadius: '8px',
                              padding: '8px 10px',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              transition: 'all 0.12s ease',
                              position: 'relative'
                            }}
                            className="hover:border-teal-500 hover:shadow-sm"
                            title={hasVariants ? `Click to choose from ${m.variants.length} variants` : `Add ${m.name} to bill`}
                          >
                            <div style={{ minWidth: 0, paddingRight: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span style={{ color: m.isVeg ? '#16a34a' : '#dc2626', fontSize: '10px' }}>●</span>
                                <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {m.name}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span style={{ fontSize: '11px', color: '#0d9488', fontWeight: 800 }}>
                                  ₹{m.price.toFixed(2)}
                                </span>
                                {hasVariants && (
                                  <span style={{ fontSize: '9px', background: '#e0f2fe', color: '#0284c7', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                                    {m.variants.length} Var
                                  </span>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {qtyInBill > 0 && (
                                <span style={{ background: '#0d9488', color: '#ffffff', fontSize: '10px', fontWeight: 800, padding: '1px 6px', borderRadius: '10px' }}>
                                  {qtyInBill}
                                </span>
                              )}
                              <div style={{ color: '#0d9488', fontSize: '14px', fontWeight: 800 }}>+</div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* BOTTOM 2 CARDS: Remarks & Calculations */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                  gap: '16px'
                }}
              >
                {/* 1. BILL REMARKS & NOTES */}
                <div
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    background: '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
                    Bill Remarks & Notes
                  </div>
                  {isEditing ? (
                    <textarea
                      value={billNotes}
                      onChange={e => setBillNotes(e.target.value)}
                      placeholder="Add notes for this order/invoice..."
                      rows={3}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '12px'
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: '12.5px', color: '#64748b', fontStyle: 'italic', flex: 1 }}>
                      {billNotes || 'No special notes recorded on this invoice.'}
                    </div>
                  )}
                </div>

                {/* 2. BILLING SUMMARY */}
                <div
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    background: '#ffffff'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Subtotal:</span>
                      <strong style={{ color: '#0f172a' }}>₹{totals.subtotal.toFixed(2)}</strong>
                    </div>

                    {/* Discount row in edit mode */}
                    {isEditing ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b' }}>Discount:</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <select
                            value={billDiscountType}
                            onChange={e => setBillDiscountType(e.target.value)}
                            style={{ padding: '2px 4px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                          >
                            <option value="flat">₹ Flat</option>
                            <option value="percent">% Pct</option>
                          </select>
                          <input
                            type="number"
                            value={billDiscountVal}
                            onChange={e => setBillDiscountVal(Number(e.target.value) || 0)}
                            style={{ width: '60px', padding: '2px 4px', fontSize: '12px', borderRadius: '4px', border: '1px solid #cbd5e1', textAlign: 'right' }}
                          />
                        </div>
                      </div>
                    ) : totals.discountAmt > 0 ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                        <span>Discount:</span>
                        <strong>- ₹{totals.discountAmt.toFixed(2)}</strong>
                      </div>
                    ) : null}

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>Taxable Amount:</span>
                      <strong style={{ color: '#0f172a' }}>₹{totals.taxable.toFixed(2)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>CGST (2.5%):</span>
                      <strong style={{ color: '#0f172a' }}>₹{totals.cgst.toFixed(2)}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                      <span>SGST (2.5%):</span>
                      <strong style={{ color: '#0f172a' }}>₹{totals.sgst.toFixed(2)}</strong>
                    </div>

                    {totals.roundOff !== 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                        <span>Round Off:</span>
                        <strong style={{ color: '#0f172a' }}>{totals.roundOff > 0 ? `+₹${totals.roundOff.toFixed(2)}` : `-₹${Math.abs(totals.roundOff).toFixed(2)}`}</strong>
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '8px',
                        borderTop: '1.5px solid #0d9488',
                        marginTop: '4px'
                      }}
                    >
                      <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>Grand Total:</span>
                      <span style={{ fontSize: '18px', fontWeight: 900, color: '#0d9488' }}>₹{totals.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: KOT HISTORY */}
          {activeTab === 'kot' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                Kitchen Order Tickets for Table {order.tableNo}
              </div>

              {kots.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '12px' }}>
                  No active or past KOTs found for this table.
                </div>
              ) : (
                kots.map((k, idx) => {
                  const kotNumberDisplay = k.id || k.custom_bill_number || k.kotNo || (k.kotId ? `KOT-${k.kotId}` : (k.kot_id ? `KOT-${k.kot_id}` : `KOT #${idx + 1}`));
                  const kotStatusStr = typeof k.status === 'string' ? k.status : (k.status === 6 ? 'Closed' : (k.status === 5 ? 'Cancelled' : 'Served'));
                  const kotTimeDisplay = k.time || k.in_time || k.createdAt || 'Sent';

                  return (
                    <div key={idx} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                            {kotNumberDisplay}
                          </span>
                          <span style={{ color: '#64748b', fontSize: '12px' }}>
                            • {kotTimeDisplay} {k.date ? `• ${k.date}` : ''}
                          </span>
                        </div>
                        <span
                          style={{
                            background: kotStatusStr === 'Cancelled' ? '#fef2f2' : kotStatusStr === 'Closed' ? '#f1f5f9' : '#ecfdf5',
                            color: kotStatusStr === 'Cancelled' ? '#dc2626' : kotStatusStr === 'Closed' ? '#64748b' : '#047857',
                            border: `1px solid ${kotStatusStr === 'Cancelled' ? '#fecaca' : kotStatusStr === 'Closed' ? '#e2e8f0' : '#a7f3d0'}`,
                            padding: '3px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 800,
                            letterSpacing: '0.4px',
                            textTransform: 'uppercase'
                          }}
                        >
                          {kotStatusStr}
                        </span>
                      </div>

                      {/* Item list for this KOT */}
                      {Array.isArray(k.items) && k.items.length > 0 ? (
                        <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {k.items.map((item, itemIdx) => (
                            <div key={itemIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#334155' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <strong style={{ color: '#0d9488' }}>{item.qty || item.quantity || 1}x</strong>
                                <span style={{ fontWeight: 600 }}>{item.itemName || item.name || 'Item'}</span>
                                {item.variantName && (
                                  <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>
                                    {item.variantName}
                                  </span>
                                )}
                              </div>
                              <span style={{ fontWeight: 700, color: '#0f172a' }}>
                                ₹{Number(item.total || ((item.qty || item.quantity || 1) * (item.unitPrice || item.price || item.item_price || 0))).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: '12.5px', color: '#475569' }}>
                          Items routed to kitchen for preparation.
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 3: PAYMENTS */}
          {activeTab === 'payments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                Settlement & Payment Records
              </div>

              {/* Summary Cards in Payments Tab */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '4px' }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Billed Grand Total</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', marginTop: '4px' }}>₹{totals.grandTotal.toFixed(2)}</div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Total Settled So Far</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#047857', marginTop: '4px' }}>₹{totals.paidAmount.toFixed(2)}</div>
                </div>

                <div style={{ background: totals.balanceDue > 0 ? '#fef2f2' : totals.refundOrCreditDue > 0 ? '#f0fdf4' : '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    {totals.balanceDue > 0 ? 'Additional Payable' : totals.refundOrCreditDue > 0 ? 'Refund / Credit Due' : 'Balance Status'}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: totals.balanceDue > 0 ? '#dc2626' : totals.refundOrCreditDue > 0 ? '#2563eb' : '#047857', marginTop: '4px' }}>
                    {totals.balanceDue > 0 ? `₹${totals.balanceDue.toFixed(2)}` : totals.refundOrCreditDue > 0 ? `₹${totals.refundOrCreditDue.toFixed(2)}` : 'Fully Paid'}
                  </div>
                </div>
              </div>

              {payments.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', border: '1px dashed #cbd5e1', borderRadius: '10px' }}>
                  No payment transactions recorded yet.
                </div>
              ) : (
                payments.map((p, idx) => (
                  <div key={p.id || idx} style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                        {p.mode} Settlement
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        Ref: {p.ref || `TXN-${p.id || idx + 1}`} &nbsp;•&nbsp; {p.date || 'Today'} {p.time || ''}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: 900, color: '#0d9488' }}>
                        ₹{Number(p.amount || 0).toFixed(2)}
                      </div>
                      <span style={{ background: '#ecfdf5', color: '#047857', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 800 }}>
                        {p.status || 'COMPLETED'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* MODAL FOOTER                                              */}
        {/* ========================================================= */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          {/* Left Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => {
                onClose();
                // Pass rows accurately: if user added/edited items, pass editableItems; otherwise pass original order items
                const itemsToPass = (editableItems && editableItems.length > 0)
                  ? editableItems
                  : (order.items || []);

                navigate('/restaurant/pos-billing', {
                  state: {
                    tableId: order.table_id,
                    tableNumber: order.tableNo,
                    table: { id: order.table_id, no: order.tableNo, table_name: order.tableNo },
                    serviceType: order.billType || 'Dine In',
                    customerName: order.customerName || order.cust_name,
                    rows: itemsToPass.map(it => ({
                      itemId: it.itemId || it.id || it.item_id,
                      name: it.name || it.itemName || it.title,
                      itemName: it.name || it.itemName || it.title,
                      variantName: it.variantName || '',
                      qty: Number(it.qty || it.quantity || 1),
                      unitPrice: Number(it.unitPrice || it.price || it.rate || 0),
                      price: Number(it.unitPrice || it.price || it.rate || 0),
                      total: Number(it.total || ((it.qty || 1) * (it.unitPrice || 0)))
                    }))
                  }
                });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f766e',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              className="hover:bg-teal-50"
            >
              <FaUtensils size={12} />
              <span>Open in POS Screen</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/restaurant/billing-desk', {
                  state: {
                    orderId: order.id || order.orderNo,
                    billNo: order.billNo,
                    tableNo: order.tableNo
                  }
                });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#0f766e',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              className="hover:bg-teal-50"
            >
              <FaReceipt size={12} />
              <span>Open in Billing Screen</span>
            </button>
          </div>

          {/* Right Action */}
          <div>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '7px 20px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#ffffff',
                color: '#475569',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
              className="hover:bg-slate-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VARIANT SELECTOR POPUP MODAL (WHEN ITEM WITH VARIANTS CLICKED) */}
      {/* ========================================================= */}
      {variantModalItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100001,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setVariantModalItem(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              width: '100%',
              maxWidth: '420px',
              padding: '22px',
              border: '1px solid #e2e8f0',
              animation: 'fadeIn 0.15s ease-out'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  Select Variant / Portion
                </h4>
                <p style={{ margin: '3px 0 0', fontSize: '13px', color: '#0d9488', fontWeight: 700 }}>
                  {variantModalItem.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVariantModalItem(null)}
                style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '16px' }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
              {/* Option to add base item if available */}
              <button
                type="button"
                onClick={() => handleAddItemToOrder(variantModalItem, { name: 'Standard', price: variantModalItem.price })}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
                className="hover:border-teal-500 hover:bg-teal-50"
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13.5px', color: '#0f172a' }}>Standard / Regular</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Base item price</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#0d9488' }}>
                  ₹{Number(variantModalItem.price || 0).toFixed(2)}
                </div>
              </button>

              {/* Specific variants */}
              {variantModalItem.variants.map((v, idx) => (
                <button
                  key={v.id || idx}
                  type="button"
                  onClick={() => handleAddItemToOrder(variantModalItem, v)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: '1.5px solid #0d9488',
                    background: '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  className="hover:bg-teal-50 hover:shadow-sm"
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '13.5px', color: '#0f172a' }}>{v.name}</div>
                    <div style={{ fontSize: '11px', color: '#0f766e' }}>Variant portion</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#0d9488' }}>
                    ₹{Number(v.price || 0).toFixed(2)}
                  </div>
                </button>
              ))}
            </div>

            <div style={{ marginTop: '16px', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setVariantModalItem(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#64748b',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ========================================================= */}
      {/* QUICK PAYMENT MODAL (OFFICIAL COMPONENT)                   */}
      {/* ========================================================= */}
      {showPaymentModal && (
        <QuickPaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            // If skipped, mark status as UNPAID because balance due is still unpaid
            if (totals.balanceDue > 0) {
              setLivePaymentStatus('UNPAID');
            }
          }}
          table={{
            id: order.table_id || order.tableId,
            table_id: order.table_id || order.tableId,
            table_no: order.tableNo || order.table_no,
            table_name: order.tableNo || order.table_no,
            no: order.tableNo || order.table_no,
            current_order_id: order.id || order.order_id,
            order_id: order.id || order.order_id,
            total_amount: pendingAdditionalPay,
            amount: pendingAdditionalPay
          }}
          items={editableItems}
          providedNetBill={pendingAdditionalPay}
          previousPaidAmount={totalPaidAmount}
          updatedGrandTotal={totals.grandTotal}
          additionalItemsAmount={Math.max(0, Math.round((totals.grandTotal - (Number(order.grand_total || order.total_amount || totals.grandTotal))) * 100) / 100)}
          onTableUpdated={() => {
            setShowPaymentModal(false);
            setLivePaymentStatus('PAID');
            fetchOrderDetails(order.id || order.order_id);
            if (typeof onOrderUpdated === 'function') {
              onOrderUpdated();
            }
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}
