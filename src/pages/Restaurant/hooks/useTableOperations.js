import { useState, useMemo, useEffect } from 'react';
import { MOCK_MENU_ITEMS } from '../constants/mockData';
import { useRestaurant } from '../../../context/RestaurantContext';

export const useTableOperations = (location, navigate) => {
  const { tables, setTables, refreshTables, orderItemsMap, setOrderItemsMap, loading } = useRestaurant();

  // Modal open states
  const [showQuickSwitch, setShowQuickSwitch] = useState(false);
  const [modalTab, setModalTab] = useState('Move'); // Move, MoveKOT, MoveItems, Split, status, settle
  const [transferOp, setTransferOp] = useState('Move'); // Move, Merge
  const [fromTableId, setFromTableId] = useState('');
  const [toTableId, setToTableId] = useState('');

  // Selected items transfer states
  const [selectedTransferItems, setSelectedTransferItems] = useState({}); // { item_name: qty }
  const [selectedTransferKots, setSelectedTransferKots] = useState({}); // { kot_id: boolean }
  const [splitGuestsSource, setSplitGuestsSource] = useState(3);
  const [splitGuestsTarget, setSplitGuestsTarget] = useState(3);

  // Dynamic menu inputs
  const [newItemName, setNewItemName] = useState(MOCK_MENU_ITEMS[0].name);
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemRemarks, setNewItemRemarks] = useState('');

  // Settle inputs
  const [discountPercent, setDiscountPercent] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [splitCash, setSplitCash] = useState('');
  const [splitCard, setSplitCard] = useState('');
  const [splitUPI, setSplitUPI] = useState('');
  const [equalSplitCount, setEqualSplitCount] = useState(2);
  const [splitPercentSource, setSplitPercentSource] = useState(50);
  const [showSettleSuccess, setShowSettleSuccess] = useState(false);

  // Target table select state
  const [selectedTableForOps, setSelectedTableForOps] = useState(null);

  // Staff and guests details
  const [selectedGuests, setSelectedGuests] = useState(4);
  const [selectedWaiter, setSelectedWaiter] = useState('');
  const [selectedCaptain, setSelectedCaptain] = useState('');

  // Sync returned route state values
  // Sync returned route state values with instant color conversion
  useEffect(() => {
    if (location.state?.settledTableId) {
      const settledId = location.state.settledTableId;
      const normalizeNum = (val) => String(val || '').replace(/[^0-9]/g, '').padStart(2, '0');
      const targetSettledNum = normalizeNum(settledId);

      setTables(prev => prev.map(t => {
        const curNum = normalizeNum(t.no || t.table_no || t.id);
        if (t.id === settledId || String(t.id) === String(settledId) || (targetSettledNum !== '00' && curNum === targetSettledNum)) {
          return { ...t, status: 'PAYMENT_COMPLETED', color: 'green', paidAt: Date.now(), payment_completed_at: Date.now(), remaining_seconds: 60, cleanup_after_seconds: 60, updatedAt: Date.now() };
        }
        return t;
      }));
      window.history.replaceState({}, document.title);
    } else if (location.state?.updatedTable) {
      const ut = location.state.updatedTable;
      const ur = location.state.updatedRows || [];

      const normalizeNum = (val) => String(val || '').replace(/[^0-9]/g, '').padStart(2, '0');
      const targetNum = normalizeNum(ut.no || ut.tableNo || ut.id || ut.table_id);

      setTables(prev => prev.map(t => {
        const curNum = normalizeNum(t.no || t.table_no || t.id);
        const matchId = (ut.id && String(t.id) === String(ut.id)) || (ut.table_id && String(t.table_id) === String(ut.table_id));

        if (matchId || (targetNum !== '00' && curNum === targetNum)) {
          const hasItems = ur.length > 0 || (ut.amount && ut.amount > 0);
          const nextStatus = hasItems ? (ut.status !== 'Blank' ? ut.status : 'Running') : (ut.status || 'Blank');
          const statusUp = String(nextStatus).toUpperCase();
          const nextColor = ['RUNNING', 'KOT_CUT', 'ORDERED', 'KOT GENERATED', 'OCCUPIED'].includes(statusUp) || (hasItems && statusUp !== 'PAID' && statusUp !== 'PAYMENT_COMPLETED' && statusUp !== 'CLEANING') ? 'orange' : ['PAID', 'PAYMENT_COMPLETED', 'CLEANING', 'CLEANUP_RUNNING', 'BILL GENERATED'].includes(statusUp) ? 'green' : 'white';
          return {
            ...t,
            ...ut,
            status: nextStatus,
            color: nextColor,
            updatedAt: Date.now(),
            openedAt: t.openedAt || Date.now()
          };
        }
        return t;
      }));

      if (ut.id || ut.no) {
        const tableKey = ut.id || ut.no;
        setOrderItemsMap(prev => ({
          ...prev,
          [tableKey]: ur
        }));
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const toast = (msg) => {
    console.log('Toast:', msg);
    const alertBox = document.createElement('div');
    alertBox.innerText = msg;
    alertBox.style.position = 'fixed';
    alertBox.style.bottom = '20px';
    alertBox.style.right = '20px';
    alertBox.style.backgroundColor = '#0e7490';
    alertBox.style.color = '#fff';
    alertBox.style.padding = '12px 24px';
    alertBox.style.borderRadius = '8px';
    alertBox.style.zIndex = '9999';
    alertBox.style.fontSize = '0.85rem';
    alertBox.style.fontWeight = '700';
    document.body.appendChild(alertBox);
    setTimeout(() => alertBox.remove(), 2500);
  };

  // Get active items list of the selected source table
  const activeSourceItems = useMemo(() => {
    if (!fromTableId) return [];
    return orderItemsMap[parseInt(fromTableId)] || [];
  }, [fromTableId, orderItemsMap]);

  // Operations
  const updateTableField = (tableId, field, value) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) return { ...t, [field]: value };
      return t;
    }));
  };

  const updateTableAmount = (tableId, newAmount) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        const nextStatus = newAmount > 0 ? (t.status === 'Blank' ? 'Running' : t.status) : 'Blank';
        return {
          ...t,
          amount: newAmount,
          status: nextStatus,
          openedAt: nextStatus === 'Blank' ? null : (t.openedAt || Date.now())
        };
      }
      return t;
    }));
  };

  const updateTableStatus = (tableId, nextStatus) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        return {
          ...t,
          status: nextStatus,
          openedAt: nextStatus === 'Blank' ? null : (t.openedAt || Date.now())
        };
      }
      return t;
    }));
    toast(`Table status updated to: ${nextStatus}`);
  };

  const toggleHoldOrder = (tableId) => {
    setTables(prev => prev.map(t => {
      if (t.id === tableId) {
        const nextHold = !t.isHold;
        toast(nextHold ? "Order placed on HOLD." : "Order RESUMED.");
        return { ...t, isHold: nextHold };
      }
      return t;
    }));
  };

  const cancelCompleteOrder = (tableId) => {
    if (window.confirm("Cancel complete order? This will wipe items and KOTs.")) {
      setTables(prev => prev.map(t => {
        if (t.id === tableId) {
          return { ...t, status: 'Blank', amount: 0, waiter: null, captain: null, openedAt: null, isHold: false, kots: [], kotCount: 0 };
        }
        return t;
      }));
      setOrderItemsMap(prev => ({
        ...prev,
        [tableId]: []
      }));
      toast("Complete order cancelled successfully.");
      setShowQuickSwitch(false);
    }
  };

  // Move KOT helper
  const executeMoveKOT = (kotId, targetTableId) => {
    const srcId = parseInt(fromTableId);
    const sourceTable = tables.find(t => t.id === srcId);
    if (!sourceTable) return;

    const kotToMove = (sourceTable.kots || []).find(k => k.id === kotId);
    if (!kotToMove) return;

    // Add items to target
    const targetItems = [...(orderItemsMap[targetTableId] || [])];
    kotToMove.items.forEach(kotIt => {
      const idx = targetItems.findIndex(t =>
        (t.itemId === kotIt.itemId || t.itemName === kotIt.itemName || t.name === kotIt.name) &&
        (t.variantId === kotIt.variantId || t.variantName === kotIt.variantName || t.variant === kotIt.variant)
      );
      if (idx !== -1) {
        const nextQty = targetItems[idx].qty + kotIt.qty;
        targetItems[idx] = {
          ...targetItems[idx],
          qty: nextQty,
          total: nextQty * targetItems[idx].unitPrice
        };
      } else {
        const lineId = crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).substr(2, 5));
        targetItems.push({
          ...kotIt,
          lineId: kotIt.lineId || lineId,
          name: kotIt.name || kotIt.itemName,
          price: kotIt.price || kotIt.unitPrice,
          rate: kotIt.rate || kotIt.unitPrice,
          total: kotIt.qty * (kotIt.unitPrice || kotIt.price || 0)
        });
      }
    });

    // Remove from source order
    let sourceItems = [...(orderItemsMap[srcId] || [])];
    kotToMove.items.forEach(kotIt => {
      sourceItems = sourceItems.map(srcIt => {
        if (
          (srcIt.itemId === kotIt.itemId || srcIt.itemName === kotIt.itemName || srcIt.name === kotIt.name) &&
          (srcIt.variantId === kotIt.variantId || srcIt.variantName === kotIt.variantName || srcIt.variant === kotIt.variant)
        ) {
          const nextQty = srcIt.qty - kotIt.qty;
          return { ...srcIt, qty: nextQty, total: nextQty * (srcIt.unitPrice || srcIt.price || 0) };
        }
        return srcIt;
      }).filter(srcIt => srcIt.qty > 0);
    });

    setOrderItemsMap(prev => ({
      ...prev,
      [srcId]: sourceItems,
      [targetTableId]: targetItems
    }));

    const sourceSum = sourceItems.reduce((sum, r) => sum + r.total, 0);
    const targetSum = targetItems.reduce((sum, r) => sum + r.total, 0);

    setTables(prev => prev.map(t => {
      if (t.id === srcId) {
        const nextKots = (t.kots || []).filter(k => k.id !== kotId);
        return {
          ...t,
          kots: nextKots,
          kotCount: nextKots.length,
          amount: sourceSum,
          status: sourceSum > 0 ? t.status : 'Blank',
          openedAt: sourceSum > 0 ? t.openedAt : null
        };
      }
      if (t.id === targetTableId) {
        const nextKots = [...(t.kots || []), kotToMove];
        return {
          ...t,
          kots: nextKots,
          kotCount: nextKots.length,
          amount: targetSum,
          status: 'Running',
          openedAt: t.openedAt || Date.now()
        };
      }
      return t;
    }));

    toast(`Moved ${kotId} to target table.`);
  };

  // Move selected items helper
  const executeMoveSelectedItems = (srcId, dstId) => {
    const sourceItems = orderItemsMap[srcId] || [];
    const updatedSource = [];
    const itemsToTransfer = [];

    sourceItems.forEach(item => {
      const key = item.lineId || item.name || item.itemName;
      const moveQty = selectedTransferItems[key] || 0;
      if (moveQty > 0) {
        const remaining = item.qty - moveQty;
        itemsToTransfer.push({ ...item, qty: moveQty, total: moveQty * (item.unitPrice || item.price || 0) });
        if (remaining > 0) {
          updatedSource.push({ ...item, qty: remaining, total: remaining * (item.unitPrice || item.price || 0) });
        }
      } else {
        updatedSource.push(item);
      }
    });

    const targetItems = [...(orderItemsMap[dstId] || [])];
    itemsToTransfer.forEach(transferItem => {
      const idx = targetItems.findIndex(t =>
        (t.itemId === transferItem.itemId || t.itemName === transferItem.itemName || t.name === transferItem.name) &&
        (t.variantId === transferItem.variantId || t.variantName === transferItem.variantName || t.variant === transferItem.variant)
      );
      if (idx !== -1) {
        const nextQty = targetItems[idx].qty + transferItem.qty;
        targetItems[idx] = {
          ...targetItems[idx],
          qty: nextQty,
          total: nextQty * targetItems[idx].unitPrice
        };
      } else {
        targetItems.push(transferItem);
      }
    });

    const sourceSum = updatedSource.reduce((sum, r) => sum + r.total, 0);
    const targetSum = targetItems.reduce((sum, r) => sum + r.total, 0);

    setOrderItemsMap(prev => ({
      ...prev,
      [srcId]: updatedSource,
      [dstId]: targetItems
    }));

    updateTableAmount(srcId, sourceSum);
    updateTableAmount(dstId, targetSum);

    toast(`Transferred items to target table.`);
    setSelectedTransferItems({});
  };

  // Add Item to active order
  const handleAddItemToOps = (variantId = '') => {
    if (!fromTableId) return;
    const srcId = parseInt(fromTableId);
    const menuObj = MOCK_MENU_ITEMS.find(m => m.name === newItemName);
    if (!menuObj) return;

    let price = menuObj.price || menuObj.rate || 0;
    let variantName = '';
    if (menuObj.variants && menuObj.variants.length > 0) {
      const selectedVar = menuObj.variants.find(v => v.id === variantId) || menuObj.variants[0];
      price = selectedVar.price;
      variantName = selectedVar.name;
      variantId = selectedVar.id;
    }

    const lineId = crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).substr(2, 5));
    const newRow = {
      lineId,
      itemId: menuObj.id,
      itemName: menuObj.name,
      name: menuObj.name, // compatibility
      variantId,
      variantName,
      variant: variantName, // compatibility
      qty: newItemQty,
      unitPrice: price,
      price: price, // compatibility
      rate: price, // compatibility
      total: newItemQty * price,
      remarks: newItemRemarks || ''
    };

    setOrderItemsMap(prev => {
      const list = [...(prev[srcId] || [])];
      const idx = list.findIndex(l =>
        (l.itemId === menuObj.id || l.itemName === menuObj.name || l.name === menuObj.name) &&
        l.variantId === variantId
      );
      if (idx !== -1) {
        const nextQty = list[idx].qty + newItemQty;
        list[idx] = {
          ...list[idx],
          qty: nextQty,
          total: nextQty * (list[idx].unitPrice || list[idx].price || 0)
        };
        if (newItemRemarks) list[idx].remarks = newItemRemarks;
      } else {
        list.push(newRow);
      }

      const sum = list.reduce((s, r) => s + r.total, 0);
      updateTableAmount(srcId, sum);
      return { ...prev, [srcId]: list };
    });

    toast(`Added ${newItemQty}x ${newItemName}${variantName ? ` (${variantName})` : ''} to Table order.`);
    setNewItemRemarks('');
    setNewItemQty(1);
  };

  const handleUpdateItemQty = (lineIdOrName, change) => {
    if (!fromTableId) return;
    const srcId = parseInt(fromTableId);
    setOrderItemsMap(prev => {
      const list = prev[srcId].map(item => {
        if (item.lineId === lineIdOrName || item.name === lineIdOrName || item.itemName === lineIdOrName) {
          const nextQty = Math.max(1, item.qty + change);
          return { ...item, qty: nextQty, total: nextQty * (item.unitPrice || item.price || item.rate || 0) };
        }
        return item;
      });
      const sum = list.reduce((s, r) => s + r.total, 0);
      updateTableAmount(srcId, sum);
      return { ...prev, [srcId]: list };
    });
  };

  const handleToggleItemComplimentary = (lineIdOrName) => {
    if (!fromTableId) return;
    const srcId = parseInt(fromTableId);
    setOrderItemsMap(prev => {
      const list = prev[srcId].map(item => {
        if (item.lineId === lineIdOrName || item.name === lineIdOrName || item.itemName === lineIdOrName) {
          const isComp = !item.isComplimentary;
          const menuObj = MOCK_MENU_ITEMS.find(m => m.id === item.itemId || m.name === item.itemName || m.name === item.name);
          let origPrice = menuObj?.price || menuObj?.rate || item.unitPrice || item.price || 0;
          if (menuObj?.variants && item.variantId) {
            const vObj = menuObj.variants.find(v => v.id === item.variantId);
            if (vObj) origPrice = vObj.price;
          }
          const price = isComp ? 0 : origPrice;
          return {
            ...item,
            isComplimentary: isComp,
            unitPrice: price,
            price: price,
            rate: price,
            total: item.qty * price
          };
        }
        return item;
      });
      const sum = list.reduce((s, r) => s + r.total, 0);
      updateTableAmount(srcId, sum);
      return { ...prev, [srcId]: list };
    });
  };

  const handleDeleteItem = (lineIdOrName) => {
    if (!fromTableId) return;
    const srcId = parseInt(fromTableId);
    setOrderItemsMap(prev => {
      const list = prev[srcId].filter(item => item.lineId !== lineIdOrName && item.name !== lineIdOrName && item.itemName !== lineIdOrName);
      const sum = list.reduce((s, r) => s + r.total, 0);
      updateTableAmount(srcId, sum);
      return { ...prev, [srcId]: list };
    });
  };

  // KOT Generation
  const handleCreateKOT = () => {
    if (!fromTableId) return;
    const srcId = parseInt(fromTableId);
    const items = orderItemsMap[srcId] || [];
    if (items.length === 0) return toast("No items to generate KOT.");

    const newKotId = `KOT-${Math.floor(100 + Math.random() * 900)}`;
    const newKot = {
      id: newKotId,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Sent to Kitchen',
      items: items.map(it => ({
        lineId: it.lineId || (crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).substr(2, 5))),
        itemId: it.itemId,
        itemName: it.itemName || it.name,
        name: it.name || it.itemName,
        variantId: it.variantId || '',
        variantName: it.variantName || '',
        variant: it.variant || '',
        qty: it.qty,
        unitPrice: it.unitPrice || it.price || 0,
        price: it.price || it.unitPrice || 0,
        rate: it.rate || it.unitPrice || 0,
        total: it.total
      }))
    };

    setTables(prev => prev.map(t => {
      if (t.id === srcId) {
        const nextKots = [...(t.kots || []), newKot];
        return {
          ...t,
          kots: nextKots,
          kotCount: nextKots.length,
          status: 'KOT Generated'
        };
      }
      return t;
    }));

    toast(`KOT generated: ${newKotId}`);
  };

  const handleCancelKOT = (kotId) => {
    if (!fromTableId) return;
    const srcId = parseInt(fromTableId);
    if (window.confirm(`Cancel KOT ${kotId}?`)) {
      const sourceTable = tables.find(t => t.id === srcId);
      if (!sourceTable) return;

      const kotToCancel = (sourceTable.kots || []).find(k => k.id === kotId);
      if (!kotToCancel) return;

      let sourceItems = [...(orderItemsMap[srcId] || [])];
      kotToCancel.items.forEach(kotIt => {
        sourceItems = sourceItems.map(srcIt => {
          if (
            (srcIt.itemId === kotIt.itemId || srcIt.itemName === kotIt.itemName || srcIt.name === kotIt.name) &&
            (srcIt.variantId === kotIt.variantId || srcIt.variantName === kotIt.variantName || srcIt.variant === kotIt.variant)
          ) {
            const nextQty = srcIt.qty - kotIt.qty;
            return { ...srcIt, qty: nextQty, total: nextQty * (srcIt.unitPrice || srcIt.price || 0) };
          }
          return srcIt;
        }).filter(srcIt => srcIt.qty > 0);
      });

      const nextSum = sourceItems.reduce((sum, r) => sum + r.total, 0);

      setTables(prev => prev.map(t => {
        if (t.id === srcId) {
          const nextKots = (t.kots || []).filter(k => k.id !== kotId);
          return {
            ...t,
            kots: nextKots,
            kotCount: nextKots.length,
            amount: nextSum,
            status: nextSum > 0 ? t.status : 'Blank',
            openedAt: nextSum > 0 ? t.openedAt : null
          };
        }
        return t;
      }));

      setOrderItemsMap(prev => ({
        ...prev,
        [srcId]: sourceItems
      }));

      toast(`Cancelled ${kotId} and removed its items.`);
    }
  };

  // Billing calculations
  const getBillingSummary = () => {
    if (!fromTableId) return { subtotal: 0, gst: 0, serviceCharge: 0, discount: 0, grandTotal: 0 };
    const srcId = parseInt(fromTableId);
    const items = orderItemsMap[srcId] || [];
    const subtotal = items.reduce((s, item) => s + item.total, 0);
    const gst = Math.round(subtotal * 0.05);
    const serviceCharge = subtotal > 0 ? 50 : 0;
    const discount = Math.round(subtotal * (discountPercent / 100));
    const grandTotal = Math.max(0, subtotal + gst + serviceCharge - discount);
    return { subtotal, gst, serviceCharge, discount, grandTotal };
  };

  // Payment settlement action
  const executePaymentSettlement = () => {
    if (!fromTableId) return;
    const srcId = parseInt(fromTableId);
    const { grandTotal } = getBillingSummary();

    if (paymentMethod === 'Split') {
      const splitTotal = (parseFloat(splitCash) || 0) + (parseFloat(splitCard) || 0) + (parseFloat(splitUPI) || 0);
      if (Math.abs(splitTotal - grandTotal) > 1) {
        return toast(`Split payment sum (₹${splitTotal}) must match Grand Total (₹${grandTotal}).`);
      }
    }

    // Set status to 'Paid' with paidAt timestamp — context will auto-reset after 30s
    setTables(prev => prev.map(t => {
      if (t.id === srcId) {
        return { ...t, status: 'Paid', paidAt: Date.now() };
      }
      return t;
    }));
    setShowSettleSuccess(true);
    toast(`Payment received. Table status: Paid.`);

    setTimeout(() => {
      setShowSettleSuccess(false);
      setShowQuickSwitch(false);
    }, 2000);
  };

  const handleModalOkClick = () => {
    if (modalTab === 'Move') {
      if (!fromTableId || !toTableId) {
        toast("Please select From Table and To Table.");
        return;
      }
      const srcId = parseInt(fromTableId);
      const dstId = parseInt(toTableId);
      if (srcId === dstId) return toast("Cannot select same table.");

      if (transferOp === 'Move') {
        const sourceTable = tables.find(t => t.id === srcId);
        const sourceItems = orderItemsMap[srcId] || [];

        setTables(prev => prev.map(t => {
          if (t.id === srcId) {
            return { ...t, status: 'Blank', amount: 0, waiter: null, captain: null, openedAt: null, isHold: false, kots: [], kotCount: 0 };
          }
          if (t.id === dstId) {
            return {
              ...t,
              status: sourceTable.status === 'Blank' ? 'Running' : sourceTable.status,
              amount: sourceTable.amount,
              waiter: sourceTable.waiter,
              captain: sourceTable.captain,
              openedAt: sourceTable.openedAt || Date.now(),
              isHold: sourceTable.isHold,
              seats: sourceTable.seats,
              kots: sourceTable.kots || [],
              kotCount: sourceTable.kotCount
            };
          }
          return t;
        }));
        setOrderItemsMap(prev => ({
          ...prev,
          [srcId]: [],
          [dstId]: sourceItems
        }));
        toast(`Moved Table ${sourceTable.no} complete order to Table ${tables.find(t => t.id === dstId)?.no}.`);
      } else {
        const sourceTable = tables.find(t => t.id === srcId);
        const targetTable = tables.find(t => t.id === dstId);
        if (targetTable.status === 'Blank') {
          return toast("Target table must be active to merge. Choose Move instead.");
        }
        const sourceItems = orderItemsMap[srcId] || [];
        const targetItems = [...(orderItemsMap[dstId] || [])];

        sourceItems.forEach(srcItem => {
          const idx = targetItems.findIndex(t => t.name === srcItem.name);
          if (idx !== -1) {
            targetItems[idx] = {
              ...targetItems[idx],
              qty: targetItems[idx].qty + srcItem.qty,
              total: (targetItems[idx].qty + srcItem.qty) * targetItems[idx].rate
            };
          } else {
            targetItems.push({ ...srcItem });
          }
        });

        const mergedSum = targetItems.reduce((sum, r) => sum + r.total, 0);

        setTables(prev => prev.map(t => {
          if (t.id === srcId) {
            return { ...t, status: 'Blank', amount: 0, waiter: null, captain: null, openedAt: null, isHold: false, kots: [], kotCount: 0 };
          }
          if (t.id === dstId) {
            return {
              ...t,
              status: 'Running',
              amount: mergedSum,
              waiter: t.waiter || sourceTable.waiter,
              captain: t.captain || sourceTable.captain,
              seats: Math.max(t.seats, sourceTable.seats),
              openedAt: t.openedAt || sourceTable.openedAt || Date.now(),
              kots: [...(t.kots || []), ...(sourceTable.kots || [])],
              kotCount: (t.kotCount || 0) + (sourceTable.kotCount || 0)
            };
          }
          return t;
        }));
        setOrderItemsMap(prev => ({
          ...prev,
          [srcId]: [],
          [dstId]: targetItems
        }));
        toast(`Merged Table ${sourceTable.no} into Table ${targetTable.no}.`);
      }
      setShowQuickSwitch(false);
    }
    else if (modalTab === 'MoveKOT') {
      const selectedKots = Object.keys(selectedTransferKots).filter(k => selectedTransferKots[k]);
      if (selectedKots.length === 0) return toast("Please select KOTs to transfer.");
      if (!fromTableId || !toTableId) return toast("Select From Table and To Table.");

      const srcId = parseInt(fromTableId);
      const dstId = parseInt(toTableId);
      if (srcId === dstId) return toast("Cannot select same table.");

      const destTable = tables.find(t => t.id === dstId);
      const srcTable = tables.find(t => t.id === srcId);

      // Call backend API for each selected KOT
      const movePromises = selectedKots.map(async kotId => {
        try {
          const { kotService } = await import('../../../services/kotService');
          await kotService.moveKOT(kotId, {
            toTableId: dstId,
            toTableNo: destTable?.no
          });
        } catch (err) {
          console.error(`Error moving KOT ${kotId}:`, err.message);
        }
      });

      Promise.all(movePromises).then(async () => {
        // Optimistic update: move KOTs visually
        setTables(prev => prev.map(t => {
          if (t.id === srcId) {
            const remainingKots = (t.kots || []).filter(k => !selectedKots.includes(k.id));
            return {
              ...t,
              kots: remainingKots,
              kotCount: remainingKots.length,
              status: remainingKots.length === 0 ? 'Blank' : t.status,
              color: remainingKots.length === 0 ? 'white' : t.color,
              amount: remainingKots.length === 0 ? 0 : t.amount,
              updatedAt: Date.now()
            };
          }
          if (t.id === dstId) {
            const movedKots = (srcTable?.kots || []).filter(k => selectedKots.includes(k.id));
            return {
              ...t,
              kots: [...(t.kots || []), ...movedKots],
              kotCount: (t.kots || []).length + movedKots.length,
              status: 'KOT_CUT',
              color: 'orange',
              updatedAt: Date.now()
            };
          }
          return t;
        }));

        // Re-fetch tables from backend after 500ms to sync real DB state
        setTimeout(async () => {
          try {
            const { tableService } = await import('../../../services/tableService');
            const res = await tableService.getTables();
            const rawTables = res?.tables || res?.data || [];
            if (rawTables.length > 0) {
              setTables(rawTables.map(t => {
                const rawStatus = t.status || t.order_state || 'AVAILABLE';
                let color = (t.color || '').toLowerCase();
                if (!color || color === 'white') {
                  color = (rawStatus === 'Running' || rawStatus === 'KOT_CUT') ? 'orange' : rawStatus === 'Paid' ? 'green' : 'white';
                }
                return { ...t, color, updatedAt: Date.now() };
              }));
            }
          } catch (e) { /* silent */ }
        }, 600);

        toast(`Moved ${selectedKots.length} KOT(s) from T${srcTable?.no} to T${destTable?.no}.`);
      });

      setSelectedTransferKots({});
      setShowQuickSwitch(false);
    }
    else if (modalTab === 'MoveItems') {
      const selectedKeys = Object.keys(selectedTransferItems).filter(k => selectedTransferItems[k] > 0);
      if (selectedKeys.length === 0) return toast("Adjust item quantities to transfer.");
      if (!fromTableId || !toTableId) return toast("Select From Table and To Table.");

      const srcId = parseInt(fromTableId);
      const dstId = parseInt(toTableId);
      if (srcId === dstId) return toast("Cannot select same table.");

      executeMoveSelectedItems(srcId, dstId);
      setShowQuickSwitch(false);
    }
  };

  return {
    tables,
    loading,
    setTables,
    refreshTables,
    orderItemsMap,
    setOrderItemsMap,
    showQuickSwitch,
    setShowQuickSwitch,
    modalTab,
    setModalTab,
    transferOp,
    setTransferOp,
    fromTableId,
    setFromTableId,
    toTableId,
    setToTableId,
    selectedTransferItems,
    setSelectedTransferItems,
    selectedTransferKots,
    setSelectedTransferKots,
    splitGuestsSource,
    setSplitGuestsSource,
    splitGuestsTarget,
    setSplitGuestsTarget,
    newItemName,
    setNewItemName,
    newItemQty,
    setNewItemQty,
    newItemRemarks,
    setNewItemRemarks,
    discountPercent,
    setDiscountPercent,
    paymentMethod,
    setPaymentMethod,
    splitCash,
    setSplitCash,
    splitCard,
    setSplitCard,
    splitUPI,
    setSplitUPI,
    equalSplitCount,
    setEqualSplitCount,
    splitPercentSource,
    setSplitPercentSource,
    showSettleSuccess,
    setShowSettleSuccess,
    selectedTableForOps,
    setSelectedTableForOps,
    selectedGuests,
    setSelectedGuests,
    selectedWaiter,
    setSelectedWaiter,
    selectedCaptain,
    setSelectedCaptain,
    activeSourceItems,
    toast,
    updateTableField,
    updateTableAmount,
    updateTableStatus,
    toggleHoldOrder,
    cancelCompleteOrder,
    handleAddItemToOps,
    handleUpdateItemQty,
    handleToggleItemComplimentary,
    handleDeleteItem,
    handleCreateKOT,
    handleCancelKOT,
    executePaymentSettlement,
    getBillingSummary,
    handleModalOkClick
  };
};
