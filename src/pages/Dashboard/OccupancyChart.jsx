import React, { memo, useState } from 'react';
import { LuTrendingUp } from 'react-icons/lu';

const OccupancyChart = memo(({ data, showToast }) => {
  const [hovered, setHovered] = useState(null);
  const values = data?.occupancy || [65, 70, 68, 75, 88, 92, 78];
  const labels = data?.occupancyLabels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const avg = (values.reduce((s, v) => s + v, 0) / values.length).toFixed(1);

  const W = 520, H = 220, pL = 38, pR = 16, pT = 28, pB = 30;
  const cW = W - pL - pR, cH = H - pT - pB;

  const pts = values.map((v, i) => ({
    x: pL + (i / (values.length - 1)) * cW,
    y: pT + cH - (v / 100) * cH,
    v, label: labels[i],
  }));

  // Create smooth bezier curve path
  const getBezierPath = (points) => {
    if (points.length === 0) return '';
    let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 3;
      const cpY1 = p0.y;
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3;
      const cpY2 = p1.y;
      path += ` C ${cpX1.toFixed(1)} ${cpY1.toFixed(1)}, ${cpX2.toFixed(1)} ${cpY2.toFixed(1)}, ${p1.x.toFixed(1)} ${p1.y.toFixed(1)}`;
    }
    return path;
  };

  const line = getBezierPath(pts);
  const area = pts.length > 0 ? `${line} L ${pts[pts.length - 1].x.toFixed(1)} ${(pT + cH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(pT + cH).toFixed(1)} Z` : '';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Occupancy %</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: 'var(--primary)', background: 'var(--primary-light)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(27, 122, 109, 0.2)' }}>
          <LuTrendingUp size={13} style={{ color: 'var(--primary)' }} /> Avg {avg}%
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
        <defs>
          <linearGradient id="occFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#29b49b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#1b7a6d" stopOpacity="0.01" />
          </linearGradient>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.1" floodColor="#0f172a" />
          </filter>
        </defs>

        {[0, 25, 50, 75, 100].map(g => {
          const gy = pT + cH - (g / 100) * cH;
          return (
            <g key={g}>
              <line x1={pL} y1={gy} x2={W - pR} y2={gy} stroke="#f1f5f9" strokeWidth="1" />
              <text x={pL - 10} y={gy + 3} textAnchor="end" style={{ fontSize: '10px', fill: '#94a3b8', fontWeight: '600', fontFamily: 'var(--font-family)' }}>{g}%</text>
            </g>
          );
        })}

        <path d={area} fill="url(#occFill)" />
        <path d={line} fill="none" stroke="#1b7a6d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {pts.map((p, i) => (
          <g key={i} style={{ cursor: 'pointer' }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => showToast?.(`${p.label}: ${p.v}%`)}
          >
            {hovered === i && (
              <>
                <line x1={p.x} y1={pT} x2={p.x} y2={pT + cH} stroke="#1b7a6d" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                <g filter="url(#shadow)">
                  <rect x={p.x - 26} y={p.y - 32} width="52" height="22" rx="6" fill="#0f172a" />
                  <text x={p.x} y={p.y - 18} textAnchor="middle" style={{ fontSize: '11px', fontWeight: '800', fill: '#fff', fontFamily: 'var(--font-family)' }}>{p.v}%</text>
                </g>
              </>
            )}
            <circle cx={p.x} cy={p.y} r={hovered === i ? 7 : 4.5} fill="#fff" stroke="#1b7a6d" strokeWidth="3" style={{ transition: 'all 150ms' }} />
            <text x={p.x} y={H - 6} textAnchor="middle" style={{ fontSize: '10px', fontWeight: '600', fill: '#64748b', fontFamily: 'var(--font-family)' }}>{p.label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
});

export default OccupancyChart;
