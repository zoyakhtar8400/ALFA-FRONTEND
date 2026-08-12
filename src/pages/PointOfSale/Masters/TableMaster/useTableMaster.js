import { useState, useEffect, useMemo, useCallback } from 'react';
import posApi from '../../../../api/posApi';

// Helper: natural sort by numeric part of table name (T1 < T2 < T10 < T11)
function naturalSort(arr) {
  return [...arr].sort((a, b) => {
    const numA = parseInt(String(a.name || '').replace(/\D/g, '')) || 0;
    const numB = parseInt(String(b.name || '').replace(/\D/g, '')) || 0;
    if (numA !== numB) return numA - numB;
    return String(a.name || '').localeCompare(String(b.name || ''));
  });
}

export const useTableMaster = (showToast) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const [modal, setModal] = useState({ open: false, isEdit: false, fields: {} });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [duplicateConfirm, setDuplicateConfirm] = useState({ open: false, fields: null, duplicateItem: null });

  // ─── FETCH ────────────────────────────────────────────────────────────────
  const fetchTables = useCallback(async () => {
    setLoading(true);
    try {
      const res = await posApi.getTables();
      // Axios interceptor unwraps response.data → res = { status, tables, data }
      const tablesList = Array.isArray(res?.tables) ? res.tables
        : Array.isArray(res?.data) ? res.data
        : [];

      const mapped = tablesList.map((t, idx) => ({
        id: t.id || t.table_id || idx + 1,
        no: t.no || t.table_no || String(idx + 1).padStart(2, '0'),
        name: t.table_name || t.name || `T${String(idx + 1).padStart(2, '0')}`,
        pax: Number(t.seats || t.max_person || 4),
        department: t.section || t.department || 'Restaurant',
        floor: t.floor || 'Ground Floor',
        status: t.status || 'AVAILABLE',
        isActive: (t.status || '').toUpperCase() !== 'INACTIVE' && t.isactive !== 0,
      }));

      setData(naturalSort(mapped));

      // Fire cross-component sync event so Display Table updates immediately
      window.dispatchEvent(new CustomEvent('tablesMasterRefreshed'));
    } catch (err) {
      console.error('Error fetching tables from DB:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  // ─── FILTER ───────────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !q ||
        String(item.name || '').toLowerCase().includes(q) ||
        String(item.department || '').toLowerCase().includes(q) ||
        String(item.floor || '').toLowerCase().includes(q) ||
        String(item.no || '').toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Active' && item.isActive) ||
        (statusFilter === 'Inactive' && !item.isActive);

      return matchSearch && matchStatus;
    });
  }, [data, searchTerm, statusFilter]);

  // ─── VALIDATE ─────────────────────────────────────────────────────────────
  const validate = (fields, skipDuplicateCheck = false) => {
    if (!fields.name || fields.name.trim().length < 1) {
      showToast('Table Name is required.');
      return false;
    }
    if (isNaN(Number(fields.pax)) || Number(fields.pax) <= 0) {
      showToast('Capacity (PAX) must be a positive number.');
      return false;
    }
    if (!skipDuplicateCheck) {
      const dup = data.find(item =>
        item.id !== fields.id &&
        String(item.name || '').toLowerCase().trim() === fields.name.toLowerCase().trim()
      );
      if (dup) {
        setDuplicateConfirm({ open: true, fields, duplicateItem: dup });
        return false;
      }
    }
    return true;
  };

  // ─── CREATE / UPDATE ─────────────────────────────────────────────────────
  const handleSave = async (fields, skipDuplicateCheck = false) => {
    if (!validate(fields, skipDuplicateCheck)) return false;

    const isEdit = !!fields.id;
    const payload = {
      ...(isEdit ? { id: fields.id } : {}),
      name: fields.name,
      table_name: fields.name,
      seats: Number(fields.pax) || 4,
      max_person: Number(fields.pax) || 4,
      section: fields.department || 'Main Area',
      department: fields.department || 'Main Area',
      floor: fields.floor || 'Ground Floor',
      status: fields.isActive !== false ? 'AVAILABLE' : 'INACTIVE',
    };

    try {
      await posApi.saveTable(payload);
      showToast(isEdit ? 'Table updated successfully.' : 'Table created successfully.');
      setModal({ open: false, isEdit: false, fields: {} });
      setDuplicateConfirm({ open: false, fields: null, duplicateItem: null });
      await fetchTables();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save table.';
      showToast(msg);
      console.error('handleSave error:', err);
    }
    return true;
  };

  // ─── DELETE ───────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteModal.row) return;
    try {
      await posApi.deleteTable(deleteModal.row.id);
      showToast('Table deleted successfully.');
      setDeleteModal({ open: false, row: null });
      await fetchTables();
    } catch (err) {
      showToast(err?.response?.data?.message || 'Failed to delete table.');
    }
  };

  // ─── BULK CREATE ──────────────────────────────────────────────────────────
  const handleBulkSave = async (bulkConfig) => {
    const prefix   = (bulkConfig.prefix || '').trim();
    const startNum = parseInt(bulkConfig.startNum);
    const endNum   = parseInt(bulkConfig.endNum);
    const pax      = parseInt(bulkConfig.pax) || 4;
    const dept     = bulkConfig.department || 'Restaurant';
    const floor    = bulkConfig.floor || 'Ground Floor';
    const isActive = bulkConfig.isActive !== false;

    if (!prefix) { showToast('Table Prefix is required.'); return false; }
    if (isNaN(startNum) || isNaN(endNum) || startNum > endNum) {
      showToast('Start number must be ≤ end number.'); return false;
    }
    if (endNum - startNum > 99) {
      showToast('Cannot bulk-create more than 100 tables at once.'); return false;
    }

    const payloads = [];
    for (let i = startNum; i <= endNum; i++) {
      const numStr    = String(i).padStart(2, '0');
      const tableName = `${prefix}${numStr}`;
      payloads.push({
        name: tableName, table_name: tableName, no: numStr,
        seats: pax, max_person: pax,
        section: dept, department: dept, floor,
        status: isActive ? 'AVAILABLE' : 'INACTIVE',
      });
    }

    try {
      // Fire sequentially to preserve order and avoid DB race conditions
      let created = 0;
      for (const p of payloads) {
        await posApi.saveTable(p);
        created++;
      }
      showToast(`✅ ${created} table${created > 1 ? 's' : ''} created successfully!`);
      await fetchTables();
    } catch (err) {
      showToast(err?.message || 'Failed to create bulk tables. Please try again.');
      console.error('Bulk table create error:', err);
      // Still refresh to show whatever was created before the error
      await fetchTables();
    }
    return true;
  };

  return {
    data: filteredData,
    loading,
    searchTerm, setSearchTerm,
    statusFilter, setStatusFilter,
    modal, setModal,
    deleteModal, setDeleteModal,
    duplicateConfirm, setDuplicateConfirm,
    handleSave,
    handleDelete,
    handleBulkSave,
    fetchTables,
  };
};

export default useTableMaster;
