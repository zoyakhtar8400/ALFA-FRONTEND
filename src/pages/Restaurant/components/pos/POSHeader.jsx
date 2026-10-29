import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaUtensils, FaTruck, FaShoppingBag, FaConciergeBell } from 'react-icons/fa';
import ServiceTabs from './ServiceTabs';
import HeaderActions from './HeaderActions';

const getServiceIcon = (type) => {
  if (type === 'Delivery') return <FaTruck size={11} style={{ marginRight: '4px' }} />;
  if (type === 'Takeaway') return <FaShoppingBag size={11} style={{ marginRight: '4px' }} />;
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
  onRemarksClick,
  onKOTHistoryClick
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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
          padding: isCollapsed ? '8px 14px' : '8px 14px 6px 14px',
          cursor: 'pointer',
          userSelect: 'none',
          background: isCollapsed ? '#f8fafc' : '#ffffff',
          transition: 'all 0.15s ease',
          gap: '8px'
        }}
        title="Click to collapse / expand Service Type & Header actions"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flexShrink: 1 }}>
          <h2 style={{
            fontSize: '0.88rem',
            fontWeight: 900,
            color: isBillingDesk ? '#047857' : '#0f172a',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '-0.3px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {isBillingDesk ? 'Restaurant Billing Desk' : 'POS Billing Desk'}
          </h2>
        </div>

        {/* Right side: KOT History button, Active Service indicator & Collapse toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {onKOTHistoryClick && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onKOTHistoryClick();
              }}
              title="View KOT History for this order / table"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.72rem',
                fontWeight: 800,
                background: '#f0fdfa',
                color: '#0e7490',
                border: '1px solid #a5f3fc',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#0e7490';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#f0fdfa';
                e.currentTarget.style.color = '#0e7490';
              }}
            >
              <FaConciergeBell size={11} />
              KOT History
            </button>
          )}

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              fontSize: '0.72rem',
              fontWeight: 800,
              background: '#1b7a6d',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(27, 122, 109, 0.25)',
              whiteSpace: 'nowrap'
            }}
          >
            {getServiceIcon(serviceType)}
            {serviceType}
            {assignedTableNo ? ` · ${assignedTableNo}` : ''}
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
              padding: '4px 9px',
              borderRadius: '6px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
            title={isCollapsed ? "Expand billing options" : "Collapse billing options"}
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
            {isCollapsed ? <FaChevronDown size={10} /> : <FaChevronUp size={10} />}
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
            serviceType={serviceType}
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
