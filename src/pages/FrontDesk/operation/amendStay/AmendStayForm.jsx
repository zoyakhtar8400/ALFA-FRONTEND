import React, { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { FaCalendarAlt, FaBed } from 'react-icons/fa';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';

const F = ({ label, type = 'text', placeholder, required, disabled, children, value, onChange }) => (
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
        style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }}
      />
    )}
  </div>
);

const OCCUPANT_DB = [
  { grcNo: '119', guestName: 'PRAMOD MISHRA', roomNo: '104', departure: '2026-06-30' },
  { grcNo: '120', guestName: 'Sarah Wilson', roomNo: '201', departure: '2026-06-29' },
  { grcNo: '122', guestName: 'Robert Taylor', roomNo: '301', departure: '2026-07-05' },
  { grcNo: '125', guestName: 'ANSH', roomNo: '114', departure: '2026-07-02' },
  { grcNo: '128', guestName: 'John Smith', roomNo: '101', departure: '2026-07-01' }
];

const AmendStayForm = ({ mode, initialData, onSave, onCancel, existingRecords = [] }) => {
  const [form, setForm] = useState(() => {
    const qGrc = initialData?.grcNo || '';
    const qRoom = initialData?.roomNo || '';
    const found = OCCUPANT_DB.find(o => (qGrc && o.grcNo === qGrc) || (qRoom && o.roomNo === qRoom));

    return {
      grcNo: found?.grcNo || qGrc,
      guestName: found?.guestName || initialData?.guestName || '',
      roomNo: found?.roomNo || qRoom || '',
      originalDeparture: found?.departure || initialData?.originalDeparture || '2026-06-30',
      amendedDeparture: initialData?.amendedDeparture || new Date().toISOString().split('T')[0],
      noOfExtraNights: initialData?.noOfExtraNights || 1,
      reason: initialData?.reason || '',
      status: initialData?.status || 'Pending',
      remarks: initialData?.remarks || '',
      active: initialData?.active || 'Yes',
    };
  });

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['grcNo'],
    currentId: initialData?.id,
    mode
  });

  // Sync state when initialData changes (dynamic dashboard lookup)
  React.useEffect(() => {
    if (initialData) {
      const qGrc = initialData.grcNo || '';
      const qRoom = initialData.roomNo || initialData.roomCode || '';
      const found = OCCUPANT_DB.find(o => (qGrc && o.grcNo === qGrc) || (qRoom && o.roomNo === qRoom));
      
      setForm(prev => ({
        ...prev,
        grcNo: found?.grcNo || qGrc,
        guestName: found?.guestName || initialData.guestName || '',
        roomNo: found?.roomNo || qRoom || '',
        originalDeparture: found?.departure || initialData.originalDeparture || '2026-06-30',
      }));
    }
  }, [initialData]);

  const set = (key) => (e) => {
    const val = e.target.value;
    setForm(f => {
      const updated = { ...f, [key]: val };
      if (key === 'grcNo' || key === 'roomNo') {
        const found = OCCUPANT_DB.find(o => (key === 'grcNo' ? o.grcNo === val : o.roomNo === val));
        if (found) {
          return {
            ...updated,
            grcNo: found.grcNo,
            roomNo: found.roomNo,
            guestName: found.guestName,
            originalDeparture: found.departure,
          };
        }
      }
      return updated;
    });
  };

  const sectionTitle = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0 4px', borderBottom: '2px solid var(--primary)', marginBottom: '8px' }}>
      <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary)' }}>{title}</span>
    </div>
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkBeforeSave()) return;
    onSave(form);
  };

  return (
    <div className="animate-in duration-200" style={{ padding: '0 8px' }}>
      <PageHeader
        title={mode === 'add' ? 'Amend Stay Entry' : 'Edit Amend Stay'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Amend Stay Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
        style={{ marginBottom: '8px' }}
      />

      <form onSubmit={handleSubmit} style={{ padding: '0 8px 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'start' }}>

          {/* Left: Guest & Stay Info */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px 16px' }}>
            {sectionTitle(<FaBed />, 'Guest & Stay Details')}
            <div className="form-grid-2">
              <F label="GRC No" value={form.grcNo} onChange={set('grcNo')} placeholder="e.g. GRC-119" required
                inputStyle={{ fontWeight: 800, background: 'rgba(79,70,229,0.08)', borderColor: 'var(--primary)', color: 'var(--primary)' }}
              />
              <F label="Room No" value={form.roomNo} onChange={set('roomNo')} placeholder="Room number" required
                inputStyle={{ fontWeight: 800, background: 'rgba(6,182,212,0.08)', borderColor: '#0d9488', color: '#0d9488' }}
              />
              <F label="Guest Name" value={form.guestName} onChange={set('guestName')} placeholder="Guest name" />
              <F label="Original Departure" type="date" value={form.originalDeparture} disabled />
            </div>
          </div>

          {/* Right: Amendment Details */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px 16px' }}>
            {sectionTitle(<FaCalendarAlt />, 'Amendment Details')}
            <div className="form-grid-2">
              <F label="Amended Departure Date" type="date" value={form.amendedDeparture} onChange={set('amendedDeparture')} required />
              <F label="Extra Nights" type="number" value={form.noOfExtraNights} onChange={set('noOfExtraNights')} />
              <F label="Status">
                <select className="form-select" value={form.status} onChange={set('status')} style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }}>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </F>
              <F label="Active">
                <select className="form-select" value={form.active} onChange={set('active')} style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }}>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </F>
              <div style={{ gridColumn: 'span 2' }}>
                <F label="Reason for Amendment">
                  <textarea
                    className="form-input"
                    value={form.reason}
                    onChange={set('reason')}
                    placeholder="Enter reason for amending the stay..."
                    rows={2}
                    style={{ fontSize: '0.9rem', padding: '6px 8px', resize: 'vertical' }}
                  />
                </F>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <F label="Remarks">
                  <textarea
                    className="form-input"
                    value={form.remarks}
                    onChange={set('remarks')}
                    placeholder="Additional remarks..."
                    rows={2}
                    style={{ fontSize: '0.9rem', padding: '6px 8px', resize: 'vertical' }}
                  />
                </F>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <CommonActionButtons
            onSave={handleSubmit}
            onCancel={onCancel}
            saveText={mode === 'add' ? 'Save' : 'Update'}
            saveDisabled={isDuplicate}
          />
        </div>
        <DuplicateModal />
      </form>
    </div>
  );
};

export default AmendStayForm;
