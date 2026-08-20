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
      const stores = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      let mapped = stores.map((s, idx) => {
        const extra = typeof s.settings === 'object' && s.settings ? s.settings : {};
        return {
          id: s.id || idx + 1,
          store_id: s.store_id || `STORE_${s.id || idx + 1}`,
          name: s.store_name || s.name || `Outlet ${s.id || idx + 1}`,
          shortName: extra.shortName || (s.store_name || s.name || 'OUT').slice(0, 3).toUpperCase(),
          companyTitle: extra.companyTitle || 'Alfa Hotels & Resorts',
          outletTitle: extra.outletTitle || s.store_name || s.name || 'Main Dining Room',
          customerInfo: extra.customerInfo || 'Optional',
          autoSettlement: extra.autoSettlement || 'No',
          focusOn: extra.focusOn || 'Item Search',
          kot: extra.kot || 'Print & Save',
          kotPrint: extra.kotPrint || 'Immediate',
          roomService: extra.roomService || 'Disabled',
          noOfKOT: String(extra.noOfKOT || '1'),
          noOfBills: String(extra.noOfBills || '1'),
          hsnSac: extra.hsnSac || '9963',
          gstin: extra.gstin || '',
          general: extra.general || '',
          phone: s.store_phone || s.user_phone || s.phone || '',
          billHeader1: s.user_line_1 || extra.billHeader1 || '',
          billHeader2: s.user_line_2 || extra.billHeader2 || '',
          billHeader3: s.user_sub_locality || extra.billHeader3 || '',
          billSlogan1: s.footer_note || extra.billSlogan1 || '',
          billSlogan2: extra.billSlogan2 || '',
          billSlogan3: extra.billSlogan3 || '',
          status: s.disable_ordering === 1 || s.status === 'Inactive' ? 'Inactive' : 'Active'
        };
      });

      setData(mapped);
    }).catch(err => {
      console.error('Error fetching outlets:', err);
      setData([]);
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
      showToast('Outlet Name is mandatory and must be at least 2 characters.');
      return false;
    }
    if (!fields.shortName || fields.shortName.trim().length === 0) {
      showToast('Short Name is mandatory.');
      return false;
    }
    if (!fields.gstin || fields.gstin.trim().length === 0) {
      showToast('GST No / GSTIN is mandatory.');
      return false;
    }
    if (!fields.phone || fields.phone.trim().length === 0) {
      showToast('Phone No is mandatory.');
      return false;
    }
    if (!fields.hsnSac || fields.hsnSac.trim().length === 0) {
      showToast('HSN No / HSN/SAC is mandatory.');
      return false;
    }
    if (!skipDuplicateCheck) {
      const duplicateItem = data.find(item => 
        item.id !== fields.id && 
        item.store_id !== fields.store_id &&
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
      ...fields,
      id: fields.id,
      store_id: fields.store_id || (fields.id ? `STORE_${fields.id}` : null),
      store_name: fields.name,
      name: fields.name,
      phone: fields.phone,
      gstin: fields.gstin,
      address: fields.billHeader1 || fields.address
    };

    posApi.saveOutlet(payload).then(() => {
      showToast(modal.isEdit ? 'Outlet updated in PostgreSQL.' : 'Outlet created in PostgreSQL.');
      fetchOutlets();
      window.dispatchEvent(new CustomEvent('outletsMasterRefreshed'));
      setModal({ open: false, isEdit: false, fields: {} });
      setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
    }).catch(err => {
      showToast(err?.response?.data?.message || 'Failed to save outlet');
    });
    return true;
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    const targetId = deleteModal.row.id;
    if (Number(targetId) === 1) {
      showToast('Outlet deletion not permitted for primary store.');
      setDeleteModal({ open: false, row: null });
      return;
    }

    posApi.deleteOutlet(targetId)
      .then(() => {
        showToast('Outlet deleted successfully.');
        fetchOutlets();
        window.dispatchEvent(new CustomEvent('outletsMasterRefreshed'));
        setDeleteModal({ open: false, row: null });
      })
      .catch(err => {
        showToast(err?.response?.data?.message || 'Failed to delete outlet.');
        setDeleteModal({ open: false, row: null });
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

export default useOutletMaster;
