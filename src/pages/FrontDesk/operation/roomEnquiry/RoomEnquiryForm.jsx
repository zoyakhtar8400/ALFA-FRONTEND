import { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { FaSearch, FaBed } from 'react-icons/fa';

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

const RoomEnquiryForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState(() => ({
    guestName: initialData?.guestName || '',
    mobile: initialData?.mobile || '',
    email: initialData?.email || '',
    roomCategory: initialData?.roomCategory || '',
    checkIn: initialData?.checkIn || new Date().toISOString().split('T')[0],
    checkOut: initialData?.checkOut || new Date(Date.now() + 86400000).toISOString().split('T')[0],
    adults: initialData?.adults || 1,
    children: initialData?.children || 0,
    source: initialData?.source || '',
    remarks: initialData?.remarks || '',
    active: initialData?.active || 'Yes',
  }));

  // Mock list of room availability matching categories
  const roomsAvailability = [
    { roomNo: '101', category: 'Standard Room', rate: 2500, status: 'Available' },
    { roomNo: '102', category: 'Standard Room', rate: 2500, status: 'Booked' },
    { roomNo: '201', category: 'Deluxe Room', rate: 3500, status: 'Available' },
    { roomNo: '202', category: 'Deluxe Room', rate: 3500, status: 'Available' },
    { roomNo: '301', category: 'Executive Suite', rate: 6000, status: 'Available' },
    { roomNo: '302', category: 'Executive Suite', rate: 6000, status: 'Booked' },
  ];

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

  // Filter available rooms dynamically if a category is selected
  const filteredRooms = form.roomCategory
    ? roomsAvailability.filter(r => r.category === form.roomCategory)
    : roomsAvailability;

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
        title={mode === 'add' ? 'Add Room Enquiry' : 'Edit Room Enquiry'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Room Enquiry Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
        style={{ marginBottom: '8px' }}
      />

      <form onSubmit={handleSubmit} style={{ padding: '0 8px 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '4fr 6fr', gap: '10px', alignItems: 'start', marginBottom: '10px' }}>
          
          {/* Left Column: Search & Enquiry Details */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
            {sectionTitle(<FaSearch />, 'Search Criteria')}
            <div className="form-grid-2">
              
              <div style={{ gridColumn: 'span 2' }}>
                <F label="Guest Name" required value={form.guestName} onChange={set('guestName')} placeholder="Guest name" />
              </div>
              
              <F label="Mobile" value={form.mobile} onChange={set('mobile')} placeholder="+91 XXXXX XXXXX" />
              <F label="Email ID" type="email" value={form.email} onChange={set('email')} placeholder="email@example.com" />
              
              <F label="Check-In Date" type="date" required value={form.checkIn} onChange={set('checkIn')} />
              <F label="Check-Out Date" type="date" required value={form.checkOut} onChange={set('checkOut')} />

              <F label="Adults" type="number" min="1" value={form.adults} onChange={set('adults')} />
              <F label="Children" type="number" min="0" value={form.children} onChange={set('children')} />

              <div style={{ gridColumn: 'span 2' }}>
                <F label="Room Category" required>
                  <select className="form-select" value={form.roomCategory} onChange={set('roomCategory')} style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }} required>
                    <option value="">All Categories</option>
                    <option value="Standard Room">Standard Room</option>
                    <option value="Deluxe Room">Deluxe Room</option>
                    <option value="Executive Suite">Executive Suite</option>
                  </select>
                </F>
              </div>

              <F label="Source">
                <select className="form-select" value={form.source} onChange={set('source')} style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }}>
                  <option value="">Select Source</option>
                  <option value="Phone">Phone</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Online">Online</option>
                  <option value="Agent">Agent</option>
                  <option value="Corporate">Corporate</option>
                </select>
              </F>
              
              <F label="Active Status">
                <select className="form-select" value={form.active} onChange={set('active')} style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </F>

              <div style={{ gridColumn: 'span 2' }}>
                <F label="Remarks">
                  <textarea className="form-textarea" rows={1} value={form.remarks} onChange={set('remarks')} placeholder="Enquiry notes..." style={{ fontSize: '0.9rem', padding: '6px 8px' }} />
                </F>
              </div>

            </div>
          </div>

          {/* Right Column: Room Availability Grid Table */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
            {sectionTitle(<FaBed />, 'Category & Room Availability')}
            <div style={{ overflowX: 'auto', width: '100%', border: '1px solid var(--border)', borderRadius: '6px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid var(--border)' }}>
                <thead>
                  <tr style={{ background: 'var(--primary-light)' }}>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '20%', border: '1px solid var(--border)' }}>Room No</th>
                    <th style={{ padding: '8px 10px', textAlign: 'left', width: '40%', border: '1px solid var(--border)' }}>Room Category</th>
                    <th style={{ padding: '8px 10px', textAlign: 'right', width: '20%', border: '1px solid var(--border)' }}>Rate (₹)</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: '20%', border: '1px solid var(--border)' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map((row, idx) => (
                    <tr key={idx} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(0, 0, 0, 0.015)' }}>
                      <td style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid var(--border)', fontWeight: 600 }}>{row.roomNo}</td>
                      <td style={{ padding: '8px 10px', border: '1px solid var(--border)' }}>{row.category}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', border: '1px solid var(--border)', fontWeight: 600 }}>₹{row.rate.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '8px 10px', textAlign: 'center', border: '1px solid var(--border)' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          background: row.status === 'Available' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          color: row.status === 'Available' ? '#16a34a' : '#dc2626'
                        }}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

export default RoomEnquiryForm;
