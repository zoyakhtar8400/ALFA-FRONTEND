import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import DepartmentIssueForm from './DepartmentIssueForm';
import DepartmentIssueView from './DepartmentIssueView';
import { usePurchase } from '../../hooks/usePurchase';

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
  const [departmentIssues, setDepartmentIssues] = useState(INITIAL_DEPT_ISSUES);

  const [viewMode, setViewMode] = useState('list'); // 'list' | 'form'
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [selectedRow, setSelectedRow] = useState(null);

  const [viewModal, setViewModal] = useState({ open: false, row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

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

  const handleSave = (entry) => {
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
