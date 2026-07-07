import { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import CommonModal from '../../../../components/common/CommonModal';
import Booking from '../booking/Booking';
import RoomEnquiry from '../roomEnquiry/RoomEnquiry';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';

// Import local sections
import StayInfoSection from './components/StayInfoSection';
import GuestInfoSection from './components/GuestInfoSection';
import BillingInfoSection from './components/BillingInfoSection';
import WalkinRoomGridSection from './components/WalkinRoomGridSection';

const WalkinCheckinForm = ({ mode, initialData, onSave, onCancel, showToast, existingRecords = [] }) => {
  const [form, setForm] = useState(() => {
    const grcVal = initialData?.grcNo || `GRC-${Math.floor(1000 + Math.random() * 9000)}`;
    const checkinStr = initialData?.checkinDate || new Date().toISOString().split('T')[0];
    const daysNum = initialData?.days || 1;
    const checkoutVal = initialData?.expectedCheckoutDate || (() => {
      const checkin = new Date(checkinStr);
      if (!isNaN(checkin)) {
        const checkout = new Date(checkin.getTime() + daysNum * 24 * 60 * 60 * 1000);
        return checkout.toISOString().split('T')[0];
      }
      return '';
    })();

    return {
      grcNo: grcVal,
      date: initialData?.date || new Date().toISOString().split('T')[0],
      checkinDate: checkinStr,
      days: daysNum,
      time: initialData?.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      expectedCheckoutDate: checkoutVal,
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
    };
  });

  const [rooms, setRooms] = useState(() => initialData?.rooms || [
    { roomNo: '', plan: '', adults: 1, children: 0, rate: '', taxInclusive: 'Yes', leader: 'Yes' }
  ]);

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['idProofNo'],
    currentId: initialData?.id,
    mode
  });

  // Modal display states
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [roomInfoExpanded, setRoomInfoExpanded] = useState(true);

  // Auto calculate expected checkout date on change directly
  const handleCheckinDateChange = (val) => {
    const checkin = new Date(val);
    const daysNum = parseInt(form.days) || 1;
    let checkoutStr = '';
    if (!isNaN(checkin)) {
      const checkout = new Date(checkin.getTime() + daysNum * 24 * 60 * 60 * 1000);
      checkoutStr = checkout.toISOString().split('T')[0];
    }
    setForm(f => ({
      ...f,
      checkinDate: val,
      expectedCheckoutDate: checkoutStr
    }));
  };

  const handleDaysChange = (val) => {
    const checkin = new Date(form.checkinDate);
    const daysNum = parseInt(val) || 1;
    let checkoutStr = '';
    if (!isNaN(checkin)) {
      const checkout = new Date(checkin.getTime() + daysNum * 24 * 60 * 60 * 1000);
      checkoutStr = checkout.toISOString().split('T')[0];
    }
    setForm(f => ({
      ...f,
      days: val,
      expectedCheckoutDate: checkoutStr
    }));
  };

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
    if (!checkBeforeSave()) return;
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
              onChange={e => handleCheckinDateChange(e.target.value)}
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
        <div style={{ display: 'grid', gridTemplateColumns: '4fr 6fr', gap: '10px', alignItems: 'start', marginBottom: '10px' }}>

          {/* LEFT COLUMN: Stay & GRC + Guest Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <StayInfoSection
              form={form}
              set={set}
              handleDaysChange={handleDaysChange}
              sectionTitle={sectionTitle}
            />
            <GuestInfoSection
              form={form}
              set={set}
              setForm={setForm}
              sectionTitle={sectionTitle}
            />
          </div>

          {/* RIGHT COLUMN: Marketing & Reference + Room Information */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <BillingInfoSection
              form={form}
              set={set}
              setForm={setForm}
              sectionTitle={sectionTitle}
            />
            <WalkinRoomGridSection
              rooms={rooms}
              setRoom={setRoom}
              addRoom={addRoom}
              removeRoom={removeRoom}
              roomInfoExpanded={roomInfoExpanded}
              setRoomInfoExpanded={setRoomInfoExpanded}
              sectionTitle={sectionTitle}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <CommonActionButtons
          onSave={handleSubmit}
          onCancel={onCancel}
          saveText={mode === 'add' ? 'Save' : 'Update'}
          saveDisabled={isDuplicate}
        />
        <DuplicateModal />
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
