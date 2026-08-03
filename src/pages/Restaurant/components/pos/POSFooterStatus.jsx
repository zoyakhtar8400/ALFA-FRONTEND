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
      padding: '6px 12px',
      background: 'linear-gradient(90deg, #A16207, #CA8A04)',
      color: '#ffffff',
      fontSize: '0.68rem',
      fontWeight: 700,
      fontFamily: 'monospace',
      borderTop: '1px solid #a16207',
      userSelect: 'none',
      minHeight: '28px',
      height: 'auto'
    }}>
      {/* Left info */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <span>Bill: {billNo}</span>
        <span style={{ opacity: 0.8 }}>|</span>
        <span>Cashier: {cashierName}</span>
      </div>

      {/* Center info */}
      <div>
        <span>Outlet: {outletName}</span>
      </div>

      {/* Right info */}
      <div>
        <span>{timeStr}</span>
      </div>
    </div>
  );
};

export default React.memo(POSFooterStatus);
