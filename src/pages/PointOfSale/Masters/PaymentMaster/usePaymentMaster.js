import { useState, useEffect, useMemo, useCallback } from 'react';
import paymentModeService from '../../../../services/paymentModeService';

export const usePaymentMaster = (showToast) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal / Form state
  const [modal, setModal] = useState({ open: false, isEdit: false, fields: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  const notify = useCallback((msg, type = 'success') => {
    if (typeof showToast === 'function') {
      showToast(msg);
    } else if (window.showToast) {
      window.showToast(msg, type);
    }
  }, [showToast]);

  // ─── FETCH ────────────────────────────────────────────────────────────────
  const fetchPaymentModes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentModeService.getPaymentModes();
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.paymentModes)) list = res.paymentModes;
      else if (Array.isArray(res?.payment_modes)) list = res.payment_modes;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;

      const mapped = list.map((p, idx) => ({
        id: p.id || idx + 1,
        name: p.name || p.payment_mode_name || '',
        payment_mode_name: p.payment_mode_name || p.name || '',
        type: p.type || 'CASH',
        charge_percent: Number(p.charge_percent || 0),
        is_quick_pay: p.is_quick_pay !== false,
        description: p.description || '',
        active: p.active === 'No' ? 'No' : 'Yes',
        isActive: p.active !== 'No',
        store_id: p.store_id || 'STORE_1',
        createdAt: p.createdAt || p.created_at,
        updatedAt: p.updatedAt || p.updated_at
      }));
      setData(mapped);

      // Fire cross-component sync events so POS Billing updates immediately
      window.dispatchEvent(new CustomEvent('paymentMasterRefreshed'));
      window.dispatchEvent(new CustomEvent('paymentModesRefreshed'));
    } catch (err) {
      console.error('Error fetching payment modes:', err);
      notify(err.message || 'Failed to load payment modes', 'error');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchPaymentModes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── FILTER ───────────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !q ||
        String(item.name || '').toLowerCase().includes(q) ||
        String(item.type || '').toLowerCase().includes(q) ||
        String(item.description || '').toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && item.isActive) ||
        (statusFilter === 'Inactive' && !item.isActive);

      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, statusFilter]);

  // ─── SAVE (CREATE / UPDATE) ───────────────────────────────────────────────
  const handleSave = async (fields, skipDuplicateCheck = false) => {
    if (!fields.name || !fields.name.trim()) {
      notify('Payment Mode Name is required.', 'error');
      return false;
    }

    const trimmedName = fields.name.trim();

    if (!skipDuplicateCheck) {
      const dup = data.find(item =>
        item.id !== fields.id &&
        String(item.name || '').toLowerCase().trim() === trimmedName.toLowerCase()
      );
      if (dup) {
        setDuplicateConfirm({ open: true, fields, duplicateItem: dup });
        return false;
      }
    }

    const isEdit = !!fields.id;
    const payload = {
      payment_mode_name: trimmedName,
      name: trimmedName,
      type: fields.type || 'CASH',
      charge_percent: Number(fields.charge_percent || 0),
      is_quick_pay: fields.is_quick_pay !== false,
      description: fields.description || '',
      active: fields.active || (fields.isActive !== false ? 'Yes' : 'No')
    };

    try {
      if (isEdit) {
        const res = await paymentModeService.updatePaymentMode(fields.id, payload);
        notify(res?.message || 'Payment mode updated successfully.');
      } else {
        const res = await paymentModeService.createPaymentMode(payload);
        notify(res?.message || 'Payment mode created successfully.');
      }
      setModal({ open: false, isEdit: false, fields: {} });
      setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
      await fetchPaymentModes();
      return true;
    } catch (err) {
      console.error('Error saving payment mode:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to save payment mode.';
      notify(msg, 'error');
      return false;
    }
  };

  // ─── DELETE ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteModal.row?.id) return;
    try {
      const res = await paymentModeService.deletePaymentMode(deleteModal.row.id);
      notify(res?.message || 'Payment mode deleted successfully.');
      setDeleteModal({ open: false, row: null });
      await fetchPaymentModes();
    } catch (err) {
      console.error('Error deleting payment mode:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete payment mode.';
      notify(msg, 'error');
    }
  };

  return {
    data: filteredData,
    rawList: data,
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
    fetchPaymentModes
  };
};

export default usePaymentMaster;
