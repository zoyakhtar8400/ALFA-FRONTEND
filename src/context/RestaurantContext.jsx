import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_TABLES, INITIAL_MOCK_ORDER_DETAILS } from '../pages/Restaurant/constants/mockData';
import { tableService } from '../services/tableService';
import { menuService } from '../services/menuService';

const RestaurantContext = createContext(null);

const AUTO_RESET_MS = 30000; // 30 seconds after paid → reset to Blank

export const RestaurantProvider = ({ children }) => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const [orderItemsMap, setOrderItemsMap] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_restaurant_orders');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

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

  // Fetch live tables status from Express Backend API with 10s polling interval
  useEffect(() => {
    async function fetchTablesData() {
      try {
        const tableRes = await tableService.getTables();
        const rawTables = tableRes?.tables || tableRes?.data || [];
        if (Array.isArray(rawTables) && rawTables.length > 0) {
          const mapped = rawTables.map(t => ({
            id: t.id,
            table_id: t.table_id || t.id,
            no: String(t.no || t.table_no || t.id).replace(/[^0-9]/g, '').padStart(2, '0') || String(t.id).padStart(2, '0'),
            table_name: t.table_name || `Table ${t.no}`,
            seats: Number(t.seats || t.max_person) || 4,
            status: t.status || t.order_state || 'AVAILABLE',
            current_order_id: t.current_order_id || 0,
            payment_status: t.payment_status || 'UNPAID',
            kot_status: t.kot_status || 'NONE',
            payment_completed_at: t.payment_completed_at || null,
            cleanup_after_seconds: t.cleanup_after_seconds || 60,
            remaining_seconds: t.remaining_seconds !== undefined ? t.remaining_seconds : 0,
            color: t.color || 'white',
            available_actions: Array.isArray(t.available_actions) ? t.available_actions : [],
            amount: Number(t.amount || 0),
            waiter: t.waiter || null,
            customer: t.customer || 'Walk-in',
            floor: t.floor || 'Ground',
            section: t.section || 'Main Area',
            kots: [],
            kotCount: 0
          }));
          setTables(mapped);
        }
      } catch (err) {
        console.warn('Backend API connection fallback:', err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTablesData();
    const interval = setInterval(fetchTablesData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Auto-reset Cleaning / Paid tables to Blank after countdown expires (45 seconds)
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setTables(prev => {
        const toReset = prev.filter(t => {
          if (t.status === 'Cleaning' || t.status === 'Paid' || t.status === 'Bill Generated') {
            const startTime = t.cleanedAt || t.paidAt || t.updatedAt || now;
            return (now - startTime) >= 45000;
          }
          return false;
        });

        if (toReset.length === 0) return prev;

        // Reset PostgreSQL backend state for each expired cleaning table
        toReset.forEach(t => {
          tableService.patchTableStatus(t.id, {
            status: 'Blank',
            amount: 0,
            waiter: null,
            customer: 'Walk-in'
          }).catch(err => console.warn('Error resetting table status in DB:', err));
        });

        // Reset order items map
        setOrderItemsMap(om => {
          const next = { ...om };
          toReset.forEach(t => { next[t.id] = []; });
          return next;
        });

        return prev.map(t =>
          toReset.find(r => r.id === t.id)
            ? { ...t, status: 'Blank', amount: 0, waiter: null, captain: null, customer: 'Walk-in', openedAt: null, paidAt: null, cleanedAt: null, isHold: false, kots: [], kotCount: 0 }
            : t
        );
      });
    }, 3000);
    return () => clearInterval(id);
  }, []);

  // Helper: reload tables from PostgreSQL API
  const reloadTablesFromStorage = async () => {
    try {
      const res = await tableService.getTables();
      const rawTables = res?.tables || res?.data || [];
      if (Array.isArray(rawTables) && rawTables.length > 0) {
        const mapped = rawTables.map(t => ({
          id: t.id,
          no: String(t.no || t.table_no || t.id).replace(/[^0-9]/g, '').padStart(2, '0') || String(t.id).padStart(2, '0'),
          seats: Number(t.seats || t.max_person) || 4,
          status: t.status || t.order_state || 'Blank',
          amount: Number(t.amount || 0),
          waiter: t.waiter || null,
          customer: t.customer || 'Walk-in',
          floor: t.floor || 'Ground',
          section: t.section || 'Main Area',
          kots: [],
          kotCount: 0
        }));
        setTables(mapped);
      }
    } catch {}
  };

  // Sync state changes to localStorage
  useEffect(() => {
    try { localStorage.setItem('alfa_restaurant_tables', JSON.stringify(tables)); } catch {}
  }, [tables]);

  // Listen for TableMaster → DisplayTablePage live sync event (same-tab)
  useEffect(() => {
    const handleTableMasterSync = (e) => {
      if (e.detail && Array.isArray(e.detail.tables)) {
        setTables(e.detail.tables);
      }
    };
    window.addEventListener('tableMasterSync', handleTableMasterSync);
    return () => window.removeEventListener('tableMasterSync', handleTableMasterSync);
  }, []);

  // Refresh tables whenever the user navigates back to this tab / page
  // This covers: browser back/forward, tab switching, React Router navigation
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        reloadTablesFromStorage();
      }
    };
    const handlePopstate = () => reloadTablesFromStorage();

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('popstate', handlePopstate);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('popstate', handlePopstate);
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem('alfa_restaurant_orders', JSON.stringify(orderItemsMap)); } catch {}
  }, [orderItemsMap]);

  useEffect(() => {
    try { localStorage.setItem('alfa_restaurant_history', JSON.stringify(tableHistory)); } catch {}
  }, [tableHistory]);

  return (
    <RestaurantContext.Provider value={{ tables, setTables, orderItemsMap, setOrderItemsMap, tableHistory, loading }}>
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
