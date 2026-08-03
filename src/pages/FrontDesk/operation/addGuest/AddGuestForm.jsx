import React, { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { FaUser, FaBed, FaQrcode } from 'react-icons/fa';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';
import AadhaarScannerModal from '../../../../components/aadhaar/AadhaarScannerModal';
import { useHardwareScanner } from '../../../../hooks/useHardwareScanner';

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

const AddGuestForm = ({ mode, initialData, onSave, onCancel, existingRecords = [] }) => {
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

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [guestPhoto, setGuestPhoto] = useState(null);

  const handleAadhaarScanned = (scannedData) => {
    setForm(f => ({
      ...f,
      guestName: scannedData.name || f.guestName,
      gender: scannedData.gender || f.gender,
      age: scannedData.age || f.age,
      address: scannedData.fullAddress || (scannedData.address ? `${scannedData.address.house || ''} ${scannedData.address.street || ''}`.trim() : '') || f.address,
      city: scannedData.address?.vtc || scannedData.address?.district || f.city,
      idProof: 'Aadhaar Card',
      idProofNo: scannedData.last4 || scannedData.referenceId || f.idProofNo
    }));

    if (scannedData.photoDataUrl) {
      setGuestPhoto(scannedData.photoDataUrl);
    }
  };

  // Hands-free USB 2D Barcode Scanner listener
  useHardwareScanner(handleAadhaarScanned);

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['idProofNo'],
    currentId: initialData?.id,
    mode
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkBeforeSave()) return;
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
        title={mode === 'add' ? 'Add Guest In Room' : 'Edit Guest In Room'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Add Guest In Room Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack onBack={onCancel}
        style={{ marginBottom: '8px' }}
      />

      <form onSubmit={handleSubmit} style={{ padding: '0 8px 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '10px', alignItems: 'start', marginBottom: '10px' }}>
          
          {/* Left Column: Room & Stay Information */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
            {sectionTitle(<FaBed />, 'Room & Stay Information')}
            <div className="form-grid-2">
              <F label="Room No" required value={form.roomNo} onChange={set('roomNo')} placeholder="Room number" />
              <F label="GRC No" value={form.grcNo} onChange={set('grcNo')} placeholder="GRC number" />
              
              <F label="Checkin Date" type="date" value={form.checkinDate} onChange={set('checkinDate')} />
              <F label="Checkin Time" type="time" value={form.time} onChange={set('time')} />
              
              <F label="Checkout Date" type="date" value={form.checkoutDate} onChange={set('checkoutDate')} />
              <F label="Checkout Time" type="time" value={form.checkoutTime} onChange={set('checkoutTime')} />
              
              <F label="Arrived From" value={form.arrivedFrom} onChange={set('arrivedFrom')} placeholder="Origin city" />
              <F label="Destination" value={form.destination} onChange={set('destination')} placeholder="Next city" />
              
              <F label="Purpose of Visit">
                <select className="form-select" value={form.purposeOfVisit} onChange={set('purposeOfVisit')} style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }}>
                  <option value="">Select Purpose</option>
                  <option value="Business">Business</option>
                  <option value="Leisure">Leisure</option>
                  <option value="Medical">Medical</option>
                  <option value="Transit">Transit</option>
                  <option value="Education">Education</option>
                </select>
              </F>
              <F label="Temperature (°C)" type="number" step="0.1" value={form.temperature} onChange={set('temperature')} placeholder="e.g. 36.8" />
              
              <div style={{ gridColumn: 'span 2' }}>
                <F label="Remarks">
                  <textarea className="form-textarea" rows={1} value={form.remark} onChange={set('remark')} placeholder="Additional remarks..." style={{ fontSize: '0.9rem', padding: '6px 8px' }} />
                </F>
              </div>
            </div>
          </div>

          {/* Right Column: Guest Information */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ flex: 1 }}>
                {sectionTitle(<FaUser />, 'Guest Information')}
              </div>
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '6px',
                  background: '#0e7490', color: '#ffffff',
                  fontSize: '0.8rem', fontWeight: 800, border: 'none',
                  cursor: 'pointer', transition: 'all 0.15s',
                  boxShadow: '0 2px 4px rgba(14,116,144,0.2)'
                }}
              >
                <FaQrcode size={14} /> Scan Aadhaar QR
              </button>
            </div>

            {guestPhoto && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px',
                background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: '8px', marginBottom: '10px'
              }}>
                <img
                  src={guestPhoto}
                  alt="Aadhaar Guest Biometric Photo"
                  style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #0e7490' }}
                />
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0e7490', display: 'block' }}>
                    ✓ Aadhaar Biometric Photo Extracted
                  </span>
                  <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                    Identity verification completed via offline WASM engine
                  </span>
                </div>
              </div>
            )}

            <div className="form-grid-2">
              <div style={{ gridColumn: 'span 2' }}>
                <F label="Guest Name" required value={form.guestName} onChange={set('guestName')} placeholder="Full name" />
              </div>
              
              <div style={{ gridColumn: 'span 2' }}>
                <F label="Father's Name" value={form.fathersName} onChange={set('fathersName')} placeholder="Father's name" />
              </div>
              
              <F label="Gender">
                <select className="form-select" value={form.gender} onChange={set('gender')} style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </F>
              <F label="Age" type="number" min="1" max="120" value={form.age} onChange={set('age')} placeholder="Age in years" />
              
              <F label="Mobile No" value={form.mobileNo} onChange={set('mobileNo')} placeholder="+91 XXXXX XXXXX" />
              <F label="Phone No" value={form.phoneNo} onChange={set('phoneNo')} placeholder="Landline number" />
              
              <F label="Company" value={form.company} onChange={set('company')} placeholder="Company name" />
              <F label="Nationality" value={form.nationality} onChange={set('nationality')} placeholder="e.g. Indian" />
              
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
                <F label="Address" value={form.address} onChange={set('address')} placeholder="Full address" />
              </div>
              
              <div style={{ gridColumn: 'span 2' }}>
                <F label="City" value={form.city} onChange={set('city')} placeholder="City" />
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

      {/* Aadhaar Scanner Modal */}
      <AadhaarScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleAadhaarScanned}
      />
    </div>
  );
};

export default AddGuestForm;
