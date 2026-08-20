import React from 'react';

const POSActionButtons = ({
  onSave,
  onBilling,
  onKOT,
  onKOTAndPrint,
  isNC = false,
  isViewMode = false,
  isBillingDesk = false
}) => {
  const showAll = isBillingDesk;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: showAll ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
      gap: '8px',
      padding: '8px 12px',
      background: '#f8fafc',
      borderTop: '1px solid #e2e8f0'
    }}>
      {(showAll || isViewMode) && (
        <>
          <button
            type="button"
            disabled={isNC}
            onClick={onSave}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px', height: '36px', borderRadius: '6px',
              background: isNC ? '#e2e8f0' : '#991b1b',
              color: isNC ? '#94a3b8' : '#ffffff',
              fontWeight: 800, fontSize: '0.75rem', border: 'none',
              cursor: isNC ? 'not-allowed' : 'pointer', transition: 'all 0.15s'
            }}
            onMouseEnter={e => { if (!isNC) e.currentTarget.style.background = '#7f1d1d'; }}
            onMouseLeave={e => { if (!isNC) e.currentTarget.style.background = '#991b1b'; }}
          >
            <span>Save</span>
            <span style={{ background: isNC ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '1px 6px', fontSize: '10px', color: isNC ? '#94a3b8' : '#ffffff' }}>F5</span>
          </button>

          <button
            type="button"
            disabled={isNC}
            onClick={onBilling}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px', height: '36px', borderRadius: '6px',
              background: isNC ? '#e2e8f0' : '#047857',
              color: isNC ? '#94a3b8' : '#ffffff',
              fontWeight: 800, fontSize: '0.75rem', border: 'none',
              cursor: isNC ? 'not-allowed' : 'pointer', transition: 'all 0.15s'
            }}
            onMouseEnter={e => { if (!isNC) e.currentTarget.style.background = '#065f46'; }}
            onMouseLeave={e => { if (!isNC) e.currentTarget.style.background = '#047857'; }}
          >
            <span>Save & Print</span>
            <span style={{ background: isNC ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '1px 6px', fontSize: '10px', color: isNC ? '#94a3b8' : '#ffffff' }}>F7</span>
          </button>
        </>
      )}

      {(showAll || !isViewMode) && (
        <>
          <button
            type="button"
            onClick={onKOT}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px', height: '36px', borderRadius: '6px', background: '#1e293b', color: '#ffffff',
              fontWeight: 800, fontSize: '0.75rem', border: 'none', cursor: 'pointer', transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#0f172a'}
            onMouseLeave={e => e.currentTarget.style.background = '#1e293b'}
          >
            <span>KOT</span>
            <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '1px 6px', fontSize: '10px' }}>F8</span>
          </button>

          <button
            type="button"
            onClick={onKOTAndPrint}
            style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 12px', height: '36px', borderRadius: '6px', background: '#1e293b', color: '#ffffff',
              fontWeight: 800, fontSize: '0.75rem', border: 'none', cursor: 'pointer', transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#0f172a'}
            onMouseLeave={e => e.currentTarget.style.background = '#1e293b'}
          >
            <span>KOT & Print</span>
            <span style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '4px', padding: '1px 6px', fontSize: '10px' }}>F9</span>
          </button>
        </>
      )}
    </div>
  );
};

export default React.memo(POSActionButtons);
