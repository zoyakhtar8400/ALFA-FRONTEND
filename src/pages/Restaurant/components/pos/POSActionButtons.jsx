import React from 'react';

const POSActionButtons = ({
  onSave,
  onSaveAndPrint,
  onSaveAndEBill,
  onKOT,
  onKOTAndPrint,
  onHold,
  isNC = false
}) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '6px',
      padding: '6px 10px',
      background: '#f8fafc',
      borderTop: '1px solid #e2e8f0'
    }}>
      {/* Primary red buttons */}
      <button
        type="button"
        disabled={isNC}
        onClick={onSave}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '6px 10px', height: '32px', borderRadius: '6px',
          background: isNC ? '#e2e8f0' : '#991b1b',
          color: isNC ? '#94a3b8' : '#ffffff',
          fontWeight: 800, fontSize: '0.72rem', border: 'none',
          cursor: isNC ? 'not-allowed' : 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => { if (!isNC) e.currentTarget.style.background = '#7f1d1d'; }}
        onMouseLeave={e => { if (!isNC) e.currentTarget.style.background = '#991b1b'; }}
      >
        <span>Save</span>
        <span style={{ background: isNC ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '1px 5px', fontSize: '9px', color: isNC ? '#94a3b8' : '#ffffff' }}>F5</span>
      </button>

      <button
        type="button"
        disabled={isNC}
        onClick={onSaveAndPrint}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '6px 10px', height: '32px', borderRadius: '6px',
          background: isNC ? '#e2e8f0' : '#991b1b',
          color: isNC ? '#94a3b8' : '#ffffff',
          fontWeight: 800, fontSize: '0.72rem', border: 'none',
          cursor: isNC ? 'not-allowed' : 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => { if (!isNC) e.currentTarget.style.background = '#7f1d1d'; }}
        onMouseLeave={e => { if (!isNC) e.currentTarget.style.background = '#991b1b'; }}
      >
        <span>Save & Print</span>
        <span style={{ background: isNC ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '1px 5px', fontSize: '9px', color: isNC ? '#94a3b8' : '#ffffff' }}>F6</span>
      </button>

      <button
        type="button"
        disabled={isNC}
        onClick={onSaveAndEBill}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '6px 10px', height: '32px', borderRadius: '6px',
          background: isNC ? '#e2e8f0' : '#991b1b',
          color: isNC ? '#94a3b8' : '#ffffff',
          fontWeight: 800, fontSize: '0.72rem', border: 'none',
          cursor: isNC ? 'not-allowed' : 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => { if (!isNC) e.currentTarget.style.background = '#7f1d1d'; }}
        onMouseLeave={e => { if (!isNC) e.currentTarget.style.background = '#991b1b'; }}
      >
        <span>Save & E-Bill</span>
        <span style={{ background: isNC ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '1px 5px', fontSize: '9px', color: isNC ? '#94a3b8' : '#ffffff' }}>F7</span>
      </button>

      {/* Secondary dark buttons */}
      <button
        type="button"
        onClick={onKOT}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '6px 10px', height: '32px', borderRadius: '6px', background: '#1f2937', color: '#ffffff',
          fontWeight: 800, fontSize: '0.72rem', border: 'none', cursor: 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#111827'}
        onMouseLeave={e => e.currentTarget.style.background = '#1f2937'}
      >
        <span>KOT</span>
        <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '1px 5px', fontSize: '9px' }}>F8</span>
      </button>

      <button
        type="button"
        onClick={onKOTAndPrint}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '6px 10px', height: '32px', borderRadius: '6px', background: '#1f2937', color: '#ffffff',
          fontWeight: 800, fontSize: '0.72rem', border: 'none', cursor: 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#111827'}
        onMouseLeave={e => e.currentTarget.style.background = '#1f2937'}
      >
        <span>KOT & Print</span>
        <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '1px 5px', fontSize: '9px' }}>F9</span>
      </button>

      {/* Hold button */}
      <button
        type="button"
        disabled={isNC}
        onClick={onHold}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '6px 10px', height: '32px', borderRadius: '6px',
          background: isNC ? '#cbd5e1' : '#475569',
          color: isNC ? '#94a3b8' : '#ffffff',
          fontWeight: 800, fontSize: '0.72rem', border: 'none',
          cursor: isNC ? 'not-allowed' : 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => { if (!isNC) e.currentTarget.style.background = '#334155'; }}
        onMouseLeave={e => { if (!isNC) e.currentTarget.style.background = '#475569'; }}
      >
        <span>Hold Draft</span>
        <span style={{ background: isNC ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '1px 5px', fontSize: '9px', color: isNC ? '#94a3b8' : '#ffffff' }}>F10</span>
      </button>
    </div>
  );
};

export default React.memo(POSActionButtons);
