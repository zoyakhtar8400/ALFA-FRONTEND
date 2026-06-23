import React, { useState } from 'react';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import CommonModal from '../../../../components/common/CommonModal';
import ExpenseEntryForm from './ExpenseEntryForm';

const ExpenseEntry = ({ showToast }) => {
  const [data, setData] = useState([
    { id: 1, expenseDate: '2026-06-20', expenseMaster: 'Office Supplies', amount: 1500, paymentMode: 'Cash', reference: 'REF-001', remarks: 'Pens and notebooks.', active: 'Yes' },
    { id: 2, expenseDate: '2026-06-21', expenseMaster: 'Maintenance', amount: 8500, paymentMode: 'Bank Transfer', reference: 'REF-002', remarks: 'AC servicing for room 201.', active: 'Yes' },
    { id: 3, expenseDate: '2026-06-21', expenseMaster: 'Vehicle Fuel', amount: 3200, paymentMode: 'Cash', reference: 'REF-003', remarks: 'Vehicle refuelling.', active: 'Yes' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const columns = [
    { key: 'expenseDate', label: 'Expense Date' },
    { key: 'expenseMaster', label: 'Expense Master' },
    { key: 'amount', label: 'Amount (₹)' },
    { key: 'paymentMode', label: 'Payment Mode' },
    { key: 'reference', label: 'Reference' },
    { key: 'remarks', label: 'Remarks' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...formData, id: Date.now() }]);
      showToast('Expense entry added successfully!');
    } else {
      setData(prev => prev.map(item => item.id === editMode.row.id ? { ...formData, id: item.id } : item));
      showToast('Expense entry updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Expense entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  return (
    <>
      <CommonTable
        title="Expense Entry"
        columns={columns}
        data={data}
        actions={[
          { label: 'Edit', onClick: (row) => { setEditMode({ mode: 'edit', row }); setShowForm(true); } },
          { label: 'Delete', isDanger: true, onClick: (row) => setDeleteModal({ open: true, row }) },
        ]}
        onAddEntry={() => { setEditMode({ mode: 'add', row: null }); setShowForm(true); }}
        addEntryLabel="+ Add Expense"
        searchPlaceholder="Search expenses by type or reference..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Expense Entry']}
      />

      <CommonModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editMode.mode === 'add' ? 'Add Expense Entry' : 'Edit Expense Entry'}
        maxWidth="540px"
      >
        <ExpenseEntryForm
          mode={editMode.mode}
          initialData={editMode.row}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      </CommonModal>

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.row?.expenseMaster}
      />
    </>
  );
};

export default ExpenseEntry;
