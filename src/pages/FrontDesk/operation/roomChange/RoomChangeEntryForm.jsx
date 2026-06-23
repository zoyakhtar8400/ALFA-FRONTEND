import React, { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const RoomChangeEntryForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    // Old Room
    voucherNo: initialData?.voucherNo || `RCH-${Math.floor(1000 + Math.random() * 9000)}`,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    grcNo: initialData?.grcNo || '',
    roomNo: initialData?.roomNo || '',
    guestName: initialData?.guestName || '',
    adult: initialData?.adult || 1,
    child: initialData?.child || 0,
    plan: initialData?.plan || '',
    rate: initialData?.rate || '',
    taxInclusive: initialData?.taxInclusive || 'No',
    // New Room
    newRoom: initialData?.newRoom || '',
    changeDate: initialData?.changeDate || new Date().toISOString().split('T')[0],
    changeTime: initialData?.changeTime || '',
    newPlan: initialData?.newPlan || '',
    newAdult: initialData?.newAdult || 1,
    newChild: initialData?.newChild || 0,
    newRate: initialData?.newRate || '',
    newTaxInclusive: initialData?.newTaxInclusive || 'No',
    discountPercent: initialData?.discountPercent || '',
    reason: initialData?.reason || '',
  });

  const [activeTab, setActiveTab] = useState('old_room');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="animate-in duration-200">
      <PageHeader
        title={mode === 'add' ? 'Room Change Entry' : 'Edit Room Change'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Room Change Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack onBack={onCancel}
      />

      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', padding: '0 24px 12px', marginBottom: '16px' }}>
        {[
          { key: 'old_room', label: 'Old Room Information' },
          { key: 'new_room', label: 'New Room Information' },
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
          {activeTab === 'old_room' && (
            <FormCard title="Old Room Information" className="mb-0">
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">Voucher No</label>
                  <input className="form-input bg-slate-50 cursor-not-allowed" type="text" value={form.voucherNo} disabled />
                </div>
                <div className="form-field">
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" value={form.date} onChange={set('date')} />
                </div>
                <div className="form-field">
                  <label className="form-label">GRC No</label>
                  <input className="form-input" type="text" value={form.grcNo} onChange={set('grcNo')} placeholder="GRC number" />
                </div>
                <div className="form-field">
                  <label className="form-label">Room No</label>
                  <input className="form-input" type="text" value={form.roomNo} onChange={set('roomNo')} placeholder="Current room" />
                </div>
                <div className="form-field form-span-2">
                  <label className="form-label">Guest Name</label>
                  <input className="form-input" type="text" value={form.guestName} onChange={set('guestName')} placeholder="Guest name" />
                </div>
                <div className="form-field">
                  <label className="form-label">Adult</label>
                  <input className="form-input" type="number" min="1" value={form.adult} onChange={set('adult')} />
                </div>
                <div className="form-field">
                  <label className="form-label">Child</label>
                  <input className="form-input" type="number" min="0" value={form.child} onChange={set('child')} />
                </div>
                <div className="form-field">
                  <label className="form-label">Plan</label>
                  <select className="form-select" value={form.plan} onChange={set('plan')}>
                    <option value="">Select Plan</option>
                    <option value="EP">EP (Room Only)</option>
                    <option value="CP">CP (Bed & Breakfast)</option>
                    <option value="MAP">MAP (Half Board)</option>
                    <option value="AP">AP (Full Board)</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Rate (₹)</label>
                  <input className="form-input bg-slate-50 cursor-not-allowed" type="text" value={form.rate} readOnly placeholder="Auto-filled" />
                </div>
                <div className="form-field form-span-2">
                  <label className="form-label">Tax Inclusive</label>
                  <select className="form-select" value={form.taxInclusive} onChange={set('taxInclusive')}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
              </div>
            </FormCard>
          )}

          {activeTab === 'new_room' && (
            <FormCard title="New Room Information" className="mb-0">
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">New Room <span className="text-red-500">*</span></label>
                  <input className="form-input" type="text" value={form.newRoom} onChange={set('newRoom')} placeholder="New room number" required />
                </div>
                <div className="form-field">
                  <label className="form-label">Change Date</label>
                  <input className="form-input" type="date" value={form.changeDate} onChange={set('changeDate')} />
                </div>
                <div className="form-field">
                  <label className="form-label">Change Time</label>
                  <input className="form-input" type="time" value={form.changeTime} onChange={set('changeTime')} />
                </div>
                <div className="form-field">
                  <label className="form-label">New Plan</label>
                  <select className="form-select" value={form.newPlan} onChange={set('newPlan')}>
                    <option value="">Select Plan</option>
                    <option value="EP">EP (Room Only)</option>
                    <option value="CP">CP (Bed & Breakfast)</option>
                    <option value="MAP">MAP (Half Board)</option>
                    <option value="AP">AP (Full Board)</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Adult</label>
                  <input className="form-input" type="number" min="1" value={form.newAdult} onChange={set('newAdult')} />
                </div>
                <div className="form-field">
                  <label className="form-label">Child</label>
                  <input className="form-input" type="number" min="0" value={form.newChild} onChange={set('newChild')} />
                </div>
                <div className="form-field">
                  <label className="form-label">New Rate (₹)</label>
                  <input className="form-input" type="number" min="0" step="0.01" value={form.newRate} onChange={set('newRate')} placeholder="0.00" />
                </div>
                <div className="form-field">
                  <label className="form-label">Tax Inclusive</label>
                  <select className="form-select" value={form.newTaxInclusive} onChange={set('newTaxInclusive')}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div className="form-field form-span-2">
                  <label className="form-label">Discount %</label>
                  <input className="form-input" type="number" min="0" max="100" step="0.01" value={form.discountPercent} onChange={set('discountPercent')} placeholder="0.00" />
                </div>
                <div className="form-field form-span-2">
                  <label className="form-label">Reason</label>
                  <textarea className="form-textarea" rows={1} value={form.reason} onChange={set('reason')} placeholder="Reason for room change..." />
                </div>
              </div>
            </FormCard>
          )}
        </div>

        <div className="form-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
          <button type="button" onClick={onCancel} className="btn-secondary" style={{ cursor: 'pointer' }}>
            Cancel
          </button>

          {activeTab !== 'old_room' && (
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'new_room') setActiveTab('old_room');
              }}
              className="btn-secondary"
              style={{ cursor: 'pointer' }}
            >
              Back
            </button>
          )}

          {activeTab !== 'new_room' ? (
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'old_room') setActiveTab('new_room');
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

export default RoomChangeEntryForm;
