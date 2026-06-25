// src/pages/FrontDesk/operation/checkout/CheckoutEntryForm.jsx
import React, { useState } from 'react';
import PageHeader from '../../../../components/common/PageHeader';
import CommonActionButtons from '../../../../components/common/CommonActionButtons';
import { FaUser, FaRegFileAlt, FaCreditCard, FaCalculator, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const BILL_COLS = ['Date', 'Particular', 'Room No', 'Base Amount', 'Gross Amount', 'Discount %', 'Discount', 'SGST', 'CGST', 'VAT', 'Received Amount'];
const PAY_COLS = ['Receipt No', 'Date', 'Pay Type', 'Amount'];

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

const SummaryRow = ({ label, value, bold }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '6px 0',
      borderBottom: '1px solid var(--border)',
      fontWeight: bold ? 700 : 400,
      color: bold ? 'var(--primary)' : 'var(--text-secondary)',
    }}
  >
    <span style={{ fontSize: '0.8rem' }}>{label}</span>
    <span style={{ fontSize: '0.85rem', fontFamily: 'monospace', fontWeight: bold ? 700 : 600 }}>₹ {value}</span>
  </div>
);

const CheckoutEntryForm = ({ mode, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    grcNo: initialData?.grcNo || '',
    billNo: initialData?.billNo || `BILL-${Math.floor(1000 + Math.random() * 9000)}`,
    checkoutDate: initialData?.checkoutDate || new Date().toISOString().split('T')[0],
    checkoutTime: initialData?.checkoutTime || '',
    guestName: initialData?.guestName || '',
    city: initialData?.city || '',
    companyName: initialData?.companyName || '',
    date: initialData?.date || new Date().toISOString().split('T')[0],
    noOfDayStay: initialData?.noOfDayStay || 1,
    roomNo: initialData?.roomNo || '',
    checkinDate: initialData?.checkinDate || '2026-06-21',
    checkinTime: initialData?.checkinTime || '12:00',
    paymentMode: initialData?.paymentMode || '',
    companyGstin: initialData?.companyGstin || '',
    // Tax Summary
    grossAmount: initialData?.grossAmount || '0.00',
    discount: initialData?.discount || '0.00',
    sgst: initialData?.sgst || '0.00',
    cgst: initialData?.cgst || '0.00',
    roundOff: initialData?.roundOff || '0.00',
    netAmount: initialData?.netAmount || '0.00',
    // Settlement
    roomSettlement: initialData?.roomSettlement || '0.00',
    netTotal: initialData?.netTotal || '0.00',
    advanceSettlement: initialData?.advanceSettlement || '0.00',
    balance: initialData?.balance || '0.00',
  });

  const [taxSummaryExpanded, setTaxSummaryExpanded] = useState(true);
  const [settlementSummaryExpanded, setSettlementSummaryExpanded] = useState(true);
  const [billDetailsExpanded, setBillDetailsExpanded] = useState(true);
  const [paymentDetailsExpanded, setPaymentDetailsExpanded] = useState(true);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const billData = [
    {
      date: '2026-06-20',
      particular: 'Room Charge',
      roomNo: '101',
      baseAmount: '3000',
      grossAmount: '3540',
      discountPct: '0',
      discount: '0',
      sgst: '270',
      cgst: '270',
      vat: '0',
      receivedAmount: '3540',
    },
  ];

  const payData = [
    { receiptNo: 'RCP-001', date: '2026-06-22', payType: 'Cash', amount: '3540' },
  ];

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

  const renderCollapsibleHeader = (icon, title, isExpanded, onToggle) => (
    <div
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        padding: '4px 6px',
        margin: '-2px -4px 6px -4px',
        borderRadius: '4px',
        borderBottom: '2px solid var(--primary)',
        transition: 'background-color 0.2s',
        userSelect: 'none'
      }}
      className="collapsible-header-hover"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', color: 'var(--primary)' }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--primary)' }}>{title}</span>
      </div>
      <span style={{ display: 'flex', alignItems: 'center', color: 'var(--primary)', fontSize: '0.85rem' }}>
        {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
      </span>
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
        .collapsible-header-hover:hover {
          background-color: var(--primary-light, rgba(79, 70, 229, 0.08)) !important;
        }
      `}} />

      <PageHeader
        title={mode === 'add' ? 'Checkout Entry' : 'Edit Checkout'}
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Checkout Entry', mode === 'add' ? 'Add' : 'Edit']}
        showBack
        onBack={onCancel}
        style={{ marginBottom: '8px' }}
      />

      {/* Colorful Top Control Bar */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'stretch', marginBottom: '12px', borderBottom: '1px solid var(--border)', padding: '0 8px 8px', width: '100%', boxSizing: 'border-box' }}>
        {/* Bill No - Purple */}
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
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Bill No</label>
          <div style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.2
          }}>{form.billNo}</div>
        </div>

        {/* Checkout Date - Cyan */}
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
          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Checkout Date</label>
          <input
            type="date"
            value={form.checkoutDate}
            onChange={set('checkoutDate')}
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
        
        {/* Top Split Sections: Guest Info & Payments vs Tax/Settlement/Bill Summaries */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: '10px', alignItems: 'start', marginBottom: '10px' }}>
          
          {/* Left Column: Guest & Stay Details + Payment Details Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Guest & Stay Details Card */}
            <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
              {sectionTitle(<FaUser />, 'Guest & Stay Details')}
              <div className="form-grid-2">
                <F 
                  label="GRC No" 
                  value={form.grcNo} 
                  onChange={set('grcNo')} 
                  placeholder="GRC number" 
                  inputStyle={{ fontWeight: 800, background: 'rgba(79, 70, 229, 0.08)', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                />
                <F 
                  label="Room No" 
                  value={form.roomNo} 
                  onChange={set('roomNo')} 
                  placeholder="Room number" 
                  inputStyle={{ fontWeight: 800, background: 'rgba(6, 182, 212, 0.08)', borderColor: '#0891b2', color: '#0891b2' }}
                />

                <F label="Guest Name" value={form.guestName} onChange={set('guestName')} placeholder="Guest name" />
                <F label="City" value={form.city} onChange={set('city')} placeholder="City" />

                <F label="Company Name" value={form.companyName} onChange={set('companyName')} placeholder="Company" />
                <F label="Company GSTIN" value={form.companyGstin} onChange={set('companyGstin')} placeholder="GST number" />

                <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <F label="Check-In Date" type="date" value={form.checkinDate} disabled readOnly />
                  <F label="Check-In Time" type="time" value={form.checkinTime} disabled readOnly />
                  <F label="Checkout Time" type="time" value={form.checkoutTime} onChange={set('checkoutTime')} />
                </div>

                <F label="No of Day Stay" type="number" value={form.noOfDayStay} disabled readOnly />
                <F label="Payment Mode">
                  <select className="form-select" value={form.paymentMode} onChange={set('paymentMode')} style={{ fontSize: '0.9rem', padding: '4px 8px', height: '34px' }}>
                    <option value="">Select Mode</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit">Credit</option>
                  </select>
                </F>
              </div>
            </div>

            {/* Payment Details Grid */}
            <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
              {renderCollapsibleHeader(<FaCreditCard />, 'Payment Details', paymentDetailsExpanded, () => setPaymentDetailsExpanded(!paymentDetailsExpanded))}
              {paymentDetailsExpanded && (
                <div className="animate-in fade-in duration-200" style={{ overflowX: 'auto', width: '100%', border: '1px solid var(--border)', borderRadius: '6px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid var(--border)' }}>
                    <thead>
                      <tr style={{ background: 'var(--primary-light)' }}>
                        {PAY_COLS.map((h) => (
                          <th key={h} style={{
                            padding: '8px 10px',
                            textAlign: 'left',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            fontSize: '0.72rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em',
                            border: '1px solid var(--border)'
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {payData.map((row, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(0, 0, 0, 0.015)' }}>
                          <td style={{ padding: '8px 10px', border: '1px solid var(--border)' }}>{row.receiptNo}</td>
                          <td style={{ padding: '8px 10px', border: '1px solid var(--border)' }}>{row.date}</td>
                          <td style={{ padding: '8px 10px', border: '1px solid var(--border)' }}>{row.payType}</td>
                          <td style={{ padding: '8px 10px', border: '1px solid var(--border)', fontWeight: 600 }}>₹{row.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Tax Summary, Settlement, and Bill Details Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Tax Summary Card */}
            <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
              {renderCollapsibleHeader(<FaCalculator />, 'Tax Summary', taxSummaryExpanded, () => setTaxSummaryExpanded(!taxSummaryExpanded))}
              {taxSummaryExpanded && (
                <div className="animate-in fade-in duration-200">
                  <SummaryRow label="Gross Amount" value={form.grossAmount} />
                  <SummaryRow label="Discount" value={form.discount} />
                  <SummaryRow label="SGST" value={form.sgst} />
                  <SummaryRow label="CGST" value={form.cgst} />
                  <SummaryRow label="Round Off" value={form.roundOff} />
                  <SummaryRow label="Net Amount" value={form.netAmount} bold />
                </div>
              )}
            </div>

            {/* Settlement Summary Card */}
            <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 14px' }}>
              {renderCollapsibleHeader(<FaCreditCard />, 'Settlement Summary', settlementSummaryExpanded, () => setSettlementSummaryExpanded(!settlementSummaryExpanded))}
              {settlementSummaryExpanded && (
                <div className="animate-in fade-in duration-200">
                  <SummaryRow label="Room Settlement" value={form.roomSettlement} />
                  <SummaryRow label="Net Total" value={form.netTotal} />
                  <SummaryRow label="Advance + Settlement" value={form.advanceSettlement} />
                  
                  {/* Highlighted Balance Card */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    boxShadow: '0 4px 10px rgba(244, 63, 94, 0.25)',
                    color: '#fff',
                    marginTop: '8px'
                  }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Balance</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>₹ {form.balance}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bill Details Grid */}
            <div style={{ background: 'var(--card-bg, #fff)', border: '1px solid var(--border)', borderRadius: '6px', padding: '8px 10px' }}>
              {renderCollapsibleHeader(<FaRegFileAlt />, 'Bill Details', billDetailsExpanded, () => setBillDetailsExpanded(!billDetailsExpanded))}
              {billDetailsExpanded && (
                <div className="animate-in fade-in duration-200" style={{ overflowX: 'auto', width: '100%', border: '1px solid var(--border)', borderRadius: '6px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', border: '1px solid var(--border)' }}>
                    <thead>
                      <tr style={{ background: 'var(--primary-light)' }}>
                        {BILL_COLS.map((h) => (
                          <th key={h} style={{
                            padding: '4px 6px',
                            textAlign: 'left',
                            fontWeight: 700,
                            color: 'var(--primary)',
                            fontSize: '0.72rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.02em',
                            border: '1px solid var(--border)'
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {billData.map((row, idx) => (
                        <tr key={idx} style={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(0, 0, 0, 0.015)' }}>
                          <td style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>{row.date}</td>
                          <td style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>{row.particular}</td>
                          <td style={{ padding: '4px 6px', border: '1px solid var(--border)', textAlign: 'center' }}>{row.roomNo}</td>
                          <td style={{ padding: '4px 6px', border: '1px solid var(--border)', fontWeight: 600 }}>₹{row.baseAmount}</td>
                          <td style={{ padding: '4px 6px', border: '1px solid var(--border)', fontWeight: 600 }}>₹{row.grossAmount}</td>
                          <td style={{ padding: '4px 6px', border: '1px solid var(--border)', textAlign: 'center' }}>{row.discountPct}%</td>
                          <td style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>₹{row.discount}</td>
                          <td style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>₹{row.sgst}</td>
                          <td style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>₹{row.cgst}</td>
                          <td style={{ padding: '4px 6px', border: '1px solid var(--border)' }}>₹{row.vat}</td>
                          <td style={{ padding: '4px 6px', border: '1px solid var(--border)', fontWeight: 600 }}>₹{row.receivedAmount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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

export default CheckoutEntryForm;
