import { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { FaCoins, FaRegFileAlt } from 'react-icons/fa';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';

const F = ({ label, type = 'text', placeholder, required, disabled, children, value, onChange, style, inputStyle, inputClassName }) => (
  <div className="form-field" style={{ marginBottom: '4px', ...style }}>
    <label className="form-label" style={{ marginBottom: '2px' }}>
      {label}{required && <span className="text-red-500"> *</span>}
    </label>
    {children || (
      <input
        className={`form-input${disabled ? ' bg-slate-50 cursor-not-allowed' : ''} ${inputClassName || ''}`}
        type={type}
        value={value ?? ''}
        onChange={disabled ? undefined : onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px', minHeight: '34px', ...inputStyle }}
      />
    )}
  </div>
);

const ExpenseEntryForm = ({ mode, initialData, onSave, onCancel, existingRecords = [] }) => {
  const [form, setForm] = useState(() => ({
    expenseNo: initialData?.expenseNo || initialData?.expense_id || '',
    date: initialData?.date || initialData?.expense_date || new Date().toISOString().split('T')[0],
    userName: initialData?.userName || initialData?.field1 || '',
    expenseCharge: initialData?.expenseCharge || initialData?.description || '',
    amount: initialData?.amount || '',
    payType: initialData?.payType || initialData?.payment_mode || '',
    remark: initialData?.remark || initialData?.description || '',
  }));

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['expenseNo'],
    currentId: initialData?.id,
    mode
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkBeforeSave()) return;
    onSave(form);
  };

  const sectionTitle = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0 4px', borderBottom: '2px solid var(--primary)', marginBottom: '8px' }}>
      <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary)' }}>{title}</span>
    </div>
  );

  return (
    <div className="animate-in duration-200" style={{ padding: '0 8px' }}>
      <style dangerouslySetInnerHTML={{__html: `
        ::-webkit-scrollbar {
          display: none !important;
          width: 0px !important;
          height: 0px !important;
        }
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />

      <PageHeader
        title={mode === 'add' ? 'Expense Entry' : 'Edit Expense'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Expense Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack onBack={onCancel}
        style={{ marginBottom: '8px' }}
      />

      {/* Colorful Top Control Bar */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch', marginBottom: '12px', borderBottom: '1px solid var(--border)', padding: '0 8px 8px', width: '100%', boxSizing: 'border-box' }}>
        {/* Expense No - Purple */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)',
          borderRadius: '8px',
          padding: '8px 14px',
          boxShadow: '0 4px 12px rgba(109, 40, 217, 0.35)',
          flex: 1,
          justifyContent: 'center'
        }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Expense No</label>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.2
          }}>{form.expenseNo}</div>
        </div>

        {/* Date - Cyan */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          borderRadius: '8px',
          padding: '8px 14px',
          boxShadow: '0 4px 12px rgba(6, 182, 212, 0.35)',
          flex: 1,
          justifyContent: 'center'
        }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</label>
          <input
            type="date"
            value={form.date}
            onChange={set('date')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: 800,
              outline: 'none',
              height: '30px',
              width: '100%',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '0 8px 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px', alignItems: 'start', marginBottom: '10px' }}>
          
          {/* Left Column: Expense Info */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
            {sectionTitle(<FaRegFileAlt />, 'Expense Information')}
            <div className="form-grid-2">
              
              <div style={{ gridColumn: 'span 2' }}>
                <F label="User Name" value={form.userName} onChange={set('userName')} placeholder="Enter user name" />
              </div>

              <F label="Expense Charge" required>
                <select className="form-select" value={form.expenseCharge} onChange={set('expenseCharge')} style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }} required>
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
              </F>

              <F label="Pay Type" required>
                <select className="form-select" value={form.payType} onChange={set('payType')} style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }} required>
                  <option value="">Select Pay Type</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="UPI">UPI</option>
                  <option value="Card">Card</option>
                </select>
              </F>

              <div style={{ gridColumn: 'span 2' }}>
                <F label="Remark">
                  <textarea className="form-textarea" rows={2} value={form.remark} onChange={set('remark')} placeholder="Enter remarks or notes..." style={{ fontSize: '0.9rem', padding: '6px 8px' }} />
                </F>
              </div>

            </div>
          </div>

          {/* Right Column: Collective Summary */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
            {sectionTitle(<FaCoins />, 'Summary Information')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Expense Amount Input field */}
              <F label="Amount (₹)" required>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={set('amount')}
                  placeholder="0.00"
                  required
                  style={{ fontSize: '0.95rem', fontWeight: 700, padding: '4px 8px', height: '34px' }}
                />
              </F>

              {/* Highlighted Amount Summary Card */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
                borderRadius: '6px',
                padding: '8px 12px',
                boxShadow: '0 4px 10px rgba(244, 63, 94, 0.25)',
                color: '#fff',
                marginTop: '4px'
              }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.9)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Total Expense Cost (₹)
                </label>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  ₹ {(parseFloat(form.amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

            </div>
          </div>

        </div>

        <CommonActionButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText={mode === 'add' ? 'Save' : 'Update'}
          saveDisabled={isDuplicate}
        />
        <DuplicateModal />
      </form>
    </div>
  );
};

export default ExpenseEntryForm;
