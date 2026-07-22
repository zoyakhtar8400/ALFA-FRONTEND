import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import CommonTable from '../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../components/common/DeleteConfirmationModal';

const INITIAL_EXPENSES = [
  { id: 1, expenseDate: '2026-07-20', expenseReason: 'Kitchen Cleaning Supplies', employee: 'Rahul Sharma', paidFrom: 'Petty Cash', amount: 1450, status: 'Approved', createdBy: 'Admin' },
  { id: 2, expenseDate: '2026-07-19', expenseReason: 'Fresh Vegetable Purchase', employee: 'Amit Kumar', paidFrom: 'Cash Register', amount: 3200, status: 'Approved', createdBy: 'Manager' },
  { id: 3, expenseDate: '2026-07-19', expenseReason: 'Gas Cylinder Refill', employee: 'Suresh Patel', paidFrom: 'Bank Transfer', amount: 2850, status: 'Pending', createdBy: 'Admin' },
  { id: 4, expenseDate: '2026-07-18', expenseReason: 'Printer Paper Rolls', employee: 'Pooja Singh', paidFrom: 'Petty Cash', amount: 650, status: 'Approved', createdBy: 'Admin' },
  { id: 5, expenseDate: '2026-07-17', expenseReason: 'Plumbing Repair Work', employee: 'Ramesh Verma', paidFrom: 'Cash Register', amount: 1200, status: 'Approved', createdBy: 'Manager' }
];

const ExpenseList = ({ showToast = () => {} }) => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem('alfa_pos_expenses');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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

  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    const updated = expenses.filter(e => e.id !== itemToDelete.id);
    setExpenses(updated);
    try {
      localStorage.setItem('alfa_pos_expenses', JSON.stringify(updated));
    } catch (e) {}
    showToast('Expense record deleted successfully.');
    setDeleteModalOpen(false);
    setItemToDelete(null);
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
