import { useState, useEffect, useMemo, useCallback } from 'react';
import posApi from '../../../../api/posApi';
import areaService from '../../../../services/areaService';

export const useDeliveryMaster = (showToast) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [outletFilter, setOutletFilter] = useState('All');
  const [outletsList, setOutletsList] = useState([]);
  const [areaFilter, setAreaFilter] = useState('All');
  const [areasList, setAreasList] = useState([]);

  // Modal open states
  const [modal, setModal] = useState({ open: false, isEdit: false, fields: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  useEffect(() => {
    posApi.getOutlets().then(res => {
      const list = res?.data || res?.stores || [];
      setOutletsList(list);
    }).catch(err => console.warn('Failed to fetch outlets in useDeliveryMaster', err));

    areaService.getAreas().then(res => {
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setAreasList(list.map(a => a.name || a.area_name || a).filter(Boolean));
    }).catch(err => console.warn('Failed to fetch areas in useDeliveryMaster', err));
  }, []);

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
      const areaStr = item.area || '';
      const matchSearch =
        partnerStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nameStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        areaStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        phoneStr.includes(searchTerm);
      const matchStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchOutlet = outletFilter === 'All' || String(item.store_id || 'STORE_1') === String(outletFilter);
      const matchArea = areaFilter === 'All' || String(item.area || '') === String(areaFilter);
      return matchSearch && matchStatus && matchOutlet && matchArea;
    });
  }, [data, searchTerm, statusFilter, outletFilter, areaFilter]);

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
    const payload = {
      ...fields,
      partner: fields.partner || 'Direct Delivery',
      area: fields.area || '',
      store_id: fields.store_id || 'STORE_1'
    };
    if (!validate(payload, skipDuplicateCheck)) return false;

    posApi.saveDeliveryBoy(payload).then(() => {
      showToast(modal.isEdit ? 'Delivery record updated in PostgreSQL.' : 'Delivery record created in PostgreSQL.');
      fetchDeliveryBoys();
      try { window.dispatchEvent(new Event('deliveryMasterRefreshed')); } catch (e) { }
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
      showToast('Delivery record deleted from PostgreSQL.');
      fetchDeliveryBoys();
      try { window.dispatchEvent(new Event('deliveryMasterRefreshed')); } catch (e) { }
      setDeleteModal({ open: false, row: null });
    }).catch(err => {
      showToast(err?.response?.data?.message || 'Failed to delete delivery record.');
    });
  };

  const handleBulkDelete = async (selectedRows) => {
    let deletedCount = 0;
    for (const row of selectedRows) {
      if (row.id) {
        try {
          await posApi.deleteDeliveryBoy(row.id);
          deletedCount++;
        } catch (e) { }
      }
    }
    showToast(`Deleted ${deletedCount} delivery record(s) successfully.`);
    fetchDeliveryBoys();
    try { window.dispatchEvent(new Event('deliveryMasterRefreshed')); } catch (e) { }
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
    areaFilter,
    setAreaFilter,
    areasList,
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

export default useDeliveryMaster;
