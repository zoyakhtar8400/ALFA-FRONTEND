import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import CommonTable from '../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';

import apiClient from '../../../services/apiClient';

const INITIAL_EXPENSES = [
  { id: 1, expenseDate: '2026-07-20', expenseReason: 'Kitchen Cleaning Supplies', employee: 'Rahul Sharma', paidFrom: 'Petty Cash', amount: 1450, status: 'Approved', createdBy: 'Admin' },
  { id: 2, expenseDate: '2026-07-19', expenseReason: 'Fresh Vegetable Purchase', employee: 'Amit Kumar', paidFrom: 'Cash Register', amount: 3200, status: 'Approved', createdBy: 'Manager' },
  { id: 3, expenseDate: '2026-07-19', expenseReason: 'Gas Cylinder Refill', employee: 'Suresh Patel', paidFrom: 'Bank Transfer', amount: 2850, status: 'Pending', createdBy: 'Admin' },
  { id: 4, expenseDate: '2026-07-18', expenseReason: 'Printer Paper Rolls', employee: 'Pooja Singh', paidFrom: 'Petty Cash', amount: 650, status: 'Approved', createdBy: 'Admin' },
  { id: 5, expenseDate: '2026-07-17', expenseReason: 'Plumbing Repair Work', employee: 'Ramesh Verma', paidFrom: 'Cash Register', amount: 1200, status: 'Approved', createdBy: 'Manager' }
];

const ExpenseList = ({ showToast = () => {} }) => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const activeStore = localStorage.getItem('activeOutletId') || 'STORE_1';
      const response = await apiClient.get('/expenses', { params: { store_id: activeStore } });
      const list = response?.data || response?.body || (Array.isArray(response) ? response : []);
      if (Array.isArray(list) && list.length > 0) {
        setExpenses(list.map(e => ({
          id: e.expense_id || e.id,
          expenseDate: e.expense_date || (e.created_date ? new Date(e.created_date).toISOString().slice(0, 10) : '2026-07-20'),
          expenseReason: e.description || e.remarks || 'General Petty Expense',
          employee: e.field1 || 'Admin Staff',
          paidFrom: e.payment_mode || 'Cash',
          amount: Number(e.amount || 0),
          status: 'Approved',
          createdBy: e.field1 || 'Admin'
        })));
      } else {
        const saved = localStorage.getItem('alfa_pos_expenses');
        setExpenses(saved ? JSON.parse(saved) : INITIAL_EXPENSES);
      }
    } catch {
      const saved = localStorage.getItem('alfa_pos_expenses');
      setExpenses(saved ? JSON.parse(saved) : INITIAL_EXPENSES);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchExpenses();
  }, []);

  const columns = [
    { key: 'expenseDate', label: 'Expense Date' },
    { key: 'expenseReason', label: 'Expense Reason' },
    { key: 'employee', label: 'Employee' },
    { key: 'paidFrom', label: 'Paid From' },
    {
      key: 'amount',
      label: 'Amount',
      render: (val) => <span style={{ fontWeight: 800, color: '#0e7490' }}>₹{Number(val).toLocaleString('en-IN')}</span>
    },
    { key: 'status', label: 'Status', renderStatus: true, activeValue: 'Approved' },
    { key: 'createdBy', label: 'Created By' },
    { key: 'action', label: 'Actions', sortable: false }
  ];

  const handleDeleteClick = (row) => {
    setItemToDelete(row);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await apiClient.delete(`/expenses/${itemToDelete.id}`);
    } catch (e) {
      /* ignore if offline */
    }
    const updated = expenses.filter(e => e.id !== itemToDelete.id);
    setExpenses(updated);
    try {
      localStorage.setItem('alfa_pos_expenses', JSON.stringify(updated));
    } catch (e) {}
    showToast('Expense record deleted successfully.');
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleBulkDelete = async (selectedRows, selectedIds) => {
    for (const row of selectedRows) {
      if (row.id) {
        try {
          await apiClient.delete(`/expenses/${row.id}`);
        } catch (e) { }
      }
    }
    const updated = expenses.filter(e => !selectedIds.includes(String(e.id)) && !selectedRows.some(sr => sr.id === e.id));
    setExpenses(updated);
    try {
      localStorage.setItem('alfa_pos_expenses', JSON.stringify(updated));
    } catch (e) { }
    showToast(`Deleted ${selectedRows.length} expense record(s).`);
  };

  return (
    <div style={{ padding: '16px 24px', backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'var(--font-family, sans-serif)' }}>
      {/* Main Expense Table with integrated single PageHeader and Add Expense button */}
      <CommonTable
        title="Expense Management"
        columns={columns}
        data={expenses}
        onAddEntry={() => navigate('/setting/expense/new')}
        addEntryLabel="+ Add Expense"
        showBack
        onBack={() => navigate('/setting')}
        actions={[
          { label: 'Edit', onClick: (row) => navigate(`/setting/expense/edit/${row.id}`), icon: <FaEdit size={14} /> },
          { label: 'Delete', isDanger: true, onClick: handleDeleteClick, icon: <FaTrash size={14} /> }
        ]}
        onBulkDelete={handleBulkDelete}
        searchPlaceholder="Search reason, employee, or paid from..."
        showToast={showToast}
        breadcrumbs={['Settings', 'Payments & Finance', 'Expense Management']}
      />

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={itemToDelete?.expenseReason || 'Expense'}
        />
      )}
    </div>
  );
};

export default ExpenseList;
