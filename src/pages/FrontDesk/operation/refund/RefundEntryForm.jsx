import React, { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { FaCoins, FaCreditCard } from 'react-icons/fa';

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

const RefundEntryForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    receiptNo: initialData?.receiptNo || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
    bookingNo: initialData?.bookingNo || '',
    roomNo: initialData?.roomNo || '',
    payType: initialData?.payType || '',
    amount: initialData?.amount || '3500.00',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    billNo: initialData?.billNo || '',
    refundAmount: initialData?.refundAmount || '',
    balance: initialData?.balance || '3500.00',
  });

  const set = (key) => (e) => setForm(f => {
    const updated = { ...f, [key]: e.target.value };
    // Simple balance math
    if (key === 'refundAmount') {
      const orig = parseFloat(form.amount) || 0;
      const ref = parseFloat(e.target.value) || 0;
      updated.balance = (orig - ref).toFixed(2);
    }
    return updated;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
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
        title={mode === 'add' ? 'Refund Entry' : 'Edit Refund Entry'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Refund Entry', mode === 'add' ? 'Add' : 'Edit']}
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
            lineHeight: 1.2
          }}>{form.receiptNo}</div>
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
          
          {/* Left Column: Transaction & Room Info */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
            {sectionTitle(<FaCreditCard />, 'Transaction & Room Info')}
            <div className="form-grid-2">
              <F label="Booking No" value={form.bookingNo} onChange={set('bookingNo')} placeholder="Booking reference" />
              <F label="Bill No" value={form.billNo} onChange={set('billNo')} placeholder="Bill number" />
              
              <div style={{ gridColumn: 'span 2' }}>
                <F label="Room No" value={form.roomNo} onChange={set('roomNo')} placeholder="Room number" />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <F label="Pay Type" required>
                  <select className="form-select" value={form.payType} onChange={set('payType')} style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }} required>
                    <option value="">Select Pay Type</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </F>
              </div>
            </div>
          </div>

          {/* Right Column: Refund Summary */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
            {sectionTitle(<FaCoins />, 'Refund Summary')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* Original Amount (standard gray look) */}
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
                  Original Amount (₹)
                </label>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                  {form.amount}
                </div>
              </div>

              {/* Refund Amount Input field */}
              <F label="Refund Amount (₹)" required>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.refundAmount}
                  onChange={set('refundAmount')}
                  placeholder="0.00"
                  required
                  style={{ fontSize: '0.95rem', fontWeight: 700, padding: '4px 8px', height: '34px' }}
                />
              </F>

              {/* Highlighted Remaining Balance Card */}
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
                  Remaining Balance (₹)
                </label>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                  {form.balance}
                </div>
              </div>

            </div>
          </div>

        </div>

        <CommonActionButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText={mode === 'add' ? 'Save' : 'Update'}
        />
      </form>
    </div>
  );
};

export default RefundEntryForm;
