import React, { useState, useEffect } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import DepartmentIssueForm from './DepartmentIssueForm';
import DepartmentIssueView from './DepartmentIssueView';
import { usePurchase } from '../../hooks/usePurchase';
import { stockApi } from '../../../../api/stockApi';
import { purchaseApi } from '../../../../api/purchaseApi';

const columns = [
  { key: 'entryNo', label: 'Entry No', sortable: true },
  { key: 'entryDate', label: 'Entry Date', sortable: true },
  { key: 'department', label: 'Department', sortable: true },
  { key: 'toDepartment', label: 'To Department', sortable: true },
  { key: 'vPrefix', label: 'V Prefix', sortable: true },
  { key: 'action', label: 'Action' }
];

const INITIAL_DEPT_ISSUES = [
  {
    id: 1,
    issueNo: '1',
    entryNo: '1',
    date: '25-07-2026',
    entryDate: '25-07-2026',
    department: 'PURCHASE STORE',
    fromDepartment: 'PURCHASE STORE',
    toDepartment: 'MAIN KITCHEN',
    vPrefix: 'ISS',
    lines: [
      { sNo: 1, item: 'AATA', unit: 'K.G.', quantity: 10, rate: 32, amount: 320, currentStock: 40 }
    ]
  }
];

const DepartmentIssueList = ({ showToast }) => {
  const { items, units } = usePurchase();
  const [departmentIssues, setDepartmentIssues] = useState([]);

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [selectedRow, setSelectedRow] = useState(null);

  const [viewModal, setViewModal] = useState({ open: false, row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  useEffect(() => {
    let mounted = true;
    stockApi.getDepartmentIssues().then(res => {
      if (mounted) {
        const data = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        setDepartmentIssues(data.map((d, idx) => ({
          id: d.issue_id || idx + 1,
          entryNo: String(d.issue_number || d.issue_id || idx + 1),
          entryDate: d.created_at ? new Date(d.created_at).toISOString().split('T')[0] : '',
          department: d.from_department || '',
          toDepartment: d.to_department || '',
          vPrefix: 'ISS',
          lines: [],
        })));
      }
    }).catch(() => { if (mounted) setDepartmentIssues([]); });
    return () => { mounted = false; };
  }, []);

  const toast = (msg) => {
    if (showToast) showToast(msg);
    else if (window.showToast) window.showToast(msg);
  };

  const nextNo = (departmentIssues?.length || 0) + 1;

  const handleOpenAdd = () => {
    setFormMode('add');
    setSelectedRow(null);
    setViewMode('form');
  };

  const handleOpenEdit = (row) => {
    setFormMode('edit');
    setSelectedRow(row);
    setViewMode('form');
  };

  const handleSave = async (entry) => {
    try {
      const payload = {
        issue_number: `ISS-${entry.entryNo || Date.now()}`,
        from_department: entry.issueStore || 'PURCHASE STORE',
        to_department: entry.department || 'MAIN KITCHEN',
        notes: entry.remarks || '',
        items: (entry.lines || []).map((l) => ({
          inventory_item_id: l.item ? Number(l.item) : 1,
          issue_qty: Number(l.issQty || 1),
          unit: l.unit || 'Kg'
        }))
      };

      await stockApi.issueStockToDepartment(payload);
      console.log('✅ Department Issue posted to PostgreSQL & store stock reduced via stockApi');
    } catch (e) {
      console.warn('Error issuing stock to department:', e.message);
    }
    if (formMode === 'edit' && selectedRow) {
      setDepartmentIssues((prev) => prev.map((d) => (d.id === selectedRow.id ? { ...entry, id: d.id } : d)));
      toast(`Department Issue Entry #${entry.entryNo} updated successfully!`);
    } else {
      setDepartmentIssues((prev) => [entry, ...prev]);
      toast(`Department Issue Entry #${entry.entryNo} saved successfully!`);
    }
    setViewMode('list');
    setSelectedRow(null);
  };

  const handleDelete = () => {
    if (!deleteModal.row) return;
    setDepartmentIssues((prev) => prev.filter((d) => d.id !== deleteModal.row.id));
    toast('Department Issue deleted.');
    setDeleteModal({ open: false, row: null });
  };

  if (viewMode === 'form') {
    return (
      <DepartmentIssueForm
        mode={formMode}
        initialData={selectedRow}
        onSave={handleSave}
        onCancel={() => setViewMode('list')}
        items={items}
        units={units}
        nextNo={nextNo}
      />
    );
  }

  return (
    <div className="w-full flex flex-col p-6 animate-in fade-in duration-200">
      <CommonTable
        title="Department Issue Entry"
        columns={columns}
        data={departmentIssues}
        actions={[
          { label: 'Edit', onClick: handleOpenEdit },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) }
        ]}
        onAddEntry={handleOpenAdd}
        addEntryLabel="+ Add Department Issue Entry"
        searchPlaceholder="Search Department Issues..."
        showToast={toast}
        breadcrumbs={['Dashboard', 'Purchase', 'Operations', 'Department Issue Entry']}
        emptyMessage="No Department Issues found."
      />

      <DepartmentIssueView
        isOpen={viewModal.open}
        onClose={() => setViewModal({ open: false, row: null })}
        data={viewModal.row}
      />

      {deleteModal.open && (
        <DeleteConfirmationModal
          isOpen={deleteModal.open}
          onClose={() => setDeleteModal({ open: false, row: null })}
          onConfirm={handleDelete}
          itemName={`Issue #${deleteModal.row?.entryNo || ''}`}
        />
      )}
    </div>
  );
};

export default DepartmentIssueList;
