import React, { useState, useEffect } from 'react';
import CommonTable from '../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import CommonModal from '../../../components/common/CommonModal';
import CommonActionButtons from '../../../components/common/CommonActionButtons';
import F from '../../../components/common/F';
import StatusBadge from '../../../components/common/StatusBadge';
import apiClient from '../../../services/apiClient';

const emptyCategory = { id: '', name: '', printerId: '', status: 'Active' };

const ProductionCategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState({ open: false, mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [form, setForm] = useState(emptyCategory);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, printRes] = await Promise.allSettled([
        apiClient.get('/production-categories'),
        apiClient.get('/printers?printer_type=KOT')
      ]);

      let plist = [];
      if (printRes.status === 'fulfilled' && printRes.value) {
        const rawP = printRes.value.data || printRes.value || [];
        if (Array.isArray(rawP)) {
          // Strictly ensure only KOT printers are listed
          plist = rawP
            .filter(p => String(p.printer_type || p.type || '').toUpperCase() === 'KOT' || String(p.printer_type || p.type || '').toUpperCase() !== 'BILL')
            .map((p, idx) => ({
              id: p.id || p.printer_id || idx + 1,
              name: p.printer_name || p.title || p.device_name || `Printer ${p.id || idx + 1}`,
              printer_type: 'KOT',
              ip: p.printer_ip || p.ip_address || ''
            }));
          setPrinters(plist);
        }
      }

      if (catRes.status === 'fulfilled' && catRes.value) {
        const list = catRes.value.data || catRes.value || [];
        if (Array.isArray(list)) {
          const mapped = list.map((c, idx) => {
            const pId = c.printer_id || c.printerId || null;
            const assignedP = plist.find(p => String(p.id) === String(pId));
            return {
              id: c.id || idx + 1,
              name: c.name || c.kitchen_dept_name || c.department_name || `Category ${c.id || idx + 1}`,
              printerId: pId ? String(pId) : '',
              printerName: assignedP ? assignedP.name : (c.printer_name || c.printerName || 'Unassigned'),
              status: (c.status === 'Active' || c.is_active === 1 || c.isactive === 1) ? 'Active' : 'Inactive'
            };
          });
          setCategories(mapped);
        }
      }
    } catch (err) {
      console.warn('Error loading production categories data:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { key: 'name', label: 'Category Name', sortable: true },
    {
      key: 'printerName',
      label: 'Assigned Printer',
      sortable: true,
      render: (val, row) => {
        const pId = row.printerId;
        const matched = printers.find(p => String(p.id) === String(pId));
        const pName = matched ? matched.name : (val && val !== 'Unassigned' ? val : null);
        if (!pName) {
          return <span style={{ fontWeight: 600, color: '#ef4444', fontStyle: 'italic' }}>Unassigned (Missing Printer)</span>;
        }
        return <span style={{ fontWeight: 600, color: '#0e7490' }}>{pName}</span>;
      }
    },
    { key: 'status', label: 'Status', sortable: true, render: (val, row) => <StatusBadge value={val || row?.status || 'Active'} /> },
    { key: 'action', label: 'Action' }
  ];

  const handleOpenAdd = () => {
    setForm(emptyCategory);
    setModal({ open: true, mode: 'add', row: null });
  };

  const handleOpenEdit = (row) => {
    setForm({ ...row });
    setModal({ open: true, mode: 'edit', row });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      if (typeof showToast === 'function') showToast('Category name is required.', 'warning');
      else if (window.showToast) window.showToast('Category name is required.', 'warning');
      return;
    }

    const isNumericId = modal.row && (typeof modal.row.id === 'number' || !isNaN(Number(modal.row.id)));
    const payload = {
      id: isNumericId ? Number(modal.row.id) : undefined,
      name: form.name.trim(),
      department_name: form.name.trim(),
      kitchen_dept_name: form.name.trim(),
      printer_id: form.printerId ? Number(form.printerId) : null,
      printerId: form.printerId ? Number(form.printerId) : null,
      is_active: form.status === 'Active' ? 1 : 0
    };

    try {
      await apiClient.post('/production-categories', payload);
      await fetchData();
      const successMsg = modal.mode === 'edit' ? 'Category updated successfully.' : 'Category created successfully.';
      if (typeof showToast === 'function') showToast(successMsg, 'success');
      else if (window.showToast) window.showToast(successMsg, 'success');
    } catch (err) {
      console.warn('Save category API error:', err.message);
      const errMsg = 'Failed to save category: ' + (err.response?.data?.message || err.message);
      if (typeof showToast === 'function') showToast(errMsg, 'error');
      else if (window.showToast) window.showToast(errMsg, 'error');
    }

    setModal({ open: false, mode: 'add', row: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.row) return;
    const id = deleteModal.row.id;
    try {
      if (typeof id === 'number' || !isNaN(Number(id))) {
        await apiClient.delete(`/production-categories/${id}`);
        await fetchData();
      }
    } catch (err) {
      console.warn('Delete category API error:', err.message);
    }
    setDeleteModal({ open: false, row: null });
  };

  const handleBulkDelete = async (selectedRows) => {
    for (const row of selectedRows) {
      const id = row.id;
      if (typeof id === 'number' || !isNaN(Number(id))) {
        try {
          await apiClient.delete(`/production-categories/${id}`);
        } catch (e) { }
      }
    }
    await fetchData();
  };

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <CommonTable
        title="Production Category Master"
        columns={columns}
        data={categories}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onBulkDelete={handleBulkDelete}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Category"
        searchPlaceholder="Search Categories..."
        breadcrumbs={['Dashboard', 'POS', 'Master', 'Production Category']}
        emptyMessage="No Production Categories found."
      />

      <CommonModal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, mode: 'add', row: null })}
        title={modal.mode === 'edit' ? 'Edit Category' : 'Add Production Category'}
        maxWidth="500px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 4px' }}>
          <F label="Category Name *" value={form.name || ''} onChange={(val) => {
            const strVal = typeof val === 'object' && val?.target ? val.target.value : val;
            setForm((p) => ({ ...p, name: strVal }));
          }} placeholder="e.g. Main Course, Tandoor, Bar…" />

          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>
            Assigned Printer
            <select
              value={form.printerId}
              onChange={(e) => setForm((p) => ({ ...p, printerId: e.target.value }))}
              style={{ padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}
            >
              <option value="">— Select Printer —</option>
              {printers.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.85rem', fontWeight: 700, color: '#374151' }}>
            Status
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              style={{ padding: '9px 12px', borderRadius: '7px', border: '1.5px solid #e2e8f0', fontSize: '0.85rem' }}
            >
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </label>

          <CommonActionButtons
            onSave={handleSave}
            onCancel={() => setModal({ open: false, mode: 'add', row: null })}
            saveText={modal.mode === 'edit' ? 'Update Category' : 'Save Category'}
          />
        </div>
      </CommonModal>

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.row?.name || 'this category'}
      />
    </div>
  );
};

export default ProductionCategoryPage;
