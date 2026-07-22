import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaSearch, FaTimes, FaPlus, FaCheck,
  FaUser, FaTag, FaCommentAlt, FaPrint, FaWindowClose, FaUtensils,
  FaMotorcycle, FaShoppingBag, FaChevronDown, FaChevronUp
} from 'react-icons/fa';
import { useRestaurant } from '../../../context/RestaurantContext';
import { INITIAL_TABLES } from '../constants/mockData';

// KOT Engine & Printer data
import { ALL_FOOD_ITEMS } from '../constants/printerData';
import { groupItemsByPrinter, generateKOTPayload } from '../services/kotEngine';

// Modular POS component splits
import POSHeader from '../components/pos/POSHeader';
import CustomerDrawer from '../components/pos/CustomerDrawer';
import TableSelector from '../components/pos/TableSelector';
import PaxModal from '../components/pos/PaxModal';
import RemarksModal from '../components/pos/RemarksModal';
import GSTModal from '../components/pos/GSTModal';
import CustomerSettingsModal from '../components/pos/CustomerSettingsModal';
import POSPaymentBar from '../components/pos/POSPaymentBar';
import POSSummaryBar from '../components/pos/POSSummaryBar';
import POSActionButtons from '../components/pos/POSActionButtons';
import POSFooterStatus from '../components/pos/POSFooterStatus';
import ClearConfirmModal from '../components/pos/ClearConfirmModal';
import KOTPrintModal from '../components/pos/KOTPrintModal';

// ALL_FOOD_ITEMS is now imported from printerData.js — each item has productionCategory

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
      // Default fallback matching Common Settings (MenuList.jsx)
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

const POSBillingPage = () => {
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

  // Retrieve routed parameters — blank table uses preselectedTableId, running table has full table object
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
  // Use ref (not state) so the callback never gets treated as a React updater function
  const kotSuccessCallbackRef = React.useRef(null);

  // Table rows for right-side billing
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [isSettling, setIsSettling] = useState(false);
  const [variantIndex, setVariantIndex] = useState(0);

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
      // Check Alt key combos
      if (e.altKey) {
        const key = e.key.toLowerCase();
        switch (key) {
          case '1': // Alt + 1 -> FOOD category
            e.preventDefault();
            setCategory('FOOD');
            toast('Category: FOOD');
            break;
          case '2': // Alt + 2 -> BANQUET category
            e.preventDefault();
            setCategory('BANQUET');
            toast('Category: BANQUET');
            break;
          case 'c': // Alt + C -> Focus Cart Table
            e.preventDefault();
            focusCartTable();
            break;
          case 't': // Alt + T -> Open Table Selector
            e.preventDefault();
            setIsTableModalOpen(true);
            break;
          case 'm': // Alt + M -> Open Customer Drawer
            e.preventDefault();
            setIsCustomerDrawerOpen(true);
            break;
          case 'p': // Alt + P -> Open PAX Configurator
            e.preventDefault();
            setIsPaxModalOpen(true);
            break;
          case 'r': // Alt + R -> Open Kitchen Remarks
            e.preventDefault();
            setIsRemarksModalOpen(true);
            break;
          case 'g': // Alt + G -> Open GST Configuration
            e.preventDefault();
            setIsGstModalOpen(true);
            break;
          case 'a': // Alt + A -> Add Item Row
            e.preventDefault();
            handleAddEmptyRow();
            break;
          case 'd': // Alt + D -> Clear Cart
            e.preventDefault();
            setIsClearModalOpen(true);
            break;
          case 'v': // Alt + V -> Toggle Service Type
            e.preventDefault();
            setServiceType(prev => {
              const modes = ['Dine In', 'Take Away', 'Delivery'];
              const next = (modes.indexOf(prev) + 1) % modes.length;
              toast(`Service Type: ${modes[next]}`);
              return modes[next];
            });
            break;
          case 'y': // Alt + Y -> Toggle Payment Mode
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
              const lastRow = prev[lastIdx];
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

  // Toast notifier
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

  // Filter items matching name, category, or shortCode
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

  // Click handler to select an item from food grid
  const handleGridItemClick = (foodItem) => {
    if (!foodItem.variants || foodItem.variants.length === 0) {
      // Smart Variant Logic: 0 variants -> Add directly
      addOrUpdateItemRow(foodItem, null);
    } else if (foodItem.variants.length === 1) {
      // Smart Variant Logic: 1 variant -> Add directly with default variant
      addOrUpdateItemRow(foodItem, foodItem.variants[0]);
    } else {
      // Smart Variant Logic: >1 variants -> Open variant modal
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

  // Helper to add or update row
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
              name: foodItem.name, // compatibility
              variantId,
              variantName,
              variant: variantName, // compatibility
              qty: 1,
              unitPrice: price,
              price: price, // compatibility
              rate: price, // compatibility
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
            name: foodItem.name, // compatibility
            variantId,
            variantName,
            variant: variantName, // compatibility
            qty: 1,
            unitPrice: price,
            price: price, // compatibility
            rate: price, // compatibility
            total: price,
            remark: ''
          }
        ];
      }
    });
  };

  // Automatically recalculate cart prices based on selected service area / outlet mode
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
            updated.name = match.name; // compatibility

            let resolvedPrice = Number(match.price || 0);

            // Area Price Resolution
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
            variant: variantObj.name, // compatibility
            unitPrice: price,
            price: price, // compatibility
            rate: price, // compatibility
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

  // ── Discount state ────────────────────────────────────────────────────────
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

  // Compute total discount amount from all lines
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
  // ─────────────────────────────────────────────────────────────────────────


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

    // Generate KOT number
    const kotSeq = String(Date.now()).slice(-4);
    const newKotNo = `KOT-${kotSeq}`;
    setGeneratedKotNo(newKotNo);
    setKotCreated(true);

    // Resolve correct table — prefer assignedTableId (always set), fallback to routedTable
    const resolvedTableId = assignedTableId || routedTable?.id || null;
    const resolvedTable = tablesList.find(t => t.id === resolvedTableId) || routedTable;
    const tableNo = resolvedTable?.no || resolvedTableId || '??';

    // Group items by production category → printer using KOT Engine
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

    // Store callback in ref so it's never stale and never treated as React updater
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
      openedAt: Date.now() - 5 * 60 * 1000, // 5 minutes ago to match duration
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

  const handleCheckoutSettle = () => {
    if (totalBill === 0) {
      toast("Cannot settle an empty bill.");
      return;
    }
    if (!waiter) {
      toast('Please select a waiter before settlement.');
      return;
    }
    const resolvedId = assignedTableId || routedTable?.id || null;
    setIsSettling(true);
    setTimeout(() => {
      setIsSettling(false);
      if (resolvedId) {
        setTablesList(prev => prev.map(t =>
          t.id === resolvedId ? { ...t, status: 'Paid', paidAt: Date.now() } : t
        ));
      }
      navigate('/restaurant/display-table');
    }, 2500);
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

  const handleCancel = () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this table? This action cannot be undone.");
    if (confirmCancel) {
      const resolvedId = assignedTableId || routedTable?.id || null;
      navigate('/restaurant/display-table', {
        state: {
          settledTableId: resolvedId
        }
      });
    }
  };

  const availableTables = useMemo(() => {
    return tablesList.filter(t => t.status === 'Blank' || t.status === 'Cleaning');
  }, [tablesList]);

  return (
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', background: '#f8fafc', overflow: 'hidden'
    }}>

      {/* LEFT SECTION (Categories, Grid & Searches) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: '#fff', borderRight: '1px solid #cbd5e1' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #cbd5e1', background: '#fff' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0e7490', margin: 0, letterSpacing: '0.5px' }}>
            RESTAURANT POS
          </h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/restaurant/booking-list', { state: { fromPOS: true, tableId: assignedTableId, rows, waiter, customerName, mobileNumber, paxCount, remarks, serviceType } })}
              style={{ padding: '7px 14px', borderRadius: '6px', border: '1.5px solid #0e7490', background: '#ecfeff', color: '#0e7490', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#0e7490'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ecfeff'; e.currentTarget.style.color = '#0e7490'; }}
            >
              &#128203; Previous Bookings
            </button>
            <div style={{ display: 'flex', border: '1.5px solid #0e7490', borderRadius: '6px', overflow: 'hidden', background: '#fff' }}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="SEARCH / ITEM ID (ENTER TO ADD)"
                value={searchItem}
                onChange={e => setSearchItem(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (filteredGridItems.length > 0) {
                      handleGridItemClick(filteredGridItems[0]);
                      setSearchItem('');
                      toast(`Added: ${filteredGridItems[0].name}`);
                    }
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    const firstGridBtn = document.querySelector('.grid-item-btn[data-index="0"]');
                    if (firstGridBtn) firstGridBtn.focus();
                  }
                }}
                style={{ border: 'none', padding: '8px 12px', fontSize: '0.8rem', outline: 'none', width: '160px' }}
              />
              <button style={{ border: 'none', background: '#0e7490', color: '#fff', padding: '8px 12px', cursor: 'pointer' }}><FaSearch size={12} /></button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ width: '180px', background: '#fff', borderRight: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', paddingTop: '20px' }}>
            {availableCategories.map(cat => {
              const isSelected = category === cat;
              return (
                <button key={cat} onClick={() => setCategory(cat)}
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCategory(cat); } }}
                  onFocus={e => { if (!isSelected) { e.currentTarget.style.background = '#e0f2fe'; e.currentTarget.style.color = '#0e7490'; } e.currentTarget.style.outline = 'none'; e.currentTarget.style.boxShadow = '0 0 0 2px rgba(14,116,144,0.4)'; }}
                  onBlur={e => { if (!isSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#475569'; } e.currentTarget.style.boxShadow = 'none'; }}
                  style={{
                    width: '100%', padding: '16px 20px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 700, border: 'none',
                    background: isSelected ? '#f1f5f9' : 'transparent', color: isSelected ? '#0e7490' : '#475569', cursor: 'pointer',
                    borderLeft: isSelected ? '4px solid #0e7490' : '4px solid transparent',
                    transition: 'all 150ms ease-in-out'
                  }}
                >{cat}</button>
              );
            })}
          </div>

          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#fff' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
              {filteredGridItems.map((item, idx) => (
                <button key={item.id || item.name}
                  className="grid-item-btn"
                  data-index={idx}
                  onClick={() => handleGridItemClick(item)}
                  onKeyDown={e => {
                    const maxIndex = filteredGridItems.length - 1;
                    let targetIndex = idx;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      targetIndex = Math.min(maxIndex, idx + 4);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      targetIndex = Math.max(0, idx - 4);
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      targetIndex = Math.min(maxIndex, idx + 1);
                    } else if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      targetIndex = Math.max(0, idx - 1);
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      if (searchInputRef.current) {
                        searchInputRef.current.focus();
                        searchInputRef.current.select();
                      }
                    }
                    if (targetIndex !== idx) {
                      const targetBtn = document.querySelector(`.grid-item-btn[data-index="${targetIndex}"]`);
                      if (targetBtn) targetBtn.focus();
                    }
                  }}
                  style={{
                    padding: '20px 12px', borderRadius: '8px',
                    border: '1.5px solid #0e7490',
                    borderLeft: item.isVeg === false ? '4px solid #DC2626' : '4px solid #16A34A',
                    background: '#fff', color: '#0e7490',
                    fontSize: '0.78rem', fontWeight: 700, textAlign: 'center', cursor: 'pointer', minHeight: '80px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 120ms ease-in-out', textTransform: 'uppercase'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#0e7490'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(14,116,144,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#0e7490'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                  onFocus={e => { e.currentTarget.style.background = '#0e7490'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,116,144,0.35), 0 4px 12px rgba(14,116,144,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.outline = 'none'; }}
                  onBlur={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#0e7490'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                >{item.name}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SECTION (Billing ledger details panel) */}
      <div style={{ width: '540px', height: '100%', background: '#f8fafc', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #cbd5e1' }}>
        <POSHeader
          serviceType={serviceType}
          setServiceType={setServiceType}
          assignedTableNo={assignedTableId ? tablesList.find(t => t.id === assignedTableId)?.no : routedTable?.no}
          customerName={customerName}
          paxCount={paxCount}
          hasRemarks={!!remarks}
          waiter={waiter}
          onWaiterChange={useCallback((val) => setWaiter(val), [])}
          isPaid={isPaid}
          onTableClick={useCallback(() => setIsTableModalOpen(true), [])}
          onCustomerClick={useCallback(() => setIsCustomerDrawerOpen(true), [])}
          onPaxClick={useCallback(() => setIsPaxModalOpen(true), [])}
          onRemarksClick={useCallback(() => setIsRemarksModalOpen(true), [])}
        />

        {/* Interactive billing item rows ledger */}
        <div style={{ padding: '8px', flex: 1, overflowY: 'auto' }}>
          <table className="custom-table-element" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0e7490', color: '#fff', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '8px 4px', textAlign: 'center', width: '30px' }}></th>
                <th style={{ padding: '8px 6px', textAlign: 'left' }}>Items</th>
                <th style={{ padding: '8px 6px', textAlign: 'left', width: '110px' }}>Remark</th>
                <th style={{ padding: '8px 4px', textAlign: 'center', width: '50px' }}>Qty</th>
                <th style={{ padding: '8px 4px', textAlign: 'center', width: '60px' }}>Price</th>
                <th style={{ padding: '8px 6px', textAlign: 'right', width: '70px' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => {
                const matchItem = allMenuItems.find(f => f.id === row.itemId || f.name === row.itemName || f.name === row.name);
                return (
                  <tr key={row.lineId || index} style={{ borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
                    <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                      <button
                        type="button"
                        data-row={index}
                        data-col={0}
                        onKeyDown={e => handleGridKeyDown(e, index, 0)}
                        onClick={() => handleRemoveRow(index)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <FaTimes size={13} />
                      </button>
                    </td>
                    <td style={{ padding: '6px' }}>
                      <select
                        data-row={index}
                        data-col={1}
                        onKeyDown={e => handleGridKeyDown(e, index, 1)}
                        value={row.itemName || row.name || ''}
                        onChange={e => updateRowField(index, 'itemName', e.target.value)}
                        style={{ width: '100%', padding: '6px 4px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: 600 }}
                      >
                        <option value="">SELECT ITEM...</option>
                        {allMenuItems.filter(item => item.active !== 'No').map(item => (
                          <option key={item.id || item.name} value={item.name}>{item.name}</option>
                        ))}
                      </select>

                      {matchItem?.variants && matchItem.variants.length > 0 && (
                        <div style={{ display: 'flex', gap: '10px', marginTop: '4px', fontSize: '0.7rem', flexWrap: 'wrap' }}>
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
                    <td style={{ padding: '6px' }}>
                      <input
                        type="text"
                        data-row={index}
                        data-col={2}
                        onKeyDown={e => handleGridKeyDown(e, index, 2)}
                        value={row.remark || ''}
                        onChange={e => updateRowField(index, 'remark', e.target.value)}
                        placeholder="REMARKS"
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.74rem' }}
                      />
                    </td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>
                      <input
                        type="number"
                        min="1"
                        data-row={index}
                        data-col={3}
                        onKeyDown={e => handleGridKeyDown(e, index, 3)}
                        value={row.qty}
                        onChange={e => updateRowField(index, 'qty', parseInt(e.target.value) || 1)}
                        style={{ width: '42px', padding: '6px 2px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.74rem', textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: '6px', textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        data-row={index}
                        data-col={4}
                        onKeyDown={e => handleGridKeyDown(e, index, 4)}
                        value={row.unitPrice || row.price || 0}
                        onChange={e => updateRowField(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        style={{ width: '52px', padding: '6px 2px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.74rem', textAlign: 'center' }}
                      />
                    </td>
                    <td style={{ padding: '6px 8px', textAlign: 'right', fontSize: '0.78rem', fontWeight: 700 }}>
                      {(row.qty * (row.unitPrice || row.price || 0)).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={handleAddEmptyRow}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px dashed #0e7490', background: 'transparent', color: '#0e7490', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FaPlus size={10} /> Add Item Row
            </button>
            <button type="button" onClick={useCallback(() => setIsClearModalOpen(true), [])}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'transparent', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Clear Cart
            </button>
            <button type="button" onClick={useCallback(() => setIsGstModalOpen(true), [])}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'transparent', color: '#0e7490', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              GSTIN
            </button>
            <button type="button" onClick={useCallback(() => setIsSettingsModalOpen(true), [])}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'transparent', color: '#64748b', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
            >
              Account settings
            </button>
          </div>
        </div>

        {/* ── Discount Panel ───────────────────────────────────────── */}
        <div style={{ padding: '0 8px 6px' }}>
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
              borderRadius: '10px', padding: '12px 14px'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#c2410c', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🏷️ Discount
                </span>
                <button
                  type="button"
                  onClick={() => { setShowDiscountPanel(false); setDiscountLines([{ id: 1, type: 'Percentage', value: '', reason: '' }]); }}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}
                >
                  ✕
                </button>
              </div>

              {/* Discount lines */}
              {discountLines.map((line, idx) => (
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
                          cursor: 'pointer', transition: 'all 0.1s'
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
        {/* ─────────────────────────────────────────────────────────────── */}

        {/* Payment and Total section */}

        <POSPaymentBar
          activeMode={paymentMode}
          onSelectMode={setPaymentMode}
          isPaid={isPaid}
          onChangeIsPaid={setIsPaid}
        />

        <POSSummaryBar
          totalBill={netBill}
          discountAmt={totalDiscountAmt}
          originalBill={totalBill}
          onSplitClick={useCallback(() => toast('Bill split modal triggered'), [])}
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
      </div>

      {/* Dynamic Overlay Dialogs & Sidebar Drawers */}
      <TableSelector
        isOpen={isTableModalOpen}
        onClose={useCallback(() => setIsTableModalOpen(false), [])}
        tablesList={tablesList}
        currentTableId={assignedTableId}
        onSelectTable={useCallback((table) => {
          setAssignedTableId(table.id);
          toast(`Assigned to Table ${table.no}`);
        }, [tablesList])}
      />

      <CustomerDrawer
        isOpen={isCustomerDrawerOpen}
        onClose={useCallback(() => setIsCustomerDrawerOpen(false), [])}
        currentCustomer={{ phone: mobileNumber, name: customerName }}
        onSaveCustomer={useCallback((cust) => {
          setCustomerName(cust.name);
          setMobileNumber(cust.phone);
          toast(`Linked customer: ${cust.name}`);
        }, [])}
      />

      <PaxModal
        isOpen={isPaxModalOpen}
        onClose={useCallback(() => setIsPaxModalOpen(false), [])}
        adults={paxAdults}
        children={paxChildren}
        onSavePax={useCallback((a, c) => {
          setPaxAdults(a);
          setPaxChildren(c);
          setPaxCount(a + c);
          toast(`Covers set: ${a} Adults, ${c} Children`);
        }, [])}
      />

      <RemarksModal
        isOpen={isRemarksModalOpen}
        onClose={useCallback(() => setIsRemarksModalOpen(false), [])}
        remarks={remarks}
        onSaveRemarks={useCallback((text) => {
          setRemarks(text);
          toast('Kitchen instructions saved.');
        }, [])}
      />

      <GSTModal
        isOpen={isGstModalOpen}
        onClose={useCallback(() => setIsGstModalOpen(false), [])}
        gstin={gstin}
        onSaveGSTIN={useCallback((val) => {
          setGstin(val);
          toast(`GSTIN set to: ${val}`);
        }, [])}
      />

      <CustomerSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={useCallback(() => setIsSettingsModalOpen(false), [])}
        settings={customerSettings}
        onSaveSettings={useCallback((settingsObj) => {
          setCustomerSettings(settingsObj);
          toast('Customer accounts configuration saved.');
        }, [])}
      />

      <ClearConfirmModal
        isOpen={isClearModalOpen}
        onClose={useCallback(() => setIsClearModalOpen(false), [])}
        onConfirm={useCallback(() => {
          setRows(INITIAL_ROWS);
          toast('Draft cart cleared.');
        }, [])}
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
                    toast(`Added: ${variantModalItem.name} (${v.name})`);
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
        onClose={() => setShowKotPrintModal(false)}
        kotGroups={kotGroups}
        payloads={kotPayloads}
        kotNo={generatedKotNo}
        tableNo={routedTable?.no || assignedTableId || '?'}
        onKOTSuccess={() => kotSuccessCallbackRef.current && kotSuccessCallbackRef.current()}
      />
    </div>
  );
};

export default POSBillingPage;
