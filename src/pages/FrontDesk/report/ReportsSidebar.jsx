import React from 'react';
import CommonSearch from '../../../components/common/CommonSearch';

const ReportsSidebar = ({ 
  activeCategory, 
  onCategoryChange, 
  searchQuery, 
  onSearchChange, 
  catalog 
}) => {
  return (
    <div className="panel-premium custom-scrollbar" style={{
      width: '320px',
      flexShrink: 0,
      padding: '24px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      height: 'fit-content'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--dark)' }}>
          PMS Reports Hub
        </h4>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
          Hospitality audits, finances and tax filings
        </span>
      </div>

      {/* Search Input inside Left Sidebar */}
      <div style={{ width: '100%' }}>
        <CommonSearch
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search report..."
        />
      </div>

      {/* Vertical Categories List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {catalog.map(cat => {
          const CatIcon = cat.icon;
          const isSelected = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`cat-nav-btn ${isSelected ? 'active' : ''}`}
              style={{
                background: isSelected ? cat.gradient : 'transparent',
                border: isSelected ? 'none' : '1px solid transparent',
                boxShadow: isSelected ? `0 8px 18px ${cat.color}25` : 'none'
              }}
            >
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: isSelected ? 'rgba(255,255,255,0.2)' : cat.bgLight,
                color: isSelected ? '#ffffff' : cat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CatIcon size={13} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1, minWidth: 0 }}>
                <span style={{ 
                  fontSize: '0.8rem', 
                  fontWeight: 800, 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis',
                  color: isSelected ? '#ffffff' : 'var(--text-primary)'
                }}>
                  {cat.title}
                </span>
                <span style={{ 
                  fontSize: '0.62rem', 
                  color: isSelected ? 'rgba(255,255,255,0.7)' : 'var(--text-secondary)', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis' 
                }}>
                  {cat.subtitle}
                </span>
              </div>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                background: isSelected ? 'rgba(255,255,255,0.25)' : 'var(--background)',
                color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                padding: '2px 8px',
                borderRadius: '10px'
              }}>
                {cat.reports.length}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ReportsSidebar;
