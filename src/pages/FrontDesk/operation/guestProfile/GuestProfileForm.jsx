import React, { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';

const GuestProfileForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    grcNo: initialData?.grcNo || '',
    name: initialData?.name || '',
    age: initialData?.age || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    mobileNo: initialData?.mobileNo || '',
    phoneNo: initialData?.phoneNo || '',
    company: initialData?.company || '',
    companyGstin: initialData?.companyGstin || '',
    idProof: initialData?.idProof || '',
    idProofNo: initialData?.idProofNo || '',
    email: initialData?.email || '',
    paymentMode: initialData?.paymentMode || '',
    remark: initialData?.remark || '',
    otaAgent: initialData?.otaAgent || '',
    billingInstruction: initialData?.billingInstruction || '',
  });

  const [activeTab, setActiveTab] = useState('personal');

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="animate-in duration-200">
      <PageHeader
        title={mode === 'add' ? 'Guest Profile' : 'Edit Guest Profile'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Guest Profile', mode === 'add' ? 'Add' : 'Edit']}
        showBack onBack={onCancel}
      />

      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', padding: '0 24px 12px', marginBottom: '16px' }}>
        {[
          { key: 'personal', label: 'Personal Info' },
          { key: 'contact', label: 'Contact Info' },
          { key: 'company', label: 'Company Info' },
          { key: 'billing', label: 'Billing Info' },
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
        <div style={{ minHeight: '300px' }}>
          {activeTab === 'personal' && (
            <FormCard title="Personal Information" className="mb-0">
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">GRC No</label>
                  <input className="form-input" type="text" value={form.grcNo} onChange={set('grcNo')} placeholder="GRC number" />
                </div>
                <div className="form-field">
                  <label className="form-label">Name <span className="text-red-500">*</span></label>
                  <input className="form-input" type="text" value={form.name} onChange={set('name')} placeholder="Guest full name" required />
                </div>
                <div className="form-field">
                  <label className="form-label">Age</label>
                  <input className="form-input" type="number" min="1" max="120" value={form.age} onChange={set('age')} placeholder="Age in years" />
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
                <div className="form-field form-span-2">
                  <label className="form-label">ID Proof No</label>
                  <input className="form-input" type="text" value={form.idProofNo} onChange={set('idProofNo')} placeholder="ID number" />
                </div>
              </div>
            </FormCard>
          )}

          {activeTab === 'contact' && (
            <FormCard title="Contact Information" className="mb-0">
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">Mobile No</label>
                  <input className="form-input" type="text" value={form.mobileNo} onChange={set('mobileNo')} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="form-field">
                  <label className="form-label">Phone No</label>
                  <input className="form-input" type="text" value={form.phoneNo} onChange={set('phoneNo')} placeholder="Landline number" />
                </div>
                <div className="form-field form-span-2">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" />
                </div>
                <div className="form-field form-span-2">
                  <label className="form-label">Address</label>
                  <input className="form-input" type="text" value={form.address} onChange={set('address')} placeholder="Full address" />
                </div>
                <div className="form-field">
                  <label className="form-label">City</label>
                  <input className="form-input" type="text" value={form.city} onChange={set('city')} placeholder="City" />
                </div>
              </div>
            </FormCard>
          )}

          {activeTab === 'company' && (
            <FormCard title="Company Information" className="mb-0">
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">Company</label>
                  <input className="form-input" type="text" value={form.company} onChange={set('company')} placeholder="Company name" />
                </div>
                <div className="form-field">
                  <label className="form-label">Company GSTIN</label>
                  <input className="form-input" type="text" value={form.companyGstin} onChange={set('companyGstin')} placeholder="GST number" />
                </div>
                <div className="form-field form-span-2">
                  <label className="form-label">OTA / Travel / Commission Agent</label>
                  <input className="form-input" type="text" value={form.otaAgent} onChange={set('otaAgent')} placeholder="Agent name" />
                </div>
              </div>
            </FormCard>
          )}

          {activeTab === 'billing' && (
            <FormCard title="Billing Information" className="mb-0">
              <div className="form-grid-2">
                <div className="form-field form-span-2">
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
                <div className="form-field form-span-2">
                  <label className="form-label">Billing Instruction</label>
                  <textarea className="form-textarea" rows={2} value={form.billingInstruction} onChange={set('billingInstruction')} placeholder="Special billing instructions..." />
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

          {activeTab !== 'personal' && (
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'billing') setActiveTab('company');
                else if (activeTab === 'company') setActiveTab('contact');
                else if (activeTab === 'contact') setActiveTab('personal');
              }}
              className="btn-secondary"
              style={{ cursor: 'pointer' }}
            >
              Back
            </button>
          )}

          {activeTab !== 'billing' ? (
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'personal') setActiveTab('contact');
                else if (activeTab === 'contact') setActiveTab('company');
                else if (activeTab === 'company') setActiveTab('billing');
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

export default GuestProfileForm;
