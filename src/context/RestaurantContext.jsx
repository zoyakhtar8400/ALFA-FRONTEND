import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_TABLES, INITIAL_MOCK_ORDER_DETAILS } from '../pages/Restaurant/constants/mockData';
import { tableService } from '../services/tableService';
import { menuService } from '../services/menuService';

const RestaurantContext = createContext(null);

const AUTO_RESET_MS = 30000; // 30 seconds after paid → reset to Blank

export const RestaurantProvider = ({ children }) => {
  // Always start empty — refreshTables() will load from PostgreSQL on mount.
  // Do NOT seed from localStorage here; it causes stale phantom tables when DB rows are deleted.
  const [tables, setTables] = useState([]);
  const [tablesLoaded, setTablesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // Map raw table API response to normalized table object
  function mapTable(t) {
    const rawStatus = t.status || t.order_state || 'AVAILABLE';
    const statusUpper = String(rawStatus).toUpperCase();
    const color = (['PAYMENT_COMPLETED', 'CLEANUP_RUNNING', 'PAID', 'CLEANING', 'BILL GENERATED'].includes(statusUpper)) ? 'green' :
      (['KOT_CUT', 'ORDERED', 'RUNNING', 'KOT GENERATED', 'OCCUPIED'].includes(statusUpper) || (t.amount && t.amount > 0)) ? 'orange' : 'white';
    
    const isPaymentCompleted = color === 'green';
    const isAvailable = color === 'white';
    const actions = Array.isArray(t.available_actions) && t.available_actions.length > 0
      ? t.available_actions
      : (isPaymentCompleted ? ['print_kot'] : !isAvailable ? ['print_kot', 'view_kot'] : []);

    return {
      id: t.id,
      table_id: t.table_id || t.id,
      no: String(t.no || t.table_no || t.id).replace(/[^0-9]/g, '').padStart(2, '0') || String(t.id).padStart(2, '0'),
      table_name: t.table_name || `Table ${t.no}`,
      seats: Number(t.seats || t.max_person) || 4,
      status: rawStatus,
      current_order_id: t.current_order_id || 0,
      payment_status: t.payment_status || (isPaymentCompleted ? 'PAID' : 'UNPAID'),
      kot_status: t.kot_status || (color === 'orange' ? 'CUT' : 'NONE'),
      payment_completed_at: t.payment_completed_at || (t.extra_details && t.extra_details.payment_completed_at) || null,
      cleanup_after_seconds: t.cleanup_after_seconds || 60,
      remaining_seconds: t.remaining_seconds !== undefined ? t.remaining_seconds : 60,
      color: color,
      available_actions: actions,
      amount: Number(t.amount || 0),
      waiter: t.waiter || null,
      customer: t.customer || 'Walk-in',
      floor: t.floor || 'Ground',
      section: t.section || 'Main Area',
      kots: Array.isArray(t.kots) ? t.kots : [],
      kotCount: Number(t.kotCount || (Array.isArray(t.kots) ? t.kots.length : 0))
    };
  }

  // refreshTables — always re-fetches from PostgreSQL and replaces state.
  // Clears tables if DB is empty so stale cache never shows phantom tables.
  const refreshTables = React.useCallback(async () => {
    try {
      const tableRes = await tableService.getTables();
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
          if (tbl.no) nextItemsMap[tbl.no] = allItems;
        }
      });
      setOrderItemsMap(nextItemsMap);
    } catch (err) {
      console.warn('refreshTables error:', err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tables ONCE on mount
  useEffect(() => {
    refreshTables().then(() => setTablesLoaded(true));
  }, []);

  // Live countdown ticker & Auto-reset Cleaning / Paid tables to Blank when timer hits 0 (60s)
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setTables(prev => {
        let hasChanges = false;
        const nextTables = prev.map(t => {
          const isGreen = t.status === 'PAYMENT_COMPLETED' || t.status === 'CLEANUP_RUNNING' || t.status === 'Cleaning' || t.status === 'Paid' || t.status === 'Bill Generated';
          if (isGreen) {
            const startTime = t.payment_completed_at || t.cleanedAt || t.paidAt || t.updatedAt || now;
            const elapsedSec = Math.floor((now - startTime) / 1000);
            const totalCleanupSec = t.cleanup_after_seconds || 60;
            const remSec = Math.max(0, totalCleanupSec - elapsedSec);

            if (remSec <= 0) {
              hasChanges = true;
              tableService.patchTableStatus(t.id, {
                status: 'Blank',
                amount: 0,
                waiter: null,
                customer: 'Walk-in'
              }).then(() => refreshTables()).catch(err => console.warn('Error resetting table status in DB:', err));

              return { ...t, status: 'Blank', color: 'white', remaining_seconds: 0, amount: 0, waiter: null, captain: null, customer: 'Walk-in', openedAt: null, paidAt: null, cleanedAt: null, payment_completed_at: null, isHold: false, kots: [], kotCount: 0 };
            }

            if (t.remaining_seconds !== remSec) {
              hasChanges = true;
              return { ...t, remaining_seconds: remSec };
            }
          }
          return t;
        });

        return hasChanges ? nextTables : prev;
      });
      // Clear orderItemsMap for any table that just reset to Blank
      setOrderItemsMap(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(key => {
          if (next[key] && next[key].length > 0) {
            changed = true;
            delete next[key];
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [refreshTables]);

  // Sync state changes to localStorage
  useEffect(() => {
    try { localStorage.setItem('alfa_restaurant_tables', JSON.stringify(tables)); } catch {}
  }, [tables]);

  // Listen for Table Master CRUD events → immediately re-fetch from PostgreSQL
  useEffect(() => {
    const handleSync = () => refreshTables();
    window.addEventListener('tablesMasterRefreshed', handleSync);
    return () => window.removeEventListener('tablesMasterRefreshed', handleSync);
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

  useEffect(() => {
    try { localStorage.setItem('alfa_restaurant_history', JSON.stringify(tableHistory)); } catch {}
  }, [tableHistory]);

  return (
    <RestaurantContext.Provider value={{ tables, setTables, refreshTables, orderItemsMap, setOrderItemsMap, tableHistory, loading }}>
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
