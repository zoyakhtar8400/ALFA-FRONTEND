import { useState, useEffect, useMemo, useCallback } from 'react';
import posApi from '../../../../api/posApi';

export const useOutletMaster = (showToast) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal/Form open states
  const [modal, setModal] = useState({ open: false, isEdit: false, fields: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  const fetchOutlets = useCallback(() => {
    setLoading(true);
    posApi.getOutlets().then(res => {
      const stores = Array.isArray(res?.data) ? res.data : [];
      let mapped = stores.map((s, idx) => ({
        id: s.store_id || s.id || idx + 1,
        name: s.store_name || 'Restaurant',
        shortName: (s.store_name || 'RES').slice(0, 3).toUpperCase(),
        companyTitle: s.company_title || 'Alfa HMS',
        outletTitle: s.store_name || 'Restaurant Outlet',
        phone: s.phone || '',
        hsnSac: s.hsn_code || '9963',
        status: s.is_active !== 0 ? 'Active' : 'Inactive'
      }));

      if (mapped.length === 0) {
        mapped = [{
          id: 1,
          name: 'Restaurant',
          shortName: 'RES',
          companyTitle: 'Alfa HMS',
          outletTitle: 'Restaurant Outlet',
          phone: '',
          hsnSac: '9963',
          status: 'Active'
        }];
      } else {
        const restOnly = mapped.filter(o => (o.name || '').toLowerCase().includes('restaurant'));
        mapped = restOnly.length > 0 ? restOnly : [{ ...mapped[0], name: 'Restaurant', shortName: 'RES' }];
      }

      setData(mapped);
    }).catch(err => {
      console.error('Error fetching outlets:', err);
      setData([{
        id: 1,
        name: 'Restaurant',
        shortName: 'RES',
        companyTitle: 'Alfa HMS',
        outletTitle: 'Restaurant Outlet',
        phone: '',
        hsnSac: '9963',
        status: 'Active'
      }]);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOutlets();
  }, [fetchOutlets]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchSearch =
        (item.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.shortName || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const validate = (fields, skipDuplicateCheck = false) => {
    if (!fields.name || fields.name.trim().length < 2) {
      showToast('Outlet Name must be at least 2 characters.');
      return false;
    }
    if (!skipDuplicateCheck) {
      const duplicateItem = data.find(item => 
        item.id !== fields.id && 
        ((item.name || '').toLowerCase().trim() === (fields.name || '').toLowerCase().trim())
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
      store_id: fields.id,
      store_name: fields.name,
      phone: fields.phone,
      address: fields.billHeader1 || fields.address
    };

    posApi.saveOutlet(payload).then(() => {
      showToast(modal.isEdit ? 'Outlet updated in PostgreSQL.' : 'Outlet created in PostgreSQL.');
      fetchOutlets();
      setModal({ open: false, isEdit: false, fields: {} });
      setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
    }).catch(err => {
      showToast(err?.response?.data?.message || 'Failed to save outlet');
    });
    return true;
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    showToast('Outlet deletion not permitted for primary store.');
    setDeleteModal({ open: false, row: null });
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

export default useOutletMaster;
