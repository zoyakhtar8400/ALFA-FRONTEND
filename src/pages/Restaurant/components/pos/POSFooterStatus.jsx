import React, { useState, useEffect } from 'react';

const POSFooterStatus = ({ billNo = 'BILL-000123', cashierName = 'Admin', outletName = 'Main Restaurant' }) => {
  const [timeStr, setTimeStr] = useState('');

  // Clock timer effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      position: 'sticky',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      width: '100%',
      boxSizing: 'border-box',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '4px 12px',
      padding: '7px 16px',
      background: 'linear-gradient(90deg, #0d1d25 0%, #112936 100%)',
      color: '#94a3b8',
      fontSize: '0.72rem',
      fontWeight: 700,
      fontFamily: 'var(--font-family)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
      userSelect: 'none',
      minHeight: '30px',
      height: 'auto'
    }}>
      {/* Left info */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
        <span>Bill: <strong style={{ color: '#29b49b', letterSpacing: '0.5px' }}>{billNo}</strong></span>
        <span style={{ opacity: 0.3 }}>|</span>
        <span>Cashier: <strong style={{ color: '#ffffff' }}>{cashierName}</strong></span>
      </div>

      {/* Center info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{
          display: 'inline-block', width: '7px', height: '7px',
          borderRadius: '50%', background: '#29b49b',
          boxShadow: '0 0 6px #29b49b'
        }} />
        <span>Outlet: <strong style={{ color: '#5eead4' }}>{outletName}</strong></span>
      </div>

      {/* Right info */}
      <div>
        <span style={{ color: '#ffffff', letterSpacing: '0.5px' }}>{timeStr}</span>
      </div>
    </div>
  );
};

export default React.memo(POSFooterStatus);
