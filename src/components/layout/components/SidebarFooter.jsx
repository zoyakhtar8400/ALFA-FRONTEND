import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';

const SidebarFooter = ({ onLogoutClick, isCollapsed }) => {
  return (
    <div className="sidebar-footer" style={{ borderTop: '1px solid #e2e8f0', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', background: '#f8fafc' }}>
      {!isCollapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>System Admin</span>
          <span style={{ fontSize: '0.68rem', color: '#64748b', fontWeight: 600 }}>Active Session</span>
        </div>
      )}
      <button
        onClick={onLogoutClick}
        title="Logout Session"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#ef4444',
          display: 'flex',
          padding: '6px',
          borderRadius: '4px',
          transition: 'background 0.2s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        <FaSignOutAlt size={14} />
      </button>
    </div>
  );
};

export default React.memo(SidebarFooter);
