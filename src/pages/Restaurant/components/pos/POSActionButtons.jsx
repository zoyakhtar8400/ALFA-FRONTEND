import React from 'react';

const POSActionButtons = ({
  onSave,
  onSaveAndPrint,
  onSaveAndEBill,
  onKOT,
  onKOTAndPrint,
  onHold
}) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '8px',
      padding: '12px 16px',
      background: '#f8fafc',
      borderTop: '1px solid #e2e8f0'
    }}>
      {/* Primary red buttons */}
      <button
        type="button"
        onClick={onSave}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 12px', borderRadius: '8px', background: '#991b1b', color: '#ffffff',
          fontWeight: 800, fontSize: '0.74rem', border: 'none', cursor: 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#7f1d1d'}
        onMouseLeave={e => e.currentTarget.style.background = '#991b1b'}
      >
        <span>Save</span>
        <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '2px 6px', fontSize: '9px' }}>F5</span>
      </button>

      <button
        type="button"
        onClick={onSaveAndPrint}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 12px', borderRadius: '8px', background: '#991b1b', color: '#ffffff',
          fontWeight: 800, fontSize: '0.74rem', border: 'none', cursor: 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#7f1d1d'}
        onMouseLeave={e => e.currentTarget.style.background = '#991b1b'}
      >
        <span>Save & Print</span>
        <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '2px 6px', fontSize: '9px' }}>F6</span>
      </button>

      <button
        type="button"
        onClick={onSaveAndEBill}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 12px', borderRadius: '8px', background: '#991b1b', color: '#ffffff',
          fontWeight: 800, fontSize: '0.74rem', border: 'none', cursor: 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#7f1d1d'}
        onMouseLeave={e => e.currentTarget.style.background = '#991b1b'}
      >
        <span>Save & E-Bill</span>
        <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '2px 6px', fontSize: '9px' }}>F7</span>
      </button>

      {/* Secondary dark buttons */}
      <button
        type="button"
        onClick={onKOT}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 12px', borderRadius: '8px', background: '#1f2937', color: '#ffffff',
          fontWeight: 800, fontSize: '0.74rem', border: 'none', cursor: 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#111827'}
        onMouseLeave={e => e.currentTarget.style.background = '#1f2937'}
      >
        <span>KOT</span>
        <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '2px 6px', fontSize: '9px' }}>F8</span>
      </button>

      <button
        type="button"
        onClick={onKOTAndPrint}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 12px', borderRadius: '8px', background: '#1f2937', color: '#ffffff',
          fontWeight: 800, fontSize: '0.74rem', border: 'none', cursor: 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#111827'}
        onMouseLeave={e => e.currentTarget.style.background = '#1f2937'}
      >
        <span>KOT & Print</span>
        <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '2px 6px', fontSize: '9px' }}>F9</span>
      </button>

      {/* Hold button */}
      <button
        type="button"
        onClick={onHold}
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 12px', borderRadius: '8px', background: '#ffffff', color: '#374151',
          fontWeight: 800, fontSize: '0.74rem', border: '1px solid #d1d5db', cursor: 'pointer', transition: 'all 0.15s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
        onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
      >
        <span>Hold Draft</span>
        <span style={{ background: 'rgba(0,0,0,0.06)', color: '#4b5563', borderRadius: '4px', padding: '2px 6px', fontSize: '9px' }}>F10</span>
      </button>
    </div>
  );
};

export default React.memo(POSActionButtons);
