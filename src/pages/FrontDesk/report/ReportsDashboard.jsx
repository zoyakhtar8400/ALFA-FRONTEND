import React, { useState, useMemo } from 'react';
import { REPORT_CATALOG } from './reportCatalog';
import ReportPlayground from './ReportPlayground';
import CommonSearch from '../../../components/common/CommonSearch';
import PageHeader from '../../../components/common/PageHeader';
import { FaArrowRight, FaChartBar } from 'react-icons/fa';
import './reports.css';

const ReportsDashboard = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Report compilation filters
  const [startDate, setStartDate] = useState('2026-06-25');
  const [endDate, setEndDate] = useState('2026-07-02');
  const [roomCategoryFilter, setRoomCategoryFilter] = useState('All');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTablePreview, setShowTablePreview] = useState(true);

  // Filter reports across ALL categories based on search query
  const filteredCatalog = useMemo(() => {
    if (!searchQuery.trim()) return REPORT_CATALOG;
    const q = searchQuery.toLowerCase();
    return REPORT_CATALOG.map(cat => ({
      ...cat,
      reports: cat.reports.filter(rep =>
        rep.name.toLowerCase().includes(q) ||
        rep.desc.toLowerCase().includes(q)
      )
    })).filter(cat => cat.reports.length > 0);
  }, [searchQuery]);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    if (window.showToast) window.showToast('Compiling hotel ledger data...');
    setTimeout(() => {
      setIsGenerating(false);
      setShowTablePreview(true);
      if (window.showToast) window.showToast('Report compiled successfully.');
    }, 600);
  };

  const handleSelectReport = (rep, cat) => {
    setSelectedReport({
      ...rep,
      category: cat.title,
      color: cat.color,
      gradient: cat.gradient,
      bgLight: cat.bgLight
    });
  };

  // Total report count
  const totalReports = REPORT_CATALOG.reduce((sum, cat) => sum + cat.reports.length, 0);

  if (selectedReport) {
    return (
      <ReportPlayground
        selectedReport={selectedReport}
        onBack={() => setSelectedReport(null)}
      />
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', fontFamily: 'var(--font-family)' }}>

      {/* Page Header */}
      {/* <PageHeader
        title="Reports"
        subtitle={`${totalReports} reports across ${REPORT_CATALOG.length} categories`}
        icon={<FaChartBar />}
      /> */}

      {/* Search Bar */}
      {/* <div style={{
        background: '#ffffff',
        border: '1px solid rgba(226,232,240,0.8)',
        borderRadius: '16px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: '0 2px 12px -4px rgba(36,78,95,0.06)'
      }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {REPORT_CATALOG.map(cat => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: cat.bgLight,
                  border: `1px solid ${cat.color}25`,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: cat.color
                }}
              >
                <Icon size={10} />
                <span>{cat.title}</span>
                <span style={{
                  background: cat.color,
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '1px 6px',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  marginLeft: '2px'
                }}>{cat.reports.length}</span>
              </div>
            );
          })}
        </div>
      <div style={{ width: '1000px', flexShrink: 0 }}>
          <CommonSearch
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search all reports..."
          />
        </div>
      </div> */}

      {/* Multi-Column Report Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${filteredCatalog.length}, 1fr)`,
        gap: '16px',
        width: '100%',
        alignItems: 'start',
        overflowX: 'auto',
        minWidth: 0
      }}>
        {filteredCatalog.map((cat, catIdx) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              className={`slide-up-item delay-${catIdx + 1}`}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '180px' }}
            >
              {/* Category Column Header */}
              <div style={{
                background: cat.gradient,
                borderRadius: '14px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                boxShadow: `0 8px 24px -8px ${cat.color}50`,
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Glow sphere */}
                <div style={{
                  position: 'absolute',
                  right: '-20px',
                  top: '-20px',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  pointerEvents: 'none'
                }} />
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={13} color="#ffffff" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {cat.title}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600, marginTop: '2px' }}>
                    {cat.reports.length} reports
                  </div>
                </div>
              </div>

              {/* Report Cards in Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cat.reports.map((rep, repIdx) => (
                  <ReportListCard
                    key={rep.id}
                    rep={rep}
                    cat={cat}
                    delay={repIdx}
                    onSelect={() => handleSelectReport(rep, cat)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredCatalog.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 40px',
          background: '#fff',
          borderRadius: '20px',
          border: '1px solid rgba(226,232,240,0.8)',
          color: 'var(--text-secondary)',
          fontSize: '0.85rem'
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
          <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--dark)' }}>No reports found</strong>
          No reports match your search query. Try a different keyword.
        </div>
      )}

    </div>
  );
};

// ─── Individual Report Card ───────────────────────────────────────────────────
const ReportListCard = ({ rep, cat, delay, onSelect }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`slide-up-item delay-${delay + 1}`}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#F8FAFC' : '#ffffff',
        border: `1px solid ${hovered ? cat.color + '40' : 'rgba(226,232,240,0.8)'}`,
        borderRadius: '12px',
        padding: '13px 14px',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: hovered ? `0 8px 20px -8px ${cat.color}30` : '0 1px 4px rgba(36,78,95,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'none',
        borderLeft: `3px solid ${hovered ? cat.color : 'transparent'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}
    >
      <span style={{
        fontSize: '0.78rem',
        fontWeight: 800,
        color: hovered ? cat.color : 'var(--text-primary)',
        lineHeight: 1.3,
        transition: 'color 0.2s'
      }}>
        {rep.name}
      </span>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '0.68rem',
        fontWeight: 700,
        color: cat.color,
        opacity: hovered ? 1 : 0.7,
        transition: 'opacity 0.2s'
      }}>
        View Details
        <FaArrowRight
          size={8}
          style={{
            transform: hovered ? 'translateX(3px)' : 'none',
            transition: 'transform 0.2s'
          }}
        />
      </div>
    </div>
  );
};

export default ReportsDashboard;
