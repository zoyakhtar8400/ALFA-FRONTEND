import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import CommonTable from '../../../../components/common/CommonTable';
import DeleteConfirmationModal from '../../../../components/common/DeleteConfirmationModal';
import CommonModal from '../../../../components/common/CommonModal';
import apiClient from '../../../../services/apiClient';
import POSExpenseForm from './POSExpenseForm';

const POSExpenseList = ({ showToast }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/expenses`);
      if (response && response.body) {
        setExpenses(response.body);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
      showToast('Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'expense_id', label: 'Expense No' },
    { key: 'expense_date', label: 'Date' },
    { key: 'field1', label: 'User Name' },
    { key: 'amount', label: 'Amount (₹)', render: (val) => `₹ ${Number(val || 0).toLocaleString('en-IN')}` },
    { key: 'payment_mode', label: 'Pay Type' },
    { key: 'description', label: 'Remark' },
    { key: 'action', label: 'Actions', sortable: false }
  ];

  const handleAddClick = () => {
    setExpenseToEdit(null);
    setFormModalOpen(true);
  };

  const handleEditClick = (row) => {
    setExpenseToEdit(row);
    setFormModalOpen(true);
  };

  const handleDeleteClick = (row) => {
    setItemToDelete(row);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await apiClient.delete(`/expenses/${itemToDelete.id}`);
      setExpenses(expenses.filter(e => e.id !== itemToDelete.id));
      showToast('Expense record deleted successfully.');
    } catch (error) {
      console.error('Error deleting expense:', error);
      showToast('Failed to delete expense');
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleFormSave = () => {
    setFormModalOpen(false);
    fetchExpenses();
  };

  return (
    <div style={{ padding: '16px 24px', backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <CommonTable
        title="POS Expense Master"
        columns={columns}
        data={expenses}
        loading={loading}
        onAddEntry={handleAddClick}
        addEntryLabel="+ Add Expense"
        showBack={false}
        actions={[
          { label: 'Edit', onClick: handleEditClick, icon: <FaEdit size={14} /> },
          { label: 'Delete', isDanger: true, onClick: handleDeleteClick, icon: <FaTrash size={14} /> }
        ]}
        searchPlaceholder="Search expense..."
        showToast={showToast}
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Expense Master']}
      />

      <POSExpenseForm
        isOpen={formModalOpen}
        expenseData={expenseToEdit}
        onClose={() => setFormModalOpen(false)}
        onSave={handleFormSave}
        showToast={showToast}
      />

      {deleteModalOpen && (
        <DeleteConfirmationModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          itemName={itemToDelete?.description || 'Expense'}
        />
      )}
    </div>
  );
};

export default POSExpenseList;
