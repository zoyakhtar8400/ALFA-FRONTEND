import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

const SettlePaymentTab = ({
  fromTableId,
  discountPercent,
  setDiscountPercent,
  paymentMethod,
  setPaymentMethod,
  splitCash,
  setSplitCash,
  splitCard,
  setSplitCard,
  splitUPI,
  setSplitUPI,
  getBillingSummary,
  executePaymentSettlement,
  showSettleSuccess,
}) => {
  if (!fromTableId) return <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Select a From Table first.</div>;

  const bill = getBillingSummary();
  const METHODS = ['Cash', 'Card', 'UPI', 'Wallet', 'Credit', 'Split'];

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Bill Summary */}
        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {[
            ['Subtotal:', `₹${bill.subtotal.toLocaleString('en-IN')}`, false],
            ['CGST/SGST (5%):', `₹${bill.gst.toLocaleString('en-IN')}`, false],
            ['Service Charge:', `₹${bill.serviceCharge.toLocaleString('en-IN')}`, false],
          ].map(([label, val]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{label}</span><span style={{ fontWeight: 600 }}>{val}</span>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Discount (%):</span>
            <input
              type="number" min="0" max="90" value={discountPercent}
              onChange={(e) => setDiscountPercent(Math.min(90, Math.max(0, parseInt(e.target.value) || 0)))}
              style={{ width: '45px', padding: '2px', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #cbd5e1', paddingTop: '6px', marginTop: '4px', fontSize: '0.85rem', fontWeight: 800 }}>
            <span>GRAND TOTAL:</span>
            <span style={{ color: '#0d9488' }}>₹{bill.grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Payment methods */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {METHODS.map(m => (
            <button key={m} onClick={() => setPaymentMethod(m)}
              style={{ padding: '6px 10px', borderRadius: '4px', border: '1px solid #cbd5e1', background: paymentMethod === m ? '#0f172a' : '#fff', color: paymentMethod === m ? '#fff' : '#475569', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
            >{m}</button>
          ))}
        </div>

        {/* Split inputs */}
        {paymentMethod === 'Split' && (
          <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
            {[['Cash', splitCash, setSplitCash], ['Card', splitCard, setSplitCard], ['UPI', splitUPI, setSplitUPI]].map(([label, val, setter]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{label} Payment:</span>
                <input type="number" placeholder="₹0" value={val} onChange={(e) => setter(e.target.value)}
                  style={{ width: '80px', padding: '3px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
            ))}
          </div>
        )}

        <button
          onClick={executePaymentSettlement}
          style={{ width: '100%', padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}
        >
          Confirm Settlement & Reset Table
        </button>
      </div>

      {/* Success overlay */}
      {showSettleSuccess && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.85)', zIndex: 99999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
          <FaCheckCircle size={64} color="#10b981" />
          <h2 style={{ marginTop: '20px', fontSize: '1.4rem', fontWeight: 800 }}>Payment Settled Successfully!</h2>
          <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: '6px' }}>Resetting Table & returning to Display Grid...</p>
        </div>
      )}

      <style>{`@keyframes scaleUp { 0%{transform:scale(0.5);opacity:0} 100%{transform:scale(1);opacity:1} }`}</style>
    </>
  );
};

export default SettlePaymentTab;
