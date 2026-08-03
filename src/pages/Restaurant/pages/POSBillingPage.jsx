import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../../../context/RestaurantContext';
import { menuService } from '../../../services/menuService';
import { kotService } from '../../../services/kotService';
import { orderService } from '../../../services/orderService';
import { restaurantApi } from '../../../api/restaurantApi';

// KOT Engine & Printer data
import { ALL_FOOD_ITEMS } from '../constants/printerData';
import { MOCK_MENU_ITEMS } from '../constants/mockData';
import { groupItemsByPrinter, generateKOTPayload } from '../services/kotEngine';

// Presentation splits & layout
import BillingLayout from '../components/pos/BillingLayout';
import MenuPanel from '../components/pos/MenuPanel';
import BillingPanel from '../components/pos/BillingPanel';

const INITIAL_ROWS = [];

const POSBillingPage = ({ isBillingDesk = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = React.useRef(null);

  const [loadingMenu, setLoadingMenu] = useState(true);
  const [allMenuItems, setAllMenuItems] = useState(() =>
    MOCK_MENU_ITEMS.map(item => ({
      id: item.id,
      name: item.name,
      shortCode: String(item.id),
      category: item.category || 'FOOD',
      foodType: item.isVeg === false ? 'Non-Veg' : 'Veg',
      isVeg: item.isVeg !== false,
      price: Number(item.price || item.rate || 0),
      active: 'Yes',
      variants: item.variants || [],
      areaPrices: {}
    }))
  );

  // Shared menu loader — used on mount AND when storage/focus events fire
  const loadRealMenu = useCallback(async () => {
    try {
      const res = await menuService.getMenu();
      const rawItems = (
        res?.data?.items ||
        res?.items ||
        res?.catalouge?.items ||
        res?.data?.catalouge?.items ||
        (Array.isArray(res?.data) && res.data.length > 0 ? res.data : null) ||
        (Array.isArray(res) && res.length > 0 ? res : null) ||
        []
      );
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        console.log('✅ Loaded live PostgreSQL menu items:', rawItems);
        const mapped = rawItems.map(item => ({
          id: item.item_id || item.id,
          name: item.title || item.name || item.item_name || 'Item',
          shortCode: item.short_code || String(item.item_id || item.id || ''),
          category: item['mpos_category.category_name']
            ? item['mpos_category.category_name'].toUpperCase()
            : (item.category ? String(item.category).toUpperCase() : (item.category_name ? String(item.category_name).toUpperCase() : 'FOOD')),
          foodType: item.food_type === 2 ? 'Non-Veg' : 'Veg',
          isVeg: item.food_type !== 2,
          price: Number(item.sale_price || item.price || item.rate || 0),
          active: item.active === 0 ? 'No' : 'Yes',
          variants: item.variants || [],
          areaPrices: {}
        }));
        setAllMenuItems(mapped);
      }
    } catch (err) {
      console.warn('Real menu loading fallback:', err);
    } finally {
      setLoadingMenu(false);
    }
  }, []);

  // Re-load menu when storage or window focus changes (e.g. menu updated in settings)
  useEffect(() => {
    window.addEventListener('storage', loadRealMenu);
    window.addEventListener('focus', loadRealMenu);
    return () => {
      window.removeEventListener('storage', loadRealMenu);
      window.removeEventListener('focus', loadRealMenu);
    };
  }, [loadRealMenu]);

  // Load menu on first render
  useEffect(() => {
    loadRealMenu();
  }, [loadRealMenu]);


  const availableCategories = useMemo(() => {
    const activeItems = allMenuItems.filter(i => i.active !== 'No');
    const catSet = new Set(activeItems.map(i => (i.category ? String(i.category).toUpperCase() : 'FOOD')));
    if (catSet.size === 0) return ['FOOD', 'BANQUET'];
    const cats = Array.from(catSet);
    cats.sort((a, b) => (a === 'FOOD' ? -1 : b === 'FOOD' ? 1 : a.localeCompare(b)));
    return cats;
  }, [allMenuItems]);

  // Check if opened from "Book Table" button in new booking flow
  const isNewBooking = location.state?.isNewBooking || location.state?.newBooking || false;
  const preselectedTableId = location.state?.tableId || null;
  const preselectedTableNumber = location.state?.tableNumber || null;

  // Tables List for Assignment
  const { tables: tablesList, setTables: setTablesList, orderItemsMap = {}, setOrderItemsMap } = useRestaurant();

  // Context persistence for Table / Order selection across page navigations and refreshes
  const savedContextRef = React.useRef(null);
  if (savedContextRef.current === null) {
    try {
      const saved = sessionStorage.getItem('alfa_selected_pos_table');
      if (saved) savedContextRef.current = JSON.parse(saved);
    } catch (e) {}
  }
  const restoredTable = location.state?.table || savedContextRef.current?.table || null;
  const routedTable = restoredTable;
  const restoredTableId = preselectedTableId || restoredTable?.id || savedContextRef.current?.tableId || savedContextRef.current?.table?.id || '';

  // Component states
  const [category, setCategory] = useState('FOOD');

  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.includes(category)) {
      setCategory(availableCategories[0]);
    }
  }, [availableCategories, category]);
  const [searchItem, setSearchItem] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [serviceType, setServiceType] = useState('Dine In');

  // Customer Information inputs
  const [customerName, setCustomerName] = useState(restoredTable?.customer || '');
  const [mobileNumber, setMobileNumber] = useState(restoredTable?.mobile || '');
  const [paxCount, setPaxCount] = useState(restoredTable?.seats || 1);
  const [paxAdults, setPaxAdults] = useState(restoredTable?.seats || 1);
  const [paxChildren, setPaxChildren] = useState(0);
  const [waiter, setWaiter] = useState(restoredTable?.waiter || '');
  const [captain, setCaptain] = useState(restoredTable?.captain || '');
  const [remarks, setRemarks] = useState('');
  const [showCustomerDetails, setShowCustomerDetails] = useState(true);

  // Enterprise payment details states
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [isPaid, setIsPaid] = useState(false);
  const [gstin, setGstin] = useState('');
  const [customerSettings, setCustomerSettings] = useState({
    enableLoyalty: false,
    customerType: 'Regular',
    creditAllowed: false,
    creditLimit: 0
  });

  // Modal open visibility triggers
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isCustomerDrawerOpen, setIsCustomerDrawerOpen] = useState(false);
  const [isPaxModalOpen, setIsPaxModalOpen] = useState(false);
  const [isRemarksModalOpen, setIsRemarksModalOpen] = useState(false);
  const [isGstModalOpen, setIsGstModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [variantModalItem, setVariantModalItem] = useState(null);

  // KOT states
  const [kotCreated, setKotCreated] = useState(false);
  const [generatedKotNo, setGeneratedKotNo] = useState('');
  const [showKotAlert, setShowKotAlert] = useState(false);
  const [assignedTableId, setAssignedTableId] = useState(restoredTableId);

  // KOT Print Modal states (multi-printer routing)
  const [showKotPrintModal, setShowKotPrintModal] = useState(false);
  const [kotGroups, setKotGroups] = useState([]);
  const [kotPayloads, setKotPayloads] = useState([]);
  const kotSuccessCallbackRef = React.useRef(null);

  // Compute initial fallback rows from navigation state, sessionStorage, or context
  const initialFallbackRows = useMemo(() => {
    const tableKey = restoredTableId || restoredTable?.id || restoredTable?.no;
    const fromLocation = location.state?.rows || location.state?.orderRows;
    if (Array.isArray(fromLocation) && fromLocation.length > 0) return fromLocation;

    const fromSaved = savedContextRef.current?.rows;
    if (Array.isArray(fromSaved) && fromSaved.length > 0) return fromSaved;

    if (tableKey && orderItemsMap) {
      if (orderItemsMap[tableKey] && orderItemsMap[tableKey].length > 0) return orderItemsMap[tableKey];
      if (restoredTable?.no && orderItemsMap[restoredTable.no] && orderItemsMap[restoredTable.no].length > 0) return orderItemsMap[restoredTable.no];
      if (restoredTable?.no && orderItemsMap[String(restoredTable.no)] && orderItemsMap[String(restoredTable.no)].length > 0) return orderItemsMap[String(restoredTable.no)];
      if (restoredTable?.no && orderItemsMap[Number(restoredTable.no)] && orderItemsMap[Number(restoredTable.no)].length > 0) return orderItemsMap[Number(restoredTable.no)];
    }

    if (restoredTable?.kots && Array.isArray(restoredTable.kots) && restoredTable.kots.length > 0) {
      const kotItems = restoredTable.kots.flatMap(k => k.items || []);
      if (kotItems.length > 0) return kotItems;
    }

    return INITIAL_ROWS;
  }, [location.state, restoredTable, restoredTableId, orderItemsMap]);

  // Table rows for right-side billing
  const [rows, setRows] = useState(initialFallbackRows);
  const [isSettling, setIsSettling] = useState(false);

  // Check if opened for a specific KOT (KOT-specific Billing View)
  const queryParams = new URLSearchParams(location.search);
  const targetKotId = queryParams.get('kotId') || location.state?.kotId;
  const [kotViewData, setKotViewData] = useState(null);

  // Sync active table data & rows when assignedTableId or location.state changes
  useEffect(() => {
    async function loadActiveTableData() {
      // 1. Single KOT view mode
      if (targetKotId) {
        try {
          const singleKotRes = await kotService.getKOTById(targetKotId);
          const kotObj = singleKotRes?.kot || singleKotRes?.data;
          if (kotObj) {
            setKotViewData(kotObj);
            if (kotObj.tableNo || kotObj.tableId) setAssignedTableId(kotObj.tableNo || kotObj.tableId);
            setCustomerName(kotObj.customer?.name || kotObj.customer_name || 'Walk-in');
            setMobileNumber(kotObj.customer?.mobile || kotObj.mobile_number || '');
            setWaiter(kotObj.waiter || '');
            setRemarks(kotObj.remark || kotObj.remarks || '');
            setRows((kotObj.items || []).map((item, idx) => ({
              lineId: item.lineId || `kot-item-${idx}`,
              itemId: item.itemId || item.item_id || item.id || idx,
              itemName: item.itemName || item.title || item.name || item.item_name || '',
              name: item.itemName || item.title || item.name || item.item_name || '',
              variantId: item.variantId || '',
              variantName: item.variantName || item.variant || '',
              variant: item.variantName || item.variant || '',
              qty: Number(item.qty || item.quantity || 1),
              unitPrice: Number(item.unitPrice || item.price || item.rate || 0),
              price: Number(item.unitPrice || item.price || item.rate || 0),
              rate: Number(item.unitPrice || item.price || item.rate || 0),
              total: Number(item.total || ((item.qty || item.quantity || 1) * (item.unitPrice || item.price || 0))),
              remark: item.remark || item.remarks || item.item_note || ''
            })));
            return;
          }
        } catch (err) {
          console.warn('Error fetching single KOT:', err);
        }
      }

      setKotViewData(null);
      const activeTableId = assignedTableId || restoredTableId;
      const currentTable = tablesList.find(
        t => String(t.id) === String(activeTableId) || String(t.no) === String(activeTableId)
      ) || restoredTable;

      const isBlank = !currentTable || currentTable.status === 'Blank' || currentTable.status === 'AVAILABLE';

      if (isBlank) {
        if (!isNewBooking && (!location.state?.rows || location.state.rows.length === 0)) {
          setRows([]);
        }
        if (currentTable?.customer) setCustomerName(currentTable.customer);
        if (currentTable?.waiter) setWaiter(currentTable.waiter);
        if (currentTable?.captain) setCaptain(currentTable.captain);
        return;
      }

      // Collect best available fallback rows from frontend state / context / sessionStorage / kots
      const fallbackRows = (
        (location.state?.rows && location.state.rows.length > 0 ? location.state.rows : null) ||
        (location.state?.orderRows && location.state.orderRows.length > 0 ? location.state.orderRows : null) ||
        (savedContextRef.current?.rows && savedContextRef.current.rows.length > 0 ? savedContextRef.current.rows : null) ||
        (currentTable?.id && orderItemsMap[currentTable.id] && orderItemsMap[currentTable.id].length > 0 ? orderItemsMap[currentTable.id] : null) ||
        (currentTable?.no && orderItemsMap[currentTable.no] && orderItemsMap[currentTable.no].length > 0 ? orderItemsMap[currentTable.no] : null) ||
        (currentTable?.no && orderItemsMap[String(currentTable.no)] && orderItemsMap[String(currentTable.no)].length > 0 ? orderItemsMap[String(currentTable.no)] : null) ||
        (currentTable?.no && orderItemsMap[Number(currentTable.no)] && orderItemsMap[Number(currentTable.no)].length > 0 ? orderItemsMap[Number(currentTable.no)] : null) ||
        (currentTable?.kots && currentTable.kots.length > 0 ? currentTable.kots.flatMap(k => k.items || []) : null) ||
        []
      );

      if (!currentTable) {
        if (fallbackRows.length > 0) setRows(fallbackRows);
        return;
      }

      // Fetch active KOT / order items from backend PostgreSQL API
      try {
        const orderRes = await restaurantApi.getOrders({
          tableId: currentTable.id,
          table_id: currentTable.id,
          table_no: currentTable.no
        });
        const activeOrder = orderRes?.orderdata || (Array.isArray(orderRes?.orders) ? orderRes.orders[0] : null);
        if (activeOrder && Array.isArray(activeOrder.items) && activeOrder.items.length > 0) {
          const apiRows = activeOrder.items.map((item, idx) => ({
            lineId: item.lineId || `item-${idx}`,
            itemId: item.itemId || item.item_id || item.id || idx,
            itemName: item.itemName || item.title || item.name || item.item_name || '',
            name: item.itemName || item.title || item.name || item.item_name || '',
            variantId: item.variantId || '',
            variantName: item.variantName || item.variant || '',
            variant: item.variantName || item.variant || '',
            qty: Number(item.qty || item.quantity || 1),
            unitPrice: Number(item.unitPrice || item.price || item.rate || 0),
            price: Number(item.unitPrice || item.price || item.rate || 0),
            rate: Number(item.unitPrice || item.price || item.rate || 0),
            total: Number(item.total || ((item.qty || item.quantity || 1) * (item.unitPrice || item.price || 0))),
            remark: item.remark || item.remarks || item.item_note || ''
          }));
          setRows(apiRows);
          if (activeOrder.customer_name) setCustomerName(activeOrder.customer_name);
          if (activeOrder.waiter_name) setWaiter(activeOrder.waiter_name);
        } else {
          if (fallbackRows.length > 0) {
            setRows(fallbackRows);
          }
        }
      } catch (err) {
        console.warn('Error fetching active KOT items from PostgreSQL:', err);
        if (fallbackRows.length > 0) {
          setRows(fallbackRows);
        }
      }

      if (currentTable.customer) setCustomerName(currentTable.customer);
      if (currentTable.waiter) setWaiter(currentTable.waiter);
      if (currentTable.captain) setCaptain(currentTable.captain);
    }

    loadActiveTableData();
  }, [assignedTableId, restoredTableId, targetKotId]);

  // Sync changes in rows to orderItemsMap in context & localStorage
  useEffect(() => {
    const tableKey = assignedTableId || restoredTableId || routedTable?.id;
    if (tableKey && setOrderItemsMap && Array.isArray(rows)) {
      const activeRows = rows.filter(r => (r.itemName || r.name || '') !== '');
      if (activeRows.length > 0) {
        setOrderItemsMap(prev => ({
          ...prev,
          [tableKey]: activeRows,
          ...(routedTable?.no ? { [routedTable.no]: activeRows } : {})
        }));
      }
    }
  }, [rows, assignedTableId, restoredTableId, routedTable, setOrderItemsMap]);

  // Global Shortcuts Hook for F5-F10 + Escape + +/- keys + Alt key combos + F3 Focus Cart
  useEffect(() => {
    const handleShortcuts = (e) => {
      if (e.altKey) {
        const key = e.key.toLowerCase();
        switch (key) {
          case '1':
            e.preventDefault();
            setCategory('FOOD');
            toast('Category: FOOD');
            break;
          case '2':
            e.preventDefault();
            setCategory('BANQUET');
            toast('Category: BANQUET');
            break;
          case 'c':
            e.preventDefault();
            focusCartTable();
            break;
          case 't':
            e.preventDefault();
            setIsTableModalOpen(true);
            break;
          case 'm':
            e.preventDefault();
            setIsCustomerDrawerOpen(true);
            break;
          case 'p':
            e.preventDefault();
            setIsPaxModalOpen(true);
            break;
          case 'r':
            e.preventDefault();
            setIsRemarksModalOpen(true);
            break;
          case 'g':
            e.preventDefault();
            setIsGstModalOpen(true);
            break;
          case 'a':
            e.preventDefault();
            handleAddEmptyRow();
            break;
          case 'd':
            e.preventDefault();
            setIsClearModalOpen(true);
            break;
          case 'v':
            e.preventDefault();
            setServiceType(prev => {
              const modes = ['Dine In', 'Take Away', 'Delivery'];
              const next = (modes.indexOf(prev) + 1) % modes.length;
              toast(`Service Type: ${modes[next]}`);
              return modes[next];
            });
            break;
          case 'y':
            e.preventDefault();
            setPaymentMode(prev => {
              const modes = ['Cash', 'Card', 'UPI', 'Room'];
              const next = (modes.indexOf(prev) + 1) % modes.length;
              toast(`Payment Mode: ${modes[next]}`);
              return modes[next];
            });
            break;
          default:
            break;
        }
        return;
      }

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          if (searchInputRef.current) {
            searchInputRef.current.focus();
            searchInputRef.current.select();
          }
          break;
        case 'F3':
          e.preventDefault();
          focusCartTable();
          break;
        case 'F5':
          e.preventDefault();
          handleConfirmBooking();
          break;
        case 'F6':
          e.preventDefault();
          handleSaveAndPrint();
          break;
        case 'F7':
          e.preventDefault();
          handleDirectComplete();
          break;
        case 'F8':
          e.preventDefault();
          handleAddKOT();
          break;
        case 'F9':
          e.preventDefault();
          handleSaveAndPrint();
          break;
        case 'F10':
          e.preventDefault();
          handleConfirmBooking();
          break;
        case '+':
          if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            setRows(prev => {
              const lastIdx = prev.findIndex(r => r.itemName || r.name);
              if (lastIdx === -1) return prev;
              return prev.map((r, i) => i === lastIdx ? { ...r, qty: r.qty + 1, total: (r.qty + 1) * r.unitPrice } : r);
            });
            toast('Quantity increased');
          }
          break;
        case '-':
          if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            setRows(prev => {
              const lastIdx = prev.findIndex(r => r.itemName || r.name);
              if (lastIdx === -1) return prev;
              const lastRow = prev[lastIdx];
              if (lastRow.qty <= 1) return prev;
              return prev.map((r, i) => i === lastIdx ? { ...r, qty: r.qty - 1, total: (r.qty - 1) * r.unitPrice } : r);
            });
            toast('Quantity decreased');
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleShortcuts);
    return () => window.removeEventListener('keydown', handleShortcuts);
  }, [rows, assignedTableId, customerName, mobileNumber, waiter, captain, remarks, paymentMode, isPaid, gstin, serviceType]);

  // Auto-focus search bar on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  // Refocus search input whenever any modal/drawer closes
  useEffect(() => {
    if (!isTableModalOpen && !isCustomerDrawerOpen && !isPaxModalOpen && !isRemarksModalOpen && !isGstModalOpen && !isSettingsModalOpen && !isClearModalOpen && !showVariantModal) {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  }, [isTableModalOpen, isCustomerDrawerOpen, isPaxModalOpen, isRemarksModalOpen, isGstModalOpen, isSettingsModalOpen, isClearModalOpen, showVariantModal]);



  const toast = (msg) => {
    if (window.showToast) {
      window.showToast(msg);
    } else {
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
    }
  };

  const filteredGridItems = useMemo(() => {
    const q = searchItem.toLowerCase().trim();
    const activeItems = allMenuItems.filter(item => item.active !== 'No');
    if (!q) {
      return activeItems.filter(item => {
        const itemCat = item.category ? String(item.category).toUpperCase() : 'FOOD';
        return itemCat === category.toUpperCase();
      });
    }
    return activeItems.filter(item => {
      const matchesName = (item.name || '').toLowerCase().includes(q);
      const matchesId = String(item.id || '').toLowerCase().includes(q) || String(item.shortCode || '').toLowerCase().includes(q);
      return matchesName || matchesId;
    });
  }, [allMenuItems, category, searchItem]);

  const handleGridItemClick = (foodItem) => {
    if (!foodItem.variants || foodItem.variants.length === 0) {
      addOrUpdateItemRow(foodItem, null);
    } else if (foodItem.variants.length === 1) {
      addOrUpdateItemRow(foodItem, foodItem.variants[0]);
    } else {
      setVariantModalItem(foodItem);
      setShowVariantModal(true);
    }
  };

  const getAreaAdjustedPrice = (foodItem, basePrice) => {
    try {
      const activeArea = routedTable?.area || (serviceType === 'Dine In' ? 'Restaurant Dining' : serviceType);
      if (foodItem && foodItem.areaPrices) {
        if (foodItem.areaPrices[activeArea] !== undefined && foodItem.areaPrices[activeArea] !== '') {
          const areaPrice = Number(foodItem.areaPrices[activeArea]);
          if (!isNaN(areaPrice) && areaPrice > 0) return areaPrice;
        }
      }
    } catch (e) {}
    return basePrice;
  };

  const addOrUpdateItemRow = (foodItem, variant) => {
    const variantId = variant ? variant.id : '';
    const variantName = variant ? variant.name : '';
    const rawPrice = variant ? variant.price : (foodItem.price || foodItem.rate || 0);
    const price = getAreaAdjustedPrice(foodItem, rawPrice);
    const lineId = crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).substr(2, 5));
    const itemName = foodItem.name || foodItem.title || 'Item';

    setRows(prev => {
      const emptyIndex = prev.findIndex(r => !r.itemName && !r.name);
      const existingIndex = prev.findIndex(r => {
        const sameId = foodItem.id && r.itemId && String(r.itemId) === String(foodItem.id);
        const sameName = (r.itemName || r.name || '').toLowerCase() === itemName.toLowerCase();
        const sameVariant = String(r.variantId || '') === String(variantId || '') || String(r.variantName || r.variant || '') === String(variantName || '');
        return (sameId || sameName) && sameVariant;
      });

      if (existingIndex !== -1) {
        return prev.map((r, i) => {
          if (i === existingIndex) {
            const nextQty = (r.qty || 1) + 1;
            const unitPrice = r.unitPrice || price;
            return { ...r, qty: nextQty, total: nextQty * unitPrice };
          }
          return r;
        });
      } else if (emptyIndex !== -1) {
        return prev.map((r, i) => {
          if (i === emptyIndex) {
            return {
              ...r,
              lineId,
              itemId: foodItem.id,
              itemName: itemName,
              name: itemName,
              variantId,
              variantName,
              variant: variantName,
              qty: 1,
              unitPrice: price,
              price: price,
              rate: price,
              total: price,
              remark: ''
            };
          }
          return r;
        });
      } else {
        return [
          ...prev,
          {
            lineId,
            itemId: foodItem.id,
            itemName: itemName,
            name: itemName,
            variantId,
            variantName,
            variant: variantName,
            qty: 1,
            unitPrice: price,
            price: price,
            rate: price,
            total: price,
            remark: ''
          }
        ];
      }
    });
    toast(`Added: ${itemName}${variantName ? ` (${variantName})` : ''}`);
  };

  useEffect(() => {
    setRows(prevRows => prevRows.map(row => {
      if (!row.itemName && !row.name) return row;

      const rowName = (row.itemName || row.name || '').toLowerCase();
      const match = allMenuItems.find(f => (f.name || '').toLowerCase() === rowName);

      if (match && (!match.variants || match.variants.length === 0)) {
        let newPrice = Number(match.price || 0);
        if (match.areaPrices) {
          const mappedAreaKey = serviceType === 'Dine In' ? 'Restaurant Dining' : serviceType;
          if (match.areaPrices[mappedAreaKey] !== undefined && match.areaPrices[mappedAreaKey] !== '') {
            newPrice = Number(match.areaPrices[mappedAreaKey]);
          } else if (match.areaPrices[serviceType] !== undefined && match.areaPrices[serviceType] !== '') {
            newPrice = Number(match.areaPrices[serviceType]);
          }
        }
        return {
          ...row,
          unitPrice: newPrice,
          price: newPrice,
          rate: newPrice,
          total: row.qty * newPrice
        };
      }
      return row;
    }));
  }, [serviceType, allMenuItems]);

  const updateRowField = (index, field, value) => {
    setRows(prev => prev.map((row, i) => {
      if (i === index) {
        const updated = { ...row, [field]: value };
        if (field === 'name' || field === 'itemName') {
          const valLower = (value || '').toLowerCase();
          const match = allMenuItems.find(f => (f.name || '').toLowerCase() === valLower);

          if (match) {
            updated.itemId = match.id;
            updated.itemName = match.name;
            updated.name = match.name;

            let resolvedPrice = Number(match.price || 0);

            if (match.areaPrices) {
              const mappedAreaKey = serviceType === 'Dine In' ? 'Restaurant Dining' : serviceType;
              if (match.areaPrices[mappedAreaKey] !== undefined && match.areaPrices[mappedAreaKey] !== '') {
                resolvedPrice = Number(match.areaPrices[mappedAreaKey]);
              } else if (match.areaPrices[serviceType] !== undefined && match.areaPrices[serviceType] !== '') {
                resolvedPrice = Number(match.areaPrices[serviceType]);
              }
            }

            if (!match.variants || match.variants.length === 0) {
              updated.variantId = '';
              updated.variantName = '';
              updated.variant = '';
              updated.unitPrice = resolvedPrice;
              updated.price = resolvedPrice;
              updated.rate = resolvedPrice;
            } else {
              const firstVar = match.variants[0];
              updated.variantId = firstVar.id;
              updated.variantName = firstVar.name;
              updated.variant = firstVar.name;
              updated.unitPrice = firstVar.price;
              updated.price = firstVar.price;
              updated.rate = firstVar.price;
            }
          } else {
            updated.itemId = '';
            updated.itemName = '';
            updated.name = '';
            updated.variantId = '';
            updated.variantName = '';
            updated.variant = '';
            updated.unitPrice = 0;
            updated.price = 0;
            updated.rate = 0;
          }
        }

        const qty = updated.qty || 1;
        const priceVal = updated.unitPrice || updated.price || 0;
        updated.total = qty * priceVal;
        return updated;
      }
      return row;
    }));
  };

  const handleVariantChange = (index, variantId) => {
    setRows(prev => prev.map((row, i) => {
      if (i === index) {
        const item = allMenuItems.find(f => f.id === row.itemId || f.name === row.itemName || f.name === row.name);
        const variantObj = item?.variants?.find(v => v.id === variantId);
        if (variantObj) {
          const price = variantObj.price;
          return {
            ...row,
            variantId: variantObj.id,
            variantName: variantObj.name,
            variant: variantObj.name,
            unitPrice: price,
            price: price,
            rate: price,
            total: row.qty * price
          };
        }
      }
      return row;
    }));
  };

  const focusCartTable = () => {
    const firstInput = document.querySelector('[data-row="0"][data-col="1"]') || document.querySelector('[data-row="0"][data-col="3"]');
    if (firstInput) {
      firstInput.focus();
      if (firstInput.select) firstInput.select();
      toast('Focused cart table.');
    } else {
      toast('Cart is empty.');
    }
  };

  const handleGridKeyDown = (e, rowIndex, colIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (rowIndex === rows.length - 1) {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      } else {
        const nextTarget = document.querySelector(`[data-row="${rowIndex + 1}"][data-col="${colIndex}"]`);
        if (nextTarget) {
          nextTarget.focus();
          if (nextTarget.select) nextTarget.select();
        }
      }
      return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      if (e.target.tagName === 'SELECT' && ['ArrowUp', 'ArrowDown'].includes(e.key)) {
        return;
      }
      e.preventDefault();
      let nextRow = rowIndex;
      let nextCol = colIndex;

      if (e.key === 'ArrowUp') nextRow = Math.max(0, rowIndex - 1);
      else if (e.key === 'ArrowDown') nextRow = Math.min(rows.length - 1, rowIndex + 1);
      else if (e.key === 'ArrowLeft') nextCol = Math.max(0, colIndex - 1);
      else if (e.key === 'ArrowRight') nextCol = Math.min(4, colIndex + 1);

      const target = document.querySelector(`[data-row="${nextRow}"][data-col="${nextCol}"]`);
      if (target) {
        target.focus();
        if (target.select) target.select();
      }
    }
  };

  const handleAddEmptyRow = () => {
    const lineId = crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).substr(2, 5));
    setRows(prev => [...prev, { lineId, itemId: '', itemName: '', name: '', variantId: '', variantName: '', variant: '', remark: '', qty: 1, unitPrice: 0, price: 0, rate: 0, total: 0 }]);
  };

  const handleRemoveRow = (index) => {
    if (rows.length === 1) {
      setRows(INITIAL_ROWS);
    } else {
      setRows(prev => prev.filter((_, i) => i !== index));
    }
  };

  const totalBill = useMemo(() => {
    return rows.reduce((sum, row) => sum + (row.qty * (row.unitPrice || row.price || 0)), 0);
  }, [rows]);

  const [showDiscountPanel, setShowDiscountPanel] = useState(false);
  const [discountLines, setDiscountLines] = useState([
    { id: 1, type: 'Percentage', value: '', reason: '' }
  ]);

  const addDiscountLine = () => {
    setDiscountLines(prev => [
      ...prev,
      { id: Date.now(), type: 'Percentage', value: '', reason: '' }
    ]);
  };

  const removeDiscountLine = (id) => {
    setDiscountLines(prev => prev.length > 1 ? prev.filter(d => d.id !== id) : prev);
  };

  const updateDiscountLine = (id, field, value) => {
    setDiscountLines(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const totalDiscountAmt = useMemo(() => {
    let running = totalBill;
    return discountLines.reduce((totalDeducted, line) => {
      const val = parseFloat(line.value) || 0;
      if (val <= 0) return totalDeducted;
      if (line.type === 'Percentage') {
        const deduct = (running * val) / 100;
        running -= deduct;
        return totalDeducted + deduct;
      } else {
        const deduct = Math.min(val, running);
        running -= deduct;
        return totalDeducted + deduct;
      }
    }, 0);
  }, [discountLines, totalBill]);

  const netBill = totalBill - totalDiscountAmt;

  const handleAddKOT = async () => {
    const activeRows = rows.filter(r => r.name || r.itemName);
    if (activeRows.length === 0) {
      toast('Please add at least one item before generating KOT.');
      return;
    }
    if (!waiter) {
      toast('Please select a waiter.');
      return;
    }

    const kotSeq = String(Date.now()).slice(-4) + '-' + Math.floor(100 + Math.random() * 900);
    const newKotNo = `KOT-${kotSeq}`;
    setGeneratedKotNo(newKotNo);
    setKotCreated(true);

    const resolvedTableId = assignedTableId || routedTable?.id || null;
    const resolvedTable = tablesList.find(t => t.id === resolvedTableId) || routedTable;
    const tableNo = resolvedTable?.no || resolvedTableId || '??';

    const groups = groupItemsByPrinter(activeRows, allMenuItems);

    const payloads = groups.map(group =>
      generateKOTPayload({
        tableNo,
        tableId: resolvedTableId,
        kotNo: newKotNo,
        group,
        customerName,
        waiter,
        captain,
      })
    );

    setKotGroups(groups);
    setKotPayloads(payloads);

    // Call backend APIs to persist KOT, Table status, and Order into PostgreSQL
    try {
      await kotService.createKOT({
        kotNo: newKotNo,
        tableId: resolvedTableId,
        tableNo,
        customerName: customerName || 'Walk-in',
        waiter: waiter || 'Staff',
        items: activeRows
      });
      console.log('✅ KOT request persisted to PostgreSQL via POST /api/kot');
    } catch (err) {
      console.warn('Error calling KOT API:', err);
    }

    if (resolvedTableId) {
      try {
        await restaurantApi.patchTableStatus(resolvedTableId, {
          order_state: 'Running',
          amount: activeRows.reduce((sum, r) => sum + (r.qty * (r.unitPrice || r.price || 0)), 0),
          waiter: waiter || 'Staff',
          customer: customerName || 'Walk-in'
        });
        console.log(`✅ Table T${tableNo} status updated to Running in PostgreSQL`);
      } catch (err) {
        console.warn('Error updating table status in PostgreSQL:', err);
      }
    }

    kotSuccessCallbackRef.current = () => {
      if (!resolvedTable) {
        navigate('/restaurant/display-table');
        return;
      }
      const finalRows = rows.filter(r => r.name || r.itemName);
      const finalAmt = finalRows.reduce((sum, r) => sum + (r.qty * (r.unitPrice || r.price || 0)), 0);
      const updatedTable = {
        ...resolvedTable,
        status: 'Running',
        customer: customerName || resolvedTable.customer || 'Walk-in',
        mobile: mobileNumber || resolvedTable.mobile || '',
        waiter: waiter || resolvedTable.waiter || '',
        captain: captain || resolvedTable.captain || '',
        remarks: remarks || resolvedTable.remarks || '',
        amount: finalAmt,
        openedAt: resolvedTable.openedAt || Date.now(),
        kots: [
          ...(resolvedTable.kots || []),
          {
            id: newKotNo,
            amount: finalAmt,
            items: finalRows,
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            status: 'Sent to Kitchen',
          }
        ],
        kotCount: (resolvedTable.kotCount || 0) + 1,
      };
      toast(`Table T${resolvedTable.no} → Running`);
      navigate('/restaurant/display-table', { state: { updatedTable, updatedRows: finalRows } });
    };

    setShowKotPrintModal(true);
    toast(`KOT ${newKotNo} → ${groups.length} printer station${groups.length > 1 ? 's' : ''}`);
  };

  const handleConfirmBooking = async () => {
    if (!assignedTableId) {
      alert("Please select a table to assign!");
      return;
    }
    const targetTable = tablesList.find(t => t.id === assignedTableId);
    const activeRows = rows.filter(r => (r.itemName || r.name || '') !== '');
    const finalAmt = activeRows.reduce((sum, r) => sum + (r.qty * (r.unitPrice || r.price || 0)), 0);

    const timeNo = Date.now().toString().slice(-4) + '-' + Math.floor(100 + Math.random() * 900);
    const newKotNo = `KOT-${timeNo}`;

    // 1. Create KOT in PostgreSQL
    try {
      await kotService.createKOT({
        kotNo: newKotNo,
        tableId: assignedTableId,
        tableNo: targetTable?.no || String(assignedTableId),
        customerName: customerName || 'Walk-in',
        waiter: waiter || 'Staff',
        items: activeRows
      });
      console.log('✅ KOT created in PostgreSQL for assigned table');
    } catch (err) {
      console.warn('Error creating KOT:', err);
    }

    // 2. Update Table status in PostgreSQL
    try {
      await restaurantApi.patchTableStatus(assignedTableId, {
        order_state: 'Running',
        amount: finalAmt,
        waiter: waiter || 'Staff',
        customer: customerName || 'Walk-in'
      });
    } catch (err) {}

    toast(`Table T${targetTable?.no || assignedTableId} assigned successfully!`);
    navigate('/restaurant/display-table');
  };

  const handleSaveAndPrint = async () => {
    const activeRows = rows.filter(r => (r.itemName || r.name || '') !== '');
    const finalAmt = activeRows.reduce((sum, r) => sum + (r.qty * (r.unitPrice || r.price || 0)), 0);
    const targetTableId = assignedTableId || routedTable?.id || preselectedTableId;
    const targetTableNo = preselectedTableNumber || routedTable?.no;

    const timeNo = Date.now().toString().slice(-4) + '-' + Math.floor(100 + Math.random() * 900);
    const newKotNo = `KOT-${timeNo}`;

    // 1. Create KOT in PostgreSQL if items exist
    if (activeRows.length > 0) {
      try {
        await kotService.createKOT({
          kotNo: newKotNo,
          tableId: targetTableId || 1,
          tableNo: targetTableNo || '1',
          customerName: customerName || 'Walk-in',
          waiter: waiter || 'Staff',
          items: activeRows
        });
      } catch (err) {}
    }

    // 2. Update Table status in PostgreSQL
    if (targetTableId) {
      try {
        await restaurantApi.patchTableStatus(targetTableId, {
          order_state: activeRows.length > 0 ? 'Running' : 'Blank',
          amount: finalAmt,
          waiter: waiter || 'Staff',
          customer: customerName || 'Walk-in'
        });
      } catch (err) {}
    }

    toast(`Saved and printed KOT for Table T${targetTableNo || '?'}.`);
    navigate('/restaurant/display-table');
  };

  const handleDirectComplete = async () => {
    const resolvedId = assignedTableId || routedTable?.id || null;
    const activeRows = rows.filter(r => (r.itemName || r.name || '') !== '');
    setIsSettling(true);

    try {
      const orderRes = await orderService.createOrder({
        tableId: resolvedId || 1,
        tableNo: preselectedTableNumber || routedTable?.no || '1',
        customerName: customerName || 'Walk-in',
        mobileNo: mobileNumber || '—',
        waiter: waiter || 'Staff',
        status: 'completed',
        items: activeRows
      });

      const createdOrderId = orderRes?.order?.order_id || orderRes?.data?.order_id || orderRes?.order?.id || orderRes?.data?.id;
      if (createdOrderId) {
        await orderService.processPayment({
          orderId: createdOrderId,
          paymentMethod: 'Cash',
          amount: netBill
        });
      }
      if (resolvedId) {
        try {
          await tableService.patchTableStatus(resolvedId, {
            status: 'Cleaning',
            amount: 0,
            customer: 'Walk-in',
            waiter: null
          });
        } catch (err) {}
        setTablesList(prev => prev.map(t =>
          t.id === resolvedId ? { ...t, status: 'Cleaning', amount: 0, cleanedAt: Date.now() } : t
        ));
      }
      toast(`${serviceType} order settled! Table T${preselectedTableNumber || resolvedId} status changed to Cleaning (Green).`);
    } catch (err) {
      console.warn('Error settling order in PostgreSQL:', err);
    } finally {
      setIsSettling(false);
      navigate('/restaurant/display-table');
    }
  };

  return (
    <BillingLayout showMenu={!isBillingDesk} isBillingDesk={isBillingDesk}>
      {!isBillingDesk && (
        <MenuPanel
          searchInputRef={searchInputRef}
          searchItem={searchItem}
          setSearchItem={setSearchItem}
          filteredGridItems={filteredGridItems}
          handleGridItemClick={handleGridItemClick}
          availableCategories={availableCategories}
          category={category}
          setCategory={setCategory}
          onPreviousBookingsClick={() => navigate('/restaurant/booking-list', { state: { fromPOS: true, tableId: assignedTableId, rows, waiter, customerName, mobileNumber, paxCount, remarks, serviceType } })}
          toast={toast}
          isBillingDesk={isBillingDesk}
        />
      )}
      <BillingPanel
        isBillingDesk={isBillingDesk}
        isFullWidth={isBillingDesk}
        serviceType={serviceType}
        setServiceType={setServiceType}
        assignedTableId={assignedTableId}
        setAssignedTableId={setAssignedTableId}
        tablesList={tablesList}
        routedTable={routedTable}
        customerName={customerName}
        setCustomerName={setCustomerName}
        mobileNumber={mobileNumber}
        setMobileNumber={setMobileNumber}
        paxCount={paxCount}
        setPaxCount={setPaxCount}
        paxAdults={paxAdults}
        setPaxAdults={setPaxAdults}
        paxChildren={paxChildren}
        setPaxChildren={setPaxChildren}
        remarks={remarks}
        setRemarks={setRemarks}
        waiter={waiter}
        setWaiter={setWaiter}
        captain={captain}
        isPaid={isPaid}
        setIsPaid={setIsPaid}
        paymentMode={paymentMode}
        setPaymentMode={setPaymentMode}
        rows={rows}
        setRows={setRows}
        allMenuItems={allMenuItems}
        handleGridKeyDown={handleGridKeyDown}
        handleRemoveRow={handleRemoveRow}
        updateRowField={updateRowField}
        handleVariantChange={handleVariantChange}
        handleAddEmptyRow={handleAddEmptyRow}
        INITIAL_ROWS={INITIAL_ROWS}
        showDiscountPanel={showDiscountPanel}
        setShowDiscountPanel={setShowDiscountPanel}
        discountLines={discountLines}
        setDiscountLines={setDiscountLines}
        updateDiscountLine={updateDiscountLine}
        removeDiscountLine={removeDiscountLine}
        addDiscountLine={addDiscountLine}
        totalDiscountAmt={totalDiscountAmt}
        totalBill={totalBill}
        netBill={netBill}
        handleConfirmBooking={handleConfirmBooking}
        handleSaveAndPrint={handleSaveAndPrint}
        handleDirectComplete={handleDirectComplete}
        handleAddKOT={handleAddKOT}
        generatedKotNo={generatedKotNo}
        gstin={gstin}
        setGstin={setGstin}
        customerSettings={customerSettings}
        setCustomerSettings={setCustomerSettings}
        isTableModalOpen={isTableModalOpen}
        setIsTableModalOpen={setIsTableModalOpen}
        isCustomerDrawerOpen={isCustomerDrawerOpen}
        setIsCustomerDrawerOpen={setIsCustomerDrawerOpen}
        isPaxModalOpen={isPaxModalOpen}
        setIsPaxModalOpen={setIsPaxModalOpen}
        isRemarksModalOpen={isRemarksModalOpen}
        setIsRemarksModalOpen={setIsRemarksModalOpen}
        isGstModalOpen={isGstModalOpen}
        setIsGstModalOpen={setIsGstModalOpen}
        isSettingsModalOpen={isSettingsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
        isClearModalOpen={isClearModalOpen}
        setIsClearModalOpen={setIsClearModalOpen}
        showVariantModal={showVariantModal}
        setShowVariantModal={setShowVariantModal}
        variantModalItem={variantModalItem}
        addOrUpdateItemRow={addOrUpdateItemRow}
        isSettling={isSettling}
        showKotPrintModal={showKotPrintModal}
        setShowKotPrintModal={setShowKotPrintModal}
        kotGroups={kotGroups}
        kotPayloads={kotPayloads}
        kotSuccessCallbackRef={kotSuccessCallbackRef}
        toast={toast}
      />
    </BillingLayout>
  );
};

export default POSBillingPage;
