import React, { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const AddGuestForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    roomNo: initialData?.roomNo || '',
    grcNo: initialData?.grcNo || '',
    guestName: initialData?.guestName || '',
    checkinDate: initialData?.checkinDate || new Date().toISOString().split('T')[0],
    time: initialData?.time || '',
    gender: initialData?.gender || '',
    age: initialData?.age || '',
    address: initialData?.address || '',
    fathersName: initialData?.fathersName || '',
    city: initialData?.city || '',
    nationality: initialData?.nationality || '',
    purposeOfVisit: initialData?.purposeOfVisit || '',
    mobileNo: initialData?.mobileNo || '',
    phoneNo: initialData?.phoneNo || '',
    company: initialData?.company || '',
    idProof: initialData?.idProof || '',
    idProofNo: initialData?.idProofNo || '',
    arrivedFrom: initialData?.arrivedFrom || '',
    destination: initialData?.destination || '',
    checkoutDate: initialData?.checkoutDate || '',
    checkoutTime: initialData?.checkoutTime || '',
    temperature: initialData?.temperature || '',
    remark: initialData?.remark || '',
  });

  const [activeTab, setActiveTab] = useState('guest_details');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="animate-in duration-200">
      <PageHeader
        title={mode === 'add' ? 'Add Guest In Room' : 'Edit Guest In Room'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Add Guest In Room Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack onBack={onCancel}
      />

      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', padding: '0 24px 12px', marginBottom: '16px' }}>
        {[
          { key: 'guest_details', label: 'Guest Details' },
          { key: 'identity_details', label: 'Identity Details' },
          { key: 'stay_details', label: 'Stay Details' },
          { key: 'additional_info', label: 'Additional Info' },
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
          {activeTab === 'guest_details' && (
            <FormCard title="Guest Details" className="mb-0">
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">Guest Name <span className="text-red-500">*</span></label>
                  <input className="form-input" type="text" value={form.guestName} onChange={set('guestName')} placeholder="Full name" required />
                </div>
                <div className="form-field">
                  <label className="form-label">Father's Name</label>
                  <input className="form-input" type="text" value={form.fathersName} onChange={set('fathersName')} placeholder="Father's full name" />
                </div>
                <div className="form-field">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={form.gender} onChange={set('gender')}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Age</label>
                  <input className="form-input" type="number" min="1" max="120" value={form.age} onChange={set('age')} placeholder="Age in years" />
                </div>
                <div className="form-field">
                  <label className="form-label">Mobile No</label>
                  <input className="form-input" type="text" value={form.mobileNo} onChange={set('mobileNo')} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="form-field">
                  <label className="form-label">Phone No</label>
                  <input className="form-input" type="text" value={form.phoneNo} onChange={set('phoneNo')} placeholder="Landline number" />
                </div>
                <div className="form-field">
                  <label className="form-label">Company</label>
                  <input className="form-input" type="text" value={form.company} onChange={set('company')} placeholder="Company name" />
                </div>
                <div className="form-field">
                  <label className="form-label">Nationality</label>
                  <input className="form-input" type="text" value={form.nationality} onChange={set('nationality')} placeholder="e.g. Indian" />
                </div>
                <div className="form-field">
                  <label className="form-label">ID Proof</label>
                  <select className="form-select" value={form.idProof} onChange={set('idProof')}>
                    <option value="">Select ID Proof</option>
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">ID Proof No</label>
                  <input className="form-input" type="text" value={form.idProofNo} onChange={set('idProofNo')} placeholder="ID number" />
                </div>
              </div>
            </FormCard>
          )}

          {activeTab === 'identity_details' && (
            <FormCard title="Identity & Booking Details" className="mb-0">
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">GRC No</label>
                  <input className="form-input" type="text" value={form.grcNo} onChange={set('grcNo')} placeholder="GRC number" />
                </div>
                <div className="form-field">
                  <label className="form-label">Checkin Date</label>
                  <input className="form-input" type="date" value={form.checkinDate} onChange={set('checkinDate')} />
                </div>
                <div className="form-field">
                  <label className="form-label">Time</label>
                  <input className="form-input" type="time" value={form.time} onChange={set('time')} />
                </div>
                <div className="form-field">
                  <label className="form-label">Checkout Date</label>
                  <input className="form-input" type="date" value={form.checkoutDate} onChange={set('checkoutDate')} />
                </div>
                <div className="form-field">
                  <label className="form-label">Checkout Time</label>
                  <input className="form-input" type="time" value={form.checkoutTime} onChange={set('checkoutTime')} />
                </div>
              </div>
            </FormCard>
          )}

          {activeTab === 'stay_details' && (
            <FormCard title="Stay Details" className="mb-0">
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">Room No <span className="text-red-500">*</span></label>
                  <input className="form-input" type="text" value={form.roomNo} onChange={set('roomNo')} placeholder="Room number" required />
                </div>
                <div className="form-field">
                  <label className="form-label">Arrived From</label>
                  <input className="form-input" type="text" value={form.arrivedFrom} onChange={set('arrivedFrom')} placeholder="City/Country of origin" />
                </div>
                <div className="form-field">
                  <label className="form-label">Destination</label>
                  <input className="form-input" type="text" value={form.destination} onChange={set('destination')} placeholder="Next destination" />
                </div>
                <div className="form-field">
                  <label className="form-label">Temperature (°C)</label>
                  <input className="form-input" type="number" step="0.1" value={form.temperature} onChange={set('temperature')} placeholder="e.g. 98.6" />
                </div>
              </div>
            </FormCard>
          )}

          {activeTab === 'additional_info' && (
            <FormCard title="Additional Info & Address" className="mb-0">
              <div className="form-grid-2">
                <div className="form-field form-span-2">
                  <label className="form-label">Address</label>
                  <input className="form-input" type="text" value={form.address} onChange={set('address')} placeholder="Full address" />
                </div>
                <div className="form-field">
                  <label className="form-label">City</label>
                  <input className="form-input" type="text" value={form.city} onChange={set('city')} placeholder="City" />
                </div>
                <div className="form-field">
                  <label className="form-label">Purpose of Visit</label>
                  <select className="form-select" value={form.purposeOfVisit} onChange={set('purposeOfVisit')}>
                    <option value="">Select Purpose</option>
                    <option value="Business">Business</option>
                    <option value="Leisure">Leisure</option>
                    <option value="Medical">Medical</option>
                    <option value="Transit">Transit</option>
                    <option value="Education">Education</option>
                  </select>
                </div>
                <div className="form-field form-span-2">
                  <label className="form-label">Remark</label>
                  <textarea className="form-textarea" rows={2} value={form.remark} onChange={set('remark')} placeholder="Additional remarks..." />
                </div>
              </div>
            </FormCard>
          )}
        </div>

        <div className="form-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
          <button type="button" onClick={onCancel} className="btn-secondary" style={{ cursor: 'pointer' }}>
            Cancel
          </button>

          {activeTab !== 'guest_details' && (
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'additional_info') setActiveTab('stay_details');
                else if (activeTab === 'stay_details') setActiveTab('identity_details');
                else if (activeTab === 'identity_details') setActiveTab('guest_details');
              }}
              className="btn-secondary"
              style={{ cursor: 'pointer' }}
            >
              Back
            </button>
          )}

          {activeTab !== 'additional_info' ? (
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'guest_details') setActiveTab('identity_details');
                else if (activeTab === 'identity_details') setActiveTab('stay_details');
                else if (activeTab === 'stay_details') setActiveTab('additional_info');
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

export default AddGuestForm;
