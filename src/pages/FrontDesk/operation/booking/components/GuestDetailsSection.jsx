import F from '../../../../../components/common/F';
import SearchDropdown from '../../../../../components/common/SearchDropdown';
import { FaUser } from 'react-icons/fa';

const GuestDetailsSection = ({ form, set, setForm, sectionTitle }) => {
  return (
    <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px 16px' }}>
      {sectionTitle(<FaUser />, 'Guest Details')}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px 12px' }}>
        
        {/* ── TOP HIGHLIGHT ROW: Booking No, Date, Booking Status ── */}
        <div style={{ gridColumn: 'span 4', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '4px' }}>

          {/* Booking No – Indigo */}
          <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', borderRadius: '10px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.75)' }}>Booking No</span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>{form.bookingNo}</span>
          </div>

          {/* Date – Teal */}
          <div style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', borderRadius: '10px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.75)' }}>Date</span>
            <input
              type="date"
              value={form.date}
              onChange={set('date')}
              style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', background: 'transparent', border: 'none', outline: 'none', padding: 0, width: '100%', colorScheme: 'dark' }}
            />
          </div>

          {/* Booking Status – Color-Coded Badge */}
          <div style={{
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            background: form.bookingStatus === 'Confirmed'
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
              : form.bookingStatus === 'Tentative'
              ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
              : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.75)' }}>Booking Status</span>
            <select
              value={form.bookingStatus}
              onChange={set('bookingStatus')}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                padding: 0,
                width: '100%',
                appearance: 'none',
              }}
            >
              <option value="Confirmed" style={{ background: '#059669', color: '#fff' }}>✔ Confirm</option>
              <option value="Tentative" style={{ background: '#d97706', color: '#fff' }}>⏳ Tentative</option>
              <option value="Cancelled" style={{ background: '#dc2626', color: '#fff' }}>✘ Cancel</option>
            </select>
          </div>
        </div>

        {/* Row 1: Name – full width */}
        <div className="form-field" style={{ gridColumn: 'span 4', marginBottom: '4px' }}>
          <label className="form-label">Name <span className="text-red-500">*</span></label>
          <div style={{ display: 'grid', gridTemplateColumns: '90px 1fr', gap: '6px' }}>
            <select className="form-select" value={form.prefix} onChange={set('prefix')} style={{ fontSize: '0.9rem' }}>
              <option value="Mr.">Mr.</option>
              <option value="Mrs.">Mrs.</option>
              <option value="Ms.">Ms.</option>
              <option value="Dr.">Dr.</option>
            </select>
            <input className="form-input" type="text" value={form.name} onChange={set('name')} placeholder="Enter guest name" required style={{ fontSize: '0.9rem' }} />
          </div>
        </div>

        {/* Row 2: Gender + Nationality side by side */}
        <div style={{ gridColumn: 'span 2' }}>
          <F label="Gender" value={form.gender} onChange={set('gender')}>
            <select className="form-select" value={form.gender} onChange={set('gender')} style={{ fontSize: '0.9rem' }}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </F>
        </div>
        <div style={{ gridColumn: 'span 2' }}>
          <SearchDropdown
            value={form.nationality}
            onChange={val => setForm(f => ({ ...f, nationality: val }))}
            label="Nationality"
            options={[
              { value: 'Indian', label: 'Indian' },
              { value: 'Foreign', label: 'Foreign' },
              { value: 'NRI', label: 'NRI' },
              { value: 'OCI', label: 'OCI' },
            ]}
            placeholder="Search nationality..."
          />
        </div>

        {/* Row 3: Contacts */}
        <div style={{ gridColumn: 'span 4', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px 12px' }}>
          <F label="Mobile" type="tel" placeholder="Enter mobile" required value={form.mobileNo} onChange={set('mobileNo')} />
          <F label="Email Id" type="email" placeholder="Enter email id" value={form.emailId} onChange={set('emailId')} />
          <F label="Phone" placeholder="Enter phone" value={form.phoneNo} onChange={set('phoneNo')} />
        </div>
      </div>
    </div>
  );
};

export default GuestDetailsSection;
