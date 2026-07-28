import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { FaUser, FaBed, FaDollarSign, FaCar, FaCalendarCheck } from 'react-icons/fa';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';

// Import local modular sections
import GuestDetailsSection from './components/GuestDetailsSection';
import AddressDetailsSection from './components/AddressDetailsSection';
import MarketSourceSection from './components/MarketSourceSection';
import RemarksSection from './components/RemarksSection';
import RoomGridSection from './components/RoomGridSection';

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

const BookingForm = ({ mode, initialData, onSave, onCancel, existingRecords = [] }) => {
  const location = useLocation();
  const verifiedGuest = location.state?.guestData || null;

  const [form, setForm] = useState(() => ({
    bookingNo: initialData?.bookingNo || `BK-${Math.floor(1000 + Math.random() * 9000)}`,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    bookingStatus: initialData?.bookingStatus || 'Confirmed',
    prefix: initialData?.prefix || verifiedGuest?.prefix || 'Mr.',
    name: initialData?.name || verifiedGuest?.name || '',
    address: initialData?.address || verifiedGuest?.address || '',
    city: initialData?.city || verifiedGuest?.city || '',
    state: initialData?.state || verifiedGuest?.state || '',
    nationality: initialData?.nationality || verifiedGuest?.nationality || 'Indian',
    mobileNo: initialData?.mobileNo || verifiedGuest?.mobileNo || '',
    emailId: initialData?.emailId || verifiedGuest?.emailId || '',
    phoneNo: initialData?.phoneNo || verifiedGuest?.phoneNo || '',
    gender: initialData?.gender || verifiedGuest?.gender || 'Male',
    company: initialData?.company || '',
    companyGstin: initialData?.companyGstin || '',
    idProof: initialData?.idProof || verifiedGuest?.idProof || '',
    idProofNo: initialData?.idProofNo || verifiedGuest?.idProofNo || '',
    purposeOfVisit: initialData?.purposeOfVisit || '',
    marketSegment: initialData?.marketSegment || '',
    businessSource: initialData?.businessSource || '',
    bookingRefNo: initialData?.bookingRefNo || '',
    bookingRefDate: initialData?.bookingRefDate || '',
    arrivedFrom: initialData?.arrivedFrom || '',
    destination: initialData?.destination || '',
    discount: initialData?.discount || '0',
    billingInstruction: initialData?.billingInstruction || '',
    remark: initialData?.remark || '',
  }));

  const [rooms, setRooms] = useState(() => initialData?.rooms || [initialRoomRow()]);
  const [activeTab, setActiveTab] = useState('guest');

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['bookingNo'],
    currentId: initialData?.id,
    mode
  });

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const calculateRowAmounts = (row) => {
    const rateVal = parseFloat(row.rate) || 0;
    const daysVal = parseFloat(row.days) || 0;
    const roomsVal = parseFloat(row.noOfRooms) || 1;
    const isTaxInc = row.taxInclusive === 'Yes';

    const subtotal = rateVal * daysVal * roomsVal;

    let taxable;
    let net;

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
        const updated = { ...r, [key]: val };

        // Auto-calculate departure date if arrival or days change
        if (key === 'arrivalDate' || key === 'days') {
          const daysNum = parseInt(updated.days) || 0;
          if (updated.arrivalDate && daysNum > 0) {
            const arr = new Date(updated.arrivalDate);
            const dep = new Date(arr.setDate(arr.getDate() + daysNum));
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
    if (!checkBeforeSave()) return;
    onSave({ ...form, rooms });
  };

  const sectionTitle = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0 6px', borderBottom: '2px solid var(--primary)', marginBottom: '8px' }}>
      <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)' }}>{title}</span>
    </div>
  );

  return (
    <div className="animate-in duration-200">

      {/* CSS Block to completely hide scrollbars inside the booking form and outer content area */}
      <style dangerouslySetInnerHTML={{
        __html: `
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
                <GuestDetailsSection
                  form={form}
                  set={set}
                  setForm={setForm}
                  sectionTitle={sectionTitle}
                />
                <AddressDetailsSection
                  form={form}
                  set={set}
                  setForm={setForm}
                  sectionTitle={sectionTitle}
                />
              </div>

              {/* RIGHT COLUMN: Market & Source + Reference & Remarks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <MarketSourceSection
                  form={form}
                  set={set}
                  setForm={setForm}
                  sectionTitle={sectionTitle}
                />
                <RemarksSection
                  form={form}
                  set={set}
                  sectionTitle={sectionTitle}
                />
              </div>

            </div>
          )}

          {/* TAB 2: ROOM INFORMATION */}
          {activeTab === 'room' && (
            <RoomGridSection
              form={form}
              rooms={rooms}
              setRoom={setRoom}
              addRoom={addRoom}
              removeRoom={removeRoom}
              sectionTitle={sectionTitle}
            />
          )}
        </div>

        {/* FOOTER ACTION BUTTONS */}
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

export default BookingForm;
