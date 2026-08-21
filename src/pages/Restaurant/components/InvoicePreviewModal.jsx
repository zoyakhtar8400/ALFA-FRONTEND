import React from 'react';
import { FaTimes, FaPrint } from 'react-icons/fa';

const InvoicePreviewModal = ({ isOpen, onClose, htmlContent, onPrint }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: '#fff',
        width: '400px',
        maxWidth: '90vw',
        height: '80vh',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b' }}>Billing Preview</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Iframe Content */}
        <div style={{ flex: 1, backgroundColor: '#f1f5f9', padding: '16px', overflow: 'hidden' }}>
          <div style={{
            width: '100%', height: '100%', backgroundColor: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderRadius: '4px', overflow: 'hidden'
          }}>
            <iframe
              srcDoc={htmlContent}
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Invoice Preview"
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 16px', background: '#fff', borderTop: '1px solid #e2e8f0',
          display: 'flex', justifyContent: 'flex-end', gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1',
              background: '#fff', color: '#475569', fontWeight: '600', cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onPrint}
            style={{
              padding: '8px 16px', borderRadius: '6px', border: 'none',
              background: '#0e7490', color: '#fff', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            <FaPrint /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreviewModal;
