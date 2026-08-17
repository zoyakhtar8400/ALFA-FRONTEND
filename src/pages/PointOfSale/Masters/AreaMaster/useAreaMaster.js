import { useState, useEffect, useMemo, useCallback } from 'react';
import areaService from '../../../../services/areaService';

export const useAreaMaster = (showToast) => {
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
  const fetchAreas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await areaService.getAreas();
      let list = [];
      if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res?.areas)) {
        list = res.areas;
      } else if (Array.isArray(res?.data?.data)) {
        list = res.data.data;
      } else if (Array.isArray(res?.data?.areas)) {
        list = res.data.areas;
      }
      const mapped = list.map((a, idx) => ({
        id: a.id || idx + 1,
        name: a.name || '',
        description: a.description || '',
        active: a.active === 'No' ? 'No' : 'Yes',
        isActive: a.active !== 'No',
        createdAt: a.createdAt || a.created_at,
        updatedAt: a.updatedAt || a.updated_at
      }));
      setData(mapped);

      // Fire cross-component sync events
      window.dispatchEvent(new CustomEvent('areaMasterRefreshed'));
      window.dispatchEvent(new CustomEvent('areasMasterRefreshed'));
      window.dispatchEvent(new CustomEvent('tableMasterSync'));
    } catch (err) {
      console.error('Error fetching areas:', err);
      notify(err.message || 'Failed to load areas', 'error');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  // ─── FILTER ───────────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !q ||
        String(item.name || '').toLowerCase().includes(q) ||
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
      notify('Area Name is required.', 'error');
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
      name: trimmedName,
      description: fields.description || '',
      active: fields.active || (fields.isActive !== false ? 'Yes' : 'No')
    };

    try {
      if (isEdit) {
        const res = await areaService.updateArea(fields.id, payload);
        notify(res?.message || 'Area updated successfully.');
      } else {
        const res = await areaService.createArea(payload);
        notify(res?.message || 'Area created successfully.');
      }
      setModal({ open: false, isEdit: false, fields: {} });
      setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
      await fetchAreas();
      return true;
    } catch (err) {
      console.error('Error saving area:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to save area.';
      notify(msg, 'error');
      return false;
    }
  };

  // ─── DELETE ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteModal.row?.id) return;
    try {
      const res = await areaService.deleteArea(deleteModal.row.id);
      notify(res?.message || 'Area deleted successfully.');
      setDeleteModal({ open: false, row: null });
      await fetchAreas();
    } catch (err) {
      console.error('Error deleting area:', err);
      const msg = err?.response?.data?.message || err?.message || 'Failed to delete area.';
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
    fetchAreas
  };
};

export default useAreaMaster;
