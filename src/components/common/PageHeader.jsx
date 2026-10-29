import React from 'react';
import BackButton from './BackButton';
import PrintButton from './PrintButton';

const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  showBack = true,
  showPrint = false,
  onBack,
  onPrint,
  style = {},
  children,
  actions,
}) => {
  return (
    <div
      className="no-print"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        marginBottom: '18px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '12px',
        ...style
      }}
    >
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b' }}>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span style={{ fontWeight: idx === breadcrumbs.length - 1 ? 700 : 500, color: idx === breadcrumbs.length - 1 ? '#0f172a' : 'inherit' }}>
                {crumb}
              </span>
              {idx < breadcrumbs.length - 1 && <span style={{ opacity: 0.5 }}>&gt;</span>}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Title & Actions Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {showBack && <BackButton onClick={onBack} label="Back" />}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px', margin: 0 }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {children}
          {actions}
          {showPrint && <PrintButton onClick={onPrint} label="Print" />}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
