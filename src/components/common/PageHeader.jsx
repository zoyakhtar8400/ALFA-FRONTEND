import React from 'react';
import BackButton from './BackButton';
import PrintButton from './PrintButton';

const PageHeader = ({
  title,
  breadcrumbs = [],
  showBack = false,
  showPrint = false,
  onBack,
  onPrint,
  style = {},
}) => {
  return (
    <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '16px', ...style }}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span style={{ fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400, color: idx === breadcrumbs.length - 1 ? 'var(--dark)' : 'inherit' }}>
                {crumb}
              </span>
              {idx < breadcrumbs.length - 1 && <span style={{ opacity: 0.5 }}>&gt;</span>}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Title & Actions Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--dark)', letterSpacing: '-0.5px' }}>
          {title}
        </h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {showBack && <BackButton onClick={onBack} label="Back" />}
          {showPrint && <PrintButton onClick={onPrint} label="Print" />}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
