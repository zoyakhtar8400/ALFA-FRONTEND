import React, { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const PaymentReceiveForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    receiptNo: initialData?.receiptNo || `RCP-${Math.floor(1000 + Math.random() * 9000)}`,
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
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="animate-in duration-200">
      <PageHeader
        title={mode === 'add' ? 'Payment Receive Entry' : 'Edit Payment Receive'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Payment Receive Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack onBack={onCancel}
      />
      <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', marginBottom: '12px' }}>
          {/* Left Column */}
          <FormCard title="Payment Details" className="mb-0">
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Receipt No</label>
                <input className="form-input bg-slate-50 cursor-not-allowed" type="text" value={form.receiptNo} disabled />
              </div>
              <div className="form-field">
                <label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={set('type')}>
                  <option value="">Select Type</option>
                  <option value="Advance">Advance</option>
                  <option value="Room Payment">Room Payment</option>
                  <option value="Bill Payment">Bill Payment</option>
                  <option value="Partial Payment">Partial Payment</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Booking No</label>
                <input className="form-input" type="text" value={form.bookingNo} onChange={set('bookingNo')} placeholder="Booking reference" />
              </div>
              <div className="form-field">
                <label className="form-label">Bill No</label>
                <input className="form-input" type="text" value={form.billNo} onChange={set('billNo')} placeholder="Bill number" />
              </div>
              <div className="form-field">
                <label className="form-label">Room No</label>
                <input className="form-input" type="text" value={form.roomNo} onChange={set('roomNo')} placeholder="Room number" />
              </div>
              <div className="form-field">
                <label className="form-label">Pay Type <span className="text-red-500">*</span></label>
                <select className="form-select" value={form.payType} onChange={set('payType')} required>
                  <option value="">Select Pay Type</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Credit">Credit</option>
                </select>
              </div>
              <div className="form-field form-span-2">
                <label className="form-label">Amount (₹) <span className="text-red-500">*</span></label>
                <input className="form-input" type="number" min="0" step="0.01" value={form.amount} onChange={set('amount')} placeholder="0.00" required />
              </div>
              <div className="form-field form-span-2">
                <label className="form-label">Narration</label>
                <textarea className="form-textarea" rows={1} value={form.narration} onChange={set('narration')} placeholder="Payment narration..." />
              </div>
            </div>
          </FormCard>

          {/* Right Column */}
          <FormCard title="Payment Summary" className="mb-0">
            <div className="form-grid-2" style={{ gridTemplateColumns: '1fr' }}>
              <div className="form-field">
                <label className="form-label">Bill Amount (₹)</label>
                <input className="form-input bg-slate-50 cursor-not-allowed" type="text" value={form.billAmount} readOnly />
              </div>
              <div className="form-field">
                <label className="form-label">Paid Amount (₹)</label>
                <input className="form-input bg-slate-50 cursor-not-allowed" type="text" value={form.paidAmount} readOnly />
              </div>
              <div className="form-field">
                <label className="form-label">Bill Balance (₹)</label>
                <input className="form-input bg-slate-50 cursor-not-allowed" type="text" value={form.billBalance} readOnly />
              </div>
            </div>
          </FormCard>
        </div>

        <div className="form-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
          <button type="button" onClick={onCancel} className="btn-secondary" style={{ cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" style={{ cursor: 'pointer' }}>
            {mode === 'add' ? 'Save' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentReceiveForm;
