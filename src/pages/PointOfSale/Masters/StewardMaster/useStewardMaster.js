import { useState, useEffect, useMemo, useCallback } from 'react';

// Seeds for Steward Master records
const INITIAL_STEWARDS = [
  { id: 1, name: 'Rakesh', active: 'Yes' },
  { id: 2, name: 'Amit', active: 'Yes' },
  { id: 3, name: 'Sanjay', active: 'Yes' },
  { id: 4, name: 'Vijay', active: 'Yes' }
];

export const useStewardMaster = (showToast) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Modal Actions
  const [modal, setModal] = useState({ open: false, mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  // Initialize data from localStorage or initial seed
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      try {
        const stored = localStorage.getItem('alfa_hms_stewards');
        if (stored) {
          setData(JSON.parse(stored));
        } else {
          localStorage.setItem('alfa_hms_stewards', JSON.stringify(INITIAL_STEWARDS));
          setData(INITIAL_STEWARDS);
        }
      } catch (err) {
        if (showToast) showToast('Error reading steward records');
      } finally {
        // Simple simulated fetch delay
        setTimeout(() => {
          setLoading(false);
        }, 300);
      }
    };
    loadData();
  }, []);

  // Persist local data changes
  const saveToStorage = (updatedList) => {
    localStorage.setItem('alfa_hms_stewards', JSON.stringify(updatedList));
    setData(updatedList);
  };

  // Filtered and Searched records
  const processedData = useMemo(() => {
    let result = [...data];

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(row => {
        const val = String(row.active || '').toLowerCase();
        return val === (statusFilter === 'Active' ? 'yes' : 'no');
      });
    }

    // Search filter
    if (searchTerm.trim() !== '') {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(row => 
        String(row.name || '').toLowerCase().includes(lowerSearch)
      );
    }

    return result;
  }, [data, searchTerm, statusFilter]);

  // Pagination bounds
  const totalEntries = processedData.length;
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = processedData.slice(indexOfFirstEntry, indexOfLastEntry);

  const openAdd = useCallback(() => {
    setModal({ open: true, mode: 'add', row: null });
  }, []);

  const openEdit = useCallback((row) => {
    setModal({ open: true, mode: 'edit', row });
  }, []);

  const openDelete = useCallback((row) => {
    setDeleteModal({ open: true, row });
  }, []);

  // Form submit handler
  const handleSave = useCallback((formData, skipDuplicateCheck = false) => {
    const trimmedName = String(formData.name || '').trim();

    // Validation
    if (!trimmedName) {
      if (showToast) showToast('Steward name is required');
      return false;
    }
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      if (showToast) showToast('Steward name must be between 2 and 50 characters');
      return false;
    }

    if (!skipDuplicateCheck) {
      const duplicateItem = data.find(s =>
        s.name.toLowerCase() === trimmedName.toLowerCase() &&
        (modal.mode === 'add' || s.id !== modal.row.id)
      );
      if (duplicateItem) {
        setDuplicateConfirm({ open: true, fields: formData, duplicateItem });
        return false;
      }
    }

    let updatedList;
    if (modal.mode === 'add') {
      const newRow = {
        id: Date.now(),
        name: trimmedName,
        active: formData.active ? 'Yes' : 'No'
      };
      updatedList = [...data, newRow];
      if (showToast) showToast('Steward added successfully!');
    } else {
      updatedList = data.map(s =>
        s.id === modal.row.id
          ? { ...s, name: trimmedName, active: formData.active ? 'Yes' : 'No' }
          : s
      );
      if (showToast) showToast('Steward updated successfully!');
    }

    saveToStorage(updatedList);
    setModal({ open: false, mode: 'add', row: null });
    setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
    return true;
  }, [data, modal, showToast]);

  // Delete handler
  const handleDelete = useCallback(() => {
    if (!deleteModal.row) return;
    const updatedList = data.filter(s => s.id !== deleteModal.row.id);
    saveToStorage(updatedList);
    if (showToast) showToast('Steward record deleted successfully.');
    setDeleteModal({ open: false, row: null });
  }, [data, deleteModal, showToast]);

  return {
    data,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    entriesPerPage,
    setEntriesPerPage,
    totalEntries,
    indexOfFirstEntry,
    currentEntries,
    modal,
    setModal,
    deleteModal,
    setDeleteModal,
    duplicateConfirm,
    setDuplicateConfirm,
    openAdd,
    openEdit,
    openDelete,
    handleSave,
    handleDelete
  };
};
