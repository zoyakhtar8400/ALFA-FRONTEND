import React from 'react';

const BillingLayout = ({ showMenu = true, children }) => {
  if (!showMenu) {
    return (
      <div
        className="pos-billing-layout-full"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          width: '100%',
          height: '100%',
          background: '#f8fafc',
          overflow: 'hidden'
        }}
      >
        <div style={{ flex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className="pos-billing-layout-split"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        background: '#f8fafc',
        overflow: 'hidden'
      }}
    >
      <style>{`
        @media (min-width: 1024px) {
          .pos-menu-section {
            flex: 0 0 70% !important;
            max-width: 70% !important;
          }
          .pos-billing-section {
            flex: 0 0 30% !important;
            max-width: 30% !important;
          }
        }
        @media (min-width: 768px) and (max-width: 1023px) {
          .pos-menu-section {
            flex: 0 0 60% !important;
            max-width: 60% !important;
          }
          .pos-billing-section {
            flex: 0 0 40% !important;
            max-width: 40% !important;
          }
        }
        @media (max-width: 767px) {
          .pos-billing-layout-split {
            flex-direction: column !important;
            overflow-y: auto !important;
          }
          .pos-menu-section {
            width: 100% !important;
            flex: none !important;
          }
          .pos-billing-section {
            width: 100% !important;
            flex: none !important;
          }
        }
      `}</style>
      {children}
    </div>
  );
};

export default BillingLayout;
