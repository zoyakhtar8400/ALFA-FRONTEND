import React from 'react';
import { useLocation } from 'react-router-dom';
import MasterPage from './master/MasterPage';
import OperationPage from './operation/OperationPage';
import MisPage from './mis/MisPage';
import ReportsDashboard from './report/ReportsDashboard';
import PageHeader from '../../components/common/PageHeader';

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
      return <OperationPage operationName={item} showToast={showToast} />;
    }

    if (section === 'MIS' && item) {
      return <MisPage misName={item} showToast={showToast} />;
    }

    if (section === 'REPORT') {
      return (
        <div>
          <PageHeader
            title="Front Desk Report Hub"
            breadcrumbs={['Dashboard', 'Front Desk', 'Reports']}
          />
          <ReportsDashboard />
        </div>
      );
    }

    return (
      <div>
        <PageHeader
          title="Front Desk Operations"
          breadcrumbs={['Dashboard', 'Front Desk']}
        />
        <div className="dashboard-panel">
          <p className="text-secondary">Please select a category from the sidebar.</p>
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
};

export default FrontDesk;
