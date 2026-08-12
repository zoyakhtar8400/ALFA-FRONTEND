import { useState, useEffect, useMemo, useCallback } from 'react';
import posApi from '../../../../api/posApi';

export const useNCTypeMaster = (showToast) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal open states
  const [modal, setModal] = useState({ open: false, isEdit: false, fields: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

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
      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, statusFilter]);

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
      status: fields.status || 'Active'
    };

    posApi.saveNCType(payload).then(() => {
      showToast(modal.isEdit ? 'NC Type updated in PostgreSQL.' : 'NC Type created in PostgreSQL.');
      fetchNCTypes();
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
      showToast('NC Type deactivated in PostgreSQL.');
      fetchNCTypes();
      setDeleteModal({ open: false, row: null });
    }).catch(err => {
      showToast(err?.response?.data?.message || 'Failed to delete NC Type');
    });
  };

  return {
    data: filteredData,
    loading,
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
    handleDelete
  };
};

export default useNCTypeMaster;
