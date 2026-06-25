import React, { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { FaUser, FaAddressCard } from 'react-icons/fa';

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

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

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
        title={mode === 'add' ? 'Guest Profile' : 'Edit Guest Profile'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Guest Profile', mode === 'add' ? 'Add' : 'Edit']}
        showBack onBack={onCancel}
        style={{ marginBottom: '8px' }}
      />

      <form onSubmit={handleSubmit} style={{ padding: '0 8px 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px', alignItems: 'start', marginBottom: '10px' }}>
          
          {/* Left Column: Personal & Identification Info */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
            {sectionTitle(<FaUser />, 'Personal & Identification Info')}
            <div className="form-grid-2">
              <F label="GRC No" value={form.grcNo} onChange={set('grcNo')} placeholder="GRC number" />
              <F label="Age" type="number" min="1" max="120" value={form.age} onChange={set('age')} placeholder="Age in years" />
              
              <div style={{ gridColumn: 'span 2' }}>
                <F label="Name" required value={form.name} onChange={set('name')} placeholder="Guest full name" />
              </div>

              <F label="ID Proof">
                <select className="form-select" value={form.idProof} onChange={set('idProof')} style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }}>
                  <option value="">Select ID Proof</option>
                  <option value="Aadhaar Card">Aadhaar Card</option>
                  <option value="PAN Card">PAN Card</option>
                  <option value="Passport">Passport</option>
                  <option value="Driving License">Driving License</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
              </F>
              <F label="ID Proof No" value={form.idProofNo} onChange={set('idProofNo')} placeholder="ID number" />

              <div style={{ gridColumn: 'span 2' }}>
                <F label="Remark">
                  <textarea className="form-textarea" rows={2} value={form.remark} onChange={set('remark')} placeholder="Remarks..." style={{ fontSize: '0.9rem', padding: '6px 8px' }} />
                </F>
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Billing Details */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
            {sectionTitle(<FaAddressCard />, 'Contact & Billing Details')}
            <div className="form-grid-2">
              <F label="Mobile No" value={form.mobileNo} onChange={set('mobileNo')} placeholder="+91 XXXXX XXXXX" />
              <F label="Phone No" value={form.phoneNo} onChange={set('phoneNo')} placeholder="Landline number" />
              
              <div style={{ gridColumn: 'span 2' }}>
                <F label="Email" type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <F label="Address" value={form.address} onChange={set('address')} placeholder="Full address" />
              </div>

              <F label="City" value={form.city} onChange={set('city')} placeholder="City" />
              <F label="Company" value={form.company} onChange={set('company')} placeholder="Company name" />
              
              <F label="Company GSTIN" value={form.companyGstin} onChange={set('companyGstin')} placeholder="GST number" />
              <F label="OTA / Agent" value={form.otaAgent} onChange={set('otaAgent')} placeholder="OTA Commission Agent" />

              <div style={{ gridColumn: 'span 2' }}>
                <F label="Payment Mode">
                  <select className="form-select" value={form.paymentMode} onChange={set('paymentMode')} style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }}>
                    <option value="">Select Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit">Credit</option>
                  </select>
                </F>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <F label="Billing Instruction">
                  <textarea className="form-textarea" rows={1} value={form.billingInstruction} onChange={set('billingInstruction')} placeholder="Special billing instructions..." style={{ fontSize: '0.9rem', padding: '6px 8px' }} />
                </F>
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

export default GuestProfileForm;
