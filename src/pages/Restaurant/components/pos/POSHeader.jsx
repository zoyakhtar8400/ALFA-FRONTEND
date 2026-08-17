import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaUtensils, FaTruck, FaShoppingBag } from 'react-icons/fa';
import ServiceTabs from './ServiceTabs';
import HeaderActions from './HeaderActions';

const getServiceIcon = (type) => {
  if (type === 'Delivery') return <FaTruck size={11} style={{ marginRight: '4px' }} />;
  if (type === 'Pickup') return <FaShoppingBag size={11} style={{ marginRight: '4px' }} />;
  return <FaUtensils size={11} style={{ marginRight: '4px' }} />;
};

const POSHeader = ({
  isBillingDesk = false,
  serviceType = 'Dine In',
  setServiceType,
  assignedTableNo,
  customerName,
  mobileNumber,
  paxCount,
  hasRemarks,
  waiter,
  onWaiterChange,
  deliveryBoy,
  onDeliveryBoyChange,
  ncType,
  onNcTypeChange,
  isPaid,
  onTableClick,
  onCustomerClick,
  onPaxClick,
  onRemarksClick
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
      borderBottom: '1px solid #cbd5e1',
      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
      transition: 'all 0.2s ease-in-out'
    }}>
      {/* Top Header Bar with Title & Collapse / Expand Toggle */}
      <div
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: isCollapsed ? '8px 16px' : '10px 16px 6px 16px',
          cursor: 'pointer',
          userSelect: 'none',
          background: isCollapsed ? '#f8fafc' : '#ffffff',
          transition: 'all 0.15s ease'
        }}
        title="Click to collapse / expand Service Type & Header actions"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{
            fontSize: '0.95rem',
            fontWeight: 900,
            color: isBillingDesk ? '#047857' : '#0f172a',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '-0.3px'
          }}>
            {isBillingDesk ? 'Restaurant Billing Desk' : 'POS Billing Desk'}
          </h2>
          <span style={{
            fontSize: '0.62rem',
            fontWeight: 800,
            background: isBillingDesk ? '#ecfdf5' : '#ecfeff',
            color: isBillingDesk ? '#047857' : '#0e7490',
            padding: '2px 8px',
            borderRadius: '12px',
            border: isBillingDesk ? '1px solid #a7f3d0' : '1px solid #a5f3fc'
          }}>
            {isBillingDesk ? 'Cashier' : 'Dine-in / POS'}
          </span>
        </div>

        {/* Right side: Active Service indicator & Collapse toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '0.72rem',
            fontWeight: 800,
            background: '#0e7490',
            color: '#ffffff',
            padding: '3px 10px',
            borderRadius: '6px',
            boxShadow: '0 1px 2px rgba(14, 116, 144, 0.2)'
          }}>
            {getServiceIcon(serviceType)}
            {serviceType}
            {assignedTableNo ? ` · T${String(assignedTableNo).replace(/[^0-9]/g, '').padStart(2, '0')}` : ''}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsCollapsed(!isCollapsed);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid #cbd5e1',
              background: isCollapsed ? '#ffffff' : '#f1f5f9',
              color: '#475569',
              padding: '3px 8px',
              borderRadius: '6px',
              fontSize: '0.68rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {isCollapsed ? (
              <>
                <span>Expand</span>
                <FaChevronDown size={9} />
              </>
            ) : (
              <>
                <span>Collapse</span>
                <FaChevronUp size={9} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Content: Dine In / Delivery / Pickup Tabs + Header Actions */}
      {!isCollapsed && (
        <div style={{
          padding: '0 16px 10px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          animation: 'fadeIn 0.15s ease-in-out'
        }}>
          {/* Dine In / Delivery / Pickup Service Selector Tabs */}
          <ServiceTabs serviceType={serviceType} setServiceType={setServiceType} />

          {/* Table, Customer, PAX, Remarks, Waiter, Delivery, NC Type Actions */}
          <HeaderActions
            assignedTableNo={assignedTableNo}
            customerName={customerName}
            mobileNumber={mobileNumber}
            paxCount={paxCount}
            hasRemarks={hasRemarks}
            waiter={waiter}
            onWaiterChange={onWaiterChange}
            deliveryBoy={deliveryBoy}
            onDeliveryBoyChange={onDeliveryBoyChange}
            ncType={ncType}
            onNcTypeChange={onNcTypeChange}
            isPaid={isPaid}
            onTableClick={onTableClick}
            onCustomerClick={onCustomerClick}
            onPaxClick={onPaxClick}
            onRemarksClick={onRemarksClick}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(POSHeader);
