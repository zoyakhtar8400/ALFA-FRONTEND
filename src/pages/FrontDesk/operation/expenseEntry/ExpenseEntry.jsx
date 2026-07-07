import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import ExpenseEntryForm from './ExpenseEntryForm';

import FormLoadingWrapper from '../../../../components/common/FormLoadingWrapper';

const ExpenseEntry = ({ showToast }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([
    { id: 1, expenseNo: 'EXP-1001', date: '2026-06-20', expenseDate: '2026-06-20', expenseCharge: 'Office Supplies', expenseMaster: 'Office Supplies', amount: 1500, payType: 'Cash', paymentMode: 'Cash', reference: 'REF-001', remark: 'Pens and notebooks.', remarks: 'Pens and notebooks.', active: 'Yes' },
    { id: 2, expenseNo: 'EXP-1002', date: '2026-06-21', expenseDate: '2026-06-21', expenseCharge: 'Maintenance', expenseMaster: 'Maintenance', amount: 8500, payType: 'Bank Transfer', paymentMode: 'Bank Transfer', reference: 'REF-002', remark: 'AC servicing for room 201.', remarks: 'AC servicing for room 201.', active: 'Yes' },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('add') === 'true') {
      const rowData = {};
      params.forEach((value, key) => {
        if (key !== 'add') {
          rowData[key] = value;
        }
      });
      setEditMode({ mode: 'add', row: Object.keys(rowData).length ? rowData : null });
      setShowForm(true);
    }
  }, [location]);

  const columns = [
    { key: 'expenseNo', label: 'Expense No' },
    { key: 'date', label: 'Expense Date' },
    { key: 'expenseCharge', label: 'Expense Category' },
    { key: 'amount', label: 'Amount (₹)', render: (val) => `₹ ${val.toLocaleString('en-IN')}` },
    { key: 'payType', label: 'Payment Mode' },
    { key: 'remark', label: 'Remarks' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = (formData) => {
    // Map internal names if mismatch
    const entryData = {
      ...formData,
      expenseDate: formData.date,
      expenseMaster: formData.expenseCharge,
      paymentMode: formData.payType,
      remarks: formData.remark,
    };

    if (editMode.mode === 'add') {
      setData(prev => [...prev, { ...entryData, id: Date.now() }]);
      showToast('Expense entry added successfully!');
    } else {
      setData(prev => prev.map(item => item.id === editMode.row.id ? { ...entryData, id: item.id } : item));
      showToast('Expense entry updated successfully!');
    }
    setShowForm(false);
  };

  const handleDelete = () => {
    setData(prev => prev.filter(item => item.id !== deleteModal.row.id));
    showToast('Expense entry deleted.');
    setDeleteModal({ open: false, row: null });
  };

  const handleCancel = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo);
    } else {
      setShowForm(false);
    }
  };

  if (showForm) {
    return (
      <FormLoadingWrapper>
        <ExpenseEntryForm
          mode={editMode.mode}
          initialData={editMode.row}
          onSave={handleSave}
          onCancel={handleCancel}
          existingRecords={data}
        />
      </FormLoadingWrapper>
    );
  }

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

      <DeleteConfirmationModal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, row: null })}
        onConfirm={handleDelete}
        itemName={deleteModal.row?.expenseMaster || deleteModal.row?.expenseCharge}
      />
    </>
  );
};

export default ExpenseEntry;
