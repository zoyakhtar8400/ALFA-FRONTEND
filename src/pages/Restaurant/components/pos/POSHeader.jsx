import React from 'react';
import ServiceTabs from './ServiceTabs';
import HeaderActions from './HeaderActions';

const POSHeader = ({
  isBillingDesk = false,
  serviceType,
  setServiceType,
  assignedTableNo,
  customerName,
  mobileNumber,
  paxCount,
  hasRemarks,
  waiter,
  onWaiterChange,
  isPaid,
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 900, color: isBillingDesk ? '#047857' : '#0f172a', margin: 0, textTransform: 'uppercase', letterSpacing: '-0.3px' }}>
          {isBillingDesk ? 'Restaurant Billing Desk' : 'POS Billing Desk'}
        </h2>
        <span style={{
          fontSize: '0.62rem', fontWeight: 800,
          background: isBillingDesk ? '#ecfdf5' : '#ecfeff',
          color: isBillingDesk ? '#047857' : '#0e7490',
          padding: '3px 8px', borderRadius: '12px',
          border: isBillingDesk ? '1px solid #a7f3d0' : '1px solid #a5f3fc'
        }}>
          {isBillingDesk ? 'Cashier & Settlement' : 'Dine-in / Outlet Mode'}
        </span>
      </div>

      <ServiceTabs serviceType={serviceType} setServiceType={setServiceType} />

      <HeaderActions
        assignedTableNo={assignedTableNo}
        customerName={customerName}
        mobileNumber={mobileNumber}
        paxCount={paxCount}
        hasRemarks={hasRemarks}
        waiter={waiter}
        onWaiterChange={onWaiterChange}
        isPaid={isPaid}
        onTableClick={onTableClick}
        onCustomerClick={onCustomerClick}
        onPaxClick={onPaxClick}
        onRemarksClick={onRemarksClick}
      />
    </div>
  );
};

export default React.memo(POSHeader);
