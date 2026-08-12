import { useState, useEffect, useMemo, useCallback } from 'react';
import posApi from '../../../../api/posApi';

export const useItemTaxCategory = (showToast) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal open states
  const [modal, setModal] = useState({ open: false, isEdit: false, fields: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  const fetchTaxes = useCallback(() => {
    setLoading(true);
    posApi.getItemTaxCategories().then(res => {
      const taxesList = Array.isArray(res?.data) ? res.data : [];
      const mapped = taxesList.map((t, idx) => ({
        id: t.id || idx + 1,
        name: t.name || 'GST Category',
        applicableDate: new Date().toISOString().split('T')[0],
        department: 'Restaurant',
        taxes: [
          { taxName: 'CGST', percentage: `${t.cgst || (t.percentage / 2 || 2.5)}%`, postAccount: 'CGST Output A/c' },
          { taxName: 'SGST', percentage: `${t.sgst || (t.percentage / 2 || 2.5)}%`, postAccount: 'SGST Output A/c' }
        ],
        percentage: t.percentage || 5,
        status: t.status || 'Active'
      }));
      setData(mapped);
    }).catch(err => {
      console.error('Error fetching taxes:', err);
      setData([]);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchTaxes();
  }, [fetchTaxes]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch =
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.department || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const validate = (fields, skipDuplicateCheck = false) => {
    if (!fields.name || fields.name.trim().length < 2) {
      showToast('Item Category Name must be at least 2 characters.');
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

    const totalPct = fields.taxes ? fields.taxes.reduce((acc, curr) => acc + (parseFloat(curr.percentage) || 0), 0) : (fields.percentage || 5);

    const payload = {
      id: fields.id,
      name: fields.name,
      tax_name: fields.name,
      percentage: totalPct,
      tax_percentage: totalPct
    };

    posApi.saveItemTaxCategory(payload).then(() => {
      showToast(modal.isEdit ? 'Tax category updated in PostgreSQL.' : 'Tax category created in PostgreSQL.');
      fetchTaxes();
      setModal({ open: false, isEdit: false, fields: {} });
      setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
    }).catch(err => {
      showToast(err?.response?.data?.message || 'Failed to save tax category');
    });
    return true;
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    posApi.deleteItemTaxCategory(deleteModal.row.id).then(() => {
      showToast('Tax category deactivated in PostgreSQL.');
      fetchTaxes();
      setDeleteModal({ open: false, row: null });
    }).catch(err => {
      showToast(err?.response?.data?.message || 'Failed to delete tax category');
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

export default useItemTaxCategory;
