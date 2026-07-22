import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTrash } from 'react-icons/fa';
import PageHeader from '../../../components/common/PageHeader';
import CommonActionButtons from '../../../components/common/CommonActionButtons';

const REASON_OPTIONS = [
  'Kitchen Supplies',
  'Vegetables & Raw Food',
  'Maintenance & Repair',
  'Staff Welfare & Tea',
  'Utility & Electricity Bill',
  'Packaging Material',
  'Miscellaneous Expense'
];

const EMPLOYEE_OPTIONS = [
  'Rahul Sharma',
  'Amit Kumar',
  'Suresh Patel',
  'Pooja Singh',
  'Ramesh Verma'
];

const PAID_FROM_OPTIONS = [
  'Petty Cash',
  'Cash Register',
  'Bank Transfer',
  'Card Payment'
];

const createEmptyRow = () => ({
  rowId: Date.now() + Math.random(),
  reason: '',
  amount: '',
  explanation: '',
  employee: 'Rahul Sharma',
  paidFrom: 'Petty Cash'
});

const ExpenseForm = ({ showToast = () => {} }) => {
  const navigate = useNavigate();
  const [rows, setRows] = useState(() => Array.from({ length: 5 }, createEmptyRow));

  const handleRowChange = (index, field, value) => {
    setRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
  };

  const handleRemoveRow = (index) => {
    if (rows.length === 1) {
      setRows([createEmptyRow()]);
    } else {
      setRows(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleAdd10Rows = () => {
    const newRows = Array.from({ length: 10 }, createEmptyRow);
    setRows(prev => [...prev, ...newRows]);
    showToast('Added 10 new rows.');
  };

  const handleAddSingleRow = () => {
    setRows(prev => [...prev, createEmptyRow()]);
  };

  const handleSave = (e) => {
    if (e) e.preventDefault();
    const validRows = rows.filter(r => r.reason.trim() !== '' && r.amount !== '' && Number(r.amount) > 0);

    if (validRows.length === 0) {
      showToast('Please fill Reason and Amount for at least one row before saving.');
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem('alfa_pos_expenses') || '[]');
      const todayStr = new Date().toISOString().split('T')[0];
      const newEntries = validRows.map(r => ({
        id: Date.now() + Math.random(),
        expenseDate: todayStr,
        expenseReason: r.reason,
        employee: r.employee,
        paidFrom: r.paidFrom,
        amount: Number(r.amount),
        explanation: r.explanation,
        status: 'Approved',
        createdBy: 'Admin'
      }));

      const updatedList = [...newEntries, ...existing];
      localStorage.setItem('alfa_pos_expenses', JSON.stringify(updatedList));
      showToast(`Saved ${validRows.length} expense record(s) successfully!`);
      navigate('/setting/expense');
    } catch (err) {
      showToast('Failed to save expense records.');
    }
  };

  return (
    <div style={{ padding: '16px 24px', backgroundColor: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '16px', fontFamily: 'var(--font-family, sans-serif)' }}>
      {/* Page Header */}
      <PageHeader
        title="Expense Entry (Multi-Row)"
        breadcrumbs={['Settings', 'Payments & Finance', 'Expense List', 'New Entry']}
        showBack
        onBack={() => navigate('/setting/expense')}
        style={{ marginBottom: '4px' }}
      />

      {/* Main Multi-Row Card Form */}
      <form onSubmit={handleSave} style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '20px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px 14px', fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>#</th>
              <th style={{ padding: '12px 14px', fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', minWidth: '200px' }}>Expense Reason *</th>
              <th style={{ padding: '12px 14px', fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', minWidth: '130px' }}>Amount (₹) *</th>
              <th style={{ padding: '12px 14px', fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', minWidth: '220px' }}>Explanation / Note</th>
              <th style={{ padding: '12px 14px', fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', minWidth: '160px' }}>Employee</th>
              <th style={{ padding: '12px 14px', fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', minWidth: '150px' }}>Paid From</th>
              <th style={{ padding: '12px 14px', fontSize: '0.78rem', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'center', width: '60px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.rowId || index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 14px', fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>{index + 1}</td>

                {/* Reason Dropdown */}
                <td style={{ padding: '10px 14px' }}>
                  <select
                    value={row.reason}
                    onChange={e => handleRowChange(index, 'reason', e.target.value)}
                    style={{ width: '100%', height: '34px', padding: '4px 10px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#fff' }}
                  >
                    <option value="">-- Select Reason --</option>
                    {REASON_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>

                {/* Amount Field */}
                <td style={{ padding: '10px 14px' }}>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={row.amount}
                    onChange={e => handleRowChange(index, 'amount', e.target.value)}
                    style={{ width: '100%', height: '34px', padding: '4px 10px', fontSize: '0.85rem', fontWeight: 700, borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </td>

                {/* Explanation Field */}
                <td style={{ padding: '10px 14px' }}>
                  <input
                    type="text"
                    placeholder="Brief explanation..."
                    value={row.explanation}
                    onChange={e => handleRowChange(index, 'explanation', e.target.value)}
                    style={{ width: '100%', height: '34px', padding: '4px 10px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                  />
                </td>

                {/* Employee Dropdown */}
                <td style={{ padding: '10px 14px' }}>
                  <select
                    value={row.employee}
                    onChange={e => handleRowChange(index, 'employee', e.target.value)}
                    style={{ width: '100%', height: '34px', padding: '4px 10px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#fff' }}
                  >
                    {EMPLOYEE_OPTIONS.map(emp => <option key={emp} value={emp}>{emp}</option>)}
                  </select>
                </td>

                {/* Paid From Dropdown */}
                <td style={{ padding: '10px 14px' }}>
                  <select
                    value={row.paidFrom}
                    onChange={e => handleRowChange(index, 'paidFrom', e.target.value)}
                    style={{ width: '100%', height: '34px', padding: '4px 10px', fontSize: '0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#fff' }}
                  >
                    {PAID_FROM_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </td>

                {/* Delete Row Button */}
                <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(index)}
                    title="Remove row"
                    style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <FaTrash size={12} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Action Controls Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={handleAddSingleRow}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '0.8rem', fontWeight: 700, color: '#334155', cursor: 'pointer' }}
            >
              <FaPlus size={12} /> Add Row
            </button>
            <button
              type="button"
              onClick={handleAdd10Rows}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #0e7490', background: '#ecfeff', fontSize: '0.8rem', fontWeight: 800, color: '#0e7490', cursor: 'pointer' }}
            >
              <FaPlus size={12} /> Add 10 Rows
            </button>
          </div>

          <CommonActionButtons
            onSave={handleSave}
            onCancel={() => navigate('/setting/expense')}
            saveText="Save Expense Entries"
          />
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
