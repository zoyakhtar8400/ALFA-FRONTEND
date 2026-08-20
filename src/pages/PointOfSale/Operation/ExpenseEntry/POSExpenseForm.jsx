import React, { useState, useEffect } from 'react';
import CommonModal from '../../../../components/common/CommonModal';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import apiClient from '../../../../services/apiClient';

const POSExpenseForm = ({
  isOpen,
  expenseData,
  onSave,
  onClose,
  showToast
}) => {
  const isEdit = Boolean(expenseData && expenseData.id);

  const [paymentModes, setPaymentModes] = useState([]);

  const [form, setForm] = useState({
    expense_id: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
    expense_date: new Date().toISOString().split('T')[0],
    field1: '',
    amount: '',
    payment_mode: '',
    description: ''
  });

  useEffect(() => {
    fetchPaymentModes();
    
    if (isEdit && isOpen) {
      setForm({
        expense_id: expenseData.expense_id || '',
        expense_date: expenseData.expense_date || new Date().toISOString().split('T')[0],
        field1: expenseData.field1 || '',
        amount: expenseData.amount || '',
        payment_mode: expenseData.payment_mode || '',
        description: expenseData.description || ''
      });
    } else if (!isEdit && isOpen) {
      setForm({
        expense_id: `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
        expense_date: new Date().toISOString().split('T')[0],
        field1: '',
        amount: '',
        payment_mode: paymentModes.length > 0 ? (paymentModes[0].payment_mode_name || paymentModes[0].name) : 'Cash',
        description: ''
      });
    }
  }, [expenseData, isOpen]);

  const fetchPaymentModes = async () => {
    try {
      const response = await apiClient.get('/payment-modes');
      const modesList = response?.paymentModes || response?.payment_modes || response?.data || [];
      
      if (modesList && modesList.length > 0) {
        setPaymentModes(modesList);
        if (!isEdit && form.payment_mode === '') {
          setForm(prev => ({ ...prev, payment_mode: modesList[0].payment_mode_name || modesList[0].name }));
        }
      }
    } catch (error) {
      console.error('Error fetching payment modes:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.expense_id || !form.amount || !form.field1) return;

    try {
      if (isEdit) {
        await apiClient.put(`/expenses/${expenseData.id}`, form);
        showToast('Expense updated successfully');
      } else {
        await apiClient.post(`/expenses`, form);
        showToast('Expense added successfully');
      }
      onSave(); // this triggers parent to refresh and close
    } catch (error) {
      console.error('Error saving expense:', error);
      showToast('Failed to save expense');
    }
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Expense Entry' : 'Add Expense Entry'}
      maxWidth="700px"
    >
      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit}>
        <FormCard>
          <div className="form-grid-2">
            
            <div className="form-field">
              <label className="form-label">
                Expense Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="expense_id"
                value={form.expense_id}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="expense_date"
                value={form.expense_date}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label">
                User Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="field1"
                placeholder="Enter user name"
                value={form.field1}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label">
                Amount (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="amount"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={handleChange}
                className="form-input"
                required
              />
            </div>

            <div className="form-field">
              <label className="form-label">
                Pay Type <span className="text-red-500">*</span>
              </label>
              <select
                name="payment_mode"
                value={form.payment_mode}
                onChange={handleChange}
                className="form-select"
                required
              >
                {paymentModes.length === 0 && <option value="Cash">Cash</option>}
                {paymentModes.map(mode => (
                  <option key={mode.id || mode.name || mode.payment_mode_name} value={mode.payment_mode_name || mode.name}>
                    {mode.payment_mode_name || mode.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">Remark</label>
              <input
                type="text"
                name="description"
                placeholder="Enter remark"
                value={form.description}
                onChange={handleChange}
                className="form-input"
              />
            </div>

          </div>
        </FormCard>

        <CommonActionButtons
          onSave={handleSubmit}
          onCancel={onClose}
          saveText={isEdit ? "Update" : "Save"}
        />
      </form>
    </CommonModal>
  );
};

export default POSExpenseForm;
