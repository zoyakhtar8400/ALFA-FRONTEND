import React from 'react';
import { FaHotel, FaSignInAlt, FaBroom, FaSignOutAlt, FaCalendarAlt, FaClock, FaCreditCard } from 'react-icons/fa';

const FrontOfficeTabs = ({ activeTab, onSelectTab, counts = {} }) => {
  const tabs = [
    { id: 'Current Occupancy', label: 'Current Occupancy', color: '#10B981', icon: FaHotel },
    { id: 'Arrivals', label: 'Arrivals', color: '#8B5CF6', icon: FaSignInAlt },
    { id: 'Room Status', label: 'Room Status', color: '#3B82F6', icon: FaBroom },
    { id: 'Departures', label: 'Departures', color: '#F59E0B', icon: FaSignOutAlt },
    { id: 'Expected Arrivals', label: 'Expected Arrivals', color: '#6366F1', icon: FaCalendarAlt },
    { id: 'Expected Departures', label: 'Expected Departures', color: '#EC4899', icon: FaClock },
    { id: 'Pending Bills', label: 'Pending Bills', color: '#EF4444', icon: FaCreditCard },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        overflowX: 'auto',
        padding: '6px 4px 10px 4px',
        scrollbarWidth: 'none',
      }}
      className="no-scrollbar"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts[tab.id] ?? 0;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '24px',
              border: isActive ? `1.5px solid ${tab.color}` : '1.5px solid var(--border)',
              background: isActive ? `${tab.color}15` : 'var(--surface)',
              color: isActive ? tab.color : 'var(--text-secondary)',
              fontWeight: isActive ? 800 : 600,
              fontSize: '0.84rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: isActive ? `0 2px 8px ${tab.color}25` : 'var(--shadow-sm)',
              transition: 'all 0.2s ease',
            }}
          >
            <Icon size={13} style={{ color: isActive ? tab.color : 'var(--text-secondary)' }} />
            {tab.label}
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '12px',
                background: isActive ? tab.color : 'var(--border)',
                color: isActive ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s ease',
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default FrontOfficeTabs;
