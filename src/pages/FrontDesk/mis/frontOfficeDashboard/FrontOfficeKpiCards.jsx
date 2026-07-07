import React from 'react';
import { FaUserFriends, FaSignInAlt, FaSignOutAlt, FaExclamationTriangle, FaMoneyBillWave } from 'react-icons/fa';

const FrontOfficeKpiCards = ({ metrics = {} }) => {
  const kpis = [
    { label: 'In House Guests', value: metrics.inHouse || '84 Guests', icon: FaUserFriends, color: '#418a8b', bg: 'rgba(65, 138, 139, 0.1)' },
    { label: 'Today Arrivals', value: metrics.arrivals || '18 Rooms', icon: FaSignInAlt, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
    { label: 'Today Departures', value: metrics.departures || '12 Rooms', icon: FaSignOutAlt, color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
    { label: 'Pending Bills', value: metrics.pendingBills || '₹45,200', icon: FaExclamationTriangle, color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)' },
    { label: 'Daily Revenue', value: metrics.revenue || '₹1,42,500', icon: FaMoneyBillWave, color: '#6366F1', bg: 'rgba(99, 102, 241, 0.1)' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', width: '100%' }}>
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <div
            key={index}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-sm)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                {kpi.label}
              </span>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: kpi.color, letterSpacing: '-0.5px' }}>
                {kpi.value}
              </span>
            </div>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: kpi.bg,
                color: kpi.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0,
              }}
            >
              <Icon />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FrontOfficeKpiCards;
