import React from 'react';
import { FaTimes, FaPrint } from 'react-icons/fa';

const InvoicePreviewModal = ({ isOpen, onClose, htmlContent, onPrint }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(3px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 99999,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: '#ffffff',
        width: '420px',
        maxWidth: '92vw',
        maxHeight: '90vh',
        borderRadius: '16px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.35)',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 20px', background: '#0e7490', color: '#ffffff'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.3px', color: '#ffffff' }}>
            🧾 Bill Print Preview
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ffffff' }}
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* Receipt Content Area */}
        <div style={{ flex: 1, backgroundColor: '#f1f5f9', padding: '16px', overflowY: 'auto' }}>
          <div style={{
            width: '100%',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            borderRadius: '8px',
            padding: '12px',
            boxSizing: 'border-box'
          }}>
            <div
              dangerouslySetInnerHTML={{ __html: htmlContent }}
              style={{ width: '100%', overflow: 'hidden' }}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{
          padding: '14px 20px', background: '#ffffff', borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'flex-end', gap: '12px'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1',
              background: '#ffffff', color: '#475569', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onPrint}
            style={{
              padding: '9px 22px', borderRadius: '8px', border: 'none',
              background: 'linear-gradient(135deg, #0e7490, #0891b2)', color: '#ffffff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 10px rgba(14, 116, 144, 0.3)'
            }}
          >
            <FaPrint size={14} /> Print Bill
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreviewModal;
