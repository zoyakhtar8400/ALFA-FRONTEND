import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import ExpenseEntryForm from './ExpenseEntryForm';
import apiClient from '../../../../services/apiClient';
import FormLoadingWrapper from '../../../../components/common/FormLoadingWrapper';

const ExpenseEntry = ({ showToast }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState({ mode: 'add', row: null });
  const [deleteModal, setDeleteModal] = useState({ open: false, row: null });

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const activeStore = localStorage.getItem('activeOutletId') || 'STORE_1';
      const res = await apiClient.get('/expenses', { params: { store_id: activeStore } });
      const list = res?.body || res?.data || [];
      const mapped = list.map(item => ({
        id: item.id,
        expenseNo: item.expense_id || `EXP-${item.id}`,
        date: item.expense_date,
        expenseDate: item.expense_date,
        userName: item.field1,
        expenseCharge: item.description || 'Miscellaneous',
        expenseMaster: item.description || 'Miscellaneous',
        amount: Number(item.amount || 0),
        payType: item.payment_mode || 'Cash',
        paymentMode: item.payment_mode || 'Cash',
        remark: item.description || '',
        remarks: item.description || '',
        active: 'Yes'
      }));
      setData(mapped);
    } catch (err) {
      console.error('Error fetching expenses in FrontDesk:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

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
    { key: 'amount', label: 'Amount (₹)', render: (val) => `₹ ${Number(val || 0).toLocaleString('en-IN')}` },
    { key: 'payType', label: 'Payment Mode' },
    { key: 'remark', label: 'Remarks' },
    { key: 'active', label: 'Active', renderStatus: true },
    { key: 'action', label: 'Action', sortable: false },
  ];

  const handleSave = async (formData) => {
    const activeStore = localStorage.getItem('activeOutletId') || 'STORE_1';
    const payload = {
      expense_id: formData.expenseNo,
      expense_date: formData.date,
      field1: formData.userName || 'Staff',
      amount: Number(formData.amount || 0),
      payment_mode: formData.payType || 'Cash',
      description: formData.remark || formData.expenseCharge || 'Expense',
      store_id: activeStore
    };

    try {
      if (editMode.mode === 'add') {
        await apiClient.post('/expenses', payload);
        showToast('Expense entry saved to PostgreSQL successfully!');
      } else {
        await apiClient.put(`/expenses/${editMode.row.id}`, payload);
        showToast('Expense entry updated in PostgreSQL successfully!');
      }
      fetchExpenses();
      setShowForm(false);
    } catch (err) {
      console.error('Error saving expense:', err);
      showToast('Failed to save expense entry: ' + (err?.response?.data?.message || err.message));
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.row) return;
    try {
      await apiClient.delete(`/expenses/${deleteModal.row.id}`);
      showToast('Expense entry deleted from PostgreSQL.');
      fetchExpenses();
      setDeleteModal({ open: false, row: null });
    } catch (err) {
      console.error('Error deleting expense:', err);
      showToast('Failed to delete expense entry.');
    }
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
        loading={loading}
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
