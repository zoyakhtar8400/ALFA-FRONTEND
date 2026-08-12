import { useState, useEffect, useMemo, useCallback } from 'react';
import posApi from '../../../../api/posApi';

export const useDeliveryMaster = (showToast) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal open states
  const [modal, setModal] = useState({ open: false, isEdit: false, fields: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  const fetchDeliveryBoys = useCallback(() => {
    setLoading(true);
    posApi.getDeliveryBoys().then(res => {
      if (Array.isArray(res?.data)) {
        setData(res.data);
      } else {
        setData([]);
      }
    }).catch(err => {
      console.error('Error fetching delivery boys:', err);
      setData([]);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchDeliveryBoys();
  }, [fetchDeliveryBoys]);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const partnerStr = item.partner || '';
      const nameStr = item.name || '';
      const phoneStr = item.phone || '';
      const matchSearch =
        partnerStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phoneStr.includes(searchTerm);
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, statusFilter]);

  const validate = (fields, skipDuplicateCheck = false) => {
    const partnerName = fields.partner || 'Direct Delivery';
    if (!partnerName || partnerName.trim().length < 2) {
      showToast('Partner Name must be at least 2 characters.');
      return false;
    }
    if (!fields.name || fields.name.trim().length < 2) {
      showToast('Name must be at least 2 characters.');
      return false;
    }
    if (fields.phone && !/^\d{10}$/.test(fields.phone)) {
      showToast('Phone must be a valid 10-digit number.');
      return false;
    }
    if (!skipDuplicateCheck) {
      const duplicateItem = data.find(item => 
        item.id !== fields.id && 
        String(item.partner || 'Direct Delivery').toLowerCase().trim() === partnerName.toLowerCase().trim() &&
        String(item.name || '').toLowerCase().trim() === fields.name.toLowerCase().trim()
      );
      if (duplicateItem) {
        setDuplicateConfirm({ open: true, fields, duplicateItem });
        return false;
      }
    }
    return true;
  };

  const handleSave = (fields, skipDuplicateCheck = false) => {
    const payload = { ...fields, partner: fields.partner || 'Direct Delivery' };
    if (!validate(payload, skipDuplicateCheck)) return false;

    posApi.saveDeliveryBoy(payload).then(() => {
      showToast(modal.isEdit ? 'Delivery record updated in PostgreSQL.' : 'Delivery record created in PostgreSQL.');
      fetchDeliveryBoys();
      setModal({ open: false, isEdit: false, fields: {} });
      setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
    }).catch(err => {
      showToast(err?.response?.data?.message || 'Failed to save delivery record.');
    });
    return true;
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    posApi.deleteDeliveryBoy(deleteModal.row.id).then(() => {
      showToast('Delivery record deactivated in PostgreSQL.');
      fetchDeliveryBoys();
      setDeleteModal({ open: false, row: null });
    }).catch(err => {
      showToast(err?.response?.data?.message || 'Failed to delete delivery record.');
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
    handleDelete,
  };
};

export default useDeliveryMaster;
