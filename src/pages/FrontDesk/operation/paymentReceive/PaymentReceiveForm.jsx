import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import React, { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { FaCreditCard, FaCoins } from 'react-icons/fa';
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

const PaymentReceiveForm = ({ mode, initialData, onSave, onCancel, existingRecords = [] }) => {
  const [form, setForm] = useState(() => ({
    receiptNo: initialData?.receiptNo || `RCP-${Math.floor(1000 + Math.random() * 9000)}`,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    type: initialData?.type || '',
    bookingNo: initialData?.bookingNo || '',
    billNo: initialData?.billNo || '',
    roomNo: initialData?.roomNo || '',
    payType: initialData?.payType || '',
    amount: initialData?.amount || '',
    narration: initialData?.narration || '',
    billAmount: initialData?.billAmount || '0.00',
    paidAmount: initialData?.paidAmount || '0.00',
    billBalance: initialData?.billBalance || '0.00',
  }));

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['receiptNo'],
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
      <style dangerouslySetInnerHTML={{
        __html: `
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
        title={mode === 'add' ? 'Payment Receive Entry' : 'Edit Payment Receive'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Payment Receive Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack onBack={onCancel}
        style={{ marginBottom: '8px' }}
      />

      {/* Colorful Top Control Bar */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch', marginBottom: '12px', borderBottom: '1px solid var(--border)', padding: '0 8px 8px', width: '100%', boxSizing: 'border-box' }}>
        {/* Receipt No - Purple */}
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
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Receipt No</label>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#fff',
            padding: '2px 0',
            width: '100%'
          }}>
            {form.receiptNo}
          </div>
        </div>

        {/* Date - Cyan */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
          borderRadius: '8px',
          padding: '8px 14px',
          boxShadow: '0 4px 12px rgba(8, 145, 178, 0.35)',
          flex: 1,
          justifyContent: 'center'
        }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date <span style={{ color: '#fde68a' }}>*</span></label>
          <input
            type="date"
            value={form.date}
            onChange={set('date')}
            required
            style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              background: 'rgba(255,255,255,0.22)',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '5px',
              color: '#fff',
              padding: '4px 10px',
              height: '36px',
              width: '100%',
              colorScheme: 'dark',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit} style={{ padding: '0 8px 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px', alignItems: 'start', marginBottom: '12px' }}>

          {/* Left Column: Payment Details Block */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
            {sectionTitle(<FaCreditCard />, 'Payment Details')}
            <div className="form-grid-2" style={{ gap: '6px 8px' }}>
              <F label="Type">
                <select className="form-select" value={form.type} onChange={set('type')} style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}>
                  <option value="">Select Type</option>
                  <option value="Advance">Advance</option>
                  <option value="Room Payment">Room Payment</option>
                  <option value="Bill Payment">Bill Payment</option>
                  <option value="Partial Payment">Partial Payment</option>
                </select>
              </F>

              <F label="Booking No" value={form.bookingNo} onChange={set('bookingNo')} placeholder="Booking reference" />
              <F label="Bill No" value={form.billNo} onChange={set('billNo')} placeholder="Bill number" />

              <F label="Room No" value={form.roomNo} onChange={set('roomNo')} placeholder="Room number" />

              <F label="Pay Type" required>
                <select className="form-select" value={form.payType} onChange={set('payType')} required style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}>
                  <option value="">Select Pay Type</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Credit">Credit</option>
                </select>
              </F>

              <F label="Amount (₹)" type="number" required value={form.amount} onChange={set('amount')} placeholder="0.00" inputStyle={{ step: '0.01', min: '0' }} />

              <div style={{ gridColumn: 'span 2' }}>
                <F label="Narration">
                  <textarea className="form-textarea" rows={1} value={form.narration} onChange={set('narration')} placeholder="Payment narration..." style={{ fontSize: '0.9rem', padding: '6px 8px' }} />
                </F>
              </div>
            </div>
          </div>

          {/* Right Column: Payment Summary Block */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
            {sectionTitle(<FaCoins />, 'Payment Summary')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Bill Amount */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                background: 'var(--slate-50, #f8fafc)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '8px 12px'
              }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary, #475569)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Bill Amount (₹)
                </label>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                  {form.billAmount}
                </div>
              </div>

              {/* Paid Amount */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                background: 'var(--slate-50, #f8fafc)',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                padding: '8px 12px'
              }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-secondary, #475569)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Paid Amount (₹)
                </label>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                  {form.paidAmount}
                </div>
              </div>

              {/* Bill Balance (₹) - Highlighted and Vibrant */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)', // Vibrant rose red gradient
                borderRadius: '6px',
                padding: '8px 12px',
                boxShadow: '0 4px 10px rgba(244, 63, 94, 0.25)',
                color: '#fff'
              }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255, 255, 255, 0.9)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Bill Balance (₹)
                </label>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  {form.billBalance}
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

export default PaymentReceiveForm;
