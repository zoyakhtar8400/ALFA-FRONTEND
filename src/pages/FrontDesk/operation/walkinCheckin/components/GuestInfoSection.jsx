import F from '../../../../../components/common/F';
import SearchDropdown from '../../../../../components/common/SearchDropdown';
import { FaUser } from 'react-icons/fa';

const GuestInfoSection = ({ form, set, setForm, sectionTitle }) => {
  return (
    <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
      {sectionTitle(<FaUser />, 'Guest Information')}
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
    </div>
  );
};

export default GuestInfoSection;
