import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import EmptyState from '../../../components/common/EmptyState';

const CategoryOverview = ({ 
  categoryInfo, 
  filteredReports, 
  onSelectReport 
}) => {
  return (
    <div className="reports-layout" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      
      {/* Category Overview Card */}
      <div className="category-banner slide-up-item">
        {/* Colored side indicator */}
        <div style={{ position: 'absolute', left: 0, top: 0, width: '6px', height: '100%', background: categoryInfo.gradient }} />
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 1 }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: categoryInfo.color, letterSpacing: '1px' }}>
            Category Directory
          </span>
          <h3 style={{ margin: 0, fontSize: '1.45rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.3px' }}>
            {categoryInfo.title}
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
            {categoryInfo.subtitle}. Select any report below to launch the live PMS data builder.
          </span>
        </div>
        
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '18px',
          background: 'rgba(255, 255, 255, 0.06)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          flexShrink: 0,
          zIndex: 1,
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          {React.createElement(categoryInfo.icon)}
        </div>
      </div>

      {/* Reports List Grid */}
      {filteredReports.length === 0 ? (
        <EmptyState message="No matching reports found in this category" />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
          gap: '20px',
          width: '100%'
        }}>
          {filteredReports.map((rep, idx) => (
            <div
              key={rep.id}
              onClick={() => onSelectReport(rep)}
              className={`report-card-premium slide-up-item delay-${(idx % 5) + 1}`}
              style={{
                '--primary': categoryInfo.color
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.1px' }}>
                  {rep.name}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {rep.desc}
                </span>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '0.72rem', 
                fontWeight: 800, 
                color: categoryInfo.color, 
                marginTop: '12px',
                width: 'fit-content'
              }}>
                Open Report <FaArrowRight size={8} style={{ transition: 'transform 0.2s' }} />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default CategoryOverview;
