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
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '4px 16px',
      background: 'linear-gradient(90deg, #A16207, #CA8A04)',
      color: '#ffffff',
      fontSize: '0.68rem',
      fontWeight: 700,
      fontFamily: 'monospace',
      borderTop: '1px solid #a16207',
      userSelect: 'none',
      height: '24px'
    }}>
      {/* Left info */}
      <div style={{ display: 'flex', gap: '10px' }}>
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
