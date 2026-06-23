import React, { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import FormCard from '../../../../components/common/FormCard';

const BILL_COLS = ['Date', 'Particular', 'Room No', 'Base Amount', 'Gross Amount', 'Discount %', 'Discount', 'SGST', 'CGST', 'VAT', 'Received Amount'];
const PAY_COLS = ['Receipt No', 'Date', 'Pay Type', 'Amount'];

const SummaryRow = ({ label, value, bold }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '8px 0',
      borderBottom: '1px solid var(--border)',
      fontWeight: bold ? 700 : 400,
      color: bold ? 'var(--dark)' : 'var(--text-primary)',
    }}
  >
    <span style={{ fontSize: '0.875rem' }}>{label}</span>
    <span style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>₹ {value}</span>
  </div>
);

const CheckoutEntryForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    grcNo: initialData?.grcNo || '',
    billNo: initialData?.billNo || `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
    checkoutDate: initialData?.checkoutDate || new Date().toISOString().split('T')[0],
    checkoutTime: initialData?.checkoutTime || '',
    guestName: initialData?.guestName || '',
    city: initialData?.city || '',
    companyName: initialData?.companyName || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    noOfDayStay: initialData?.noOfDayStay || 1,
    roomNo: initialData?.roomNo || '',
    checkinDate: initialData?.checkinDate || '',
    checkinTime: initialData?.checkinTime || '',
    paymentMode: initialData?.paymentMode || '',
    companyGstin: initialData?.companyGstin || '',
    // Tax Summary
    grossAmount: initialData?.grossAmount || '0.00',
    discount: initialData?.discount || '0.00',
    sgst: initialData?.sgst || '0.00',
    cgst: initialData?.cgst || '0.00',
    roundOff: initialData?.roundOff || '0.00',
    netAmount: initialData?.netAmount || '0.00',
    // Settlement
    roomSettlement: initialData?.roomSettlement || '0.00',
    netTotal: initialData?.netTotal || '0.00',
    advanceSettlement: initialData?.advanceSettlement || '0.00',
    balance: initialData?.balance || '0.00',
  });

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const billData = [
    {
      date: '2026-06-20',
      particular: 'Room Charge',
      roomNo: '101',
      baseAmount: '3000',
      grossAmount: '3540',
      discountPct: '0',
      discount: '0',
      sgst: '270',
      cgst: '270',
      vat: '0',
      receivedAmount: '3540',
    },
  ];

  const payData = [
    { receiptNo: 'RCP-001', date: '2026-06-22', payType: 'Cash', amount: '3540' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="animate-in duration-200">
      <PageHeader
        title={mode === 'add' ? 'Checkout Entry' : 'Edit Checkout'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Checkout Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
      />

      <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>
        <div className="operation-form-grid">
          {/* Guest Information */}
          <FormCard title="Guest Information" className="mb-0">
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">GRC No</label>
                <input className="form-input" type="text" value={form.grcNo} onChange={set('grcNo')} placeholder="GRC number" />
              </div>
              <div className="form-field">
                <label className="form-label">Bill No</label>
                <input className="form-input bg-slate-50 cursor-not-allowed" type="text" value={form.billNo} disabled />
              </div>
              <div className="form-field form-span-2">
                <label className="form-label">Guest Name</label>
                <input className="form-input" type="text" value={form.guestName} onChange={set('guestName')} placeholder="Guest name" />
              </div>
              <div className="form-field">
                <label className="form-label">City</label>
                <input className="form-input" type="text" value={form.city} onChange={set('city')} placeholder="City" />
              </div>
              <div className="form-field">
                <label className="form-label">Company Name</label>
                <input className="form-input" type="text" value={form.companyName} onChange={set('companyName')} placeholder="Company" />
              </div>
              <div className="form-field form-span-2">
                <label className="form-label">Company GSTIN</label>
                <input className="form-input" type="text" value={form.companyGstin} onChange={set('companyGstin')} placeholder="GST number" />
              </div>
            </div>
          </FormCard>

          {/* Stay & Routing Details */}
          <FormCard title="Stay & Routing Details" className="mb-0">
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Checkout Date</label>
                <input className="form-input" type="date" value={form.checkoutDate} onChange={set('checkoutDate')} required />
              </div>
              <div className="form-field">
                <label className="form-label">Checkout Time</label>
                <input className="form-input" type="time" value={form.checkoutTime} onChange={set('checkoutTime')} />
              </div>
              <div className="form-field">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={form.date} onChange={set('date')} />
              </div>
              <div className="form-field">
                <label className="form-label">No of Day Stay</label>
                <input className="form-input bg-slate-50 cursor-not-allowed" type="number" value={form.noOfDayStay} readOnly />
              </div>
              <div className="form-field">
                <label className="form-label">Room No</label>
                <input className="form-input" type="text" value={form.roomNo} onChange={set('roomNo')} placeholder="Room number" />
              </div>
              <div className="form-field">
                <label className="form-label">Checkin Date</label>
                <input className="form-input bg-slate-50 cursor-not-allowed" type="date" value={form.checkinDate} readOnly />
              </div>
              <div className="form-field">
                <label className="form-label">Checkin Time</label>
                <input className="form-input bg-slate-50 cursor-not-allowed" type="time" value={form.checkinTime} readOnly />
              </div>
              <div className="form-field">
                <label className="form-label">Payment Mode</label>
                <select className="form-select" value={form.paymentMode} onChange={set('paymentMode')}>
                  <option value="">Select Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit">Credit</option>
                </select>
              </div>
            </div>
          </FormCard>

          {/* Bill Details */}
          <FormCard title="Bill Details" className="mb-0">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                <thead>
                  <tr style={{ background: 'var(--primary-light)', borderBottom: '2px solid var(--border)' }}>
                    {BILL_COLS.map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '8px 10px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: 'var(--dark)',
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {billData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 10px' }}>{row.date}</td>
                      <td style={{ padding: '8px 10px' }}>{row.particular}</td>
                      <td style={{ padding: '8px 10px' }}>{row.roomNo}</td>
                      <td style={{ padding: '8px 10px' }}>₹{row.baseAmount}</td>
                      <td style={{ padding: '8px 10px' }}>₹{row.grossAmount}</td>
                      <td style={{ padding: '8px 10px' }}>{row.discountPct}%</td>
                      <td style={{ padding: '8px 10px' }}>₹{row.discount}</td>
                      <td style={{ padding: '8px 10px' }}>₹{row.sgst}</td>
                      <td style={{ padding: '8px 10px' }}>₹{row.cgst}</td>
                      <td style={{ padding: '8px 10px' }}>₹{row.vat}</td>
                      <td style={{ padding: '8px 10px' }}>₹{row.receivedAmount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FormCard>

          {/* Payment Details */}
          <FormCard title="Payment Details" className="mb-0">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: 'var(--primary-light)', borderBottom: '2px solid var(--border)' }}>
                    {PAY_COLS.map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: '8px 10px',
                          textAlign: 'left',
                          fontWeight: 600,
                          color: 'var(--dark)',
                          fontSize: '0.72rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payData.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 10px' }}>{row.receiptNo}</td>
                      <td style={{ padding: '8px 10px' }}>{row.date}</td>
                      <td style={{ padding: '8px 10px' }}>{row.payType}</td>
                      <td style={{ padding: '8px 10px' }}>₹{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FormCard>

          {/* Tax Summary */}
          <FormCard title="Tax Summary" className="mb-0">
            <SummaryRow label="Gross Amount" value={form.grossAmount} />
            <SummaryRow label="Discount" value={form.discount} />
            <SummaryRow label="SGST" value={form.sgst} />
            <SummaryRow label="CGST" value={form.cgst} />
            <SummaryRow label="Round Off" value={form.roundOff} />
            <SummaryRow label="Net Amount" value={form.netAmount} bold />
          </FormCard>

          {/* Settlement Summary */}
          <FormCard title="Settlement Summary" className="mb-0">
            <SummaryRow label="Room Settlement" value={form.roomSettlement} />
            <SummaryRow label="Net Total" value={form.netTotal} />
            <SummaryRow label="Advance + Settlement" value={form.advanceSettlement} />
            <SummaryRow label="Balance" value={form.balance} bold />
          </FormCard>
        </div>

        {/* Unified Footer */}
        <div className="form-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {mode === 'add' ? 'Save' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutEntryForm;
