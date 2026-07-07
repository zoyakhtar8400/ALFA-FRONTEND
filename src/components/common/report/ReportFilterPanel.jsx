import React from 'react';

const ReportFilterPanel = ({ children }) => {
  return (
    <div className="panel-premium slide-up-item delay-1" style={{
      width: '100%',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        width: '100%'
      }}>
        {children}
      </div>
    </div>
  );
};

export default ReportFilterPanel;
