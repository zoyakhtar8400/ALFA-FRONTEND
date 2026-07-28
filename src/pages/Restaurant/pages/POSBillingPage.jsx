import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../../../context/RestaurantContext';

// KOT Engine & Printer data
import { ALL_FOOD_ITEMS } from '../constants/printerData';
import { groupItemsByPrinter, generateKOTPayload } from '../services/kotEngine';

// Presentation splits & layout
import BillingLayout from '../components/pos/BillingLayout';
import MenuPanel from '../components/pos/MenuPanel';
import BillingPanel from '../components/pos/BillingPanel';

const loadUnifiedMenuItems = () => {
  const mergedMap = new Map();

  // 1. Default fallback from ALL_FOOD_ITEMS
  ALL_FOOD_ITEMS.forEach(item => {
    const key = item.name.trim().toLowerCase();
    mergedMap.set(key, {
      id: item.id,
      name: item.name,
      shortCode: String(item.id),
      category: (item.category || 'FOOD').toUpperCase(),
      foodType: item.isVeg === false ? 'Non-Veg' : 'Veg',
      isVeg: item.isVeg !== false,
      price: Number(item.price || 0),
      variants: item.variants || [],
      productionCategory: item.productionCategory || 'pc1',
      active: 'Yes',
      areaPrices: {}
    });
  });

  // 2. Load POS Master Menu Items (hms_pos_menu_items)
  try {
    const posItems = JSON.parse(localStorage.getItem('hms_pos_menu_items') || '[]');
    if (Array.isArray(posItems)) {
      posItems.forEach(item => {
        if (!item.name) return;
        const key = item.name.trim().toLowerCase();
        const existing = mergedMap.get(key) || {};
        const rawCat = (item.mainGroup || item.itemGroup || existing.category || 'FOOD').toUpperCase();
        const isVeg = item.category === 'Veg' || item.category === 'VEG' || existing.isVeg !== false;
        mergedMap.set(key, {
          id: item.id || existing.id || Date.now(),
          name: item.name,
          shortCode: item.dispCode || item.shortCode || existing.shortCode || String(item.id || ''),
          category: rawCat.includes('BANQUET') ? 'BANQUET' : (rawCat.includes('BEVERAGE') ? 'BEVERAGE' : rawCat),
          foodType: item.category || (isVeg ? 'Veg' : 'Non-Veg'),
          isVeg,
          price: Number(item.price || existing.price || 0),
          variants: existing.variants || [],
          productionCategory: existing.productionCategory || 'pc1',
          active: item.status === 'Inactive' || item.active === 'No' ? 'No' : 'Yes',
          areaPrices: existing.areaPrices || {}
        });
      });
    }
  } catch (e) {
    console.error('Error reading hms_pos_menu_items', e);
  }

  // 3. Load Common Settings Menu Items (alfa_menu_items) - HIGHEST PRIORITY
  try {
    const rawSetting = localStorage.getItem('alfa_menu_items');
    let settingItems = [];
    if (rawSetting) {
      settingItems = JSON.parse(rawSetting);
    } else {
      settingItems = [
        { id: 101, name: 'CHICKEN TANDOORI', shortCode: '101', category: 'FOOD', foodType: 'Non-Veg', price: '280.00', active: 'Yes', areaPrices: { 'Restaurant Dining': '280.00', 'Rooftop': '320.00' } },
        { id: 102, name: 'PANEER TIKKA', shortCode: '102', category: 'FOOD', foodType: 'Veg', price: '180.00', active: 'Yes', areaPrices: { 'Restaurant Dining': '180.00', 'Rooftop': '210.00' } },
        { id: 103, name: 'DAL MAKHANI', shortCode: '103', category: 'FOOD', foodType: 'Veg', price: '160.00', active: 'Yes', areaPrices: { 'Restaurant Dining': '160.00', 'Rooftop': '190.00' } },
        { id: 104, name: 'PANEER BUTTER MASALA', shortCode: '104', category: 'FOOD', foodType: 'Veg', price: '260.00', active: 'Yes', areaPrices: { 'Restaurant Dining': '260.00', 'Rooftop': '300.00' } },
        { id: 105, name: 'COLD DRINK (500ML)', shortCode: '105', category: 'BEVERAGE', foodType: 'Veg', price: '70.00', active: 'Yes', areaPrices: { 'Restaurant Dining': '70.00', 'Rooftop': '80.00' } }
      ];
      try { localStorage.setItem('alfa_menu_items', JSON.stringify(settingItems)); } catch (e) {}
    }

    if (Array.isArray(settingItems)) {
      settingItems.forEach(item => {
        if (!item.name) return;
        const key = item.name.trim().toLowerCase();
        const existing = mergedMap.get(key) || {};
        const isVeg = item.foodType ? item.foodType === 'Veg' : (existing.isVeg !== false);
        mergedMap.set(key, {
          id: item.id || existing.id || Date.now(),
          name: item.name,
          shortCode: item.shortCode || item.dispCode || existing.shortCode || String(item.id || ''),
          category: (item.category || existing.category || 'FOOD').toUpperCase(),
          foodType: item.foodType || (isVeg ? 'Veg' : 'Non-Veg'),
          isVeg,
          price: Number(item.price || existing.price || 0),
          variants: existing.variants || [],
          productionCategory: existing.productionCategory || 'pc1',
          active: item.active === 'No' ? 'No' : 'Yes',
          areaPrices: item.areaPrices || existing.areaPrices || {}
        });
      });
    }
  } catch (e) {
    console.error('Error reading alfa_menu_items', e);
  }

  return Array.from(mergedMap.values());
};

const INITIAL_ROWS = [
  { lineId: 'initial-row-1', itemId: '', itemName: '', name: '', variantId: '', variantName: '', variant: '', remark: '', qty: 1, unitPrice: 0, price: 0, rate: 0, total: 0 }
];

const POSBillingPage = ({ isBillingDesk = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = React.useRef(null);

  // Dynamic Unified Menu Items State from Common Settings & POS Masters
  const [allMenuItems, setAllMenuItems] = useState(loadUnifiedMenuItems);

  useEffect(() => {
    const handleStorageChange = () => {
      setAllMenuItems(loadUnifiedMenuItems());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const availableCategories = useMemo(() => {
    const activeItems = allMenuItems.filter(i => i.active !== 'No');
    const catSet = new Set(activeItems.map(i => i.category || 'FOOD'));
    if (catSet.size === 0) return ['FOOD', 'BANQUET'];
    const cats = Array.from(catSet);
    cats.sort((a, b) => (a === 'FOOD' ? -1 : b === 'FOOD' ? 1 : a.localeCompare(b)));
    return cats;
  }, [allMenuItems]);

  // Check if opened from "Book Table" button in new booking flow
  const isNewBooking = location.state?.isNewBooking || location.state?.newBooking || false;
  const preselectedTableId = location.state?.tableId || null;
  const preselectedTableNumber = location.state?.tableNumber || null;

  // Retrieve routed parameters
  const routedTable = location.state?.table || null;

  // Tables List for Assignment
  const { tables: tablesList, setTables: setTablesList } = useRestaurant();

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
  const [customerName, setCustomerName] = useState(routedTable?.customer || '');
  const [mobileNumber, setMobileNumber] = useState(routedTable?.mobile || '');
  const [paxCount, setPaxCount] = useState(routedTable?.seats || 1);
  const [paxAdults, setPaxAdults] = useState(routedTable?.seats || 1);
  const [paxChildren, setPaxChildren] = useState(0);
  const [waiter, setWaiter] = useState(routedTable?.waiter || '');
  const [captain, setCaptain] = useState(routedTable?.captain || '');
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
  const [assignedTableId, setAssignedTableId] = useState(preselectedTableId || routedTable?.id || '');

  // KOT Print Modal states (multi-printer routing)
  const [showKotPrintModal, setShowKotPrintModal] = useState(false);
  const [kotGroups, setKotGroups] = useState([]);
  const [kotPayloads, setKotPayloads] = useState([]);
  const kotSuccessCallbackRef = React.useRef(null);

  // Table rows for right-side billing
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [isSettling, setIsSettling] = useState(false);

  // Sync items when opened from ViewKOT or TableCard
  useEffect(() => {
    const passedRows = location.state?.rows || location.state?.kot?.items;
    if (passedRows && Array.isArray(passedRows) && passedRows.length > 0) {
      setRows(passedRows.map((item, idx) => ({
        lineId: item.lineId || `kot-item-${idx}`,
        itemId: item.itemId || item.id || idx,
        itemName: item.itemName || item.name || '',
        name: item.itemName || item.name || '',
        variantId: item.variantId || '',
        variantName: item.variantName || item.variant || '',
        variant: item.variantName || item.variant || '',
        qty: item.qty || 1,
        unitPrice: item.unitPrice || item.price || item.rate || 0,
        price: item.unitPrice || item.price || item.rate || 0,
        rate: item.unitPrice || item.price || item.rate || 0,
        total: item.total || ((item.qty || 1) * (item.unitPrice || item.price || 0)),
        remark: item.remark || item.remarks || ''
      })));
    }
  }, [location.state]);

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

  // Load existing items if editing
  useEffect(() => {
    if (!isNewBooking && routedTable) {
      if (location.state?.orderRows) {
        setRows(location.state.orderRows);
      } else if (routedTable.id === 2) {
        setRows([
          { lineId: 'row-2-1', itemId: 121, itemName: 'CLUB SANDWICH', name: 'CLUB SANDWICH', variantId: '', variantName: '', variant: '', remark: 'Medium Spicy', qty: 1, unitPrice: 180, price: 180, rate: 180, total: 180 },
          { lineId: 'row-2-2', itemId: 123, itemName: 'COLD COFFEE', name: 'COLD COFFEE', variantId: '', variantName: '', variant: '', remark: 'With Ice Cream', qty: 2, unitPrice: 120, price: 120, rate: 120, total: 240 },
          { lineId: 'row-2-3', itemId: 104, itemName: 'GARLIC NAAN', name: 'GARLIC NAAN', variantId: '', variantName: '', variant: '', remark: '', qty: 1, unitPrice: 100, price: 100, rate: 100, total: 100 }
        ]);
      } else if (routedTable.id === 3) {
        setRows([
          { lineId: 'row-3-1', itemId: 109, itemName: 'MOCKTAILS', name: 'MOCKTAILS', variantId: '', variantName: '', variant: '', remark: '', qty: 3, unitPrice: 150, price: 150, rate: 150, total: 450 },
          { lineId: 'row-3-2', itemId: 116, itemName: 'SPRING ROLLS', name: 'SPRING ROLLS', variantId: '', variantName: '', variant: '', remark: 'Crispy', qty: 2, unitPrice: 180, price: 180, rate: 180, total: 360 }
        ]);
      }
    }
  }, [location.state, routedTable, isNewBooking]);

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
      return activeItems.filter(item => item.category === category);
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
    const rawPrice = variant ? variant.price : (foodItem.price || 0);
    const price = getAreaAdjustedPrice(foodItem, rawPrice);
    const lineId = crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).substr(2, 5));

    setRows(prev => {
      const emptyIndex = prev.findIndex(r => !r.itemName && !r.name);
      const existingIndex = prev.findIndex(r =>
        (r.itemId === foodItem.id || r.itemName === foodItem.name || r.name === foodItem.name) &&
        (r.variantId === variantId)
      );

      if (existingIndex !== -1) {
        return prev.map((r, i) => {
          if (i === existingIndex) {
            const nextQty = r.qty + 1;
            return { ...r, qty: nextQty, total: nextQty * r.unitPrice };
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
              itemName: foodItem.name,
              name: foodItem.name,
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
            itemName: foodItem.name,
            name: foodItem.name,
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

  const handleAddKOT = () => {
    const activeRows = rows.filter(r => r.name || r.itemName);
    if (activeRows.length === 0) {
      toast('Please add at least one item before generating KOT.');
      return;
    }
    if (!waiter) {
      toast('Please select a waiter.');
      return;
    }

    const kotSeq = String(Date.now()).slice(-4);
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

  const handleConfirmBooking = () => {
    if (!assignedTableId) {
      alert("Please select a table to assign!");
      return;
    }
    const targetTable = tablesList.find(t => t.id === assignedTableId);
    const activeRows = rows.filter(r => r.name !== '');
    const finalAmt = activeRows.reduce((sum, r) => sum + (r.qty * r.price), 0);

    const updatedTable = {
      ...targetTable,
      status: 'Running',
      customer: customerName || 'Rahul Sharma',
      mobile: mobileNumber || '9876543210',
      waiter: waiter || 'Rakesh',
      captain: captain || 'Amit',
      remarks: remarks || '',
      amount: finalAmt,
      openedAt: Date.now() - 5 * 60 * 1000,
      kots: [{ id: generatedKotNo, amount: finalAmt, items: activeRows }],
      kotCount: 1
    };

    toast(`Table T${targetTable.no} assigned successfully!`);
    navigate('/restaurant/display-table', {
      state: {
        updatedTable,
        updatedRows: activeRows
      }
    });
  };

  const handleSaveAndPrint = () => {
    const activeRows = rows.filter(r => (r.itemName || r.name || '') !== '');
    const finalAmt = activeRows.reduce((sum, r) => sum + (r.qty * (r.unitPrice || r.price || 0)), 0);
    const targetTableId = assignedTableId || routedTable?.id || preselectedTableId;
    const targetTableNo = preselectedTableNumber || routedTable?.no;

    const resolvedTable = tablesList.find(t =>
      (targetTableId && String(t.id) === String(targetTableId)) ||
      (targetTableNo && String(t.no) === String(targetTableNo))
    ) || routedTable || {};

    const updatedTable = {
      ...resolvedTable,
      id: resolvedTable.id || targetTableId || 1,
      no: resolvedTable.no || targetTableNo || '1',
      amount: finalAmt,
      status: activeRows.length > 0 ? 'Running' : 'Blank',
      openedAt: resolvedTable.openedAt || Date.now()
    };

    setTablesList(prev => prev.map(t => {
      if (
        (updatedTable.id && String(t.id) === String(updatedTable.id)) ||
        (updatedTable.no && String(t.no) === String(updatedTable.no))
      ) {
        return { ...t, ...updatedTable };
      }
      return t;
    }));

    toast(`Saved and printed KOT for Table T${updatedTable.no || '?'}.`);
    navigate('/restaurant/display-table', {
      state: {
        updatedTable,
        updatedRows: activeRows
      }
    });
  };

  const handleDirectComplete = () => {
    const resolvedId = assignedTableId || routedTable?.id || null;
    setIsSettling(true);
    setTimeout(() => {
      setIsSettling(false);
      if (resolvedId) {
        setTablesList(prev => prev.map(t =>
          t.id === resolvedId ? { ...t, status: 'Paid', paidAt: Date.now() } : t
        ));
      }
      toast(`${serviceType} order settled successfully!`);
      navigate('/restaurant/display-table');
    }, 2000);
  };

  return (
    <BillingLayout showMenu={!isBillingDesk}>
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
        />
      )}
      <BillingPanel
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
