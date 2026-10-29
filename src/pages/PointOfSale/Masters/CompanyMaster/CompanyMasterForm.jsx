import React, { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { FaBuilding, FaAddressCard } from 'react-icons/fa';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';

const F = ({ label, type = 'text', placeholder, required, disabled, children, value, onChange, style, inputStyle, inputClassName, maxLength }) => (
  <div className="form-field" style={{ marginBottom: '6px', ...style }}>
    <label className="form-label" style={{ marginBottom: '2px', fontSize: '0.82rem', fontWeight: 600 }}>
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
        maxLength={maxLength}
        style={{ fontSize: '0.9rem', padding: '6px 10px', height: '36px', minHeight: '36px', ...inputStyle }}
      />
    )}
  </div>
);

const CompanyMasterForm = ({ mode = 'add', initialData, onSave, onCancel, existingRecords = [] }) => {
  const [form, setForm] = useState({
    companyName: initialData?.companyName || initialData?.name || '',
    gstin: initialData?.gstin || initialData?.companyGstin || '',
    phone: initialData?.phone || initialData?.phoneNo || initialData?.mobileNo || '',
    alternatePhone: initialData?.alternatePhone || '',
    email: initialData?.email || '',
    contactPerson: initialData?.contactPerson || '',
    panNo: initialData?.panNo || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    pincode: initialData?.pincode || '',
    creditLimit: initialData?.creditLimit || '',
    status: initialData?.status || initialData?.active || 'Active',
    remark: initialData?.remark || ''
  });

  const [errors, setErrors] = useState({});

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['companyName'],
    currentId: initialData?.id,
    mode
  });

  const set = (key) => (e) => {
    let val = e.target.value;
    if (key === 'gstin') {
      val = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
      // Automatically extract PAN if valid GST format (characters 3-12)
      if (val.length >= 12 && !form.panNo) {
        const derivedPan = val.substring(2, 12);
        setForm(f => ({ ...f, gstin: val, panNo: derivedPan }));
        return;
      }
    }
    if (key === 'phone' || key === 'alternatePhone') {
      val = val.replace(/\D/g, '').slice(0, 10);
    }
    setForm(f => ({ ...f, [key]: val }));
    if (errors[key]) {
      setErrors(errs => ({ ...errs, [key]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.companyName || form.companyName.trim().length < 2) {
      newErrors.companyName = 'Company Name is required (minimum 2 characters)';
    }
    if (!form.gstin || form.gstin.trim().length === 0) {
      newErrors.gstin = 'GST IN is required';
    } else if (form.gstin.trim().length !== 15) {
      newErrors.gstin = 'GST IN must be exactly 15 alphanumeric characters';
    }
    if (!form.phone || form.phone.trim().length === 0) {
      newErrors.phone = 'Phone Number is required';
    } else if (form.phone.trim().length !== 10) {
      newErrors.phone = 'Phone Number must be a valid 10-digit number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validate()) return;
    if (!checkBeforeSave()) return;
    onSave(form);
  };

  const sectionTitle = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0 6px', borderBottom: '2px solid var(--primary, #7c3aed)', marginBottom: '12px' }}>
      <span style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', color: 'var(--primary, #7c3aed)' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary, #7c3aed)' }}>{title}</span>
    </div>
  );

  return (
    <div className="animate-in duration-200" style={{ padding: '0 8px' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
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
        title={mode === 'add' ? 'Add Company Master' : 'Edit Company Master'}
        breadcrumbs={['Dashboard', 'Point Of Sale', 'Master', 'Company Master', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
        style={{ marginBottom: '12px' }}
      />

      <form onSubmit={handleSubmit} style={{ padding: '0 8px 12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '14px', alignItems: 'start', marginBottom: '14px' }}>
          
          {/* Left Column: Company & Identification Info */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '8px', padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {sectionTitle(<FaBuilding />, 'Company & Tax Identification')}
            
            <div className="form-grid-1" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>
                <F
                  label="Company Name"
                  required
                  value={form.companyName}
                  onChange={set('companyName')}
                  placeholder="Enter full company / enterprise name"
                />
                {errors.companyName && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>{errors.companyName}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <F
                    label="GST IN / GSTIN"
                    required
                    value={form.gstin}
                    onChange={set('gstin')}
                    placeholder="e.g. 27AAAAA0000A1Z5"
                    maxLength={15}
                  />
                  {errors.gstin && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>{errors.gstin}</span>}
                </div>

                <div>
                  <F
                    label="PAN Number"
                    value={form.panNo}
                    onChange={set('panNo')}
                    placeholder="e.g. AAAAA0000A"
                    maxLength={10}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <F
                  label="Contact Person"
                  value={form.contactPerson}
                  onChange={set('contactPerson')}
                  placeholder="Representative name"
                />

                <F label="Status">
                  <select
                    className="form-select"
                    value={form.status}
                    onChange={set('status')}
                    style={{ fontSize: '0.9rem', padding: '6px 10px', height: '36px' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </F>
              </div>

              <div>
                <F label="Remarks / Business Note">
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={form.remark}
                    onChange={set('remark')}
                    placeholder="Company billing notes, terms, credit agreements..."
                    style={{ fontSize: '0.9rem', padding: '8px 10px', borderRadius: '6px' }}
                  />
                </F>
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Address Details */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border, #e2e8f0)', borderRadius: '8px', padding: '14px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            {sectionTitle(<FaAddressCard />, 'Contact & Address Details')}
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <F
                    label="Phone Number"
                    required
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="10-digit primary phone"
                    maxLength={10}
                  />
                  {errors.phone && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600 }}>{errors.phone}</span>}
                </div>

                <div>
                  <F
                    label="Alternate Phone / Mobile"
                    value={form.alternatePhone}
                    onChange={set('alternatePhone')}
                    placeholder="Optional 10-digit phone"
                    maxLength={10}
                  />
                </div>
              </div>

              <div>
                <F
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="accounts@company.com"
                />
              </div>

              <div>
                <F
                  label="Office / Billing Address"
                  value={form.address}
                  onChange={set('address')}
                  placeholder="Premises, Street, Building name"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                <F
                  label="City"
                  value={form.city}
                  onChange={set('city')}
                  placeholder="City"
                />
                <F
                  label="State"
                  value={form.state}
                  onChange={set('state')}
                  placeholder="State"
                />
                <F
                  label="Pin Code"
                  value={form.pincode}
                  onChange={set('pincode')}
                  placeholder="PIN code"
                />
              </div>

              <div>
                <F
                  label="Credit Limit (₹)"
                  type="number"
                  value={form.creditLimit}
                  onChange={set('creditLimit')}
                  placeholder="Optional corporate credit ceiling"
                />
              </div>
            </div>
          </div>

        </div>

        <CommonActionButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText={mode === 'add' ? 'Save' : 'Update'}
          saveDisabled={isDuplicate}
        />
        <DuplicateModal />
      </form>
    </div>
  );
};

export default CompanyMasterForm;
export { CompanyMasterForm };
