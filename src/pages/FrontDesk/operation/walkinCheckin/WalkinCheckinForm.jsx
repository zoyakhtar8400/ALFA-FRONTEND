import React, { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import FormCard from '../../../../components/common/FormCard';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
const WalkinCheckinForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    grcNo: initialData?.grcNo || `GRC-${Math.floor(1000 + Math.random() * 9000)}`,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    checkinDate: initialData?.checkinDate || new Date().toISOString().split('T')[0],
    days: initialData?.days || 1,
    time: initialData?.time || '',
    expectedCheckoutDate: initialData?.expectedCheckoutDate || '',
    expectedCheckoutTime: initialData?.expectedCheckoutTime || '',
    prefix: initialData?.prefix || 'Mr.',
    name: initialData?.name || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    nationality: initialData?.nationality || '',
    mobileNo: initialData?.mobileNo || '',
    purposeOfVisit: initialData?.purposeOfVisit || '',
    company: initialData?.company || '',
    companyGstin: initialData?.companyGstin || '',
    idProof: initialData?.idProof || '',
    idProofNo: initialData?.idProofNo || '',
    emailId: initialData?.emailId || '',
    phoneNo: initialData?.phoneNo || '',
    remark: initialData?.remark || '',
    paymentMode: initialData?.paymentMode || '',
    marketSegment: initialData?.marketSegment || '',
    bookingRefNo: initialData?.bookingRefNo || '',
    businessSource: initialData?.businessSource || '',
    managementBlock: initialData?.managementBlock || 'No',
    arrivedFrom: initialData?.arrivedFrom || '',
    destination: initialData?.destination || '',
    discount: initialData?.discount || '',
  });
  const [rooms, setRooms] = useState(initialData?.rooms || [
    { roomNo: '', plan: '', adults: 1, children: 0, rate: '', taxInclusive: 'No', leader: 'No' }
  ]);
  const [activeTab, setActiveTab] = useState('guest');
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const setRoom = (idx, key, val) => setRooms(prev => prev.map((r, i) => i === idx ? { ...r, [key]: val } : r));
  const addRoom = () => setRooms(prev => [...prev, { roomNo: '', plan: '', adults: 1, children: 0, rate: '', taxInclusive: 'No', leader: 'No' }]);
  const removeRoom = idx => setRooms(prev => prev.filter((_, i) => i !== idx));
  const handleSubmit = e => { e.preventDefault(); onSave({ ...form, rooms }); };
  const F = ({ label, name, type = 'text', placeholder, required, disabled, children }) => (
    <div className="form-field">
      <label className="form-label">{label}{required && <span className="text-red-500"> *</span>}</label>
      {children || <input className={`form-input${disabled ? ' bg-slate-50 cursor-not-allowed' : ''}`} type={type} value={form[name] || ''} onChange={disabled ? undefined : set(name)} disabled={disabled} placeholder={placeholder} required={required} />}
    </div>
  );
  return (
    <div className="animate-in duration-200">
      <PageHeader title={mode === 'add' ? 'Walkin Checkin Entry' : 'Edit Walkin Checkin'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Walkin Checkin Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack onBack={onCancel} />
      {/* Tabs Header */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', padding: '0 24px 12px', marginBottom: '16px' }}>
        {[
          { key: 'guest', label: 'Guest Details' },
          { key: 'room', label: 'Room Details' },
          { key: 'stay', label: 'Stay & Payment' },
          { key: 'marketing', label: 'Marketing & Actions' },
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
          {activeTab === 'guest' && (
            <FormCard title="Guest Information" className="mb-0">
              <div className="form-grid-2">
                <div className="form-field">
                  <label className="form-label">Name <span className="text-red-500"> *</span></label>
                  <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '6px' }}>
                    <select className="form-select" value={form.prefix} onChange={set('prefix')}>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                    <input className="form-input" type="text" value={form.name} onChange={set('name')} placeholder="Guest name" required />
                  </div>
                </div>
                <F label="Mobile No" name="mobileNo" placeholder="+91 XXXXX XXXXX" required />
                <F label="Email ID" name="emailId" type="email" placeholder="email@example.com" />
                <F label="Phone No" name="phoneNo" placeholder="Landline" />
                <div className="form-field form-span-2">
                  <F label="Address" name="address" placeholder="Full address" />
                </div>
                <F label="City" name="city" placeholder="City" />
                <F label="State" name="state" placeholder="State" />
                <F label="Nationality" name="nationality" placeholder="Nationality" />
                <F label="ID Proof" name="idProof">
                  <select className="form-select" value={form.idProof} onChange={set('idProof')}>
                    <option value="">Select ID Proof</option>
                    <option value="Aadhaar Card">Aadhaar Card</option>
                    <option value="PAN Card">PAN Card</option>
                    <option value="Passport">Passport</option>
                    <option value="Driving License">Driving License</option>
                    <option value="Voter ID">Voter ID</option>
                  </select>
                </F>
                <F label="ID Proof No" name="idProofNo" placeholder="ID number" />
              </div>
            </FormCard>
          )}
          {activeTab === 'room' && (
            <FormCard title="Room Allocation" className="mb-0">
              <div style={{ overflowX: 'auto', marginBottom: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--primary-light)', borderBottom: '2px solid var(--border)' }}>
                      {['Room No', 'Plan', 'Adults', 'Children', 'Rate', 'Tax Incl.', 'Leader', ''].map(h => (
                        <th key={h} style={{ padding: '8px 8px', textAlign: 'left', fontWeight: 600, color: 'var(--dark)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rooms.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '6px' }}><input className="form-input" type="text" value={row.roomNo} onChange={e => setRoom(idx, 'roomNo', e.target.value)} placeholder="101" style={{ width: '60px', fontSize: '0.8rem' }} /></td>
                        <td style={{ padding: '6px' }}>
                          <select className="form-select" value={row.plan} onChange={e => setRoom(idx, 'plan', e.target.value)} style={{ fontSize: '0.8rem', padding: '4px 6px' }}>
                            <option value="">-</option>
                            <option value="EP">EP</option>
                            <option value="CP">CP</option>
                            <option value="MAP">MAP</option>
                            <option value="AP">AP</option>
                          </select>
                        </td>
                        <td style={{ padding: '6px' }}><input className="form-input" type="number" min="1" value={row.adults} onChange={e => setRoom(idx, 'adults', e.target.value)} style={{ width: '48px', fontSize: '0.8rem' }} /></td>
                        <td style={{ padding: '6px' }}><input className="form-input" type="number" min="0" value={row.children} onChange={e => setRoom(idx, 'children', e.target.value)} style={{ width: '48px', fontSize: '0.8rem' }} /></td>
                        <td style={{ padding: '6px' }}><input className="form-input" type="number" value={row.rate} onChange={e => setRoom(idx, 'rate', e.target.value)} style={{ width: '70px', fontSize: '0.8rem' }} /></td>
                        <td style={{ padding: '6px' }}>
                          <select className="form-select" value={row.taxInclusive} onChange={e => setRoom(idx, 'taxInclusive', e.target.value)} style={{ fontSize: '0.8rem', padding: '4px 4px' }}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </td>
                        <td style={{ padding: '6px' }}>
                          <select className="form-select" value={row.leader} onChange={e => setRoom(idx, 'leader', e.target.value)} style={{ fontSize: '0.8rem', padding: '4px 4px' }}>
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        </td>
                        <td style={{ padding: '6px' }}>
                          {rooms.length > 1 && <button type="button" onClick={() => removeRoom(idx)} style={{ color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>✕</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={addRoom} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>+ Add Room</button>
            </FormCard>
          )}
          {activeTab === 'stay' && (
            <FormCard title="Stay & Payment details" className="mb-0">
              <div className="form-grid-2">
                <F label="GRC No" name="grcNo" disabled />
                <F label="Date" name="date" type="date" />
                <F label="Checkin Date" name="checkinDate" type="date" required />
                <F label="Days" name="days" type="number" />
                <F label="Time" name="time" type="time" />
                <F label="Expected Checkout Date" name="expectedCheckoutDate" type="date" />
                <F label="Expected Checkout Time" name="expectedCheckoutTime" type="time" />
                <F label="Payment Mode" name="paymentMode">
                  <select className="form-select" value={form.paymentMode} onChange={set('paymentMode')}>
                    <option value="">Select Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit">Credit</option>
                  </select>
                </F>
                <F label="Discount %" name="discount" type="number" placeholder="0.00" />
                <F label="Management Block" name="managementBlock">
                  <select className="form-select" value={form.managementBlock} onChange={set('managementBlock')}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </F>
              </div>
            </FormCard>
          )}
          {activeTab === 'marketing' && (
            <FormCard title="Marketing & Extra Actions" className="mb-0">
              <div className="form-grid-2">
                <F label="Purpose of Visit" name="purposeOfVisit">
                  <select className="form-select" value={form.purposeOfVisit} onChange={set('purposeOfVisit')}>
                    <option value="">Select Purpose</option>
                    <option value="Business">Business</option>
                    <option value="Leisure">Leisure</option>
                    <option value="Medical">Medical</option>
                    <option value="Transit">Transit</option>
                    <option value="Education">Education</option>
                  </select>
                </F>
                <F label="Company" name="company" placeholder="Company name" />
                <F label="Company GSTIN" name="companyGstin" placeholder="GST number" />
                <F label="Market Segment" name="marketSegment">
                  <select className="form-select" value={form.marketSegment} onChange={set('marketSegment')}>
                    <option value="">Select Segment</option>
                    <option value="Corporate">Corporate</option>
                    <option value="FIT">FIT</option>
                    <option value="Group">Group</option>
                    <option value="Government">Government</option>
                    <option value="Leisure">Leisure</option>
                  </select>
                </F>
                <F label="Business Source" name="businessSource">
                  <select className="form-select" value={form.businessSource} onChange={set('businessSource')}>
                    <option value="">Select Source</option>
                    <option value="Direct">Direct</option>
                    <option value="OTA">OTA</option>
                    <option value="Travel Agent">Travel Agent</option>
                    <option value="Walk-in">Walk-in</option>
                  </select>
                </F>
                <F label="Booking Ref No" name="bookingRefNo" placeholder="Ref number" />
                <F label="Arrived From" name="arrivedFrom" placeholder="Origin" />
                <F label="Destination" name="destination" placeholder="Next destination" />
                <div className="form-field form-span-2">
                  <label className="form-label">Remark</label>
                  <textarea className="form-textarea" rows={1} value={form.remark} onChange={set('remark')} placeholder="Additional remarks..." />
                </div>

                {/* Action Buttons Section (Inline and Colored) */}
                <div className="form-span-2" style={{ display: 'flex', flexDirection: 'row', gap: '8px', flexWrap: 'nowrap', marginTop: '12px' }}>
                  <button type="button" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '24px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Blank GRC</button>
                  <button type="button" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '24px', border: 'none', background: 'var(--info)', color: '#fff', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Vehicle Details</button>
                  <button type="button" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '24px', border: 'none', background: 'var(--secondary)', color: '#fff', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Add Guest</button>
                  <button type="button" style={{ padding: '6px 12px', fontSize: '0.75rem', borderRadius: '24px', border: 'none', background: 'var(--warning)', color: '#fff', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>Photo / ID Upload</button>
                </div>
              </div>
            </FormCard>
          )}
        </div>
        <div className="form-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '16px' }}>
          <button type="button" onClick={onCancel} className="btn-secondary" style={{ cursor: 'pointer' }}>
            Cancel
          </button>
          {activeTab !== 'guest' && (
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'marketing') setActiveTab('stay');
                else if (activeTab === 'stay') setActiveTab('room');
                else if (activeTab === 'room') setActiveTab('guest');
              }}
              className="btn-secondary"
              style={{ cursor: 'pointer' }}
            >
              Back
            </button>
          )}
          {activeTab !== 'marketing' ? (
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'guest') setActiveTab('room');
                else if (activeTab === 'room') setActiveTab('stay');
                else if (activeTab === 'stay') setActiveTab('marketing');
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
export default WalkinCheckinForm;
