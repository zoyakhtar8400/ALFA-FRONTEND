import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import {
  FaSearch,
  FaExchangeAlt,
  FaCalendarAlt,
  FaClipboardList
} from 'react-icons/fa';

import TableCard from '../components/TableCard';
import TableOperationsModal from '../components/TableOperationsModal';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import BookTableModal from '../components/BookTableModal';
import CommonModal from '../../../components/common/CommonModal';
import QuickPaymentModal from '../components/QuickPaymentModal';
import TableMasterForm from '../../PointOfSale/Masters/TableMaster/TableMasterForm';
import NCReleaseModal from '../components/NCReleaseModal';
import CancelKOTModal from '../components/CancelKOTModal';
import InvoicePreviewModal from '../components/InvoicePreviewModal';

import { useTableOperations } from '../hooks/useTableOperations';
import { SERVICES } from '../constants/mockData';
import { printTaxInvoice, printKitchenKOT, generateInvoiceHTML } from '../utils/printInvoice';
import { orderService } from '../../../services/orderService';
import { tableService } from '../../../services/tableService';
import { kotService } from '../../../services/kotService';
import { menuService } from '../../../services/menuService';
import { reservationService } from '../../../services/reservationService';
import areaService from '../../../services/areaService';
import { restaurantApi } from '../../../api/restaurantApi';
import posApi from '../../../api/posApi';
import { useRestaurant } from '../../../context/RestaurantContext';

const DisplayTablePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { outletId } = useParams();
  const { activeStoreId } = useRestaurant();

  const getBillingPath = () => {
    return outletId ? `/pos/master/outlet/${outletId}/pos-billing` : '/restaurant/pos-billing';
  };

  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewHtmlContent, setPreviewHtmlContent] = useState('');
  const [previewInvoiceData, setPreviewInvoiceData] = useState(null);

  // Helper to fetch rich details from backend and print instantly
  const handlePrintPaidTable = async (table) => {
    try {
      const targetId = (table.current_order_id && table.current_order_id !== 0) ? table.current_order_id : `table-${table.id}`;
      const res = await orderService.getOrderById(targetId);
      let fetchedOrder = res?.order || res?.data;
      if (!fetchedOrder) {
        fetchedOrder = {
          tableNo: table.no,
          kotId: `INV-${table.no}-${Math.floor(1000 + Math.random() * 9000)}`,
          customerName: table.customer_name || 'Walk-in',
          waiterName: table.waiter_name || 'Staff',
          subtotal: table.amount,
          amount: table.amount,
          items: [],
          printerName: table.printerName || ''
        };
      }
      
      const { default: companyProfileService } = await import('../../../services/companyProfileService');
      let companyProfile = {};
      try {
        const cpRes = await companyProfileService.getProfile();
        companyProfile = cpRes?.data || cpRes?.companyProfile || (cpRes && cpRes.id ? cpRes : {});
      } catch (err) {
        console.warn('Failed to load company profile for print:', err);
      }

      const html = generateInvoiceHTML(fetchedOrder, companyProfile, false);
      setPreviewHtmlContent(html);
      setPreviewInvoiceData({ ...fetchedOrder, printerName: table.printerName || '' });
      setPreviewModalOpen(true);
      
    } catch (err) {
      console.warn('Direct print failed', err);
      if (window.showToast) window.showToast('Failed to generate bill preview');
    }
  };

  // Use modular table operations hook
  const {
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
    equalSplitCount,
    setEqualSplitCount,
    splitPercentSource,
    setSplitPercentSource,
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
    newItemName,
    setNewItemName,
    newItemQty,
    setNewItemQty,
    newItemRemarks,
    setNewItemRemarks,
    selectedGuests,
    setSelectedGuests,
    selectedWaiter,
    setSelectedWaiter,
    selectedCaptain,
    setSelectedCaptain,
    activeSourceItems,
    showSettleSuccess,
    toast,
    updateTableField,
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
  } = useTableOperations(location, navigate);

  const [filter, setFilter] = useState('All');
  const [service, setService] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [activeRestaurant, setActiveRestaurant] = useState('All Outlets');
  const [dbOutlets, setDbOutlets] = useState([]);
  const [rawOutletsList, setRawOutletsList] = useState([]);
  const [focusedTableIndex, setFocusedTableIndex] = useState(-1);
  const [isKeyboardNav, setIsKeyboardNav] = useState(false); // only show selection ring during keyboard nav
  const [previewTable, setPreviewTable] = useState(null);
  const [quickPaymentTable, setQuickPaymentTable] = useState(null);
  const [kotCancelTable, setKotCancelTable] = useState(null);
  const [kotCancelReason, setKotCancelReason] = useState('');
  const [kotCancelError, setKotCancelError] = useState('');
  const [ncReleaseTable, setNcReleaseTable] = useState(null);

  // Load real outlets directly from Outlet Master (/stores) & Department API
  useEffect(() => {
    async function loadOutlets() {
      try {
        const [storesRes, depsRes] = await Promise.allSettled([
          posApi.getOutlets(),
          menuService.getDepartments()
        ]);

        const outletMap = new Map();
        const rawList = [];

        // 1. From Outlet Master (/stores)
        if (storesRes.status === 'fulfilled') {
          const stores = Array.isArray(storesRes.value?.data) ? storesRes.value.data : (Array.isArray(storesRes.value) ? storesRes.value : []);
          stores.forEach((s, idx) => {
            const extra = typeof s.settings === 'object' && s.settings ? s.settings : {};
            const title = s.store_name || s.name || extra.outletTitle || `Outlet ${idx + 1}`;
            const sId = s.store_id || `STORE_${s.id || idx + 1}`;
            if (title && title.trim()) {
              outletMap.set(title.trim(), { id: s.id, store_id: sId, name: title.trim(), title: extra.outletTitle || title.trim() });
              rawList.push({ id: s.id, store_id: sId, name: title.trim(), title: extra.outletTitle || title.trim() });
            }
          });
        }

        // 2. From Departments (/department)
        if (depsRes.status === 'fulfilled') {
          const deps = depsRes.value?.departments || depsRes.value?.data || [];
          if (Array.isArray(deps)) {
            deps.forEach((d, idx) => {
              const name = d.department_name || d.name || d.title;
              if (name && name.trim() && !outletMap.has(name.trim())) {
                const sId = d.store_id || `STORE_${idx + 1}`;
                outletMap.set(name.trim(), { id: d.id, store_id: sId, name: name.trim(), title: name.trim() });
                rawList.push({ id: d.id, store_id: sId, name: name.trim(), title: name.trim() });
              }
            });
          }
        }

        setRawOutletsList(rawList);

        if (outletMap.size > 0) {
          const list = Array.from(outletMap.keys());
          setDbOutlets(list);
          // Set default to Main Restaurant or the first restaurant outlet
          setActiveRestaurant(prev => {
            if (prev && prev !== 'All Outlets' && list.includes(prev)) return prev;
            const mainRes = list.find(o => /main restaurant|restaurant|main/i.test(o)) || list[0];
            return mainRes;
          });
        }
      } catch (err) {
        console.warn('Failed to load database outlets:', err.message);
      }
    }
    loadOutlets();
  }, []);

  const outletOptions = React.useMemo(() => {
    const set = new Set();
    dbOutlets.forEach(d => {
      if (d && d.trim()) set.add(d.trim());
    });
    if (set.size === 0) {
      set.add('Main Restaurant');
    }
    // 'All Outlets' option
    const result = ['All Outlets', ...Array.from(set)];
    return result;
  }, [dbOutlets]);

  // Listen for live sync events while this page is open
  useEffect(() => {
    const handleSync = (e) => {
      if (e.detail && Array.isArray(e.detail.tables)) {
        setTables(e.detail.tables);
      }
    };
    window.addEventListener('tableMasterSync', handleSync);
    return () => window.removeEventListener('tableMasterSync', handleSync);
  }, []);

  // 1-second interval for green (Paid) table cleaning countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTables(prev => {
        let hasChanges = false;
        const updated = prev.map(t => {
          const statusUpper = (t.status || '').toUpperCase();
          const isPaidTable = ['PAYMENT_COMPLETED', 'CLEANUP_RUNNING', 'PAID', 'CLEANING'].includes(statusUpper) || t.color === 'green';
          if (!isPaidTable) return t;

          const currentRem = t.remaining_seconds !== undefined ? t.remaining_seconds : 60;
          if (currentRem > 1) {
            hasChanges = true;
            return { ...t, remaining_seconds: currentRem - 1 };
          } else if (currentRem === 1) {
            // Timer expired -> table is cleaned and returns to Blank
            hasChanges = true;
            tableService.patchTableStatus(t.id, {
              status: 'AVAILABLE',
              amount: 0,
              customer: 'Walk-in',
              waiter: null
            }).catch(() => { });
            return {
              ...t,
              status: 'Blank',
              color: 'white',
              amount: 0,
              customer: 'Walk-in',
              waiter: null,
              remaining_seconds: 0,
              available_actions: [],
              updatedAt: Date.now()
            };
          }
          return t;
        });
        return hasChanges ? updated : prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Automatically reload live tables from PostgreSQL database whenever this page is mounted or navigated to
  useEffect(() => {
    refreshTables();
  }, [location, refreshTables]);

  // Refs for keyboard nav (avoid stale closures)
  const filteredDataRef = React.useRef([]);
  const focusedTableIndexRef = React.useRef(-1);
  useEffect(() => {
    focusedTableIndexRef.current = focusedTableIndex;
  }, [focusedTableIndex]);

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState(null);

  // Book Table modal state and handlers
  const [bookModalOpen, setBookModalOpen] = useState(false);

  // Date Filter & Reservations for selected date
  const todayStr = React.useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [dateReservations, setDateReservations] = useState([]);
  const [loadingDateReservations, setLoadingDateReservations] = useState(false);

  const fetchReservationsForDate = React.useCallback(async (targetDate) => {
    try {
      setLoadingDateReservations(true);
      const res = await reservationService.getReservations({ date: targetDate || selectedDate });
      const list = res?.reservations || res?.data || (Array.isArray(res) ? res : []);
      setDateReservations(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Error loading reservations for date:', err);
    } finally {
      setLoadingDateReservations(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchReservationsForDate(selectedDate);
  }, [selectedDate, fetchReservationsForDate]);

  // Booking flow states
  const [showSelectTableDialog, setShowSelectTableDialog] = useState(false);
  const [isBookingMode, setIsBookingMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (previewTable) {
          setPreviewTable(null);
        } else {
          setIsBookingMode(false);
          setFocusedTableIndex(-1);
        }
        return;
      }
      // Arrow key navigation across table cards
      if (['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        // Only when no modal/input is focused
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT' || document.activeElement.tagName === 'TEXTAREA') return;
        e.preventDefault();
        setIsKeyboardNav(true); // show selection ring only during keyboard nav
        setFocusedTableIndex(prev => {
          const len = filteredDataRef.current.length;
          if (len === 0) return -1;
          if (prev === -1) return 0;

          let cols = 5;
          const container = document.querySelector('.pos-table-grid');
          if (container) {
            const compStyles = window.getComputedStyle(container);
            const gridTemplateCols = compStyles.getPropertyValue('grid-template-columns');
            if (gridTemplateCols) {
              cols = gridTemplateCols.split(' ').length || 5;
            }
          }

          let nextIdx = prev;
          if (e.key === 'ArrowRight') nextIdx = Math.min(prev + 1, len - 1);
          if (e.key === 'ArrowLeft') nextIdx = Math.max(prev - 1, 0);
          if (e.key === 'ArrowDown') nextIdx = Math.min(prev + cols, len - 1);
          if (e.key === 'ArrowUp') nextIdx = Math.max(prev - cols, 0);
          focusedTableIndexRef.current = nextIdx;
          return nextIdx;
        });
      }
      if (e.key === 'Enter' && focusedTableIndexRef.current >= 0) {
        const t = filteredDataRef.current[focusedTableIndexRef.current];
        if (t) handleTableCardClick(t);
      }
      if (e.key === 'F8' && focusedTableIndexRef.current >= 0) {
        e.preventDefault();
        const t = filteredDataRef.current[focusedTableIndexRef.current];
        if (t) handleTableCardClick(t);
      }
      // F-key shortcuts
      if (e.key === 'F2') {
        e.preventDefault();
        const t = focusedTableIndexRef.current >= 0 ? filteredDataRef.current[focusedTableIndexRef.current] : null;
        navigate('/front-desk/operation/booking', {
          state: {
            roomNo: t && t.status === 'Blank' ? `Table T${t.no}` : null,
            source: 'POS'
          }
        });
      }
      if (e.key === 'F4') {
        e.preventDefault();
        const t = focusedTableIndexRef.current >= 0 ? filteredDataRef.current[focusedTableIndexRef.current] : null;
        if (t) {
          const items = orderItemsMap[t.id] || orderItemsMap[t.no] || [];
          if (items.length === 0) return toast('No items to generate KOT. Select items first in POS Billing.');
          const newKotId = `KOT-${String(Date.now()).slice(-4)}-${Math.floor(100 + Math.random() * 900)}`;
          const newKot = { id: newKotId, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), items: items.map(it => ({ name: it.name || it.itemName, qty: it.qty })) };
          const calculatedAmt = items.reduce((sum, it) => sum + ((it.qty || 1) * (it.unitPrice || it.price || 0)), 0);

          // Optimistic local state update (0ms delay!)
          setTables(prev => prev.map(tb => (String(tb.id) === String(t.id) || String(tb.no) === String(t.no)) ? { ...tb, kots: [...(tb.kots || []), newKot], kotCount: (tb.kots || []).length + 1, status: 'Running', color: 'yellow', amount: calculatedAmt || tb.amount, updatedAt: Date.now() } : tb));
          toast(`KOT generated: ${newKotId}`);

          // Persist to PostgreSQL backend database asynchronously
          kotService.createKOT({
            kotNo: newKotId,
            tableId: t.id,
            tableNo: String(t.no),
            customerName: t.customer || 'Walk-in',
            waiter: t.waiter || 'Staff',
            items: items,
            store_id: activeStoreId
          }).then(() => {
            restaurantApi.patchTableStatus(t.id, {
              status: 'Running',
              amount: calculatedAmt
            }).catch(console.warn);
          }).catch(err => {
            console.error('Error creating KOT:', err);
          });
        }
      }
      if (e.key === 'F10') {
        e.preventDefault();
        const t = focusedTableIndexRef.current >= 0 ? filteredDataRef.current[focusedTableIndexRef.current] : null;
        if (t && t.status !== 'Blank') handleDownload(t);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [orderItemsMap, previewTable]);

  // Add Table modal state
  const [addTableModalOpen, setAddTableModalOpen] = useState(false);

  const handleBookTable = async (bookingData) => {
    const { tableId, tableNo, tableName, customerName, phone, guestsCount, persons, occasion, bookingDate, bookingTime, checkIn, isToday } = bookingData;

    try {
      // 1. Persist reservation to PostgreSQL database TableReservation
      await reservationService.createReservation({
        tableId: Number(tableId),
        tableNo: String(tableNo || ''),
        tableName: tableName || `Table ${tableNo || tableId}`,
        customerName: customerName.trim(),
        name: customerName.trim(),
        phone: phone || '',
        persons: Number(persons || guestsCount || 4),
        guestsCount: Number(persons || guestsCount || 4),
        occasion: occasion || '',
        bookingDate: bookingDate,
        booking_date: bookingDate,
        bookingTime: bookingTime,
        booking_time: bookingTime,
        status: 'Reserved',
        isToday: isToday,
        checkIn: checkIn || `${bookingDate}T${bookingTime}:00`,
        check_in: bookingTime || `${bookingDate} ${bookingTime}`,
        created_at: bookingDate || new Date().toISOString().split('T')[0]
      });

      // 2. If booking date is for today, mark the table as Reserved in database & state
      if (isToday) {
        setTables(prev => prev.map(t => {
          if (String(t.id) === String(tableId)) {
            return {
              ...t,
              status: 'Reserved',
              customer: customerName.trim(),
              seats: Number(guestsCount || 4),
              color: 'orange',
              openedAt: Date.now()
            };
          }
          return t;
        }));

        await tableService.patchTableStatus(tableId, {
          status: 'Reserved',
          customer: customerName.trim(),
          seats: Number(guestsCount || 4)
        }).catch(() => { });

        await refreshTables();
        toast(`Table T${tableNo || tableId} reserved for today (${customerName})!`);
      } else {
        toast(`Table T${tableNo || tableId} booked for ${bookingDate} (${customerName})!`);
      }

      await fetchReservationsForDate(selectedDate);
    } catch (err) {
      console.error('Error creating table booking in PostgreSQL:', err);
      if (isToday) {
        setTables(prev => prev.map(t => {
          if (String(t.id) === String(tableId)) {
            return {
              ...t,
              status: 'Reserved',
              customer: customerName,
              seats: guestsCount,
              openedAt: Date.now()
            };
          }
          return t;
        }));
        toast(`Table T${tableNo || tableId} reserved for today!`);
      } else {
        toast(`Table booked for ${bookingDate}!`);
      }
    }
  };

  const releaseNcTable = async (table) => {
    try {
      // 1. Close all active KOTs on this table (mark is_active=0, status=6)
      await kotService.closeTableKOTs(table.id);

      // 2. Patch table status to Blank / AVAILABLE
      await tableService.patchTableStatus(table.id, {
        status: 'AVAILABLE',
        amount: 0,
        customer: 'Walk-in',
        waiter: null
      });

      // 3. Reset local state
      setTables(prev => prev.map(t => {
        if (t.id === table.id) {
          return { ...t, status: 'Blank', color: 'white', amount: 0, waiter: null, captain: null, customer: 'Walk-in', openedAt: null, isHold: false, kots: [], kotCount: 0 };
        }
        return t;
      }));
      setOrderItemsMap(prev => ({
        ...prev,
        [table.id]: []
      }));

      toast(`Table T${table.no} released successfully.`);
      refreshTables();
    } catch (err) {
      console.error('Error releasing NC table:', err);
      toast('Failed to release the NC table.');
    }
  };

  // Card triggers & routing
  const handleTableCardClick = (table) => {
    const isBlankTable = table.status === 'Blank' || table.status === 'AVAILABLE';
    const statusUpper = (table.status || table.order_state || '').toUpperCase();
    const isNCBlocked = statusUpper === 'NC_BLOCKED' || table.color === 'purple';

    if (isNCBlocked) {
      const userRaw = localStorage.getItem('alfa_user') || localStorage.getItem('user');
      let isUserAdmin = false;
      try {
        if (userRaw) {
          const u = JSON.parse(userRaw);
          isUserAdmin = String(u.role || u.type || '').toUpperCase() === 'ADMIN' || u.username === 'admin';
        }
      } catch (e) { }

      if (!isUserAdmin) {
        toast("This table has an active Non-Chargeable KOT and cannot be billed.");
        return;
      }

      setNcReleaseTable(table);
      return;
    }

    const kotItemsFromTable = Array.isArray(table.kots) ? table.kots.flatMap(k => Array.isArray(k.items) ? k.items : []).filter(i => i.status !== 'Cancelled' && String(i.status) !== '5' && i.is_active !== 0 && i.status !== 'Deleted') : [];
    const tableRows = isBlankTable ? [] : (
      (orderItemsMap[table.id] && orderItemsMap[table.id].length > 0 ? orderItemsMap[table.id] : null) ||
      (orderItemsMap[table.no] && orderItemsMap[table.no].length > 0 ? orderItemsMap[table.no] : null) ||
      (orderItemsMap[String(table.no)] && orderItemsMap[String(table.no)].length > 0 ? orderItemsMap[String(table.no)] : null) ||
      (orderItemsMap[`T${table.no}`] && orderItemsMap[`T${table.no}`].length > 0 ? orderItemsMap[`T${table.no}`] : null) ||
      (kotItemsFromTable.length > 0 ? kotItemsFromTable : [])
    );
    try {
      sessionStorage.setItem('alfa_selected_pos_table', JSON.stringify({
        table,
        tableId: table.id,
        tableNumber: `T${table.no}`,
        rows: tableRows
      }));
    } catch (e) { }

    if (isBookingMode) {
      if (table.status !== 'Blank') {
        toast("Please select a Blank table for booking!");
        return;
      }
      setIsBookingMode(false);
      navigate(getBillingPath(), {
        state: {
          table,
          tableId: table.id,
          tableNumber: `T${table.no}`,
          rows: tableRows,
          isNewBooking: true
        }
      });
    } else {
      const idx = filteredDataRef.current.findIndex(t => t.id === table.id);
      if (idx !== -1) {
        setFocusedTableIndex(idx);
      }

      if (table.status === 'Blank') {
        navigate(getBillingPath(), {
          state: {
            table,
            tableId: table.id,
            tableNumber: `T${table.no}`,
            rows: tableRows,
            isNewBooking: true
          }
        });
      } else if (table.status === 'Paid') {
        handlePrintPaidTable(table);
      } else {
        // Direct order edit on clicking any running/occupied table!
        navigate(getBillingPath(), {
          state: {
            table,
            tableId: table.id,
            tableNumber: `T${table.no}`,
            rows: [],
            existingRows: tableRows
          }
        });
      }
    }
  };

  const handleView = () => {
    navigate('/restaurant/view-kot');
  };

  const handleDownload = (table) => {
    if (table.status === 'Paid') {
      handlePrintPaidTable(table);
      return;
    }
    const rows = orderItemsMap[table.id] || [];
    navigate(getBillingPath(), { state: { table, orderRows: rows, autoSettle: true } });
  };

  const handleDeleteClick = async (table) => {
    if (!table) return;
    const statusUpper = (table.status || table.order_state || '').toUpperCase();
    const isBlank = table.status === 'Blank' || statusUpper === 'BLANK' || statusUpper === 'AVAILABLE' || table.color === 'white';
    const isOccupied = !isBlank;

    if (isOccupied) {
      setKotCancelTable(table);
      setKotCancelReason('');
      setKotCancelError('');
    } else {
      try {
        await tableService.patchTableStatus(table.id, { status: 'Blank' });
      } catch (err) {
        console.warn('Error resetting table status in PostgreSQL:', err);
      }
      setTables(prev => prev.map(t => {
        if (t.id === table.id) {
          return { ...t, status: 'Blank', amount: 0, waiter: null, captain: null, customer: 'Walk-in', openedAt: null, isHold: false, kots: [], kotCount: 0 };
        }
        return t;
      }));
      setOrderItemsMap(prev => ({
        ...prev,
        [table.id]: []
      }));
      toast(`Table T${table.no} reset to Blank.`);
    }
  };

  const handleAddNewTable = () => {
    setAddTableModalOpen(true);
  };

  const handleSaveTableFromMaster = async (fields) => {
    try {
      const activeStoreId = fields.store_id || 'STORE_1';
      await tableService.createTable({
        table_name: fields.name || `Table ${fields.no}`,
        max_person: String(fields.pax || 4),
        department: 1,
        area: fields.area || 'Main Dining Area',
        floor: fields.area || 'Main Dining Area',
        store_id: activeStoreId,
        no: fields.no
      });

      toast(`Table added successfully!`);
      setAddTableModalOpen(false);
      refreshTables();

      // Dispatch events to refresh other views if needed
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tableMasterRefreshed'));
        window.dispatchEvent(new CustomEvent('areasMasterRefreshed'));
      }
    } catch (err) {
      console.error('Error adding table:', err);
      toast("Failed to add table to database.");
    }
  };

  // Areas from Area Master database
  const [dbAreasList, setDbAreasList] = useState([]);

  const fetchDbAreas = React.useCallback(async () => {
    try {
      const res = await areaService.getAreas();
      let list = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res?.areas)) {
        list = res.areas;
      } else if (Array.isArray(res?.data?.data)) {
        list = res.data.data;
      } else if (Array.isArray(res?.data?.areas)) {
        list = res.data.areas;
      }
      if (list.length > 0) {
        const names = list
          .filter(a => a && (a.active !== 'No' && a.isActive !== false))
          .filter(a => {
            if (!activeStoreId) return true;
            if (!a.store_id || a.store_id === '') return true;
            return String(a.store_id).replace('STORE_', '') === String(activeStoreId).replace('STORE_', '');
          })
          .map(a => typeof a === 'string' ? a : (a.name || a.area_name || a.areaName || ''))
          .filter(Boolean);
        setDbAreasList(names);
      }
    } catch (err) {
      console.warn('Error loading areas from Area Master for DisplayTablePage:', err);
    }
  }, [activeStoreId]);

  useEffect(() => {
    fetchDbAreas();

    const handleSync = () => {
      fetchDbAreas();
    };

    window.addEventListener('areaMasterRefreshed', handleSync);
    window.addEventListener('areasMasterRefreshed', handleSync);
    window.addEventListener('tableMasterSync', handleSync);
    window.addEventListener('tablesMasterRefreshed', handleSync);
    window.addEventListener('focus', handleSync);

    return () => {
      window.removeEventListener('areaMasterRefreshed', handleSync);
      window.removeEventListener('areasMasterRefreshed', handleSync);
      window.removeEventListener('tableMasterSync', handleSync);
      window.removeEventListener('tablesMasterRefreshed', handleSync);
      window.removeEventListener('focus', handleSync);
    };
  }, [fetchDbAreas]);

  // Areas and Status Filters
  const dynamicAreas = React.useMemo(() => {
    // 1. If Area Master has areas, ONLY show those areas (+ 'All')
    if (dbAreasList && dbAreasList.length > 0) {
      const unique = Array.from(new Set(dbAreasList.filter(a => a && a.trim())));
      return ['All', ...unique];
    }
    // 2. Otherwise if Area Master is empty, check if tables have assigned areas
    const areaSet = new Set(['All']);
    tables.forEach(t => {
      const tableArea = t.area;
      if (tableArea && typeof tableArea === 'string' && tableArea.trim()) {
        areaSet.add(tableArea.trim());
      }
    });
    return Array.from(areaSet);
  }, [tables, dbAreasList]);

  const STATUS_FILTERS = ['All', 'Blank', 'Running', 'Unpaid', 'Reserved', 'Paid', 'Cleaning', 'NC Blocked'];

  // When viewing a future/specific date, tables reflect reservations on that date only (all other tables are completely blank)
  const dateAdjustedTables = React.useMemo(() => {
    if (!selectedDate || selectedDate === todayStr) {
      return tables;
    }
    return tables.map(t => {
      const cleanTNo = String(t.no || t.table_no || t.id).replace(/[^0-9]/g, '');
      const matchedRes = dateReservations.find(r =>
        (r.tableId && String(r.tableId) === String(t.id)) ||
        (r.tableNo && String(r.tableNo).replace(/[^0-9]/g, '') === cleanTNo)
      );

      if (matchedRes && matchedRes.status !== 'Cancelled') {
        return {
          ...t,
          status: 'Reserved',
          order_state: 'RESERVED',
          orderState: 'RESERVED',
          color: 'orange',
          customer: matchedRes.customerName || matchedRes.name || 'Walk-in',
          seats: matchedRes.persons || t.seats,
          amount: 0,
          waiter: null,
          openedAt: null,
          available_actions: [],
          reservation: matchedRes
        };
      }

      return {
        ...t,
        status: 'Blank',
        order_state: 'AVAILABLE',
        orderState: 'AVAILABLE',
        color: 'white',
        amount: 0,
        waiter: null,
        openedAt: null,
        available_actions: [],
        customer: 'Walk-in',
        reservation: null
      };
    });
  }, [tables, selectedDate, todayStr, dateReservations]);

  const filteredData = React.useMemo(() => {
    const result = dateAdjustedTables.filter(t => {
      const tableNoStr = String(t.no || '');
      const matchesSearch = !search || tableNoStr.toLowerCase().includes(search.toLowerCase()) || (t.waiter && t.waiter.toLowerCase().includes(search.toLowerCase()));

      // 1. Area filter matching (All Areas / specific area)
      let matchesArea = true;
      if (filter && filter !== 'All' && filter !== 'All Areas' && filter !== 'All Floors') {
        const ta = String(t.area || t.floor || '').toLowerCase().trim();
        const selA = filter.toLowerCase().trim();
        const normTa = ta.replace(/\s*(area|floor)\s*$/i, '').trim();
        const normSel = selA.replace(/\s*(area|floor)\s*$/i, '').trim();
        matchesArea = ta === selA || normTa === normSel || ta.includes(normSel) || normSel.includes(ta);
      }

      // 2. Status filter
      let matchesStatus = true;
      if (statusFilter && statusFilter !== 'All') {
        const st = String(t.status || '').toLowerCase().trim();
        const hasAmount = Number(t.amount || 0) > 0;
        const isNCBlocked = st === 'nc_blocked' || st === 'nc' || t.color === 'purple';
        const isBlank = !isNCBlocked && (!t.status || st === 'blank' || st === 'available' || st === 'white');
        const isReserved = !isNCBlocked && st === 'reserved';
        const isPaid = !isNCBlocked && (st === 'paid' || st === 'bill generated');
        const isCleaning = !isNCBlocked && st === 'cleaning';
        const isUnpaid = !isNCBlocked && !isReserved && !isPaid && !isCleaning && (st === 'unpaid' || st === 'unpaid_bill' || t.color === 'blue');
        const isRunning = !isNCBlocked && !isReserved && !isPaid && !isCleaning && !isUnpaid && (st === 'running' || st === 'kot generated' || st === 'kot_cut' || st === 'billed' || st === 'occupied' || hasAmount);

        if (statusFilter === 'Blank') {
          matchesStatus = isBlank && !hasAmount;
        } else if (statusFilter === 'Running') {
          matchesStatus = isRunning;
        } else if (statusFilter === 'Unpaid') {
          matchesStatus = isUnpaid;
        } else if (statusFilter === 'Reserved') {
          matchesStatus = isReserved;
        } else if (statusFilter === 'Paid') {
          matchesStatus = isPaid;
        } else if (statusFilter === 'Cleaning') {
          matchesStatus = isCleaning;
        } else if (statusFilter === 'NC Blocked') {
          matchesStatus = isNCBlocked;
        }
      }

      return matchesSearch && matchesArea && matchesStatus;
    });

    // Group tables by area by sorting them
    return result.sort((a, b) => {
      const defaultArea = (dbAreasList && dbAreasList.length > 0) ? dbAreasList[0] : 'MAIN RESTAURANT';
      let areaA = (a.area || defaultArea).trim();
      let areaB = (b.area || defaultArea).trim();

      if (dbAreasList && dbAreasList.length > 0) {
        if (!dbAreasList.includes(areaA)) areaA = defaultArea;
        if (!dbAreasList.includes(areaB)) areaB = defaultArea;
      }

      areaA = areaA.toLowerCase();
      areaB = areaB.toLowerCase();

      if (areaA < areaB) return -1;
      if (areaA > areaB) return 1;
      // If same area, sort by table number
      const numA = parseInt(String(a.no).replace(/\D/g, '') || '0', 10);
      const numB = parseInt(String(b.no).replace(/\D/g, '') || '0', 10);
      return numA - numB;
    });
  }, [dateAdjustedTables, search, filter, statusFilter, dbAreasList]);

  // Keep refs in sync for keyboard handler (avoids stale closures)
  filteredDataRef.current = filteredData;
  focusedTableIndexRef.current = focusedTableIndex;

  return (
    <div style={{ fontFamily: 'var(--font-family, system-ui)', background: '#fff', height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* Booking Mode Instruction Banner */}
      {isBookingMode && (
        <div style={{
          background: 'linear-gradient(90deg, #ea580c 0%, #f97316 100%)',
          color: '#fff',
          padding: '16px 24px',
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '24px',
          fontWeight: 800,
          fontSize: '1rem',
          letterSpacing: '0.5px',
          boxShadow: '0 4px 20px rgba(234, 88, 12, 0.3)',
          borderBottom: '3px solid #c2410c',
          zIndex: 999,
          position: 'sticky',
          top: 0
        }}>
          <span>Select Table For New Booking</span>
          <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '4px', textTransform: 'uppercase' }}>Press ESC To Cancel</span>
        </div>
      )}

      {/* 1. Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {/* Status Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status:-</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#1e293b',
                outline: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'border-color 150ms'
              }}
            >
              {STATUS_FILTERS.map(st => (
                <option key={st} value={st}>
                  {st === 'All' ? 'All Statuses' : st}
                </option>
              ))}
            </select>
          </div>

          {/* Area Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Area:-</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#1e293b',
                outline: 'none',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                transition: 'border-color 150ms'
              }}
            >
              {dynamicAreas.map(ar => (
                <option key={ar} value={ar}>
                  {ar === 'All' ? 'All Areas' : ar}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Table Operations Center */}
          <button
            onClick={() => {
              const activeT = tables.find(t => t.status !== 'Blank') || tables[0];
              setFromTableId(String(activeT.id));
              setToTableId('');
              setShowQuickSwitch(true);
            }}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#0e7490', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 120ms' }}
            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <FaExchangeAlt size={12} /> Move KOT
          </button>

          {/* Book Table Button */}
          <button
            onClick={() => setBookModalOpen(true)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(249, 115, 22, 0.3)',
              transition: 'all 150ms ease-in-out',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 14px rgba(249, 115, 22, 0.45)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(249, 115, 22, 0.3)';
            }}
          >
            <FaCalendarAlt size={12} /> Book Table
          </button>

          {/* Booking List Button — navigates to full Booking List page */}
          {/* <button
            onClick={() => navigate('/restaurant/booking-list')}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #0e7490', background: '#fff', color: '#0e7490', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 120ms' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e0f2fe'}
            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
          >
            <FaClipboardList size={12} /> Booking List
          </button> */}

          {/* Add Table Button */}
          <button
            onClick={handleAddNewTable}
            style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #10b981', background: '#10b981', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', transition: 'all 120ms' }}
            onMouseEnter={e => e.currentTarget.style.background = '#059669'}
            onMouseLeave={e => e.currentTarget.style.background = '#10b981'}
          >
            + Add Table
          </button>

          {/* Service switcher tabs */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '2px' }}>
            {SERVICES.map(({ id, label }) => {
              const isSelected = service === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    if (id === 'Takeaway' || id === 'Delivery') {
                      navigate(getBillingPath(), { state: { serviceType: id, isNewBooking: true, tableNumber: id === 'Takeaway' ? 'Takeaway' : 'Delivery', tableId: id === 'Takeaway' ? 'TK-NEW' : 'DL-NEW' } });
                    } else {
                      setService(id);
                    }
                  }}
                  style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all 150ms ease-in-out', background: isSelected ? '#0f172a' : 'transparent', color: isSelected ? '#fff' : '#64748b' }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Quick Filters, Status Filters and Search */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '16px', padding: '16px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Search box */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <FaSearch style={{ position: 'absolute', left: '10px', color: '#94a3b8', fontSize: '0.85rem' }} />
            <input
              type="text"
              placeholder="Search table/waiter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '200px', padding: '8px 12px 8px 30px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem', outline: 'none', transition: 'border-color 150ms' }}
            />
          </div>

          {/* Date Filter (right side of search bar) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date:-</span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                style={{
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: selectedDate !== todayStr ? '1.5px solid #0e7490' : '1px solid #cbd5e1',
                  background: selectedDate !== todayStr ? '#f0fdfa' : '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: selectedDate !== todayStr ? '#0e7490' : '#1e293b',
                  outline: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              />
            </div>
            {selectedDate !== todayStr && (
              <button
                onClick={() => setSelectedDate(todayStr)}
                title="Reset to today"
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #0e7490',
                  background: '#0e7490',
                  color: '#fff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 120ms'
                }}
              >
                Today
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '8px 24px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#fff', border: '1.5px solid #cbd5e1', display: 'inline-block' }} />
          Blank Table
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#f5c842', border: '1.5px solid #e6b800', display: 'inline-block' }} />
          Running Table
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#2563eb', border: '1.5px solid #1d4ed8', display: 'inline-block' }} />
          Unpaid
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '14px', height: '14px', borderRadius: '3px', background: '#fb923c', border: '1.5px solid #ea7c1e', display: 'inline-block' }} />
          Reserved
        </span>
        <span style={{ marginLeft: 'auto', color: '#94a3b8', fontWeight: 600 }}>
          {selectedDate !== todayStr ? (
            <>
              {dateAdjustedTables.filter(t => t.status === 'Reserved' || t.color === 'orange' || t.order_state === 'RESERVED').length} Reserved &nbsp;·&nbsp; {dateAdjustedTables.filter(t => t.status === 'Blank' || t.status === 'AVAILABLE' || t.color === 'white' || !t.color).length} Blank
            </>
          ) : (
            <>
              {tables.filter(t => t.color === 'yellow' || t.status === 'Running' || t.status === 'KOT Generated' || t.status === 'KOT_CUT' || t.order_state === 'KOT_CUT').length} Running &nbsp;·&nbsp; {tables.filter(t => t.color === 'red' || t.color === 'blue' || t.status === 'Unpaid' || t.status === 'UNPAID_BILL' || t.order_state === 'UNPAID_BILL').length} Unpaid &nbsp;·&nbsp; {tables.filter(t => t.color === 'white' || t.status === 'Blank' || t.status === 'AVAILABLE' || t.order_state === 'AVAILABLE' || !t.status).length} Blank
            </>
          )}
        </span>
      </div>

      {/* 3. Main Tables grid */}
      {loading ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '55vh',
          gap: '16px'
        }}>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{
            width: '42px',
            height: '42px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #0f172a',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>Loading Tables & Backend Data...</span>
        </div>
      ) : (
        <div className="pos-table-grid" style={{
          flex: 1,
          padding: '20px 20px 36px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
          gap: '20px 10px',
          alignContent: 'start',
          overflowY: 'auto',
        }}>
          {filteredData.map((table, idx) => {
            const isBlank = table.status === 'Blank';
            const isHighlighted = isBookingMode && isBlank;
            const isFaded = isBookingMode && !isBlank;
            const defaultArea = (dbAreasList && dbAreasList.length > 0) ? dbAreasList[0] : 'MAIN RESTAURANT';
            let currentArea = (table.area || defaultArea).trim();
            if (dbAreasList && dbAreasList.length > 0 && !dbAreasList.includes(currentArea)) {
              currentArea = defaultArea;
            }

            let previousArea = null;
            if (idx > 0) {
              previousArea = (filteredData[idx - 1].area || defaultArea).trim();
              if (dbAreasList && dbAreasList.length > 0 && !dbAreasList.includes(previousArea)) {
                previousArea = defaultArea;
              }
            }

            const isNewArea = currentArea !== previousArea;

            return (
              <React.Fragment key={`fragment-${table.id}-${idx}`}>
                {isNewArea && (
                  <div style={{
                    gridColumn: '1 / -1',
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    padding: '8px 4px 4px',
                    borderBottom: '2px solid #e2e8f0',
                    marginTop: idx > 0 ? '16px' : '0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    {currentArea}
                  </div>
                )}
                <div key={`table-${table.id}-${idx}`} style={{
                  position: 'relative',
                  borderRadius: '8px',
                  border: isHighlighted ? '3px solid #ea580c' : 'none',
                  boxShadow: isHighlighted ? '0 0 15px rgba(234, 88, 12, 0.8)' : 'none',
                  transform: isHighlighted ? 'scale(1.02)' : 'none',
                  opacity: isFaded ? 0.4 : 1,
                  pointerEvents: isFaded ? 'none' : 'auto',
                  transition: 'all 0.2s ease-in-out'
                }}>
                  <TableCard
                    table={table}
                    isSelected={isKeyboardNav && focusedTableIndex === idx}
                    onClick={(e, actionType) => {
                      if (actionType === 'quick_pay') {
                        e?.stopPropagation?.();
                        const statusUpper = (table.status || table.order_state || '').toUpperCase();
                        if (statusUpper === 'NC_BLOCKED' || table.color === 'purple') {
                          toast("This table has an active Non-Chargeable KOT and cannot be billed.");
                          return;
                        }
                        setQuickPaymentTable(table);
                      } else {
                        setIsKeyboardNav(false);
                        setFocusedTableIndex(idx);
                        handleTableCardClick(table);
                      }
                    }}
                    onView={(e) => {
                      e?.stopPropagation?.();
                      const kotItemsFromTable = Array.isArray(table.kots) ? table.kots.flatMap(k => Array.isArray(k.items) ? k.items : []).filter(i => i.status !== 'Cancelled' && String(i.status) !== '5' && i.is_active !== 0 && i.status !== 'Deleted') : [];
                      const tableRows = (orderItemsMap[table.id] && orderItemsMap[table.id].length > 0 ? orderItemsMap[table.id] : null) || kotItemsFromTable;

                      navigate(getBillingPath(), {
                        state: {
                          table,
                          tableId: table.id,
                          tableNumber: `T${table.no}`,
                          rows: tableRows,
                          existingRows: [],
                          isViewMode: true
                        }
                      });
                    }}
                    onSave={(e) => {
                      e?.stopPropagation?.();
                      handlePrintPaidTable(table);
                    }}
                    onDelete={handleDeleteClick}
                  />
                </div>
              </React.Fragment>
            );
          })}

          {filteredData.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '80px 20px', textAlign: 'center', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>
              No tables found for {activeRestaurant === 'All Outlets' ? 'any outlet' : `outlet "${activeRestaurant}"`}{filter && filter !== 'All' && filter !== 'All Floors' ? ` on ${filter}` : ''}.
            </div>
          )}
        </div>
      )}

      {/* 4. Operations modal wrapper */}
      <TableOperationsModal
        isOpen={showQuickSwitch}
        onClose={() => setShowQuickSwitch(false)}
        tables={tables}
        modalTab={modalTab}
        setModalTab={setModalTab}
        fromTableId={fromTableId}
        setFromTableId={setFromTableId}
        toTableId={toTableId}
        setToTableId={setToTableId}
        transferOp={transferOp}
        setTransferOp={setTransferOp}
        selectedTransferItems={selectedTransferItems}
        setSelectedTransferItems={setSelectedTransferItems}
        selectedTransferKots={selectedTransferKots}
        setSelectedTransferKots={setSelectedTransferKots}
        equalSplitCount={equalSplitCount}
        setEqualSplitCount={setEqualSplitCount}
        splitPercentSource={splitPercentSource}
        setSplitPercentSource={setSplitPercentSource}
        discountPercent={discountPercent}
        setDiscountPercent={setDiscountPercent}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        splitCash={splitCash}
        setSplitCash={setSplitCash}
        splitCard={splitCard}
        setSplitCard={setSplitCard}
        splitUPI={splitUPI}
        setSplitUPI={setSplitUPI}
        newItemName={newItemName}
        setNewItemName={setNewItemName}
        newItemQty={newItemQty}
        setNewItemQty={setNewItemQty}
        newItemRemarks={newItemRemarks}
        setNewItemRemarks={setNewItemRemarks}
        selectedGuests={selectedGuests}
        setSelectedGuests={setSelectedGuests}
        selectedWaiter={selectedWaiter}
        setSelectedWaiter={setSelectedWaiter}
        selectedCaptain={selectedCaptain}
        setSelectedCaptain={setSelectedCaptain}
        activeSourceItems={activeSourceItems}
        showSettleSuccess={showSettleSuccess}
        updateTableField={updateTableField}
        updateTableStatus={updateTableStatus}
        toggleHoldOrder={toggleHoldOrder}
        cancelCompleteOrder={cancelCompleteOrder}
        handleAddItemToOps={handleAddItemToOps}
        handleUpdateItemQty={handleUpdateItemQty}
        handleToggleItemComplimentary={handleToggleItemComplimentary}
        handleDeleteItem={handleDeleteItem}
        handleCreateKOT={handleCreateKOT}
        handleCancelKOT={handleCancelKOT}
        executePaymentSettlement={executePaymentSettlement}
        getBillingSummary={getBillingSummary}
        handleModalOkClick={handleModalOkClick}
      />

      {/* Custom Reason Modal for Table/KOT cancellation */}
      <CancelKOTModal
        isOpen={!!kotCancelTable}
        onClose={() => setKotCancelTable(null)}
        tableId={kotCancelTable?.id}
        onCancelSuccess={() => {
          setKotCancelTable(null);
          refreshTables();
        }}
      />

      <NCReleaseModal
        isOpen={!!ncReleaseTable}
        onClose={() => setNcReleaseTable(null)}
        table={ncReleaseTable}
        onConfirm={async () => {
          const table = ncReleaseTable;
          setNcReleaseTable(null);
          await releaseNcTable(table);
        }}
      />

      <BookTableModal
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        tables={tables}
        onBook={handleBookTable}
        initialDate={selectedDate}
      />

      <InvoicePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        htmlContent={previewHtmlContent}
        onPrint={() => {
          setPreviewModalOpen(false);
          printTaxInvoice(previewInvoiceData);
        }}
      />

      <TableMasterForm
        isOpen={addTableModalOpen}
        onClose={() => setAddTableModalOpen(false)}
        onSave={handleSaveTableFromMaster}
        isEdit={false}
      />

      {/* Select Table First Dialog */}
      {showSelectTableDialog && (
        <>
          <div onClick={() => setShowSelectTableDialog(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(2px)', zIndex: 9999 }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            background: '#fff', padding: '28px 24px', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)',
            width: '380px', zIndex: 10000, textAlign: 'center', fontFamily: 'system-ui', border: '1px solid #e2e8f0'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ea580c', margin: '0 0 8px 0' }}>Select a Table First</h3>
            <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 24px 0', lineHeight: '1.5' }}>
              Please select an available table to continue booking.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowSelectTableDialog(false);
                  setIsBookingMode(true);
                }}
                style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: '#ea580c', color: '#fff', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(234, 88, 12, 0.2)' }}
              >
                Select Table
              </button>
              <button
                onClick={() => setShowSelectTableDialog(false)}
                style={{ padding: '10px 22px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#64748b', fontWeight: '800', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}



      {/* Global CSS Layout styles */}
      <style>{`
        .pos-table-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 28px 20px;
          padding: 24px;
        }
        @media (min-width: 1024px) {
          .pos-table-grid { grid-template-columns: repeat(5, 1fr); }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .pos-table-grid { grid-template-columns: repeat(4, 1fr); }
        }
        @media (min-width: 550px) and (max-width: 767px) {
          .pos-table-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 549px) {
          .pos-table-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* Order Details Preview Overlay Modal */}
      {previewTable && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, fontFamily: 'var(--font-family, system-ui)'
        }}>
          <div style={{
            background: '#fff', borderRadius: '16px', width: '480px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04)',
            border: '1px solid #cbd5e1', overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ background: '#0e7490', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 900 }}>
                Table T{parseInt(previewTable.no)} Details
              </h3>
              <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800 }}>
                {previewTable.status}
              </span>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Meta details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  <strong>Waiter:</strong> {previewTable.waiter || 'Not Assigned'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  <strong>Pax (Seats):</strong> {previewTable.seats || 4}
                </span>
              </div>

              {/* Items List */}
              <div>
                <h4 style={{ margin: '0 0 8px', fontSize: '0.82rem', fontWeight: 800, color: '#334155', textTransform: 'uppercase' }}>Current Order</h4>
                <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                  {(orderItemsMap[previewTable.id] || []).length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ background: '#cbd5e1', borderBottom: '1px solid #e2e8f0' }}>
                          <th style={{ padding: '6px 12px', textAlign: 'left' }}>Item Name</th>
                          <th style={{ padding: '6px 12px', textAlign: 'center', width: '60px' }}>Qty</th>
                          <th style={{ padding: '6px 12px', textAlign: 'right', width: '90px' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(orderItemsMap[previewTable.id] || []).map((it, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px 12px' }}>{it.name}</td>
                            <td style={{ padding: '6px 12px', textAlign: 'center' }}>{it.qty}</td>
                            <td style={{ padding: '6px 12px', textAlign: 'right' }}>₹{(it.qty * (it.rate || it.unitPrice || 0)).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No items in current order.</div>
                  )}
                </div>
              </div>

              {/* Subtotal */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 4px 4px', borderTop: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#475569' }}>Running Amount:</span>
                <strong style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                  ₹{(previewTable.amount || 0).toLocaleString('en-IN')}
                </strong>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ background: '#f8fafc', padding: '12px 20px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setPreviewTable(null)}
                className="btn btn-secondary"
                style={{ height: '36px', fontSize: '0.8rem', padding: '0 16px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  const t = previewTable;
                  setPreviewTable(null);
                  handleDownload(t);
                }}
                className="btn"
                style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', padding: '0 16px', height: '36px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
              >
                Settlement
              </button>
              <button
                onClick={() => {
                  const t = previewTable;
                  setPreviewTable(null);
                  const tableRows = (
                    orderItemsMap[t.id] ||
                    orderItemsMap[t.no] ||
                    orderItemsMap[String(t.no)] ||
                    orderItemsMap[Number(t.no)] ||
                    (t.kots ? t.kots.flatMap(k => k.items || []).filter(i => i.status !== 'Cancelled' && String(i.status) !== '5' && i.is_active !== 0 && i.status !== 'Deleted') : [])
                  );
                  navigate(getBillingPath(), { state: { table: t, tableId: t.id, tableNumber: t.no, rows: tableRows } });
                }}
                className="btn btn-primary"
                style={{ height: '36px', fontSize: '0.8rem', padding: '0 16px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Edit Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Payment & Discount Options Modal (Triggered on clicking View / Edit icon) */}
      <QuickPaymentModal
        isOpen={!!quickPaymentTable}
        onClose={() => setQuickPaymentTable(null)}
        table={quickPaymentTable}
        items={quickPaymentTable ? (
          orderItemsMap[quickPaymentTable.id] ||
          orderItemsMap[quickPaymentTable.no] ||
          orderItemsMap[String(quickPaymentTable.no)] ||
          orderItemsMap[Number(quickPaymentTable.no)] ||
          (quickPaymentTable.kots ? quickPaymentTable.kots.flatMap(k => k.items || []).filter(i => i.status !== 'Cancelled' && String(i.status) !== '5' && i.is_active !== 0 && i.status !== 'Deleted') : []) ||
          (quickPaymentTable.items || [])
        ) : []}
        onTableUpdated={refreshTables}
        showToast={toast}
      />

      {/* Keyboard shortcut hint bar */}
      <div style={{ position: 'sticky', bottom: 0, zIndex: 100, padding: '8px 24px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center', boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
        {[['←→ / ↑↓', 'Navigate'], ['Enter', 'Open Table'], ['F2', 'Book Table'], ['F4', 'Print KOT'], ['F10', 'Quick Bill'], ['Esc', 'Cancel']].map(([key, label]) => (
          <span key={key} style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <kbd style={{ background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, fontFamily: 'monospace' }}>{key}</kbd>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DisplayTablePage;
