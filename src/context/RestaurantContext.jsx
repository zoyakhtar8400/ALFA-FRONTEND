import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { INITIAL_TABLES, INITIAL_MOCK_ORDER_DETAILS } from '../pages/Restaurant/constants/mockData';
import { tableService } from '../services/tableService';
import { menuService } from '../services/menuService';
import posApi from '../api/posApi';

const RestaurantContext = createContext(null);

const AUTO_RESET_MS = 30000; // 30 seconds after paid → reset to Blank

export const RestaurantProvider = ({ children }) => {
  // Always start empty — refreshTables() will load from PostgreSQL on mount.
  // Do NOT seed from localStorage here; it causes stale phantom tables when DB rows are deleted.
  const [tables, setTables] = useState([]);
  const [tablesLoaded, setTablesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeOutletId, setActiveOutletId] = useState(null);
  const [activeStoreId, setActiveStoreId] = useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('alfa_user') || localStorage.getItem('user') || '{}');
      return user.store_id || 'STORE_1';
    } catch {
      return 'STORE_1';
    }
  });
  const [outletNotFound, setOutletNotFound] = useState(false);
  const [allOutlets, setAllOutlets] = useState([]);

  const [orderItemsMap, setOrderItemsMap] = useState({});

  const [tableHistory, setTableHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_restaurant_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch static menu and department data once on initial load
  useEffect(() => {
    async function fetchStaticData() {
      try {
        await Promise.allSettled([
          menuService.getMenu(),
          menuService.getDepartments()
        ]);
      } catch (err) {
        console.warn('Static menu fetch warning:', err.message);
      }
    }
    fetchStaticData();
  }, []);

  const refreshOutlets = useCallback(() => {
    posApi.getOutlets()
      .then(res => {
        const outlets = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        setAllOutlets(outlets);
        try {
          localStorage.setItem('alfa_outlets', JSON.stringify(outlets));
        } catch (e) {}
      })
      .catch(err => console.warn('Failed to preload/refresh outlets:', err.message));
  }, []);

  // Fetch all outlets on mount so sidebar/navbar can resolve outlet names immediately
  useEffect(() => {
    refreshOutlets();

    const handleLogin = () => {
      try {
        const user = JSON.parse(localStorage.getItem('alfa_user') || localStorage.getItem('user') || '{}');
        if (user.store_id) setActiveStoreId(user.store_id);
      } catch (e) {}
      refreshOutlets();
    };

    window.addEventListener('authLoginSuccess', handleLogin);
    return () => window.removeEventListener('authLoginSuccess', handleLogin);
  }, [refreshOutlets]);

  // Listen for live outlet master refresh events
  useEffect(() => {
    window.addEventListener('outletsMasterRefreshed', refreshOutlets);
    return () => window.removeEventListener('outletsMasterRefreshed', refreshOutlets);
  }, [refreshOutlets]);

  // Map raw table API response to normalized table object
  function mapTable(t) {
    const extra = t.extra_details || {};
    const rawStatus = (extra.status === 'Reserved' || String(t.status).toLowerCase() === 'reserved' || String(t.order_state).toUpperCase() === 'RESERVED') ? 'Reserved' : (t.status || t.order_state || 'AVAILABLE');
    const statusUpper = String(rawStatus).toUpperCase();
    const isNCBlocked = statusUpper === 'NC_BLOCKED' || t.color === 'purple' || extra.status === 'NC_BLOCKED' || extra.color === 'purple';
    const isReserved = !isNCBlocked && (statusUpper === 'RESERVED' || rawStatus === 'Reserved');
    const isPaid = !isNCBlocked && ['PAYMENT_COMPLETED', 'CLEANUP_RUNNING', 'PAID', 'CLEANING'].includes(statusUpper);
    const isUnpaid = !isNCBlocked && !isReserved && !isPaid && (['UNPAID_BILL', 'UNPAID'].includes(statusUpper) || t.color === 'blue' || t.color === 'red' || extra.color === 'blue' || extra.color === 'red' || extra.status === 'UNPAID_BILL');
    const isRunning = !isNCBlocked && !isReserved && !isPaid && !isUnpaid && (['KOT_CUT', 'ORDERED', 'RUNNING', 'KOT GENERATED', 'OCCUPIED'].includes(statusUpper) || (Number(t.amount || 0) > 0));

    // When a table is paid, it immediately becomes Blank (white) with no 60s green delay
    const color = isNCBlocked ? 'purple' : isReserved ? 'orange' : isUnpaid ? 'blue' : isRunning ? 'yellow' : 'white';
    const normalizedStatus = isNCBlocked ? 'NC_BLOCKED' : isReserved ? 'Reserved' : isUnpaid ? 'Unpaid' : isRunning ? 'Running' : 'Blank';

    const isAvailable = color === 'white';
    const actions = Array.isArray(t.available_actions) && t.available_actions.length > 0
      ? t.available_actions
      : (color === 'yellow' || color === 'blue' || (!isAvailable && !isReserved)) ? ['print_kot', 'view_kot'] : [];

    const prefix = t.prefix || extra.prefix || '';
    const tableNoStr = String(t.no || t.table_no || t.id).replace(/[^0-9]/g, '') || String(t.id);
    const cleanNum = parseInt(tableNoStr, 10) || tableNoStr;
    const displayName = prefix ? `${prefix}${cleanNum}` : (t.table_name || `Table ${tableNoStr}`);

    return {
      id: t.id,
      table_id: t.table_id || t.id,
      no: String(tableNoStr).padStart(2, '0'),
      table_name: displayName,
      seats: Number(t.seats || t.max_person) || 4,
      status: normalizedStatus,
      raw_status: rawStatus,
      current_order_id: isAvailable ? 0 : (t.current_order_id || 0),
      payment_status: isAvailable ? 'AVAILABLE' : (t.payment_status || 'UNPAID'),
      kot_status: isAvailable ? 'NONE' : (t.kot_status || (color === 'yellow' ? 'CUT' : 'NONE')),
      payment_completed_at: null,
      cleanup_after_seconds: 0,
      remaining_seconds: 0,
      color: color,
      available_actions: actions,
      amount: isAvailable ? 0 : Number(t.amount || 0),
      waiter: isAvailable ? null : (t.waiter || null),
      customer: isAvailable ? 'Walk-in' : (t.customer || 'Walk-in'),
      pax: isAvailable ? null : (t.pax || t.guests || t.paxCount || extra.pax || extra.guests || null),
      guests: isAvailable ? null : (t.guests || t.pax || t.paxCount || extra.guests || extra.pax || null),
      paxCount: isAvailable ? null : (t.paxCount || t.pax || t.guests || extra.pax || extra.guests || null),
      area: t.area || (t.extra_details && (t.extra_details.area || t.extra_details.floor)) || t.floor || (t.extra_details && t.extra_details.floor) || t.area_name || t.floor_name || 'Main Area',
      floor: t.area || (t.extra_details && (t.extra_details.area || t.extra_details.floor)) || t.floor || (t.extra_details && t.extra_details.floor) || t.area_name || t.floor_name || 'Main Area',
      section: t.section || (t.extra_details && t.extra_details.section) || t.department || 'Restaurant',
      department: t.department || (t.extra_details && (t.extra_details.department || t.extra_details.section)) || 'Restaurant',
      store_id: t.store_id || (t.extra_details && t.extra_details.store_id) || 'STORE_1',
      kots: isAvailable ? [] : (Array.isArray(t.kots) ? t.kots : []),
      kotCount: isAvailable ? 0 : Number(t.kotCount || (Array.isArray(t.kots) ? t.kots.length : 0))
    };
  }

  // refreshTables — always re-fetches from PostgreSQL and replaces state.
  // Clears tables if DB is empty so stale cache never shows phantom tables.
  const refreshTables = React.useCallback(async (explicitStoreId) => {
    try {
      const storeToFetch = explicitStoreId || activeStoreId || 'STORE_1';
      const tableRes = await tableService.getTables({ store_id: storeToFetch });
      const rawTables = tableRes?.tables || tableRes?.data || [];
      // Always update — even if empty, so deleted tables disappear
      const uniqueMap = new Map();
      if (Array.isArray(rawTables)) {
        rawTables.forEach(t => {
          const key = String(t.id);
          if (!uniqueMap.has(key)) uniqueMap.set(key, mapTable(t));
        });
      }
      const sorted = Array.from(uniqueMap.values()).sort((a, b) => {
        const numA = parseInt(String(a.table_name || a.no || '').replace(/\D/g, '')) || 0;
        const numB = parseInt(String(b.table_name || b.no || '').replace(/\D/g, '')) || 0;
        if (numA !== numB) return numA - numB;
        return String(a.table_name || '').localeCompare(String(b.table_name || ''));
      });
      setTables(sorted);

      // Populate orderItemsMap directly from active KOT items returned from PostgreSQL
      const nextItemsMap = {};
      sorted.forEach(tbl => {
        if (Array.isArray(tbl.kots) && tbl.kots.length > 0) {
          const allItems = tbl.kots.flatMap(k => Array.isArray(k.items) ? k.items : []);
          nextItemsMap[tbl.id] = allItems;
          nextItemsMap[String(tbl.id)] = allItems;
          if (tbl.no) {
            nextItemsMap[tbl.no] = allItems;
            nextItemsMap[String(tbl.no)] = allItems;
            nextItemsMap[Number(tbl.no)] = allItems;
            nextItemsMap[`T${tbl.no}`] = allItems;
          }
        }
      });
      setOrderItemsMap(nextItemsMap);
    } catch (err) {
      console.warn('refreshTables error:', err.message);
    } finally {
      setLoading(false);
    }
  }, [activeStoreId]);

  // Fetch tables on mount and whenever activeStoreId / refreshTables changes
  useEffect(() => {
    refreshTables().then(() => setTablesLoaded(true));
  }, [refreshTables]);

  // Sync state changes to localStorage
  useEffect(() => {
    try { localStorage.setItem('alfa_restaurant_tables', JSON.stringify(tables)); } catch { }
  }, [tables]);

  // Listen for Table Master & Area Master CRUD events → immediately re-fetch from PostgreSQL
  useEffect(() => {
    const handleSync = () => refreshTables();
    window.addEventListener('tablesMasterRefreshed', handleSync);
    window.addEventListener('tableMasterSync', handleSync);
    window.addEventListener('areaMasterRefreshed', handleSync);
    window.addEventListener('areasMasterRefreshed', handleSync);
    return () => {
      window.removeEventListener('tablesMasterRefreshed', handleSync);
      window.removeEventListener('tableMasterSync', handleSync);
      window.removeEventListener('areaMasterRefreshed', handleSync);
      window.removeEventListener('areasMasterRefreshed', handleSync);
    };
  }, [refreshTables]);

  // Refresh tables whenever the user navigates back to this tab / page
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshTables();
      }
    };
    const handlePopstate = () => refreshTables();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('popstate', handlePopstate);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('popstate', handlePopstate);
    };
  }, [refreshTables]);

  // orderItemsMap is session-only — never persist to localStorage to prevent stale item accumulation

  const selectOutlet = React.useCallback(async (outletId) => {
    try {
      setOutletNotFound(false);
      let outlets = allOutlets;
      let matched = outlets.find(o => Number(o.id) === Number(outletId));

      if (!matched) {
        const res = await posApi.getOutlets();
        const freshOutlets = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        if (freshOutlets.length > 0) {
          setAllOutlets(freshOutlets);
          outlets = freshOutlets;
          matched = outlets.find(o => Number(o.id) === Number(outletId));
        }
      }

      if (!matched) {
        setOutletNotFound(true);
        return;
      }

      const storeIdStr = matched.store_id || `STORE_${matched.id}`;

      // Clear active tables list, orders map, and sessionStorage immediately to prevent leakage
      setTables([]);
      setOrderItemsMap({});
      try {
        sessionStorage.removeItem('alfa_selected_pos_table');
        sessionStorage.removeItem('alfa_selected_order');
        localStorage.removeItem('alfa_restaurant_tables');
      } catch (e) { }

      setActiveOutletId(Number(outletId));
      setActiveStoreId(storeIdStr);

      // Update local storage so session stays aligned
      try {
        localStorage.setItem('activeOutletId', storeIdStr);
        localStorage.setItem('active_outlet_name', matched.name || matched.store_name || '');
        const user = JSON.parse(localStorage.getItem('alfa_user') || localStorage.getItem('user') || '{}');
        user.store_id = storeIdStr;
        localStorage.setItem('alfa_user', JSON.stringify(user));
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new CustomEvent('outletChanged', { detail: { storeId: storeIdStr, outletId, outletName: matched.name || matched.store_name } }));
      } catch (e) { }

      // Trigger table refresh for this specific store_id
      await refreshTables(storeIdStr);
    } catch (err) {
      console.warn('Error resolving outlet workspace:', err);
      setOutletNotFound(true);
    }
  }, [allOutlets, refreshTables]);

  return (
    <RestaurantContext.Provider value={{
      tables,
      setTables,
      refreshTables,
      orderItemsMap,
      setOrderItemsMap,
      tableHistory,
      loading,
      activeOutletId,
      activeStoreId,
      outletNotFound,
      selectOutlet,
      allOutlets
    }}>
      {children}
    </RestaurantContext.Provider>
  );
};


export const useRestaurant = () => {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
};
