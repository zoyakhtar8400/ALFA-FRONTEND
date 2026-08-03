import { useState } from 'react';
import F from '../../../../../components/common/F';
import SearchDropdown from '../../../../../components/common/SearchDropdown';
import { FaUser, FaQrcode } from 'react-icons/fa';
import AadhaarScannerModal from '../../../../../components/aadhaar/AadhaarScannerModal';
import { useHardwareScanner } from '../../../../../hooks/useHardwareScanner';

const GuestInfoSection = ({ form, set, setForm, sectionTitle }) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [guestPhoto, setGuestPhoto] = useState(null);

  const handleAadhaarScanned = (scannedData) => {
    setForm(f => ({
      ...f,
      name: scannedData.name || f.name,
      prefix: scannedData.gender === 'Female' ? 'Mrs.' : 'Mr.',
      address: scannedData.fullAddress || (scannedData.address ? `${scannedData.address.house || ''} ${scannedData.address.street || ''}`.trim() : '') || f.address,
      city: scannedData.address?.vtc || scannedData.address?.district || f.city,
      state: scannedData.address?.state || f.state,
      idProof: 'Aadhaar Card',
      idProofNo: scannedData.last4 || scannedData.referenceId || f.idProofNo
    }));

    if (scannedData.photoDataUrl) {
      setGuestPhoto(scannedData.photoDataUrl);
    }
  };

  useHardwareScanner(handleAadhaarScanned);

  return (
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
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0e7490', display: 'block' }}>
              ✓ Aadhaar Biometric Photo Extracted
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              Identity verification completed via offline WASM engine
            </span>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px 8px', alignItems: 'start' }}>

        {/* Row 1: Name (full width) */}
        <div style={{ gridColumn: 'span 3' }}>
          <div className="form-field" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ marginBottom: '2px' }}>Name <span className="text-red-500">*</span></label>
            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '4px' }}>
              <select className="form-select" value={form.prefix} onChange={set('prefix')} style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}>
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
                <option value="Dr.">Dr.</option>
              </select>
              <input className="form-input" type="text" value={form.name} onChange={set('name')} placeholder="Enter guest name" required style={{ fontSize: '0.9rem', height: '34px' }} />
            </div>
          </div>
        </div>

        {/* Row 2: Mobile | Email | Phone */}
        <F label="Mobile No" placeholder="+91 XXXXX XXXXX" required value={form.mobileNo} onChange={set('mobileNo')} />
        <F label="Email Id" type="email" placeholder="email@example.com" value={form.emailId} onChange={set('emailId')} />
        <F label="Phone No" placeholder="Landline" value={form.phoneNo} onChange={set('phoneNo')} />

        {/* Row 3: Address (2 cols) | Nationality (1 col) */}
        <div style={{ gridColumn: 'span 2', marginBottom: 0 }}>
          <F label="Address" placeholder="Full address" required value={form.address} onChange={set('address')} />
        </div>
        <SearchDropdown
          label="Nationality"
          value={form.nationality}
          onChange={val => setForm(f => ({ ...f, nationality: val }))}
          options={[
            { value: 'Indian', label: 'Indian' },
            { value: 'Foreign', label: 'Foreign' },
            { value: 'NRI', label: 'NRI' },
            { value: 'OCI', label: 'OCI' },
          ]}
          placeholder="Search nationality..."
        />

        {/* Row 4: City + State — equal width, full row */}
        <div style={{ gridColumn: 'span 3', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <SearchDropdown
            label="City"
            required
            addBtn
            value={form.city}
            onChange={val => setForm(f => ({ ...f, city: val }))}
            options={[
              { value: 'Delhi', label: 'Delhi' },
              { value: 'Mumbai', label: 'Mumbai' },
              { value: 'Bangalore', label: 'Bangalore' },
              { value: 'Chennai', label: 'Chennai' },
              { value: 'Hyderabad', label: 'Hyderabad' },
              { value: 'Pune', label: 'Pune' },
              { value: 'Kolkata', label: 'Kolkata' },
              { value: 'Ahmedabad', label: 'Ahmedabad' },
              { value: 'Jaipur', label: 'Jaipur' },
              { value: 'Surat', label: 'Surat' },
            ]}
            placeholder="Search city..."
          />
          <F label="State" placeholder="State" value={form.state} onChange={set('state')} />
        </div>

        {/* Row 5: Id Proof + Id Proof No — equal width, full row */}
        <div style={{ gridColumn: 'span 3', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <F label="Id Proof" required>
            <select className="form-select" value={form.idProof} onChange={set('idProof')} style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }} required>
              <option value="">Select ID Proof</option>
              <option value="Aadhaar Card">Aadhaar Card</option>
              <option value="PAN Card">PAN Card</option>
              <option value="Passport">Passport</option>
              <option value="Driving License">Driving License</option>
              <option value="Voter ID">Voter ID</option>
            </select>
          </F>
          <F label="Id Proof No" placeholder="ID number" value={form.idProofNo} onChange={set('idProofNo')} />
        </div>

      </div>

      <AadhaarScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleAadhaarScanned}
      />
    </div>
  );
};

export default GuestInfoSection;
