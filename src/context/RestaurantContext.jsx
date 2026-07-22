import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_TABLES, INITIAL_MOCK_ORDER_DETAILS } from '../pages/Restaurant/constants/mockData';

const RestaurantContext = createContext(null);

const AUTO_RESET_MS = 30000; // 30 seconds after paid → reset to Blank

export const RestaurantProvider = ({ children }) => {
  const [tables, setTables] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_restaurant_tables');
      // If TableMaster has ever synced, always use its data (never fall back to mock data)
      const masterSynced = localStorage.getItem('alfa_restaurant_master_synced') === '1';
      if (saved) return JSON.parse(saved);
      if (masterSynced) return [];       // master synced but table list cleared → empty
      return INITIAL_TABLES;             // first-ever load, no master sync yet
    } catch {
      return INITIAL_TABLES;
    }
  });

  const [orderItemsMap, setOrderItemsMap] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_restaurant_orders');
      return saved ? JSON.parse(saved) : INITIAL_MOCK_ORDER_DETAILS;
    } catch {
      return INITIAL_MOCK_ORDER_DETAILS;
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

  // Auto-reset Paid tables to Blank after AUTO_RESET_MS, archive history
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      setTables(prev => {
        const toReset = prev.filter(
          t => (t.status === 'Paid' || t.status === 'Bill Generated') && t.paidAt && (now - t.paidAt) >= AUTO_RESET_MS
        );
        if (toReset.length === 0) return prev;
        // Archive
        setTableHistory(h => {
          const archived = toReset.map(t => ({ ...t, archivedAt: now }));
          const updated = [...archived, ...h].slice(0, 500);
          try { localStorage.setItem('alfa_restaurant_history', JSON.stringify(updated)); } catch {}
          return updated;
        });
        // Reset orders for those tables
        setOrderItemsMap(om => {
          const next = { ...om };
          toReset.forEach(t => { next[t.id] = []; });
          return next;
        });
        return prev.map(t =>
          toReset.find(r => r.id === t.id)
            ? { ...t, status: 'Blank', amount: 0, waiter: null, captain: null, customer: 'Walk-in', openedAt: null, paidAt: null, isHold: false, kots: [], kotCount: 0 }
            : t
        );
      });
    }, 5000);
    return () => clearInterval(id);
  }, []);

  // Helper: reload tables from localStorage (used by both event handlers below)
  const reloadTablesFromStorage = () => {
    try {
      const saved = localStorage.getItem('alfa_restaurant_tables');
      if (saved) setTables(JSON.parse(saved));
    } catch {}
  };

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

  // Sync state changes to localStorage
  useEffect(() => {
    try { localStorage.setItem('alfa_restaurant_tables', JSON.stringify(tables)); } catch {}
  }, [tables]);

  useEffect(() => {
    try { localStorage.setItem('alfa_restaurant_orders', JSON.stringify(orderItemsMap)); } catch {}
  }, [orderItemsMap]);

  useEffect(() => {
    try { localStorage.setItem('alfa_restaurant_history', JSON.stringify(tableHistory)); } catch {}
  }, [tableHistory]);

  return (
    <RestaurantContext.Provider value={{ tables, setTables, orderItemsMap, setOrderItemsMap, tableHistory }}>
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
