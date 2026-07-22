import { useState, useEffect, useMemo, useCallback } from 'react';

const INITIAL_TABLES = [
  { id: 'T1', name: 'T1', pax: 4, department: 'Restaurant', floor: 'Dining', description: 'Corner booth', isActive: true },
  { id: 'T2', name: 'T2', pax: 2, department: 'Restaurant', floor: 'Dining', description: 'Window seat', isActive: true },
  { id: 'T3', name: 'T3', pax: 1, department: 'Bar', floor: 'Bar Stool', description: 'Counter stool', isActive: true },
  { id: 'T4', name: 'T4', pax: 10, department: 'Banquets', floor: 'Banquet', description: 'Large round table', isActive: true }
];

export const useTableMaster = (showToast) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('hms_pos_tables');
    return saved ? JSON.parse(saved) : INITIAL_TABLES;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal open states
  const [modal, setModal] = useState({ open: false, isEdit: false, fields: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  useEffect(() => {
    localStorage.setItem('hms_pos_tables', JSON.stringify(data));

    // ── Sync master tables → Display Table page (alfa_restaurant_tables) ──
    // Strategy: REPLACE the runtime table list with master-sourced tables,
    // preserving live session data (status, kots, amount) for tables that
    // already exist in the runtime list (matched by masterKey or table number).
    // Legacy mock tables (from INITIAL_TABLES, no masterKey) are dropped once
    // a master sync has run — the master is the single source of truth for structure.
    try {
      const existingRaw = localStorage.getItem('alfa_restaurant_tables');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];

      // Build lookups of runtime tables: by masterKey and by table number
      const runtimeByMasterKey = {};
      const runtimeByNo = {};
      existing.forEach(t => {
        if (t.masterKey) runtimeByMasterKey[t.masterKey] = t;
        if (t.no) runtimeByNo[t.no] = t;
      });

      // Convert each active master table → runtime entry
      const finalList = data
        .filter(m => m.isActive !== false)
        .map((m, idx) => {
          const key = m.id; // e.g. 'T1', 'T5432_3'
          const numPart = m.name.replace(/\D/g, '') || String(idx + 1);
          const paddedNo = numPart.padStart(2, '0');

          // Try to find matching runtime table (preserves live status/kots/amount)
          const runtime = runtimeByMasterKey[key] || runtimeByNo[paddedNo] || null;

          if (runtime) {
            // Update structural fields from master, keep all live session data
            return {
              ...runtime,
              id: key,          // normalize id to master key
              masterKey: key,
              seats: Number(m.pax) || runtime.seats || 4,
              floor: m.floor || runtime.floor || 'Ground',
              section: m.department || runtime.section || 'Main Area',
              no: paddedNo,
            };
          }

          // Brand-new table — create a clean blank runtime entry
          return {
            id: key,
            masterKey: key,
            no: paddedNo,
            seats: Number(m.pax) || 4,
            status: 'Blank',
            amount: 0,
            waiter: null,
            captain: null,
            customer: 'Walk-in',
            floor: m.floor || 'Ground',
            section: m.department || 'Main Area',
            kots: [],
            kotCount: 0,
            openedAt: null,
          };
        });

      // Mark that master sync has taken ownership (so context never falls back to mock data)
      localStorage.setItem('alfa_restaurant_master_synced', '1');
      localStorage.setItem('alfa_restaurant_tables', JSON.stringify(finalList));

      // Notify RestaurantContext to update its in-memory state immediately
      window.dispatchEvent(new CustomEvent('tableMasterSync', { detail: { tables: finalList } }));
    } catch (err) {
      console.warn('TableMaster sync to restaurant tables failed:', err);
    }
  }, [data]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'hms_pos_tables' && e.newValue) {
        setData(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch =
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.department || '').toLowerCase().includes(searchTerm.toLowerCase());

      const isActiveValue = item.isActive ? 'Active' : 'Inactive';
      const matchStatus = statusFilter === 'All' || isActiveValue === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const validate = (fields, skipDuplicateCheck = false) => {
    if (!fields.department) {
      showToast('Department is required.');
      return false;
    }
    if (!fields.name || fields.name.trim().length < 1) {
      showToast('Table Name is required.');
      return false;
    }
    if (!fields.pax || Number(fields.pax) <= 0) {
      showToast('PAX capacity must be greater than 0.');
      return false;
    }
    if (!skipDuplicateCheck) {
      const duplicateItem = data.find(item =>
        item.id !== fields.id &&
        (item.name || '').toLowerCase().trim() === (fields.name || '').toLowerCase().trim() &&
        (item.department || '').toLowerCase().trim() === (fields.department || '').toLowerCase().trim()
      );
      if (duplicateItem) {
        setDuplicateConfirm({ open: true, fields, duplicateItem });
        return false;
      }
    }
    return true;
  };

  const handleSave = (fields, skipDuplicateCheck = false) => {
    if (!validate(fields, skipDuplicateCheck)) return false;

    if (modal.isEdit) {
      setData(prev => prev.map(item => item.id === fields.id ? fields : item));
      showToast('Table details updated successfully.');
    } else {
      const newId = `T${Math.floor(Math.random() * 10000)}`;
      setData(prev => [...prev, { ...fields, id: newId }]);
      showToast('Table created successfully.');
    }
    setModal({ open: false, isEdit: false, fields: {} });
    setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
    return true;
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Table deleted successfully.');
    setDeleteModal({ open: false, row: null });
  };

  const handleBulkSave = (bulkFields) => {
    const { prefix, startNum, endNum, department, floor, pax, isActive } = bulkFields;
    
    // Validate inputs
    const start = Number(startNum);
    const end = Number(endNum);
    const capacity = Number(pax);
    
    if (!prefix || prefix.trim() === '') {
      showToast('Table Prefix is required.');
      return false;
    }
    if (isNaN(start) || isNaN(end)) {
      showToast('Start and End numbers must be valid integers.');
      return false;
    }
    if (start >= end) {
      showToast('Starting Number must be less than Ending Number.');
      return false;
    }
    const count = end - start + 1;
    if (count > 100) {
      showToast('Maximum 100 tables can be created per batch.');
      return false;
    }
    if (!department) {
      showToast('Section (Department) is required.');
      return false;
    }
    if (isNaN(capacity) || capacity <= 0) {
      showToast('Capacity must be greater than 0.');
      return false;
    }

    // Generate table names and check duplicates
    const newTables = [];
    for (let i = start; i <= end; i++) {
      const tableName = `${prefix}${i}`;
      
      // Check duplicate in existing database (case insensitive, trim whitespace)
      const existsInDb = data.some(item => 
        (item.name || '').toLowerCase().trim() === tableName.toLowerCase().trim() &&
        (item.department || '').toLowerCase().trim() === department.toLowerCase().trim()
      );
      if (existsInDb) {
        showToast(`Table "${tableName}" already exists in this department.`);
        return false;
      }
      
      newTables.push({
        id: `T${Math.floor(Math.random() * 100000)}_${i}`,
        name: tableName,
        pax: capacity,
        department: department,
        floor: floor || '',
        description: `Bulk Created: Type ${floor || 'Standard'}`,
        isActive: isActive === true
      });
    }

    // Save generated list
    setData(prev => [...prev, ...newTables]);
    showToast(`Successfully created ${newTables.length} tables in bulk!`);
    return true;
  };

  return {
    data: filteredData,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    modal,
    setModal,
    deleteModal,
    setDeleteModal,
    duplicateConfirm,
    setDuplicateConfirm,
    handleSave,
    handleDelete,
    handleBulkSave
  };
};
