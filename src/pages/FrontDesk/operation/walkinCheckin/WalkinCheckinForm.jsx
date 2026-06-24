import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import CommonModal from '../../../../components/common/CommonModal';
import Booking from '../booking/Booking';
import RoomEnquiry from '../roomEnquiry/RoomEnquiry';
import { 
  FaUser, 
  FaPlus, 
  FaTrash, 
  FaClock, 
  FaTag, 
  FaBed 
} from 'react-icons/fa';

/* ── Field wrapper — defined OUTSIDE parent to prevent remount on every keystroke ── */
const F = ({ label, name, type = 'text', placeholder, required, disabled, children, value, onChange }) => (
  <div className="form-field" style={{ marginBottom: '4px' }}>
    <label className="form-label" style={{ marginBottom: '2px' }}>
      {label}{required && <span className="text-red-500"> *</span>}
    </label>
    {children || (
      <input
        className={`form-input${disabled ? ' bg-slate-50 cursor-not-allowed' : ''}`}
        type={type}
        value={value ?? ''}
        onChange={disabled ? undefined : onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px', minHeight: '34px' }}
      />
    )}
  </div>
);

/* ── Searchable Dropdown — defined OUTSIDE parent to prevent remount on every keystroke ── */
const SearchDropdown = ({ label, value, onChange, options, placeholder = 'Search...', required, addBtn }) => {
  const [query, setQuery] = React.useState('');
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div className="form-field" style={{ marginBottom: '4px', position: 'relative' }} ref={ref}>
      <label className="form-label" style={{ marginBottom: '2px' }}>{label}{required && <span className="text-red-500"> *</span>}</label>
      <div style={{ display: 'grid', gridTemplateColumns: addBtn ? '1fr auto' : '1fr', gap: '4px' }}>
        <div
          style={{ position: 'relative', cursor: 'pointer' }}
          onClick={() => setOpen(o => !o)}
        >
          {open ? (
            <input
              autoFocus
              className="form-input"
              style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px', minHeight: '34px', paddingRight: '28px' }}
              placeholder={placeholder}
              value={query}
              onChange={e => { setQuery(e.target.value); }}
              onClick={e => e.stopPropagation()}
            />
          ) : (
            <div
              className="form-select"
              style={{ fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 8px', height: '34px', minHeight: '34px', userSelect: 'none' }}
            >
              <span style={{ color: selected ? 'inherit' : '#9ca3af' }}>
                {selected ? selected.label : `Select ${label}`}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--primary)', marginLeft: '4px' }}>▼</span>
            </div>
          )}

          {open && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
              background: 'var(--card-bg, #fff)', border: '1px solid var(--primary)',
              borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              maxHeight: '180px', overflowY: 'auto', marginTop: '2px',
            }}>
              {filtered.length === 0 ? (
                <div style={{ padding: '6px 10px', color: '#9ca3af', fontSize: '0.85rem' }}>No results</div>
              ) : filtered.map(o => (
                <div
                  key={o.value}
                  onMouseDown={e => { e.preventDefault(); onChange(o.value); setQuery(''); setOpen(false); }}
                  style={{
                    padding: '6px 10px', fontSize: '0.88rem', cursor: 'pointer',
                    background: value === o.value ? 'var(--primary-light)' : 'transparent',
                    color: value === o.value ? 'var(--primary)' : 'inherit',
                    fontWeight: value === o.value ? 700 : 400,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = value === o.value ? 'var(--primary-light)' : 'transparent'}
                >
                  {o.label}
                </div>
              ))}
            </div>
          )}
        </div>
        {addBtn && (
          <button type="button" className="btn-secondary" style={{ padding: '0 10px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={`Add ${label}`}>
            <FaPlus size={10} />
          </button>
        )}
      </div>
    </div>
  );
};

const WalkinCheckinForm = ({ mode, initialData, onSave, onCancel, showToast }) => {
  const [form, setForm] = useState({
    grcNo: initialData?.grcNo || `GRC-${Math.floor(1000 + Math.random() * 9000)}`,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    checkinDate: initialData?.checkinDate || new Date().toISOString().split('T')[0],
    days: initialData?.days || 1,
    time: initialData?.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    expectedCheckoutDate: initialData?.expectedCheckoutDate || '',
    expectedCheckoutTime: initialData?.expectedCheckoutTime || '12:00 PM',
    prefix: initialData?.prefix || 'Mr.',
    name: initialData?.name || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    nationality: initialData?.nationality || 'Indian',
    mobileNo: initialData?.mobileNo || '',
    purposeOfVisit: initialData?.purposeOfVisit || '',
    company: initialData?.company || '',
    companyGstin: initialData?.companyGstin || '',
    idProof: initialData?.idProof || '',
    idProofNo: initialData?.idProofNo || '',
    emailId: initialData?.emailId || '',
    phoneNo: initialData?.phoneNo || '',
    remark: initialData?.remark || '',
    paymentMode: initialData?.paymentMode || 'CASH',
    marketSegment: initialData?.marketSegment || 'SELF',
    bookingRefNo: initialData?.bookingRefNo || '',
    businessSource: initialData?.businessSource || 'SELF',
    managementBlock: initialData?.managementBlock || 'No',
    arrivedFrom: initialData?.arrivedFrom || '',
    destination: initialData?.destination || '',
    discount: initialData?.discount || '0',
  });

  const [rooms, setRooms] = useState(initialData?.rooms || [
    { roomNo: '', plan: '', adults: 1, children: 0, rate: '', taxInclusive: 'Yes', leader: 'Yes' }
  ]);

  // Modal display states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);

  // Auto calculate expected checkout date if checkinDate or days changes
  useEffect(() => {
    const checkin = new Date(form.checkinDate);
    const daysNum = parseInt(form.days) || 1;
    if (!isNaN(checkin)) {
      const checkout = new Date(checkin.getTime() + daysNum * 24 * 60 * 60 * 1000);
      setForm(prev => ({
        ...prev,
        expectedCheckoutDate: checkout.toISOString().split('T')[0]
      }));
    }
  }, [form.checkinDate, form.days]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  
  const setRoom = (idx, key, val) => {
    setRooms(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r));
  };

  const addRoom = () => setRooms(prev => [
    ...prev, 
    { roomNo: '', plan: '', adults: 1, children: 0, rate: '', taxInclusive: 'No', leader: 'No' }
  ]);

  const removeRoom = idx => setRooms(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = e => { 
    if (e) e.preventDefault(); 
    onSave({ ...form, rooms }); 
  };

  const sectionTitle = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0 4px', borderBottom: '2px solid var(--primary)', marginBottom: '8px' }}>
      <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary)' }}>{title}</span>
    </div>
  );




  return (
    <div className="animate-in duration-200" style={{ padding: '0 8px' }}>
      
      {/* Hide ALL scrollbars globally for a premium desktop app feel */}
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
        title={mode === 'add' ? 'Walkin Checkin Entry' : 'Edit Walkin Checkin'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Walkin Checkin Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack 
        onBack={onCancel} 
        style={{ marginBottom: '4px', paddingBottom: '2px' }}
      />

      {/* Top Control Bar: Left | Center (key fields) | Right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px 8px', marginBottom: '8px', gap: '6px', borderBottom: '1px solid var(--border)' }}>
        {/* Left: Navigation Buttons to List Modals */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setShowBookingModal(true)}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 700 }}
          >
            Booking List
          </button>
          <button
            type="button"
            onClick={() => setShowEnquiryModal(true)}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 700 }}
          >
            Room Enquiry List
          </button>
        </div>

        {/* Center: Key Entry Fields — Vibrant Highlighted */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch', flex: '0 1 auto' }}>
          {/* GRC No */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '3px',
            background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)',
            borderRadius: '8px', padding: '6px 12px',
            boxShadow: '0 4px 12px rgba(109, 40, 217, 0.35)',
            minWidth: '110px'
          }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>GRC No</label>
            <input
              type="text"
              value={form.grcNo}
              disabled
              style={{
                fontSize: '0.92rem', fontWeight: 700, background: 'transparent', border: 'none', outline: 'none',
                color: '#fff', padding: '0', height: 'auto', cursor: 'not-allowed', width: '100%'
              }}
            />
          </div>

          {/* Date */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '3px',
            background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
            borderRadius: '8px', padding: '6px 12px',
            boxShadow: '0 4px 12px rgba(8, 145, 178, 0.35)',
            minWidth: '150px'
          }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date <span style={{ color: '#fde68a' }}>*</span></label>
            <input
              type="date"
              value={form.date}
              onChange={set('date')}
              required
              style={{
                fontSize: '0.85rem', fontWeight: 600,
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: '5px',
                color: '#fff',
                padding: '3px 8px',
                height: '30px',
                width: '100%',
                colorScheme: 'dark',
                outline: 'none',
              }}
            />
          </div>

          {/* CheckIn Date */}
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '3px',
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            borderRadius: '8px', padding: '6px 12px',
            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
            minWidth: '165px'
          }}>
            <label style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>CheckIn Date <span style={{ color: '#fde68a' }}>*</span></label>
            <input
              type="date"
              value={form.checkinDate}
              onChange={set('checkinDate')}
              required
              style={{
                fontSize: '0.85rem', fontWeight: 600,
                background: 'rgba(255,255,255,0.18)',
                border: '1px solid rgba(255,255,255,0.35)',
                borderRadius: '5px',
                color: '#fff',
                padding: '3px 8px',
                height: '30px',
                width: '100%',
                colorScheme: 'dark',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Right: Walkin Actions Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => showToast && showToast("Blank GRC clicked (Dummy Action)")}
            style={{
              padding: '8px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', border: 'none',
              background: 'linear-gradient(135deg, #6b7280, #4b5563)', color: '#fff', boxShadow: '0 2px 6px rgba(107, 114, 128, 0.15)', transition: 'all 0.2s'
            }}
          >
            Blank GRC
          </button>
          <button
            type="button"
            onClick={() => showToast && showToast("Vehicle Details clicked (Dummy Action)")}
            style={{
              padding: '8px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', boxShadow: '0 2px 6px rgba(59, 130, 246, 0.15)', transition: 'all 0.2s'
            }}
          >
            Vehicle Details
          </button>
          <button
            type="button"
            onClick={() => showToast && showToast("Add Guest clicked (Dummy Action)")}
            style={{
              padding: '8px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', boxShadow: '0 2px 6px rgba(16, 185, 129, 0.15)', transition: 'all 0.2s'
            }}
          >
            Add Guest
          </button>
          <button
            type="button"
            onClick={() => showToast && showToast("Photo / ID Upload clicked (Dummy Action)")}
            style={{
              padding: '8px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', border: 'none',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', boxShadow: '0 2px 6px rgba(245, 158, 11, 0.15)', transition: 'all 0.2s'
            }}
          >
            Photo / ID Upload
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '0 8px 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'start', marginBottom: '10px' }}>
          
          {/* LEFT COLUMN: Stay & GRC + Guest Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* 1. Stay & GRC Information */}
            <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
              {sectionTitle(<FaClock />, 'Stay & GRC Information')}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px 8px' }}>
                <F label="Days" type="number" required value={form.days} onChange={set('days')} />
                <F label="Time" type="text" placeholder="12:00 PM" required value={form.time} onChange={set('time')} />
                <F label="Exp.ChkOut Date" type="date" required value={form.expectedCheckoutDate} onChange={set('expectedCheckoutDate')} />
                <div style={{ gridColumn: 'span 3' }}>
                  <F label="Exp. Checkout Time" type="text" placeholder="12:00 PM" required value={form.expectedCheckoutTime} onChange={set('expectedCheckoutTime')} />
                </div>
              </div>
            </div>

            {/* 2. Guest Information */}
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

          </div>

          {/* RIGHT COLUMN: Marketing & Reference */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
            {sectionTitle(<FaTag />, 'Marketing & Reference Information')}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px 8px', alignItems: 'start' }}>

              {/* Row 1: Purpose | Company */}
              <div style={{ gridColumn: 'span 3', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <F label="Purpose of Visit">
                  <select className="form-select" value={form.purposeOfVisit} onChange={set('purposeOfVisit')} style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}>
                    <option value="">Select Purpose</option>
                    <option value="Business">Business</option>
                    <option value="Leisure">Leisure</option>
                    <option value="Medical">Medical</option>
                    <option value="Transit">Transit</option>
                    <option value="Education">Education</option>
                  </select>
                </F>
                <SearchDropdown
                  label="Company"
                  value={form.company}
                  onChange={val => setForm(f => ({ ...f, company: val }))}
                  options={[
                    { value: 'Alfa Corp', label: 'Alfa Corp' },
                    { value: 'Google', label: 'Google' },
                    { value: 'Microsoft', label: 'Microsoft' },
                    { value: 'Infosys', label: 'Infosys' },
                    { value: 'TCS', label: 'TCS' },
                    { value: 'Wipro', label: 'Wipro' },
                    { value: 'Reliance', label: 'Reliance' },
                  ]}
                  placeholder="Search company..."
                />
              </div>

              {/* Row 2: Company GSTIN */}
              <div style={{ gridColumn: 'span 3' }}>
                <F label="Company GSTIN" placeholder="GST number" value={form.companyGstin} onChange={set('companyGstin')} />
              </div>

              {/* Row 3: Market Seg | Bus. Src | Bkg Ref No */}
              <F label="Market Seg" required>
                <select className="form-select" value={form.marketSegment} onChange={set('marketSegment')} style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }} required>
                  <option value="SELF">SELF</option>
                  <option value="Corporate">Corporate</option>
                  <option value="FIT">FIT</option>
                  <option value="Group">Group</option>
                  <option value="Government">Government</option>
                  <option value="Leisure">Leisure</option>
                </select>
              </F>
              <F label="Bus. Src" required>
                <select className="form-select" value={form.businessSource} onChange={set('businessSource')} style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }} required>
                  <option value="SELF">SELF</option>
                  <option value="Direct">Direct</option>
                  <option value="OTA">OTA</option>
                  <option value="Travel Agent">Travel Agent</option>
                  <option value="Walk-in">Walk-in</option>
                </select>
              </F>
              <F label="Bkg Ref No" placeholder="Booking Ref No" value={form.bookingRefNo} onChange={set('bookingRefNo')} />

              {/* Row 4: Mgmt Blk | Arrived From | Destination */}
              <F label="Mgmt Blk">
                <select className="form-select" value={form.managementBlock} onChange={set('managementBlock')} style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </F>
              <F label="Arrived From" placeholder="Arrived from" value={form.arrivedFrom} onChange={set('arrivedFrom')} />
              <F label="Destination" placeholder="Destination" required value={form.destination} onChange={set('destination')} />

              {/* Row 5: Discount | Payment Mode | Remark */}
              <F label="Discount" type="number" placeholder="0" value={form.discount} onChange={set('discount')} />
              <F label="Payment Mode" required>
                <select className="form-select" value={form.paymentMode} onChange={set('paymentMode')} style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }} required>
                  <option value="CASH">CASH</option>
                  <option value="CARD">CARD</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK TRANSFER">BANK TRANSFER</option>
                  <option value="CREDIT">CREDIT</option>
                </select>
              </F>
              <F label="Remark" placeholder="Remarks..." value={form.remark} onChange={set('remark')} />

            </div>
          </div>

        </div>

        {/* FULL WIDTH BELOW: Room Allocation Table */}
        <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px', marginBottom: '10px' }}>
          {sectionTitle(<FaBed />, 'Room Information')}
          
          <div style={{ overflowX: 'auto', width: '100%', marginBottom: '8px', border: '1px solid var(--border)', borderRadius: '6px' }}>
            <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: 'var(--primary-light)', borderBottom: '1.5px solid var(--border)' }}>
                  {['Remove', 'S No.', 'Room No', 'Plan / Package', 'No. of Adults', 'No. of Childs', 'Rate', 'Tax Inc.', 'Leader'].map((h, idx) => (
                    <th key={h} style={{ 
                      padding: '8px 6px', 
                      textAlign: idx === 0 ? 'center' : 'left', 
                      fontWeight: 700, 
                      color: 'var(--primary)', 
                      fontSize: '0.72rem', 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.02em', 
                      whiteSpace: 'nowrap' 
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rooms.map((row, idx) => (
                  <tr key={idx} style={{ 
                    borderBottom: '1px solid var(--border)',
                    background: idx % 2 === 0 ? 'transparent' : 'rgba(0, 0, 0, 0.015)'
                  }}>
                    {/* Remove Action */}
                    <td style={{ padding: '4px', textAlign: 'center' }}>
                      <button 
                        type="button" 
                        onClick={() => removeRoom(idx)} 
                        disabled={rooms.length === 1}
                        style={{ 
                          color: rooms.length === 1 ? '#cbd5e1' : 'var(--danger)', 
                          background: 'none', 
                          border: 'none', 
                          cursor: rooms.length === 1 ? 'not-allowed' : 'pointer', 
                          fontWeight: 700, 
                          fontSize: '0.95rem' 
                        }}
                      >
                        ✕
                      </button>
                    </td>

                    {/* S No. */}
                    <td style={{ padding: '6px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {idx + 1}
                    </td>

                    {/* Room No */}
                    <td style={{ padding: '4px' }}>
                      <select 
                        className="form-select" 
                        value={row.roomNo} 
                        onChange={e => setRoom(idx, 'roomNo', e.target.value)} 
                        style={{ fontSize: '0.85rem', padding: '2px 4px', height: '32px', width: '110px' }}
                        required
                      >
                        <option value="">Select</option>
                        <option value="101">101</option>
                        <option value="102">102</option>
                        <option value="201">201</option>
                        <option value="202">202</option>
                      </select>
                    </td>

                    {/* Plan / Package */}
                    <td style={{ padding: '4px' }}>
                      <select 
                        className="form-select" 
                        value={row.plan} 
                        onChange={e => setRoom(idx, 'plan', e.target.value)} 
                        style={{ fontSize: '0.85rem', padding: '2px 4px', height: '32px', width: '110px' }}
                        required
                      >
                        <option value="">Select</option>
                        <option value="EP">EP</option>
                        <option value="CP">CP</option>
                        <option value="MAP">MAP</option>
                        <option value="AP">AP</option>
                      </select>
                    </td>

                    {/* No. of Adults */}
                    <td style={{ padding: '4px' }}>
                      <input 
                        className="form-input" 
                        type="number" 
                        min="1" 
                        value={row.adults} 
                        onChange={e => setRoom(idx, 'adults', e.target.value)} 
                        style={{ width: '60px', fontSize: '0.85rem', height: '32px', padding: '2px 4px' }} 
                        required
                      />
                    </td>

                    {/* No. of Childs */}
                    <td style={{ padding: '4px' }}>
                      <input 
                        className="form-input" 
                        type="number" 
                        min="0" 
                        value={row.children} 
                        onChange={e => setRoom(idx, 'children', e.target.value)} 
                        style={{ width: '60px', fontSize: '0.85rem', height: '32px', padding: '2px 4px' }} 
                        required
                      />
                    </td>

                    {/* Rate */}
                    <td style={{ padding: '4px' }}>
                      <input 
                        className="form-input" 
                        type="number" 
                        value={row.rate} 
                        onChange={e => setRoom(idx, 'rate', e.target.value)} 
                        placeholder="0.00" 
                        style={{ width: '90px', fontSize: '0.85rem', height: '32px', padding: '2px 4px' }} 
                        required
                      />
                    </td>

                    {/* Tax Inc. */}
                    <td style={{ padding: '4px' }}>
                      <select 
                        className="form-select" 
                        value={row.taxInclusive} 
                        onChange={e => setRoom(idx, 'taxInclusive', e.target.value)} 
                        style={{ fontSize: '0.85rem', padding: '2px 4px', height: '32px', width: '80px' }}
                        required
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </td>

                    {/* Leader */}
                    <td style={{ padding: '4px' }}>
                      <select 
                        className="form-select" 
                        value={row.leader} 
                        onChange={e => setRoom(idx, 'leader', e.target.value)} 
                        style={{ fontSize: '0.85rem', padding: '2px 4px', height: '32px', width: '80px' }}
                        required
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button 
            type="button" 
            onClick={addRoom} 
            className="btn-secondary" 
            style={{ fontSize: '0.82rem', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <FaPlus size={8} /> Add Room
          </button>
        </div>

        {/* Footer Actions */}
        <CommonActionButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText={mode === 'add' ? 'Save' : 'Update'}
        />

      </form>

      {/* Booking List Modal */}
      <CommonModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Booking List"
        maxWidth="1200px"
        lessPadding={true}
      >
        <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <Booking showToast={showToast} onlyList={true} />
        </div>
      </CommonModal>

      {/* Room Enquiry List Modal */}
      <CommonModal
        isOpen={showEnquiryModal}
        onClose={() => setShowEnquiryModal(false)}
        title="Room Enquiry List"
        maxWidth="1200px"
        lessPadding={true}
      >
        <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
          <RoomEnquiry showToast={showToast} onlyList={true} />
        </div>
      </CommonModal>

    </div>
  );
};

export default WalkinCheckinForm;
