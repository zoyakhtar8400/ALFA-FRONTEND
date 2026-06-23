import React, { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const TABLE_COLS = ['Voucher No', 'Date', 'Room No', 'Service Name', 'CGST Amount'];

const ServiceChargeEntryForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    voucherNo: initialData?.voucherNo || `SVC-${Math.floor(1000 + Math.random() * 9000)}`,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    roomNo: initialData?.roomNo || '',
    guestName: initialData?.guestName || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    serviceName: initialData?.serviceName || '',
    amount: initialData?.amount || '',
    taxInclusive: initialData?.taxInclusive || 'No',
    remark: initialData?.remark || '',
  });

  const [charges] = useState([
    { voucherNo: 'SVC-1001', date: '2026-06-20', roomNo: '101', serviceName: 'Laundry', cgstAmount: '18.00' },
    { voucherNo: 'SVC-1002', date: '2026-06-21', roomNo: '205', serviceName: 'Room Service', cgstAmount: '45.00' },
  ]);

  const [activeTab, setActiveTab] = useState('details');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="animate-in duration-200">
      <PageHeader
        title={mode === 'add' ? 'Service Charge Entry' : 'Edit Service Charge'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Service Charge Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack onBack={onCancel}
      />

      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', padding: '0 24px 12px', marginBottom: '16px' }}>
        {[
          { key: 'details', label: 'Service Charge Details' },
          { key: 'history', label: 'Service Charge History' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === t.key ? 'var(--primary)' : 'var(--primary-light)',
              color: activeTab === t.key ? '#fff' : 'var(--primary)',
              transition: 'all 0.2s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>
        <div style={{ minHeight: '340px' }}>
          {activeTab === 'details' && (
            <FormCard title="Service Charge Details" className="mb-0">
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">Voucher No</label>
                  <input className="form-input bg-slate-50 cursor-not-allowed" type="text" value={form.voucherNo} disabled />
                </div>
                <div className="form-field">
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" value={form.date} onChange={set('date')} required />
                </div>
                <div className="form-field">
                  <label className="form-label">Room No</label>
                  <input className="form-input" type="text" value={form.roomNo} onChange={set('roomNo')} placeholder="Room number" />
                </div>
                <div className="form-field">
                  <label className="form-label">Guest Name</label>
                  <input className="form-input" type="text" value={form.guestName} onChange={set('guestName')} placeholder="Guest name" />
                </div>
                <div className="form-field form-span-2">
                  <label className="form-label">Address</label>
                  <input className="form-input" type="text" value={form.address} onChange={set('address')} placeholder="Full address" />
                </div>
                <div className="form-field">
                  <label className="form-label">City</label>
                  <input className="form-input" type="text" value={form.city} onChange={set('city')} placeholder="City" />
                </div>
                <div className="form-field">
                  <label className="form-label">Service Name <span className="text-red-500">*</span></label>
                  <select className="form-select" value={form.serviceName} onChange={set('serviceName')} required>
                    <option value="">Select Service</option>
                    <option value="Laundry">Laundry</option>
                    <option value="Room Service">Room Service</option>
                    <option value="Mini Bar">Mini Bar</option>
                    <option value="Spa">Spa</option>
                    <option value="Telephone">Telephone</option>
                    <option value="Internet">Internet</option>
                    <option value="Transport">Transport</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Amount (₹) <span className="text-red-500">*</span></label>
                  <input className="form-input" type="number" min="0" step="0.01" value={form.amount} onChange={set('amount')} placeholder="0.00" required />
                </div>
                <div className="form-field">
                  <label className="form-label">Tax Inclusive</label>
                  <select className="form-select" value={form.taxInclusive} onChange={set('taxInclusive')}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div className="form-field form-span-2">
                  <label className="form-label">Remark</label>
                  <textarea className="form-textarea" rows={1} value={form.remark} onChange={set('remark')} placeholder="Remarks..." />
                </div>
              </div>
            </FormCard>
          )}

          {activeTab === 'history' && (
            <FormCard title="Service Charge History" className="mb-0">
              <div style={{ overflowX: 'auto', maxHeight: '320px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--primary-light)', borderBottom: '2px solid var(--border)' }}>
                      {TABLE_COLS.map(h => (
                        <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 600, color: 'var(--dark)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {charges.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '6px 8px' }}>{row.voucherNo}</td>
                        <td style={{ padding: '6px 8px' }}>{row.date}</td>
                        <td style={{ padding: '6px 8px' }}>{row.roomNo}</td>
                        <td style={{ padding: '6px 8px' }}>{row.serviceName}</td>
                        <td style={{ padding: '6px 8px' }}>₹{row.cgstAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </FormCard>
          )}
        </div>

        <div className="form-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
          <button type="button" onClick={onCancel} className="btn-secondary" style={{ cursor: 'pointer' }}>
            Cancel
          </button>

          {activeTab !== 'details' && (
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'history') setActiveTab('details');
              }}
              className="btn-secondary"
              style={{ cursor: 'pointer' }}
            >
              Back
            </button>
          )}

          {activeTab !== 'history' ? (
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'details') setActiveTab('history');
              }}
              className="btn-primary"
              style={{ cursor: 'pointer' }}
            >
              Next
            </button>
          ) : (
            <button type="submit" className="btn-primary" style={{ cursor: 'pointer' }}>
              {mode === 'add' ? 'Save' : 'Update'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ServiceChargeEntryForm;
