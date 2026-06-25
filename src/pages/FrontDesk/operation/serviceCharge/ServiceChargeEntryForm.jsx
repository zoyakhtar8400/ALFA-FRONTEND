import { handleEnterNavigation } from '../../../../utils/keyboardNavigation';
import React, { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { FaConciergeBell, FaHistory } from 'react-icons/fa';

const TABLE_COLS = ['Voucher No', 'Date', 'Room No', 'Service Name', 'CGST Amount'];

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

const ServiceChargeEntryForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    voucherNo: initialData?.voucherNo || `SVC-${Math.floor(1000 + Math.random() * 9000)}`,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    roomNo: initialData?.roomNo || '',
    guestName: initialData?.guestName || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    serviceName: initialData?.serviceName || '',
    amount: initialData?.amount || '',
    taxInclusive: initialData?.taxInclusive || 'No',
    remark: initialData?.remark || '',
  });

  const [charges] = useState([
    { voucherNo: 'SVC-1001', date: '2026-06-20', roomNo: '101', serviceName: 'Laundry', cgstAmount: '18.00' },
    { voucherNo: 'SVC-1002', date: '2026-06-21', roomNo: '205', serviceName: 'Room Service', cgstAmount: '45.00' },
  ]);

  const [historyExpanded, setHistoryExpanded] = useState(true);

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
        title={mode === 'add' ? 'Service Charge Entry' : 'Edit Service Charge'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Service Charge Entry', mode === 'add' ? 'Add' : 'Edit']}
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
            padding: '2px 0',
            width: '100%'
          }}>
            {form.voucherNo}
          </div>
        </div>

        {/* Date - Cyan */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          background: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
          borderRadius: '8px',
          padding: '8px 14px',
          boxShadow: '0 4px 12px rgba(8, 145, 178, 0.35)',
          flex: 1,
          justifyContent: 'center'
        }}>
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date <span style={{ color: '#fde68a' }}>*</span></label>
          <input
            type="date"
            value={form.date}
            onChange={set('date')}
            required
            style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              background: 'rgba(255,255,255,0.22)',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '5px',
              color: '#fff',
              padding: '4px 10px',
              height: '36px',
              width: '100%',
              colorScheme: 'dark',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
      </div>

      <form onKeyDown={handleEnterNavigation} onSubmit={handleSubmit} style={{ padding: '0 8px 4px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '4fr 6fr', gap: '12px', alignItems: 'start', marginBottom: '12px' }}>
          
          {/* Left Column: Service Charge Details Block */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
            {sectionTitle(<FaConciergeBell />, 'Service Charge Details')}
            <div className="form-grid-2" style={{ gap: '6px 8px' }}>
              <F label="Room No" value={form.roomNo} onChange={set('roomNo')} placeholder="Room number" />
              <F label="Guest Name" value={form.guestName} onChange={set('guestName')} placeholder="Guest name" />
              
              <div style={{ gridColumn: 'span 2' }}>
                <F label="Address" value={form.address} onChange={set('address')} placeholder="Full address" />
              </div>
              
              <F label="City" value={form.city} onChange={set('city')} placeholder="City" />
              
              <F label="Service Name" required>
                <select className="form-select" value={form.serviceName} onChange={set('serviceName')} required style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}>
                  <option value="">Select Service</option>
                  <option value="Laundry">Laundry</option>
                  <option value="Room Service">Room Service</option>
                  <option value="Mini Bar">Mini Bar</option>
                  <option value="Spa">Spa</option>
                  <option value="Telephone">Telephone</option>
                  <option value="Internet">Internet</option>
                  <option value="Transport">Transport</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </F>

              <F label="Amount (₹)" type="number" required value={form.amount} onChange={set('amount')} placeholder="0.00" inputStyle={{ step: '0.01', min: '0' }} />
              
              <F label="Tax Inclusive">
                <select className="form-select" value={form.taxInclusive} onChange={set('taxInclusive')} style={{ fontSize: '0.9rem', padding: '4px 6px', height: '34px' }}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </F>

              <div style={{ gridColumn: 'span 2' }}>
                <F label="Remark">
                  <textarea className="form-textarea" rows={1} value={form.remark} onChange={set('remark')} placeholder="Remarks..." style={{ fontSize: '0.9rem', padding: '6px 8px' }} />
                </F>
              </div>
            </div>
          </div>

          {/* Right Column: Service Charge History Block */}
          <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
            <div 
              onClick={() => setHistoryExpanded(prev => !prev)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
            >
              {sectionTitle(<FaHistory />, 'Service Charge History')}
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, paddingBottom: '4px' }}>
                {historyExpanded ? '▲ Collapse' : '▼ Expand'}
              </div>
            </div>

            <div style={{
              maxHeight: historyExpanded ? '1000px' : '0px',
              opacity: historyExpanded ? 1 : 0,
              overflowY: 'hidden',
              overflowX: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              marginTop: historyExpanded ? '10px' : '0px'
            }}>
              <div style={{ overflowX: 'auto', width: '100%', border: '1px solid var(--border)', borderRadius: '6px' }}>
                <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid var(--border)' }}>
                  <thead>
                    <tr style={{ background: 'var(--primary-light)' }}>
                      {TABLE_COLS.map((h, idx) => {
                        const widths = ['22%', '20%', '16%', '22%', '20%'];
                        return (
                          <th key={h} style={{ 
                            padding: '8px 8px', 
                            width: widths[idx],
                            textAlign: 'left', 
                            fontWeight: 700, 
                            color: 'var(--primary)', 
                            fontSize: '0.72rem', 
                            textTransform: 'uppercase', 
                            letterSpacing: '0.02em', 
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            border: '1px solid var(--border)'
                          }}>
                            {h}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {charges.map((row, idx) => (
                      <tr key={idx} style={{ 
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(0, 0, 0, 0.015)'
                      }}>
                        <td style={{ padding: '8px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', border: '1px solid var(--border)' }}>{row.voucherNo}</td>
                        <td style={{ padding: '8px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', border: '1px solid var(--border)' }}>{row.date}</td>
                        <td style={{ padding: '8px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', border: '1px solid var(--border)' }}>{row.roomNo}</td>
                        <td style={{ padding: '8px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', border: '1px solid var(--border)' }}>{row.serviceName}</td>
                        <td style={{ padding: '8px 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600, border: '1px solid var(--border)' }}>₹{row.cgstAmount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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

export default ServiceChargeEntryForm;
