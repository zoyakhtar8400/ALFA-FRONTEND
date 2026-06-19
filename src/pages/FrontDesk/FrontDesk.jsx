import React from 'react';
import { useLocation } from 'react-router-dom';
import MasterPage from './master/MasterPage';

const FrontDesk = ({ showToast }) => {
  const location = useLocation();
  const path = location.pathname;

  const getRouteInfo = () => {
    const parts = path.split('/').filter(Boolean);
    if (parts.length === 2) {
      return { section: parts[1].toUpperCase(), item: null };
    } else if (parts.length === 3) {
      return {
        section: parts[1].toUpperCase(),
        item: parts[2].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      };
    }
    return { section: 'OVERVIEW', item: null };
  };

  const { section, item } = getRouteInfo();

  const renderContent = () => {
    if (section === 'MASTER' && item) {
      return <MasterPage masterName={item} showToast={showToast} />;
    }

    if (section === 'OPERATION' && item) {
      return (
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">{item}</h3>
          </div>
          <p className="text-secondary">Operation form for {item} coming soon.</p>
        </div>
      );
    }

    if (section === 'MIS' && item) {
      return (
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">{item}</h3>
          </div>
          <p className="text-secondary">MIS report for {item} coming soon.</p>
        </div>
      );
    }

    if (section === 'REPORT') {
      return (
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3 className="panel-title">Reports</h3>
          </div>
          <p className="text-secondary">Reports section coming soon.</p>
        </div>
      );
    }

    return (
      <div className="dashboard-panel">
        <div className="panel-header">
          <h3 className="panel-title">Front Desk Operations</h3>
        </div>
        <p className="text-secondary">Please select a category from the sidebar.</p>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '600', marginBottom: '24px' }}>
        <span>Front Desk</span>
        <span>&rsaquo;</span>
        <span style={{ color: 'var(--primary)' }}>{section}</span>
        {item && (
          <>
            <span>&rsaquo;</span>
            <span style={{ color: 'var(--dark)', fontWeight: '700' }}>{item}</span>
          </>
        )}
      </div>
      {renderContent()}
    </div>
  );
};

export default FrontDesk;
