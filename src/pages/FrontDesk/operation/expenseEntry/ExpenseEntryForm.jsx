import React, { useState } from 'react';

const ExpenseEntryForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    expenseNo: initialData?.expenseNo || `EXP-${Math.floor(1000 + Math.random() * 9000)}`,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    userName: initialData?.userName || '',
    expenseCharge: initialData?.expenseCharge || '',
    amount: initialData?.amount || '',
    payType: initialData?.payType || '',
    remark: initialData?.remark || '',
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="form-grid-2">
        <div className="form-field">
          <label className="form-label">Expense No</label>
          <input className="form-input bg-slate-50 cursor-not-allowed" type="text" value={form.expenseNo} disabled />
        </div>
        <div className="form-field">
          <label className="form-label">Date</label>
          <input className="form-input" type="date" value={form.date} onChange={set('date')} required />
        </div>
        <div className="form-field form-span-2">
          <label className="form-label">User Name</label>
          <input className="form-input" type="text" value={form.userName} onChange={set('userName')} placeholder="Enter user name" />
        </div>
        <div className="form-field">
          <label className="form-label">Expense Charge <span className="text-red-500">*</span></label>
          <select className="form-select" value={form.expenseCharge} onChange={set('expenseCharge')} required>
            <option value="">Select Expense Type</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Vehicle Fuel">Vehicle Fuel</option>
            <option value="Utilities">Utilities</option>
            <option value="Staff Welfare">Staff Welfare</option>
            <option value="Marketing">Marketing</option>
            <option value="Housekeeping">Housekeeping</option>
            <option value="Kitchen Supplies">Kitchen Supplies</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </select>
        </div>
        <div className="form-field">
          <label className="form-label">Amount (₹) <span className="text-red-500">*</span></label>
          <input className="form-input" type="number" min="0" step="0.01" value={form.amount} onChange={set('amount')} placeholder="0.00" required />
        </div>
        <div className="form-field form-span-2">
          <label className="form-label">Pay Type <span className="text-red-500">*</span></label>
          <select className="form-select" value={form.payType} onChange={set('payType')} required>
            <option value="">Select Pay Type</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Cheque">Cheque</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
          </select>
        </div>
        <div className="form-field form-span-2">
          <label className="form-label">Remark</label>
          <textarea className="form-textarea" rows={2} value={form.remark} onChange={set('remark')} placeholder="Enter remarks or notes..." />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '8px' }}>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" className="btn-primary">
          {mode === 'add' ? 'Save' : 'Update'}
        </button>
      </div>
    </form>
  );
};

export default ExpenseEntryForm;
