import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import GrowthLossDashboard from './GrowthLossDashboard';
import ReportsDashboard from './ReportsDashboard';
import GenericReportViewer from './GenericReportViewer';
import { REPORT_CATALOG } from './reportCatalog';

class ReportErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Report render error caught:', error?.message || 'Unknown error');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', background: '#fff', borderRadius: '12px', margin: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '0.75rem' }}>Unable to load this report view</h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
            {this.state.error?.message || 'An unexpected rendering error occurred while preparing this dashboard.'}
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{ padding: '0.6rem 1.2rem', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              Retry
            </button>
            <button
              onClick={() => { window.location.href = '/pos/report/catalog'; }}
              style={{ padding: '0.6rem 1.2rem', background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
            >
              Back to Catalog
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ReportsRouter = ({ showToast }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Flatten reports list from the catalog
  const allReports = React.useMemo(() => {
    return REPORT_CATALOG.flatMap(cat => cat.reports);
  }, []);

  // Check if viewing catalog
  const isCatalog = path.endsWith('/catalog') || path.endsWith('/all') || path.endsWith('/list');

  // Find corresponding report matching the URL path ending
  const currentReport = React.useMemo(() => {
    if (isCatalog) return null;
    return allReports.find(rep => path.endsWith(`/${rep.id}`));
  }, [allReports, path, isCatalog]);

  return (
    <ReportErrorBoundary key={path}>
      {currentReport ? (
        <GenericReportViewer
          report={currentReport}
          onBack={() => navigate('/pos/report/catalog')}
          showToast={showToast}
        />
      ) : isCatalog ? (
        <ReportsDashboard showToast={showToast} />
      ) : (
        <GrowthLossDashboard showToast={showToast} />
      )}
    </ReportErrorBoundary>
  );
};

export default ReportsRouter;


