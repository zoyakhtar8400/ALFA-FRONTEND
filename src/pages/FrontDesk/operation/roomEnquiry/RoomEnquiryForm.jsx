import React, { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const RoomEnquiryForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    guestName: initialData?.guestName || '',
    mobile: initialData?.mobile || '',
    email: initialData?.email || '',
    roomCategory: initialData?.roomCategory || '',
    checkIn: initialData?.checkIn || '',
    checkOut: initialData?.checkOut || '',
    adults: initialData?.adults || 1,
    children: initialData?.children || 0,
    source: initialData?.source || '',
    remarks: initialData?.remarks || '',
    active: initialData?.active || 'Yes',
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="animate-in duration-200">
      <PageHeader
        title={mode === 'add' ? 'Add Room Enquiry' : 'Edit Room Enquiry'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Room Enquiry Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
      />

      <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
          {/* Left Column */}
          <FormCard title="Guest Information" className="mb-0">
            <div className="form-grid-2">
              <div className="form-field">
                <label className="form-label">Guest Name <span className="text-red-500">*</span></label>
                <input className="form-input" type="text" value={form.guestName} onChange={set('guestName')} placeholder="Guest name" required />
              </div>
              <div className="form-field">
                <label className="form-label">Mobile</label>
                <input className="form-input" type="text" value={form.mobile} onChange={set('mobile')} placeholder="+91 XXXXX XXXXX" />
              </div>
              <div className="form-field form-span-2">
                <label className="form-label">Email ID</label>
                <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" />
              </div>
              <div className="form-field form-span-2">
                <label className="form-label">Source</label>
                <select className="form-select" value={form.source} onChange={set('source')}>
                  <option value="">Select Source</option>
                  <option value="Phone">Phone</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Online">Online</option>
                  <option value="Agent">Agent</option>
                  <option value="Corporate">Corporate</option>
                </select>
              </div>
            </div>
          </FormCard>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <FormCard title="Room & Stay Details">
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">Room Category <span className="text-red-500">*</span></label>
                  <select className="form-select" value={form.roomCategory} onChange={set('roomCategory')} required>
                    <option value="">Select Category</option>
                    <option value="Standard Room">Standard Room</option>
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="Superior Room">Superior Room</option>
                    <option value="Executive Suite">Executive Suite</option>
                    <option value="Presidential Suite">Presidential Suite</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Check-In Date <span className="text-red-500">*</span></label>
                  <input className="form-input" type="date" value={form.checkIn} onChange={set('checkIn')} required />
                </div>
                <div className="form-field">
                  <label className="form-label">Check-Out Date <span className="text-red-500">*</span></label>
                  <input className="form-input" type="date" value={form.checkOut} onChange={set('checkOut')} required />
                </div>
                <div className="form-field">
                  <label className="form-label">Adults</label>
                  <input className="form-input" type="number" min="1" value={form.adults} onChange={set('adults')} />
                </div>
                <div className="form-field">
                  <label className="form-label">Children</label>
                  <input className="form-input" type="number" min="0" value={form.children} onChange={set('children')} />
                </div>
                <div className="form-field">
                  <label className="form-label">Active</label>
                  <select className="form-select" value={form.active} onChange={set('active')}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            </FormCard>

            <FormCard title="Remarks" className="mb-0">
              <div className="form-field">
                <label className="form-label">Remarks</label>
                <textarea className="form-textarea" rows={1} value={form.remarks} onChange={set('remarks')} placeholder="Enter remarks or notes..." />
              </div>
            </FormCard>
          </div>
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

export default RoomEnquiryForm;
