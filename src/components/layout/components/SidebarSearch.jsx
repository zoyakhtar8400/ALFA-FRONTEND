import React from 'react';
import { FaSearch } from 'react-icons/fa';

const SidebarSearch = ({ value, onChange, isCollapsed }) => {
  if (isCollapsed) return null;

  return (
    <div className="sidebar-search-container" style={{ padding: '0 16px 12px 16px', position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <FaSearch style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '12px' }} />
        <input
          type="text"
          placeholder="Search menu..."
          value={value}
          onChange={e => onChange(e.target.value)}
          className="sidebar-search-input"
          style={{
            width: '100%',
            height: '34px',
            paddingLeft: '30px',
            paddingRight: '12px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            fontSize: '0.8rem',
            outline: 'none',
            background: '#f8fafc',
            fontWeight: 600,
            color: '#1e293b'
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(SidebarSearch);
