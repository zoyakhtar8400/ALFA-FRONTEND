import React, { useState, useEffect } from 'react';
import CommonTable from '../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';
import CommonModal from '../../../components/common/CommonModal';
import CommonActionButtons from '../../../components/common/CommonActionButtons';
import F from '../../../components/common/F';
import StatusBadge from '../../../components/common/StatusBadge';
import { INITIAL_PRODUCTION_CATEGORIES, INITIAL_PRINTERS } from '../constants/printerData';
import apiClient from '../../../services/apiClient';

const emptyCategory = { id: '', name: '', printerId: '', status: 'Active' };

const ProductionCategoryPage = () => {
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('alfa_production_categories');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTION_CATEGORIES;
  });

  const [printers, setPrinters] = useState(() => {
    const saved = localStorage.getItem('alfa_pos_printers');
    return saved ? JSON.parse(saved) : INITIAL_PRINTERS;
  });

  const [modal, setModal] = useState({ open: false, mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });
  const [form, setForm] = useState(emptyCategory);

  const fetchData = async () => {
    try {
      const [catRes, printRes] = await Promise.allSettled([
        apiClient.get('/production-categories'),
        apiClient.get('/printers')
      ]);

      if (catRes.status === 'fulfilled' && catRes.value) {
        const list = catRes.value.data || catRes.value || [];
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((c, idx) => ({
            id: c.id || `pc_${idx + 1}`,
            name: c.name || c.kitchen_dept_name || c.department_name || `Category ${idx + 1}`,
            printerId: c.printerId || 'p1',
            printerName: c.printerName || 'Kitchen Printer',
            status: (c.status === 'Active' || c.is_active === 1 || c.isactive === 1) ? 'Active' : 'Inactive'
          }));
          setCategories(mapped);
          localStorage.setItem('alfa_production_categories', JSON.stringify(mapped));
        }
      }

      if (printRes.status === 'fulfilled' && printRes.value) {
        const plist = printRes.value.data || printRes.value || [];
        if (Array.isArray(plist) && plist.length > 0) {
          const mappedPrinters = plist.map((p, idx) => ({
            id: p.id || p.printer_id || `p_${idx + 1}`,
            name: p.printer_name || p.title || p.device_name || `Printer ${p.id || idx + 1}`
          }));
          setPrinters(mappedPrinters);
          localStorage.setItem('alfa_pos_printers', JSON.stringify(mappedPrinters));
        }
      }
    } catch (err) {
      console.warn('Error loading backend data:', err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('alfa_production_categories', JSON.stringify(categories));
  }, [categories]);

  const columns = [
    { key: 'name', label: 'Category Name', sortable: true },
    {
      key: 'printerName',
      label: 'Assigned Printer',
      sortable: true,
      render: (val, row) => {
        const pName = printers.find(p => String(p.id) === String(row.printerId))?.name || val || 'Kitchen Printer';
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
    if (!form.name.trim()) { alert('Category Name is required.'); return; }

    const isNumericId = modal.row && (typeof modal.row.id === 'number' || !isNaN(Number(modal.row.id)));
    const payload = {
      id: isNumericId ? Number(modal.row.id) : undefined,
      name: form.name,
      department_name: form.name,
      kitchen_dept_name: form.name,
      is_active: form.status === 'Active' ? 1 : 0
    };

    try {
      await apiClient.post('/production-categories', payload);
    } catch (err) {
      console.warn('Save category API error:', err.message);
    }

    const assignedPrinter = printers.find(p => String(p.id) === String(form.printerId));
    const pName = assignedPrinter ? assignedPrinter.name : 'Kitchen Printer';
    const newRecord = { ...form, printerName: pName };

    if (modal.mode === 'edit' && modal.row) {
      setCategories((prev) => prev.map((c) => (c.id === modal.row.id ? { ...newRecord, id: c.id } : c)));
    } else {
      setCategories((prev) => [{ ...newRecord, id: `pc_${Date.now()}` }, ...prev]);
    }

    setModal({ open: false, mode: 'add', row: null });
  };

  const handleDelete = async () => {
    if (!deleteModal.row) return;
    const id = deleteModal.row.id;
    try {
      if (typeof id === 'number' || !isNaN(Number(id))) {
        await apiClient.delete(`/production-categories/${id}`);
      }
    } catch (err) {
      console.warn('Delete category API error:', err.message);
    }
    setCategories((prev) => prev.filter((c) => c.id !== id));
    setDeleteModal({ open: false, row: null });
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
