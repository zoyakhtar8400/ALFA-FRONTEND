import { useState, useEffect, useMemo, useCallback } from 'react';
import posApi from '../../../../api/posApi';

export const useStewardMaster = (showToast) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [outletFilter, setOutletFilter] = useState('All');
  const [outletsList, setOutletsList] = useState([]);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // Modal Actions
  const [modal, setModal] = useState({ open: false, mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  useEffect(() => {
    posApi.getOutlets().then(res => {
      const list = res?.data || res?.stores || [];
      setOutletsList(list);
    }).catch(err => console.warn('Failed to fetch outlets in useStewardMaster', err));
  }, []);

  const fetchStewards = useCallback(() => {
    setLoading(true);
    posApi.getStewards().then(res => {
      if (Array.isArray(res?.data)) {
        setData(res.data);
      } else {
        setData([]);
      }
    }).catch(err => {
      console.error('Error fetching stewards:', err);
      setData([]);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStewards();
  }, [fetchStewards]);

  // Filtered and Searched records
  const processedData = useMemo(() => {
    let result = [...data];

    // Outlet filter
    if (outletFilter !== 'All') {
      result = result.filter(row => String(row.store_id || 'STORE_1') === String(outletFilter));
    }

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
  }, [data, searchTerm, statusFilter, outletFilter]);

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
        (modal.mode === 'add' || s.id !== modal.row?.id)
      );
      if (duplicateItem) {
        setDuplicateConfirm({ open: true, fields: formData, duplicateItem });
        return false;
      }
    }

    const payload = {
      id: modal.mode === 'edit' ? modal.row?.id : undefined,
      name: trimmedName,
      store_id: formData.store_id || 'STORE_1',
      active: formData.active !== false ? 'Yes' : 'No'
    };

    posApi.saveSteward(payload).then(() => {
      if (showToast) showToast(modal.mode === 'add' ? 'Steward added successfully in PostgreSQL!' : 'Steward updated successfully in PostgreSQL!');
      fetchStewards();
      try { window.dispatchEvent(new Event('stewardsMasterRefreshed')); } catch (e) { }
      setModal({ open: false, mode: 'add', row: null });
      setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
    }).catch(err => {
      if (showToast) showToast(err?.response?.data?.message || 'Failed to save steward');
    });

    return true;
  }, [data, modal, showToast, fetchStewards]);

  // Delete handler
  const handleDelete = useCallback(() => {
    if (!deleteModal.row) return;
    posApi.deleteSteward(deleteModal.row.id).then(() => {
      if (showToast) showToast('Steward record deactivated in PostgreSQL.');
      fetchStewards();
      try { window.dispatchEvent(new Event('stewardsMasterRefreshed')); } catch (e) { }
      setDeleteModal({ open: false, row: null });
    }).catch(err => {
      if (showToast) showToast(err?.response?.data?.message || 'Failed to delete steward');
    });
  }, [deleteModal, showToast, fetchStewards]);

  return {
    data: processedData,
    rawCount: data.length,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    outletFilter,
    setOutletFilter,
    outletsList,
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

export default useStewardMaster;
