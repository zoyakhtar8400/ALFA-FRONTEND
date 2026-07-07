import React from 'react';
import { FaPrint, FaFilePdf, FaFileExcel } from 'react-icons/fa';

const ActionButtons = ({ onPrint, onPDF, onExcel }) => {
  return (
    <div style={{
      gridColumn: '1 / -1',
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-start',
      alignItems: 'center',
      marginTop: '12px',
      borderTop: '1px solid #f1f5f9',
      paddingTop: '16px',
      flexWrap: 'wrap'
    }}>
      <button
        type="button"
        onClick={onPrint}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800,
          background: '#ffffff', border: '1px solid #cbd5e1', color: '#475569',
          cursor: 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
        onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
      >
        <FaPrint size={11} /> Print
      </button>

      <button
        type="button"
        onClick={onPDF}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800,
          background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.15)', color: '#EF4444',
          cursor: 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
      >
        <FaFilePdf size={11} /> Export PDF
      </button>

      <button
        type="button"
        onClick={onExcel}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 20px', borderRadius: '10px', fontSize: '0.82rem', fontWeight: 800,
          background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', color: '#10B981',
          cursor: 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.12)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(16, 185, 129, 0.05)'}
      >
        <FaFileExcel size={11} /> Export Excel
      </button>
    </div>
  );
};

export default ActionButtons;
