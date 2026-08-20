import { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

/**
 * useOutletFilter
 * 
 * Reusable hook to:
 * - Fetch outlets list from backend database
 * - Manage active outlet filter state
 * - Expose helper to filter lists of items by the selected outlet
 */
export const useOutletFilter = () => {
  const [outlets, setOutlets] = useState([]);
  const [outletFilter, setOutletFilter] = useState('All');

  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        const res = await apiClient.get('/stores');
        const list = res?.data || res || [];
        if (Array.isArray(list)) {
          setOutlets(list.map(s => ({
            id: s.id,
            store_id: s.store_id || `STORE_${s.id}`,
            name: s.store_name || s.name || `Outlet ${s.id}`
          })));
        }
      } catch (err) {
        console.warn('Error fetching outlets in hook:', err.message);
      }
    };
    fetchOutlets();
  }, []);

  const filterData = (data, storeIdField = 'store_id') => {
    if (outletFilter === 'All') return data;
    return data.filter(item => String(item[storeIdField]) === String(outletFilter));
  };

  return {
    outlets,
    outletFilter,
    setOutletFilter,
    filterData
  };
};

export default useOutletFilter;
