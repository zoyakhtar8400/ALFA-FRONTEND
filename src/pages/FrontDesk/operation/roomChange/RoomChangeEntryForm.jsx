import { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { FaHistory, FaExchangeAlt } from 'react-icons/fa';
import useDuplicateValidation from '../../../../hooks/useDuplicateValidation';

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

const RoomChangeEntryForm = ({ mode, initialData, onSave, onCancel, existingRecords = [] }) => {
  const [form, setForm] = useState(() => ({
    // Old Room
    voucherNo: initialData?.voucherNo || `RCH-${Math.floor(1000 + Math.random() * 9000)}`,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    grcNo: initialData?.grcNo || '',
    roomNo: initialData?.roomNo || '',
    guestName: initialData?.guestName || '',
    adult: initialData?.adult || 1,
    child: initialData?.child || 0,
    plan: initialData?.plan || '',
    rate: initialData?.rate || '',
    taxInclusive: initialData?.taxInclusive || 'No',
    // New Room
    newRoom: initialData?.newRoom || '',
    changeDate: initialData?.changeDate || new Date().toISOString().split('T')[0],
    changeTime: initialData?.changeTime || '',
    newPlan: initialData?.newPlan || '',
    newAdult: initialData?.newAdult || 1,
    newChild: initialData?.newChild || 0,
    newRate: initialData?.newRate || '',
    newTaxInclusive: initialData?.newTaxInclusive || 'No',
    discountPercent: initialData?.discountPercent || '',
    reason: initialData?.reason || '',
  }));

  const { isDuplicate, DuplicateModal, checkBeforeSave } = useDuplicateValidation({
    existingRecords,
    currentFormData: form,
    uniqueFields: ['voucherNo'],
    currentId: initialData?.id,
    mode
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!checkBeforeSave()) return;
    onSave(form);
  };

  const sectionTitle = (icon, title) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '2px 0 4px', borderBottom: '2px solid var(--primary)', marginBottom: '8px' }}>
      <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>{icon}</span>
      <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary)' }}>{title}</span>
    </div>
  );

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
        title={mode === 'add' ? 'Room Change Entry' : 'Edit Room Change'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Room Change Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack onBack={onCancel}
        style={{ marginBottom: '8px' }}
      />

      {/* Colorful Top Control Bar */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch', marginBottom: '12px', borderBottom: '1px solid var(--border)', padding: '0 8px 8px', width: '100%', boxSizing: 'border-box' }}>
        {/* Voucher No - Purple */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: 'linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)',
          borderRadius: '8px',
          padding: '8px 14px',
          boxShadow: '0 4px 12px rgba(109, 40, 217, 0.35)',
          flex: 1,
          justifyContent: 'center'
        }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Voucher No</label>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.2
          }}>{form.voucherNo}</div>
        </div>

        {/* Date - Cyan */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
          borderRadius: '8px',
          padding: '8px 14px',
          boxShadow: '0 4px 12px rgba(6, 182, 212, 0.35)',
          flex: 1,
          justifyContent: 'center'
        }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date</label>
          <input
            type="date"
            value={form.date}
            onChange={set('date')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '1.1rem',
              fontWeight: 800,
              outline: 'none',
              height: '30px',
              width: '100%',
              cursor: 'pointer'
            }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '0 8px 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'start', marginBottom: '10px' }}>
          
          {/* Left Column: Old Room Information */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
            {sectionTitle(<FaHistory />, 'Old Room Information')}
            <div className="form-grid-2">
              <F label="GRC No" value={form.grcNo} onChange={set('grcNo')} placeholder="GRC number" />
              <F label="Room No" value={form.roomNo} onChange={set('roomNo')} placeholder="Current room" />
              
              <div style={{ gridColumn: 'span 2' }}>
                <F label="Guest Name" value={form.guestName} onChange={set('guestName')} placeholder="Guest name" />
              </div>

              <F label="Adult" type="number" min="1" value={form.adult} onChange={set('adult')} />
              <F label="Child" type="number" min="0" value={form.child} onChange={set('child')} />
              
              <F label="Plan">
                <select className="form-select" value={form.plan} onChange={set('plan')} style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }}>
                  <option value="">Select Plan</option>
                  <option value="EP">EP (Room Only)</option>
                  <option value="CP">CP (Bed & Breakfast)</option>
                  <option value="MAP">MAP (Half Board)</option>
                  <option value="AP">AP (Full Board)</option>
                </select>
              </F>
              
              <F label="Rate (₹)" value={form.rate} readOnly disabled placeholder="Auto-filled" />
              
              <div style={{ gridColumn: 'span 2' }}>
                <F label="Tax Inclusive">
                  <select className="form-select" value={form.taxInclusive} onChange={set('taxInclusive')} style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }}>
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </F>
              </div>
            </div>
          </div>

          {/* Right Column: New Room Information */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
            {sectionTitle(<FaExchangeAlt />, 'New Room Information')}
            <div className="form-grid-2">
              <F label="New Room" required value={form.newRoom} onChange={set('newRoom')} placeholder="New room number" />
              <F label="Change Date" type="date" value={form.changeDate} onChange={set('changeDate')} />
              <F label="Change Time" type="time" value={form.changeTime} onChange={set('changeTime')} />
              
              <F label="New Plan">
                <select className="form-select" value={form.newPlan} onChange={set('newPlan')} style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }}>
                  <option value="">Select Plan</option>
                  <option value="EP">EP (Room Only)</option>
                  <option value="CP">CP (Bed & Breakfast)</option>
                  <option value="MAP">MAP (Half Board)</option>
                  <option value="AP">AP (Full Board)</option>
                </select>
              </F>

              <F label="Adult" type="number" min="1" value={form.newAdult} onChange={set('newAdult')} />
              <F label="Child" type="number" min="0" value={form.newChild} onChange={set('newChild')} />
              <F label="New Rate (₹)" type="number" min="0" step="0.01" value={form.newRate} onChange={set('newRate')} placeholder="0.00" />
              
              <F label="Tax Inclusive">
                <select className="form-select" value={form.newTaxInclusive} onChange={set('newTaxInclusive')} style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </F>

              <div style={{ gridColumn: 'span 2' }}>
                <F label="Discount %" type="number" min="0" max="100" step="0.01" value={form.discountPercent} onChange={set('discountPercent')} placeholder="0.00" />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <F label="Reason">
                  <textarea className="form-textarea" rows={1} value={form.reason} onChange={set('reason')} placeholder="Reason for room change..." style={{ fontSize: '0.9rem', padding: '6px 8px' }} />
                </F>
              </div>
            </div>
          </div>

        </div>

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

export default RoomChangeEntryForm;
