import React from 'react';
import NightAuditDashboard from './NightAuditDashboard';
import PageHeader from '../../../../components/common/PageHeader';

export const NightAudit = ({ showToast }) => {
  return (
    <div>
      <PageHeader
        title="Night Audit Entry"
        breadcrumbs={['Dashboard', 'Front Desk', 'Operation', 'Night Audit Entry']}
      />
      <NightAuditDashboard showToast={showToast} isModal={false} />
    </div>
  );
};

export default NightAudit;
