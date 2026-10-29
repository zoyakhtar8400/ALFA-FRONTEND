import { useState, useEffect, useMemo, useCallback } from 'react';
import posApi from '../../../../api/posApi';

export const useNCTypeMaster = (showToast) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [outletFilter, setOutletFilter] = useState('All');
  const [outletsList, setOutletsList] = useState([]);
  
  // Modal open states
  const [modal, setModal] = useState({ open: false, isEdit: false, fields: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  useEffect(() => {
    posApi.getOutlets().then(res => {
      const list = res?.data || res?.stores || [];
      setOutletsList(list);
    }).catch(err => console.warn('Failed to fetch outlets in useNCTypeMaster', err));
  }, []);

  const fetchNCTypes = useCallback(() => {
    setLoading(true);
    posApi.getNCTypes().then(res => {
      const ncList = Array.isArray(res?.data) ? res.data : [];
      setData(ncList);
    }).catch(err => {
      console.error('Error fetching NC types:', err);
      setData([]);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchNCTypes();
  }, [fetchNCTypes]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch = (item.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchOutlet = outletFilter === 'All' || String(item.store_id || 'STORE_1') === String(outletFilter);
      return matchSearch && matchStatus && matchOutlet;
    });
  }, [data, searchTerm, statusFilter, outletFilter]);

  const validate = (fields, skipDuplicateCheck = false) => {
    if (!fields.name || fields.name.trim().length < 2) {
      showToast('NC Type must be at least 2 characters.');
      return false;
    }
    if (!skipDuplicateCheck) {
      const duplicateItem = data.find(item => 
        item.id !== fields.id && 
        (item.name || '').toLowerCase().trim() === fields.name.toLowerCase().trim()
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

    const payload = {
      id: fields.id,
      name: fields.name,
      code: fields.code || fields.name.slice(0, 4).toUpperCase(),
      store_id: fields.store_id || 'STORE_1',
      status: fields.status || 'Active'
    };

    posApi.saveNCType(payload).then(() => {
      showToast(modal.isEdit ? 'NC Type updated in PostgreSQL.' : 'NC Type created in PostgreSQL.');
      fetchNCTypes();
      try { window.dispatchEvent(new Event('ncTypesMasterRefreshed')); } catch (e) { }
      setModal({ open: false, isEdit: false, fields: {} });
      setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
    }).catch(err => {
      showToast(err?.response?.data?.message || 'Failed to save NC Type');
    });
    return true;
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    posApi.deleteNCType(deleteModal.row.id).then(() => {
      showToast('NC Type deleted from PostgreSQL.');
      fetchNCTypes();
      try { window.dispatchEvent(new Event('ncTypesMasterRefreshed')); } catch (e) { }
      setDeleteModal({ open: false, row: null });
    }).catch(err => {
      showToast(err?.response?.data?.message || 'Failed to delete NC Type');
    });
  };

  const handleBulkDelete = async (selectedRows) => {
    let deletedCount = 0;
    for (const row of selectedRows) {
      if (row.id) {
        try {
          await posApi.deleteNCType(row.id);
          deletedCount++;
        } catch (e) { }
      }
    }
    showToast(`Deleted ${deletedCount} NC Type(s) successfully.`);
    fetchNCTypes();
    try { window.dispatchEvent(new Event('ncTypesMasterRefreshed')); } catch (e) { }
  };

  return {
    data: filteredData,
    rawCount: data.length,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    outletFilter,
    setOutletFilter,
    outletsList,
    modal,
    setModal,
    deleteModal,
    setDeleteModal,
    duplicateConfirm,
    setDuplicateConfirm,
    handleSave,
    handleDelete,
    handleBulkDelete
  };
};

export default useNCTypeMaster;
