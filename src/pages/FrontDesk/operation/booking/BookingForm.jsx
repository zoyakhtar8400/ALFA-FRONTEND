import React, { useState, useEffect } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { FaUser, FaBuilding, FaCalendarAlt, FaBullhorn, FaBed, FaPlus, FaTrash, FaDollarSign, FaCar, FaCalendarCheck, FaIdCard } from 'react-icons/fa';

const BookingForm = ({ mode, initialData, onSave, onCancel }) => {
  const initialRoomRow = () => ({
    roomNo: '',
    arrivalDate: new Date().toISOString().split('T')[0],
    arrivalTime: '03:00 PM',
    days: 1,
    depDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
    depTime: '12:00 PM',
    category: '',
    noOfRooms: 1,
    plan: '',
    noOfOcc: 1,
    noOfChild: 0,
    rate: '',
    taxInclusive: 'Yes',
    taxableAmount: '0.00',
    netAmount: '0.00'
  });

  const [form, setForm] = useState({
    bookingNo: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    bookingStatus: 'Confirmed',
    prefix: 'Mr.',
    name: '',
    address: '',
    city: '',
    state: '',
    nationality: 'Indian',
    mobileNo: '',
    emailId: '',
    phoneNo: '',
    gender: 'Male',
    company: '',
    companyGstin: '',
    idProof: '',
    idProofNo: '',
    purposeOfVisit: '',
    marketSegment: '',
    businessSource: '',
    bookingRefNo: '',
    bookingRefDate: '',
    arrivedFrom: '',
    destination: '',
    discount: '0',
    billingInstruction: '',
    remark: '',
  });

  const [rooms, setRooms] = useState([initialRoomRow()]);
  const [activeTab, setActiveTab] = useState('guest');

  useEffect(() => {
    if (initialData) {
      setForm(f => ({ ...f, ...initialData }));
      if (initialData.rooms) setRooms(initialData.rooms);
    }
  }, [initialData]);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const calculateRowAmounts = (row) => {
    const rateVal = parseFloat(row.rate) || 0;
    const daysVal = parseFloat(row.days) || 0;
    const roomsVal = parseFloat(row.noOfRooms) || 1;
    const isTaxInc = row.taxInclusive === 'Yes';
    
    const subtotal = rateVal * daysVal * roomsVal;
    
    let taxable = 0;
    let net = 0;
    
    if (isTaxInc) {
      net = subtotal;
      taxable = subtotal / 1.12; // 12% tax rate
    } else {
      taxable = subtotal;
      net = subtotal * 1.12;
    }
    
    return {
      ...row,
      taxableAmount: taxable.toFixed(2),
      netAmount: net.toFixed(2)
    };
  };

  const setRoom = (idx, key, val) => {
    setRooms(prev => prev.map((r, i) => {
      if (i === idx) {
        let updated = { ...r, [key]: val };
        
        // Auto-calculate Days if Arrival or Departure date changes
        if (key === 'arrivalDate' || key === 'depDate') {
          const arr = new Date(updated.arrivalDate);
          const dep = new Date(updated.depDate);
          if (!isNaN(arr) && !isNaN(dep) && dep >= arr) {
            const timeDiff = dep.getTime() - arr.getTime();
            const calculatedDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) || 1;
            updated.days = calculatedDays;
          }
        } else if (key === 'days') {
          const arr = new Date(updated.arrivalDate);
          const daysNum = parseInt(val) || 1;
          if (!isNaN(arr)) {
            const dep = new Date(arr.getTime() + daysNum * 24 * 60 * 60 * 1000);
            updated.depDate = dep.toISOString().split('T')[0];
          }
        }

        // Trigger Taxable and Net calculations
        if (['rate', 'days', 'noOfRooms', 'taxInclusive', 'arrivalDate', 'depDate'].includes(key)) {
          return calculateRowAmounts(updated);
        }
        return updated;
      }
      return r;
    }));
  };

  const addRoom = () => setRooms(prev => [...prev, initialRoomRow()]);
  const removeRoom = idx => setRooms(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = e => {
    e.preventDefault();
    onSave({ ...form, rooms });
  };

  const F = ({ label, name, type = 'text', placeholder, required, disabled, children }) => (
    <div className="form-field" style={{ marginBottom: '8px' }}>
      <label className="form-label">
        {label}{required && <span className="text-red-500"> *</span>}
      </label>
      {children || (
        <input
          className={`form-input${disabled ? ' bg-slate-50 cursor-not-allowed' : ''}`}
          type={type}
          value={form[name] || ''}
          onChange={disabled ? undefined : set(name)}
          disabled={disabled}
          placeholder={placeholder}
          required={required}
          style={{ fontSize: '0.9rem' }}
        />
      )}
    </div>
  );

  const sectionTitle = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0 6px', borderBottom: '2px solid var(--primary)', marginBottom: '8px' }}>
      <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)' }}>{title}</span>
    </div>
  );

  /* ── Searchable Dropdown ── */
  const SearchDropdown = ({ label, name, options, placeholder = 'Search...', required, addBtn }) => {
    const [query, setQuery] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef(null);

    const filtered = options.filter(o =>
      o.label.toLowerCase().includes(query.toLowerCase())
    );

    // Close on outside click
    React.useEffect(() => {
      const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = options.find(o => o.value === form[name]);

    return (
      <div className="form-field" style={{ marginBottom: '8px', position: 'relative' }} ref={ref}>
        <label className="form-label">{label}{required && <span className="text-red-500"> *</span>}</label>
        <div style={{ display: 'grid', gridTemplateColumns: addBtn ? '1fr auto' : '1fr', gap: '4px' }}>
          <div
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => setOpen(o => !o)}
          >
            {/* Display value / search input */}
            {open ? (
              <input
                autoFocus
                className="form-input"
                style={{ fontSize: '0.9rem', paddingRight: '28px' }}
                placeholder={placeholder}
                value={query}
                onChange={e => { setQuery(e.target.value); }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <div
                className="form-select"
                style={{ fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '34px', userSelect: 'none' }}
              >
                <span style={{ color: selected ? 'inherit' : '#9ca3af' }}>
                  {selected ? selected.label : `Select ${label}`}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', marginLeft: '6px' }}>▼</span>
              </div>
            )}

            {/* Dropdown list */}
            {open && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
                background: 'var(--card-bg, #fff)', border: '1px solid var(--primary)',
                borderRadius: '6px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                maxHeight: '200px', overflowY: 'auto', marginTop: '2px',
              }}>
                {filtered.length === 0 ? (
                  <div style={{ padding: '8px 12px', color: '#9ca3af', fontSize: '0.85rem' }}>No results</div>
                ) : filtered.map(o => (
                  <div
                    key={o.value}
                    onMouseDown={e => { e.preventDefault(); setForm(f => ({ ...f, [name]: o.value })); setQuery(''); setOpen(false); }}
                    style={{
                      padding: '7px 12px', fontSize: '0.88rem', cursor: 'pointer',
                      background: form[name] === o.value ? 'var(--primary-light)' : 'transparent',
                      color: form[name] === o.value ? 'var(--primary)' : 'inherit',
                      fontWeight: form[name] === o.value ? 700 : 400,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-light)'}
                    onMouseLeave={e => e.currentTarget.style.background = form[name] === o.value ? 'var(--primary-light)' : 'transparent'}
                  >
                    {o.label}
                  </div>
                ))}
              </div>
            )}
          </div>
          {addBtn && (
            <button type="button" className="btn-secondary" style={{ padding: '0 12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title={`Add ${label}`}>
              <FaPlus />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in duration-200">
      
      {/* CSS Block to completely hide scrollbars inside the booking form and outer content area */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar,
        .content-area::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar,
        .content-area {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />

      <PageHeader
        title={mode === 'add' ? 'Booking Entry' : 'Edit Booking'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Booking', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
        style={{ marginBottom: '6px', paddingBottom: '4px' }}
      />

      {/* Top Controls: Left (Tabs), Right (Action Buttons) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 10px', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
        {/* Left: Tab Selection */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('guest')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 22px',
              borderRadius: '22px',
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              border: activeTab === 'guest' ? '2px solid var(--primary)' : '2px solid transparent',
              background: activeTab === 'guest' ? 'var(--primary)' : 'var(--primary-light)',
              color: activeTab === 'guest' ? '#fff' : 'var(--primary)',
              transition: 'all 0.2s',
              boxShadow: activeTab === 'guest' ? '0 4px 12px rgba(65,138,139,0.3)' : 'none',
            }}
          >
            <FaUser style={{ fontSize: '0.9rem' }} /> Guest Information
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('room')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 22px',
              borderRadius: '22px',
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              border: activeTab === 'room' ? '2px solid var(--primary)' : '2px solid transparent',
              background: activeTab === 'room' ? 'var(--primary)' : 'var(--primary-light)',
              color: activeTab === 'room' ? '#fff' : 'var(--primary)',
              transition: 'all 0.2s',
              boxShadow: activeTab === 'room' ? '0 4px 12px rgba(65,138,139,0.3)' : 'none',
            }}
          >
            <FaBed style={{ fontSize: '0.9rem' }} /> Room Information
          </button>
        </div>

        {/* Right: Top Colorful Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={() => console.log('Advance Clicked')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 22px',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.2s',
            }}
          >
            <FaDollarSign style={{ fontSize: '0.9rem' }} /> Advance
          </button>
          <button
            type="button"
            onClick={() => console.log('Pickup Clicked')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 22px',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              border: 'none',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
              transition: 'all 0.2s',
            }}
          >
            <FaCar style={{ fontSize: '0.9rem' }} /> Pickup
          </button>
          <button
            type="button"
            onClick={() => console.log('Reservation Clicked')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 22px',
              borderRadius: '8px',
              fontSize: '0.95rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)',
              transition: 'all 0.2s',
            }}
          >
            <FaCalendarCheck style={{ fontSize: '0.9rem' }} /> Reservation
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '0 16px 8px' }}>
        
        {/* Natural Form Content (No nested scrolling container) */}
        <div style={{ marginBottom: '8px' }}>
          
          {/* TAB 1: GUEST INFORMATION (5 PARTS GRID LAYOUT) */}
          {activeTab === 'guest' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'start' }}>
              
              {/* LEFT COLUMN: Guest Details + Address Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* 1. Guest Details Card */}
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
                      <F label="Gender" name="gender">
                        <select className="form-select" value={form.gender} onChange={set('gender')} style={{ fontSize: '0.9rem' }}>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </F>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <SearchDropdown
                        name="nationality"
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

                    {/* Row 3: Mobile + Email + Phone equal size */}
                    <div style={{ gridColumn: 'span 4', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                      <F label="Mobile" name="mobileNo" type="tel" placeholder="Enter mobile" required />
                      <F label="Email Id" name="emailId" type="email" placeholder="Enter email id" />
                      <F label="Phone" name="phoneNo" placeholder="Enter phone" />
                    </div>
                  </div>
                </div>

                {/* 2. Address Details Card */}
                <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px 16px' }}>
                  {sectionTitle(<FaBuilding />, 'Address Details')}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                    <div className="form-field" style={{ gridColumn: 'span 2', marginBottom: '8px' }}>
                      <F label="Address" name="address" placeholder="Enter full address" required />
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <SearchDropdown
                        name="city"
                        label="City"
                        required
                        addBtn
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
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Market & Source + Reference & Remarks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                {/* 3. Market & Source Card */}
                <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px 16px' }}>
                  {sectionTitle(<FaIdCard />, 'Market & Source')}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                    
                    {/* Company Add – Search Dropdown */}
                    <div style={{ gridColumn: 'span 2' }}>
                      <SearchDropdown
                        name="company"
                        label="Company Add"
                        addBtn
                        options={[
                          { value: 'Alfa Corp', label: 'Alfa Corp' },
                          { value: 'Google', label: 'Google' },
                          { value: 'Microsoft', label: 'Microsoft' },
                          { value: 'Infosys', label: 'Infosys' },
                          { value: 'TCS', label: 'TCS' },
                          { value: 'Wipro', label: 'Wipro' },
                          { value: 'HCL', label: 'HCL' },
                          { value: 'Reliance', label: 'Reliance' },
                        ]}
                        placeholder="Search company..."
                      />
                    </div>

                    <F label="Market Seg" name="marketSegment">
                      <select className="form-select" value={form.marketSegment} onChange={set('marketSegment')} style={{ fontSize: '0.9rem' }}>
                        <option value="">Select Market Seg</option>
                        <option value="SELF">SELF</option>
                        <option value="Corporate">Corporate</option>
                        <option value="FIT">FIT</option>
                        <option value="Group">Group</option>
                        <option value="Government">Government</option>
                        <option value="Leisure">Leisure</option>
                      </select>
                    </F>

                    <F label="Bus. Src" name="businessSource">
                      <select className="form-select" value={form.businessSource} onChange={set('businessSource')} style={{ fontSize: '0.9rem' }}>
                        <option value="">Select Bus. Src</option>
                        <option value="SELF">SELF</option>
                        <option value="Direct">Direct</option>
                        <option value="OTA">OTA</option>
                        <option value="Travel Agent">Travel Agent</option>
                        <option value="Walk-in">Walk-in</option>
                      </select>
                    </F>

                    <div style={{ gridColumn: 'span 2' }}>
                      <F label="Discount %" name="discount" type="number" placeholder="0" />
                    </div>
                  </div>
                </div>

                {/* 5. Reference & Remarks Card */}
                <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px 16px' }}>
                  {sectionTitle(<FaCar />, 'Reference & Remarks')}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                    <F label="Arived Form" name="arrivedFrom" placeholder="Arrived from" />
                    <F label="Booking Ref. No" name="bookingRefNo" placeholder="Ref No" />
                    
                    <F label="Booking Ref Date" name="bookingRefDate" type="date" />
                    <F label="Billing Instruction" name="billingInstruction" placeholder="Enter instructions" />

                    <div style={{ gridColumn: 'span 2' }}>
                      <F label="Final Remark" name="remark" placeholder="Enter remarks" />
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: ROOM INFORMATION */}
          {activeTab === 'room' && (
            <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px 16px' }}>
              {sectionTitle(<FaBed />, 'Room Information')}

              {/* ── Booking No / Date / Status highlight strip ── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>

                {/* Booking No – Indigo */}
                <div style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', borderRadius: '10px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.75)' }}>Booking No</span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', letterSpacing: '0.04em' }}>{form.bookingNo}</span>
                </div>

                {/* Date – Teal */}
                <div style={{ background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)', borderRadius: '10px', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.75)' }}>Date</span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                    {form.date ? new Date(form.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </span>
                </div>

                {/* Booking Status – Dynamic Color */}
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
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
                    {form.bookingStatus === 'Confirmed' ? '✔ Confirm' : form.bookingStatus === 'Tentative' ? '⏳ Tentative' : '✘ Cancel'}
                  </span>
                </div>
              </div>
              
              {/* Room Rows – Table Layout in a single scrollable row */}
              <div style={{ overflowX: 'auto', width: '100%', marginBottom: '12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
                <table style={{ width: '100%', minWidth: '1800px', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--primary-light)', borderBottom: '2px solid var(--border)' }}>
                      {['Action', 'S. No', 'Room / PKG', 'Arrival Date', 'Arrival Time', 'Days', 'Dep. Date', 'Dep. Time', 'Category', 'No. of Room', 'Plan Package', 'No. of Occ', 'No. of Child', 'Rate', 'Tax Inc.YN', 'Taxable Amount', 'Net Amount'].map((h, i) => (
                        <th key={h} style={{ 
                          padding: '10px 8px', 
                          textAlign: h === 'Action' ? 'center' : 'left', 
                          fontWeight: 700, 
                          color: 'var(--primary)', 
                          fontSize: '0.72rem', 
                          textTransform: 'uppercase', 
                          letterSpacing: '0.04em', 
                          whiteSpace: 'nowrap',
                          width: i === 0 ? '60px' : i === 1 ? '50px' : 'auto'
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
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(0, 0, 0, 0.02)'
                      }}>
                        {/* Action - Delete Button */}
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => removeRoom(idx)}
                            style={{
                              padding: '4px 8px', 
                              borderRadius: '6px',
                              background: 'rgba(239,68,68,0.1)', 
                              border: '1px solid rgba(239,68,68,0.3)',
                              color: '#ef4444', 
                              cursor: 'pointer', 
                              fontSize: '0.8rem', 
                              fontWeight: 600,
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              transition: 'all 0.2s',
                            }}
                            title="Remove Row"
                          >
                            <FaTrash style={{ fontSize: '0.75rem' }} />
                          </button>
                        </td>

                        {/* S. No */}
                        <td style={{ padding: '8px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {idx + 1}
                        </td>

                        {/* Room / PKG */}
                        <td style={{ padding: '8px' }}>
                          <select 
                            className="form-select" 
                            value={row.roomNo} 
                            onChange={e => setRoom(idx, 'roomNo', e.target.value)} 
                            style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '120px' }}
                          >
                            <option value="">Select</option>
                            <option value="101">101</option>
                            <option value="102">102</option>
                            <option value="201">201</option>
                            <option value="202">202</option>
                            <option value="Deluxe Package">Deluxe Package</option>
                          </select>
                        </td>

                        {/* Arrival Date */}
                        <td style={{ padding: '8px' }}>
                          <input 
                            className="form-input" 
                            type="date" 
                            value={row.arrivalDate} 
                            onChange={e => setRoom(idx, 'arrivalDate', e.target.value)} 
                            style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '135px' }} 
                          />
                        </td>

                        {/* Arrival Time */}
                        <td style={{ padding: '8px' }}>
                          <input 
                            className="form-input" 
                            type="text" 
                            value={row.arrivalTime} 
                            onChange={e => setRoom(idx, 'arrivalTime', e.target.value)} 
                            placeholder="03:00 PM" 
                            style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '100px' }} 
                          />
                        </td>

                        {/* Days */}
                        <td style={{ padding: '8px' }}>
                          <input 
                            className="form-input" 
                            type="number" 
                            min="1" 
                            value={row.days} 
                            onChange={e => setRoom(idx, 'days', e.target.value)} 
                            placeholder="0"
                            style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '70px' }} 
                          />
                        </td>

                        {/* Dep. Date */}
                        <td style={{ padding: '8px' }}>
                          <input 
                            className="form-input" 
                            type="date" 
                            value={row.depDate} 
                            onChange={e => setRoom(idx, 'depDate', e.target.value)} 
                            style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '135px' }} 
                          />
                        </td>

                        {/* Dep. Time */}
                        <td style={{ padding: '8px' }}>
                          <input 
                            className="form-input" 
                            type="text" 
                            value={row.depTime} 
                            onChange={e => setRoom(idx, 'depTime', e.target.value)} 
                            placeholder="12:00 PM" 
                            style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '100px' }} 
                          />
                        </td>

                        {/* Category */}
                        <td style={{ padding: '8px' }}>
                          <select 
                            className="form-select" 
                            value={row.category} 
                            onChange={e => setRoom(idx, 'category', e.target.value)} 
                            style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '150px' }}
                          >
                            <option value="">Select</option>
                            <option value="Deluxe">Deluxe Room</option>
                            <option value="Super Deluxe">Super Deluxe</option>
                            <option value="Executive Suite">Executive Suite</option>
                          </select>
                        </td>

                        {/* No. of Room */}
                        <td style={{ padding: '8px' }}>
                          <input 
                            className="form-input" 
                            type="number" 
                            min="1" 
                            value={row.noOfRooms} 
                            onChange={e => setRoom(idx, 'noOfRooms', e.target.value)} 
                            placeholder="0"
                            style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '80px' }} 
                          />
                        </td>

                        {/* Plan Package */}
                        <td style={{ padding: '8px' }}>
                          <select 
                            className="form-select" 
                            value={row.plan} 
                            onChange={e => setRoom(idx, 'plan', e.target.value)} 
                            style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '90px' }}
                          >
                            <option value="">Select</option>
                            <option value="EP">EP</option>
                            <option value="CP">CP</option>
                            <option value="MAP">MAP</option>
                            <option value="AP">AP</option>
                          </select>
                        </td>

                        {/* No. of Occ */}
                        <td style={{ padding: '8px' }}>
                          <input 
                            className="form-input" 
                            type="number" 
                            min="1" 
                            value={row.noOfOcc} 
                            onChange={e => setRoom(idx, 'noOfOcc', e.target.value)} 
                            placeholder="0"
                            style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '80px' }} 
                          />
                        </td>

                        {/* No. of Child */}
                        <td style={{ padding: '8px' }}>
                          <input 
                            className="form-input" 
                            type="number" 
                            min="0" 
                            value={row.noOfChild} 
                            onChange={e => setRoom(idx, 'noOfChild', e.target.value)} 
                            placeholder="0"
                            style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '80px' }} 
                          />
                        </td>

                        {/* Rate */}
                        <td style={{ padding: '8px' }}>
                          <input 
                            className="form-input" 
                            type="number" 
                            value={row.rate} 
                            onChange={e => setRoom(idx, 'rate', e.target.value)} 
                            placeholder="0" 
                            style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '100px' }} 
                          />
                        </td>

                        {/* Tax Inc.YN */}
                        <td style={{ padding: '8px' }}>
                          <select 
                            className="form-select" 
                            value={row.taxInclusive} 
                            onChange={e => setRoom(idx, 'taxInclusive', e.target.value)} 
                            style={{ fontSize: '0.8rem', padding: '4px 6px', height: '32px', minHeight: '32px', width: '80px' }}
                          >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </td>

                        {/* Taxable Amount */}
                        <td style={{ padding: '8px' }}>
                          <input 
                            className="form-input" 
                            type="text" 
                            value={row.taxableAmount} 
                            disabled 
                            placeholder="0.00"
                            style={{ 
                              fontSize: '0.8rem', 
                              padding: '4px 6px', 
                              height: '32px', 
                              minHeight: '32px', 
                              width: '100px',
                              background: 'var(--primary-light)', 
                              fontWeight: 600, 
                              color: 'var(--primary)',
                              border: '1px solid var(--border)'
                            }} 
                          />
                        </td>

                        {/* Net Amount */}
                        <td style={{ padding: '8px' }}>
                          <input 
                            className="form-input" 
                            type="text" 
                            value={row.netAmount} 
                            disabled 
                            placeholder="0.00"
                            style={{ 
                              fontSize: '0.8rem', 
                              padding: '4px 6px', 
                              height: '32px', 
                              minHeight: '32px', 
                              width: '100px',
                              background: 'rgba(16,185,129,0.08)', 
                              fontWeight: 700, 
                              color: '#059669',
                              border: '1px solid rgba(16,185,129,0.2)'
                            }} 
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={addRoom}
                style={{
                  marginTop: '10px',
                  fontSize: '0.88rem',
                  padding: '9px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark, #3a7a7b))',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(65,138,139,0.25)',
                  transition: 'all 0.2s',
                }}
              >
                <FaPlus /> Add Room
              </button>
            </div>
          )}
        </div>

        {/* FOOTER ACTION BUTTONS */}
        <CommonActionButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText={mode === 'add' ? 'Save' : 'Update'}
        />
      </form>
    </div>
  );
};

export default BookingForm;
