import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRestaurant } from '../../../context/RestaurantContext';
import { menuService } from '../../../services/menuService';
import { kotService } from '../../../services/kotService';
import { orderService } from '../../../services/orderService';
import { tableService } from '../../../services/tableService';
import { restaurantApi } from '../../../api/restaurantApi';
import apiClient from '../../../services/apiClient';

// KOT Engine & Printer data
import { groupItemsByPrinter, generateKOTPayload } from '../services/kotEngine';

// Presentation splits & layout
import BillingLayout from '../components/pos/BillingLayout';
import MenuPanel from '../components/pos/MenuPanel';
import BillingPanel from '../components/pos/BillingPanel';
import { printTaxInvoice, printKitchenKOT } from '../utils/printInvoice';
import QuickPaymentModal from '../components/QuickPaymentModal';
import InvoicePreviewModal from '../components/InvoicePreviewModal';
import posApi from '../../../api/posApi';

const aggregateItems = (items) => {
  if (!items || !Array.isArray(items)) return [];
  const map = new Map();
  items.forEach(item => {
    const name = (item.name || item.itemName || item.item_name || '').trim().toLowerCase();
    const variant = (item.variantName || item.alternative_title || '').trim().toLowerCase();
    const price = Number(item.price || item.rate || item.unitPrice || 0);
    const key = `${name}-${variant}-${price}`;
    if (map.has(key)) {
      const existing = map.get(key);
      const addedQty = Number(item.qty || item.quantity || 1);
      existing.qty = Number(existing.qty || existing.quantity || 1) + addedQty;
      existing.quantity = existing.qty;
      existing.printedQty = existing.qty;
      existing.total = existing.qty * Number(existing.price || existing.rate || existing.unitPrice || 0);
      existing.amount = existing.total;
    } else {
      const qty = Number(item.qty || item.quantity || 1);
      map.set(key, { ...item, qty, quantity: qty, printedQty: qty });
    }
  });
  return Array.from(map.values());
};

const INITIAL_ROWS = [];

const POSBillingPage = ({ isBillingDesk = false }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchInputRef = React.useRef(null);

  const { activeStoreId, activeOutletId, allOutlets } = useRestaurant();
  const currentOutlet = (allOutlets || []).find(o => String(o.id) === String(activeOutletId) || String(o.store_id) === String(activeStoreId));
  const currentOutletName = currentOutlet?.name || currentOutlet?.store_name || localStorage.getItem('active_outlet_name') || 'MAIN RESTAURANT';

  const [loadingMenu, setLoadingMenu] = useState(true);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [dbPrinters, setDbPrinters] = useState([]);
  const [taxLines, setTaxLines] = useState([]);

  useEffect(() => {
    posApi.getItemTaxCategories().then(res => {
      const taxes = Array.isArray(res?.data) ? res.data : [];
      setTaxLines(taxes.map(t => ({ name: t.name || 'Tax', rate: Number(t.percentage || 0) })));
    }).catch(() => setTaxLines([{ name: 'CGST', rate: 2.5 }, { name: 'SGST', rate: 2.5 }]));
  }, []);

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewHtmlContent, setPreviewHtmlContent] = useState('');
  const [previewInvoiceData, setPreviewInvoiceData] = useState(null);

  const toast = useCallback((msg) => {
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
  }, []);
  toast.error = (msg) => toast(msg);
  toast.success = (msg) => toast(msg);

  // Shared menu loader — used on mount AND when storage/focus events fire
  const loadRealMenu = useCallback(async () => {
    try {
      const [res, catRes, printRes] = await Promise.allSettled([
        apiClient.get('/menu', { params: { store_id: activeStoreId } }),
        apiClient.get('/production-categories', { params: { store_id: activeStoreId } }),
        apiClient.get('/printers', { params: { store_id: activeStoreId } })
      ]);

      if (catRes.status === 'fulfilled' && catRes.value) {
        setDbCategories(catRes.value.data || catRes.value || []);
      }
      if (printRes.status === 'fulfilled' && printRes.value) {
        setDbPrinters(printRes.value.data || printRes.value || []);
      }

      const menuVal = res.status === 'fulfilled' ? res.value : null;
      const rawItems = (
        menuVal?.data?.items ||
        menuVal?.items ||
        menuVal?.catalouge?.items ||
        menuVal?.data?.catalouge?.items ||
        (Array.isArray(menuVal?.data) && menuVal.data.length > 0 ? menuVal.data : null) ||
        (Array.isArray(menuVal) && menuVal.length > 0 ? menuVal : null) ||
        []
      );
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        console.log('✅ Loaded live PostgreSQL menu items:', rawItems);
        const mapped = rawItems.map(item => ({
          id: item.item_id || item.id,
          name: item.title || item.name || item.item_name || 'Item',
          shortCode: item.short_code || String(item.item_id || item.id || ''),
          kitchen_dept: item.kitchen_dept || item.kitchen_department_id || null,
          productionCategory: item.kitchen_dept || item.kitchen_department_id || null,
          category: (item.mpos_category && item.mpos_category.category_name)
            ? String(item.mpos_category.category_name).toUpperCase()
            : (item.category ? String(item.category).toUpperCase() : (item.category_name ? String(item.category_name).toUpperCase() : 'FOOD')),
          foodType: item.food_type === 2 ? 'Non-Veg' : 'Veg',
          isVeg: item.food_type !== 2,
          price: Number(item.sale_price || item.price || item.rate || 0),
          active: item.active === 0 ? 'No' : 'Yes',
          variants: item.variants || [],
          areaPrices: {},
          is_open_item: item.is_open_item || 0,
          open_price: item.open_price || 0
        }));
        setAllMenuItems(mapped);
      }
    } catch (err) {
      console.warn('Real menu loading error:', err);
      toast('⛔ Failed to load menu from database. Please check backend connection.');
    } finally {
      setLoadingMenu(false);
    }
  }, [toast, activeStoreId]);

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
  const isViewMode = location.state?.isViewMode || location.state?.isKotView || false;
  const preselectedTableId = location.state?.tableId || null;
  const preselectedTableNumber = location.state?.tableNumber || null;
  const [existingRows, setExistingRows] = useState(location.state?.updatedRows || location.state?.existingRows || []);

  // Tables List for Assignment
  const { tables: tablesList, setTables: setTablesList, refreshTables, orderItemsMap = {}, setOrderItemsMap } = useRestaurant();

  // Context persistence for Table / Order selection across page navigations and refreshes
  const savedContextRef = React.useRef(null);
  if (savedContextRef.current === null) {
    try {
      const saved = sessionStorage.getItem('alfa_selected_pos_table');
      if (saved) savedContextRef.current = JSON.parse(saved);
    } catch (e) { }
  }
  const restoredTable = location.state?.table || savedContextRef.current?.table || null;
  const routedTable = restoredTable;
  const restoredTableId = preselectedTableId || restoredTable?.id || savedContextRef.current?.tableId || savedContextRef.current?.table?.id || '';
  console.log('%c🔍 [POS PAX DEBUG] restoredTable =', 'color: #e11d48; font-weight:bold;', { pax: restoredTable?.pax, guests: restoredTable?.guests, paxCount: restoredTable?.paxCount, seats: restoredTable?.seats, tableId: restoredTable?.id, locationStatePax: location.state?.table?.pax });

  // Component states
  const [category, setCategory] = useState('FOOD');

  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.includes(category)) {
      setCategory(availableCategories[0]);
    }
  }, [availableCategories, category]);
  const [searchItem, setSearchItem] = useState('');
  const [shortCode, setShortCode] = useState('');
  const [serviceType, setServiceType] = useState(location.state?.serviceType || 'Dine In');
  const [generatedTakeawayNo, setGeneratedTakeawayNo] = useState(() => {
    const passed = location.state?.tableNumber?.toString();
    return passed?.startsWith('TK') ? passed : null;
  });
  const [generatedDeliveryNo, setGeneratedDeliveryNo] = useState(() => {
    const passed = location.state?.tableNumber?.toString();
    return passed?.startsWith('DL') ? passed : null;
  });

  useEffect(() => {
    if (tablesList && tablesList.length > 0) {
      if (!generatedTakeawayNo) {
        const tkTables = tablesList.filter(t => t.no?.toString().startsWith('TK-')).map(t => parseInt(t.no.replace('TK-', '')) || 0);
        const maxTk = tkTables.length > 0 ? Math.max(...tkTables) : 0;
        setGeneratedTakeawayNo(`TK-${String(maxTk + 1).padStart(2, '0')}`);
      }
      if (!generatedDeliveryNo) {
        const dlTables = tablesList.filter(t => t.no?.toString().startsWith('DL-')).map(t => parseInt(t.no.replace('DL-', '')) || 0);
        const maxDl = dlTables.length > 0 ? Math.max(...dlTables) : 0;
        setGeneratedDeliveryNo(`DL-${String(maxDl + 1).padStart(2, '0')}`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tablesList]);

  // Customer Information inputs
  const [customerName, setCustomerName] = useState(restoredTable?.customer || restoredTable?.customer_name || '');
  const [mobileNumber, setMobileNumber] = useState(restoredTable?.mobile || restoredTable?.customer_phone || '');
  const [customerAddress, setCustomerAddress] = useState(restoredTable?.address || restoredTable?.customer_address || '');
  const [customerLocality, setCustomerLocality] = useState(restoredTable?.locality || restoredTable?.customer_locality || '');
  const [paxCount, setPaxCount] = useState(restoredTable?.pax || restoredTable?.guests || restoredTable?.paxCount || restoredTable?.seats || 1);
  const [paxAdults, setPaxAdults] = useState(restoredTable?.pax || restoredTable?.guests || restoredTable?.paxCount || restoredTable?.seats || 1);
  const [paxChildren, setPaxChildren] = useState(0);
  const [waiter, setWaiter] = useState(restoredTable?.waiter || 'Staff');
  const [deliveryBoy, setDeliveryBoy] = useState('');
  const [ncType, setNcType] = useState('');
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

  // Find recent running table automatically for Billing Desk (most recently updated running table)
  const recentRunningTable = useMemo(() => {
    if (!tablesList || tablesList.length === 0) return null;
    const runningTables = tablesList.filter(t =>
      t.color === 'yellow' || t.status === 'Running' || t.status === 'KOT_CUT' ||
      (t.amount && t.amount > 0 && t.status !== 'PAYMENT_COMPLETED' && t.status !== 'Blank')
    );
    if (runningTables.length > 0) {
      const sorted = [...runningTables].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
      return sorted[0];
    }
    return null;
  }, [tablesList]);

  // Stable effective table ID — memoized so it doesn't change every render
  const effectiveTableId = useMemo(() => {
    return preselectedTableId || restoredTableId ||
      (isBillingDesk ? recentRunningTable?.id : null) ||
      recentRunningTable?.id ||
      (tablesList.length > 0 ? tablesList[0].id : 1);
    // Only recalculate when table list first loads or billing-desk table selection changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedTableId, restoredTableId, isBillingDesk, recentRunningTable?.id]);

  const [assignedTableId, setAssignedTableId] = useState(restoredTableId || null);

  // Set assignedTableId once effective table is resolved (only if not already set)
  useEffect(() => {
    if (!assignedTableId && effectiveTableId) {
      setAssignedTableId(effectiveTableId);
    }
    // Only run when effectiveTableId first resolves
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveTableId]);

  // KOT states
  const [kotCreated, setKotCreated] = useState(false);
  const [generatedKotNo, setGeneratedKotNo] = useState('');
  const [showKotAlert, setShowKotAlert] = useState(false);

  // KOT Print Modal states (multi-printer routing)
  const [showKotPrintModal, setShowKotPrintModal] = useState(false);
  const [showQuickPaymentModal, setShowQuickPaymentModal] = useState(false);
  const [kotGroups, setKotGroups] = useState([]);
  const [kotPayloads, setKotPayloads] = useState([]);
  const kotSuccessCallbackRef = React.useRef(null);

  // Resolved ONCE at mount — must not change on re-renders
  const queryParams = new URLSearchParams(location.search);
  const targetKotId = queryParams.get('kotId') || location.state?.kotId || null;

  const mapItemToRow = useCallback((item, idx) => {
    const uPrice = Number(item.unitPrice || item.price || item.rate || item.item_price || 0);
    const qVal = Number(item.qty || item.quantity || 1);
    return {
      lineId: item.lineId || `kot-item-${idx}-${Date.now()}`,
      itemId: item.itemId || item.id || item.item_id || idx,
      itemName: item.itemName || item.name || item.title || item.item_name || '',
      name: item.itemName || item.name || item.title || item.item_name || '',
      variantId: item.variantId || '',
      variantName: item.variantName || item.variant || item.alternative_title || '',
      qty: qVal,
      unitPrice: uPrice,
      price: uPrice,
      rate: uPrice,
      total: Number(item.total || item.amount || (qVal * uPrice)),
      remark: item.remark || item.remarks || item.item_note || '',
      isCut: item.isCut !== undefined ? item.isCut : true,
      printedQty: Number(item.printedQty !== undefined ? item.printedQty : (item.isCut ? qVal : 0))
    };
  }, []);

  // Initialize rows from state, sessionStorage, context cache, or empty
  const initialFallbackRows = () => {
    if (location.state && location.state.hasOwnProperty('rows')) {
      if (Array.isArray(location.state.rows) && location.state.rows.length > 0) {
        return aggregateItems(location.state.rows).map((r, i) => mapItemToRow(r, i));
      }
      return [{ lineId: `empty-row-0`, itemId: '', itemName: '', name: '', variantId: '', variantName: '', variant: '', remark: '', qty: 1, unitPrice: 0, price: 0, rate: 0, total: 0 }];
    }
    const initTblId = preselectedTableId || restoredTableId;
    if (initTblId) {
      try {
        const savedDraft = sessionStorage.getItem(`alfa_draft_rows_${initTblId}`);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return aggregateItems(parsed).map((r, i) => mapItemToRow(r, i));
          }
        }
      } catch (e) { }
    }
    if (initTblId && orderItemsMap) {
      const cached = orderItemsMap[initTblId] || orderItemsMap[String(initTblId)] || orderItemsMap[`T${initTblId}`];
      if (Array.isArray(cached) && cached.length > 0) {
        return aggregateItems(cached).map((r, i) => mapItemToRow(r, i));
      }
    }
    return INITIAL_ROWS;
  };

  // Table rows for right-side billing
  const [rows, setRows] = useState(initialFallbackRows);
  const [isSettling, setIsSettling] = useState(false);

  // Reset all local billing states when active outlet changes to prevent cross-outlet leakage
  useEffect(() => {
    setRows([]);
    setCustomerName('');
    setMobileNumber('');
    setPaxCount(1);
    setPaxAdults(1);
    setPaxChildren(0);
    setWaiter('Staff');
    setRemarks('');
    setAssignedTableId(null);
    try {
      sessionStorage.removeItem('alfa_selected_pos_table');
      sessionStorage.removeItem('alfa_selected_order');
    } catch (e) { }
  }, [activeStoreId]);

  const [kotViewData, setKotViewData] = useState(null);

  // Sync active table data & rows when assignedTableId or location.state changes
  useEffect(() => {
    async function loadActiveTableData() {
      // ─────────────────────────────────────────────────────────────────────
      // 1. SINGLE KOT VIEW MODE — must NEVER fall through to table-level query
      // ─────────────────────────────────────────────────────────────────────
      if (targetKotId) {
        const stateRows = location.state?.rows;
        const stateKot = location.state?.kot;
        if (Array.isArray(stateRows) && stateRows.length > 0) {
          setRows(stateRows.map((r, i) => mapItemToRow(r, i)));
          if (stateKot) {
            setKotViewData(stateKot);
            if (stateKot.tableId) setAssignedTableId(stateKot.tableId);
            if (stateKot.customer_name) setCustomerName(stateKot.customer_name);
            if (stateKot.waiter) setWaiter(stateKot.waiter);
            const extra = typeof stateKot.extra_details === 'string' ? JSON.parse(stateKot.extra_details || '{}') : stateKot.extra_details;
            const paxVal = stateKot.pax || stateKot.guests || stateKot.paxCount || extra?.pax || extra?.guests || 1;
            setPaxCount(paxVal);
            if (extra?.ncType || stateKot.ncType) {
              setNcType(extra?.ncType || stateKot.ncType || '');
            } else {
              setNcType('');
            }
          }
          return;
        }

        try {
          const res = await kotService.getKOTById(targetKotId);
          const singleKot = res?.kot || res?.data;
          if (singleKot && Array.isArray(singleKot.items) && singleKot.items.length > 0) {
            setKotViewData(singleKot);
            if (singleKot.tableNo || singleKot.tableId) setAssignedTableId(singleKot.tableNo || singleKot.tableId);
            setCustomerName(singleKot.customer?.name || singleKot.customer_name || 'Walk-in');
            setMobileNumber(singleKot.customer?.mobile || singleKot.mobile_number || '');
            setWaiter(singleKot.waiter || '');
            setRemarks(singleKot.remark || singleKot.remarks || '');
            const extra = typeof singleKot.extra_details === 'string' ? JSON.parse(singleKot.extra_details || '{}') : singleKot.extra_details;
            const paxVal = singleKot.pax || singleKot.guests || singleKot.paxCount || extra?.pax || extra?.guests || 1;
            setPaxCount(paxVal);
            const activeSingleItems = singleKot.items.filter(item => item.status !== 'Cancelled' && String(item.status) !== '5' && item.is_active !== 0 && item.status !== 'Deleted');
            setRows(activeSingleItems.map((r, i) => mapItemToRow(r, i)));
            if (extra?.ncType || singleKot.ncType) {
              setNcType(extra?.ncType || singleKot.ncType || '');
            } else {
              setNcType('');
            }
            return;
          }
        } catch (err) {
          console.warn('Error fetching single KOT from backend:', err);
        }
        setRows([]);
        setKotViewData(null);
        return;
      }

      // ─────────────────────────────────────────────────────────────────────
      // 2. NORMAL TABLE MODE — load by table ID
      // ─────────────────────────────────────────────────────────────────────
      setKotViewData(null);
      const activeTableId = assignedTableId || effectiveTableId || restoredTableId;
      const currentTable = tablesList.find(
        t => String(t.id) === String(activeTableId) || String(t.no) === String(activeTableId)
      ) || restoredTable || recentRunningTable;

      // Check if rows were passed in navigation state
      if (location.state && location.state.hasOwnProperty('rows')) {
        const stateRows = location.state.rows;
        if (Array.isArray(stateRows) && stateRows.length > 0) {
          setRows(aggregateItems(stateRows).map((r, i) => mapItemToRow(r, i)));
        } else {
          setRows([{ lineId: `empty-row-0`, itemId: '', itemName: '', name: '', variantId: '', variantName: '', variant: '', remark: '', qty: 1, unitPrice: 0, price: 0, rate: 0, total: 0 }]);
        }
        if (currentTable?.customer) setCustomerName(currentTable.customer);
        if (currentTable?.mobile || currentTable?.phone) setMobileNumber(currentTable.mobile || currentTable.phone);
        if (currentTable?.waiter) setWaiter(currentTable.waiter);
        if (currentTable?.pax || currentTable?.guests || currentTable?.paxCount) setPaxCount(currentTable.pax || currentTable.guests || currentTable.paxCount);
        return;
      }

      // Check if orderItemsMap has rows for this table
      const cachedRows = orderItemsMap[activeTableId] || (currentTable?.no ? orderItemsMap[currentTable.no] : null) || (currentTable?.id ? orderItemsMap[currentTable.id] : null) || (currentTable?.no ? orderItemsMap[`T${currentTable.no}`] : null);
      if (Array.isArray(cachedRows) && cachedRows.length > 0) {
        setRows(aggregateItems(cachedRows).map((r, i) => mapItemToRow(r, i)));
        if (currentTable?.customer) setCustomerName(currentTable.customer);
        if (currentTable?.mobile || currentTable?.phone) setMobileNumber(currentTable.mobile || currentTable.phone);
        if (currentTable?.waiter) setWaiter(currentTable.waiter);
        if (currentTable?.pax || currentTable?.guests || currentTable?.paxCount) setPaxCount(currentTable.pax || currentTable.guests || currentTable.paxCount);
        return;
      }

      // Check if table object from tablesList already has active KOTs
      if (currentTable && Array.isArray(currentTable.kots) && currentTable.kots.length > 0) {
        const rawTableKotItems = aggregateItems(currentTable.kots
          .flatMap(k => Array.isArray(k.items) ? k.items : [])
          .filter(item => item.status !== 'Cancelled' && String(item.status) !== '5' && item.is_active !== 0 && item.status !== 'Deleted'));
        if (rawTableKotItems.length > 0) {
          setRows(rawTableKotItems.map((r, i) => mapItemToRow(r, i)));
          if (currentTable.customer) setCustomerName(currentTable.customer);
          if (currentTable.mobile) setMobileNumber(currentTable.mobile);
          if (currentTable.waiter) setWaiter(currentTable.waiter);
          if (currentTable.pax || currentTable.guests || currentTable.paxCount) setPaxCount(currentTable.pax || currentTable.guests || currentTable.paxCount);
          return;
        }
      }

      // Fetch fresh active KOT items from PostgreSQL before deciding table is empty
      try {
        const queryTblId = currentTable?.id || activeTableId;
        const queryTblNo = currentTable?.no || String(activeTableId).replace(/\D/g, '');
        const kotRes = await kotService.getKOTList({
          tableId: queryTblId,
          table_id: queryTblId,
          table_no: queryTblNo,
          active: '1'
        });
        const kotList = kotRes?.kots || kotRes?.data || (Array.isArray(kotRes) ? kotRes : []);
        if (Array.isArray(kotList) && kotList.length > 0) {
          const nonNcKots = kotList.filter(k => {
            const extra = typeof k.extra_details === 'string' ? JSON.parse(k.extra_details || '{}') : k.extra_details;
            return !(extra?.isNC || k.isNC || k.ncType);
          });
          const rawKotItems = aggregateItems(nonNcKots
            .flatMap(k => k.items || [])
            .filter(item => item.status !== 'Cancelled' && String(item.status) !== '5' && item.is_active !== 0 && item.status !== 'Deleted'));
          if (rawKotItems.length > 0) {
            setRows(rawKotItems.map((r, i) => mapItemToRow(r, i)));
            if (kotList[0]?.customer_mobile) setMobileNumber(kotList[0].customer_mobile);
            if (kotList[0]?.customer_name) setCustomerName(kotList[0].customer_name);
            if (kotList[0]?.waiter) setWaiter(kotList[0].waiter);

            const firstKotExtra = typeof kotList[0]?.extra_details === 'string' ? JSON.parse(kotList[0].extra_details || '{}') : (kotList[0]?.extra_details || {});
            const listPaxVal = kotList[0]?.pax || kotList[0]?.guests || kotList[0]?.paxCount || firstKotExtra?.pax || firstKotExtra?.guests || 1;
            setPaxCount(listPaxVal);
            return;
          }
        }
      } catch (err) {
        console.warn('Error fetching KOT items from PostgreSQL:', err);
      }

      // Check for unsaved draft in sessionStorage before clearing
      try {
        const savedDraft = sessionStorage.getItem(`alfa_draft_rows_${activeTableId}`);
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRows(aggregateItems(parsed).map((r, i) => mapItemToRow(r, i)));
            if (currentTable?.customer) setCustomerName(currentTable.customer);
            if (currentTable?.mobile || currentTable?.phone || currentTable?.customer_phone) setMobileNumber(currentTable.mobile || currentTable.phone || currentTable.customer_phone);
            if (currentTable?.waiter) setWaiter(currentTable.waiter);
            if (currentTable?.captain) setCaptain(currentTable.captain);
            return;
          }
        }
      } catch (e) { }

      // Only if all sources returned no items, set empty rows
      setRows([]);
      if (currentTable?.customer) setCustomerName(currentTable.customer);
      if (currentTable?.mobile || currentTable?.phone || currentTable?.customer_phone) setMobileNumber(currentTable.mobile || currentTable.phone || currentTable.customer_phone);
      if (currentTable?.waiter) setWaiter(currentTable.waiter);
      if (currentTable?.captain) setCaptain(currentTable.captain);
    }

    loadActiveTableData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignedTableId, targetKotId, location.state]);

  // Automatically trigger payment modal if redirected with autoSettle state flag
  useEffect(() => {
    if (location.state?.autoSettle) {
      setShowQuickPaymentModal(true);
    }
  }, [location.state]);

  // Sync changes in rows to orderItemsMap in context & sessionStorage.
  // Skip in KOT view mode — we must never write single-KOT items into the table-level cache.
  useEffect(() => {
    if (targetKotId) return; // KOT view mode: do not pollute table cache
    const tableKey = assignedTableId || restoredTableId || routedTable?.id;
    if (tableKey && Array.isArray(rows)) {
      const activeRows = rows.filter(r => (r.itemName || r.name || '') !== '');
      if (activeRows.length > 0) {
        if (setOrderItemsMap) {
          setOrderItemsMap(prev => ({
            ...prev,
            [tableKey]: activeRows,
            ...(routedTable?.no ? { [routedTable.no]: activeRows } : {})
          }));
        }
        try { sessionStorage.setItem(`alfa_draft_rows_${tableKey}`, JSON.stringify(activeRows)); } catch (e) { }
      } else {
        try { sessionStorage.removeItem(`alfa_draft_rows_${tableKey}`); } catch (e) { }
      }
    }
  }, [rows, assignedTableId, restoredTableId, routedTable, setOrderItemsMap, targetKotId]);

  // Ref for active shortcut handlers to prevent TDZ / closure errors
  const handlersRef = React.useRef({});
  useEffect(() => {
    handlersRef.current = {
      handleConfirmBooking,
      handleSaveAndPrint,
      handleDirectComplete,
      handleAddKOT,
      setShowQuickPaymentModal,
      isBillingDesk
    };
  });

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
          case 's':
            e.preventDefault();
            handlersRef.current.handleConfirmBooking?.();
            break;
          case 'k':
            e.preventDefault();
            handlersRef.current.handleAddKOT?.();
            break;
          case 'e':
            e.preventDefault();
            handlersRef.current.handleDirectComplete?.();
            break;
          case 'w':
            e.preventDefault();
            document.getElementById('pos-waiter-select')?.focus();
            break;
          case 'l':
          case 'b':
            e.preventDefault();
            document.getElementById('pos-delivery-select')?.focus();
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

      // Ctrl+Enter / Meta+Enter from anywhere triggers Print Bill / Save & Print
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handlersRef.current.handleDirectComplete?.(true);
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
        case 'Enter':
          if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'BUTTON') {
            e.preventDefault();
            handlersRef.current.handleDirectComplete?.(true);
          }
          break;
        case 'F3':
          e.preventDefault();
          focusCartTable();
          break;
        case 'F5':
          e.preventDefault();
          handlersRef.current.handleDirectComplete?.(false);
          break;
        case 'F6':
        case 'F9':
          e.preventDefault();
          handlersRef.current.handleDirectComplete?.(true);
          break;
        case 'F7':
          e.preventDefault();
          handlersRef.current.handleSaveAndPrint?.();
          break;
        case 'F8':
          e.preventDefault();
          handlersRef.current.handleAddKOT?.();
          break;
        case 'F10':
          e.preventDefault();
          if (handlersRef.current.isBillingDesk || handlersRef.current.setShowQuickPaymentModal) {
            handlersRef.current.setShowQuickPaymentModal?.(true);
          }
          break;
        case 'Delete':
          if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            setRows(prev => {
              if (prev.length === 0) return prev;
              const nextRows = prev.slice(0, -1);
              toast('Last item removed (Cancelled)');
              return nextRows;
            });
          }
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
  }, []);

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
    } catch (e) { }
    return basePrice;
  };

  const addOrUpdateItemRow = (foodItem, variant) => {
    const variantId = variant ? variant.id : '';
    const variantName = variant ? variant.name : '';
    const rawPrice = variant ? variant.price : (foodItem.price || foodItem.rate || 0);
    const price = getAreaAdjustedPrice(foodItem, rawPrice);
    const lineId = crypto.randomUUID ? crypto.randomUUID() : (Date.now().toString(36) + Math.random().toString(36).substr(2, 5));
    const itemName = foodItem.name || foodItem.title || 'Item';

    let targetIdx = 0;

    setRows(prev => {
      const emptyIndex = prev.findIndex(r => !r.itemName && !r.name);
      const existingIndex = prev.findIndex(r => {
        const sameId = foodItem.id && r.itemId && String(r.itemId) === String(foodItem.id);
        const sameName = (r.itemName || r.name || '').trim().toLowerCase() === itemName.trim().toLowerCase();
        const sameVariant = String(r.variantId || '') === String(variantId || '') || String(r.variantName || r.variant || '') === String(variantName || '');
        return (sameId || sameName) && sameVariant;
      });

      if (existingIndex !== -1) {
        targetIdx = existingIndex;
        return prev.map((r, i) => {
          if (i === existingIndex) {
            const nextQty = (r.qty || 1) + 1;
            const unitPrice = r.unitPrice || price;
            return { ...r, qty: nextQty, total: nextQty * unitPrice, isCut: nextQty <= (r.printedQty || 0) };
          }
          return r;
        });
      } else if (emptyIndex !== -1) {
        targetIdx = emptyIndex;
        return prev.map((r, i) => {
          if (i === emptyIndex) {
            return {
              ...r,
              lineId,
              itemId: foodItem.id,
              itemName: itemName,
              name: itemName,
              kitchen_dept: foodItem.kitchen_dept || foodItem.productionCategory || null,
              productionCategory: foodItem.kitchen_dept || foodItem.productionCategory || null,
              variantId,
              variantName,
              variant: variantName,
              qty: 1,
              unitPrice: price,
              price: price,
              rate: price,
              total: price,
              remark: '',
              is_open_item: foodItem.is_open_item || 0
            };
          }
          return r;
        });
      } else {
        targetIdx = prev.length;
        return [
          ...prev,
          {
            lineId,
            itemId: foodItem.id,
            itemName: itemName,
            name: itemName,
            kitchen_dept: foodItem.kitchen_dept || foodItem.productionCategory || null,
            productionCategory: foodItem.kitchen_dept || foodItem.productionCategory || null,
            variantId,
            variantName,
            variant: variantName,
            qty: 1,
            unitPrice: price,
            price: price,
            rate: price,
            total: price,
            remark: '',
            is_open_item: foodItem.is_open_item || 0
          }
        ];
      }
    });
    toast(`Added: ${itemName}${variantName ? ` (${variantName})` : ''}`);

    setTimeout(() => {
      const targetInput = document.querySelector(`[data-row="${targetIdx}"][data-col="3"]`);
      if (targetInput) {
        targetInput.focus();
        if (targetInput.select) targetInput.select();
      }
    }, 80);
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
            updated.is_open_item = match.is_open_item || 0;

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
            updated.is_open_item = 0;
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
      // If pressing Enter on Quantity (3), jump back to Search bar for next item!
      if (colIndex === 3) {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
        return;
      }
      // Move from Items(1) -> Remark(2) -> Qty(3) -> Price(4)
      if (colIndex < 4) {
        const nextColTarget = document.querySelector(`[data-row="${rowIndex}"][data-col="${colIndex + 1}"]`);
        if (nextColTarget) {
          nextColTarget.focus();
          if (nextColTarget.select) nextColTarget.select();
          return;
        }
      }
      // If at end of row, go to next row or back to Search Bar
      if (rowIndex === rows.length - 1) {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      } else {
        const nextRowTarget = document.querySelector(`[data-row="${rowIndex + 1}"][data-col="1"]`) || document.querySelector(`[data-row="${rowIndex + 1}"][data-col="${colIndex}"]`);
        if (nextRowTarget) {
          nextRowTarget.focus();
          if (nextRowTarget.select) nextRowTarget.select();
        }
      }
      return;
    }

    if (e.key === 'Delete' || (e.altKey && e.key.toLowerCase() === 'x')) {
      e.preventDefault();
      handleRemoveRow(rowIndex);
      toast('Row removed');
      return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      if (e.target.tagName === 'SELECT' && ['ArrowUp', 'ArrowDown'].includes(e.key)) {
        return;
      }
      if (e.key === 'ArrowUp' && rowIndex === 0) {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
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

  // Stop calculating totals on the frontend. Use backend values.
  const activeTableIdForTax = assignedTableId || restoredTableId;
  const currentTableObj = tablesList.find(t => String(t.id) === String(activeTableIdForTax) || String(t.no) === String(activeTableIdForTax)) || routedTable;

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

  const [calculatedSubtotal, setCalculatedSubtotal] = useState(0);
  const [calculatedDiscount, setCalculatedDiscount] = useState(0);
  const [calculatedTax, setCalculatedTax] = useState(0);
  const [calculatedTaxBreakdown, setCalculatedTaxBreakdown] = useState([]);
  const [calculatedNetBill, setCalculatedNetBill] = useState(0);

  useEffect(() => {
    const calculateTotals = async () => {
      try {
        const payload = {
          items: [...existingRows, ...rows].filter(r => r.name || r.itemName),
          discountLines
        };
        if (payload.items.length === 0) {
          setCalculatedSubtotal(0); setCalculatedDiscount(0); setCalculatedTax(0); setCalculatedNetBill(0); setCalculatedTaxBreakdown([]);
          return;
        }
        // Use apiClient instead of hardcoded fetch
        const res = await apiClient.post('/pos/calculate', payload);
        if (res && res.data) {
          setCalculatedSubtotal(res.data.subtotal || 0);
          setCalculatedDiscount(res.data.discount || 0);
          setCalculatedTax(res.data.tax_amount || 0);
          setCalculatedTaxBreakdown(res.data.tax_breakdown || []);
          setCalculatedNetBill(res.data.net_amount || 0);
        }
      } catch (err) {
        console.warn('Error calculating totals:', err);
      }
    };
    calculateTotals();
  }, [rows, existingRows, discountLines]);

  const totalBill = calculatedSubtotal || Number(currentTableObj?.amount || kotViewData?.amount || 0);
  const totalDiscountAmt = calculatedDiscount || Number(currentTableObj?.discount_amount || currentTableObj?.discountAmount || kotViewData?.discount_amount || 0);
  const totalTax = calculatedTax || Number(currentTableObj?.tax_amount || currentTableObj?.taxAmount || currentTableObj?.tax || kotViewData?.tax_amount || 0);
  const netBill = calculatedNetBill || Number(currentTableObj?.total_amount || currentTableObj?.totalAmount || currentTableObj?.net_amount || (totalBill - totalDiscountAmt + totalTax));

  const handleAddKOT = async () => {
    const activeRows = rows.filter(r => r.name || r.itemName);
    if (activeRows.length === 0) {
      toast('Please add at least one item before generating KOT.');
      return;
    }
    const activeWaiter = waiter || 'Staff';

    const newKotNo = `KOT-new`;
    setGeneratedKotNo(newKotNo);
    setKotCreated(true);

    const resolvedTableId = assignedTableId || restoredTableId || (tablesList.length > 0 ? tablesList[0].id : 1);
    const resolvedTable = tablesList.find(t => String(t.id) === String(resolvedTableId) || String(t.no) === String(resolvedTableId)) || routedTable || { id: resolvedTableId, no: String(resolvedTableId) };
    const tableNo = String(resolvedTable?.no || resolvedTableId || '01').replace(/[^0-9]/g, '') || String(resolvedTableId);

    const uncutRows = activeRows.filter(r => (r.qty > (r.printedQty || 0)) || !r.isCut);
    if (uncutRows.length === 0) {
      toast('No new items to KOT!');
      return;
    }
    const rowsToCut = uncutRows;

    // Build the delta rows for KOT printing and saving
    const deltaRowsToCut = rowsToCut.map(r => {
      const deltaQty = r.qty - (r.printedQty || 0);
      return { ...r, qty: deltaQty, total: deltaQty * (r.unitPrice || r.price || 0) };
    }).filter(r => r.qty > 0);

    const groups = groupItemsByPrinter(deltaRowsToCut, allMenuItems, dbCategories, dbPrinters);

    // Pre-open print windows synchronously to bypass browser popup blockers
    const printWindows = groups.map(() => null);

    const hasPreviousItems = (existingRows && existingRows.length > 0) || rows.some(r => r.isCut || r.printedQty > 0);
    const isNewSession = !resolvedTable || resolvedTable.status === 'Blank' || resolvedTable.status === 'AVAILABLE';

    const payloads = groups.map(group =>
      generateKOTPayload({
        tableNo,
        tableId: resolvedTableId,
        kotNo: newKotNo,
        group,
        customerName: customerName || 'Walk-in',
        waiter: activeWaiter,
        captain,
        guests: paxCount || 1,
        pax: paxCount || 1,
        remarks: remarks || resolvedTable?.remarks || '',
        isRunningKOT: !isNewSession,
      })
    );

    setKotGroups(groups);
    setKotPayloads(payloads);

    // Call backend APIs to persist KOT, Table status, and Order into PostgreSQL
    const isNC = !!(ncType && ncType.trim());
    const finalAmt = activeRows.reduce((sum, r) => sum + (r.qty * (r.unitPrice || r.price || 0)), 0);
    const normalizeNum = (val) => String(val || '').replace(/[^0-9]/g, '').padStart(2, '0');
    const targetNum = normalizeNum(tableNo || resolvedTableId);

    if (!isNC) {
      // Optimistic immediate table status update in context state!
      setTablesList(prev => prev.map(t => {
        const curNum = normalizeNum(t.no || t.table_no || t.id);
        if (String(t.id) === String(resolvedTableId) || (targetNum !== '00' && curNum === targetNum)) {
          return {
            ...t,
            status: 'KOT_CUT',
            color: 'yellow',
            amount: calculatedSubtotal > 0 ? calculatedSubtotal : (finalAmt > 0 ? finalAmt : Number(currentTableObj?.amount || 0)),
            waiter: activeWaiter,
            customer: customerName || 'Walk-in',
            updatedAt: Date.now()
          };
        }
        return t;
      }));
    }

    let actualKotNo = newKotNo;

    try {
      const itemsForApi = deltaRowsToCut.map(r => ({
        itemId: r.id || r.itemId || r.item_id || 1,
        itemName: r.name || r.itemName || r.title || 'Item',
        qty: Number(r.qty || 1),
        unitPrice: Number(r.unitPrice || r.price || r.rate || 0),
        total: Number(r.total || (r.qty * (r.unitPrice || r.price || 0)))
      }));

      const kotResult = await kotService.createKOT({
        kotNo: newKotNo,
        tableId: Number(resolvedTable?.id || resolvedTableId) || 1,
        tableNo,
        customerName: customerName || 'Walk-in',
        mobileNo: mobileNumber || '',
        waiter: activeWaiter,
        items: itemsForApi,
        isNewSession: isNewSession,
        ncType: ncType || '',
        isNC,
        store_id: activeStoreId,
        order_type: serviceType,
        takeaway_no: serviceType === 'Takeaway' ? generatedTakeawayNo : null,
        delivery_no: serviceType === 'Delivery' ? generatedDeliveryNo : null
      });

      // Check if backend returned stock or validation error message
      if (kotResult && kotResult.statusCode && kotResult.statusCode >= 400) {
        toast(kotResult.message || 'Failed to cut KOT');
        return;
      }

      const returnedCustomNo = kotResult?.kot?.custom_bill_number || kotResult?.data?.custom_bill_number || kotResult?.custom_bill_number;
      const serverKotNo = kotResult?.kot?.id || kotResult?.data?.id || kotResult?.id;
      if (returnedCustomNo) {
        actualKotNo = returnedCustomNo;
      } else if (serverKotNo) {
        const cleanServerNo = String(serverKotNo).replace(/[^0-9]/g, '');
        actualKotNo = isNC ? `NC-KOT-${cleanServerNo.padStart(2, '0')}` : `KOT-${cleanServerNo.padStart(2, '0')}`;
      }

      console.log('✅ KOT request persisted to PostgreSQL via POST /api/kot');

      // Update Table status in PostgreSQL to KOT_CUT so the backend knows the session is active
      if (!isNC) {
        try {
          await restaurantApi.patchTableStatus(resolvedTableId, {
            status: 'KOT_CUT',
            amount: calculatedSubtotal > 0 ? calculatedSubtotal : finalAmt,
            discount_amount: calculatedDiscount,
            tax_amount: calculatedTax,
            total_amount: calculatedNetBill,
            taxes_breakdown: calculatedTaxBreakdown,
            waiter: activeWaiter,
            customer: customerName || 'Walk-in',
            mobile: mobileNumber || ''
          });
        } catch (err) {
          console.warn('Error syncing table status to KOT_CUT:', err);
        }
      }

      // Mark active rows as cut and update printedQty
      setRows(prev => prev.map(r => ({ ...r, isCut: true, printedQty: r.qty })));
      if (typeof refreshTables === 'function') refreshTables();
    } catch (err) {
      console.warn('Error calling KOT API:', err);
      const errMsg = err.response?.data?.message || err.message || 'Stock insufficient or KOT failed';
      toast(`⛔ ${errMsg}`);
      return;
    }

    const finalRows = rows.filter(r => r.name || r.itemName);
    const allAggregatedRows = [...existingRows, ...finalRows];
    const updatedTableForNav = isNC ? (resolvedTable || { id: resolvedTableId, no: tableNo, status: 'Blank', color: 'white' }) : {
      ...(resolvedTable || { id: resolvedTableId, no: tableNo }),
      status: 'KOT_CUT',
      color: 'yellow',
      available_actions: ['print_kot', 'view_kot'],
      updatedAt: Date.now(),
      customer: customerName || resolvedTable?.customer || 'Walk-in',
      mobile: mobileNumber || resolvedTable?.mobile || '',
      waiter: activeWaiter,
      captain: captain || resolvedTable?.captain || '',
      remarks: remarks || resolvedTable?.remarks || '',
      amount: calculatedSubtotal > 0 ? calculatedSubtotal : finalAmt,
      openedAt: resolvedTable?.openedAt || Date.now(),
    };

    toast(`KOT ${actualKotNo} created! Table T${resolvedTable?.no || tableNo} ${isNC ? 'saved' : '→ Running'}`);

    if (isBillingDesk) {
      setRows(INITIAL_ROWS);
      setCustomerName('');
      setMobileNumber('');
      if (typeof setAssignedTableId === 'function') setAssignedTableId(null);
    } else {
      navigate('/restaurant/display-table', { state: { updatedTable: updatedTableForNav, updatedRows: allAggregatedRows } });
    }
  };

  const handleConfirmBooking = async () => {
    const resolvedTableId = assignedTableId || restoredTableId || (tablesList.length > 0 ? tablesList[0].id : 1);
    const targetTable = tablesList.find(t => String(t.id) === String(resolvedTableId) || String(t.no) === String(resolvedTableId)) || routedTable || { id: resolvedTableId, no: String(resolvedTableId) };
    const activeRows = rows.filter(r => (r.itemName || r.name || '') !== '');
    const finalAmt = activeRows.reduce((sum, r) => sum + (r.qty * (r.unitPrice || r.price || 0)), 0);

    // 2. Update Table status in PostgreSQL to KOT_CUT / RUNNING (NO BILL GENERATED)
    try {
      await restaurantApi.patchTableStatus(targetTable?.id || resolvedTableId, {
        status: activeRows.length > 0 ? 'KOT_CUT' : 'AVAILABLE',
        pax: paxCount || 1,
        guests: paxCount || 1
      });
    } catch (err) { }

    // Refresh tables from PostgreSQL so DisplayTablePage shows updated color
    if (typeof refreshTables === 'function') refreshTables();

    const updatedTableConf = {
      ...(targetTable || { id: resolvedTableId, no: String(resolvedTableId) }),
      status: activeRows.length > 0 ? 'KOT_CUT' : 'Blank',
      color: activeRows.length > 0 ? 'yellow' : 'white',
      available_actions: activeRows.length > 0 ? ['print_kot', 'view_kot'] : [],
      amount: calculatedSubtotal > 0 ? calculatedSubtotal : finalAmt,
      waiter: waiter || 'Staff',
      customer: customerName || 'Walk-in',
      mobile: (mobileNumber && mobileNumber !== '—') ? mobileNumber : '',
      pax: paxCount || 1,
      guests: paxCount || 1,
      paxCount: paxCount || 1,
      updatedAt: Date.now()
    };

    toast(`Table T${targetTable?.no || resolvedTableId} saved.`);

    if (isBillingDesk) {
      setRows(INITIAL_ROWS);
      setCustomerName('');
      setMobileNumber('');
      if (typeof setAssignedTableId === 'function') setAssignedTableId(null);
    } else {
      navigate('/restaurant/display-table', { state: { updatedTable: updatedTableConf, updatedRows: activeRows } });
    }
  };


  const handleSaveAndPrint = async () => {
    const activeRows = rows.filter(r => (r.itemName || r.name || '') !== '');
    if (activeRows.length === 0) {
      toast('Please add at least one item.');
      return;
    }

    const isNC = !!(ncType && ncType.trim());
    const activeWaiter = waiter || 'Staff';
    const finalAmt = activeRows.reduce((sum, r) => sum + (r.qty * (r.unitPrice || r.price || 0)), 0);
    const targetTableId = assignedTableId || routedTable?.id || preselectedTableId;
    const targetTableNo = preselectedTableNumber || routedTable?.no || String(targetTableId || '1');

    const resolvedTable = tablesList.find(t => String(t.id) === String(targetTableId) || String(t.no) === String(targetTableId)) || routedTable || { id: targetTableId, no: String(targetTableNo) };
    const resolvedTableName = resolvedTable.table_name || resolvedTable.no || targetTableNo;
    const hasPreviousItems = (existingRows && existingRows.length > 0) || rows.some(r => r.isCut || r.printedQty > 0);
    const isNewSession = !resolvedTable || resolvedTable.status === 'Blank' || resolvedTable.status === 'AVAILABLE';

    if (!isNC) {
      // Optimistic table color update to YELLOW immediately
      const normalizeNum = (val) => String(val || '').replace(/[^0-9]/g, '').padStart(2, '0');
      const targetNum = normalizeNum(resolvedTable.no || targetTableId);
      setTablesList(prev => prev.map(t => {
        const curNum = normalizeNum(t.no || t.table_no || t.id);
        if (String(t.id) === String(targetTableId) || (targetNum !== '00' && curNum === targetNum)) {
          return { ...t, status: 'KOT_CUT', color: 'yellow', amount: finalAmt, waiter: activeWaiter, customer: customerName || 'Walk-in', pax: paxCount || 1, guests: paxCount || 1, paxCount: paxCount || 1, updatedAt: Date.now() };
        }
        return t;
      }));
    }

    // Cut uncut rows to kitchen (or re-print KOT for all active items if already cut)
    const uncutRows = activeRows.filter(r => !r.isCut);
    const rowsToCutAndPrint = uncutRows.length > 0 ? uncutRows : activeRows;

    const invoiceNo = `KOT-new`;
    let printedKotNo = invoiceNo;
    let groups = [];

    if (rowsToCutAndPrint.length > 0) {
      setGeneratedKotNo(invoiceNo);
      setKotCreated(true);

      groups = groupItemsByPrinter(rowsToCutAndPrint, allMenuItems, dbCategories, dbPrinters);

      // Pre-open print windows synchronously to bypass browser popup blockers
      const printWindows = groups.map(() => null);

      const payloads = groups.map(group =>
        generateKOTPayload({
          tableNo: resolvedTableName, tableId: targetTableId, kotNo: invoiceNo, group,
          customerName: customerName || 'Walk-in', waiter: activeWaiter, captain,
          guests: paxCount || 1, pax: paxCount || 1,
          remarks: remarks || resolvedTable?.remarks || '',
          isRunningKOT: !isNewSession
        })
      );
      setKotGroups(groups);
      setKotPayloads(payloads);

      try {
        if (uncutRows.length > 0) {
          const itemsForApi = uncutRows.map(r => ({
            itemId: r.id || r.itemId || r.item_id || 1,
            itemName: r.name || r.itemName || r.title || 'Item',
            qty: Number(r.qty || r.quantity || 1),
            unitPrice: Number(r.unitPrice || r.price || r.rate || 0),
            total: Number(r.qty || 1) * Number(r.unitPrice || r.price || 0)
          }));

          const kotResult = await kotService.createKOT({
            kotNo: invoiceNo,
            tableId: Number(resolvedTable?.id) || 1,
            tableNo: resolvedTableName,
            customerName: customerName || 'Walk-in',
            mobileNo: mobileNumber || '',
            customer_address: customerAddress || '',
            customer_locality: customerLocality || '',
            waiter: activeWaiter,
            guests: paxCount || 1,
            pax: paxCount || 1,
            items: itemsForApi,
            isNewSession,
            ncType: ncType || '',
            isNC,
            store_id: activeStoreId,
            order_type: serviceType,
            takeaway_no: serviceType === 'Takeaway' ? generatedTakeawayNo : null,
            delivery_no: serviceType === 'Delivery' ? generatedDeliveryNo : null
          });
          const returnedCustomNo = kotResult?.kot?.custom_bill_number || kotResult?.data?.custom_bill_number || kotResult?.custom_bill_number;
          const serverKotNo = kotResult?.kot?.id || kotResult?.data?.id || kotResult?.id;
          if (returnedCustomNo) {
            printedKotNo = returnedCustomNo;
            setGeneratedKotNo(printedKotNo);
          } else if (serverKotNo) {
            const cleanServerNo = String(serverKotNo).replace(/[^0-9]/g, '');
            printedKotNo = isNC ? `NC-KOT-${cleanServerNo.padStart(2, '0')}` : `KOT-${cleanServerNo.padStart(2, '0')}`;
            setGeneratedKotNo(printedKotNo);
          }
        }

        setRows(prev => prev.map(r => ({ ...r, isCut: true })));

        // Automatically print KOT to all accessible kitchen stations
        groups.forEach((group, idx) => {
          printKitchenKOT({
            tableId: String(resolvedTableName),
            id: printedKotNo,
            items: group.items,
            waiter: activeWaiter,
            stationName: group.printer?.name || group.printerName || group.department,
            printerName: group.printer?.ip || group.printerIp || '',
            order_type: serviceType,
            takeaway_no: serviceType === 'Takeaway' ? generatedTakeawayNo : null,
            delivery_no: serviceType === 'Delivery' ? generatedDeliveryNo : null,
            remarks: remarks || resolvedTable?.remarks || '',
            isNC: isNC,
            ncType: ncType || '',
            guests: paxCount || 1,
            pax: paxCount || 1,
            store_id: activeStoreId || 'STORE_1',
            outletName: currentOutletName,
            outlet_name: currentOutletName,
            isRunningKOT: !isNewSession
          }, printWindows[idx]);
        });

      } catch (err) {
        console.warn('Error calling KOT API in Save & Print:', err);
        toast(`Failed to send KOT: ${err.response?.data?.message || err.message || 'Unknown error'}`);
        return;
      }
    }

    // Persist KOT_CUT state to backend (skip if NC)
    if (targetTableId && !isNC) {
      try {
        await tableService.patchTableStatus(targetTableId, {
          status: 'KOT_CUT',
          amount: finalAmt,
          waiter: activeWaiter,
          customer: customerName || 'Walk-in',
          pax: paxCount || 1,
          guests: paxCount || 1
        });
      } catch (err) {
        console.warn('Error updating table status to KOT_CUT:', err);
      }
    }

    const updatedTableForNav = isNC ? (resolvedTable || { id: targetTableId, no: targetTableNo, status: 'Blank', color: 'white' }) : {
      ...(resolvedTable || { id: targetTableId, no: targetTableNo }),
      status: 'KOT_CUT',
      color: 'yellow',
      available_actions: ['print_kot', 'view_kot', 'quick_pay'],
      amount: calculatedSubtotal > 0 ? calculatedSubtotal : finalAmt,
      waiter: activeWaiter,
      customer: customerName || 'Walk-in',
      pax: paxCount || 1,
      guests: paxCount || 1,
      paxCount: paxCount || 1,
      updatedAt: Date.now()
    };

    const allAggregatedRows = [...existingRows, ...activeRows.map(r => ({ ...r, isCut: true }))];
    toast(isNC ? `NC KOT printed for Table ${resolvedTableName}.` : `KOTs printed to ${groups.length} station(s) for Table ${resolvedTableName}.`);

    if (!isBillingDesk) {
      navigate('/restaurant/display-table', { state: { updatedTable: updatedTableForNav, updatedRows: allAggregatedRows } });
    }
  };


  const isBillingSubmittingRef = React.useRef(false);

  const handleDirectComplete = async (shouldPrint = true) => {
    console.log('%c🖱️ [POS Billing] handleDirectComplete clicked with shouldPrint =', 'color: #3b82f6; font-weight: bold;', shouldPrint);
    if (isBillingSubmittingRef.current) return;

    const activeRows = rows.filter(r => (r.itemName || r.name || '') !== '');
    const allFinalItems = [...existingRows, ...activeRows];

    if (allFinalItems.length === 0) {
      console.warn('⚠️ [POS Billing] No items in cart.');
      toast('Please add at least one item before billing.');
      return;
    }

    isBillingSubmittingRef.current = true;

    // Open print window first (synchronous action) to avoid popup blocker
    const invoicePrintWindow = shouldPrint ? null : undefined;

    const resolvedId = assignedTableId || routedTable?.id || null;
    const resolvedTable = tablesList.find(t => String(t.id) === String(resolvedId) || String(t.no) === String(resolvedId)) || routedTable;
    const resolvedTableName = resolvedTable?.table_name || resolvedTable?.no || preselectedTableNumber || routedTable?.no || '1';

    const finalAmt = allFinalItems.reduce((sum, r) => sum + (Number(r.qty || 1) * Number(r.unitPrice || r.price || 0)), 0);
    const subtotalAmt = calculatedSubtotal > 0 ? calculatedSubtotal : finalAmt;
    const discountAmt = totalDiscountAmt || 0;
    const taxAmt = totalTax || 0;
    const netAmt = netBill > 0 ? netBill : Math.max(0, subtotalAmt - discountAmt + taxAmt);
    const taxBreakdown = Array.isArray(calculatedTaxBreakdown) && calculatedTaxBreakdown.length > 0
      ? calculatedTaxBreakdown
      : (taxLines && taxLines.length > 0 ? taxLines.map(t => ({ name: t.name, rate: t.rate, amount: (subtotalAmt - discountAmt) * (t.rate / 100) })) : [{ name: 'Tax', rate: 5, amount: taxAmt }]);

    const cleanMobile = (mobileNumber && mobileNumber !== '—') ? mobileNumber : '';
    setIsSettling(true);

    let createdOrderId = null;
    try {
      const orderRes = await orderService.createOrder({
        tableId: Number(resolvedTable?.id) || 1,
        tableNo: String(resolvedTableName),
        customerName: customerName || 'Walk-in',
        mobileNo: cleanMobile,
        customer_address: customerAddress || '',
        customer_locality: customerLocality || '',
        waiter: waiter || 'Staff',
        status: 'unpaid',
        items: allFinalItems,
        discount: discountAmt,
        tax: taxAmt,
        taxes: taxAmt,
        grand_total: netAmt,
        total_amount: netAmt,
        taxes_breakdown: taxBreakdown,
        store_id: activeStoreId || 'STORE_1',
        order_type: serviceType,
        takeaway_no: serviceType === 'Takeaway' ? generatedTakeawayNo : null,
        delivery_no: serviceType === 'Delivery' ? generatedDeliveryNo : null
      });
      createdOrderId = orderRes?.order?.order_id || orderRes?.data?.order_id || orderRes?.order?.id || orderRes?.data?.id;
    } catch (orderErr) {
      console.warn('Non-blocking order persistence warning:', orderErr);
    }

    try {
      if (resolvedId && createdOrderId) {
        try {
          await tableService.patchTableStatus(resolvedId, {
            status: 'UNPAID_BILL',
            amount: netAmt,
            total_amount: netAmt,
            current_order_id: createdOrderId,
            waiter: waiter || resolvedTable?.waiter,
            customer: customerName || resolvedTable?.customer,
            pax: paxCount || resolvedTable?.pax || 1,
            guests: paxCount || resolvedTable?.guests || 1
          });
        } catch (e) {
          console.warn('Failed to patch table status in backend:', e);
        }
      }

      if (resolvedTable && resolvedTable.id && typeof setTablesList === 'function') {
        setTablesList(prev => (Array.isArray(prev) ? prev : []).map(t => {
          if (String(t.id) === String(resolvedTable.id)) {
            return {
              ...t,
              status: 'UNPAID_BILL',
              color: 'blue',
              amount: netAmt,
              total_amount: netAmt,
              current_order_id: createdOrderId || t.current_order_id,
              waiter: waiter || t.waiter,
              customer: customerName || t.customer,
              pax: paxCount || t.pax || t.seats,
              paxCount: paxCount || t.paxCount || t.seats,
              updatedAt: Date.now()
            };
          }
          return t;
        }));
      }
      if (typeof refreshTables === 'function') {
        refreshTables();
      }

      if (shouldPrint) {
        // Auto-print the Tax Invoice / Bill directly to ws://localhost:8989
        try {
          await printTaxInvoice({
            invoice_number: createdOrderId || `INV-${resolvedTableName}`,
            table_number: resolvedTableName,
            customer_name: customerName || 'Walk-in',
            customer_phone: mobileNumber || '',
            customer_address: customerAddress || '',
            customer_locality: customerLocality || '',
            waiter_name: waiter || 'Staff',
            pax: paxCount || 1,
            guests: paxCount || 1,
            paxCount: paxCount || 1,
            payment_method: 'Unpaid',
            items: allFinalItems,
            subtotal: subtotalAmt,
            discount: discountAmt,
            discount_reason: (discountLines && discountLines.find(d => d.reason)?.reason) || '',
            discountLines: discountLines,
            grand_total: netAmt,
            taxes_breakdown: taxBreakdown && taxBreakdown.length > 0 ? taxBreakdown : [{ name: 'Tax', rate: 5, amount: taxAmt }],
            serviceType: serviceType,
            takeaway_no: serviceType === 'Takeaway' ? generatedTakeawayNo : null,
            delivery_no: serviceType === 'Delivery' ? generatedDeliveryNo : null,
            store_id: activeStoreId || 'STORE_1'
          });
        } catch (e) {
          console.warn('Failed to print tax invoice:', e);
        }
        toast(`${serviceType} order settled! Bill printed for Table ${resolvedTableName}.`);
      } else {
        toast(`${serviceType} order settled! Bill saved for Table ${resolvedTableName}.`);
      }
    } catch (err) {
      console.warn('Error in POS billing completion:', err);
      toast(`Failed to complete billing: ${err.message || 'Error occurred'}`);
    } finally {
      setIsSettling(false);
      setTimeout(() => {
        isBillingSubmittingRef.current = false;
      }, 500);
      if (isBillingDesk) {
        setRows(INITIAL_ROWS);
        setCustomerName('');
        setMobileNumber('');
        if (typeof setAssignedTableId === 'function') setAssignedTableId(null);
      } else {
        navigate('/restaurant/display-table', {
          state: {
            toastMessage: `✅ ${serviceType} order settled! Bill printed for Table ${resolvedTableName}.`,
            updatedTable: {
              id: resolvedId,
              no: preselectedTableNumber || routedTable?.no || '1',
              status: 'UNPAID_BILL',
              color: 'blue',
              amount: netAmt
            },
            updatedRows: allFinalItems
          }
        });
      }
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
          loadingMenu={loadingMenu}
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
        customerAddress={customerAddress}
        setCustomerAddress={setCustomerAddress}
        customerLocality={customerLocality}
        setCustomerLocality={setCustomerLocality}
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
        deliveryBoy={deliveryBoy}
        setDeliveryBoy={setDeliveryBoy}
        ncType={ncType}
        setNcType={setNcType}
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
        isViewMode={isViewMode}
        discountLines={discountLines}
        setDiscountLines={setDiscountLines}
        updateDiscountLine={updateDiscountLine}
        removeDiscountLine={removeDiscountLine}
        addDiscountLine={addDiscountLine}
        totalDiscountAmt={totalDiscountAmt}
        totalBill={totalBill}
        netBill={netBill}
        totalTax={totalTax}
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
        searchInputRef={searchInputRef}
        searchItem={searchItem}
        setSearchItem={setSearchItem}
        isSettling={isSettling}
        showKotPrintModal={showKotPrintModal}
        setShowKotPrintModal={setShowKotPrintModal}
        showQuickPaymentModal={showQuickPaymentModal}
        setShowQuickPaymentModal={setShowQuickPaymentModal}
        kotGroups={kotGroups}
        kotPayloads={kotPayloads}
        kotSuccessCallbackRef={kotSuccessCallbackRef}
        toast={toast}
      // isViewMode={isViewMode}
      />

      <QuickPaymentModal
        isOpen={showQuickPaymentModal}
        onClose={() => setShowQuickPaymentModal(false)}
        table={{
          ...(tablesList?.find(t => String(t.id) === String(assignedTableId)) || routedTable || { id: assignedTableId, no: assignedTableId || '1', customer: customerName, waiter: waiter, mobile: mobileNumber }),
          total_amount: netBill,
          tax_amount: totalTax,
          discount_amount: totalDiscountAmt
        }}
        items={rows}
        providedNetBill={netBill}
        providedTaxAmt={totalTax}
        providedDiscountAmt={totalDiscountAmt}
        onTableUpdated={() => {
          if (typeof refreshTables === 'function') refreshTables();
          navigate('/restaurant/display-table');
        }}
        showToast={toast}
      />
    </BillingLayout>
  );
};

export default POSBillingPage;
