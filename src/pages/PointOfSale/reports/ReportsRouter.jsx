import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReportsDashboard from './ReportsDashboard';
import GenericReportViewer from './GenericReportViewer';
import { REPORT_CATALOG } from './reportCatalog';

const ReportsRouter = ({ showToast }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;

  // Flatten reports list from the catalog
  const allReports = React.useMemo(() => {
    return REPORT_CATALOG.flatMap(cat => cat.reports);
  }, []);

  // Find corresponding report matching the URL path ending
  const currentReport = React.useMemo(() => {
    return allReports.find(rep => path.endsWith(`/${rep.id}`));
  }, [allReports, path]);

  if (currentReport) {
    return (
      <GenericReportViewer
        report={currentReport}
        onBack={() => navigate('/pos/report')}
        showToast={showToast}
      />
    );
  }

  // Default is Dashboard
  return <ReportsDashboard showToast={showToast} />;
};

export default ReportsRouter;
