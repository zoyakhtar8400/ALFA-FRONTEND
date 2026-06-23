import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import FormCard from '../../../../components/common/FormCard';

const PAYMENT_MODES = ['Cash', 'Card', 'UPI', 'Bank Transfer'];

const MultiRoomCheckoutForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    roomsSelected: '',
    checkoutDate: '',
    paymentMode: 'UPI',
    totalAmount: 0,
    active: 'Yes'
  });

  useEffect(() => {
    if (initialData) {
      setForm({ ...initialData });
    } else {
      setForm({
        roomsSelected: '',
        checkoutDate: new Date().toISOString().split('T')[0],
        paymentMode: 'UPI',
        totalAmount: 0,
        active: 'Yes'
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.roomsSelected.trim() || form.totalAmount <= 0) return;
    onSave(form);
  };

  return (
    <div className="animate-in duration-200">
      <PageHeader
        title={mode === 'add' ? 'New Group Checkout' : 'Edit Group Checkout'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Multi Room Checkout', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
      />

      <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>
        <FormCard title="Multi-Room Settlement Details">
          <div className="form-grid-2">
            <div className="form-field">
              <label className="form-label">
                Rooms to Checkout <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.roomsSelected}
                onChange={e => setForm(f => ({ ...f, roomsSelected: e.target.value }))}
                placeholder="e.g. Room 101, Room 102"
                required
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Checkout Date</label>
              <input
                type="date"
                value={form.checkoutDate}
                onChange={e => setForm(f => ({ ...f, checkoutDate: e.target.value }))}
                required
                className="form-input"
              />
            </div>

            <div className="form-field">
              <label className="form-label">Payment Mode</label>
              <select
                value={form.paymentMode}
                onChange={e => setForm(f => ({ ...f, paymentMode: e.target.value }))}
                className="form-select"
              >
                {PAYMENT_MODES.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label className="form-label">
                Total Collective Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={form.totalAmount}
                onChange={e => setForm(f => ({ ...f, totalAmount: parseFloat(e.target.value) || 0 }))}
                required
                className="form-input"
              />
            </div>

            <div className="form-field form-span-2">
              <label className="form-label">Active Status</label>
              <select
                value={form.active}
                onChange={e => setForm(f => ({ ...f, active: e.target.value }))}
                className="form-select"
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </FormCard>

        <div className="form-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
          <button type="button" onClick={onCancel} className="btn-secondary" style={{ cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" style={{ cursor: 'pointer' }}>
            {mode === 'add' ? 'Checkout All' : 'Update'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MultiRoomCheckoutForm;
