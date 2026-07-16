import React from 'react';
import ServiceTabs from './ServiceTabs';
import HeaderActions from './HeaderActions';

const POSHeader = ({
  serviceType,
  setServiceType,
  assignedTableNo,
  customerName,
  paxCount,
  hasRemarks,
  onTableClick,
  onCustomerClick,
  onPaxClick,
  onRemarksClick
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      padding: '12px 16px',
      background: '#ffffff',
      borderBottom: '1px solid #cbd5e1'
    }}>
      {/* Title block */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 900, color: '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
          POS Billing Desk
        </h2>
        <span style={{ fontSize: '0.62rem', fontWeight: 800, background: '#ecfeff', color: '#0e7490', padding: '3px 8px', borderRadius: '12px' }}>
          Dine-in / Outlet Mode
        </span>
      </div>

      {/* Segmented Service Selector */}
      <ServiceTabs serviceType={serviceType} setServiceType={setServiceType} />

      {/* Grid Action Icons */}
      <HeaderActions
        assignedTableNo={assignedTableNo}
        customerName={customerName}
        paxCount={paxCount}
        hasRemarks={hasRemarks}
        onTableClick={onTableClick}
        onCustomerClick={onCustomerClick}
        onPaxClick={onPaxClick}
        onRemarksClick={onRemarksClick}
      />
    </div>
  );
};

export default React.memo(POSHeader);
