import { useState, useEffect, useMemo, useCallback } from 'react';
import posApi from '../../../../api/posApi';

export const useItemRateCategory = (showToast) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal open states
  const [modal, setModal] = useState({ open: false, isEdit: false, fields: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  const fetchRates = useCallback(() => {
    setLoading(true);
    posApi.getItemRateCategories().then(res => {
      const ratesList = Array.isArray(res?.data) ? res.data : [];
      const mapped = ratesList.map((r, idx) => ({
        id: r.id || idx + 1,
        name: r.name || 'Rate Category',
        code: r.code || 'RATE',
        activeDays: 'All Days',
        multiplier: '1.0',
        status: r.status || 'Active'
      }));
      setData(mapped);
    }).catch(err => {
      console.error('Error fetching rate categories:', err);
      setData([]);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchRates();
  }, [fetchRates]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch =
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.activeDays || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const validate = (fields, skipDuplicateCheck = false) => {
    if (!fields.name || fields.name.trim().length < 2) {
      showToast('Rate Category Name must be at least 2 characters.');
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
      code: fields.code || fields.name.slice(0, 3).toUpperCase(),
      status: fields.status || 'Active'
    };

    posApi.saveItemRateCategory(payload).then(() => {
      showToast(modal.isEdit ? 'Rate category updated in PostgreSQL.' : 'Rate category created in PostgreSQL.');
      fetchRates();
      setModal({ open: false, isEdit: false, fields: {} });
      setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
    }).catch(err => {
      showToast(err?.response?.data?.message || 'Failed to save rate category');
    });
    return true;
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    posApi.deleteItemRateCategory(deleteModal.row.id).then(() => {
      showToast('Rate category deactivated in PostgreSQL.');
      fetchRates();
      setDeleteModal({ open: false, row: null });
    }).catch(err => {
      showToast(err?.response?.data?.message || 'Failed to delete rate category');
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

export default useItemRateCategory;
